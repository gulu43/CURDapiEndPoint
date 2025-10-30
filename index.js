import connectionFn from './connection.db.js'
import express from 'express'
import cors from 'cors'
import userRout from './config.routes.js'
import { homeApiFn, loginApiFn, addApiFn, updateApiFn, readApiFn, resetPasswordApiFn, deleteApiFn } from './dbfun.controller.js'
import { publicFolderPath } from './path_and_env.js'
import upload from './fileHandle.multer.js'

// express added
const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static(publicFolderPath))

// configured cores
app.use(cors({
    "origin": "*",
    "methods": "GET,HEAD,PUT,PATCH,POST,DELETE",
}))

const hi = (req, res, next) => {
    console.log('this is middlewere')
    next()
}

// routes with endpoints (base /api/v1/user)
app.get(`${userRout}/home`, homeApiFn)
app.post(`${userRout}/login`, upload.none(), loginApiFn)
app.post(`${userRout}/register`, upload.single('profile_photo'), addApiFn)
app.patch(`${userRout}/update`, upload.single('profile_photo'), updateApiFn)
app.patch(`${userRout}/resetpassword`, upload.none(), resetPasswordApiFn)
app.get(`${userRout}/getdata`, hi, readApiFn)
app.delete(`${userRout}/delete`, deleteApiFn)

app.use((err, req, res, next) => {
    if (err) console.log('error ', err)
    next()
})

// server
const PORT = process.env.PORT || 8000
console.log('port: ', PORT);


; (async () => {
    await connectionFn()
    app.listen(PORT, () => {
        console.log('server is listening', PORT)
    })

})()


