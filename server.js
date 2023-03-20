const express = require("express")
const app = express()
const db = require("./database")

app.set("view-engine", "ejs")

app.get("/", (req,res) => {
    res.render("view.ejs")
})

app.listen(5000, () => {
    db.init()
})
