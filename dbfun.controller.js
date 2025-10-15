import axios from 'axios'
import mysql2 from 'mysql2/promise'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import dotenv from 'dotenv'

// making Path 
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const dotenvPath = path.resolve(__dirname, '.env')

dotenv.config({
    path: dotenvPath
})

let con;
let sql = ''
let result = []
let rows = []
let fields = []

async function connectionFn() {
    con = await mysql2.createConnection({
        host: process.env.HOSTTYPE == 'localhost' ? 'localhost' : process.env.HOST,
        port: process.env.MYSQLDBPORT,
        user: process.env.USERDB,
        password: process.env.PASSDB
    })
    console.log('Database connected successfully')

}

export const homeApiFn = async (req, res) => {
    res
        .status(200)
        .json('ok')
}

// create
export const addApiFn = async (req, res) => {
    const { name, age } = req.body

    sql = 'USE USERS_DB;'
    console.log('sql value just before exe: ', sql)

    result = await con.query(sql)

    sql = 'INSERT INTO USERS_INFO (NAME, AGE) VALUES (?, ?)'
    result = await con.query(sql, [name, age])
    // console.log(result)

    console.log('Inserted id: ', result[0]?.insertId)

    res
        .status(201)
        .json({ message: 'User added successfully!' })

}
// update
export const updateApiFn = async (req, res) => {

    const { name, age, id } = req.body

    sql = 'USE USERS_DB;'
    result = await con.query(sql)

    sql = 'UPDATE USERS_INFO SET NAME= ?, AGE= ? WHERE ID= ?;'
    result = await con.query(sql, [name, age, id])

    // for log
    result[0]?.affectedRows == 0 ? console.log('User does not exits ') : console.log('Updated user: ', result[0]?.info)

    // for user
    if (result[0]?.affectedRows != 0) {
        res
            .status(200)
            .json({ message: 'User updated successfully!' })
    } else {
        res
            .status(422) //200 is also ok
            .json({ message: 'User does not exits' })
    }

}

// read
export const readApiFn = async (req, res) => {
    sql = 'USE USERS_DB;'

    result = await con.query(sql)

    // console.log('Database selected')

    sql = 'SELECT * FROM USERS_INFO'
    console.log('sql value just before exe: ', sql)

    result = await con.query(sql)
    console.log(result[0])

    res
        .status(200)
        .json(result)
}

// delete
export const deleteApiFn = async (req, res) => {
    const { id } = req.body

    sql = 'USE USERS_DB;'
    result = await con.query(sql)

    sql = 'DELETE FROM USERS_INFO WHERE ID= ?;'
    result = await con.query(sql, [id])

    // console.log(result)

    // FOR DEBUG
    // res
    //     .status(200)
    //     .json(result)

    // for log
    result[0]?.affectedRows == 0 ? console.log('User does not exits') : console.log('Deleted user ', result[0]?.info)

    // for user
    if (result[0]?.affectedRows != 0) {
        res
            .status(200)
            .json({ message: 'User DELETED successfully!' })
    } else {
        res
            .status(422) //200 is also ok
            .json({ message: 'User does not exits' })
    }

}

export default connectionFn;