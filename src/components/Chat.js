import '../styles/Chat.scss';
import { useEffect, useState } from 'react';
import * as Axios from 'axios';
import userEvent from '@testing-library/user-event';
import { capitaliseLetter } from '../helper/helper';

function Chat(props) {
    const [messages, setMessages] = useState([]);
    const [activeChat, setActiveChat] = useState([]);

    const [textField, setTextField] = useState("");

    //Updates chat/messages
    useEffect(() => {
        if (activeChat.conversation_id) {
            if (props.counter % 5 == 0) getMessage();
        }
    }, [props.counter]);

    //Checks for new chatID (from userList or chatList)
    useEffect(() => {
        if (props.chatID == null) {
            setActiveChat([]);
            setMessages([]);
            return;
        }

        getChatDetails(props.chatID); //gets new chat
    }, [props.chatID])

    //gets message after chat info has been downloaded.
    useEffect(() => {
        if (activeChat.conversation_id != undefined) getMessage();
    }, [activeChat])


    //Gets chat information
    const getChatDetails = (chat_id) => {
        console.log(chat_id)
        Axios.get('http://127.0.0.1:3001/api/get_chat_details/' + chat_id + '', {
        }).then((res) => {
            setActiveChat(res.data);
            // console.log("CHAT details are ");
            // console.log(res.data);
        });
    }

    //Gets messages for the activeChat.
    const getMessage = () => {
        // console.log("message for" + activeChat.conversation_id);
        Axios.get('http://127.0.0.1:3001/api/get_messages/' + activeChat.conversation_id + '', {
        }).then((res) => {

            // let data = res.data;
            // for (let i = 0; i < data.length; i++) {
            //     data[i].send_datetime = new Date(data[i].send_datetime).toLocaleString();
            // }

            let breakpoints = createBreaks(res.data);
            // console.log(breakpoints)

            if (messages.length == res.data.length) return;
            // setMessages(res.data);
            setMessages(breakpoints);
            document.getElementsByClassName("chat__window")[0].scrollBy(0, 1000);

        });
    }

    const sendMessage = () => {
        props.resetStatusTimer()
        // console.log(textField + " " + activeChat.conversation_id + " " + props.login.username);

        if (textField == "") return;
        let input = textField.trim();
        if (input == "") return;

        //Adding messages to list
        setMessages(() => ([
            ...messages,
            {
                "message_text": input,
                "conversation_id": activeChat.conversation_id,
                "sender_name": props.login.username,
                "send_datetime": new Date().toLocaleString("en-us")
            }
        ]));


        //Sending message to db
        Axios.post('http://127.0.0.1:3001/api/send_message/', {
            message_text: input,
            conversation_id: activeChat.conversation_id,
            sender_name: props.login.username
        }).then((res) => {
            console.log("Message send");
            console.log(res);

            //If res failed
            //remember message/re-try

            //else remove from array
            //     setBasketList((arr) =>
            //     arr.filter(element => {
            //       return element.id != product_id;
            //     }),
            //   );

            // console.log(props);
            // console.log(res.data);
        });

        document.getElementsByClassName("chat__window")[0].scrollBy(0, 1000);
        setTextField("");
    }


    const createBreaks = (messages) => {
        // console.log(messages);
        //array date
        let uniqueDate = [];
        // let uniqueDate = dateLabel;
        let newYear = true;
        let newMonth = true;
        let newDay = true;

        // let test = messages.map((message) => { return ({ ...message, tank: 43 }) });
        // console.log(test);

        let updatedMessages = messages.map((message) => {
            let time = message.send_datetime;
            let date = new Date(time.toLocaleString("en-us"));

            const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

            //message data
            let year = date.getFullYear();
            let month = months[date.getMonth()];
            let day = date.getDate();

            // console.log(date);

            //array date
            newYear = false;
            newMonth = false;
            newDay = false;

            for (let i = 0; i < uniqueDate.length; i++) {
                if (uniqueDate[i][0] == year) newYear = true;//create year
                if (uniqueDate[i][1] == month) newMonth = true //create month
                if (uniqueDate[i][2] == day) newDay = true //create day

                // if (newYear || newMonth || newDay);
            }

            if (!newYear || !newMonth || !newDay) {
                //Found new breakpoint
                uniqueDate.push([year, month, day]);
                // console.log(uniqueDate);

                return ({
                    ...message,
                    breakPoint: {
                        year: year,
                        month: month,
                        day: day

                    }
                });

            } else {
                return ({ ...message })
            }
        });

        // setDateLabel(uniqueDate);

        // console.log(updatedMessages)
        return updatedMessages;
    }



    //Decides what date or time should be shown (work in progress)
    const getTime = (time) => {
        let date = new Date(new Date(time).toLocaleString("en-us"));
        let hours = date.getHours();
        let minutes = date.getMinutes();

        if (hours < 10) hours = "0" + hours;
        if (minutes < 10) minutes = "0" + minutes;

        return (hours + ":" + minutes);
    }

    return (
        <div className="chat-div">
            <div className="chat__header">
                {/* {console.log(activeChat)} */}
                <h2 onClick={() => props.setActiveTab("chatList")}>&#60;</h2>
                <h2>{activeChat.member_1 ? "" : " Select chat"}
                    {activeChat.member_1 == props.login.username ? capitaliseLetter(activeChat.member_2) : capitaliseLetter(activeChat.member_1)} </h2>
                {/* {!props.mobile && <div className="close-chat">Close</div>} */}
                <h5>Please don't send any personal information {"(Not secured)"} </h5>
            </div>

            <div className="chat__window">
                {/* <p className='error'>{props.error?.chat}</p> */}
                {messages.map((message) => {


                    let date;
                    if (message.breakPoint != undefined) {
                        let year = message.breakPoint.year;
                        let month = message.breakPoint.month;
                        let day = message.breakPoint.day;
                        date = <h4 className='date-label'> {day + " " + month + " " + year} </h4>
                    }

                    return (

                        <div key={Math.random() * 12345}>
                            <div>
                                {date ? date : ""}
                            </div>

                            <div className={message.sender_name == props.login.username ? 'message right-message' : 'message '} >
                                <h4>{message.sender_name == props.login.username ? "" : message.sender_name}</h4>
                                <h3>{message.message_text}</h3>
                                <p>{getTime(message.send_datetime)}</p>

                            </div>
                        </div>

                    )

                })
                }
            </div>
            {activeChat.conversation_id != null &&
                <div className="chat__input-div">
                    <textarea type="text" placeholder='Message'
                        onChange={(e) => { setTextField(e.target.value) }}
                        onKeyDown={(e) => {
                            if (e.key == "Enter") { sendMessage(); e.preventDefault(); };
                            // if (e.key == "Shift") { setTextField(textField + "\n") };
                        }}

                        value={textField}></textarea>
                    <div className="button" onClick={sendMessage}>Send</div>
                </div>
            }


        </div>
    );
}

export default Chat;
