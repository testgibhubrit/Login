const mysql=require("mysql2");
const bcrypt=require('bcryptjs');
const jwt=require("jsonwebtoken");
const {promisify}=require("util");

const db=mysql.createConnection({
    host:process.env.DB_HOST,
    user:process.env.DB_USER,
    password:process.env.DB_PASS,
    database:process.env.DB_NAME

});


exports.index=async(req,res)=>{
try{
    const {email,password}=req.body;
    if(!email||!password){
        return res.status(400).render('index',{msg:"Please Enter your Email and Password",msg_type:"error"})
    }
    db.query('select * from user where email=?',[email],async(error,result)=>{
        if(result .length<=0){
            console.log(result);
            return res.status(401).render('index',{msg:"Email or Password Incorrect..",msg_type:"error"})

        }
        else{
            if(!(await bcrypt.compare(password,result[0].pass))){
                return res.status(401).render('index',{msg:"Email or Password Incorrect..",msg_type:"error"})

            }
            else{
                const id=result[0].id;
                const token=jwt.sign({id:id},process.env.JWT_SECRET,{
                    expiresIn:process.env.JWT_EXPIRES_IN,
                });
                console.log("token is "+token);
                const cookieOption={
                    expires:new Date(Date.now()+process.env.JWT_COOKIE_EXPIRES*24*60*60*1000),
                    httpOnly:true,
                };
                res.cookie("joes",token,cookieOption);
                res.status(200).redirect("/home");
            }
        }

    });

}
catch(error){
    console.log(error);
}
};

exports.register=(req,res)=>{
   // console.log(req.body);
           /* const name=req.body.name;
    const email=req.body.email;
    const password=req.body.password;
    const confirm_password=req.body.confirm_password;
*/
// res.send("Form Submitted");

    const {name,email,password,confirm_password}=req.body;
    db.query("select email from user where email=?",[email],async(error,result)=>{
       if(error) {
        console.log(error);
       }
       else{
        if(result.length>0){
            return res.render('register',{msg:"Email id already taken",msg_type:"error"})
        }
        else if(password!==confirm_password){
            return res.render('register',{msg:"Password do no match",msg_type:"error"})

        }
        let hashed=await bcrypt.hash(password,8);
        db.query("insert into user set ?",{name:name,email:email,pass:hashed},(error,result)=>{
            if(error){
                console.log(error);
            }
            else{
              //  console.log(result);
                return res.render('register',{msg:"User Registration Success",msg_type:'good'})
            }
        });
       }
    });
};

exports.isLoggedIn=async(req,  res, next)=>{
   // req.name="Check Login...";
   // next();
   //console.log(req.cookies);
   if(req.cookies.joes){
    try{
     const decode=await promisify(jwt.verify)(
        req.cookies.joes,process.env.JWT_SECRET
     )
     //console.log(decode);
     db.query("select * from user where id=?",[decode.id],(err,results)=>{
       // console.log(result);
       if(!results){
        return next();
       }
       
        req.user=results[0];
        return next();
       
     });
   }
   catch(error){
   // console.log(error);
    return next();
   }
}
   else{
    next();
   }
};
exports.logout=async(req,res)=>{
    res.cookie("joes","logout",{
        expires:new Date(Date.now()+2*1000),
        httpOnly:true,
    });
    res.status(200).redirect("/");
}