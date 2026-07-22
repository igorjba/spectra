"use client";

import { ShaderCanvas } from "@/components/gl/shader-canvas";

/*
  Raymarched forms. The scene has no meshes — three signed-distance primitives
  (sphere, rounded box, torus) blended with a smooth minimum into one organic
  body. Each pixel sphere-traces the distance field to a surface, reads the
  normal from the field's gradient, and shades it on the GPU: key light with
  soft shadows, ambient occlusion, a specular highlight, and a fresnel rim. The
  camera orbits with the pointer.
*/
const FRAG = /* glsl */ `#version 300 es
precision highp float;

out vec4 fragColor;

uniform vec2  u_res;
uniform vec2  u_mouse;
uniform float u_time;
uniform float u_theme;
uniform float u_active;
uniform vec3  u_bg;

mat2 rot(float a) {
  float c = cos(a), s = sin(a);
  return mat2(c, -s, s, c);
}

float sdSphere(vec3 p, float r) { return length(p) - r; }

float sdRoundBox(vec3 p, vec3 b, float r) {
  vec3 q = abs(p) - b;
  return length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0) - r;
}

float sdTorus(vec3 p, vec2 t) {
  vec2 q = vec2(length(p.xz) - t.x, p.y);
  return length(q) - t.y;
}

// Polynomial smooth minimum — melts the primitives into one another.
float smin(float a, float b, float k) {
  float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);
  return mix(b, a, h) - k * h * (1.0 - h);
}

float map(vec3 p) {
  // Slow idle spin on a single axis so the body has life without fighting
  // the pointer for control.
  p.xz *= rot(u_time * 0.1);
  float s = sdSphere(p - vec3(0.85 * sin(u_time * 0.38), 0.0, 0.0), 0.72);
  float b = sdRoundBox(p + vec3(0.0, 0.5 * sin(u_time * 0.3), 0.0), vec3(0.5), 0.08);
  float t = sdTorus(p, vec2(1.3, 0.3));
  float d = smin(s, b, 0.6);
  d = smin(d, t, 0.5);
  return d;
}

vec3 calcNormal(vec3 p) {
  vec2 e = vec2(0.0009, 0.0);
  return normalize(vec3(
    map(p + e.xyy) - map(p - e.xyy),
    map(p + e.yxy) - map(p - e.yxy),
    map(p + e.yyx) - map(p - e.yyx)
  ));
}

// Soft shadows via the penumbra trick over the distance field.
float softShadow(vec3 ro, vec3 rd, float k) {
  float res = 1.0;
  float t = 0.03;
  for (int i = 0; i < 24; i++) {
    float h = map(ro + rd * t);
    if (h < 0.001) return 0.0;
    res = min(res, k * h / t);
    t += clamp(h, 0.02, 0.25);
    if (t > 7.0) break;
  }
  return clamp(res, 0.0, 1.0);
}

float ambientOcclusion(vec3 p, vec3 n) {
  float occ = 0.0;
  float sca = 1.0;
  for (int i = 0; i < 5; i++) {
    float h = 0.01 + 0.13 * float(i) / 4.0;
    occ += (h - map(p + n * h)) * sca;
    sca *= 0.92;
  }
  return clamp(1.0 - 2.6 * occ, 0.0, 1.0);
}

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
  vec2 off = u_mouse / u_res - 0.5;

  // Camera orbits around the body with the cursor: move right and it swings
  // around to the right. Bounded and drift-free so the pointer is in control.
  float yaw = off.x * 1.8;
  // Keep the camera above the equator so the body always reads as a disc seen
  // from a flattering three-quarter angle, never edge-on.
  float pitch = clamp(off.y * 1.0 + 0.5, 0.22, 1.15);
  float radius = 4.8;
  vec3 ro = radius * vec3(
    sin(yaw) * cos(pitch),
    sin(pitch),
    cos(yaw) * cos(pitch)
  );

  vec3 cw = normalize(-ro);
  vec3 cu = normalize(cross(cw, vec3(0.0, 1.0, 0.0)));
  vec3 cv = cross(cu, cw);
  vec3 rd = normalize(uv.x * cu + uv.y * cv + 1.5 * cw);

  vec3 bg = u_bg * (1.0 - 0.28 * length(uv));

  // Sphere tracing.
  float t = 0.0;
  float d = 0.0;
  bool hit = false;
  for (int i = 0; i < 96; i++) {
    vec3 p = ro + rd * t;
    d = map(p);
    if (d < 0.0012) { hit = true; break; }
    t += d;
    if (t > 18.0) break;
  }

  vec3 col = bg;

  if (hit) {
    vec3 p = ro + rd * t;
    vec3 n = calcNormal(p);

    vec3 lightPos = vec3(2.4, 3.2, 1.8);
    vec3 l = normalize(lightPos - p);
    float diff = clamp(dot(n, l), 0.0, 1.0);
    float shadow = softShadow(p + n * 0.02, l, 10.0);
    float occ = ambientOcclusion(p, n);

    vec3 h = normalize(l - rd);
    float spec = pow(clamp(dot(n, h), 0.0, 1.0), 42.0);
    float fres = pow(1.0 - clamp(dot(n, -rd), 0.0, 1.0), 3.2);

    // Fill light from the opposite side keeps the shadow side readable.
    vec3 fillDir = normalize(vec3(-1.5, 0.4, -1.0));
    float fill = clamp(dot(n, fillDir), 0.0, 1.0) * 0.35;

    vec3 base = palette(0.52 + 0.22 * p.y + 0.12 * n.x + u_time * 0.02);

    col = base * (0.12 + 0.9 * diff * shadow + fill) * (0.35 + 0.65 * occ);
    col += vec3(1.0) * spec * shadow * 0.8;
    col += palette(u_time * 0.05 + 0.35) * fres * (0.4 + 0.6 * u_theme);

    // Distance fog into the background.
    col = mix(col, bg, smoothstep(5.5, 15.0, t));
  }

  col *= 1.0 - 0.22 * dot(uv, uv);
  col += (fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5) - 0.5) * 0.014;

  fragColor = vec4(col, 1.0);
}
`;

export function RaymarchedForms({ className }: { className?: string }) {
  return (
    <ShaderCanvas
      fragmentShader={FRAG}
      className={className}
      dprCap={1.5}
      idleActive={0}
      ariaLabel="Um conjunto de formas tridimensionais fundidas em um corpo só, percorridas por raymarching e iluminadas em tempo real; a câmera orbita conforme o ponteiro se move."
    />
  );
}
