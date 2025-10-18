import multer from 'multer'
import { userProfilePath } from './path_and_env.js'

// console.log('fileStoringPath: ', userProfilePath)
let upload;
try {
    const storage = multer.diskStorage({
        destination: userProfilePath,
        filename: (req, file, cb) => {
            cb(null, Date.now() + ' - ' + file.originalname)
        }
    })

    upload = multer({ storage })
} catch (error) {
    console.log('error here: ', error)

}
export default upload
