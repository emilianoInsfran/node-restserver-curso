const express = require('express');

let app = express(); 

const  { verificaToken,verificAdmin_Role }  = require('../middlewares/autenticacion');

let Producto = require('../models/producto');

//obtener producto por id
app.get('/productos',verificaToken,(req, res)=>{
    let desde = req.query.desde || 0;
    desde = Number(desde);

    Producto.find({})
        .skip(desde)
        .limit(5)
        .populate('usuario', 'nombre email')
        .populate('categoria', 'descripcion')
        .exec((err,productos)=>{
            if(err) {
                return res.status(500).json({// error de bd 500 serio
                    ok:false,
                    err
                })
            }

            res.json({
                ok:true,
                productos
            })
    
        })
});

app.get('/productos/buscar/:termino', (req,res)=>{

    let termino = req.params.termino;

    let regex = new RegExp(termino,'i')//expresion regular, la i para que sea insensible con mayuculas y minusculas

    Producto.find({nombre: regex})
        .populate('categoria','nombre')
        .exec((err, productos)=>{
            if(err) {
                return res.status(500).json({// error de bd 500 serio
                    ok:false,
                    err
                })
            }

            res.json({
                ok:true,
                productos
            })
        })
})

app.post('/productos',verificaToken,(req,res)=>{
    let body = req.body;

    let producto = new Producto({
        nombre:body.nombre,
        precioUni:body.precioUni,
        descripcion:body.descripcion,
        disponible:body.disponible,
        categoria:body.categoria,
        usuario: req.usuario._id,
    });

    producto.save((err,productoBD)=>{
        if(err) {
            return res.status(500).json({// error de bd 500 serio
                ok:false,
                err
            })
        }

        if(!productoBD) {
            return res.status(400).json({// 400 por que no se creo la categoria
                ok:false,
                err
            })
        }

        res.json({
            ok:true,
            producto: productoBD
        })
    })

});

app.put('/productos/:id',[verificaToken,verificAdmin_Role],(req,res)=>{

    let id = req.params.id;
    let body = req.body;


    Producto.findById(id, (err, productoBD)=>{
        if(err) {
            return res.status(500).json({// error de bd 500 serio
                ok:false,
                err
            })
        }

        if(!productoBD) {
            return res.status(400).json({// 400 por que no se creo la categoria
                ok:false,
                err: {
                    message:'el producto no existe'
                }
            })
        }

        productoBD.nombre = body.nombre;
        productoBD.precioUni = body.precioUni;
        productoBD.descripcion = body.descripcion;
        productoBD.disponible = body.disponible;
        productoBD.categoria = body.categoria;

        productoBD.save( (err, productoGuardado)=>{
            if(err) {
                return res.status(500).json({// error de bd 500 serio
                    ok:false,
                    err
                })
            }

            res.json({
                ok:true,
                productoGuardado
            })
        })
    });
})

app.delete('/productos/:id',[verificaToken,verificAdmin_Role],(req,res)=>{
    let id = req.params.id;

    Producto.findById(id, (err, productoBD)=>{
        if(err){
            return res.status(500).json({// error de bd 500 serio
                ok:false,
                err
            })
        }

        if(!productoBD) {
            return res.status(400).json({// 400 por que no se creo la categoria
                ok:false,
                err
            })
        }

        productoBD.disponible = false;


        Producto.findByIdAndUpdate(id, productoBD, (err, productoActualizadoBD)=>{
            if(err){
                return res.status(500).json({// error de bd 500 serio
                    ok:false,
                    err
                })
            }
    
            if(!productoBD) {
                return res.status(400).json({// 400 por que no se creo la categoria
                    ok:false,
                    err
                })
            }

            res.json({
                ok:true,
                productoBD,
                mensaje: "Producto borrado"
            })
        })

    })
})

module.exports = app;