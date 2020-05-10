const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
let Schema = mongoose.Schema;
let rolesValidos = {
    values: ['ADMIN_ROLE','USER_ROLE'],
    message: '{VALUE} no es un rol valido' 
};
let usuarioSchema = new Schema({
    nombre: {
        type:String,
        required: [true,'El nombre es necesario']
    },
    email:{
        type:String,
        unique:true,
        required:[true,'El email es necesario']
    },
    password:{
        type:String,
        required:[true, 'El pass es obligatorio']
    },
    img:{
        type:String,
        required:[false]
    },
    role:{
        type:String,
        default:'USER_ROLE',
        enum: rolesValidos

    },
    estado:{
        type:Boolean,
        default:true
    },
    google:{
        type:Boolean,
        default:false
    }
});

usuarioSchema.methods.toJSON = function() {//para no mostrar el password en el response
    let user = this;
    let userObject = user.toObject();
    delete userObject.password;

    return userObject;
}

usuarioSchema.plugin( uniqueValidator, {
    message: '{PATH} debe de ser único'
});

module.exports = mongoose.model( 'Usuario', usuarioSchema );