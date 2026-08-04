import { copyFile, mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { basename, dirname, extname, join, resolve } from 'node:path'

const exportRoot = process.argv[2]

if (!exportRoot) {
  console.error('Gebruik: node scripts/import-facebook-news.mjs <facebook-export-map>')
  process.exit(1)
}

const projectRoot = resolve(import.meta.dirname, '..')
const postsFile = join(
  exportRoot,
  "this_profile's_activity_across_facebook/posts/profile_posts_1.json"
)
const outputMedia = join(projectRoot, 'public/news-media')
const outputData = join(projectRoot, 'public/news-data.json')

function repairText(value = '') {
  const text = String(value)
  if (!/[ÃÂâð]/.test(text)) return text.trim()

  try {
    return Buffer.from(text, 'latin1').toString('utf8').trim()
  } catch {
    return text.trim()
  }
}

function mediaFromPost(post) {
  const found = []
  for (const attachment of post.attachments || []) {
    for (const item of attachment.data || []) {
      if (item.media?.uri) found.push(item.media)
    }
  }
  return found
}

function postText(post, media) {
  const direct = (post.data || []).map(item => item.post).find(Boolean)
  if (direct) return repairText(direct)
  return repairText(media.map(item => item.description).find(Boolean) || '')
}

function makeTitle(text, fallback, media = []) {
  const line = text
    .split(/\n+/)
    .map(value => value.replace(/^\*+|\*+$/g, '').trim())
    .find(value => value && !/^https?:\/\//i.test(value) && !/^#+\w/.test(value))

  if (line) return line.length > 110 ? `${line.slice(0, 107).trim()}…` : line

  const url = text.match(/https?:\/\/[^\s]+/)?.[0]
  if (url) {
    try {
      const host = new URL(url).hostname.replace(/^www\./, '')
      return `Link: ${host}`
    } catch {
      // Gebruik hieronder de beschrijving van Facebook.
    }
  }

  const mediaDescription = media
    .map(item => repairText(item.description || item.title || ''))
    .flatMap(value => value.split(/\n+/))
    .find(value => value && !/^#+\w/.test(value))
  if (mediaDescription) {
    return mediaDescription.length > 110
      ? `${mediaDescription.slice(0, 107).trim()}…`
      : mediaDescription
  }

  const mediaType = media.some(item => /\.(mp4|mov|webm|m4v)$/i.test(item.uri || ''))
    ? 'Video uit de studio'
    : media.length
      ? 'Beeld uit de studio'
      : ''
  if (mediaType) return mediaType

  return repairText(fallback)
    .replace(/^Panoptica\s+/i, '')
    .replace(/\.$/, '') || 'Nieuws uit de studio'
}

function slugify(value, timestamp) {
  const slug = value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 68)
  return `${new Date(timestamp * 1000).toISOString().slice(0, 10)}-${slug || 'nieuws'}`
}

await rm(outputMedia, { recursive: true, force: true })
await mkdir(outputMedia, { recursive: true })

const rawPosts = JSON.parse(await readFile(postsFile, 'utf8'))
const usedSlugs = new Map()
const copiedMedia = new Map()
const articles = []

for (const post of rawPosts) {
  const sourceMedia = mediaFromPost(post)
  const text = postText(post, sourceMedia)
  if (!text && sourceMedia.length === 0) continue

  const title = makeTitle(text, post.title, sourceMedia)
  const baseSlug = slugify(title, post.timestamp)
  const occurrence = (usedSlugs.get(baseSlug) || 0) + 1
  usedSlugs.set(baseSlug, occurrence)
  const slug = occurrence === 1 ? baseSlug : `${baseSlug}-${occurrence}`
  const media = []

  for (const item of sourceMedia) {
    const source = join(exportRoot, item.uri)
    const extension = extname(item.uri).toLowerCase()
    const type = ['.mp4', '.mov', '.webm', '.m4v'].includes(extension) ? 'video' : 'image'
    const sourceKey = item.uri
    let publicName = copiedMedia.get(sourceKey)

    if (!publicName) {
      publicName = `${String(copiedMedia.size + 1).padStart(4, '0')}-${basename(item.uri)}`
      await mkdir(dirname(join(outputMedia, publicName)), { recursive: true })
      await copyFile(source, join(outputMedia, publicName))
      copiedMedia.set(sourceKey, publicName)
    }

    media.push({
      type,
      src: `/news-media/${publicName}`,
      alt: repairText(item.title || item.description || title).slice(0, 180)
    })
  }

  articles.push({
    slug,
    timestamp: post.timestamp,
    date: new Date(post.timestamp * 1000).toISOString(),
    title,
    text,
    media
  })
}

articles.sort((a, b) => b.timestamp - a.timestamp)

await writeFile(
  outputData,
  `${JSON.stringify({ generatedAt: new Date().toISOString(), articles }, null, 2)}\n`
)

console.log(`${articles.length} nieuwsberichten en ${copiedMedia.size} mediabestanden geïmporteerd.`)
