const express=require("express");
const mysql=require("mysql2");
const doenv=require("dotenv");
const app=express();
const path=require("path");
const hbs=require("hbs");
const cookieParser=require("cookie-parser");
doenv.config({
    path:"./.env",
})
const db=mysql.createConnection({
    host:process.env.DB_HOST,
    user:process.env.DB_USER,
    password:process.env.DB_PASS,
    database:process.env.DB_NAME

});
db.connect((err)=>{
    if(err){ console.log(err);}
    else{
        console.log("Mysql Connection Sucess");
    }
})

app.use(cookieParser());

app.use(express.urlencoded({extended:false}));



const location=path.join(__dirname,"./public");
app.use(express.static(location));
app.set("view engine","hbs");

const partialpath=path.join(__dirname,"./views/partials");
hbs.registerPartials(partialpath);


app.use('/',require('./routes/pages'));

app.use('/auth',require('./routes/auth'));



app.listen(8000,()=>{
    console.log("Server Started @ port 8000");
})
//console.log(__dirname);

