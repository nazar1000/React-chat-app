import '../styles/Conversations_list.scss';
import { capitaliseLetter } from '../helper/helper';


function Conversations_list(props) {
    return (
        <div className="conversations-list-div">
            <div className='list__header'>
                <h3>Chats</h3>
                {/* <p className='error'>{props.error?.chatList}</p> */}

                <img className='refresh-button' src={require('../icons/refresh-icon.png')} alt="Refresh-button" onClick={() => props.getChatList()} />
                <img className='new-chat-button' src={require('../icons/add.png')} alt="Create new chat" onClick={() => props.updateNewGroupTab("chat")} />
            </div>

            {props.invites.map((invite) => {
                return (
                    <div className='invite'>
                        <h2>Invite to  {invite.group_name} from {invite.sender_id}</h2>
                        <div className='button' onClick={() => { props.inviteResponse(invite.invite_id, invite.group_id, invite.receivers_id, true) }}>Accept</div>
                        <div className='button' onClick={() => { props.inviteResponse(invite.invite_id, invite.group_id, invite.receivers_id, false) }}>Reject</div>

                    </div>
                )
            })

            }

            {props.chatList.map((converse) => {
                return (
                    <div className='conversation' key={converse.conversation_id + 20} onClick={(e) => { props.setChat(converse.conversation_id) }}>
                        <div className='profile-img'>
                            <img />
                        </div>
                        <h2>{converse.member_1 == props.login.username ? capitaliseLetter(converse.member_2) : capitaliseLetter(converse.member_1)}</h2>
                        <div className='conversation__tools'>


                            <img className='remove' src={require('../icons/delete.png')} alt="delete conversation"
                                onMouseOver={(e) => e.target.src = require('../icons/delete-filled.png')}
                                onMouseOut={(e) => e.target.src = require('../icons/delete.png')}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    console.log("Delete button clicked");
                                    props.removeConversation(converse.conversation_id, props.login.id, converse.private_conversation);
                                }} />

                            {converse.private_conversation == 0 &&
                                <img className='add-users-button' src={require('../icons/add-user.png')} alt="Invite users"
                                    onMouseOver={(e) => e.target.src = require('../icons/add-user-filled.png')}
                                    onMouseOut={(e) => e.target.src = require('../icons/add-user.png')}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        props.updateInviteChatInfo(converse);
                                        // props.updateNewGroupTab("invite");

                                    }} />}


                        </div>
                    </div>
                )
            })
            }
        </div>
    );
}

export default Conversations_list;
