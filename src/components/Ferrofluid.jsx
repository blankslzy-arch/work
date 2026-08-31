import { useEffect, useRef } from 'react'
import { Mesh, Program, Renderer, Triangle } from 'ogl'
import './Ferrofluid.css'

const toRgb = (hex) => {
  const value = hex.replace('#', '').padEnd(6, '0')
  return [0, 2, 4].map((index) => parseInt(value.slice(index, index + 2), 16) / 255)
}

const vertex = `
attribute vec2 position;
attribute vec2 uv;
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 0.0, 1.0);
}`

const fragment = `
precision highp float;

uniform vec3 iResolution;
uniform vec2 iMouse;
uniform float iTime;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform float uSpeed;
uniform float uScale;
uniform float uTurbulence;
uniform float uRimWidth;
uniform float uGlow;
uniform float uOpacity;
uniform float uMouseStrength;
uniform float uMouseRadius;

varying vec2 vUv;

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + 1.0), f.x), f.y);
}

float fbm(vec2 p) {
  float value = 0.0;
  float amplitude = 0.52;
  for (int i = 0; i < 5; i++) {
    value += amplitude * noise(p);
    p = p * 2.06 + vec2(11.4, 7.1);
    amplitude *= 0.5;
  }
  return value;
}

void main() {
  vec2 uv = (vUv - 0.5) * vec2(iResolution.x / iResolution.y, 1.0);
  float time = iTime * uSpeed;
  float zoom = max(uScale, 0.12);
  vec2 drift = vec2(0.0, -time * 0.12);

  float warp = fbm(uv * 2.1 * zoom + drift) * uTurbulence;
  float layerA = fbm((uv + warp * 0.18) * 3.4 * zoom + drift * 1.7);
  float layerB = fbm((uv - warp * 0.14) * 4.1 * zoom - drift * 1.25 + 8.0);
  float field = layerA - layerB + warp * 0.42;

  vec2 mouse = iMouse / iResolution.xy - 0.5;
  mouse.x *= iResolution.x / iResolution.y;
  float mouseDistance = length(uv - mouse);
  field += exp(-(mouseDistance * mouseDistance) / max(uMouseRadius * uMouseRadius, 0.001)) * uMouseStrength * 0.42;

  float rim = smoothstep(uRimWidth, 0.0, abs(field - 0.05));
  rim = pow(rim, 2.25) * uGlow;
  float tone = clamp(layerA * 1.15 + layerB * 0.38, 0.0, 1.0);
  vec3 color = mix(uColorA, uColorB, smoothstep(0.18, 0.72, tone));
  color = mix(color, uColorC, smoothstep(0.7, 1.0, tone));
  gl_FragColor = vec4(color * rim, rim * uOpacity);
}`

export default function Ferrofluid({
  colors = ['#dbe9ea', '#829ba5', '#ffffff'],
  speed = 0.38,
  scale = 1.55,
  turbulence = 1.25,
  rimWidth = 0.24,
  glow = 1.6,
  opacity = 0.62,
  mouseStrength = 0.7,
  mouseRadius = 0.28,
  className = '',
}) {
  const rootRef = useRef(null)

  useEffect(() => {
    const root = rootRef.current
    if (!root) return undefined

    const renderer = new Renderer({ alpha: true, dpr: Math.min(window.devicePixelRatio || 1, 1.5) })
    const gl = renderer.gl
    const canvas = gl.canvas
    canvas.setAttribute('aria-hidden', 'true')
    root.appendChild(canvas)

    const palette = colors.map(toRgb)
    const uniforms = {
      iResolution: { value: [1, 1, 1] },
      iMouse: { value: [0, 0] },
      iTime: { value: 0 },
      uColorA: { value: palette[0] },
      uColorB: { value: palette[1] || palette[0] },
      uColorC: { value: palette[2] || palette[0] },
      uSpeed: { value: speed },
      uScale: { value: scale },
      uTurbulence: { value: turbulence },
      uRimWidth: { value: rimWidth },
      uGlow: { value: glow },
      uOpacity: { value: opacity },
      uMouseStrength: { value: mouseStrength },
      uMouseRadius: { value: mouseRadius },
    }
    const mesh = new Mesh(gl, { geometry: new Triangle(gl), program: new Program(gl, { vertex, fragment, uniforms }) })

    const resize = () => {
      const rect = root.getBoundingClientRect()
      renderer.setSize(rect.width, rect.height)
      uniforms.iResolution.value = [gl.drawingBufferWidth, gl.drawingBufferHeight, 1]
    }
    const onPointerMove = (event) => {
      const rect = canvas.getBoundingClientRect()
      uniforms.iMouse.value = [
        (event.clientX - rect.left) * renderer.dpr,
        (rect.height - (event.clientY - rect.top)) * renderer.dpr,
      ]
    }
    const resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(root)
    window.addEventListener('pointermove', onPointerMove, { passive: true })
    resize()

    let frame = 0
    const render = (time) => {
      uniforms.iTime.value = time * 0.001
      renderer.render({ scene: mesh })
      frame = requestAnimationFrame(render)
    }
    frame = requestAnimationFrame(render)

    return () => {
      cancelAnimationFrame(frame)
      resizeObserver.disconnect()
      window.removeEventListener('pointermove', onPointerMove)
      canvas.remove()
      gl.getExtension('WEBGL_lose_context')?.loseContext()
    }
  }, [colors, glow, mouseRadius, mouseStrength, opacity, rimWidth, scale, speed, turbulence])

  return <div ref={rootRef} className={`ferrofluid-container ${className}`} />
}
