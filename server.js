const express = require("express")
const app = express()
const db = require("./database")
const jwt = require("jsonwebtoken")
const bcrypt = require("bcrypt")
require("dotenv").config()

app.set("view-engine", "ejs")
app.use(express.json())
app.use(express.urlencoded({extended: false}))

app.get("/", async (req,res) => {
    await db.getUsers()
    .then((result) => {
        res.json(result)
    })
})

var currentKey = ""
var dbEncryption
var userInfo

app.get("/identify", (req,res) => {
    res.render("identify.ejs")
})

app.post("/identify", async (req,res) => {
        await db.getUser(req.body.username)
        .then(result => {
            userInfo = result[0]
            var count = Object.keys(result).length
            if (count == 0) {
                res.render("fail.ejs")
            } else {
                dbEncryption = result[0].password
            }
        })
        // compare
        try {
            if (dbEncryption != null) {
                if (await bcrypt.compare(req.body.password, dbEncryption)){
                    res.redirect("/start")
                    // sign a jwt token 
                    const token = jwt.sign({"userInfo": { "username": userInfo.name, "role": userInfo.role}}, process.env.TOKEN)
                    currentKey = token
                    // console.log(token);
                } else {
                    res.render("fail.ejs")
                }   
            }
        } catch (error) {
            console.log(error);
        }
})

app.get("/register", (req,res) => {
    res.render("register.ejs")
})

app.post("/register", async (req,res) => {
    if(req.body.password != '') {
        try {
            dbEncryption = await bcrypt.hash(req.body.password, 10)
            await db.register(req.body.role, req.body.username, dbEncryption)
            res.render("identify.ejs")    
        } catch (error) {
            console.log(error);
        }
    }
})

function HasRole(validRole) {
    return function(req, res, next) {
        if(userInfo.role !== validRole) res.sendStatus(401);
        else next();
    }
}

app.get("/admin", [authenticateToken, HasRole("admin")], async(req,res) => {
    await db.getUsers()
    .then((users) => {
        res.render("admin.ejs", {users})
    })
})

app.get("/start", [authenticateToken], (req,res) => {
    res.render("start.ejs")
})

app.get("/student1", [authenticateToken, HasRole("student")], (req,res) => {
    res.render("student1.ejs")
})

app.get("/student2",[authenticateToken, HasRole("student")], (req,res) => {
    res.render("student2.ejs")
})

app.get("/teacher",[authenticateToken, HasRole("teacher")], (req,res) => {
    res.render("teacher.ejs")
})

function authenticateToken(req,res,next){
    console.log("we are in the authentication controll function");
    if(currentKey == "") {
        res.sendStatus(401)
    } else if(jwt.verify(currentKey, process.env.TOKEN)) {
        next()
    } else {
        res.sendStatus(401)
    }
}
app.listen(5000, () => {
    db.init()
})
