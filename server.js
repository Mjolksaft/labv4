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
var currentPassword = ""
var dbEncryption

app.get("/identify", (req,res) => {
    res.render("identify.ejs")
})

app.post("/identify", async (req,res) => {
    var userInfo
        await db.getUser(req.body.username)
        .then(result => {
            userInfo = result
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
                    // console.log(userInfo);
                    const token = jwt.sign({"userInfo": { "username": userInfo[0].name, "role": userInfo[0].role}}, process.env.TOKEN)
                    currentKey = token
                    console.log(token);
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

app.get("/admin", authenticateToken, async(req,res) => {
    await db.getUsers()
    .then((users) => {
        res.render("admin.ejs", {users})
    })
})

function HasRole(validRole) {
    return function(req, res, next) {
        console.log(validRole, decrypted.userInfo.role);
        if(decrypted.userInfo.role !== validRole) res.redirect("/identify");
        else next();
    }
}

app.get("/start", HasRole("admin"), (req,res) => {
    res.render("start.ejs")
})

app.get("/student1", (req,res) => {
    res.render("student1.ejs")
})

app.get("/student2", (req,res) => {
    res.render("student2.ejs")
})

app.get("/teacher", (req,res) => {
    res.render("teacher.ejs")
})

function authenticateToken(req,res,next){
    console.log("we are in the authentication controll function");
    if(currentKey == "") {
        res.redirect("/identify")
        console.log("authentication failed");
    } else if(jwt.verify(currentKey, process.env.TOKEN)) {
        const decrypted = jwt.verify(currentKey, process.env.TOKEN)
        // if(decrypted.userInfo.role == validRole)
        next()
    } else {
        console.log("authentication failed");
        res.redirect("/identify")
    }
}
app.listen(5000, () => {
    db.init()
})
