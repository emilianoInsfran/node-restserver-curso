const express = require('express');
const _ = require('underscore');//el estandar de uso es un _
const Usuario = require('../models/usuario');

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const {OAuth2Client} = require('google-auth-library');
const client = new OAuth2Client(process.env.CLIENT_ID);

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

//configuración de google
async function verify( token ) {
  const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.CLIENT_ID,  // Specify the CLIENT_ID of the app that accesses the backend
      // Or, if multiple clients access the backend:
      //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
  });
  const payload = ticket.getPayload();
  console.log("payload",payload.name);
  console.log("payload",payload.email);
  console.log("payload",payload.picture);

  return {
      nombre:payload.name,
      email:payload.email,
      img:payload.picture,
      google:true
  }

}
//verify().catch(console.error);

app.post('/google',async(req,res)=>{//condicion para usar el await tiene que estar dentro de un async

    let token = req.body.idtoken;//verifica que el usuario sea valido

    let googleUser = await verify (token) //verify al ser async devuelve una promesa y para que se asigne a googleuser tiene que tener el await
        .catch(e=>{
            return res.status(403).json({
                ok:false,
                err:e
            })
        });

    Usuario.findOne({ email: googleUser.email }, (err,usuarioBD)=>{
        
        if(err){
            return res.status(500).json({
                ok:false,
                err
            })
        };

        //si existe en ls BD

        if(usuarioBD) {

            if(usuarioBD.google == false) { //usuario de la app
                return res.status(400).json({
                    ok:false,
                    err:{
                        message: "Debe usar su autentición normal"
                    }
                })
            } else {//renueva el token de google
                let token = jwt.sign({//genera token
                    data: usuarioBD//paylaod data que va dentro del token
                  }, process.env.SEED , { expiresIn: process.env.CADUCIDAD_TOKEN });//valido por 30 dias
                

                  return res.json({
                      ok:true,
                      usuario: usuarioBD,
                      token
                  });
            }
        }else {
            //si el usuario no existe en la bd
            let usuario = new Usuario();

            usuario.nombre = googleUser.nombre;
            usuario.email = googleUser.email;
            usuario.img = googleUser.img;
            usuario.google = true;
            usuario.password = ':)';//no va a suar nuetro login y cuando ponga esto no va a entrar 

            usuario.save( (err, usuarioBD) =>{
                if (err){
                    return res.status(500).json({
                        ok:false,
                        err
                    });
                };

                let token = jwt.sign({//genera token
                    data: usuarioBD//paylaod data que va dentro del token
                  }, process.env.SEED , { expiresIn: process.env.CADUCIDAD_TOKEN });//valido por 30 dias
                

                  return res.json({
                      ok:true,
                      usuario: usuarioBD,
                      token
                  });
            });
        }
    })


});

module.exports = app;
