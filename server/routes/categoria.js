const express = require('express');

const Categoria = require('../models/categoria');

const  { verificaToken,verificAdmin_Role }  = require('../middlewares/autenticacion');

const app = express();


//----------------------------
//Mostrar todas las categorias
//----------------------------
app.get('/categoria',verificaToken,(req,res)=>{

    Categoria.find({})
        .sort('descripcion')//lo ordena por descripcion
        .populate('usuario', 'nombre email')//populate muestra las propiedades que quiero
        .exec((err,categoria)=>{
            if( err ){
                return res.status(500).json({
                    ok:false,
                    err
                });
            };

            res.json({
                ok:true,
                categoria
            })
        })

});

//----------------------------
//Mostrar una categoria por id
//----------------------------
app.get('/categoria/:id',[verificaToken,verificAdmin_Role],(req,res)=>{
    //Categoria.finById

    let id = req.body.id;

    Catergoria.findById(id).exec((err,categoria)=>{
        if( err ) {
            return res.status(400).json({
                ok:false,
                err
            });
        };

        Categoria.count({estado:true},(err, conteo)=>{
            res.json({
                ok:true,
                categoria,
                cuantos:conteo
            });
        });
    });
});

//----------------------------
//Mostrar una categoria po id
//----------------------------
app.post('/categoria',[verificaToken,verificAdmin_Role], function (req,res) {

    let body = req.body;

    let categoria = new Categoria({
        descripcion:body.descripcion,
        usuario: req.usuario._id
    });

    console.log("categoria",categoria)

    categoria.save((err,categoriaBD) => {
        console.log("categoriaBD",categoriaBD);
        if(err) {
            return res.status(500).json({// error de bd 500 serio
                ok:false,
                err
            })
        }

        if(!categoriaBD) {
            return res.status(400).json({// 400 por que no se creo la categoria
                ok:false,
                err
            })
        }

        res.json({
            ok:true,
            categoria: categoriaBD
        })

    });

    //regresa la nueva categoria
    //req.usuario._id
});

//----------------------------
//Mostrar todas las categorias
//----------------------------

app.put('/categoria/:id',[verificaToken,verificAdmin_Role],(req,res)=>{

    let id =  req.params.id;
    let body = req.body;
    let desCategoria = {
        descripcion: body.descripcion
    }

    Categoria.findByIdAndUpdate(id,desCategoria,{new:true,runValidators:true},(err,categoriaBD)=>{
        if( err ){
            return res.status(500).json({
                ok:false,
                err
            })
        }

        if( !categoriaBD ){
            return res.status(400).json({
                ok:false,
                err
            })
        }

        return res.json({
            ok:true,
            categoriaBD
        })

    })

    //regresa la nueva categoria
    //req.usuario_id
});

//----------------------------
//Mostrar todas las categorias
//----------------------------
app.delete('/categoria/:id',[verificaToken,verificAdmin_Role],(req,res)=>{

    let id = req.params.id;

    Categoria.findByIdAndRemove(id, (err, categoriaBD)=>{

        if( err ){
            return res.status(500).json({
                ok:false,
                err:{
                    message:"El id no existe"
                }
            })
        }

        if( !categoriaBD ){
            return res.status(400).json({
                ok:false,
                err :{
                    message:"Id no Encontrado"
                }
            })
        }
    
        res.json({
            ok:true,
            categoriaBD,
            message:'Categoria borrada'
        })
    })
    //solo un administrador puede borrar las categorias
    //Usuario.findbyIdremove
});



module.exports = app;