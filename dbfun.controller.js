import mysql2 from 'mysql2/promise'
import { con } from './connection.db.js'
import bcrypt from 'bcrypt'
import { profilePathForDbFn, publicFolderPath, removing_file_when_error } from './path_and_env.js'
import path from 'node:path'
import fs from 'node:fs'
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
    // console.log(req.body);
    // console.log(req.file);

    // const { name } = req.body
    // const { path, filename } = req.file
    // const relativeProfilePathDbStore = profilePathForDbFn(filename)

    // console.log('HOME')
    // console.log('name: ', name)
    // console.log('StoredFilePathWithName: ', relativeProfilePathDbStore)


    console.log('HOME')
    res
        .status(200)
        .json('HOME')
}

export const loginApiFn = async (req, res) => {
    // console.dir(req.body, { depth: null, colors: true })

    // const { id, usersname, pass } = req.body
    // Number(id)
    const { usersname, pass } = req.body

    if (!pass || !usersname) {
        return res
            .status(403)
            .json({
                message: `User Username and Pass are required`
            })
    }

    sql = 'USE USERS_DB;'
    result = await con.query(sql)

    // sql = 'SELECT USERSNAME, PASSWORD, STATUS FROM USERS_INFO WHERE ID= ?'
    sql = 'SELECT USERSNAME, PASSWORD, STATUS FROM USERS_INFO WHERE USERSNAME= ?'
    result = await con.query(sql, [usersname])
    // console.log('result of getting user name password: ', result[0][0])

    // console.log("compare fromdb arguments: ", pass, result[0][0].PASSWORD);
    // console.log("compare fromdb arguments: ", pass, result[0][0].USERSNAME);
    const comparingPassword = await bcrypt.compare(pass, result[0][0].PASSWORD)

    if (usersname == result[0][0].USERSNAME && comparingPassword == true && result[0][0].STATUS == 'Active') {
        console.log('User loged in')
        res
            // .status(302)
            // .redirect(`${userRout}/home`)
            .status(200)
            .json({
                status: result[0][0].STATUS,
                message: 'You loged in'
            })
    } else {
        if (result[0][0].STATUS == 'Inactive') {
            res
                .status(403)
                .json({
                    status: result[0][0].STATUS,
                    message: 'Your account status is Inactive\n Please Contact Support team support@compayemail.com'
                })
        }
        else {
            res
                .status(403)
                .json('Password or username is roung')
        }
    }

}

// create
export const addApiFn = async (req, res) => {
    const { path, filename } = req.file
    // uploads+filename
    const relativeProfilePathDbStore = profilePathForDbFn(filename)
    console.log('this path from users: ', relativeProfilePathDbStore)

    const { name, age, usersname, password, address, city, country, phone_no } = req.body
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
        result = await con.query(sql, [pId, address, city, country, phone_no, relativeProfilePathDbStore])
        console.log('Inserted id in Details_TB: ', result[0]?.insertId)

        con.commit()

        res
            .status(201)
            .json({ message: 'User added successfully!' })

    } catch (error) {

        // on error file removing block
        const returnedFilePath = removing_file_when_error(relativeProfilePathDbStore)
        console.log("Full path to remove: ", returnedFilePath)
        fs.unlinkSync(returnedFilePath)

        try {
            await con.rollback();
            console.log('Transaction rolled back successfully.');
        } catch (rollbackError) {
            console.error('Error during transaction rollback:', rollbackError);
        }

        // duplicate entry check
        const errorRegex = /^(Duplicate entry)/;
        if (errorRegex.test(error.sqlMessage)) {
            res
                .status(403)
                .json({ message: `User name ${usersname} is allready taken.` })
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

    const { path, filename } = req.file
    const relativeProfilePathDbStore = profilePathForDbFn(filename)

    const { id, name, age, address, city, country, phone_no } = req.body


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

        // for Unlink previous file
        sql = 'SELECT IMAGE_URL FROM USERS_INFO_DETAILS WHERE ID = ?'
        result = await con.query(sql, [id])
        console.log(result)

        if (result.length > 0 && result[0].IMAGE_URL) {
            const oldImagePath = path.resolve(publicFolderPath, result[0].IMAGE_URL)

            try {
                await fs.unlink(oldImagePath)
                console.log('Old image deleted:', oldImagePath)
            } catch (err) {
                console.log('Old image not found:', oldImagePath)
            }
        }

        sql = 'UPDATE USERS_INFO SET NAME= ?, AGE= ? WHERE ID= ?;'
        result = await con.query(sql, [name, age, id])

        sql = 'UPDATE USERS_INFO_DETAILS SET ADDRESS= ?, CITY= ?, COUNTRY= ?, PHONE_NO= ?, IMAGE_URL= ? WHERE ID= ?;'
        result = await con.query(sql, [address, city, country, phone_no, relativeProfilePathDbStore, id])

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

    let queryID = req.query.id
    console.log('queryID: ', queryID)

    if (queryID) {
        // console.log('value', queryID)
        sql = 'USE USERS_DB;'
        result = await con.query(sql)
        // console.log('Database selected')
        sql = `SELECT UI.ID, UI.NAME, UI.AGE, UI.USERSNAME, UI.PASSWORD, UI.STATUS, UI.CREATED_AT, UID.ADDRESS, UID.CITY, UID.COUNTRY, UID.PHONE_NO, UID.IMAGE_URL FROM USERS_INFO AS UI INNER JOIN USERS_INFO_DETAILS AS UID ON UI.ID = UID.ID WHERE UI.ID = ? ORDER BY UI.ID;`
        // console.log('sql value just before exe: ', sql)
        result = await con.query(sql, [queryID])
        console.log(result[0])

        res
            .status(200)
            .json(result[0])
    } else {
        // console.log('value', queryID)

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
        //  
        //    ` }

        sql = `SELECT UI.ID, UI.NAME, UI.AGE, UI.USERSNAME, UI.PASSWORD, UI.STATUS, UI.CREATED_AT, UID.ADDRESS, UID.CITY, UID.COUNTRY, UID.PHONE_NO, UID.IMAGE_URL FROM USERS_INFO AS UI INNER JOIN USERS_INFO_DETAILS AS UID ON UI.ID = UID.ID ORDER BY UI.ID;`
        // console.log('sql value just before exe: ', sql)

        result = await con.query(sql)
        console.log(result[0])

        res
            .status(200)
            .json(result[0])
    }

}

export const resetPasswordApiFn = async (req, res) => {
    const { username, currentPass, newPassword } = req.body
    console.log("Both Are Comming: ", username, currentPass, newPassword)
    try {

        await con.beginTransaction()

        sql = 'USE USERS_DB;'
        await con.query(sql)

        sql = 'SELECT PASSWORD FROM USERS_INFO WHERE USERSNAME= ?;'
        result = await con.query(sql, [username])
        console.log(' password: ', result[0][0].PASSWORD)

        check = await bcrypt.compare(currentPass, result[0][0].PASSWORD)
        // check = true
        console.log(check)

        if (check == true && currentPass == newPassword) {
            await con.commit()
            res
                .status(400)
                .json({
                    message: 'new password can not be same is current password'
                })
        } else if (check == true && currentPass != newPassword) {
            const hashedPassword = await bcrypt.hash(newPassword, 10)
            // console.log(hashedPassword)
            sql = 'UPDATE USERS_INFO SET PASSWORD= ? WHERE USERSNAME= ?;'
            result = await con.query(sql, [hashedPassword, username])
            console.log('result: ', result[0])

            await con.commit()
            res
                .status(200)
                .json({
                    message: 'Password Updated'
                })

        } else if (check == false) {
            await con.commit()
            res
                .status(400)
                .json({
                    message: 'rong password'
                })
        }
        else {
            await con.commit()

            res
                .status(400)
                .json({
                    message: 'something went rong'
                })
        }
    } catch (error) {
        try {
            await con.rollback()
            console.log('Transaction rolled back successfully.')
        } catch (error) {
            console.log('Error during transaction rollback:', error)
        }
        res
            .status(500)
            .json({
                message: 'something went rong: ', error
            })
    }

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

