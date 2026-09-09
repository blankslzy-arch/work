import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import './styles.css'
import PixelBlast from './components/PixelBlast'
import StudioCursor from './components/StudioCursor'

gsap.registerPlugin(ScrollTrigger)

const projects = [
  {
    number: '01',
    title: '产品动态叙事',
    type: 'PRODUCT FILM / CGI',
    description: '以材质、光线和镜头节奏为产品建立精确而有触感的表达。',
    className: 'art-product',
    video: '/works/portfolio-reel-01.share.mp4',
    size: 'project-featured',
  },
  {
    number: '02',
    title: '单帧视觉渲染',
    type: 'KEY VISUAL / 3D RENDER',
    description: '以构图、材质与光线凝练单帧视觉，在静止画面中建立鲜明的品牌记忆点。',
    className: 'art-orbit',
    images: [
      '/works/key-visual-glasses-silver.png',
      '/works/key-visual-glasses-black.png',
      '/works/key-visual-sanang-nova.jpg',
      '/works/key-visual-robot-arm.jpg',
      '/works/key-visual-sanang-gallery.jpg',
      '/works/key-visual-sanang-campaign.jpg',
    ],
    size: 'project-half',
  },
  {
    number: '03',
    title: 'AI 内容视觉包装',
    type: 'AI CONTENT / VISUAL ID',
    description: '将 AI 产品信息与内容节奏转译为清晰、有识别度的动态视觉语言。',
    className: 'art-signal',
    video: '/works/packaging-replacement.mp4',
    size: 'project-half',
  },
]

const strengths = [
  {
    index: '01',
    title: '完整制作链路',
    text: '从创意沟通、脚本与分镜，到预演、渲染、合成及交付，能够保持每一个阶段的整体一致性。',
  },
  {
    index: '02',
    title: '三维视觉表达',
    text: '熟练使用 Cinema 4D 建模、材质灯光、动画与渲染，以空间、镜头和节奏建立鲜明的画面语言。',
  },
  {
    index: '03',
    title: '后期与动态包装',
    text: '结合 After Effects、Premiere 完成后期合成、剪辑和视觉包装，让动画在最终呈现中更精准有力。',
  },
  {
    index: '04',
    title: '新工具协作',
    text: '持续关注前沿技术，并将 AI 与创意工具融入工作流，以更高效率探索新的视觉可能。',
  },
]

function ArrowUpRight() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true">
      <path d="M4 16 16 4M7 4h9v9" fill="none" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  )
}

function Plus() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true">
      <path d="M10 3v14M3 10h14" fill="none" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  )
}

function ProjectArtwork({ className, number }) {
  return (
    <div className={`project-art ${className}`} aria-hidden="true">
      <span className="art-grain" />
      <span className="art-label">LZY / {number}</span>
      <span className="art-corner art-corner-a" />
      <span className="art-corner art-corner-b" />
      <span className="art-shadow" />
      {className === 'art-orbit' && (
        <>
          <span className="orbit-disc orbit-disc-one" />
          <span className="orbit-disc orbit-disc-two" />
          <span className="orbit-core" />
          <span className="orbit-line" />
          <span className="orbit-number">3D</span>
        </>
      )}
      {className === 'art-product' && (
        <>
          <span className="product-panel product-panel-back" />
          <span className="product-panel product-panel-front" />
          <span className="product-ring" />
          <span className="product-ball" />
          <span className="product-type">FORM<br />/01</span>
        </>
      )}
      {className === 'art-stage' && (
        <>
          <span className="stage-horizon" />
          <span className="stage-grid" />
          <span className="stage-portal stage-portal-one" />
          <span className="stage-portal stage-portal-two" />
          <span className="stage-sun" />
          <span className="stage-type">CAMERA<br />PREVIS</span>
        </>
      )}
      {className === 'art-signal' && (
        <>
          <span className="signal-disc signal-disc-a" />
          <span className="signal-disc signal-disc-b" />
          <span className="signal-slice signal-slice-a" />
          <span className="signal-slice signal-slice-b" />
          <span className="signal-line signal-line-a" />
          <span className="signal-line signal-line-b" />
          <span className="signal-type">SIGNAL<br />IN MOTION</span>
        </>
      )}
    </div>
  )
}

function ProjectVideo({ source, title }) {
  const videoRef = useRef(null)
  const inViewRef = useRef(false)
  const [shouldLoad, setShouldLoad] = useState(false)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return undefined

    const syncPlayback = () => {
      if (!inViewRef.current) return
      video.play().catch(() => {})
    }
    const observer = new IntersectionObserver(([entry]) => {
      inViewRef.current = entry.isIntersecting
      if (entry.isIntersecting) {
        setShouldLoad(true)
        syncPlayback()
      } else {
        video.pause()
      }
    }, { rootMargin: '360px 0px', threshold: 0.01 })

    observer.observe(video)
    return () => observer.disconnect()
  }, [])

  const resumeIfVisible = () => {
    if (inViewRef.current) videoRef.current?.play().catch(() => {})
  }

  return (
    <video
      ref={videoRef}
      className="project-video"
      muted
      loop
      playsInline
      preload="none"
      aria-label={`${title}项目视频`}
      onCanPlay={resumeIfVisible}
    >
      {shouldLoad && <source src={source} type="video/mp4" />}
    </video>
  )
}

function ProjectPlayer({ source, title }) {
  const dialogRef = useRef(null)
  const playerRef = useRef(null)
  const [loaded, setLoaded] = useState(false)
  const stop = () => playerRef.current?.pause()
  const open = () => {
    setLoaded(true)
    dialogRef.current.showModal()
  }
  return <>
    <button className="watch-project" type="button" onClick={open}>观看作品 <span aria-hidden="true">↗</span></button>
    <dialog className="project-player" ref={dialogRef} onClose={stop} onCancel={stop}
      onClick={(event) => { if (event.target === event.currentTarget) dialogRef.current.close() }} aria-label={`${title}播放器`}>
      <div className="player-header"><span>{title}</span><button type="button" autoFocus onClick={() => dialogRef.current.close()} aria-label="关闭播放器">关闭 ×</button></div>
      <video ref={playerRef} src={loaded ? source : undefined} controls playsInline preload="metadata" aria-label={title} />
    </dialog>
  </>
}

function ProjectImageCarousel({ images, title }) {
  const [activeIndex, setActiveIndex] = useState(0)
  const dragStartX = useRef(null)

  const goTo = (nextIndex) => {
    setActiveIndex((nextIndex + images.length) % images.length)
  }

  const handlePointerDown = (event) => {
    dragStartX.current = event.clientX
    event.currentTarget.setPointerCapture?.(event.pointerId)
  }

  const handlePointerUp = (event) => {
    if (dragStartX.current === null) return
    const distance = event.clientX - dragStartX.current
    if (Math.abs(distance) > 36) goTo(activeIndex + (distance < 0 ? 1 : -1))
    dragStartX.current = null
  }

  return (
    <div
      className="project-image-carousel"
      aria-label={`${title}图片轮播，共 ${images.length} 张`}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerCancel={() => { dragStartX.current = null }}
    >
      <div className="project-image-track" style={{ transform: `translateX(-${activeIndex * 100}%)` }}>
        {images.map((source, index) => (
          <figure className="project-image-slide" key={source}>
            <img
              src={source}
              alt={`${title}作品图 ${index + 1}`}
              draggable="false"
              loading={index === 0 ? 'eager' : 'lazy'}
            />
          </figure>
        ))}
      </div>
      <div className="project-carousel-controls" aria-label="图片切换控制">
        <button type="button" className="carousel-button" aria-label="上一张图片" onClick={() => goTo(activeIndex - 1)}>←</button>
        <span>{String(activeIndex + 1).padStart(2, '0')} / {String(images.length).padStart(2, '0')}</span>
        <button type="button" className="carousel-button" aria-label="下一张图片" onClick={() => goTo(activeIndex + 1)}>→</button>
      </div>
    </div>
  )
}

// Stable positions avoid a different composition on every React render.
const openingDust = Array.from({ length: 112 }, (_, i) => {
  const angle = i * 2.39996
  const radius = 12 + (i % 19) * 1.8
  return {
    left: 50 + Math.cos(angle) * radius,
    top: 50 + Math.sin(angle) * radius,
    size: i % 13 === 0 ? 8 : 2 + (i % 3),
    angle,
  }
})

function App() {
  const sceneTransitionRef = useRef(null)
  const motionRef = useRef({ speed: 0.015 })
  const [menuOpen, setMenuOpen] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const [scenesReady, setScenesReady] = useState(false)
  const scenesReadyRef = useRef(false)
  const switchScene = (next) => {
    if (!scenesReadyRef.current || next === showProfile || sceneTransitionRef.current?.isActive()) return
    const root = appRef.current
    const source = root.querySelector(showProfile ? '.profile-name' : '.hero-system strong')
    const target = root.querySelector(next ? '.profile-name' : '.hero-system strong')
    if (source.getBoundingClientRect().width > 0 && target.getBoundingClientRect().width > 0 && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      const from = source.getBoundingClientRect()
      const to = target.getBoundingClientRect()
      const style = window.getComputedStyle(source)
      const traveller = root.querySelector('.name-traveller')
      gsap.set(traveller, { left: from.left, top: from.top, width: from.width, height: from.height,
        fontFamily: style.fontFamily, fontSize: style.fontSize, fontWeight: style.fontWeight,
        letterSpacing: style.letterSpacing, lineHeight: style.lineHeight, color: style.color,
        x: 0, y: 0, scale: 1, autoAlpha: 1 })
      gsap.set([source, target], { visibility: 'hidden' })
      sceneTransitionRef.current = gsap.timeline({ onComplete: () => {
        gsap.set(traveller, { autoAlpha: 0 })
        gsap.set([source, target], { clearProps: 'visibility' })
      } })
        .to(traveller, { x: to.left - from.left, y: to.top - from.top,
          scale: to.width / from.width, duration: 1.2, ease: 'power3.inOut' })
    }
    setShowProfile(next)
    window.history.replaceState(null, '', next ? '#profile' : '#top')
  }
  const handleSceneClick = (event) => {
    if (event.target.closest('a, button, header') || window.getSelection()?.toString()) return
    switchScene(!showProfile)
  }
  const appRef = useRef(null)

  useEffect(() => {
    const closeMenu = () => {
      setMenuOpen(false)
      if (!scenesReadyRef.current) return
      if (window.location.hash === '#profile') switchScene(true)
      if (window.location.hash === '#top') switchScene(false)
    }
    window.addEventListener('hashchange', closeMenu)
    return () => window.removeEventListener('hashchange', closeMenu)
  }, [showProfile])


  useLayoutEffect(() => {
    const root = appRef.current
    if (!root) return undefined
    // A refresh of the shared scene starts at its opening, not an old profile anchor.
    if (['', '#top', '#profile'].includes(window.location.hash)) {
      window.history.replaceState(null, '', '#top')
      window.scrollTo({ top: 0, behavior: 'instant' })
    }
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      scenesReadyRef.current = true
      setScenesReady(true)
      motionRef.current.speed = 0
      return undefined
    }

    const context = gsap.context(() => {
      const opening = gsap.timeline({ defaults: { ease: 'power4.out' } })
      opening
        .fromTo('.veil-core', { scale: .85, opacity: .85 },
          { scale: 1.15, opacity: 1, duration: .5, ease: 'sine.out' }, 0)
        .to('.veil-core', { scale: .55, duration: .7, ease: 'power2.in' }, .5)
        .fromTo('.veil-halo', { scale: .8, opacity: .6 },
          { scale: 1.2, opacity: 1, duration: .5, ease: 'sine.out' }, 0)
        .to('.veil-halo', { scale: .65, opacity: .7, duration: .7, ease: 'power2.in' }, .5)
        .fromTo('.veil-dust i', { opacity: .65, x: 0, y: 0 },
          { opacity: 1, x: (i) => Math.sin(openingDust[i].angle) * 32,
            y: (i) => -Math.cos(openingDust[i].angle) * 24,
            duration: .5, ease: 'sine.inOut' }, 0)
        .to('.veil-dust i', {
          x: (i) => (50 - openingDust[i].left) / 100 * window.innerWidth + Math.cos(openingDust[i].angle + .8) * 30,
          y: (i) => (50 - openingDust[i].top) / 100 * window.innerHeight + Math.sin(openingDust[i].angle + .8) * 22,
          scale: .65, duration: .7, ease: 'power3.in' }, .5)
        .to('.veil-core', { scaleX: () => window.innerWidth / 72, scaleY: .055,
          duration: .55, ease: 'expo.inOut' }, 1.2)
        .to('.veil-halo', { scaleX: 5, scaleY: .32, duration: .55, ease: 'expo.inOut' }, 1.2)
        .to('.veil-half-top', { yPercent: -101, duration: .95, ease: 'power3.inOut' }, 1.75)
        .to('.veil-half-bottom', { yPercent: 101, duration: .95, ease: 'power3.inOut' }, 1.75)
        .to('.veil-core', { scaleY: 3, opacity: 0, duration: .8, ease: 'power2.out' }, 1.75)
        .to('.veil-halo', { scaleY: 2, opacity: 0, duration: .9, ease: 'power2.out' }, 1.75)
        .to('.veil-dust i', {
          x: (i) => (50 - openingDust[i].left) / 100 * window.innerWidth + (Math.cos(openingDust[i].angle) < 0 ? -1 : 1) * window.innerWidth * (.2 + (i % 11) * .037),
          y: (i) => (50 - openingDust[i].top) / 100 * window.innerHeight + Math.sin(openingDust[i].angle) * window.innerHeight * .32,
          scaleX: (i) => i % 4 === 0 ? 4 : 1, scaleY: 1, duration: 1.3, ease: 'power3.out' }, 1.2)
        .to('.veil-dust i', { opacity: 0, duration: .55, stagger: { amount: .15 }, ease: 'sine.in' }, 2)
        .set('.opening-veil', { autoAlpha: 0 }, 2.8)
        .from('.pixel-hero-media .pixel-blast-container', { duration: .8, opacity: 0, ease: 'sine.inOut' }, 2.2)
        .to(motionRef.current, { speed: .22, duration: .8, ease: 'sine.inOut' }, 2.2)
        .from('.hero-system strong', { duration: 1.35, yPercent: 55, scaleX: .75, clipPath: 'inset(0 100% 0 0)', transformOrigin: 'left bottom', ease: 'expo.out' }, 2.15)
        .from('.glass-header', { duration: .6, autoAlpha: 0 }, 2.4)
        .from('.hero-headline .headline-idea > i, .hero-headline .headline-real > i, .hero-headline em > i', {
          duration: 1.5,
          yPercent: 105,
          scaleX: .76,
          rotation: 3,
          transformOrigin: 'left bottom',
          stagger: .16,
          ease: 'expo.out',
        }, 2.24)
        .from('.hero-index, .hero-system > span', { duration: .6, autoAlpha: 0 }, 2.4)
        .from('.hero-actions > *', { duration: .5, y: 5, autoAlpha: 0, stagger: .05 }, 2.45)
        .from('.hero-meta', { duration: .5, autoAlpha: 0 }, 2.5)
        .call(() => {
          scenesReadyRef.current = true
          setScenesReady(true)
          if (['', '#top', '#profile'].includes(window.location.hash)) window.history.replaceState(null, '', '#top')
        }, [], 4.1)


      const sectionTimelines = new Map()
      gsap.utils.toArray('.motion-section').forEach((section) => {
        if (section.id === 'profile') return
        const word = section.querySelector('.motion-word > span')
        const content = section.querySelectorAll('.work-heading, .strengths-top, .contact-main > *, .contact-footer > *')
        const timeline = gsap.timeline({
          defaults: { ease: 'expo.out' },
          scrollTrigger: { trigger: section, start: 'top 78%', once: true },
        })

        sectionTimelines.set(section, timeline)
        if (word) timeline.from(word, { duration: 1.85, yPercent: 110, scaleX: .64, rotation: 4, transformOrigin: 'left bottom', clipPath: 'inset(0 100% 0 0)' }, 0)
        if (content.length) timeline.from(content, { duration: 1.3, y: 58, clipPath: 'inset(0 0 100% 0)', stagger: .16 }, .8)
      })

      gsap.utils.toArray('.project-card').forEach((card, index) => {
        const media = card.querySelector('.project-media-frame')
        const surface = card.querySelector('.project-media-surface')
        const info = card.querySelector('.project-info')
        const reveal = gsap.timeline({
          defaults: { ease: 'expo.out' },
          paused: true,
        })
        reveal
          .fromTo(card, { y: 80 }, { duration: 1.6, y: 0 }, 0)
          .fromTo(media, { clipPath: 'inset(0 0 100% 0)' }, { duration: 1.8, clipPath: 'inset(0 0 0% 0)' }, .08)
          .from(info, { duration: 1.2, y: 35, autoAlpha: 0 }, .6)
        ScrollTrigger.create({ trigger: card, start: 'top 86%', once: true, onEnter: () => {
          const title = sectionTimelines.get(card.closest('.motion-section'))
          reveal.delay(Math.max(0, 1 - (title?.time() || 0)) + (index > 0 ? (index - 1) % 2 * .2 : 0)).play()
        } })
        if (window.matchMedia('(min-width: 900px) and (pointer: fine)').matches) {
          gsap.fromTo(surface, { yPercent: -2.5 }, { yPercent: 2.5, ease: 'none',
            scrollTrigger: { trigger: media, start: 'top bottom', end: 'bottom top', scrub: 1.2 } })
        }

      })

      const capabilityReveal = gsap.from('.strength-card', {
          paused: true,
          y: 90,
          scaleY: .88,
          transformOrigin: 'center bottom',
          autoAlpha: 0,
          duration: 1.5,
          stagger: .18,
          ease: 'expo.out',
        })
      ScrollTrigger.create({ trigger: '.strengths-grid', start: 'top 88%', once: true, onEnter: () => {
        const title = sectionTimelines.get(root.querySelector('.strengths'))
        capabilityReveal.delay(Math.max(0, 1 - (title?.time() || 0))).play()
      } })
    }, root)

    return () => { context.revert(); sceneTransitionRef.current?.kill() }
  }, [])

  const menuItems = [
    ['优势', '#profile'],
    ['作品', '#work'],
  ]

  return (
    <main ref={appRef}>
      <StudioCursor />
      <div className="opening-veil" aria-hidden="true">
        <div className="veil-half veil-half-top" />
        <div className="veil-half veil-half-bottom" />
        <div className="veil-halo" />
        <div className="veil-core" />
        <div className="veil-dust">
          {openingDust.map((particle, index) => <i key={index} style={{ left: `${particle.left}%`, top: `${particle.top}%`, width: particle.size, height: particle.size }} />)}
        </div>
      </div>
      <span className="name-traveller" aria-hidden="true">李子昱</span>
      <section className={`hero scene-hero ${showProfile ? 'show-profile' : ''}`} id="top" onClick={handleSceneClick}>
        <div className="hero-media pixel-hero-media" aria-hidden="true">
          <PixelBlast variant="circle" pixelSize={6} color="#7a858b" patternScale={3}
            patternDensity={0.7} pixelSizeJitter={0.3} enableRipples rippleSpeed={0.25}
            rippleThickness={0.08} rippleIntensityScale={0.35} liquid liquidStrength={0.035}
            liquidRadius={1.2} liquidWobbleSpeed={2} speed={0.22} motionRef={motionRef} edgeFade={0.3} transparent />
        </div>

        <div className="hero-shell shell">
          <header className="glass-header">
          <nav className="nav" aria-label="主导航">
            <a className="brand" href="#top" aria-label="返回顶部" onClick={() => switchScene(false)}>
              <span className="brand-dot" />
              LI ZIYU<span className="brand-slash">/</span>
            </a>
            <button
              className="menu-toggle"
              type="button"
              aria-expanded={menuOpen}
              aria-controls="site-menu"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              MENU <span className="menu-lines"><i /><i /></span>
            </button>
            <div className={`nav-links ${menuOpen ? 'is-open' : ''}`} id="site-menu">
              {menuItems.map(([label, href]) => (
                <a key={href} href={href} onClick={(event) => { setMenuOpen(false); if (href === '#profile') { event.preventDefault(); switchScene(true) } }}>{label}</a>
              ))}
              <a className="nav-contact" href="#contact" onClick={() => setMenuOpen(false)}>
                联系我 <ArrowUpRight />
              </a>
            </div>
          </nav>

            <div className="hero-content-head">
              <p className="hero-kicker">LZY / 3D MOTION DESIGNER</p>
              <span className="hero-status"><i /> AVAILABLE FOR SELECTED PROJECTS</span>
            </div>
          </header>
          <div className="scene-stage">
          <div className="hero-content scene-panel scene-intro" aria-hidden={showProfile} inert={showProfile}>
            <div className="hero-editorial">
              <div className="hero-title-side">
                <div className="hero-primary-message">
                  <p className="hero-index">01 / 个人作品集</p>
                  <h1 className="hero-headline">
                    <span className="headline-idea"><i>让想法</i></span>
                    <span className="headline-real"><i>真正</i></span>
                    <em><i>动起来。</i></em>
                  </h1>
                  <div className="hero-actions">
                    <a href="#work" className="hero-button hero-button-primary">查看精选作品 <ArrowUpRight /></a>
                    <button type="button" onClick={() => switchScene(true)} className="hero-button hero-button-secondary">了解我的优势</button>
                  </div>
                </div>
                <div className="hero-system" aria-hidden="true">
                  <span className="system-code">MOTION / 3D / VISUAL</span>
                  <strong>李子昱</strong>
                  <span className="system-rule" />
                  <span className="system-caption">IDEA INTO<br />MOTION</span>
                </div>
              </div>
            </div>
          </div>

<section className="profile scene-panel scene-profile" id="profile" aria-hidden={!showProfile} inert={!showProfile}>
        <div className="scene-profile-inner">
          <div className="section-heading">
            <p className="section-index">( 01 )</p>
            <p className="section-label">EXPERIENCE / PROFILE</p>
          </div>
          <div className="profile-grid profile-simple">
            <div className="profile-copy">
              <p className="profile-kicker"><span className="profile-name">李子昱</span> / 三维动画设计师</p>
              <h2><span className="experience-years"><b>7</b> 年</span>动态设计经验</h2>
              <p className="profile-lead">具备 7 年三维动画与动态设计经验，熟悉商业项目从创意策划、分镜设计到制作交付的完整流程。擅长以 Cinema 4D 建模、动画与渲染，结合后期合成和剪辑，让想法高效落地。</p>
              <div className="profile-details">
                <div>
                  <span>FOCUS</span>
                  <strong>3D / MOTION / CGI</strong>
                </div>
                <div>
                  <span>WORKFLOW</span>
                  <strong>C4D / AE / PR / AICG</strong>
                </div>
                <div>
                  <span>DELIVERY</span>
                  <strong>CONCEPT TO FINAL</strong>
                </div>
              </div>
              <a href="#contact" className="text-link">发起合作 <ArrowUpRight /></a>
            </div>
          </div>
        </div>
      </section>
          </div>
          <div className="hero-meta">
            <button type="button" className="scene-switch" disabled={!scenesReady} onClick={() => switchScene(!showProfile)} aria-label={!scenesReady ? '正在播放入场动画' : showProfile ? '切换到首页' : '切换到个人介绍'}>
              <span className={!showProfile ? 'active' : ''}>01</span><i /><span className={showProfile ? 'active' : ''}>02</span>
              {!scenesReady ? (showProfile ? '正在展示 · 个人介绍' : '正在展示 · 首页') : showProfile ? '点击画面 · 返回首页' : '点击画面 · 了解我'} <span aria-hidden="true">↔</span>
            </button>
            <span>SHENZHEN / CHINA</span>
            <span className="scroll-cue"><i /> 2026 PORTFOLIO</span>
          </div>
        </div>
      </section>


      <section className="work section motion-section" id="work">
        <div className="shell">
          <p className="motion-word" aria-hidden="true"><span>SELECTED WORK</span></p>
          <div className="work-heading work-heading-clean">
            <span className="section-index">02</span>
            <h2 className="work-title">精选作品</h2>
          </div>

          <div className="project-grid">
            {projects.map((project) => (
              <article className={`project-card ${project.size}`} key={project.number}>
                <div className="project-media-frame">
                <div className="project-media-surface">
                {project.images ? (
                    <ProjectImageCarousel images={project.images} title={project.title} />
                ) : project.video ? (
                    <ProjectVideo source={project.video} title={project.title} />
                ) : <ProjectArtwork className={project.className} number={project.number} />}
                </div>
                </div>
                <div className="project-info">
                  <span className="project-number">{project.number}</span>
                  <div>
                    <p className="project-type">{project.type}</p>
                    <h3>{project.title}</h3>
                    <p className="project-description">{project.description}</p>
                    {project.video && <ProjectPlayer source={project.video} title={project.title} />}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="strengths section motion-section">
        <div className="shell">
          <p className="motion-word" aria-hidden="true"><span>CORE</span></p>
          <div className="strengths-top">
            <div className="section-heading section-heading-dark">
              <p className="section-index">( 03 )</p>
              <p className="section-label">CORE STRENGTHS</p>
            </div>
            <h2>MAKE IT<br /><em>MOVE.</em></h2>
          </div>
          <div className="strengths-grid">
            {strengths.map((strength) => (
              <article className="strength-card" key={strength.index}>
                <div className="strength-card-top"><span>{strength.index}</span><Plus /></div>
                <h3>{strength.title}</h3>
                <p>{strength.text}</p>
                <span className="strength-line" />
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="contact motion-section" id="contact">
        <div className="contact-grid" aria-hidden="true"><span /><span /><span /><span /><span /><span /></div>
        <div className="shell contact-shell">
          <div className="contact-top">
            <span>04 / CONTACT</span>
            <span>AVAILABLE FOR SELECTED PROJECTS</span>
          </div>
          <p className="motion-word" aria-hidden="true"><span>CONTACT</span></p>
          <div className="contact-main">
            <p>有新的画面，<br />就让它动起来。</p>
            <a className="contact-circle" href="mailto:517504148@qq.com" aria-label="发送邮件联系李子昱">
              <span>START A<br />CONVERSATION</span>
              <ArrowUpRight />
            </a>
          </div>
          <div className="contact-footer">
            <div><span>EMAIL</span><strong>517504148@qq.com</strong></div>
            <div><span>WECHAT</span><strong>517504148</strong></div>
            <div><span>PHONE</span><strong>151 1977 5732</strong></div>
            <a href="#top" className="back-top">BACK TO TOP <ArrowUpRight /></a>
          </div>
        </div>
      </section>
    </main>
  )
}

createRoot(document.getElementById('root')).render(<App />)
