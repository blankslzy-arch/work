import { useEffect, useRef } from 'react'
import './StudioCursor.css'

export default function StudioCursor() {
  const cursorRef = useRef(null)

  useEffect(() => {
    const media = window.matchMedia('(hover: hover) and (pointer: fine)')
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')
    const cursor = cursorRef.current
    const ring = cursor.querySelector('.studio-cursor-ring')
    const dot = cursor.querySelector('.studio-cursor-dot')
    let frame = 0
    let visible = false
    let x = 0, y = 0, ringX = 0, ringY = 0, lastTime = 0

    const hide = () => {
      visible = false
      cursor.dataset.visible = 'false'
      cursor.dataset.pressed = 'false'
      document.documentElement.classList.remove('studio-cursor-active')
      cancelAnimationFrame(frame)
      frame = 0
    }
    const draw = (time) => {
      if (!visible) return
      const amount = reduced.matches ? 1 : 1 - Math.exp(-Math.min(time - lastTime, 50) / 22)
      lastTime = time
      ringX += (x - ringX) * amount
      ringY += (y - ringY) * amount
      ring.style.transform = `translate3d(${ringX}px, ${ringY}px, 0)`
      frame = requestAnimationFrame(draw)
    }
    const move = (event) => {
      if (!media.matches || event.pointerType === 'touch') return hide()
      const target = event.target
      if (!(target instanceof Element) || target.closest('input, textarea, select, [contenteditable="true"], iframe')) return hide()
      x = event.clientX
      y = event.clientY
      dot.style.transform = `translate3d(${x}px, ${y}px, 0)`
      cursor.dataset.mode = target.closest('.project-image-carousel') ? 'work' : target.closest('a, button:not(:disabled), [role="button"]') ? 'action' : 'default'
      if (!visible) {
        visible = true
        ringX = x
        ringY = y
        ring.style.transform = `translate3d(${x}px, ${y}px, 0)`
        cursor.dataset.visible = 'true'
        document.documentElement.classList.add('studio-cursor-active')
        lastTime = performance.now()
        frame = requestAnimationFrame(draw)
      }
    }
    const press = () => { cursor.dataset.pressed = 'true' }
    const release = () => { cursor.dataset.pressed = 'false' }
    const leave = (event) => { if (!event.relatedTarget) hide() }
    const visibility = () => { if (document.hidden) hide() }
    window.addEventListener('pointermove', move, { passive: true })
    window.addEventListener('pointerdown', press, { passive: true })
    window.addEventListener('pointerup', release, { passive: true })
    window.addEventListener('pointercancel', hide)
    window.addEventListener('pointerout', leave)
    window.addEventListener('blur', hide)
    document.addEventListener('visibilitychange', visibility)
    media.addEventListener('change', hide)
    return () => {
      hide()
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerdown', press)
      window.removeEventListener('pointerup', release)
      window.removeEventListener('pointercancel', hide)
      window.removeEventListener('pointerout', leave)
      window.removeEventListener('blur', hide)
      document.removeEventListener('visibilitychange', visibility)
      media.removeEventListener('change', hide)
    }
  }, [])

  return <div ref={cursorRef} className="studio-cursor" data-visible="false" aria-hidden="true">
    <div className="studio-cursor-dot"><i /></div>
    <div className="studio-cursor-ring"><span><svg viewBox="0 0 32 32">
      <path d="M19 3.35A13 13 0 0 1 28.65 13M28.65 19A13 13 0 0 1 19 28.65M13 28.65A13 13 0 0 1 3.35 19M3.35 13A13 13 0 0 1 13 3.35" />
    </svg><b>↗</b></span></div>
  </div>
}
