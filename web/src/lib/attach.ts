/** Turns picked files (photos or PDFs) into compressed JPEG data URLs for the proposal. */
export type Attachment = { id: string; name: string; data: string }

const MAX_SIDE = 1600
const QUALITY = 0.8
export const MAX_ATTACHMENTS = 12

function canvasToJpeg(src: CanvasImageSource, w: number, h: number): string {
  const k = Math.min(1, MAX_SIDE / Math.max(w, h))
  const cv = document.createElement('canvas')
  cv.width = Math.max(1, Math.round(w * k))
  cv.height = Math.max(1, Math.round(h * k))
  const ctx = cv.getContext('2d')!
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, cv.width, cv.height)
  ctx.drawImage(src, 0, 0, cv.width, cv.height)
  return cv.toDataURL('image/jpeg', QUALITY)
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((res, rej) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => { URL.revokeObjectURL(url); res(img) }
    img.onerror = () => { URL.revokeObjectURL(url); rej(new Error('Could not open this image.')) }
    img.src = url
  })
}

async function pdfPages(file: File, limit: number): Promise<string[]> {
  const pdfjs: any = await import('pdfjs-dist/legacy/build/pdf.mjs')
  const worker: any = await import('pdfjs-dist/legacy/build/pdf.worker.mjs')
  ;(globalThis as any).pdfjsWorker = worker
  const doc = await pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise
  const out: string[] = []
  const n = Math.min(doc.numPages, limit)
  for (let i = 1; i <= n; i++) {
    const page = await doc.getPage(i)
    const vp = page.getViewport({ scale: 1.6 })
    const cv = document.createElement('canvas')
    cv.width = Math.round(vp.width)
    cv.height = Math.round(vp.height)
    const ctx = cv.getContext('2d')!
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, cv.width, cv.height)
    await page.render({ canvasContext: ctx, viewport: vp }).promise
    out.push(canvasToJpeg(cv, cv.width, cv.height))
  }
  return out
}

const uid = () => 'a' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6)

export async function filesToAttachments(files: File[], room: number): Promise<{ list: Attachment[]; error: string }> {
  const list: Attachment[] = []
  let error = ''
  for (const f of files) {
    if (list.length >= room) { error = `You can attach up to ${MAX_ATTACHMENTS} pages or pictures.`; break }
    try {
      if (f.type === 'application/pdf' || /\.pdf$/i.test(f.name)) {
        const pages = await pdfPages(f, room - list.length)
        pages.forEach((data, i) => list.push({ id: uid(), name: `${f.name} · page ${i + 1}`, data }))
      } else if (f.type.startsWith('image/')) {
        const img = await loadImage(f)
        list.push({ id: uid(), name: f.name, data: canvasToJpeg(img, img.naturalWidth, img.naturalHeight) })
      } else error = 'Only pictures (JPG, PNG) and PDF files can be attached.'
    } catch {
      error = `Could not read ${f.name}.`
    }
  }
  return { list, error }
}
