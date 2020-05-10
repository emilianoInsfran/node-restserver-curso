//Puerto
process.env.PORT = process.env.PORT || 3000;


//entorno

process.env.NODE_ENV = process.env.NODE_ENV   || 'dev';
//localhost:27017/cafe
//mongodb://<dbuser>:<dbpassword>@ds119091.mlab.com:19091/cafe

let urlDB ;

if(process.env.NODE_ENV == 'dev'){
    urlDB = 'mongodb://localhost:27017/cafe';
}else{
    urlDB = 'mongodb://cafe-user:emi123@ds119091.mlab.com:19091/cafe'
}

process.env.URLDB = urlDB