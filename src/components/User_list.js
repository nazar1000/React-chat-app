
import '../styles/User_list.css';
import * as Axios from 'axios';
import { useEffect, useState } from 'react';



function User_list(props) {
    const [userList, setUserList] = useState([]);

    useEffect(() => {
        if (props.counter % 20 == 0 || props.counter == 1) {
            getUserList();
        }
    }, [props.counter])

    useEffect(() => {
        getUserList();
    }, [props.warning])


    const getUserList = () => {
        Axios.get('http://127.0.0.1:3001/api/get_users', {
        }).then((res) => {
            setUserList(res.data);
        });
    };


    const createConversation = (user_name, user_id) => {
        if (user_name == props.login.username) {
            console.log("You cannot chat with yourself :P")
            return;
        }

        Axios.get(`http://127.0.0.1:3001/api/create_conversation/${user_name}/${user_id}/${props.login.id}/${props.login.username}`, {
        }).then((res) => {
            console.log(res);

            if (res.data.message != "Conversation already exist") props.updateActiveConversation(res);
            else {
                let conversation_id = res.data.conversation_id;

                // let conversation = props.conversations.map((conversation) => {
                //     if (conversation.conversation_id == conversation_id) return conversation;
                // });

                let conversation = props.conversations.filter((conversation) => {
                    if (conversation.conversation_id == conversation_id) return conversation;
                });

                console.log(conversation);
                props.updateActiveConversation(conversation[0]);
            }


        });
    }

    const test = () => {
        console.log(userList);
        console.log(props);
    }




    return (
        <>
            <div className="user-list-div">
                <button onClick={() => { test() }}> debug</button>
                <h3>
                    User list
                </h3>

                {userList.map((user, key) => {
                    return (
                        <div key={user.contact_id + 25} onClick={() => { createConversation(user.user_name, user.contact_id) }}><h2>{user.user_name}</h2></div>
                    )
                })
                }
            </div>

        </>
    );
}

export default User_list;
