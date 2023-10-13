const usersModel = {
    getAll: `
        SELECT
        * 
        FROM
        Users`,
    
    getByID : `
        SELECT
        *
        FROM
            Users
        WHERE
            id = ?          
        `,
    addRow : `   
        INSERT INTO 
            Users (
                username,
                email,
                password,
                name,
                lastname,
                phone_number,
                role_id,
                is_active
            ) VALUES (?,?,?,?,?,?,?,?)
            `,
    getByUsername:`
        SELECT
            id 
        FROM
            Users
        Where
            username = ?
    `,
    getByEmail:`
        SELECT
            id 
        FROM
            Users
        Where
            email = ?
    `,
}
module.exports = usersModel;