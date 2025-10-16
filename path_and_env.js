import { fileURLToPath } from 'node:url'
import path from 'node:path'
import dotenv from 'dotenv'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export const publicFolderPath = path.resolve(__dirname, 'public')
const dotenvPath = path.resolve(__dirname, '.env')

dotenv.config({
    path: dotenvPath
})

