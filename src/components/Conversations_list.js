import { useEffect, useState } from 'react';
import * as Axios from 'axios';
import '../styles/Conversations_list.css';

function Conversations_list(props) {

    // const [conversations, setConversations] = useState([]);
    useEffect(() => {
        if (props.counter % 30 == 0 || props.counter == 1) getConversations();
    }, [props.counter])


    useEffect(() => {
        getConversations();
    }, [props.warning, props.conversations])

    const getConversations = () => {
        // console.log("Sending conversation request");
        Axios.get('http://127.0.0.1:3001/api/get_conversations/' + props.login.id + '', {
        }).then((res) => {
            // console.log(res.data);
            props.setConversations(res.data);
        });
    }



    return (

        <div className="conversations-list-div">
            Active conversations
            {props.conversations.map((converse) => {
                return (
                    <div key={converse.conversation_id + 20} onClick={() => { props.updateActiveConversation(converse); console.log(converse) }}><h2>{converse.member_1 == props.login.username ? converse.member_2 : converse.member_1}</h2></div>

                )
            })
            }
        </div>
    );
}

export default Conversations_list;
