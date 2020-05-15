//============================
//Puerto
//============================

process.env.PORT = process.env.PORT || 3000;

//============================
//Entorno
//============================

process.env.NODE_ENV = process.env.NODE_ENV   || 'dev';
//localhost:27017/cafe
//mongodb://<dbuser>:<dbpassword>@ds119091.mlab.com:19091/cafe


//============================
//Vencimiento del token
//============================
//60 segundos
//60 miuntos
//24 horas
//30 dias
process.env.CADUCIDAD_TOKEN =  60 * 60 * 24 * 30; 

//============================
//Seed de autenticaón (seed=semilla)
//============================

process.env.SEED =  process.env.SEED || 'este-es-el-seed-del-desarrollo';

//para que no se vea desde github o cualquier repo podemos crear una variable de entorno
//en HEROKU con el comando

//heroku config =>para listar;
//heroku config:set SEED="este-es-el-seed-del-produccion"=>setear una nueva variable de entorno (el SEED='este-es-el-seed-del-producción' es un ejemplo)

let urlDB ;

if(process.env.NODE_ENV == 'dev'){
    urlDB = 'mongodb://localhost:27017/cafe';
}else{
    urlDB = process.env.MONGO_URI;
}

process.env.URLDB = urlDB



//============================
//google client id - https://console.developers.google.com/apis/credentials?authuser=0&organizationId=0&project=sign-in-dev-277109
//============================

process.env.CLIENT_ID = process.env.CLIENT_ID || '613974415251-9jvsfign0hajn33hdah2qu1haj8t9mr9.apps.googleusercontent.com';