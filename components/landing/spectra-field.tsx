"use client";

import { ShaderCanvas } from "@/components/gl/shader-canvas";
import { cn } from "@/lib/utils";

/*
  Spectral field. Fractal-noise domain warping (Inigo Quilez's technique)
  colored through a cool cosine-style ramp, with a pointer-driven attractor
  that warps and brightens the field near the cursor.
*/
const FRAG = /* glsl */ `#version 300 es
precision highp float;

out vec4 fragColor;

uniform vec2  u_res;
uniform vec2  u_mouse;
uniform float u_time;
uniform float u_theme;
uniform float u_active;

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

const mat2 M = mat2(1.62, 1.18, -1.18, 1.62);

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 6; i++) {
    v += a * noise(p);
    p = M * p;
    a *= 0.5;
  }
  return v;
}

// Cool, on-brand ramp: blue -> iris -> magenta -> teal, cyclic.
vec3 palette(float t) {
  const vec3 blue = vec3(0.16, 0.42, 0.86);
  const vec3 iris = vec3(0.46, 0.32, 0.92);
  const vec3 magenta = vec3(0.88, 0.32, 0.70);
  const vec3 teal = vec3(0.18, 0.6, 0.72);
  float s = fract(t) * 4.0;
  vec3 col = mix(blue, iris, smoothstep(0.0, 1.0, s));
  col = mix(col, magenta, smoothstep(1.0, 2.0, s));
  col = mix(col, teal, smoothstep(2.0, 3.0, s));
  col = mix(col, blue, smoothstep(3.0, 4.0, s));
  return col;
}

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * u_res) / u_res.y;
  vec2 mouse = (u_mouse - 0.5 * u_res) / u_res.y;

  float md = length(uv - mouse);
  float energy = u_active * exp(-md * md * 3.0);

  float t = u_time * 0.045;
  vec2 p = uv * 1.55;

  vec2 q = vec2(fbm(p + vec2(0.0, t)), fbm(p + vec2(5.2, 1.3 - t)));
  vec2 r = vec2(
    fbm(p + 1.9 * q + vec2(1.7, 9.2) + energy * 0.9),
    fbm(p + 1.9 * q + vec2(8.3, 2.8) - t * 0.6)
  );
  float f = fbm(p + 2.3 * r + energy * 0.6);

  float hue = f + 0.16 * length(q) + 0.12 * sin(t * 1.7) - 0.05 * md;
  vec3 col = palette(hue);
  col = mix(col, palette(hue + 0.22), clamp(length(r), 0.0, 1.0));

  col += palette(u_time * 0.08) * energy * 0.6;

  float density = smoothstep(0.15, 0.95, f + 0.25 * length(r));

  vec3 darkBg = vec3(0.052, 0.048, 0.07);
  vec3 lightBg = vec3(0.975, 0.975, 0.985);
  vec3 bg = mix(lightBg, darkBg, u_theme);

  float ink = mix(0.32, 0.9, u_theme);
  col = mix(bg, col, density * ink + energy * 0.35);

  float vignette = smoothstep(1.7, 0.35, length(uv));
  col *= mix(0.9, 1.0, vignette);

  col += (hash(gl_FragCoord.xy + u_time) - 0.5) * 0.018;

  fragColor = vec4(col, 1.0);
}
`;

export function SpectraField({ className }: { className?: string }) {
  return (
    <ShaderCanvas
      fragmentShader={FRAG}
      className={className}
      fallback={
        <div
          aria-hidden="true"
          className={cn(
            "h-full w-full bg-[radial-gradient(120%_120%_at_20%_10%,var(--spectra-4),transparent_45%),radial-gradient(120%_120%_at_80%_30%,var(--spectra-5),transparent_45%),radial-gradient(140%_140%_at_50%_100%,var(--spectra-3),transparent_55%)] opacity-60",
            className,
          )}
        />
      }
    />
  );
}
