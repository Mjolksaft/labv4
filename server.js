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

app.get("/admin", (req,res) => {
    res.render("admin.ejs")
})

app.listen(5000, () => {
    db.init()
})
