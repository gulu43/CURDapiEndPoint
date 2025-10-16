import connectionFn from './connection.db.js'
import express from 'express'
import cors from 'cors'
import userRout from './config.routes.js'
import { homeApiFn, addApiFn, updateApiFn, readApiFn, deleteApiFn } from './dbfun.controller.js'
import { publicFolderPath } from './path_and_env.js'

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

// routes with endpoints
app.get(`${userRout}/home`, homeApiFn)
app.post(`${userRout}/insert`, addApiFn)
app.patch(`${userRout}/update`, updateApiFn)
app.get(`${userRout}/read`, hi, readApiFn)
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


