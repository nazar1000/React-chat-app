const express = require("express")
const app = express();

app.listen(3001, () => {
    console.log("running on port 3001");
})

const cors = require("cors");

app.use(express.json())
app.use(cors({
    origin: "http://127.0.0.1:3000",
    methods: ["GET", "POST", "DELETE", "PUT"],
    credentials: true,
}));


const mysql = require("mysql");
const { getElementError } = require("@testing-library/react");
const { useCallback } = require("react");
const db = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "",
    database: "react_chat_app",
    port: 3305,
})


// Timer for resetting all messages
let countDown = 30 * 60;
// const timer = setInterval(() => {
//     if (countDown == 0) {

//         //Deletes all messages
//         const sqlDeleteAll = "DELETE FROM message;";
//         db.query(sqlDeleteAll, (e1, r1) => {
//             if (r1) console.log("Removed all messages;");
//         });

//         //Conversations without members
//         const sqlDeleteEmptyConvo = "delete from conversations WHERE conversation_id not in (select distinct conversations_id from group_members);";
//         db.query(sqlDeleteEmptyConvo, (e1, r1) => {
//             if (r1) console.log("Removed all empty conversations");
//         });

//         //Sets users who have been inactive for more then x, to be offline, 
//         const sqlUpdate = "UPDATE contact SET active = 0 WHERE last_active < date_add(CURRENT_TIMESTAMP, INTERVAL -30 MINUTE);"
//         db.query(sqlUpdate, (e1, r1) => {
//             if (r1) console.log("Removed non active users");
//         });
//         countDown = 30 * 60;

//     }
//     countDown--;
//     // console.log(countDown)
// }, 1000);

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

//Users
app.get("/api/get_users", (req, res) => {
    let userId;

    //Getting users
    const sqlSelect = "SELECT * FROM contact WHERE active = 1"
    db.query(sqlSelect, (err, result) => {
        if (result.length > 0) {
            // console.log("GETTING all users", result)
            //Getting all the conversations that users is in
            const sqlSelect = `
            SELECT gm1.*, gm2.contact_id as user2 
            FROM group_members gm1, group_members gm2
            WHERE gm1.contact_id = ? && gm1.contact_id != gm2.contact_id && gm1.conversations_id = gm2.conversations_id;
            `
            db.query(sqlSelect, [159], (err1, result1) => {
                if (result1) {
                    // console.log("GETTING all user convo", result1)

                    // Results last messages for each conversation
                    const sqlSelect = `WITH ranked_messages AS (
                            SELECT m.*, ROW_NUMBER() OVER (PARTITION BY conversation_id ORDER BY send_datetime DESC) AS rn
                            FROM message AS m
                          )SELECT * FROM ranked_messages WHERE rn = 1;`
                    db.query(sqlSelect, (err2, result2) => {
                        if (result2) {
                            console.log("YAY");
                            console.log(({
                                users: result,
                                chats: result1,
                                lastMessage: result2
                            }))

                            res.send({
                                users: result,
                                chats: result1,
                                lastMessage: result2
                            })

                        }
                    })

                }

                // res.send(result);
            })

        }
    });
})


//Chats 
app.get("/api/get_conversations/:contact_id/:current_chat_count", (req, res) => {
    const contact_id = req.params.contact_id;
    const current_chat_count = req.params.current_chat_count;
    // console.log("GC: getting conversations");

    const sqlSelectCount = "SELECT count(conversations_id) as count FROM group_members WHERE contact_id = ? AND left_datetime is null"
    db.query(sqlSelectCount, [contact_id], (error, result) => {

        // console.log("GC: Counting conversations");
        if (result[0].count == current_chat_count) {
            res.send("noUpdate");
            return;
        } else if (result[0].count == 0) {
            res.send("noChats");
            return;


        } else {
            const sqlSelect = "SELECT conversations_id FROM group_members WHERE contact_id = ? AND left_datetime is null"
            db.query(sqlSelect, [contact_id], (error, result) => {
                //Gets list group members where user is in
                //If results are empty respond empty array
                // if (result.length == 0) {
                //     res.send([]);
                //     return;
                // }

                //If result exist, create list in format (i,i,...)
                if (result) {
                    let values = "";

                    for (let i = 0; i < result.length; i++) {
                        if (i == result.length - 1) values += result[i].conversations_id + "";
                        else values += result[i].conversations_id + ",";
                    }

                    if (values == "") {
                        res.send("noupdate");
                        return;
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
        }
    })
})

app.delete("/api/delete_chat/:chat_id/:my_id/:isPrivate", (req, res) => {
    const chatID = req.params.chat_id;
    const myID = req.params.my_id;
    const isPrivate = req.params.isPrivate
    // console.log(date_of_birth);

    console.log(isPrivate);

    let sqlDelete = "";
    if (isPrivate == 0) {
        sqlDel = "DELETE FROM group_members WHERE conversations_id = ? and contact_id = ?"
        // sqlDel1 = "DELETE FROM message WHERE conversations_id = ? and contact_id = ?"
        deleteElement(sqlDel, [chatID, myID])
        res.send("Success")
        return;
    } else {
        console.log("wtf you doing here");

        const sqlDelete1 = "DELETE FROM group_members WHERE conversations_id = ?;";
        const sqlDelete2 = "DELETE FROM message WHERE conversation_id = ?;";
        const sqlDelete3 = "DELETE FROM conversations WHERE conversation_id = ?;";

        let success = 0;
        deleteElement(sqlDelete1, [chatID], () => {
            deleteElement(sqlDelete2, [chatID], () => {
                deleteElement(sqlDelete3, [chatID], () => {
                    res.send("Success");
                })
            })
        })
    }

})

app.get("/api/create_conversation/:other_username/:other_user_id/:my_id/:my_username/:private", (req, res) => {
    let other_username = req.params.other_username;
    let other_user_id = req.params.other_user_id;
    let private_chat = req.params.private;

    if (private_chat == 0) {
        // other_username = null;
        other_user_id = null;
    }

    let my_id = req.params.my_id;
    let my_username = req.params.my_username;


    const sqlSelect = `SELECT m1.conversations_id 
    FROM group_members m1, group_members m2 WHERE 
    m1.contact_id = ? && m2.contact_id = ? && m1.conversations_id = m2.conversations_id; ;`

    db.query(sqlSelect, [other_user_id, my_id], (error, result) => {

        if (error) {
            console.log("ERROR 1");
        } else if (result.length > 0) { //Conversation already exist in users conversations
            res.send({
                message: "exist",
                conversation_id: result[0].conversations_id //Returns conversation id to set it.
            });
            return;
        }

        let identifier = Math.floor(Math.random() * 1000000) //Random unique identifier 
        console.log("1 or 0")
        console.log(private_chat)

        //Creates new conversation
        let sqlSelect1 = `INSERT INTO conversations 
            (conversation_name,private_conversation, identifier, member_1, member_2) VALUES (?,` + (private_chat == 1 ? 1 : 0) + `,?,?,?)`

        db.query(sqlSelect1, [other_username, identifier, my_username, other_username], (error, result) => {
            if (error) console.log(error);
            if (result) {
                // console.log("C: Creating conversation");

                //Gets the newly created conversation with conversation_id using identifier
                const sqlSelect = "SELECT * FROM conversations WHERE identifier = ?"
                db.query(sqlSelect, [identifier], (errors, results) => {

                    if (results) {
                        let conversation_id = results[0].conversation_id; //saving conversation_id
                        // console.log("C: Getting conversations id");
                        console.log("Is it private chat ?")
                        console.log(private_chat)
                        if (private_chat == 1) {
                            console.log("Private")
                            //if it is private add both users 
                            addUserToChat(my_id, conversation_id, () => {
                                addUserToChat(other_user_id, conversation_id, () => {
                                    res.send({
                                        message: "success",
                                        conversation_id: conversation_id
                                    });
                                });
                            });

                        } else if (private_chat == 0) {
                            console.log("Not private")
                            //not private conversation, add just me, (add user in separate request)
                            addUserToChat(my_id, conversation_id, () => {
                                res.send({
                                    message: "success",
                                    conversation_id: conversation_id
                                });
                            })
                        }
                    };
                });
            }
        })

    })
})



//Chats - Invites
app.get("/api/get_invites/:user_id", (req, res) => {
    const userID = req.params.user_id;
    const sqlSelect = "SELECT * FROM invites WHERE receivers_id = ?"
    db.query(sqlSelect, userID, (err, result) => {
        if (result.length > 0) res.send(result);
        else res.send("empty");
    });
})

app.post("/api/invite_response", (req, res) => {
    const isAccepted = req.body.isAccepted;
    const inviteID = req.body.inviteID;
    const groupID = req.body.groupID;
    const receiverID = req.body.receiverID;

    if (isAccepted == true) {
        addUserToChat(receiverID, groupID);
    }

    const sqlDelete = "DELETE FROM invites WHERE invite_id = ?;";
    db.query(sqlDelete, [inviteID], (e1, r1) => {
        if (e1) console.log(e1);
        else {
            res.send("Response processed");
        }
    })
});

app.post("/api/send_invites", (req, res) => {
    const sender_id = req.body.sender_id;
    const chat_id = req.body.conversation_id;
    const users = req.body.users;
    const group_name = req.body.chat_name

    console.log("senidng invites ?")
    console.log(users);
    for (let i = 0; i < users.length; i++) {

        const sqlGet = "INSERT INTO invites (sender_id, group_name, group_id, receivers_id) VALUES (?,?,?,?);";
        db.query(sqlGet, [sender_id, group_name, chat_id, users[i][0]], (error, result) => {
            if (result) console.log("works" + i);

        });
    }

    console.log("finished");
    res.send("Invites send?");

});


//Chat
app.get("/api/get_chat_details/:chat_id", (req, res) => {
    const chatID = req.params.chat_id;
    const sqlSelect = "SELECT * FROM conversations WHERE conversation_id = ?"
    db.query(sqlSelect, [chatID], (err, result) => {
        if (result.length > 0) res.send(result[0]);
    });
})

app.get("/api/get_messages/:conversation_id", (req, res) => {
    const conversation_id = req.params.conversation_id;
    const sqlSelect = "SELECT * FROM message WHERE conversation_id = ?"
    db.query(sqlSelect, [conversation_id], (error, result) => {
        if (result) res.send(result);
    })
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

app.post("/api/logout", (req, res) => {
    const userID = req.body.userID;
    const sqlRemove = "DELETE FROM group_members WHERE contact_id = ?";
    const sqlRemove1 = "DELETE FROM invites WHERE receivers_id = ?";
    const sqlRemove2 = "DELETE FROM contact WHERE contact_id = ?";
    deleteElement(sqlRemove, [userID], () => {
        deleteElement(sqlRemove1, [userID], () => {
            deleteElement(sqlRemove2, [userID], () => {
                res.send("logout success");
            })
        })
    })
})

//Login
app.post("/api/login", (req, res) => {
    // const first_name = req.body.first_name;
    // const last_name = req.body.last_name;
    // const email = req.body.email;
    // const password = req.body.password;
    const username = req.body.username;

    // bcrypt.hash(password, saltRounds, (err, hash) => {

    const sqlGet = "SELECT * FROM contact WHERE user_name = ?";
    db.query(sqlGet, [username], (error, result) => {
        // console.log(result + " lol " + error)

        if (error == !null) res.send({ error: error });
        else if (result.length > 0) {
            // console.log("User exist")
            //If email found
            // res.send({ error: "User exists" }); //Error user exist .......
            let newResult = result.map((res) => ({ ...res, "reset": countDown }));
            console.log(newResult)

            const sqlUpdate = "UPDATE contact SET active = 1, last_active = CURRENT_TIMESTAMP WHERE user_name = ?"
            db.query(sqlUpdate, [username], (err, insRes) => {
                if (insRes) res.send(newResult[0]); //Login in using existing account (debug)
            })


        } else {
            const sqlInsert = "INSERT INTO contact (user_name, active) VALUES (?, 1)";
            db.query(sqlInsert, [username], (err, insertResult) => {
                // console.log("Login: User added");
                if (insertResult) {
                    //get user id
                    const sqlGet = "Select * FROM contact WHERE user_name = ?;";
                    db.query(sqlGet, username, (er, getResult) => {
                        // console.log(getResult);
                        if (getResult.length == 1) {
                            let newResult = getResult.map((res) => ({ ...res, "reset": countDown }));
                            res.send(newResult[0]);
                        }
                    });

                }
            });
        }
    });
});



//Helper functions
const addUserToChat = (user_id, conversation_id, useCallback = null) => {
    console.log("worked????")
    const sqlSelect = "INSERT INTO group_members (contact_id, conversations_id) VALUES (?,?)";
    db.query(sqlSelect, [user_id, conversation_id], (e1, r1) => {
        console.log("C: Adding user to group");
        if (e1) console.log(e1)
        else {
            if (r1) {
                console.log("worked????")
                if (useCallback != null) useCallback();
                return "success";
            }
            else {

                return "failed";
            }
        }
    });
}

const deleteElement = (sqlDelete, sqlToReplace, useCallback = false) => {
    db.query(sqlDelete, sqlToReplace, (e1, r1) => {
        if (e1) console.log(e1);
        else {
            console.log("deleted")
            if (useCallback) useCallback();
        }
    })
}

app.put("/api/update_user_status", (req, res) => {
    const id = req.body.userID;
    const status = req.body.status;

    if (status == 2) sqlUpdate = "UPDATE contact SET status = ?, last_active = CURRENT_TIMESTAMP WHERE contact_id = ?;";
    else sqlUpdate = "UPDATE contact SET status = ? WHERE contact_id = ?;";


    db.query(sqlUpdate, [status, id], (err, result) => {
        if (!err) res.send(result.status)
    });

});

/*

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


app.get("/api/login", (req, res) => {
    // req.session.destroy();
    if (req.session.user) {
        res.send({ loggedIn: true, user: req.session.user });
        // console.log("Refresh: Exist ");
        // console.log(req.session);
    } else {
        res.send({ loggedIn: false });
        // console.log("Refresh: Failed");
        // console.log(req.session);
    }
})

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

*/
