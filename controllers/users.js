const {request, response} = require('express');
const bcrypt = require('bcrypt');
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

// Agregar Usuario --------------------------------------------------------------------
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

const saltRounds = 10;
const passwordHash = await bcrypt.hash(password,saltRounds);

    const user = [username,email,passwordHash,name,lastname,phone_number,role_id,is_active]
    let conn;

    try {
        conn = await pool.getConnection()
//Nombre de usuario ------------------------------------------------------------------------
            const [usernameUser] = await conn.query(
            usersModel.getByUsername,
            [username],
            (err) => {if (err) throw err;}
            );
            if (usernameUser){
             res.status(409).json({msg:`User with username ${username} already exist`});
             return;
            }
//email ------------------------------------------------------------------------------------
            const [emailUser] = await conn.query(
            usersModel.getByEmail,
            [email],
            (err) => {if (err) throw err;}
            );
            if (emailUser){
            res.status(409).json({msg:`User with username ${email} already exist`});
            return;
            }

            const userAdded = await conn.query(
 
                usersModel.addRow,
                [...user],
                (err) => {
                if (err) throw err;
        });
        if (userAdded.affectedRows == 0)throw new Error({message:'Failed to add user'});
        res.json({msg:'User added seccessfully'});
    }
    
    catch (error) {
        console.log(error);
        res.status(500).json(error);

    }finally {
        if (conn) conn.end();
    }
}

//Actualizar registros ----------------------------------------------------------
const updateUser = async (req = request, res = response) => {
  let conn;
  const{id} = req.params;

const{
    username,
    email,
    password,
    name,
    lastname,
    phone_number,
    role_id,
    is_active,
  } = req.body

let user = [ //arreglo que manda información
  username,
  email,
  password,
  name,
  lastname,
  phone_number,
  role_id,
  is_active,
]

try{
  conn = await pool.getConnection();
  const [userExists] = await conn.query(
    usersModel.getByID,
    [id],
    (err) => {throw err;}
  )
    if (!userExists || userExists.is_active == 0){
      res.status(404).json({msg:'User not found' });
      return;
    }

// Usuario -----------------------------------------------------------------------------
    const [usernameUser] = await conn.query(
      usersModel.getByUsername,
      [username],
      (err) => {if (err) throw err;}
      );
      if (usernameUser){
       res.status(409).json({msg:`User with username ${username} already exist`});
       return;
      }
// email -------------------------------------------------------------------------------
      const [emailUser] = await conn.query(
      usersModel.getByEmail,
      [email],
      (err) => {if (err) throw err;}
      );
      if (emailUser){
      res.status(409).json({msg:`User with username ${email} already exist`});
      return;
      }


let oldUser = [
  userExists.username,
  userExists.email,
  userExists.password,
  userExists.name,
  userExists.lastname,
  userExists.phone_number,
  userExists.role_id,
  userExists.is_active,
]

user.forEach((userData, index) => { //ciclo para leer los campos a actualizar del arreglo usuario
  if (!userData) user [index] = oldUser[index]; //userData lee cada uno, si no lo manda toma el de la base de datos
})

const userUpdated = conn.query( //para rellenar e insertar
  usersModel.updateRow,
  [...user, id],
  (err) => {
    throw err;
  }
)

if (userUpdated.affectedRows == 0){
  throw new Error('User not updated');
}

res.json({msg: 'User updated succesfully'});

  }catch (error){
    console.error(error);
    res.status(500).json(error);

  }finally{
    if (conn)conn.end();
  }
};

//DELETE -------------------------------------------------------------------------------------

const deleteUser= async (req = request, res = response) => {
  let conn;
  const {id} =req.params;
try{
  conn = await pool.getConnection();
  const [userExists] = await conn.query(
    usersModel.getByID,
    [id],
    (err) => {throw err;}
  )
    if (!userExists || userExists.is_active == 0){
      res.status(404).json({msg:'User not found' });
      return;
    }
const userDeleted = await conn.query(
  usersModel.deleteRow,
  [id],
  (err) => {if (err) throw err;}
)
if(userDeleted.affectedRows == 0){
  throw new Error({message: 'Failed to delete user'})
};

res.json({msg: 'User deleted succesfully'});

  } catch(error){
    console.log(error);
    res.status(500).json(error);
  }finally{
    if (conn)conn.end();
  }
}


module.exports = {listUsers, listUserByID, addUser, updateUser, deleteUser};