const express = require("express")
const app = express()

app.use(express.json())
app.use(express.urlencoded({extended: false}))

app.listen(5000, () => {
    console.log("is now listening on 5000");
})

app.get("/", (req, res) => {
    res.render("start.ejs")
})