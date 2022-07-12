const express = require("express")
const app = express();

app.listen(3001, () => {
    console.log("running on port 3001");
})

const cors = require("cors");

app.use(express.json())
app.use(cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true,
}));



const mysql = require("mysql");
const { getElementError } = require("@testing-library/react");
const db = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "",
    database: "react_chat_app",
    port: 3305,
})

// const bodyParser = require('body-parser');
// app.use(bodyParser.urlencoded({ extended: true }));
// app.use(express.urlencoded({ extended: true }));

// const session = require('express-session');

// app.use(session({
//     key: "userId",
//     secret: "isThisProblem",
//     resave: false,
//     saveUninitialized: false,
//     cookie: {
//         maxAge: 1000 * 60 * 65,
//         sameSite: "lax",
//         // secure: tru,
//     }

// }))

// const bcrypt = require("bcrypt");
// const nodemon = require("nodemon"); can be removed ?
const saltRounds = 10;
// const jwt = require("jsonwebtoken"); Token

// const verifyJWT = (req, res, next) => {
//     const token = req.headers["x-access-token"]
//     if (!token) {
//         res.send({ auth: false, message: "No token" })
//     } else {
//         jwt.verify(token, "jSecret", (err, decoded) => {
//             if (err) res.send({ auth: false, message: "Authentication failed" });
//             else {
//                 req.userId = decoded.id;
//                 next();
//             }
//         })
//     }
// }



// app.get("/api/isUserAuth", verifyJWT, (req, res) => {
//     res.send({ auth: true, message: "Authentication success" });
// })

app.get("/api/get_users", (req, res) => {
    const sqlSelect = "SELECT * FROM contact"
    db.query(sqlSelect, (err, result) => {
        // console.log(result)
        //Changes all dates to local 
        // for (let i = 0; i < result.length; i++) {
        // result[i].date_of_birth = result[i].date_of_birth.toLocaleDateString();
        // }
        res.send(result);
    });
})

app.get("/api/get_conversations/:contact_id", (req, res) => {
    const contact_id = req.params.contact_id;
    const sqlSelect = "SELECT conversations_id FROM group_members WHERE contact_id = ? AND left_datetime is null"
    db.query(sqlSelect, [contact_id], (error, result) => {
        //Gets list group members where user is in
        //If results are empty respond empty array
        if (result.length == 0) {
            res.send([]);
            return;
        }

        //If result exist, create list in format (i,i,...)
        if (result) {
            let values = "";
            for (let i = 0; i < result.length; i++) {
                if (i == result.length - 1) values += result[i].conversations_id + "";
                else values += result[i].conversations_id + ",";
            }

            values = "(" + values + ")";

            //Get list of conversations based on previously attained conversations_id
            const sqlSelect = "SELECT * FROM conversations WHERE conversation_id IN " + values + "";
            db.query(sqlSelect, (errors, results) => {
                if (errors) console.log(errors);
                if (results) {
                    res.send(results);
                }

            });
        }
    });
})

app.get("/api/get_messages/:conversation_id", (req, res) => {
    const conversation_id = req.params.conversation_id;
    const sqlSelect = "SELECT * FROM message WHERE conversation_id = ?"
    // ORDER BY send_datetime ASC
    db.query(sqlSelect, [conversation_id], (error, result) => {
        if (error) console.log(error);
        if (result) res.send(result);

        // console.log(result)
        //Changes all dates to local 
        // for (let i = 0; i < result.length; i++) {

    })
})

app.get("/api/create_conversation/:user_name/:user_id/:my_id/:my_name", (req, res) => {
    let username = req.params.user_name;
    let contact_id = req.params.user_id;
    let my_id = req.params.my_id;
    let my_name = req.params.my_name;

    // console.log(username + " " + contact_id + " " + my_id);

    //Checking if (private*) conversation exists, Checks conversations against group_members 
    //table to see if there is a match between 2 users with private_conversation
    // const sqlSelect = `SELECT conversation_id FROM conversations WHERE private_conversation = 1 AND (
    // SELECT DISTINCT conversations_id FROM group_members WHERE contact_id = ? OR contact_id = ? HAVING conversations_id > 1);`

    const sqlSelect = `SELECT m1.conversations_id FROM group_members m1, group_members m2 WHERE m1.contact_id = ? && m2.contact_id = ? && m1.conversations_id = m2.conversations_id; ;`

    db.query(sqlSelect, [contact_id, my_id], (error, result) => {
        console.log("here1");
        console.log(result);

        if (error) console.log(error);

        if (result.length > 0) {
            console.log("here2");
            res.send({
                message: "Conversation already exist",
                conversation_id: result[0].conversations_id
            });
            return;
        } else if (result == 0) {

            // res.send("FAILED");
            // return;

            let identifier = Math.floor(Math.random() * 1000000) //Random unique identifier 

            //Creates new conversation
            const sqlSelect1 = "INSERT INTO conversations (conversation_name,private_conversation, identifier, member_1, member_2) VALUES (?,1,?,?,?)"
            // ORDER BY send_datetime ASC
            db.query(sqlSelect1, [username, identifier, my_name, username], (error, result) => {
                if (error) console.log(error);
                if (result) {
                    console.log("RESULT 1");

                    //Gets the new created conversation with conversation_id
                    const sqlSelect = "SELECT * FROM conversations WHERE identifier = ?"
                    db.query(sqlSelect, [identifier], (errors, results) => {

                        if (results) {
                            let conversation_id = results[0].conversation_id; //saving conversation_id
                            console.log("RESULTS 2");

                            let success = 0; //Checking for success in the incoming requests

                            //Connects other user with the newly created conversation
                            const sqlSelect = "INSERT INTO group_members (contact_id, conversations_id) VALUES (?,?)";
                            db.query(sqlSelect, [contact_id, conversation_id], (e1, r1) => {
                                console.log("R1 status");
                                if (e1 == null) success++;
                                else console.log(e1);
                            });

                            //Connects this user with the newly created conversation
                            db.query(sqlSelect, [my_id, conversation_id], (e2, r2) => {
                                console.log("R2 status");
                                if (e2 == null) success++;
                                else console.log(e2);

                                // R3 status --- To be changed
                                if (success == 2) res.send("Successfully created conversation")
                                else res.send("FAILED CREATING CONVERSATION");
                            });
                        };
                    });
                }



            })

        }
    })
})



app.delete("/api/delete/:last_name/:date_of_birth", (req, res) => {
    const last_name = req.params.last_name;
    const date_of_birth = (req.params.date_of_birth).split("-").reverse().join("/");
    console.log(date_of_birth);

    // console.log(lname);
    const sqlDelete = "DELETE FROM user_info WHERE last_name = ? AND date_of_birth = ?";
    db.query(sqlDelete, [last_name, date_of_birth], (err, result) => {
        if (err) console.log(err);
        else res.send(result.status)
    });
})

app.put("/api/update", (req, res) => {
    const last_name = req.body.last_name;
    const date_of_birth = (req.body.date_of_birth).split("/").reverse().join("");
    const tableToUpdate = req.body.tableName;
    const newEntry = req.body.newEntry;
    let sqlUpdate = "";

    if (tableToUpdate == "first_name") sqlUpdate = "UPDATE user_info SET first_name = ?  WHERE last_name = ? AND date_of_birth = ?"
    else if (tableToUpdate == "last_name") sqlUpdate = "UPDATE user_info SET last_name = ?  WHERE last_name = ? AND date_of_birth = ?"
    else if (tableToUpdate == "date_of_birth") sqlUpdate = "UPDATE user_info SET date_of_birth = ?  WHERE last_name = ? AND date_of_birth = ?"
    else if (tableToUpdate == "email") sqlUpdate = "UPDATE user_info SET email = ?  WHERE last_name = ? AND date_of_birth = ?"
    else if (tableToUpdate == "mobile") sqlUpdate = "UPDATE user_info SET mobile = ?  WHERE last_name = ? AND date_of_birth = ?"

    const update = sqlUpdate;
    console.log(last_name + " " + date_of_birth + " " + newEntry);
    console.log(sqlUpdate);
    db.query(update, [newEntry, last_name, date_of_birth], (err, result) => {
        if (!err) res.send(result.status)

    });
})

app.post("/api/send_message", (req, res) => {
    let message = req.body.message_text;
    let converse_id = req.body.conversation_id;
    let sender_name = req.body.sender_name;

    const sqlGet = "INSERT INTO message (message_text, conversation_id, sender_name) VALUES (?,?,?)";
    db.query(sqlGet, [message, converse_id, sender_name], (error, result) => {
        if (result) res.send("message Send");
        else res.send(error);
    });

});


//Register
app.post("/api/register", (req, res) => {
    // const first_name = req.body.first_name;
    // const last_name = req.body.last_name;
    // const email = req.body.email;
    // const password = req.body.password;
    const username = req.body.username;

    // bcrypt.hash(password, saltRounds, (err, hash) => {

    const sqlGet = "SELECT * FROM contact WHERE user_name = ?";
    db.query(sqlGet, [username], (error, result) => {
        // console.log(result + " lol " + error)

        if (error == !null) {
            console.log("error ");
            res.send({ error: error });


        } else if (result.length > 0) {
            // console.log("User exist")
            //If email found
            // res.send({ error: "User exists" }); //Error user exist .......
            res.send(result[0]); //Login in using existing account (debug)

        } else {
            const sqlInsert = "INSERT INTO contact (user_name) VALUES (?)";
            db.query(sqlInsert, [username], (err, insertResult) => {
                // console.log("Login: User added");
                if (insertResult) {
                    //get user id
                    const sqlGet = "Select * FROM contact WHERE user_name = ?;";
                    db.query(sqlGet, username, (er, getResult) => {
                        // console.log(getResult);
                        if (getResult.length == 1) {
                            res.send(getResult[0]);
                        }



                    });

                }





                // res.send("success");
                // console.log("InsertError" + " " + error);
            });

            // } else {
            //     res.send("connectionError");
        }
        // console.log("CheckError" + " " + err);
    });
    // })



});

// app.get("/api/login", (req, res) => {
//     // req.session.destroy();
//     if (req.session.user) {
//         res.send({ loggedIn: true, user: req.session.user });
//         // console.log("Refresh: Exist ");
//         // console.log(req.session);
//     } else {
//         res.send({ loggedIn: false });
//         // console.log("Refresh: Failed");
//         // console.log(req.session);
//     }
// })

app.post("/api/login", (req, res) => {
    const username = req.body.username;
    // const email = req.body.email;
    // const password = req.body.password;

    const sqlGet = "Select * FROM contact WHERE user_name = ?;";
    db.query(sqlGet, username, (error, result) => {
        if (error) {
            res.send({ err: err });
        }

        if (result.length > 0) {
            //If username exist
            res.send({ err: "User exist" });

        } else if (result.length == 0) {


            // bcrypt.compare(password, result[0].password, (err, response) => {
            // if (response) {

            //     const id = result[0].user_id;
            //     const token = jwt.sign({ id }, "jSecret", {
            //         expiresIn: 30,
            //     })

            //     delete result[0].user_id;
            //     delete result[0].password;

            //     req.session.user = result[0];
            //     console.log("Login: Sending session cookie");
            //     console.log(req.session.user);

            //     res.json({ auth: true, token: token, result: result[0] });
            // } else res.json({ auth: false, message: "Wrong password/username" });
            // })
            // } else res.json({ auth: false, message: "Wrong password/username" });

        }
    });
})


app.get("/api/products", (req, res) => {

    const sqlGet = "Select * FROM products;";
    db.query(sqlGet, (error, result) => {
        if (error) {
            console.log(error);
            res.send({ message: "error" });
        } else {
            // console.log(result)
            res.send(result)
        }
    })
})

app.get("/api/categories", (req, res) => {

    const sqlGet = "select * from products group by category;";
    db.query(sqlGet, (error, result) => {
        if (error) {
            console.log(error);
            res.send({ message: "error" });
        } else {
            // console.log(result)
            res.send(result)
        }
    })
})




//date convertion to local time
// let date = new Date("2022-07-07 12:00:40");
// let ms = Date.UTC(date.getYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes());
// let dateUTC = new Date(Date(ms));