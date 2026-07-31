import './style.css'
import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision'

const app = document.querySelector('#app')
let stopCurrentPage = () => {}

const LEFT_EYE = [33, 133, 159, 145, 160, 144, 158, 153]
const RIGHT_EYE = [362, 263, 386, 374, 385, 380, 387, 373]

const routes = {
  home: {
    label: 'Studio',
    eyebrow: 'STUDIO JASPER DE LANGEN / AMERSFOORT',
    title: 'Beeld. Ruis. Waarneming.',
    body:
      'Studio Jasper de Langen werkt op het snijvlak van beeld, technologie en menselijk gedrag.',
    landing: true
  },
  over: {
    label: 'Over Jasper',
    eyebrow: 'OVER / STUDIO',
    title: 'Jasper de Langen.',
    body:
      'De studio is een werkplaats voor fotografie, video, installaties, interactieve werken en experimenten.',
    next: 'home',
    nextLabel: 'Terug naar de studio'
  },
  panoptica: {
    label: 'Panoptica',
    eyebrow: 'INTERACTIEVE KUNSTINSTALLATIE',
    title: 'Kunst>Kijkt<Terug',
    body:
      'Panoptica gaat over surveillance, camera’s, AI, observeren en bekeken worden. Wie kijkt er eigenlijk naar wie?',
    next: 'proeftuin',
    nextLabel: 'Open de Proeftuin'
  },
  proeftuin: {
    label: 'Proeftuin',
    eyebrow: 'PANOPTICA / LIVE LAB',
    title: 'De installatie blijft leren.',
    body:
      'In de Panoptica Proeftuin worden technieken, beelden en interacties getest voordat ze onderdeel worden van de installatie.',
    next: 'experimenten',
    nextLabel: 'Bekijk experimenten'
  },
  experimenten: {
    label: 'Experimenten',
    eyebrow: 'PANOPTICA / PROTOTYPE ARCHIVE',
    title: 'Testen onder observatie.',
    body:
      'Open een proefopstelling. Sommige experimenten gebruiken je camera of microfoon en vragen daarvoor eerst toestemming.',
    experiments: true
  }
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}

function currentRoute() {
  return window.location.hash.replace(/^#\/?/, '') || 'home'
}

function navigation(active) {
  return `
    <header class="site-header">
      <a class="wordmark" href="#/home" aria-label="Studio Jasper de Langen — home">
        <span>STUDIO JASPER</span><span>DE LANGEN</span>
      </a>
      <button class="menu-toggle" type="button" aria-expanded="false" aria-controls="site-menu">
        <span>MENU</span><span class="menu-symbol">+</span>
      </button>
      <nav class="site-menu" id="site-menu" aria-label="Hoofdnavigatie">
        ${Object.entries(routes)
          .map(
            ([key, route], index) => `
              <a href="#/${key}" class="${active === key ? 'active' : ''}">
                <span>0${index + 1}</span>${escapeHtml(route.label)}
              </a>`
          )
          .join('')}
      </nav>
    </header>`
}

function experimentGrid() {
  const experiments = [
    ['face-tracking', '01', 'Face Tracking', 'ACTIEF'],
    ['object-detection', '02', 'Object Detection', 'ARCHIEF'],
    ['camera-wall', '03', 'Camera Wall', 'ARCHIEF'],
    ['sound-lab', '04', 'Sound Lab', 'ARCHIEF'],
    ['prototype-archive', '05', 'Prototype Archive', 'OPEN']
  ]

  return `
    <div class="experiment-grid">
      ${experiments
        .map(
          ([href, number, title, status]) => `
            <a class="experiment-card" href="#/${href}">
              <span>${number}</span>
              <strong>${title}</strong>
              <small>${status} ↗</small>
            </a>`
        )
        .join('')}
    </div>`
}

function studioRoutes() {
  return `
    <div class="studio-routes" aria-label="Ga verder">
      <a class="studio-route" href="#/over">
        <span>01 / STUDIO</span>
        <strong>Over Jasper</strong>
        <small>Werk en maker <b aria-hidden="true">→</b></small>
      </a>
      <a class="studio-route" href="#/panoptica">
        <span>02 / PROJECT</span>
        <strong>Panoptica</strong>
        <small>Kunst&gt;Kijkt&lt;Terug <b aria-hidden="true">→</b></small>
      </a>
    </div>`
}

function standardPage(key) {
  const route = routes[key]
  app.innerHTML = `
    <div class="site-shell">
      <video class="noise-video" autoplay muted loop playsinline aria-hidden="true">
        <source src="./noise-background.mp4" type="video/mp4">
      </video>
      ${navigation(key)}
      <main class="page">
        <div class="signal" aria-hidden="true"><span></span><span></span><span></span></div>
        <section class="hero" aria-labelledby="page-title">
          <p class="eyebrow">${escapeHtml(route.eyebrow)}</p>
          <h1 id="page-title">${escapeHtml(route.title)}</h1>
          <p class="intro">${escapeHtml(route.body)}</p>
          ${
            route.experiments
              ? experimentGrid()
              : route.landing
                ? studioRoutes()
                : `<a class="primary-link" href="#/${route.next}">
                  <span>${escapeHtml(route.nextLabel)}</span><span aria-hidden="true">→</span>
                </a>`
          }
        </section>
        <footer class="page-footer">
          <span>© STUDIO JASPER DE LANGEN</span>
          <span class="live-indicator"><i></i>SIGNAL ACTIVE</span>
        </footer>
      </main>
    </div>`

  activateMenu()
}

function placeholderPage(title) {
  app.innerHTML = `
    <div class="site-shell">
      <video class="noise-video" autoplay muted loop playsinline aria-hidden="true">
        <source src="./noise-background.mp4" type="video/mp4">
      </video>
      ${navigation('experimenten')}
      <main class="page">
        <section class="hero compact" aria-labelledby="page-title">
          <p class="eyebrow">PANOPTICA / EXPERIMENT</p>
          <h1 id="page-title">${title}</h1>
          <p class="intro">Dit experiment wordt aan het archief toegevoegd. De route en navigatie werken al.</p>
          <a class="primary-link" href="#/experimenten">
            <span>Terug naar experimenten</span><span aria-hidden="true">←</span>
          </a>
        </section>
      </main>
    </div>`

  activateMenu()
}

function activateMenu() {
  const button = document.querySelector('.menu-toggle')
  const menu = document.querySelector('.site-menu')
  if (!button || !menu) return

  button.addEventListener('click', () => {
    const open = button.getAttribute('aria-expanded') === 'true'
    button.setAttribute('aria-expanded', String(!open))
    menu.classList.toggle('open', !open)
    button.querySelector('.menu-symbol').textContent = open ? '+' : '×'
  })
}

async function faceTrackingPage() {
  app.innerHTML = `
    <main class="tracker">
      <video id="video" autoplay muted playsinline></video>
      <canvas id="canvas"></canvas>
      <a class="tracker-back" href="#/experimenten">← EXPERIMENTEN</a>
      <div id="status">INITIALIZING</div>
      <div id="bottom">PANOPTICA LAB / FACE TRACKING</div>
    </main>`

  const video = document.getElementById('video')
  const canvas = document.getElementById('canvas')
  const ctx = canvas.getContext('2d')
  const statusEl = document.getElementById('status')
  let width = 0
  let height = 0
  let faceLandmarker = null
  let lastVideoTime = -1
  let modeText = 'INITIALIZING'
  let frameId = 0
  let stream = null

  function resize() {
    width = window.innerWidth
    height = window.innerHeight
    canvas.width = width
    canvas.height = height
  }
  window.addEventListener('resize', resize)
  resize()

  const setStatus = text => {
    modeText = text
    statusEl.textContent = text
  }

  const statusTimer = window.setInterval(() => {
    const words = ['NO MATCH', 'SEARCHING', 'TRACKING', 'NO MATCH', 'SIGNAL LOST']
    setStatus(words[Math.floor(Math.random() * words.length)])
  }, 4200)

  function eyeBox(landmarks, points) {
    const xs = points.map(index => (1 - landmarks[index].x) * width)
    const ys = points.map(index => landmarks[index].y * height)
    const minX = Math.min(...xs)
    const maxX = Math.max(...xs)
    const minY = Math.min(...ys)
    const maxY = Math.max(...ys)
    return {
      x: minX - 20,
      y: minY - 16,
      w: maxX - minX + 40,
      h: maxY - minY + 32
    }
  }

  function drawBracketBox(box, alpha = 1) {
    const { x, y, w, h } = box
    const length = Math.min(w, h) * 0.38
    ctx.strokeStyle = `rgba(245,245,238,${alpha})`
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(x, y + length)
    ctx.lineTo(x, y)
    ctx.lineTo(x + length, y)
    ctx.moveTo(x + w - length, y)
    ctx.lineTo(x + w, y)
    ctx.lineTo(x + w, y + length)
    ctx.moveTo(x, y + h - length)
    ctx.lineTo(x, y + h)
    ctx.lineTo(x + length, y + h)
    ctx.moveTo(x + w - length, y + h)
    ctx.lineTo(x + w, y + h)
    ctx.lineTo(x + w, y + h - length)
    ctx.stroke()
  }

  function drawSearching() {
    const time = performance.now() * 0.001
    const x = width * 0.5 + Math.cos(time) * 130
    const y = height * 0.45 + Math.sin(time * 0.8) * 80
    drawBracketBox({ x: x - 55, y: y - 20, w: 40, h: 32 }, 0.35)
    drawBracketBox({ x: x + 15, y: y - 20, w: 40, h: 32 }, 0.35)
  }

  function loop() {
    ctx.clearRect(0, 0, width, height)
    if (video.currentTime !== lastVideoTime && faceLandmarker) {
      lastVideoTime = video.currentTime
      const result = faceLandmarker.detectForVideo(video, performance.now())
      if (result.faceLandmarks?.length) {
        const landmarks = result.faceLandmarks[0]
        drawBracketBox(eyeBox(landmarks, LEFT_EYE), 0.92)
        drawBracketBox(eyeBox(landmarks, RIGHT_EYE), 0.92)
        if (modeText === 'SEARCHING') setStatus('NO MATCH')
      } else {
        drawSearching()
        if (modeText !== 'SIGNAL LOST') setStatus('SEARCHING')
      }
    }
    frameId = requestAnimationFrame(loop)
  }

  stopCurrentPage = () => {
    cancelAnimationFrame(frameId)
    clearInterval(statusTimer)
    window.removeEventListener('resize', resize)
    stream?.getTracks().forEach(track => track.stop())
    faceLandmarker?.close()
  }

  try {
    setStatus('REQUESTING INPUT')
    stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false })
    video.srcObject = stream
    await video.play()
    setStatus('LOADING MODEL')
    const vision = await FilesetResolver.forVisionTasks(
      'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.35/wasm'
    )
    faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath:
          'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/latest/face_landmarker.task',
        delegate: 'GPU'
      },
      runningMode: 'VIDEO',
      numFaces: 1
    })
    setStatus('NO MATCH')
    frameId = requestAnimationFrame(loop)
  } catch (error) {
    console.error(error)
    setStatus('NO VISUAL INPUT')
  }
}

function render() {
  stopCurrentPage()
  stopCurrentPage = () => {}
  const route = currentRoute()
  window.scrollTo(0, 0)

  if (routes[route]) {
    standardPage(route)
    return
  }
  if (route === 'face-tracking') {
    faceTrackingPage()
    return
  }

  const titles = {
    'object-detection': 'Object Detection',
    'camera-wall': 'Camera Wall',
    'sound-lab': 'Sound Lab',
    'prototype-archive': 'Prototype Archive'
  }
  placeholderPage(titles[route] || 'SIGNAL NOT FOUND')
}

window.addEventListener('hashchange', render)
render()
