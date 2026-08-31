import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import './styles.css'

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
    video: '/works/tech-packaging.web.mp4?v=20260831',
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

function App() {
  const [menuOpen, setMenuOpen] = useState(false)
  const appRef = useRef(null)

  useEffect(() => {
    const closeMenu = () => setMenuOpen(false)
    window.addEventListener('hashchange', closeMenu)
    return () => window.removeEventListener('hashchange', closeMenu)
  }, [])

  useLayoutEffect(() => {
    const root = appRef.current
    if (!root || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined

    const context = gsap.context(() => {
      const opening = gsap.timeline({ defaults: { ease: 'power4.out' } })
      opening
        .to('.hero-opening-curtain', { duration: 1.45, scaleY: 0, transformOrigin: 'top center', ease: 'expo.inOut' })
        .from('.nav', { duration: 1.05, yPercent: -115, autoAlpha: 0 }, 0.26)
        .from('.hero-content-head', { duration: 1, y: 24, autoAlpha: 0 }, 0.5)
        .from('.hero-headline .headline-idea > i, .hero-headline .headline-real > i, .hero-headline em > i', {
          duration: 1.45,
          yPercent: 118,
          scaleY: 0.62,
          transformOrigin: 'bottom left',
          stagger: 0.15,
          ease: 'expo.out',
        }, 0.63)
        .from('.hero-index', { duration: 0.9, x: -54, autoAlpha: 0 }, 0.84)
        .from('.hero-actions > *', { duration: 0.9, y: 26, autoAlpha: 0, stagger: 0.1 }, 1.12)
        .from('.hero-meta', { duration: 0.9, y: 18, autoAlpha: 0 }, 1.4)

      gsap.utils.toArray('.motion-section').forEach((section) => {
        const word = section.querySelector('.motion-word')
        const heading = section.querySelector('.section-heading')
        const content = section.querySelectorAll('.intro-grid, .profile-grid, .work-heading, .strengths-top, .contact-main')
        const timeline = gsap.timeline({
          defaults: { ease: 'expo.out' },
          scrollTrigger: { trigger: section, start: 'top 74%', once: true },
        })

        if (word) timeline.fromTo(word, { yPercent: 115, scaleX: 0.72, clipPath: 'inset(0 100% 0 0)' }, { duration: 1.55, yPercent: 0, scaleX: 1, clipPath: 'inset(0 0% 0 0)' })
        if (heading) timeline.from(heading, { duration: 0.85, y: 34, autoAlpha: 0 }, '-=1.02')
        if (content.length) timeline.from(content, { duration: 1.05, y: 52, autoAlpha: 0, stagger: 0.12 }, '-=.86')
      })

      gsap.utils.toArray('.project-card').forEach((card, index) => {
        const video = card.querySelector('.project-video')
        const info = card.querySelector('.project-info')
        const reveal = gsap.timeline({
          defaults: { ease: 'expo.out' },
          scrollTrigger: { trigger: card, start: 'top 82%', once: true },
        })
        reveal
          .fromTo(card, { y: 105, autoAlpha: 0 }, { duration: 1.25, y: 0, autoAlpha: 1, delay: index === 0 ? 0.05 : 0 })
          .fromTo(video, { clipPath: 'inset(0 0 100% 0)', scale: 1.2 }, { duration: 1.5, clipPath: 'inset(0 0 0% 0)', scale: 1.07 }, '-=1.03')
          .from(info, { duration: 0.9, y: 58, autoAlpha: 0 }, '-=.78')

        if (video) {
          gsap.to(video, {
            yPercent: -7,
            ease: 'none',
            scrollTrigger: { trigger: card, start: 'top bottom', end: 'bottom top', scrub: 1.4 },
          })
        }
      })

      gsap.from('.strength-card', {
          y: 70,
          clipPath: 'inset(0 0 100% 0)',
          duration: 1.05,
          stagger: 0.08,
          ease: 'expo.out',
          scrollTrigger: { trigger: '.strengths-grid', start: 'top 76%', once: true },
        })
    }, root)

    return () => context.revert()
  }, [])

  const menuItems = [
    ['优势', '#profile'],
    ['作品', '#work'],
  ]

  return (
    <main ref={appRef}>
      <section className="hero" id="top">
        <div className="hero-media" aria-hidden="true">
          <div className="hero-fallback" />
          <div className="hero-noise" />
        </div>
        <div className="hero-opening-curtain" aria-hidden="true" />

        <div className="hero-shell shell">
          <nav className="nav" aria-label="主导航">
            <a className="brand" href="#top" aria-label="返回顶部">
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
                <a key={href} href={href} onClick={() => setMenuOpen(false)}>{label}</a>
              ))}
              <a className="nav-contact" href="#contact" onClick={() => setMenuOpen(false)}>
                联系我 <ArrowUpRight />
              </a>
            </div>
          </nav>

          <div className="hero-content">
            <div className="hero-content-head">
              <p className="hero-kicker">LZY / 3D MOTION DESIGNER</p>
              <span className="hero-status"><i /> AVAILABLE FOR SELECTED PROJECTS</span>
            </div>
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
                    <a href="#profile" className="hero-button hero-button-secondary">了解我的优势</a>
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

          <div className="hero-meta" aria-hidden="true">
            <span>SCROLL TO EXPLORE</span>
            <span>SHENZHEN / CHINA</span>
            <span className="scroll-cue"><i /> 2026 PORTFOLIO</span>
          </div>
        </div>
      </section>

      <section className="profile section motion-section" id="profile">
        <div className="shell">
          <div className="section-heading">
            <p className="section-index">( 01 )</p>
            <p className="section-label">EXPERIENCE / PROFILE</p>
          </div>
          <p className="motion-word" aria-hidden="true">EXPERIENCE</p>
          <div className="profile-grid profile-simple">
            <div className="profile-copy">
              <p className="profile-kicker">李子昱 / 三维动画设计师</p>
              <h2><b>7</b> 年<br />动态设计经验</h2>
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
            <aside className="profile-statement">
              <span>01 / DESIGN APPROACH</span>
              <p>让画面<br /><em>拥有动势。</em></p>
              <small>不止完成一段动画，更为品牌找到一种能够被看见、被记住的动态表达。</small>
            </aside>
          </div>
        </div>
      </section>

      <section className="work section motion-section" id="work">
        <div className="shell">
          <div className="work-heading">
            <div className="section-heading">
              <p className="section-index">( 02 )</p>
              <p className="section-label">SELECTED WORK</p>
            </div>
          </div>
          <p className="motion-word" aria-hidden="true">SELECTED<br />WORK</p>

          <div className="project-grid">
            {projects.map((project) => (
              <article className={`project-card ${project.size}`} key={project.number}>
                {project.images ? (
                  <>
                    <ProjectImageCarousel images={project.images} title={project.title} />
                    <div className="project-video-overlay" aria-hidden="true">
                      <span className="video-label">LZY / {project.number}</span>
                      <span className="video-corner video-corner-a" />
                      <span className="video-corner video-corner-b" />
                    </div>
                  </>
                ) : project.video ? (
                  <>
                    <ProjectVideo source={project.video} title={project.title} />
                    <div className="project-video-overlay" aria-hidden="true">
                      <span className="video-label">LZY / {project.number}</span>
                      <span className="video-corner video-corner-a" />
                      <span className="video-corner video-corner-b" />
                    </div>
                  </>
                ) : <ProjectArtwork className={project.className} number={project.number} />}
                <div className="project-info">
                  <span className="project-number">{project.number}</span>
                  <div>
                    <p className="project-type">{project.type}</p>
                    <h3>{project.title}</h3>
                    <p className="project-description">{project.description}</p>
                  </div>
                  <button className="project-open" type="button" aria-label={`查看${project.title}项目详情`}>
                    <ArrowUpRight />
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="strengths section motion-section">
        <div className="shell">
          <div className="strengths-top">
            <div className="section-heading section-heading-dark">
              <p className="section-index">( 03 )</p>
              <p className="section-label">CORE STRENGTHS</p>
            </div>
            <h2>MAKE IT<br /><em>MOVE.</em></h2>
          </div>
          <p className="motion-word" aria-hidden="true">CORE</p>
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
          <p className="motion-word" aria-hidden="true">CONTACT</p>
          <div className="contact-main">
            <p>有新的画面，<br />就让它<span>动</span>起来。</p>
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
