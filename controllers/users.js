const {request, response} = require('express');
const usersModel = require('../models/users');
const pool = require('../db');

const listUsers = async (req=request,res=response) => {
let conn;
    try{
        conn = await pool.getConnection();
        const users = await conn.query(usersModel.getAll,(err)=>{
         if(err){
            throw err
        } 
    });
    res.json(users);
}catch(error){
    console.log(error);
    res.status(500).json(error);
}finally{
    if (conn) conn.end();
}

}

const listUserByID = async (req=request,res=response) => {
    const {id} = req.params;

    if (isNaN(id)){     //NaN = Not a Number /No es un numero
        res.status(400).json({msg: 'Invalid ID'});
    }

    let conn;

    try{
        conn = await pool.getConnection();
        const [user] = await conn.query(usersModel.getByID,[id],(err)=>{
         if(err){
            throw err
        } 
    });

    if(!user) {
        res.status(404).json({msg:'User not found'});
        return;
    }
    
    res.json(user);
}catch(error){
    console.log(error);
    res.status(500).json(error);
}finally{
    if (conn) conn.end();
}
}
const addUser = async (req = request, res = response) => {
    const {
                username,
                email,
                password,
                name,
                lastname,
                phone_number = '',
                role_id,
                is_active = 1
    } = req.body;
    
    /* 
                username: 'admin'
                email: 'admin@gmail.com'
                password: '789'
                name: 'Administrador'
                lastname: 'Del Sitio'
                phone_number: '555 555 55'
                role_id: '1'
                is_active: '1'
    */
    
    if (!username || !email || !password || !name || !lastname || !role_id){
        res.status(400).json({msg:'Missing information'});
        return;
}
    const user = [username,email,password,name,lastname,phone_number,role_id,is_active]
    let conn;

    try {
        conn = await pool.getConnection()
            const userAdded = await conn.query(
                usersModel.addRow,
                [...user],
                {supportBigNumbers: true, bigNumberStrings: true}, (err) => {
                if (err) throw err;
        });
        console.log(userAdded);
        res.json(userAdded);
    }catch (error) {
        console.log(error);
        res.status(500).json(error);

    }finally {
        if (conn) conn.end();
    }
}

module.exports = {listUsers, listUserByID, addUser};