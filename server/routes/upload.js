const express = require('express');
const fileUpload = require('express-fileupload');
const app = express();

const Usuario = require('../models/usuario');
const Producto = require('../models/producto')
const fs = require('fs');//filesystem
const path = require('path');
/*
Un middleware es un bloque de código que se ejecuta entre la petición que hace el usuario (request) hasta que la petición llega al servidor.
*/

// default options
app.use(fileUpload());//fileUpload es un middleware , todos los archivos que se cargen  van en req.file

app.put('/upload/:tipo/:id', function(req, res) {

    let tipo = req.params.tipo;
    let id = req.params.id;

    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).json({
            ok:false,
            err:{
                message:'No se ha seleccionado ningún archivo'
            }
        });
    }

    //Validar tipo

    let tipoValidado = ['productos','usuarios'];

    if(tipoValidado.indexOf (tipo) < 0 ) {
        return res.status(400).json({
            ok:false,
            message:'Los tipos validados son ' + tipoValidado,
        })
    }

    // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
    let archivo = req.files.archivo;//archivo es la propiedad del objeto quer tiene como valor la imagen (lo que va en el input)

    //Extensiones permitidas
    let extensionesValidas = ['png','jpg','gif','jpeg'];

    let nombreArchivo = archivo.name.split('.');
    let extension = nombreArchivo[nombreArchivo.length -1];

    if(extensionesValidas.indexOf (extension) < 0 ) {
        return res.status(400).json({
            ok:false,
            message:'Las exteciones validas son ' + extensionesValidas,
            ext:  extension
        })
    }

    //cambiar nombre al archivo

    nombreArchivo = `${ id }-${ new Date().getMilliseconds() }.${ extension }`

    // Use the mv() method to place the file somewhere on your server
    archivo.mv(`../uploads/${ tipo }/${ nombreArchivo }`, (err) => {
        if (err)
        return res.status(500).json({
            ok:false,
            err
        });

        //imagen cargada
        if(tipo== 'usuarios') imagenUsuario(id,res,nombreArchivo);
        else  imagenProducto(id,res,nombreArchivo);
        /*res.json({
            ok:true,
            message:'Se subio con exito el archivo'
        });*/
    });
    
});

function imagenUsuario(id,res,nombreArchivo){
    Usuario.findById(id,(err,usuarioBD)=>{

        if(err){
            borraArchivo(nombreArchivo,'usuarios');//para evitar que nos llene la memoria

            res.status(400).json({
                ok:false,
                err
            });
        }

        if (!usuarioBD ){
            borraArchivo(nombreArchivo,'usuarios');

            return res.status(500).json({
                ok:false,
                err:{
                    message:'Usuario no existe'
                }
            })
        }
        console.log("img",usuarioBD.img);

        borraArchivo(usuarioBD.img,'usuarios');

        usuarioBD.img = nombreArchivo;

        usuarioBD.save( (err,usuarioGuardado)=>{
            
            res.json({
                ok:true,
                usuarioBD: usuarioGuardado,
                img:nombreArchivo
            })
        })

    })
}

function imagenProducto(id,res,nombreArchivo){
    Producto.findById(id,(err,productoDB)=>{

        if(err){
            borraArchivo(nombreArchivo,'productos');//para evitar que nos llene la memoria

            res.status(400).json({
                ok:false,
                err
            });
        }

        if (!productoDB ){
            borraArchivo(nombreArchivo,'productos');

            return res.status(500).json({
                ok:false,
                err:{
                    message:'Usuario no existe'
                }
            })
        }
        console.log("img",productoDB.img);

        borraArchivo(productoDB.img,'productos');

        productoDB.img = nombreArchivo;

        productoDB.save( (err,productoGuardado)=>{
            if(err){
                res.status(400).json({
                    ok:false,
                    err
                });
            }
            
            res.json({
                ok:true,
                productoDB: productoGuardado,
                img:nombreArchivo
            })
        })

    })
}

function borraArchivo(nombreImagen, tipo){
        //consulta si existe la ruta de la imagen - .resolve() construye un path
        let pathImagen = path.resolve(__dirname,`../../uploads/${tipo}/${nombreImagen}`);

        if ( fs.existsSync(pathImagen) ) {//verifica si existe
            fs.unlinkSync(pathImagen);//elimina la imagen del path 
        }

}

module.exports = app;