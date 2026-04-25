import { Effect } from 'postprocessing';
import { Uniform, Vector2 } from 'three';

const fragmentShader = `
  uniform float uGrainIntensity;
  uniform float uVignetteDarkness;
  uniform float uVignetteOffset;
  uniform float uDistortion;
  uniform float uTime;

  void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
    vec2 p = uv - 0.5;
    
    // 1. Liquid Displacement (Subtle)
    vec2 distortedUv = uv + (sin(uv.y * 10.0 + uTime) * 0.002 * uDistortion);
    vec4 color = texture2D(inputBuffer, distortedUv);

    // 2. Film Grain
    float grain = (fract(sin(dot(distortedUv + uTime, vec2(12.9898, 78.233))) * 43758.5453) - 0.5) * uGrainIntensity;
    color.rgb += grain;

    // 3. Vignette
    float d = length(p);
    float vignette = smoothstep(uVignetteOffset, uVignetteOffset - 0.5, d * uVignetteDarkness);
    color.rgb *= vignette;

    outputColor = color;
  }
`;

export class SOTAEffect extends Effect {
  constructor(options = {}) {
    super('SOTAEffect', fragmentShader, {
      uniforms: new Map([
        ['uGrainIntensity', new Uniform(options.grainIntensity || 0.05)],
        ['uVignetteDarkness', new Uniform(options.vignetteDarkness || 1.1)],
        ['uVignetteOffset', new Uniform(options.vignetteOffset || 0.6)],
        ['uDistortion', new Uniform(options.distortion || 0.5)],
        ['uTime', new Uniform(0)]
      ])
    });
  }

  update(renderer, inputBuffer, deltaTime) {
    this.uniforms.get('uTime').value += deltaTime;
  }
}
