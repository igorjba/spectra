"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Mic, Play, Square, Waves } from "lucide-react";

import { useTheme } from "@/components/theme/theme-provider";
import { cn } from "@/lib/utils";

/*
  Audio-reactive.

  Rather than shipping an audio file or demanding a microphone before anything
  can happen, the sound is synthesised here: a detuned pad through a swept
  filter, a low pulse on a scheduler, and filtered noise bursts for air. That
  signal feeds an AnalyserNode, and its FFT drives the visual — so the piece
  demonstrates Web Audio twice, as a source and as analysis, and works for
  everyone. The microphone is offered as a second source, never a requirement.

  Browsers refuse to start audio without a gesture, so nothing is created until
  the visitor presses play.
*/

const FFT_SIZE = 2048;
const BARS = 84;
// Bin window worth drawing: below ~45 Hz and above ~9 kHz there's nothing here.
const MIN_BIN = 2;
const MAX_BIN = 420;

type Source = "synth" | "mic";

type Graph = {
  ctx: AudioContext;
  analyser: AnalyserNode;
  master: GainNode;
  stopSynth: (() => void) | null;
  stream: MediaStream | null;
};

/** A calm generative bed with movement across the whole spectrum. */
function startSynth(ctx: AudioContext, destination: AudioNode) {
  const bus = ctx.createGain();
  bus.gain.value = 0.0001;
  bus.connect(destination);
  // Ease in so nothing ever slams on.
  bus.gain.exponentialRampToValueAtTime(0.9, ctx.currentTime + 1.2);

  // Open enough to let harmonics through — a tight lowpass would leave the
  // mid and treble bands with nothing to show.
  const filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = 1800;
  filter.Q.value = 3;
  filter.connect(bus);

  // Two octaves of a minor-ish chord: low end for the pulse to sit under,
  // upper voices so the spectrum has content across its width.
  const notes = [110, 164.81, 220, 277.18, 440, 659.25];
  const oscillators = notes.map((freq, i) => {
    const osc = ctx.createOscillator();
    osc.type = i % 2 === 0 ? "sine" : "triangle";
    osc.frequency.value = freq;
    osc.detune.value = (i - 2.5) * 7;
    const gain = ctx.createGain();
    gain.gain.value = (i === 0 ? 0.36 : 0.15 / (1 + i * 0.5)) / 2;
    osc.connect(gain).connect(filter);
    osc.start();
    return osc;
  });

  // Slow sweep keeps the mid band alive.
  const lfo = ctx.createOscillator();
  lfo.frequency.value = 0.07;
  const lfoDepth = ctx.createGain();
  lfoDepth.gain.value = 900;
  lfo.connect(lfoDepth).connect(filter.frequency);
  lfo.start();

  const pulse = () => {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(96, now);
    osc.frequency.exponentialRampToValueAtTime(42, now + 0.22);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.5, now + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.38);
    osc.connect(gain).connect(bus);
    osc.start(now);
    osc.stop(now + 0.42);
  };

  const shimmer = () => {
    const duration = 0.3;
    const buffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * duration), ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / data.length) ** 2;
    }
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    const hp = ctx.createBiquadFilter();
    hp.type = "highpass";
    hp.frequency.value = 3800;
    const gain = ctx.createGain();
    gain.gain.value = 0.22;
    src.connect(hp).connect(gain).connect(bus);
    src.start();
  };

  pulse();
  shimmer();
  const pulseTimer = window.setInterval(pulse, 720);
  const shimmerTimer = window.setInterval(() => {
    if (Math.random() > 0.25) shimmer();
  }, 620);

  return () => {
    window.clearInterval(pulseTimer);
    window.clearInterval(shimmerTimer);
    try {
      bus.gain.cancelScheduledValues(ctx.currentTime);
      bus.gain.setValueAtTime(bus.gain.value, ctx.currentTime);
      bus.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.2);
    } catch {
      // Context may already be closing.
    }
    oscillators.forEach((o) => {
      try {
        o.stop();
      } catch {
        // Already stopped.
      }
    });
    try {
      lfo.stop();
    } catch {
      // Already stopped.
    }
  };
}

export function AudioReactive({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const graphRef = useRef<Graph | null>(null);
  const rafRef = useRef(0);
  const readoutRef = useRef<HTMLSpanElement>(null);
  const { theme } = useTheme();
  const themeRef = useRef(theme);

  const [running, setRunning] = useState(false);
  const [source, setSource] = useState<Source>("synth");
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    themeRef.current = theme;
  }, [theme]);

  /** Tears down everything: timers, nodes, microphone tracks, context. */
  const teardown = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    const graph = graphRef.current;
    graphRef.current = null;
    if (!graph) return;
    graph.stopSynth?.();
    // Releasing the microphone matters — never leave the indicator on.
    graph.stream?.getTracks().forEach((track) => track.stop());
    setTimeout(() => {
      void graph.ctx.close().catch(() => {});
    }, 260);
  }, []);

  useEffect(() => teardown, [teardown]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const graph = graphRef.current;
    if (!canvas || !graph) return;
    const ctx2d = canvas.getContext("2d");
    if (!ctx2d) return;

    const { analyser } = graph;
    const bins = new Uint8Array(analyser.frequencyBinCount);
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const render = () => {
      const rect = canvas.getBoundingClientRect();
      const w = Math.max(1, Math.round(rect.width));
      const h = Math.max(1, Math.round(rect.height));
      if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
        canvas.width = w * dpr;
        canvas.height = h * dpr;
      }
      ctx2d.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx2d.clearRect(0, 0, w, h);

      analyser.getByteFrequencyData(bins);

      const cx = w / 2;
      const cy = h / 2;
      const base = Math.min(w, h) * 0.17;
      const reach = Math.min(w, h) * 0.3;

      let bass = 0;
      let mid = 0;
      let treble = 0;

      ctx2d.lineCap = "round";
      for (let i = 0; i < BARS; i++) {
        // Logarithmic mapping. Musical energy is bunched into the first few
        // bins, so stepping through them geometrically is what gives the low
        // end room to breathe instead of collapsing it into one spike.
        const t = i / BARS;
        const bin = Math.round(MIN_BIN * (MAX_BIN / MIN_BIN) ** t);
        // A response curve lifts quiet detail without clipping the peaks.
        const value = ((bins[bin] ?? 0) / 255) ** 0.7;

        if (t < 0.25) bass += value;
        else if (t < 0.65) mid += value;
        else treble += value;

        const angle = t * Math.PI * 2 - Math.PI / 2;
        const length = base + value * reach;
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);

        const hue = 205 + t * 115; // blue -> violet -> magenta
        ctx2d.strokeStyle = `hsl(${hue} ${65 + value * 25}% ${45 + value * 30}%)`;
        ctx2d.lineWidth = Math.max(2, (Math.min(w, h) * 0.012) * (0.6 + value));
        ctx2d.globalAlpha = 0.35 + value * 0.65;
        ctx2d.beginPath();
        ctx2d.moveTo(cx + cos * base, cy + sin * base);
        ctx2d.lineTo(cx + cos * length, cy + sin * length);
        ctx2d.stroke();
      }
      ctx2d.globalAlpha = 1;

      bass /= BARS * 0.18;
      mid /= BARS * 0.42;
      treble /= BARS * 0.4;

      // Core pulses with the low end.
      const coreRadius = base * (0.5 + bass * 0.38);
      const core = ctx2d.createRadialGradient(cx, cy, 0, cx, cy, coreRadius);
      core.addColorStop(0, `hsl(268 92% ${60 + bass * 20}%)`);
      core.addColorStop(0.55, `hsl(272 85% ${48 + bass * 16}% / 0.55)`);
      core.addColorStop(1, "hsl(272 80% 50% / 0)");
      ctx2d.fillStyle = core;
      ctx2d.beginPath();
      ctx2d.arc(cx, cy, coreRadius, 0, Math.PI * 2);
      ctx2d.fill();

      const readout = readoutRef.current;
      if (readout) {
        const fmt = (v: number) => String(Math.round(Math.min(1, v) * 100)).padStart(3, "0");
        readout.textContent = `bass ${fmt(bass)}  ·  mid ${fmt(mid)}  ·  treble ${fmt(treble)}`;
      }

      rafRef.current = requestAnimationFrame(render);
    };

    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(render);
  }, []);

  const ensureGraph = useCallback(async () => {
    if (graphRef.current) return graphRef.current;
    const Ctor =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!Ctor) throw new Error("Web Audio is unavailable in this browser.");

    const ctx = new Ctor();
    const analyser = ctx.createAnalyser();
    analyser.fftSize = FFT_SIZE;
    analyser.smoothingTimeConstant = 0.82;

    const master = ctx.createGain();
    master.gain.value = 0.16; // deliberately quiet
    master.connect(analyser);
    master.connect(ctx.destination);

    const graph: Graph = { ctx, analyser, master, stopSynth: null, stream: null };
    graphRef.current = graph;
    return graph;
  }, []);

  const start = useCallback(async () => {
    setNotice(null);
    try {
      const graph = await ensureGraph();
      await graph.ctx.resume();
      graph.stopSynth ??= startSynth(graph.ctx, graph.master);
      setSource("synth");
      setRunning(true);
      draw();
    } catch (err) {
      setNotice(
        err instanceof Error ? err.message : "Audio could not be started.",
      );
    }
  }, [draw, ensureGraph]);

  const stop = useCallback(() => {
    teardown();
    setRunning(false);
    setSource("synth");
  }, [teardown]);

  const switchToMicrophone = useCallback(async () => {
    setNotice(null);
    try {
      const graph = await ensureGraph();
      await graph.ctx.resume();
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // Silence the synth and feed the analyser from the mic. The microphone is
      // never connected to the destination, so there's no feedback loop.
      graph.stopSynth?.();
      graph.stopSynth = null;
      graph.stream?.getTracks().forEach((t) => t.stop());
      graph.stream = stream;
      graph.ctx.createMediaStreamSource(stream).connect(graph.analyser);
      setSource("mic");
      setRunning(true);
      draw();
    } catch {
      setNotice("Microphone unavailable — staying on the synthesised source.");
      if (!running) void start();
    }
  }, [draw, ensureGraph, running, start]);

  // Never keep audio running for a piece nobody is looking at.
  useEffect(() => {
    if (!running) return;
    const onVisibility = () => {
      const graph = graphRef.current;
      if (!graph) return;
      if (document.hidden) void graph.ctx.suspend();
      else void graph.ctx.resume();
    };
    document.addEventListener("visibilitychange", onVisibility);

    const canvas = canvasRef.current;
    const io = new IntersectionObserver(
      ([entry]) => {
        const graph = graphRef.current;
        if (!graph) return;
        if (entry?.isIntersecting) void graph.ctx.resume();
        else void graph.ctx.suspend();
      },
      { threshold: 0 },
    );
    if (canvas) io.observe(canvas);

    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      io.disconnect();
    };
  }, [running]);

  return (
    <div className={cn("relative h-full w-full", className)}>
      <canvas
        ref={canvasRef}
        role="img"
        aria-label="A radial spectrum: bars around a pulsing core, each one the level of a frequency band in the audio being analysed."
        className="h-full w-full"
      />

      {!running && (
        <div className="absolute inset-0 grid place-items-center px-6 text-center">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.22em] text-accent">
              Web Audio · FFT
            </p>
            <p className="mx-auto mt-4 max-w-sm text-pretty text-muted-foreground">
              Browsers only start audio after a gesture. Press play for a
              synthesised source — no file, no permission — or hand it your
              microphone.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => void start()}
                className="inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-transform hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                <Play className="h-4 w-4" />
                Start listening
              </button>
              <button
                type="button"
                onClick={() => void switchToMicrophone()}
                className="inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm text-muted-foreground ring-1 ring-border-strong transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                <Mic className="h-4 w-4" />
                Use microphone
              </button>
            </div>
          </div>
        </div>
      )}

      {running && (
        <div className="pointer-events-none absolute inset-x-4 top-4 flex flex-wrap items-center justify-between gap-3">
          <span className="inline-flex items-center gap-2 rounded-full bg-background/70 px-3 py-1.5 font-mono text-[0.7rem] uppercase tracking-[0.14em] text-muted-foreground ring-1 ring-border backdrop-blur-md">
            <Waves className="h-3.5 w-3.5 text-accent" />
            {source === "mic" ? "Microphone" : "Synthesised"}
          </span>
          <span className="pointer-events-auto flex items-center gap-2">
            {source === "synth" && (
              <button
                type="button"
                onClick={() => void switchToMicrophone()}
                className="inline-flex items-center gap-2 rounded-full bg-background/70 px-3 py-1.5 font-mono text-[0.7rem] uppercase tracking-[0.14em] text-muted-foreground ring-1 ring-border backdrop-blur-md transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                <Mic className="h-3.5 w-3.5" />
                Microphone
              </button>
            )}
            <button
              type="button"
              onClick={stop}
              className="inline-flex items-center gap-2 rounded-full bg-background/70 px-3 py-1.5 font-mono text-[0.7rem] uppercase tracking-[0.14em] text-muted-foreground ring-1 ring-border backdrop-blur-md transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              <Square className="h-3.5 w-3.5" />
              Stop
            </button>
          </span>
        </div>
      )}

      {notice && (
        <p
          role="status"
          className="absolute inset-x-0 bottom-14 mx-auto max-w-sm px-6 text-center font-mono text-[0.7rem] text-warning"
        >
          {notice}
        </p>
      )}

      <span
        ref={readoutRef}
        className={cn(
          "pointer-events-none absolute bottom-5 left-1/2 -translate-x-1/2 font-mono text-[0.7rem] uppercase tracking-[0.16em] text-faint",
          !running && "opacity-0",
        )}
      >
        bass 000 · mid 000 · treble 000
      </span>
    </div>
  );
}
