import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { AudioReactive } from "@/components/lab/audio-reactive";
import { LabPieceShell } from "@/components/lab/lab-piece-shell";
import { getLabEntry } from "@/lib/lab";

const entry = getLabEntry("audio-reactive");

export const metadata: Metadata = {
  title: "Audio-Reactive",
  description:
    "The interface listens. An FFT of live audio drives layout, color, and motion — the screen pulses and reorganizes to sound.",
};

const NOTES = [
  {
    title: "The sound is synthesised too",
    body: "There is no audio file here and no microphone requirement. A detuned pad runs through a slowly swept filter, a scheduler drops a low pulse every few hundred milliseconds, and short bursts of filtered noise add air. Web Audio is doing both jobs at once — making the signal and analysing it.",
  },
  {
    title: "Reading the spectrum",
    body: "An AnalyserNode runs a 2048-point FFT and hands back a byte per frequency bin. Bins are sampled on a curve rather than evenly: the low end carries most of the energy, so spreading it out is what keeps the visual from bunching everything into a corner. The bars are those levels; the core pulses on the bass.",
  },
  {
    title: "Gestures, permissions, and cleanup",
    body: "Browsers refuse to start audio without a gesture, so nothing exists until you press play. The microphone is optional, and it feeds the analyser only — never the output — so there is no feedback loop. Leaving the tab or scrolling away suspends the context, and unmounting stops every track and closes it, so the recording indicator never outlives the page.",
  },
];

export default function AudioReactivePage() {
  if (!entry) notFound();

  return (
    <LabPieceShell
      entry={entry}
      interactionHint="Press play, or lend it your microphone"
      notes={NOTES}
    >
      <AudioReactive />
    </LabPieceShell>
  );
}
