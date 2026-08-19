import './style.css'
import { FaceDetector, FaceLandmarker, FilesetResolver, ObjectDetector } from '@mediapipe/tasks-vision'

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
    nextLabel: 'Bekijk experimenten',
    vision: true
  },
  experimenten: {
    label: 'Experimenten',
    eyebrow: 'PANOPTICA / PROTOTYPE ARCHIVE',
    title: 'Testen onder observatie.',
    body:
      'Open een proefopstelling. Sommige experimenten gebruiken je camera of microfoon en vragen daarvoor eerst toestemming.',
    experiments: true
  },
  schilderkunst: {
    label: 'Schilderkunst'
  },
  nieuws: {
    label: 'Nieuws'
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
  const hashRoute = window.location.hash.replace(/^#\/?/, '')
  if (hashRoute) return hashRoute

  const pathRoute = window.location.pathname.split('/').filter(Boolean).pop()
  return pathRoute || 'home'
}

function routeHref(key) {
  return key === 'home' ? '/' : `/${key}/`
}

function navigation(active) {
  return `
    <header class="site-header">
      <a class="wordmark" href="/" aria-label="Studio Jasper de Langen — home">
        <span>STUDIO JASPER</span><span>DE LANGEN</span>
      </a>
      <button class="menu-toggle" type="button" aria-expanded="false" aria-controls="site-menu">
        <span>MENU</span><span class="menu-symbol">+</span>
      </button>
      <nav class="site-menu" id="site-menu" aria-label="Hoofdnavigatie">
        ${Object.entries(routes)
          .map(
            ([key, route], index) => `
              <a href="${routeHref(key)}" class="${active === key ? 'active' : ''}">
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
      <a class="studio-route" href="/over/">
        <span>01 / STUDIO</span>
        <strong>Over Jasper</strong>
        <small>Werk en maker <b aria-hidden="true">→</b></small>
      </a>
      <a class="studio-route" href="/panoptica/">
        <span>02 / PROJECT</span>
        <strong>Panoptica</strong>
        <small>Kunst&gt;Kijkt&lt;Terug <b aria-hidden="true">→</b></small>
      </a>
    </div>`
}

function visionRoute() {
  return `
    <aside class="camera-privacy" aria-labelledby="camera-privacy-title">
      <span>PRIVACY / CAMERA</span>
      <strong id="camera-privacy-title">Niemand kan je zien.</strong>
      <p>Je camerabeeld wordt niet opgenomen, niet gestreamd en niet opgeslagen. De verwerking gebeurt alleen lokaal in je browser. Niemand kijkt mee — ook de maker niet. Alleen jij ziet jezelf op je eigen scherm.</p>
    </aside>
    <div class="proeftuin-route">
      <div>
        <span>02 / LIVE EXPERIMENT</span>
        <strong>Proeftuin 2 — Vallende brackets</strong>
        <p>Een interactief werk waarin herkenning losraakt, blijft hangen en uit beeld valt.</p>
      </div>
      <a href="https://studio-jasper-de-langen-portfolio.frf9yr92fq.chatgpt.site/proeftuin-2/">OPEN PROEFTUIN 2 <b aria-hidden="true">→</b></a>
    </div>
    <div class="vision-route">
      <div>
        <span>01 / LIVE EXPERIMENT</span>
        <strong>Panoptica Vision</strong>
        <p>Live objectherkenning maakt van je camera een observatiesysteem. Beeld blijft op je apparaat.</p>
      </div>
      <a href="#/panoptica-vision">OPEN CAMERA <b aria-hidden="true">→</b></a>
    </div>
    <a class="secondary-link" href="/experimenten/">BEKIJK ALLE EXPERIMENTEN →</a>`
}

function bracketRain() {
  const glyphs = ['[', ']', '[', ']', '⌜', '⌝', '⌞', '⌟', '<', '>']

  return `
    <div class="bracket-rain" aria-hidden="true">
      ${Array.from({ length: 38 }, (_, index) => {
        const left = (index * 37) % 101
        const duration = 6 + (index * 11) % 9
        const delay = -((index * 17) % 15)
        const size = 14 + (index * 7) % 27
        const drift = ((index * 13) % 90) - 45
        const opacity = (18 + (index * 9) % 46) / 100
        return `<span style="--left:${left}%;--duration:${duration}s;--delay:${delay}s;--size:${size}px;--drift:${drift}px;--opacity:${opacity}">${glyphs[index % glyphs.length]}</span>`
      }).join('')}
    </div>`
}

function panopticaPage() {
  app.innerHTML = `
    <div class="site-shell story-shell">
      <video class="noise-video" autoplay muted loop playsinline aria-hidden="true">
        <source src="/noise-background.mp4" type="video/mp4">
      </video>
      ${navigation('panoptica')}
      <main class="page story-page">
        <div class="signal" aria-hidden="true"><span></span><span></span><span></span></div>
        <article class="panoptica-story" aria-labelledby="page-title">
          <header class="story-hero">
            <p class="eyebrow">PANOPTICA / INTERACTIEVE KUNSTINSTALLATIE</p>
            <h1 id="page-title">Kunst&gt;Kijkt&lt;Terug</h1>
            <p class="intro">We zijn eraan gewend geraakt bekeken te worden. Panoptica maakt die vaak onzichtbare blik opnieuw voelbaar.</p>
          </header>

          <div class="story-content">
            <section aria-labelledby="wat-is-panoptica">
              <p class="section-index">01 / HET WERK</p>
              <h2 id="wat-is-panoptica">Wat is Panoptica?</h2>
              <div class="story-copy">
                <p>Camera’s hangen in winkels, stations, straten en woningen. Telefoons herkennen gezichten, systemen analyseren gedrag en algoritmen proberen uit beelden af te leiden wie of wat ze voor zich hebben. Veel daarvan gebeurt zo geruisloos dat we het nauwelijks nog als observatie ervaren.</p>
                <p>Panoptica is een interactieve kunstinstallatie van Jasper de Langen en Studio Jasper de Langen waarin de gebruikelijke verhouding tussen kunstwerk en bezoeker wordt omgedraaid. Je staat niet alleen voor een werk om het te bekijken. Het werk neemt ook jou waar.</p>
                <p>Camera’s, beeldschermen, software, geluid en andere elementen vormen samen een omgeving die reageert op aanwezigheid en beweging. Wat er precies gebeurt, wordt bewust niet vooraf uitgelegd. De ervaring begint bij de onzekerheid over wat het systeem ziet, begrijpt, verkeerd begrijpt of met rust laat.</p>
              </div>
            </section>

            <section aria-labelledby="wie-kijkt">
              <p class="section-index">02 / DE VRAAG</p>
              <h2 id="wie-kijkt">Wie kijkt naar wie?</h2>
              <div class="story-copy">
                <p>Panoptica gaat niet alleen over surveillancecamera’s of privacy. Het werk onderzoekt een bredere verandering in onze verhouding tot beelden en technologie.</p>
                <p>Een camera registreert niet langer noodzakelijk alleen een beeld. Computers kunnen beelden classificeren, gezichten en objecten herkennen, patronen zoeken en daar conclusies aan verbinden. Daarmee verandert ook de betekenis van kijken.</p>
                <blockquote>
                  <p>Waarnemen wordt verwerken.<br>Herkennen wordt interpreteren.<br>Kijken kan een vorm van macht worden.</p>
                </blockquote>
                <p>Panoptica brengt die ontwikkeling terug naar een fysieke ruimte waarin de bezoeker er niet alleen over leest, maar er onderdeel van wordt.</p>
              </div>
            </section>

            <section aria-labelledby="geen-demo">
              <p class="section-index">03 / MATERIAAL</p>
              <h2 id="geen-demo">Geen technologiedemonstratie</h2>
              <div class="story-copy">
                <p>De techniek is nadrukkelijk niet het onderwerp op zichzelf. Camera’s, computers en algoritmen zijn het materiaal waarmee Panoptica wordt gebouwd, zoals een schilder verf gebruikt of een fotograaf licht.</p>
                <p>Soms werkt een systeem nauwkeurig. Soms twijfelt het. Soms ziet het iets wat er niet is of verliest het juist iets wat recht voor de camera staat. Ook die fouten zijn interessant.</p>
                <p>Want als machines steeds vaker worden ingezet om mensen en hun gedrag te interpreteren, wordt de vraag niet alleen wat een systeem kan zien, maar ook: <strong>wat denkt het dat het ziet?</strong></p>
              </div>
            </section>

            <section aria-labelledby="ontwikkeling">
              <p class="section-index">04 / PROCES</p>
              <h2 id="ontwikkeling">Een installatie in ontwikkeling</h2>
              <div class="story-copy">
                <p>Panoptica wordt ontwikkeld als een modulair werk. Experimenten met beeld, geluid, camera’s, objectdetectie en interactieve systemen worden samengebracht tot één omgeving.</p>
                <p>Een deel van dat ontwikkelproces is zichtbaar in de <a href="/proeftuin/">Panoptica Proeftuin</a>. Daar worden experimenten en technische onderzoeken getoond zonder de uiteindelijke ervaring van de installatie prijs te geven.</p>
              </div>
              <a class="primary-link" href="/proeftuin/">
                <span>Open de Proeftuin</span><span aria-hidden="true">→</span>
              </a>
            </section>

            <section class="project-summary" aria-labelledby="projectsamenvatting">
              <p class="section-index">05 / VOOR PROGRAMMEURS, CURATOREN, ORGANISATOREN &amp; PERS</p>
              <h2 id="projectsamenvatting">Projectsamenvatting</h2>
              <div class="story-copy">
                <p>Panoptica is een interactieve kunstinstallatie van multidisciplinair kunstenaar Jasper de Langen, ontwikkeld binnen Studio Jasper de Langen. Het werk onderzoekt hoe onze verhouding tot beelden verandert nu camera’s niet alleen registreren, maar computers beelden ook classificeren, interpreteren en er conclusies aan verbinden. In een fysieke omgeving van camera’s, beeldschermen, software, geluid en andere elementen verschuift de bezoeker van toeschouwer naar waargenomen deelnemer. Panoptica benadert surveillance niet als een uitsluitend technisch of privacygericht onderwerp, maar als een culturele en lichamelijke ervaring rond waarneming, interpretatie en macht. De technologie fungeert daarbij als artistiek materiaal, inclusief twijfel, misinterpretatie en systeemfouten. Het modulaire werk is in ontwikkeling en wordt gevoed door experimenten met onder meer objectdetectie, interactie, beeld en geluid. Een selectie van het onderzoeksproces is zichtbaar in de Panoptica Proeftuin, zonder de uiteindelijke installatie-ervaring of haar verrassingen vooraf prijs te geven.</p>
              </div>
            </section>

            <aside class="practical-info" aria-labelledby="praktische-informatie">
              <p class="section-index">06 / PRAKTISCH</p>
              <h2 id="praktische-informatie">Praktische informatie</h2>
              <dl>
                <div><dt>Status</dt><dd>In ontwikkeling</dd></div>
                <div><dt>Maker</dt><dd>Jasper de Langen / Studio Jasper de Langen</dd></div>
                <div><dt>Contact</dt><dd><a href="/over/">Neem contact op met de studio →</a></dd></div>
              </dl>
            </aside>
          </div>
        </article>

        <footer class="page-footer">
          <span>© STUDIO JASPER DE LANGEN</span>
          <span class="live-indicator"><i></i>IN ONTWIKKELING</span>
        </footer>
      </main>
    </div>`

  activateMenu()
}

function overPage() {
  app.innerHTML = `
    <div class="site-shell story-shell">
      <video class="noise-video" autoplay muted loop playsinline aria-hidden="true">
        <source src="/noise-background.mp4" type="video/mp4">
      </video>
      ${navigation('over')}
      <main class="page story-page">
        <div class="signal" aria-hidden="true"><span></span><span></span><span></span></div>
        <article class="panoptica-story" aria-labelledby="page-title">
          <header class="story-hero">
            <p class="eyebrow">OVER / STUDIO JASPER DE LANGEN / AMERSFOORT</p>
            <h1 id="page-title">Jasper de Langen.</h1>
            <p class="intro">Multidisciplinair kunstenaar en componist, werkend op het snijvlak van glas, geluid, licht en technologie.</p>
          </header>

          <div class="story-content">
            <section aria-labelledby="artistieke-praktijk">
              <p class="section-index">01 / ARTISTIEKE PRAKTIJK</p>
              <h2 id="artistieke-praktijk">Kijken en gezien worden</h2>
              <div class="story-copy">
                <p>Jasper de Langen maakt installaties, fotografisch en videowerk, sonische omgevingen en objecten. Zijn praktijk is een voortdurend onderzoek naar kijken en de onvermijdelijkheid van gezien worden.</p>
                <p>In het werk worden de vertrouwde rollen van waarnemer en geobserveerde verstoord. Kunst, technologie en publiek ontmoeten elkaar in ruimtes waarin controle niet vanzelfsprekend is en de positie van de bezoeker kan verschuiven.</p>
                <p>Het doel is niet om sluitende antwoorden te geven, maar om ervaringen te maken die blijven hangen: momenten waarop de grens tussen kunst en dagelijks leven dun wordt.</p>
              </div>
            </section>

            <section aria-labelledby="materiaal-en-geluid">
              <p class="section-index">02 / MATERIAAL &amp; GELUID</p>
              <h2 id="materiaal-en-geluid">Glas, licht en compositie</h2>
              <div class="story-copy">
                <p>Glas werkt in Jaspers praktijk tegelijk als barrière en lens. Het breekt, vervormt en onthult. Licht en schaduw sturen de aandacht en bewegen tussen intimiteit en blootstelling.</p>
                <p>Onder de naam <strong>Jazzpers</strong> maakt Jasper muziek en sonische omgevingen die geen achtergrond vormen, maar actief deelnemen aan het werk. Ritme, herhaling, spanning en imperfectie spiegelen de visuele installaties.</p>
              </div>
            </section>

            <section aria-labelledby="studio">
              <p class="section-index">03 / DE STUDIO</p>
              <h2 id="studio">Werkplaats in Amersfoort</h2>
              <div class="story-copy">
                <p>Studio Jasper de Langen is een werkplaats voor fotografie, video, installaties, interactieve werken, muziek en experiment. Ideeën worden er onderzocht door te bouwen, testen, observeren en opnieuw te beginnen.</p>
                <p>De studio verbindt artistiek onderzoek met technische ontwikkeling. Camera’s, computers, projecties, sensoren en geluid zijn daarbij geen doel op zichzelf, maar materialen waarmee vragen voelbaar kunnen worden gemaakt.</p>
              </div>
            </section>

            <section aria-labelledby="huidig-project">
              <p class="section-index">04 / HUIDIG PROJECT</p>
              <h2 id="huidig-project">Panoptica</h2>
              <div class="story-copy">
                <p>Panoptica is de interactieve kunstinstallatie waarin Jaspers onderzoek naar waarneming, surveillance, beeldtechnologie en macht samenkomt. Het werk draait de verhouding tussen kunstwerk en bezoeker om: de kunst kijkt terug.</p>
              </div>
              <a class="primary-link" href="/panoptica/">
                <span>Lees over Panoptica</span><span aria-hidden="true">→</span>
              </a>
            </section>

            <aside class="practical-info" aria-labelledby="contact">
              <p class="section-index">05 / CONTACT</p>
              <h2 id="contact">Contact en samenwerking</h2>
              <dl>
                <div><dt>Locatie</dt><dd>Amersfoort, Nederland</dd></div>
                <div><dt>Onderwerpen</dt><dd>Presentaties, samenwerkingen en pers</dd></div>
                <div><dt>Contact</dt><dd><a href="https://www.instagram.com/panoptica_art/" target="_blank" rel="noopener noreferrer">Panoptica op Instagram →</a></dd></div>
              </dl>
            </aside>
          </div>
        </article>

        <footer class="page-footer">
          <span>© STUDIO JASPER DE LANGEN</span>
          <span class="live-indicator"><i></i>AMERSFOORT</span>
        </footer>
      </main>
    </div>`

  activateMenu()
}

function paintingChapterPage() {
  app.innerHTML = `
    <div class="site-shell paintings-shell">
      ${navigation('schilderkunst')}
      <main class="paintings-page">
        <header class="paintings-intro">
          <p class="eyebrow">STUDIO JASPER DE LANGEN / HOOFDSTUK</p>
          <h1>Schilderkunst.</h1>
          <p class="intro">Een groeiend hoofdstuk met schilderijen uit de studio. Meer werk volgt.</p>
        </header>

        <section class="paintings-grid" aria-label="Schilderkunst van Jasper de Langen">
          <figure class="painting painting-portrait">
            <img src="/schilderkunst/schilderij-01.webp" alt="Expressief schilderij met het woord Love, figuren, een rood hart en een personage met hoge hoed" width="920" height="1800">
            <figcaption><span>WERK 01</span><span>SCHILDERKUNST</span></figcaption>
          </figure>
          <figure class="painting painting-square">
            <img src="/schilderkunst/schilderij-02.webp" alt="Expressief schilderij in groen, blauw, geel en wit met een centrale figuur onder een boog" width="1800" height="1800" loading="lazy">
            <figcaption><span>WERK 02</span><span>SCHILDERKUNST</span></figcaption>
          </figure>
        </section>

        <footer class="page-footer">
          <span>© STUDIO JASPER DE LANGEN</span>
          <span class="live-indicator"><i></i>COLLECTIE IN ONTWIKKELING</span>
        </footer>
      </main>
    </div>`

  activateMenu()
}

function standardPage(key) {
  const route = routes[key]
  app.innerHTML = `
    <div class="site-shell">
      <video class="noise-video" autoplay muted loop playsinline aria-hidden="true">
        <source src="/noise-background.mp4" type="video/mp4">
      </video>
      ${key === 'proeftuin' ? bracketRain() : ''}
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
                : route.vision
                  ? visionRoute()
                : `<a class="primary-link" href="${routeHref(route.next)}">
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
        <source src="/noise-background.mp4" type="video/mp4">
      </video>
      ${navigation('experimenten')}
      <main class="page">
        <section class="hero compact" aria-labelledby="page-title">
          <p class="eyebrow">PANOPTICA / EXPERIMENT</p>
          <h1 id="page-title">${title}</h1>
          <p class="intro">Dit experiment wordt aan het archief toegevoegd. De route en navigatie werken al.</p>
          <a class="primary-link" href="/experimenten/">
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

let newsPromise

function loadNews() {
  newsPromise ||= fetch('/news-data.json').then(response => {
    if (!response.ok) throw new Error('Nieuwsarchief kon niet worden geladen.')
    return response.json()
  })
  return newsPromise
}

function formatDate(date, options = { day: '2-digit', month: 'long', year: 'numeric' }) {
  return new Intl.DateTimeFormat('nl-NL', options).format(new Date(date))
}

function richText(text) {
  return text
    .split(/\n{2,}/)
    .filter(Boolean)
    .map(paragraph => {
      const content = escapeHtml(paragraph)
        .replace(
          /(https?:\/\/[^\s<]+)/g,
          '<a href="$1" target="_blank" rel="noopener noreferrer">$1 ↗</a>'
        )
        .replaceAll('\n', '<br>')
      return `<p>${content}</p>`
    })
    .join('')
}

function newsMedia(item, detail = false) {
  if (item.type === 'video') {
    return `
      <figure class="news-media ${detail ? 'detail-media' : ''}">
        <video ${detail ? 'controls preload="metadata"' : 'muted playsinline preload="metadata"'} aria-label="${escapeHtml(item.alt)}">
          <source src="${item.src}" type="video/mp4">
        </video>
        ${detail ? '' : '<span class="media-type">VIDEO / PLAY</span>'}
      </figure>`
  }

  return `
    <figure class="news-media ${detail ? 'detail-media' : ''}">
      <img src="${item.src}" alt="${escapeHtml(item.alt)}" loading="lazy" decoding="async">
    </figure>`
}

function newsCard(article, number) {
  const preview = article.text.replace(/https?:\/\/\S+/g, '').trim()
  return `
    <article class="news-card">
      <a href="/nieuws/?bericht=${encodeURIComponent(article.slug)}" aria-label="Lees ${escapeHtml(article.title)}">
        ${article.media[0] ? newsMedia(article.media[0]) : '<div class="news-media text-only"><span>TEXT / SIGNAL</span></div>'}
        <div class="news-card-copy">
          <div class="news-meta"><span>${String(number).padStart(3, '0')}</span><time datetime="${article.date}">${formatDate(article.date)}</time></div>
          <h2>${escapeHtml(article.title)}</h2>
          ${preview ? `<p>${escapeHtml(preview.slice(0, 210))}${preview.length > 210 ? '…' : ''}</p>` : ''}
          <span class="read-link">OPEN BERICHT <b>→</b></span>
        </div>
      </a>
    </article>`
}

function newsArchive(articles) {
  const grouped = new Map()
  articles.forEach(article => {
    const key = formatDate(article.date, { month: 'long', year: 'numeric' })
    if (!grouped.has(key)) grouped.set(key, [])
    grouped.get(key).push(article)
  })

  let number = articles.length
  return [...grouped.entries()]
    .map(([month, items]) => `
      <section class="news-month" aria-labelledby="month-${items[0].timestamp}">
        <div class="month-heading">
          <h2 id="month-${items[0].timestamp}">${escapeHtml(month)}</h2>
          <span>${items.length} BERICHTEN</span>
        </div>
        <div class="news-grid">
          ${items.map(item => newsCard(item, number--)).join('')}
        </div>
      </section>`)
    .join('')
}

function newsArticle(article) {
  document.title = `${article.title} — Studio Jasper de Langen`
  return `
    <article class="news-detail">
      <a class="back-link" href="/nieuws/">← TERUG NAAR ALLE BERICHTEN</a>
      <header>
        <p class="eyebrow">NIEUWS / ${formatDate(article.date).toUpperCase()}</p>
        <h1>${escapeHtml(article.title)}</h1>
      </header>
      ${article.media.length ? `<div class="news-gallery">${article.media.map(item => newsMedia(item, true)).join('')}</div>` : ''}
      <div class="article-copy">${richText(article.text)}</div>
      <a class="back-link bottom" href="/nieuws/">← TERUG NAAR HET ARCHIEF</a>
    </article>`
}

async function newsPage() {
  app.innerHTML = `
    <div class="site-shell news-shell">
      ${navigation('nieuws')}
      <main class="news-page"><p class="news-loading">SIGNAL LOADING…</p></main>
    </div>`
  activateMenu()

  try {
    const { articles } = await loadNews()
    const requestedSlug = new URLSearchParams(window.location.search).get('bericht')
    const article = requestedSlug ? articles.find(item => item.slug === requestedSlug) : null
    const main = document.querySelector('.news-page')

    if (requestedSlug && !article) {
      main.innerHTML = `<section class="news-intro"><p class="eyebrow">NIEUWS / 404</p><h1>Bericht niet gevonden.</h1><a class="primary-link" href="/nieuws/"><span>Terug naar nieuws</span><span>←</span></a></section>`
      return
    }

    if (article) {
      main.innerHTML = newsArticle(article)
      return
    }

    document.title = 'Nieuws — Studio Jasper de Langen'
    main.innerHTML = `
      <section class="news-intro">
        <p class="eyebrow">PANOPTICA / NIEUWSARCHIEF</p>
        <div>
          <h1>Nieuws.</h1>
          <p class="intro"><strong>Dagelijks onder observatie.</strong><br>Nieuws, onderzoek en signalen rond beeld, technologie, surveillance en menselijk gedrag.</p>
        </div>
        <p class="archive-count">${articles.length}<span>BERICHTEN<br>VANUIT DE STUDIO</span></p>
      </section>
      <div class="archive-rule"><span>NIEUW → OUD</span><span>ARCHIEF ACTIEF</span></div>
      ${newsArchive(articles)}
      <footer class="page-footer"><span>© STUDIO JASPER DE LANGEN</span><span class="live-indicator"><i></i>SIGNAL ACTIVE</span></footer>`
  } catch (error) {
    console.error(error)
    document.querySelector('.news-page').innerHTML = `<section class="news-intro"><h1>Signal lost.</h1><p class="intro">Het nieuwsarchief kon niet worden geladen.</p></section>`
  }
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

async function panopticaVisionPage() {
  app.innerHTML = `
    <main class="tracker vision-tracker">
      <video id="vision-video" autoplay muted playsinline></video>
      <canvas id="vision-canvas"></canvas>
      <a class="tracker-back" href="/proeftuin/">← PROEFTUIN</a>
      <div id="status">INITIALIZING</div>
      <div id="bottom">PANOPTICA VISION / KUNST&gt;KIJKT&lt;TERUG</div>
    </main>`

  const video = document.getElementById('vision-video')
  const canvas = document.getElementById('vision-canvas')
  const ctx = canvas.getContext('2d')
  const statusEl = document.getElementById('status')
  let detector = null
  let faceDetector = null
  let stream = null
  let frameId = 0
  let width = 0
  let height = 0
  let lastVideoTime = -1
  let lastFrame = performance.now()
  let smoothFps = 0

  function resize() {
    width = window.innerWidth
    height = window.innerHeight
    canvas.width = width
    canvas.height = height
  }

  function drawCornerBox(box, label, confidence) {
    const length = Math.max(18, Math.min(45, box.w / 5))
    ctx.strokeStyle = '#00ffe6'
    ctx.lineWidth = 3
    ctx.beginPath()
    ;[
      [box.x, box.y, 1, 1],
      [box.x + box.w, box.y, -1, 1],
      [box.x, box.y + box.h, 1, -1],
      [box.x + box.w, box.y + box.h, -1, -1]
    ].forEach(([x, y, sx, sy]) => {
      ctx.moveTo(x + sx * length, y)
      ctx.lineTo(x, y)
      ctx.lineTo(x, y + sy * length)
    })
    ctx.stroke()

    const text = `${label.toUpperCase()}  ${(confidence * 100).toFixed(1)}%`
    ctx.font = '14px "Courier New", monospace'
    const textWidth = ctx.measureText(text).width
    const top = Math.max(58, box.y - 27)
    ctx.fillStyle = '#00ffe6'
    ctx.fillRect(box.x, top, textWidth + 16, 27)
    ctx.fillStyle = '#080808'
    ctx.fillText(text, box.x + 8, top + 18)
  }

  function drawInterface(count, fps) {
    const stamp = new Date().toLocaleString('nl-NL', {
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit'
    })
    ctx.fillStyle = '#080808'
    ctx.fillRect(0, 0, width, 56)
    ctx.fillRect(0, height - 68, width, 68)
    ctx.font = '18px "Courier New", monospace'
    ctx.fillStyle = '#e1e1e1'
    ctx.fillText('PANOPTICA / LIVE OBSERVATION', 22, 35)
    ctx.fillStyle = '#ff2323'
    ctx.beginPath()
    ctx.arc(width - 110, 27, 6, 0, Math.PI * 2)
    ctx.fill()
    ctx.font = '13px "Courier New", monospace'
    ctx.fillText('REC', width - 94, 32)
    ctx.fillStyle = '#00ffe6'
    ctx.fillText(stamp, 20, height - 40)
    ctx.fillStyle = '#e1e1e1'
    ctx.fillText(`SUBJECTS ${String(count).padStart(2, '0')}   FPS ${fps.toFixed(1)}`, 20, height - 17)
    ctx.fillStyle = '#929292'
    const motto = 'OBSERVATIE ZONDER CONTEXT. GEGEVENS ZONDER GEWETEN.'
    const mottoWidth = ctx.measureText(motto).width
    if (width > mottoWidth + 360) ctx.fillText(motto, width - mottoWidth - 20, height - 17)
  }

  function loop(now) {
    if (video.readyState >= 2 && detector && video.currentTime !== lastVideoTime) {
      lastVideoTime = video.currentTime
      const result = detector.detectForVideo(video, now)
      const faceResult = faceDetector?.detectForVideo(video, now)
      const detections = [...(result.detections || []), ...(faceResult?.detections || [])]
      const scale = Math.max(width / video.videoWidth, height / video.videoHeight)
      const drawWidth = video.videoWidth * scale
      const drawHeight = video.videoHeight * scale
      const offsetX = (width - drawWidth) / 2
      const offsetY = (height - drawHeight) / 2

      ctx.clearRect(0, 0, width, height)

      detections.forEach(detection => {
        if (!detection.boundingBox || !detection.categories[0]) return
        const source = detection.boundingBox
        const box = {
          x: width - (offsetX + (source.originX + source.width) * scale),
          y: offsetY + source.originY * scale,
          w: source.width * scale,
          h: source.height * scale
        }
        const category = detection.categories[0]
        const isFace = faceResult?.detections?.includes(detection)
        drawCornerBox(box, isFace ? 'FACE' : category.displayName || category.categoryName || 'object', category.score)
      })

      const frameFps = 1000 / Math.max(now - lastFrame, 1)
      lastFrame = now
      smoothFps = smoothFps ? smoothFps * .9 + frameFps * .1 : frameFps
      drawInterface(detections.length, smoothFps)
      statusEl.textContent = detections.length ? 'TRACKING' : 'SEARCHING'
    }
    frameId = requestAnimationFrame(loop)
  }

  function handleKey(event) {
    if (event.key.toLowerCase() === 'q') window.location.href = '/proeftuin/'
    if (event.key.toLowerCase() === 'f') {
      if (document.fullscreenElement) document.exitFullscreen()
      else document.querySelector('.vision-tracker').requestFullscreen()
    }
    if (event.key.toLowerCase() === 's') {
      canvas.toBlob(blob => {
        if (!blob) return
        const link = document.createElement('a')
        link.href = URL.createObjectURL(blob)
        link.download = `panoptica_${new Date().toISOString().replaceAll(':', '-').slice(0, 19)}.jpg`
        link.click()
        window.setTimeout(() => URL.revokeObjectURL(link.href), 1000)
      }, 'image/jpeg', .92)
    }
  }

  window.addEventListener('resize', resize)
  window.addEventListener('keydown', handleKey)
  resize()

  stopCurrentPage = () => {
    cancelAnimationFrame(frameId)
    window.removeEventListener('resize', resize)
    window.removeEventListener('keydown', handleKey)
    stream?.getTracks().forEach(track => track.stop())
    detector?.close()
    faceDetector?.close()
  }

  try {
    statusEl.textContent = 'REQUESTING INPUT'
    stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false })
    video.srcObject = stream
    await video.play()
    statusEl.textContent = 'LOADING MODEL'
    const vision = await FilesetResolver.forVisionTasks(
      'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.35/wasm'
    )
    detector = await ObjectDetector.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/object_detector/efficientdet_lite0/int8/1/efficientdet_lite0.tflite',
        delegate: 'CPU'
      },
      runningMode: 'VIDEO',
      scoreThreshold: .15,
      maxResults: 12
    })
    faceDetector = await FaceDetector.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite',
        delegate: 'CPU'
      },
      runningMode: 'VIDEO',
      minDetectionConfidence: .25
    })
    statusEl.textContent = 'SEARCHING'
    frameId = requestAnimationFrame(loop)
  } catch (error) {
    console.error(error)
    statusEl.textContent = 'NO VISUAL INPUT'
  }
}

function render() {
  stopCurrentPage()
  stopCurrentPage = () => {}
  const route = currentRoute()
  window.scrollTo(0, 0)

  if (route === 'nieuws') {
    newsPage()
    return
  }
  if (route === 'panoptica') {
    panopticaPage()
    return
  }
  if (route === 'over') {
    overPage()
    return
  }
  if (route === 'schilderkunst') {
    paintingChapterPage()
    return
  }
  if (routes[route]) {
    standardPage(route)
    return
  }
  if (route === 'face-tracking') {
    faceTrackingPage()
    return
  }
  if (route === 'panoptica-vision') {
    panopticaVisionPage()
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
