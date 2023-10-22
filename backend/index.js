const express = require("express");
// require('./db/config')

const {connection} = require("./db/config");
const UserModel = require("./db/User");
const BookModel = require("./db/Book");

const cors = require("cors");

// const User = require("./db/User")
// const book = require("./db/book")

const Jwt = require("jsonwebtoken");
const jwtKey = "@420";

const app = express();
app.use(express.json());
app.use(cors());

app.get("/",(req,res) => {
    res.send("homepage")
})

app.post("/reg", async (req,res) => {
    let user = new UserModel(req.body);
    let result = await user.save()
    result = result.toObject();
    delete result.pass;
    Jwt.sign({result},jwtKey, (err,token) =>{
        if(err){
            res.send("something went wrong, Token not found")
        }
        res.send({result,token})
    })
});

app.post("/login", async (req,res) => {
if(req.body.pass && req.body.email){

    let user = await UserModel.findOne(req.body).select("-pass");
    if(user){
        Jwt.sign({user},jwtKey, (err,token) =>{
            if(err){
                res.send("something went wrong, Token not found")
            }
            res.send({user,token})
        })
       
    }
    else{
        res.send({result :"no user found"})
    }
}

else{
    res.send({result :"no user found"})
}
});


app.post("/add-book",verifyToken, async (req,res) => {
let book =  new BookModel(req.body);
let result = await book.save();
res.send(result)
})


app.get("/books", verifyToken , async(req,res) => {
    let books = await BookModel.find();
    if(books.length > 0){
        res.send(books)
    }
    else{
        res.send({result : 'No result Found'})
    }
})

  

app.get("/book/:id",verifyToken,async (req,res) => {
   
    let result = await BookModel.findOne({_id:req.params.id});
if(result){
    res.send(result)

}
else{
    res.send("book not Found")
}
})

app.delete("/book/:id",verifyToken,async (req,res) => {
   
    let result = await BookModel.deleteOne({_id:req.params.id});

    res.send(result)



})

app.put("/book/:id",verifyToken, async (req,res) => {
    let result = await BookModel.updateOne({_id:req.params.id},
    {
$set : req.body
    });

    res.send(result)
});   


app.get("/search/:key",verifyToken,async (req,res) => {
    let result = await BookModel.find({
        "$or" : [
            {name : {$regex:req.params.key}},
            {company : {$regex:req.params.key}},
            {price : {$regex:req.params.key}},
            {author : {$regex:req.params.key}}

        ]
    });
    res.send(result)
})


function verifyToken(req,res,next){
    token = req.headers["authorization"];
    if(token){
        token = token.split(" ")[1];
        console.log(token)
        Jwt.verify(token,jwtKey,(err,valid) => {
            if(err){
                res.status(401).send("Please provide valid token")
            }
            else{
                next()
            }
        })
    }
    else{
        res.status(403).send("Please add token with header")
    }
}



app.listen(5000, async () =>{
try{
    await connection;
    console.log("connection")
}
catch(e){
    console.log(e)
}
console.log("server running")

});