// Draws a square "streak card" image (worksheet style) and returns it as a PNG file.
// Everything happens in the browser on a <canvas>; nothing is uploaded.

export async function makeStreakCard(streak: number, best: number, name: string): Promise<Blob> {
  const size = 1080
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = size
  const ctx = canvas.getContext('2d')!
  await document.fonts?.ready // use Fraunces / Space Grotesk once they have loaded

  // paper background with a faint dot grid
  ctx.fillStyle = '#f3efe4'
  ctx.fillRect(0, 0, size, size)
  ctx.fillStyle = 'rgba(20, 22, 26, 0.08)'
  for (let x = 30; x < size; x += 36) for (let y = 30; y < size; y += 36) ctx.fillRect(x, y, 2, 2)

  // the card: ink border with a hard offset shadow
  const card = { x: 110, y: 150, w: 840, h: 760 }
  ctx.fillStyle = '#14161a'
  ctx.fillRect(card.x + 16, card.y + 16, card.w, card.h)
  ctx.fillStyle = '#fbf9f3'
  ctx.fillRect(card.x, card.y, card.w, card.h)
  ctx.lineWidth = 4
  ctx.strokeStyle = '#14161a'
  ctx.strokeRect(card.x, card.y, card.w, card.h)

  ctx.fillStyle = '#5d6068'
  ctx.font = '500 30px "Space Grotesk", sans-serif'
  ctx.fillText('CONSISTENCY STREAK', card.x + 70, card.y + 110)

  ctx.fillStyle = '#d9772b'
  ctx.font = '700 300px "JetBrains Mono", monospace'
  ctx.fillText(String(streak), card.x + 60, card.y + 410)

  ctx.fillStyle = '#14161a'
  ctx.font = '600 64px "Fraunces", serif'
  ctx.fillText(streak === 1 ? 'day in a row' : 'days in a row', card.x + 70, card.y + 510)

  // tally marks: four strokes and a diagonal for every five (up to 20 shown)
  ctx.strokeStyle = '#14161a'
  ctx.lineWidth = 7
  ctx.lineCap = 'round'
  const marks = Math.min(streak, 20)
  for (let g = 0; g * 5 < marks; g++) {
    const gx = card.x + 70 + g * 130
    const gy = card.y + 570
    const inGroup = Math.min(5, marks - g * 5)
    for (let i = 0; i < Math.min(4, inGroup); i++) {
      ctx.beginPath()
      ctx.moveTo(gx + i * 24, gy)
      ctx.lineTo(gx + i * 24 - 4, gy + 80)
      ctx.stroke()
    }
    if (inGroup === 5) {
      ctx.beginPath()
      ctx.moveTo(gx - 14, gy + 62)
      ctx.lineTo(gx + 88, gy + 14)
      ctx.stroke()
    }
  }

  ctx.fillStyle = '#5d6068'
  ctx.font = '400 30px "Space Grotesk", sans-serif'
  ctx.fillText(`${name} · best ${best} · ScholarAI`, card.x + 70, card.y + card.h - 50)

  return await new Promise<Blob>((resolve, reject) =>
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('Could not make the image'))),
      'image/png',
    ),
  )
}

// Saves the picture to the device (opens the share sheet instead on phones that support it).
export async function shareOrDownload(blob: Blob, fileName: string): Promise<void> {
  const file = new File([blob], fileName, { type: 'image/png' })
  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: 'My ScholarAI streak' })
      return
    } catch {
      // cancelled: fall through to a normal download
    }
  }
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  link.click()
  URL.revokeObjectURL(url)
}
