import '../styles/Chat.css';
import { useEffect, useState } from 'react';
import * as Axios from 'axios';
import userEvent from '@testing-library/user-event';

function Chat(props) {
    const [messages, setMessages] = useState([]);
    const [sendMessages, setSendMessages] = useState([]);
    const [textField, setTextField] = useState("");
    const [previousConversationId, setPreviousConversationId] = useState();

    useEffect(() => {
        if (props.activeConversation.conversation_id == undefined) return;
        if (props.activeConversation.conversation_id == previousConversationId) {
            if (props.counter % 5 == 0) getMessage();
        } else {
            setPreviousConversationId(props.activeConversation.conversation_id);
            getMessage();
        }

    }, [props.activeConversation, props.counter]);

    useEffect(() => {
        getMessage();

    }, [props.warning, sendMessages]);

    const getMessage = () => {

        Axios.get('http://127.0.0.1:3001/api/get_messages/' + props.activeConversation.conversation_id + '', {
        }).then((res) => {
            console.log("getting Results");
            // console.log(props);
            // console.log(res.data);

            let data = res.data;
            for (let i = 0; i < data.length; i++) {
                data[i].send_datetime = new Date(data[i].send_datetime).toLocaleString();
            }

            // console.log(res);
            setMessages(res.data);
            // console.log(userList);
        });
    }


    const sendMessage = () => {
        console.log(textField + " " + props.activeConversation.conversation_id + " " + props.login.username);

        if (textField == "") return;
        console.log(props);


        //Adding send messages
        setSendMessages(() => ([
            ...sendMessages,
            {
                "message_text": textField,
                "conversation_id": props.activeConversation.conversation_id,
                "sender_name": props.login.username,
            }
        ]));


        Axios.post('http://127.0.0.1:3001/api/send_message/', {
            message_text: textField,
            conversation_id: props.activeConversation.conversation_id,
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

        setTextField("");
    }



    return (
        <div className="chat-div">
            <div className="window-setting-div">
                <h2>{props.activeConversation.member_1 ? "" : " Select chat"} {props.activeConversation.member_1 == props.login.username ? props.activeConversation.member_2 : props.activeConversation.member_1} </h2>
                <div className="close-button">Close</div>
            </div>

            <div className="message-window">
                <p>
                    messages goes here
                </p>

                {messages.map((message) => {

                    return (
                        <div key={message.message_id + 20}>
                            <h4>{message.sender_name}</h4>
                            <h3>{message.message_text}</h3>
                            <p>{message.send_datetime}</p>
                        </div>




                    )
                })
                }
            </div>

            <div className="message-input-div">
                <input type="text" onChange={(e) => { setTextField(e.target.value) }} value={textField}></input>
            </div>

            <div className="button" onClick={sendMessage}></div>
        </div>
    );
}

export default Chat;
