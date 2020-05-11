const express = require('express');
const _ = require('underscore');//el estandar de uso es un _
const app = express();

const Usuario = require('../models/usuario');
const  { verificaToken,verificAdmin_Role }  = require('../middlewares/autenticacion');

const bcrypt = require('bcrypt');


app.get('/', function (req, res) {
    res.json('Hello World');
});
//los middleware se colocan como segundo argumento app.get('usuario',middleware)=> ej verificaToken
app.get('/usuario',verificaToken, (req, res) => {

    return res.json({
        usuario: req.usuario,
        nombre:req.usuario.nombre
    });

   let desde = req.query.desde || 0; //si viene desde busca a partir de ahí sino desde el inicio
   desde = Number(desde); //para poner en postman parametros opcionales seria ej /usuario?desde=10
   
    let limite= req.query.limite || 5;
    limite = Number(limite); //para poner en postman parametros opcionales seria ej /usuario?desde=10

   Usuario.find({estado:true},'nombre email role estado google img')//   Usuario.find({name:'Test 2'}) busca la propiedad name si existe 'Test 2' en count pone lo mismo 
            .skip(desde)//salto que se usa para una paginación por ejemplo next que me traiga los otros 5 que arranque a partir de ese registro
            .limit(limite)//solo quiero 5 registro por ejemplo
            .exec((err,usuarios)=>{
                if( err ) {
                    return res.status(400).json({
                        ok:false,
                        err
                    });
                };

                Usuario.count({estado:true},(err, conteo)=>{
                    res.json({
                        ok:true,
                        usuarios,
                        cuantos:conteo
                    });
                });
            });
});

app.post('/usuario',[verificaToken,verificAdmin_Role],function(req,res){
    let body = req.body;

    let usuario = new Usuario({
        nombre: body.nombre,
        email:body.email,
        password: bcrypt.hashSync ( body.password, 10),
        role:body.role
    });

    usuario.save((err, usuarioDB)=>{

        if( err ) {
            return res.status(400).json({
                ok:false,
                err
            })
        };

        //usuarioDB.password = null; //ocultar el password en la devolucion de respuesta del post
        //enmodel usuario estra la otra forma
        res.json({
            ok:true,
            usuario:usuarioDB
        })

    });

    /*if(body.nombre === undefined){
        res.status(400).json({
            ok:false,
            mensaje:'El Nombre es necesario'
        });
    }else{
        res.json({
            persona:body
        });
    }*/

});

app.put('/usuario/:id',[verificaToken,verificAdmin_Role],function(req,res){
    let id = req.params.id;
    let body = _.pick(req.body,['nombre','email','img','role','estado']);
    //el pick es una de las tantas funcionalidades para ver que se puede actualizar  y que no

    //para no poder modificar el pass ni google, pero es poco eficiente entonces instalamos underscore.js ej pick
    //delete body.password;//lo remplazo con pick
    //delete body.google; 

    //Usuario.findById(id, (err, usuarioDB)=>{  }),

    /*https://mongoosejs.com/docs/api.html#model_Model.findByIdAndUpdate*/
    Usuario.findByIdAndUpdate(id,body,{new:true,runValidators:true},(err,usuarioDB)=>{//el new:true quiere decir que nos va a devolver el documento con la actualización y no los datos anterios al update
        if( err ) {
            return res.status(400).json({
                ok:false,
                err
            })
        }

        res.json({
            ok:true,
            usuario:usuarioDB
        });
    });

});

app.delete('/usuario/:id',[verificaToken,verificAdmin_Role],function(req,res){
    //res.json('get usuario');
    let id = req.params.id;
    //let body = _.pick(req.body,['estado']);

    /*Usuario.findByIdAndRemove(id,(err,usuarioBorrado)=>{ //elimina usuario

        if( err ) {
            return res.status(400).json({
                ok:false,
                err
            })
        }

        if(!usuarioBorrado){
            return res.status(400).json({
                ok:true,
                err:{ 
                    message:"Usuario no encontrado"
                }
            })
        }

        res.json({
            ok:true,
            usuario:usuarioBorrado
        });
    });*/
    let cambiaEstado = {
        estado:false
    }

    Usuario.findByIdAndUpdate(id,cambiaEstado,{new:true,runValidators:true},(err,usuarioDB)=>{//el new:true quiere decir que nos va a devolver el documento con la actualización y no los datos anterios al update
        if( err ) {
            return res.status(400).json({
                ok:false,
                err
            })
        }

        res.json({
            ok:true,
            usuario:usuarioDB
        });
    })

});

module.exports = app;