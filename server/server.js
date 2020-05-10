require('./config/config');
const express = require('express');
const app = express();
var bodyParser = require('body-parser') ;
const mongoose = require('mongoose');

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
 
// parse application/json
app.use(bodyParser.json())//esto por ejemplo es un midelware que son funciones que se van a ejecutar cada ves que pase por ahí el codigo
app.use( require('./routes/usuario'));

mongoose.set('useFindAndModify', false);

mongoose.connect(process.env.URLDB, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex:true
},(err, res)=>{

    if ( err ) throw err;

    console.log('Base de datos ONLINE');

});

app.listen(process.env.PORT,()=>{
    console.log('escuchando en el puerto ',3000);
})