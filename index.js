// USED FOR GENERATING FAKE DATA (ONLY FOR TESTING / SEEDING)
const { faker } = require('@faker-js/faker');

// USED TO CONNECT NODE.JS WITH MYSQL DATABASE
const mysql = require('mysql2');

// USED TO CREATE WEB SERVER AND HANDLE ROUTES
const express = require("express");

// USED TO CREATE EXPRESS APPLICATION
const app = express();

// USED TO WORK WITH FILE & FOLDER PATHS
const path = require("path");

// USED TO ENABLE PATCH & DELETE METHODS IN HTML FORMS
const methodOverride = require("method-override");


// ENABLE METHOD OVERRIDE USING ?_method
app.use(methodOverride("_method"));

// ALLOW EXPRESS TO READ FORM DATA
app.use(express.urlencoded({ extended: true }));

// SET EJS AS TEMPLATE ENGINE
app.set("view engine", "ejs");

// SET LOCATION OF VIEWS FOLDER
app.set("views", path.join(__dirname, "/views"));


// CREATE CONNECTION WITH MYSQL DATABASE
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    database: 'delta_app',
    password: "********"
});


// FUNCTION TO GENERATE RANDOM USER (ONLY FOR TESTING PURPOSE)
let getRandomUser = () => {
    return [
        faker.string.uuid(),
        faker.internet.username(),
        faker.internet.email(),
        faker.internet.password(),
    ];
};


// ---------------- HOME PAGE ----------------

// SHOW TOTAL NUMBER OF USERS
app.get("/", (req, res) => {
    let q = `SELECT count(*) FROM user`;

    try {
        connection.query(q, (err, result) => {
            if (err) throw err;
            let count = result[0]["count(*)"];
            res.render("home.ejs", { count });
        });
    }
    catch (err) {
        console.log(err);
        res.send("Some error occurred");
    }
});


// ---------------- SHOW ALL USERS ----------------

app.get("/user", (req, res) => {
    let q = `SELECT * FROM user`;

    try {
        connection.query(q, (err, user) => {
            if (err) throw err;
            res.render("showuser.ejs", { user });
        });
    }
    catch (err) {
        console.log(err);
        res.send("Some error occurred");
    }
});


// ---------------- EDIT USER PAGE ----------------

app.get("/user/:id/edit", (req, res) => {
    let { id } = req.params;
    let q = `SELECT * FROM user WHERE id='${id}'`;

    try {
        connection.query(q, (err, result) => {
            if (err) throw err;
            let user = result[0];
            console.log(result);
            res.render("edit.ejs", { user });
        });
    }
    catch (err) {
        console.log(err);
        res.send("Some error occurred");
    }
});


// ---------------- UPDATE USER ----------------

app.patch("/user/:id", (req, res) => {
    let { password: formPass, username: newUsername } = req.body;
    let { id } = req.params;

    let q = `SELECT * FROM user WHERE id='${id}'`;

    try {
        connection.query(q, (err, result) => {
            if (err) throw err;

            let user = result[0];

            // CHECK IF PASSWORD MATCHES
            if (formPass != user.password) {
                res.send("WRONG PASSWORD");
            } 
            else {
                // UPDATE USERNAME IF PASSWORD IS CORRECT
                let q2 = `UPDATE user SET username='${newUsername}' WHERE id='${id}'`;
                
                connection.query(q2, (err, result) => {
                    if (err) throw err;
                    res.redirect("/user");
                });
            }
        });
    }
    catch (err) {
        console.log(err);
        res.send("Some error occurred");
    }
});


// ---------------- DELETE USER ----------------

app.delete("/user/:id", (req, res) => {
    let { id } = req.params;

    let q = `DELETE FROM user WHERE id = ?`;

    connection.query(q, [id], (err, result) => {
        if (err) {
            console.log(err);
            return res.send("DB Error");
        }
        res.redirect("/user");
    });
});


// ---------------- NEW USER FORM ----------------

app.get("/user/new", (req, res) => {
    res.render("new.ejs");
});


// ---------------- INSERT NEW USER ----------------

app.post("/user", (req, res) => {
    let { id, username, email, password } = req.body;

    let q = "INSERT INTO user (id, username, email, password) VALUES (?, ?, ?, ?)";

    connection.query(q, [id, username, email, password], (err, result) => {
        if (err) {
            console.log(err);
            return res.send("DB Error");
        }
        res.redirect("/user");
    });
});


// ---------------- START SERVER ----------------

app.listen("8080", () => {
    console.log("Server is listening on port 8080");
});
