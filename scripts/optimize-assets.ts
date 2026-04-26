import { encodeToKTX2 } from 'ktx2-encoder'
import sharp from 'sharp'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import * as thumbhash from 'thumbhash'

// Configuration
const TARGET_RES = 1280
const AVIF_RES = 800
const KTX2_WAS_URL = path.resolve('node_modules/ktx2-encoder/dist/basis/basis_encoder.wasm')

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const imagesDir = path.resolve(__dirname, '../src/assets/images')
const publicTexturesDir = path.resolve(__dirname, '../public/textures')
const publicOptimizedDir = path.resolve(__dirname, '../public/optimized')
const metadataPath = path.resolve(__dirname, '../src/data/portfolio-metadata.ts')

if (!fs.existsSync(publicTexturesDir)) fs.mkdirSync(publicTexturesDir, { recursive: true })
if (!fs.existsSync(publicOptimizedDir)) fs.mkdirSync(publicOptimizedDir, { recursive: true })

async function processImage(fileName: string) {
  const sourcePath = path.join(imagesDir, fileName)
  const id = fileName.split('.')[0]
  
  console.log(`\n[Processing] ${fileName}...`)
  
  const image = sharp(sourcePath)
  const metadata = await image.metadata()
  
  const { data: rgba, info } = await image
    .resize(TARGET_RES, TARGET_RES, { fit: 'inside', withoutEnlargement: true })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true })
    
  const thumbScale = 100 / Math.max(info.width, info.height)
  const { data: thumbRgba, info: thumbInfo } = await sharp(rgba, { raw: info })
    .resize(Math.round(info.width * thumbScale), Math.round(info.height * thumbScale))
    .raw()
    .toBuffer({ resolveWithObject: true })
    
  const hash = thumbhash.rgbaToThumbHash(thumbInfo.width, thumbInfo.height, thumbRgba)
  const thumbHashStr = Buffer.from(hash).toString('base64')
  
  const avifPath = path.join(publicOptimizedDir, `${id}.avif`)
  await sharp(rgba, { raw: info })
    .avif({ quality: 65 })
    .toFile(avifPath)
  
  const pngBuffer = await sharp(rgba, { raw: info }).png().toBuffer()
  
  const ktx2Data = await encodeToKTX2(pngBuffer, {
    isUASTC: false,
    isYFlip: true,
    needSupercompression: true,
    generateMipmap: true,
    isKTX2File: true,
    isPerceptual: true,
    isSetKTX2SRGBTransferFunc: true,
    qualityLevel: 200,
    compressionLevel: 3,
    wasmUrl: KTX2_WAS_URL,
    imageDecoder: async (buffer) => {
      const { data, info } = await sharp(buffer).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
      return { width: info.width, height: info.height, data: new Uint8Array(data) }
    }
  })
  
  const ktx2Path = path.join(publicTexturesDir, `${id}.ktx2`)
  fs.writeFileSync(ktx2Path, Buffer.from(ktx2Data))
  
  return {
    id,
    ktx2: `/textures/${id}.ktx2`,
    avif: `/optimized/${id}.avif`,
    thumbHash: thumbHashStr,
    width: info.width,
    height: info.height
  }
}

async function main() {
  const files = fs.readdirSync(imagesDir).filter(f => f.startsWith('portfolio-') && (f.endsWith('.jpg') || f.endsWith('.jpeg')))
  const results: any[] = []
  
  for (const file of files) {
    try {
      const result = await processImage(file)
      results.push(result)
    } catch (err) {
      console.error(`  ✗ Failed for ${file}:`, err)
    }
  }
  
  const metadataContent = `export const portfolioMetadata: Record<string, {
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
  )}`
  fs.writeFileSync(metadataPath, metadataContent)
}

main().catch(console.error)
