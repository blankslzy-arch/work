import { useEffect, useRef } from 'react'
import { Mesh, Program, Renderer, Triangle } from 'ogl'
import './GradientWaves.css'

const hexToRgb = (hex) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (!result) return [1, 1, 1]
  return [parseInt(result[1], 16) / 255, parseInt(result[2], 16) / 255, parseInt(result[3], 16) / 255]
}

const detailToSteps = (detail) => (detail === 'low' ? 40 : detail === 'high' ? 110 : 70)

const vertex = `#version 300 es
in vec2 position;
void main() { gl_Position = vec4(position, 0.0, 1.0); }
`

const fragment = `#version 300 es
precision highp float;
uniform vec2 iResolution;
uniform float iTime;
uniform float uSpeed, uAmplitude, uWaveScale, uWaveRatio, uSwell, uTurbulence;
uniform float uTilt, uZoom, uHeight, uFogDepth, uSteps, uBrightness, uOpacity;
uniform float uGrain, uGrainIntensity, uParallax;
uniform vec2 uMouse;
uniform bool uEnableMouse;
uniform vec3 uHorizonColor, uWaveColor, uCrestColor;
out vec4 fragColor;

const float MAX_DIST = 20000.0;

float hash21(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

float plasma(vec3 r, vec2 freq, vec4 tc) {
  float mx = r.x + tc.x;
  mx += uSwell * sin((r.y + mx) / 20.0 + tc.y);
  float my = r.y - tc.z;
  my += uTurbulence * cos(r.x / 23.0 + tc.w);
  return r.z - (sin(mx * freq.x) * uAmplitude + sin(my * freq.y) * uAmplitude + uHeight);
}

float raymarch(vec3 pos, vec3 dir, vec2 freq, vec4 tc) {
  float dist = 0.0;
  for (int i = 0; i < 128; i++) {
    if (float(i) >= uSteps) break;
    float dscene = plasma(pos + dist * dir, freq, tc);
    if (abs(dscene) < 0.1) break;
    dist += 0.9 * dscene;
    if (!(abs(dist) < MAX_DIST)) return MAX_DIST;
  }
  return dist;
}

void main() {
  float T = iTime * uSpeed;
  vec2 freq = vec2(uWaveScale / 7.0, (uWaveScale * uWaveRatio) / 3.0);
  vec4 tc = vec4(T / 0.130, T / 0.810, T / 0.200, T / 0.710);
  float c, s;
  float vfov = (3.14159 / 2.3) / max(uZoom, 0.05);
  vec3 cam = vec3(0.0, 0.0, 30.0);
  vec2 uv = gl_FragCoord.xy / iResolution.xy - 0.5;
  uv.x *= iResolution.x / iResolution.y;
  uv.y *= -1.0;

  vec3 dir = vec3(0.0, 0.0, -1.0);
  float ulen = length(uv);
  float xrot = vfov * ulen;
  c = cos(xrot); s = sin(xrot);
  dir = mat3(1.0, 0.0, 0.0, 0.0, c, -s, 0.0, s, c) * dir;
  vec2 nuv = ulen > 1e-5 ? uv / ulen : vec2(1.0, 0.0);
  c = nuv.x; s = nuv.y;
  dir = mat3(c, -s, 0.0, s, c, 0.0, 0.0, 0.0, 1.0) * dir;
  c = cos(uTilt); s = sin(uTilt);
  dir = mat3(c, 0.0, s, 0.0, 1.0, 0.0, -s, 0.0, c) * dir;

  if (uEnableMouse) {
    float yaw = (uMouse.x - 0.5) * uParallax * 0.4;
    float pitch = (uMouse.y - 0.5) * uParallax * 0.4;
    c = cos(yaw); s = sin(yaw);
    dir = mat3(c, 0.0, s, 0.0, 1.0, 0.0, -s, 0.0, c) * dir;
    c = cos(pitch); s = sin(pitch);
    dir = mat3(1.0, 0.0, 0.0, 0.0, c, -s, 0.0, s, c) * dir;
  }

  float dist = raymarch(cam, dir, freq, tc);
  vec3 pos = cam + dist * dir;
  float t = clamp(uFogDepth / max(dist, 0.001), 0.0, 1.0);
  vec3 body = mix(uWaveColor, uCrestColor, clamp(pos.z * 0.08 + 0.5, 0.0, 1.0));
  vec3 col = clamp(mix(uHorizonColor, body, t) * uBrightness, 0.0, 1.0);
  float alpha = clamp(t, 0.0, 1.0) * uOpacity;
  if (uGrain > 0.5) alpha += (hash21(gl_FragCoord.xy + mod(iTime, 64.0) * 11.0) - 0.5) * uGrainIntensity;
  fragColor = vec4(col * clamp(alpha, 0.0, 1.0), clamp(alpha, 0.0, 1.0));
}
`

const contextMap = new WeakMap()

export default function GradientWaves({
  horizonColor = '#203541',
  waveColor = '#426576',
  crestColor = '#dceced',
  speed = 0.24,
  amplitude = 1.3,
  waveScale = 0.52,
  waveRatio = 0.82,
  swell = 18,
  turbulence = 10,
  tilt = 1.08,
  zoom = 1.15,
  height = 4.7,
  fogDepth = 17,
  detail = 'medium',
  brightness = 0.7,
  opacity = 0.54,
  mouseInteraction = false,
  parallaxStrength = 0.18,
  grain = true,
  grainIntensity = 0.025,
  className = '',
}) {
  const containerRef = useRef(null)
  const mouseEnabledRef = useRef(mouseInteraction)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return undefined

    const renderer = new Renderer({ webgl: 2, alpha: true, premultipliedAlpha: true, antialias: false, dpr: Math.min(window.devicePixelRatio || 1, 1.5) })
    const gl = renderer.gl
    gl.clearColor(0, 0, 0, 0)
    const canvas = gl.canvas
    Object.assign(canvas.style, { width: '100%', height: '100%', display: 'block' })
    container.appendChild(canvas)

    const program = new Program(gl, {
      vertex,
      fragment,
      uniforms: {
        iTime: { value: 0 }, iResolution: { value: new Float32Array([1, 1]) },
        uSpeed: { value: speed }, uAmplitude: { value: amplitude }, uWaveScale: { value: waveScale }, uWaveRatio: { value: waveRatio },
        uSwell: { value: swell }, uTurbulence: { value: turbulence }, uTilt: { value: tilt }, uZoom: { value: zoom },
        uHeight: { value: height }, uFogDepth: { value: fogDepth }, uSteps: { value: detailToSteps(detail) },
        uBrightness: { value: brightness }, uOpacity: { value: opacity }, uGrain: { value: grain ? 1 : 0 },
        uGrainIntensity: { value: grainIntensity }, uMouse: { value: new Float32Array([0.5, 0.5]) },
        uParallax: { value: parallaxStrength }, uEnableMouse: { value: mouseInteraction },
        uHorizonColor: { value: new Float32Array(hexToRgb(horizonColor)) }, uWaveColor: { value: new Float32Array(hexToRgb(waveColor)) },
        uCrestColor: { value: new Float32Array(hexToRgb(crestColor)) },
      },
    })
    const mesh = new Mesh(gl, { geometry: new Triangle(gl), program })
    contextMap.set(container, { renderer, program })

    const setSize = () => {
      const { width, height: canvasHeight } = container.getBoundingClientRect()
      renderer.setSize(Math.max(1, Math.floor(width)), Math.max(1, Math.floor(canvasHeight)))
      program.uniforms.iResolution.value[0] = gl.drawingBufferWidth
      program.uniforms.iResolution.value[1] = gl.drawingBufferHeight
    }
    const resizeObserver = new ResizeObserver(setSize)
    resizeObserver.observe(container)
    setSize()

    const currentMouse = [0.5, 0.5]
    const targetMouse = [0.5, 0.5]
    const onPointerMove = (event) => {
      const rect = container.getBoundingClientRect()
      targetMouse[0] = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width))
      targetMouse[1] = Math.min(1, Math.max(0, 1 - (event.clientY - rect.top) / rect.height))
    }
    if (mouseInteraction) window.addEventListener('pointermove', onPointerMove, { passive: true })

    let frame = 0
    let isInView = true
    let isPageVisible = !document.hidden
    const origin = performance.now()
    const stop = () => {
      if (!frame) return
      cancelAnimationFrame(frame)
      frame = 0
    }
    const start = () => {
      if (!frame && isInView && isPageVisible) frame = requestAnimationFrame(render)
    }
    const render = (time) => {
      if (!isInView || !isPageVisible) {
        frame = 0
        return
      }
      program.uniforms.iTime.value = (time - origin) * 0.001
      const targetX = mouseEnabledRef.current ? targetMouse[0] : 0.5
      const targetY = mouseEnabledRef.current ? targetMouse[1] : 0.5
      currentMouse[0] += (targetX - currentMouse[0]) * 0.045
      currentMouse[1] += (targetY - currentMouse[1]) * 0.045
      program.uniforms.uMouse.value[0] = currentMouse[0]
      program.uniforms.uMouse.value[1] = currentMouse[1]
      renderer.render({ scene: mesh })
      frame = requestAnimationFrame(render)
    }
    const intersectionObserver = new IntersectionObserver(([entry]) => {
      isInView = entry.isIntersecting
      isInView ? start() : stop()
    }, { threshold: 0 })
    intersectionObserver.observe(container)
    const onVisibilityChange = () => {
      isPageVisible = !document.hidden
      isPageVisible ? start() : stop()
    }
    document.addEventListener('visibilitychange', onVisibilityChange)
    start()

    return () => {
      stop()
      resizeObserver.disconnect()
      intersectionObserver.disconnect()
      document.removeEventListener('visibilitychange', onVisibilityChange)
      if (mouseInteraction) window.removeEventListener('pointermove', onPointerMove)
      contextMap.delete(container)
      canvas.remove()
      gl.getExtension('WEBGL_lose_context')?.loseContext()
    }
  }, [])

  useEffect(() => {
    const context = contextMap.get(containerRef.current)
    if (!context) return
    const { uniforms } = context.program
    mouseEnabledRef.current = mouseInteraction
    uniforms.uSpeed.value = speed; uniforms.uAmplitude.value = amplitude; uniforms.uWaveScale.value = waveScale; uniforms.uWaveRatio.value = waveRatio
    uniforms.uSwell.value = swell; uniforms.uTurbulence.value = turbulence; uniforms.uTilt.value = tilt; uniforms.uZoom.value = zoom
    uniforms.uHeight.value = height; uniforms.uFogDepth.value = fogDepth; uniforms.uSteps.value = detailToSteps(detail); uniforms.uBrightness.value = brightness
    uniforms.uOpacity.value = opacity; uniforms.uGrain.value = grain ? 1 : 0; uniforms.uGrainIntensity.value = grainIntensity
    uniforms.uParallax.value = parallaxStrength; uniforms.uEnableMouse.value = mouseInteraction
    ;[['uHorizonColor', horizonColor], ['uWaveColor', waveColor], ['uCrestColor', crestColor]].forEach(([key, color]) => {
      const [r, g, b] = hexToRgb(color)
      const value = uniforms[key].value
      value[0] = r; value[1] = g; value[2] = b
    })
  }, [horizonColor, waveColor, crestColor, speed, amplitude, waveScale, waveRatio, swell, turbulence, tilt, zoom, height, fogDepth, detail, brightness, opacity, mouseInteraction, parallaxStrength, grain, grainIntensity])

  return <div ref={containerRef} className={`gradient-waves-container ${className}`.trim()} />
}
