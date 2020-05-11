const express = require('express');
const _ = require('underscore');//el estandar de uso es un _
const Usuario = require('../models/usuario');

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();


app.post('/login',(req,res)=>{

    let body = req.body;
    Usuario.findOne({ email: body.email  },(err,usuarioBD)=>{
        if( err ) {
            return res.status(400).json({
                ok:false,
                err
            })
        };

        if( !usuarioBD ) {
            return res.status(400).json({
                ok:false,
                err:{
                    message: `(Usuario) o contraseña incorrectos`
                }
            })
        }

        if( !bcrypt.compareSync( body.password, usuarioBD.password ))//compareSync devuelve un boolean si hace mach con la contraseña si son iguales
        {
            return res.status(400).json({
                ok:false,
                err:{
                    message: `Usuario o (contraseña) incorrectos`
                }
            })
        }

        let token = jwt.sign({//genera token
            data: usuarioBD//paylaod data que va dentro del token
          }, process.env.SEED , { expiresIn: process.env.CADUCIDAD_TOKEN });//valido por 30 dias

        res.json({
            ok:true,
            usuario:usuarioBD,
            token:token
        });
    
    });

});

module.exports = app;
