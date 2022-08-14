import '../styles/User_list.scss';
import { capitaliseLetter } from '../helper/helper';

function User_list(props) {


    return (
        <>
            <div className="user-list-div">
                <div className='list__header'>
                    <h3>
                        User list
                    </h3>
                    <img className='refresh-button' src={require('../icons/refresh-icon.png')} onClick={() => props.getUserList()} />

                </div>
                {props.userList.map((user, key) => {
                    let img = "https://loremflickr.com/64/64/human?random=" + user.contact_id;
                    return (
                        <div className='user' key={user.contact_id + 25} onClick={() => { props.createConversation(user.contact_id, user.user_name) }}>
                            <div className='profile-img' >
                                <img src={img} />
                                <div className='user__active' style={user.status == 2 ? { backgroundColor: "green" } : { backgroundColor: "yellow" }}></div>
                            </div>
                            <h2>{capitaliseLetter(user.user_name)}</h2>
                            <p>{(user.message ? user.message?.senderName + ": " + user.message?.messageText : "")}</p>
                            <div className='user__tools'>


                            </div>
                        </div>
                    )
                })
                }
            </div>

        </>
    );
}

export default User_list;
