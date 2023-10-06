const express = require('express');
const usersRouter = require('./routes/users');

class Server {
    constructor(){
        this.app = express();   //Se instancia Express
        this.port = 3000;       //Definimos el puerto

        //Paths     https://localhost:3000/api/v1
        this.basePath = '/api/v1';      //Ruta base

        this.usersPath = `${this.basePath}/users`;

        this.middlewares();     //Invocación de los middleware

        this.routes();      //Invocación de las rutas

    }

    middlewares(){
        this.app.use(express.json());       //Para poder interpretar texto en formato JSON
    }

    routes(){
        this.app.use(this.usersPath,usersRouter);     //EndPoint de Users
    }

    listen(){
        this.app.listen(this.port,() => {
            console.log('Server listenig on port ' + this.port)
        });
    }

}

module.exports = Server;

