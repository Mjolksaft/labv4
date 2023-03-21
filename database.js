const sqlite3 = require("sqlite3").verbose()
const db = new sqlite3.Database("db")

const init = () => {
    db.serialize(() => {
        db.run("CREATE TABLE IF NOT EXISTS Users(userID INTEGER NOT NULL, role, name, password, PRIMARY KEY(userID))") // primary key already unique  
        // db.run("INSERT INTO Users(role,name,password) VALUES('admin', 'admin', 'admin'), ('user1', 'student', 'password'), ('user2', 'student', 'password2'), ('teacher', 'teacher', 'password3')")

    })
}
const getUsers = () => {
    return new Promise((res,rej) => {
        db.all("SELECT * FROM Users", (err, rows) => {
            if(err) rej(err)
            res(rows)
        })
    })
}

const getUser = (name) => {
    return new Promise((res,rej) => {
        db.all("SELECT * FROM Users WHERE name = ?", [name], (err, rows) => {
            if(err) rej(err)
            res(rows)
        })
    })
}

module.exports = {
    init,
    getUsers,
    getUser
}