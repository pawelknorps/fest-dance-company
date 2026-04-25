import { encodeToKTX2 } from 'ktx2-encoder'
import sharp from 'sharp'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import * as thumbhash from 'thumbhash'

// Configuration
const TARGET_RES = 1280 // Reduced from 2K to 1280px for massive performance and load speed improvements
const AVIF_RES = 800   // Fallback for Tier 3 DOM
const KTX2_WAS_URL = path.resolve('node_modules/ktx2-encoder/dist/basis/basis_encoder.wasm')

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const imagesDir = path.resolve(__dirname, '../src/assets/images')
const publicTexturesDir = path.resolve(__dirname, '../public/textures')
const optimizedDir = path.resolve(__dirname, '../src/assets/images/optimized')
const metadataPath = path.resolve(__dirname, '../src/data/portfolio-metadata.ts')

// Ensure directories exist
if (!fs.existsSync(publicTexturesDir)) fs.mkdirSync(publicTexturesDir, { recursive: true })
if (!fs.existsSync(optimizedDir)) fs.mkdirSync(optimizedDir, { recursive: true })

async function processImage(fileName: string) {
  const sourcePath = path.join(imagesDir, fileName)
  const id = fileName.split('.')[0]
  
  console.log(`\n[Processing] ${fileName}...`)
  
  const image = sharp(sourcePath)
  const metadata = await image.metadata()
  
  // 1. Resize and get RGBA for KTX2 + ThumbHash
  const { data: rgba, info } = await image
    .resize(TARGET_RES, TARGET_RES, { fit: 'inside', withoutEnlargement: true })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true })
    
  // 2. Generate ThumbHash (Structural Placeholder)
  const thumbScale = 100 / Math.max(info.width, info.height)
  const { data: thumbRgba, info: thumbInfo } = await sharp(rgba, { raw: info })
    .resize(Math.round(info.width * thumbScale), Math.round(info.height * thumbScale))
    .raw()
    .toBuffer({ resolveWithObject: true })
    
  const hash = thumbhash.rgbaToThumbHash(thumbInfo.width, thumbInfo.height, thumbRgba)
  const thumbHashStr = Buffer.from(hash).toString('base64')
  console.log(`  ✓ ThumbHash generated`)

  // 3. Generate AVIF (Tier 3 DOM Fallback)
  const avifPath = path.join(optimizedDir, `${id}.avif`)
  await image
    .resize(AVIF_RES, AVIF_RES, { fit: 'inside', withoutEnlargement: true })
    .avif({ quality: 65 })
    .toFile(avifPath)
  console.log(`  ✓ AVIF fallback generated`)

  // 4. Generate KTX2 (UASTC + Zstd + Mipmaps)
  const pngBuffer = await sharp(rgba, { raw: info }).png().toBuffer()
  
  const ktx2Data = await encodeToKTX2(pngBuffer, {
    isUASTC: true,
    isYFlip: true, // SOTA: Flip at source to match WebGL (0,0) bottom-left convention
    needSupercompression: true, // Zstandard
    generateMipmap: true,
    isKTX2File: true,
    isPerceptual: true,
    isSetKTX2SRGBTransferFunc: true,
    wasmUrl: KTX2_WAS_URL,
    imageDecoder: async (buffer) => {
      const { data, info } = await sharp(buffer).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
      return { width: info.width, height: info.height, data: new Uint8Array(data) }
    }
  })
  
  const ktx2Path = path.join(publicTexturesDir, `${id}.ktx2`)
  fs.writeFileSync(ktx2Path, Buffer.from(ktx2Data))
  console.log(`  ✓ KTX2 (UASTC+Zstd) generated at ${ktx2Path}`)
  
  return {
    id,
    ktx2: `/textures/${id}.ktx2`,
    avif: `../assets/images/optimized/${id}.avif`,
    thumbHash: thumbHashStr,
    width: info.width,
    height: info.height
  }
}

async function main() {
  const files = fs.readdirSync(imagesDir).filter(f => f.startsWith('portfolio-') && (f.endsWith('.jpg') || f.endsWith('.jpeg')))
  const results: any[] = []
  
  console.log(`\nSOTA Asset Optimization Pipeline (2K UASTC + AVIF + ThumbHash)`)
  console.log(`=============================================================`)
  
  for (const file of files) {
    try {
      const result = await processImage(file)
      results.push(result)
    } catch (err) {
      console.error(`  ✗ Failed for ${file}:`, err)
    }
  }
  
  const metadataContent = `/**
 * AUTO-GENERATED SOTA METADATA
 * Format: UASTC KTX2 (WebGL) | AVIF (DOM) | ThumbHash (Placeholder)
 */
export const portfolioMetadata: Record<string, {
  ktx2: string
  avif: string
  thumbHash: string
  width: number
  height: number
}> = ${JSON.stringify(
    results.reduce((acc, r) => {
      acc[r.id] = { ktx2: r.ktx2, avif: r.avif, thumbHash: r.thumbHash, width: r.width, height: r.height }
      return acc
    }, {}), 
    null, 
    2
  )}
`
  fs.writeFileSync(metadataPath, metadataContent)
  console.log(`\n[Complete] Metadata saved to ${metadataPath}`)
}

main().catch(console.error)
