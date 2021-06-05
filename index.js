
const express = require('express');
const app = express();
const Users = require('./modle/users');
const bodyparser = require('body-parser')
const jsonParser = bodyparser.json();
const crypto = require('crypto');
const key = 'password';
const algo = 'aes-256-cbc';
const jwt = require('jsonwebtoken');
jwtkey = 'jwt';
const mongoose = require('mongoose');
const e = require('express');
mongoose.connect('mongodb+srv://AB:archanab@ab.eoxpi.mongodb.net/myFirstDatabase?retryWrites=true&w=majority', {useNewUrlParser : true, useUnifiedTopology : true}).then((res) => {
    console.log('Connected...');
}).catch((err) => {
    console.log(`error : ${err}`);
})

app.post('/register',jsonParser, (req, res) => {
    const cipher = crypto.createCipher(algo, key);
    const encryptPassword = cipher.update(req.body.password, 'utf-8', 'hex')
    +cipher.final('hex');
    req.body.password = encryptPassword;
    console.log(`password: ${JSON.stringify(req.body)}`);
    Users.collection.insertOne(req.body).then((result) => {
        jwt.sign({result}, jwtkey, { expiresIn : '500s'}, (err, token) => {
            if(err){
                res.status(400).json({err});
            } else{
                res.status(201).json({token})
            }
        })
    })
    .catch((error) => {
        error : error
    })
})

app.post('/login', jsonParser, (req, res) => {
    Users.collection.findOne({email:req.body.email}).then((result) => {
        const decipher = crypto.createDecipher(algo, key);
        const dePassword = decipher.update(result.password, 'hex', 'utf-8')+decipher.final('utf-8');
        console.log(`ecrypted password is ${result.password}`);
        console.log(`decrypted password is ${dePassword}`);
        if(dePassword == req.body.password){
            console.log(`login Successfully for user id : ${req.body.email}`);
            res.status(200).json(`login Successfully`)
        } else{
            console.log(`Incorrect Password`);
            res.status(500).json(`incorrect passowrd, Please Enter correct Passowrd`);
        }
        
    })
    .catch((error) => {
        res.status(400).json({error:error})
    })
})

app.get('/', tokenMiddleware, (req, res) => {
    Users.find().then((result) => {
        res.status(200).json({result});
    })
    .catch((err) => {
        res.status(400).json({error:err});
    })
})

function tokenMiddleware(req, res, next){
    const bearerHeader = req.headers['authorization'];
    if(typeof bearerHeader !== 'undefined'){
        const bearer = bearerHeader.split(' ');
        req.token = bearer[1];
        jwt.verify(req.token, jwtkey, (err, authData)=> {
            if(err){
                res.status(500).json({error:err})
            } else{
                next();
            }
        })
    } else{
        res.status(400).json(`Invalid token...`);
    }
}
app.listen(3002, console.log('Server Running on port 30002...'))