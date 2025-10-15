import connectionFn from './dbfun.controller.js'
import express from 'express'
import axios from 'axios'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import dotenv from 'dotenv'
import cors from 'cors'
import userRout from './config.routes.js'
import {homeApiFn, addApiFn, updateApiFn, readApiFn, deleteApiFn } from './dbfun.controller.js'


// making Path 
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const publicFolderPath = path.resolve(__dirname, 'public')
const dotenvPath = path.resolve(__dirname, '.env')

dotenv.config({
    path: dotenvPath
})

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

// routes with endpoints
app.get(`${userRout}/home`, homeApiFn)
app.post(`${userRout}/insert`, addApiFn)
app.patch(`${userRout}/update`, updateApiFn)
app.get(`${userRout}/read`, readApiFn)
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













