const sqlite3 = require("sqlite3").verbose()
const db = new sqlite3.Database("db")

const init = () => {
    db.serialize(() => {
        db.run("CREATE TABLE IF NOT EXISTS user (username, password)")
    })
}

module.exports = {
    init,
}