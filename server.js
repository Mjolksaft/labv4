const express = require("express")
const app = express()
const db = require("./database")
const jwt = require("jsonwebtoken")
require("dotenv").config()

app.set("view-engine", "ejs")
app.use(express.json())
app.use(express.urlencoded({extended: false}))

app.get("/users", async (req,res) => {
    await db.getUsers()
    .then((result) => {
        res.json(result)
    })
})

var currentKey = ""
var currentPassword = ""

app.get("/login", async(req,res) => {
    res.render("login.ejs")
})

app.post("/login", async (req,res) => {
    await db.getUser(req.body.username)
    .then(result => {
        var count = Object.keys(result).length
        if (count == 0) {
            res.status(404)
        } else {
            currentPassword = result[0].password
            const token =jwt.sign(currentPassword, process.env.TOKEN)
            currentKey = token
            res.redirect("/admin")
        }
    })
})

app.get("/admin", authenticateToken, (req,res) => {
    res.render("view.ejs")
})

function authenticateToken(req,res,next){
    console.log("we are in the authentication controll function");
    if(currentKey == "") {
        res.redirect("/login")
    } else if(jwt.verify(currentKey, process.env.TOKEN)) {
        next()
    } else {
        res.redirect("/login")
    }
}
app.listen(5000, () => {
    db.init()
})
