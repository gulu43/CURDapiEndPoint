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
let pId;
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
    console.log('HOME');

    res
        .status(200)
        .json('HOME')
}

// create
export const addApiFn = async (req, res) => {
    const { name, age, address, city, country } = req.body
    // + result[0]?.insertId (for id)

    try {

        await con.beginTransaction()

        sql = 'USE USERS_DB;'
        // console.log('sql value just before exe: ', sql)
        result = await con.query(sql)

        sql = 'INSERT INTO USERS_INFO (NAME, AGE) VALUES (?, ?)'
        result = await con.query(sql, [name, age])

        pId = result[0]?.insertId
        console.log('Inserted id: ', pId)

        // Second table insersion
        // pId = 100 // for testing
        sql = 'INSERT INTO USERS_INFO_DETAILS VALUES (?, ?, ?, ?);'
        result = await con.query(sql, [pId, address, city, country])
        console.log('Inserted id in Details_TB: ', result[0]?.insertId)

        con.commit()

        res
            .status(201)
            .json({ message: 'User added successfully!' })

    } catch (error) {
        // {sql = `DELETE USERS_INFO WHERE ID = ${pId}`
        // await con.query(sql)
        // sql = `DELETE USERS_INFO_DETAILS WHERE ID = ${pId}`
        // await con.query(sql)}

        if (con) {
            try {
                await con.rollback();
                console.log('Transaction rolled back successfully.');
            } catch (rollbackError) {
                console.error('Error during transaction rollback:', rollbackError);
            }
        }
        console.error('connection error, Error adding user:', error)

        // to user
        res
            .status(500)
            .json({ message: 'Something went rong, while adding user, plz try again later' })

    }
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