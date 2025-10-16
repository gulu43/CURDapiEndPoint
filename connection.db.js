import axios from 'axios'
import mysql2 from 'mysql2/promise'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import dotenv from 'dotenv'

export let con;
async function connectionFn() {
    con = await mysql2.createConnection({
        host: process.env.HOSTTYPE == 'localhost' ? 'localhost' : process.env.HOST,
        port: process.env.MYSQLDBPORT,
        user: process.env.USERDB,
        password: process.env.PASSDB
    })
    console.log('Database connected successfully')

}


export default connectionFn