import mysql2 from 'mysql2/promise'
import { con } from './connection.db.js'
import bcrypt from 'bcrypt'
import './path_and_env.js'

// making Path 
// const __filename = fileURLToPath(import.meta.url)
// const __dirname = path.dirname(__filename)

// const dotenvPath = path.resolve(__dirname, '.env')

// dotenv.config({
//     path: dotenvPath
// })

let sql = ''
let result = []
let pId;
let check;

export const homeApiFn = async (req, res) => {
    console.log('HOME');

    res
        .status(200)
        .json('HOME')
}

export const loginApiFn = async (req, res) => {
    console.log('login');

    res
        .status(200)
        .json('login')
}

// create
export const addApiFn = async (req, res) => {
    const { name, age, usersname, password, address, city, country, phone_no, image_url } = req.body
    // + result[0]?.insertId (for id)

    const hashedPassword = await bcrypt.hash(password, 10)
    // bool_value = await bcrypt.compare(userPassword, dbPassword);

    try {

        await con.beginTransaction()

        sql = 'USE USERS_DB;'
        // console.log('sql value just before exe: ', sql)
        result = await con.query(sql)

        sql = 'INSERT INTO USERS_INFO (NAME, AGE, USERSNAME, PASSWORD) VALUES (?, ?, ?, ?);'
        result = await con.query(sql, [name, age, usersname, hashedPassword])

        pId = result[0]?.insertId
        console.log('Inserted id: ', pId)

        // Second table insersion
        // pId = 100 // for testing
        sql = 'INSERT INTO USERS_INFO_DETAILS VALUES (?, ?, ?, ?, ?, ?);'
        result = await con.query(sql, [pId, address, city, country, phone_no, image_url])
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


        try {
            await con.rollback();
            console.log('Transaction rolled back successfully.');
        } catch (rollbackError) {
            console.error('Error during transaction rollback:', rollbackError);
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

    // const { id, name, age, address, city, country } = req.body
    const {id, name, age, address, city, country, phone_no, image_url } = req.body


    if (!id) {
        return res
            .status(400)
            .json({
                message: `User ID is required\n
             (This response is for Founted Dev,Send id from cookie, storage, etc)`
            })
    }

    check = [name, address, city, country, phone_no].filter((ele) => ele.trim() === '')
    if (check.length > 0) {
        return res
            .status(400)
            .json({ message: 'No feild should be empty!' })
    }

    check = [name, address, city, country].filter((ele) => !ele)
    if (check.length > 0) {
        return res
            .status(400)
            .json({ message: 'No feild should be undefined!' })
    }

    try {

        await con.beginTransaction()

        sql = 'USE USERS_DB;'
        result = await con.query(sql)

        sql = 'UPDATE USERS_INFO SET NAME= ?, AGE= ? WHERE ID= ?;'
        result = await con.query(sql, [name, age, id])

        sql = 'UPDATE USERS_INFO_DETAILS SET ADDRESS= ?, CITY= ?, COUNTRY= ?, PHONE_NO= ?, IMAGE_URL= ? WHERE ID= ?;'
        result = await con.query(sql, [address, city, country, phone_no, image_url, id])

        await con.commit()

        res
            .status(200)
            .json({ message: 'User updated successfully!' })

    } catch (error) {


        try {
            await con.rollback()
            console.log('Transaction rolled back successfully.')
        } catch (error) {
            console.log('Error during transaction rollback:', error)
        }


        console.log('connection error, Error updating user:', error)

        res
            .status(422) //200 is also ok
            .json({ message: 'User does not exits, or try again later' })

    }
}

// read
export const readApiFn = async (req, res) => {

    sql = 'USE USERS_DB;'
    result = await con.query(sql)
    // console.log('Database selected')

    // View in Pretty Print
    // {  `SELECT
    // UI.ID,
    // UI.NAME,
    // UI.AGE,
    // UI.USERSNAME,
    // UI.PASSWORD,
    // UI.STATUS,
    // UI.CREATED_AT,
    // UID.ADDRESS,
    // UID.CITY,
    // UID.COUNTRY,
    // UID.PHONE_NO,
    // UID.IMAGE_URL
    // FROM
    //     USERS_INFO AS UI
    // INNER JOIN 
    //     USERS_INFO_DETAILS AS UID ON UI.ID = UID.ID
    // ORDER BY 
    //     UI.ID;
    //     ` }

    sql = `SELECT UI.ID, UI.NAME, UI.AGE, UI.USERSNAME, UI.PASSWORD, UI.STATUS, UI.CREATED_AT, UID.ADDRESS, UID.CITY, UID.COUNTRY, UID.PHONE_NO, UID.IMAGE_URL FROM USERS_INFO AS UI INNER JOIN USERS_INFO_DETAILS AS UID ON UI.ID = UID.ID ORDER BY UI.ID;`
    // console.log('sql value just before exe: ', sql)

    result = await con.query(sql)
    console.log(result[0])

    res
        .status(200)
        .json(result[0])
}

// delete
export const deleteApiFn = async (req, res) => {
    const { id } = req.body

    if (!id) {

        return res
            .status(400)
            .json({ message: 'User ID is required' })
    }

    try {
        await con.beginTransaction()

        sql = 'USE USERS_DB;'
        result = await con.query(sql)

        sql = 'DELETE FROM USERS_INFO_DETAILS WHERE ID= ?;'
        result = await con.query(sql, [id])

        if (result[0]?.affectedRows == 0) {
            res
                .status(422)
                .json({ message: 'User does not exits' })
        }

        sql = 'DELETE FROM USERS_INFO WHERE ID= ?;'
        result = await con.query(sql, [id])

        await con.commit()

        res
            .status(200)
            .json({ message: 'User deleted successfully!' })

    } catch (error) {


        try {
            await con.rollback()
            console.log('Transaction rolled back successfully.')
        } catch (error) {
            console.log('Error during transaction rollback:', error)
        }


        console.error('connection error, Error deleting user:', error)

        res
            .status(422) //200 is also ok
            .json({ message: 'User does not exits, or try again later' })
    }

    // result[0]?.affectedRows == 0 ? console.log('User does not exits') : console.log('Deleted user ', result[0]?.info)
}

