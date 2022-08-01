
// import '../styles/User_lists.scss';
import * as Axios from 'axios';
import { useEffect, useState } from 'react';
import { timedError } from '../helper/helper';
import New_group from "./New_group"

import Conversations_list from './Conversations_list';
import User_list from './User_list';

function Lists(props) {
    const [userList, setUserList] = useState([]); //List of users
    const [chatList, setChatList] = useState([]);

    const [newGroupTab, setNewGroupTab] = useState({ open: false, type: "chat" }); // open : true/false, mode : "chat"/invite

    const [invites, setInvites] = useState([]);
    const [inviteChatInfo, setInviteChatInfo] = useState();


    //Auto refresh for lists
    useEffect(() => {
        if (props.counter % 20 == 0 || props.counter == 1) {//Gets chatList every x seconds
            getChatList();
        }

        if (props.counter % 20 == 0 || props.counter == 1) {//Gets userList every x seconds
            getUserList();
        }

        if (props.counter % 60 == 0 || props.counter == 1) {//Gets invites every x seconds
            getInvites();
        }
    }, [props.counter])

    //Refresh for mobile tabs
    useEffect(() => {
        if (props.activeTab == "chatList") {
            getChatList();
            getInvites();
        } else if (props.activeTab == "userList") getUserList();
        props.resetStatusTimer() //Resets inactivity timer
    }, [props.activeTab])

    const getInvites = () => {
        Axios.get('http://127.0.0.1:3001/api/get_invites/' + props.login.id + "", {
        }).then((res) => {
            // console.log("getting invites");
            if (res.data == "empty") setInvites([]); //no invites
            else setInvites(res.data); //sets results

        });
    }

    const inviteResponse = (invite_id, group_id, receiver_id, isAccepted) => {
        props.resetStatusTimer() //Resets inactivity timer
        Axios.post('http://127.0.0.1:3001/api/invite_response', {
            inviteID: invite_id,
            groupID: group_id,
            receiverID: receiver_id,
            isAccepted: isAccepted
        }).then((res) => {
            // console.log(res);
            if (res.error) { }
            else if (res.data) {
                getChatList();
                getInvites();
                // console.log("response done");

            }
        })

    }

    useEffect(() => {
        // Refresh trigger for other components
        // console.log(props.refresh)
        if (props.refresh.chats) {
            getChatList();
            props.handleRefresh("chats", false); //Resets status
        }

        if (props.refresh.users) {
            getUserList();
            props.handleRefresh("users", false);
        }

    }, [props.refresh])

    //Gets chatList
    const getChatList = () => {
        // console.log("Getting chatList");
        Axios.get('http://127.0.0.1:3001/api/get_conversations/' + props.login.id + '/' + chatList.length + "", {
        }).then((res) => {
            // console.log(res);
            if (res.data == "noUpdate") return; //No change
            else if (res.data == "noChats") setChatList([]); //DB empty
            else setChatList(res.data); //sets results

        });
    }

    //Gets userList
    const getUserList = () => {
        // console.log("Getting userList")
        Axios.get('http://127.0.0.1:3001/api/get_users', {
        }).then((res) => {
            setUserList(res.data);
        });
    };

    const updateInviteChatInfo = (chat) => {
        // console.log(chat);
        setInviteChatInfo({ name: chat.conversation_name, id: chat.conversation_id })
        updateNewGroupTab("invite");
    }

    const updateNewGroupTab = (mode = null) => {
        //sets the new tab to be of specific mode, 
        // "chat" for creating and inviting new users (new chat button on chats header)
        // "invite" for inviting new users to chat if chat already exist (invite button on individual chat tabs)

        //Toggles between on and off if mode the same or
        //opens it if mode is new
        if (mode == null || mode == newGroupTab.mode) setNewGroupTab(newGroupTab => { return { ...newGroupTab, open: !newGroupTab.open } }); //Toggle
        else if (mode != newGroupTab.mode) setNewGroupTab({ open: true, "mode": mode });

        // console.log(newGroupTab)
        props.resetStatusTimer() //Resets inactivity timer

    }

    //creates or checks for existing chat in user list and chat list.
    const createConversation = (other_user_id, other_username, privateChat = 1, invite = null) => {
        props.resetStatusTimer(); //Resets inactivity timer

        if (other_username == props.login.username && invite == null) {
            // timedError(props.updateError, "userList", "You cannot chat with yourself :P", 5)
            timedError(props.updateError, "info", "You cannot chat with yourself :P", 5)

            //Let user know error
            // console.log("You cannot chat with yourself :P")
            return;
        }

        //If using create new multi members group
        if (invite != null) {
            setNewGroupTab(false); //hide new group tab
        }

        let my_id = props.login.id;
        let my_username = props.login.username;

        Axios.get(`http://127.0.0.1:3001/api/create_conversation/${other_username}/${other_user_id}/${my_id}/${my_username}/${privateChat}`, {
        }).then((res) => {
            // console.log(res.data);
            if (res.data.message == "exist") {
                //Conversation exists (returns conversation_id);
                // console.log("Exists");
                props.updateChatID(res.data.conversation_id); //Sets current chat as existing conversation
                props.updateActiveTab("chat");

            } else if (res.data.message == "success") {
                //Creates new conversation (returns conversation_id)
                // console.log("Success");
                getChatList(); //Updates conversations
                props.updateChatID(res.data.conversation_id)
                props.updateActiveTab("chat");
                if (invite) sendInviteToGroup(res.data.conversation_id, invite);
                // timedError(props.updateError, "chat", "Chat created!", 5)
                timedError(props.updateError, "info", "Chat created!", 5)
            } else {
                // console.log("Failed");
                // console.log(res.data);
            }
        });
    }

    const sendInviteToGroup = (conversation_id, invite) => {
        if (conversation_id == null) updateNewGroupTab();
        Axios.post('http://127.0.0.1:3001/api/send_invites', {
            sender_id: props.login.id,
            conversation_id: conversation_id == null ? inviteChatInfo.id : conversation_id,
            users: conversation_id == null ? invite : invite.users,
            chat_name: conversation_id == null ? inviteChatInfo.name : invite.group_name
        }).then((res) => {
            // console.log(res);
            if (res.error) {
                // console.log("Invite sending failed")
            } else {
                // console.log(res);
                timedError(props.updateError, "info", "Invites send! :)", 5)
            }

        })
    }

    //Sets chat for chat list
    const setChat = (conversation_id) => {
        props.resetStatusTimer();
        props.updateChatID(conversation_id);
        props.updateActiveTab("chat");
    }

    //Removes chat from chat list
    const removeConversation = (chatID, myID, isPrivate = 1) => {
        // console.log("sending delete event");
        Axios.delete('http://127.0.0.1:3001/api/delete_chat/' + chatID + '/' + myID + '/' + isPrivate + '', {
        }).then((res) => {

            if (res.status == 200) {
                // console.log(res)
                // console.log("removed ?");
                // refresh conversations
                // timedError(props.updateError, "chatList", "Chat removed!", 5)
                timedError(props.updateError, "info", "Chat removed!", 5)
                getChatList();

                // console.log(props.activeChat)
                if (props.chatID == chatID) {
                    // console.log(chatID)
                    props.updateChatID(null);
                }

            }
        });
    }

    return (
        <>
            <div className='list-container'>
                {(props.activeTab != "chat" || !props.mobile) &&
                    <>

                        {(props.activeTab == "chatList" || !props.mobile) &&
                            <Conversations_list
                                login={props.login}
                                getChatList={getChatList}
                                chatList={chatList}
                                setChat={setChat}
                                removeConversation={removeConversation}
                                invites={invites}
                                inviteResponse={inviteResponse}
                                updateNewGroupTab={updateNewGroupTab}
                                updateInviteChatInfo={updateInviteChatInfo}
                                userList={userList}
                            // error={props.error} 
                            />

                        }
                        {(props.activeTab == "userList" || !props.mobile) &&
                            <User_list
                                login={props.login}
                                getUserList={getUserList}
                                userList={userList}
                                createConversation={createConversation}
                            // error={props.error} 
                            />
                        }

                        {newGroupTab.open &&
                            <New_group
                                userList={userList}
                                // prepareGroup={prepareGroup}
                                newGroupTab={newGroupTab}
                                login={props.login}
                                createConversation={createConversation}
                                updateNewGroupTab={updateNewGroupTab}
                                sendInviteToGroup={sendInviteToGroup}
                            />
                        }

                    </>
                }
            </div>


        </>
    );
}



export default Lists;
