import { fileURLToPath } from 'node:url'
import path from 'node:path'
import dotenv from 'dotenv'

const __filename = fileURLToPath(import.meta.url)
export const __dirname = path.dirname(__filename)

export const publicFolderPath = path.resolve(__dirname, 'public')
export const userProfilePath = path.resolve(publicFolderPath, 'uploads')
// export const firstHalfOfUserProfilePathForDB = path.resolve(__dirname, 'public')
export const profilePathForDbFn = (filename)=>{
    return path.join('uploads', filename)
}

const dotenvPath = path.resolve(__dirname, '.env')

dotenv.config({
    path: dotenvPath
})

