
const jwt = require('jsonwebtoken');
//==========
//Verificar Token
//==========

let verificaToken = (req, res, next ) =>{

    //si yo no llamo al next no se va a seguir ejecutando. solo queda en este archivo que se llamo desde fuera
    let token = req.get('token');//o aouterization - esta bien de las dos formas, es la nomenclatura

    jwt.verify( token, process.env.SEED,(err, decoded)=>{//verifica si el token (o autorization depende como lo ayas nombrado) es valido
        if (err){
            return res.status(401).json({
                ok:false,
                err
            });//no autorizado es el 401
        }

        req.usuario = decoded.data;//la info del usuario si el token es valido
        next();
    })

};

//==========
//Verificar Admin Role
//==========

let verificAdmin_Role = (req,res,next)=>{

    let usuario = req.usuario;

    if(usuario.role === 'ADMIN_ROLE'){
        next();
    }else{
       return res.json({
            ok:false,
            err:{
                message:'El usuario no es administrador'
            }
        });
    }

}

module.exports = {
    verificaToken,verificAdmin_Role
}