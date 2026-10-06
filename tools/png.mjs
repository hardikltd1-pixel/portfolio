/**
 * Just enough PNG to look at a frame numerically.
 *
 * Chrome hands back 8-bit non-interlaced RGB/RGBA, so this handles that and
 * nothing else — no interlacing, no palettes, no 16-bit. Keeping it tiny means
 * the checks that need pixels can run anywhere Node does, with nothing
 * installed.
 */
import { inflateSync } from 'node:zlib'

export function decodePng(buf) {
  let pos = 8
  let w = 0
  let h = 0
  let colorType = 0
  const idat = []
  while (pos < buf.length) {
    const len = buf.readUInt32BE(pos)
    const type = buf.toString('ascii', pos + 4, pos + 8)
    const data = buf.subarray(pos + 8, pos + 8 + len)
    if (type === 'IHDR') {
      w = data.readUInt32BE(0)
      h = data.readUInt32BE(4)
      colorType = data[9]
    } else if (type === 'IDAT') idat.push(data)
    else if (type === 'IEND') break
    pos += 12 + len
  }

  const bpp = colorType === 6 ? 4 : 3
  const raw = inflateSync(Buffer.concat(idat))
  const stride = w * bpp
  const out = Buffer.alloc(h * stride)

  /* Undo the per-scanline filters (PNG spec section 9). */
  let rp = 0
  for (let y = 0; y < h; y += 1) {
    const filter = raw[rp]
    rp += 1
    const line = raw.subarray(rp, rp + stride)
    rp += stride
    const cur = out.subarray(y * stride, (y + 1) * stride)
    const prev = y > 0 ? out.subarray((y - 1) * stride, y * stride) : null
    for (let x = 0; x < stride; x += 1) {
      const a = x >= bpp ? cur[x - bpp] : 0
      const b = prev ? prev[x] : 0
      const c = prev && x >= bpp ? prev[x - bpp] : 0
      let v = line[x]
      if (filter === 1) v += a
      else if (filter === 2) v += b
      else if (filter === 3) v += (a + b) >> 1
      else if (filter === 4) {
        const p = a + b - c
        const pa = Math.abs(p - a)
        const pb = Math.abs(p - b)
        const pc = Math.abs(p - c)
        v += pa <= pb && pa <= pc ? a : pb <= pc ? b : c
      }
      cur[x] = v & 255
    }
  }
  return { w, h, bpp, data: out }
}

export const lum = (img, x, y) => {
  const i = y * img.w * img.bpp + x * img.bpp
  return 0.2126 * img.data[i] + 0.7152 * img.data[i + 1] + 0.0722 * img.data[i + 2]
}

/** Mean colour and brightness, to answer "is it lit, and in what". */
export function stats(img) {
  let r = 0
  let g = 0
  let b = 0
  let l = 0
  let over8 = 0
  let over32 = 0
  let over96 = 0
  const n = img.w * img.h
  for (let y = 0; y < img.h; y += 2) {
    for (let x = 0; x < img.w; x += 2) {
      const i = y * img.w * img.bpp + x * img.bpp
      r += img.data[i]
      g += img.data[i + 1]
      b += img.data[i + 2]
      const v = lum(img, x, y)
      l += v
      if (v > 8) over8 += 1
      if (v > 32) over32 += 1
      if (v > 96) over96 += 1
    }
  }
  const m = n / 4
  return {
    meanLum: +(l / m).toFixed(2),
    meanRGB: [r / m, g / m, b / m].map((v) => +v.toFixed(1)),
    litOver8: +((100 * over8) / m).toFixed(1),
    litOver32: +((100 * over32) / m).toFixed(1),
    litOver96: +((100 * over96) / m).toFixed(1),
  }
}

/**
 * The frame as a brightness map. Crude, but it is the only way to tell from a
 * terminal whether a 3D scene is showing a lit room or a black rectangle.
 */
export function ascii(img, cols = 60, rows = 22) {
  const chars = ' .:-=+*#%@'
  const lines = []
  for (let gy = 0; gy < rows; gy += 1) {
    let line = ''
    for (let gx = 0; gx < cols; gx += 1) {
      let s = 0
      let n = 0
      const x0 = Math.floor((gx / cols) * img.w)
      const x1 = Math.max(x0 + 1, Math.floor(((gx + 1) / cols) * img.w))
      const y0 = Math.floor((gy / rows) * img.h)
      const y1 = Math.max(y0 + 1, Math.floor(((gy + 1) / rows) * img.h))
      for (let y = y0; y < y1; y += 3) {
        for (let x = x0; x < x1; x += 3) { s += lum(img, x, y); n += 1 }
      }
      const v = n ? s / n : 0
      line += chars[Math.min(chars.length - 1, Math.floor((v / 255) * chars.length))]
    }
    lines.push(line)
  }
  return lines.join('\n')
}

/** Block-average, which is roughly what the eye resolves rather than what a diff counts. */
export function downsample(img, factor) {
  const w = Math.floor(img.w / factor)
  const h = Math.floor(img.h / factor)
  const out = Buffer.alloc(w * h * 3)
  for (let y = 0; y < h; y += 1) {
    for (let x = 0; x < w; x += 1) {
      let r = 0
      let g = 0
      let b = 0
      for (let dy = 0; dy < factor; dy += 1) {
        for (let dx = 0; dx < factor; dx += 1) {
          const i = (y * factor + dy) * img.w * img.bpp + (x * factor + dx) * img.bpp
          r += img.data[i]
          g += img.data[i + 1]
          b += img.data[i + 2]
        }
      }
      const n = factor * factor
      const o = (y * w + x) * 3
      out[o] = r / n
      out[o + 1] = g / n
      out[o + 2] = b / n
    }
  }
  return { w, h, bpp: 3, data: out }
}

export function meanDiff(a, b) {
  let sum = 0
  let worst = 0
  for (let i = 0; i < a.data.length; i += 3) {
    const d = (Math.abs(a.data[i] - b.data[i]) +
      Math.abs(a.data[i + 1] - b.data[i + 1]) +
      Math.abs(a.data[i + 2] - b.data[i + 2])) / 3
    sum += d
    if (d > worst) worst = d
  }
  return { mean: sum / (a.w * a.h), worst }
}
