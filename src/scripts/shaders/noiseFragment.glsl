varying vec2 vUv;
varying float vDistortion;

uniform float uTime;
uniform vec3 uColor1;
uniform vec3 uColor2;
uniform float uOpacity;

void main() {
  float mixVal = (vDistortion + 1.0) * 0.5;
  mixVal = smoothstep(0.2, 0.8, mixVal);

  vec3 color = mix(uColor2, uColor1, mixVal * 0.7);

  float highlight = smoothstep(0.6, 1.0, mixVal);
  color = mix(color, uColor1, highlight * 0.5);

  float edgeX = smoothstep(0.0, 0.35, vUv.x) * smoothstep(1.0, 0.65, vUv.x);
  float edgeY = smoothstep(0.0, 0.35, vUv.y) * smoothstep(1.0, 0.65, vUv.y);
  float edge = edgeX * edgeY;
  edge = edge * edge;

  float alpha = uOpacity * edge;

  gl_FragColor = vec4(color, alpha);
}
