/**
 * Removes solid margins from the exported Figma PNG.
 * Run: npm run trim-logo
 */
import sharp from 'sharp'
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const target = path.join(root, 'src/assets/logo-caretaker.png')

const buf = await sharp(target).trim({ threshold: 12 }).png().toBuffer()
writeFileSync(target, buf)
const { width, height } = await sharp(target).metadata()
process.stdout.write(`Trimmed logo: ${width}×${height}\n`)
