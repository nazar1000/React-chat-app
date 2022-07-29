import { useEffect, useState } from "react";
import '../styles/New_group.scss';
import { capitaliseLetter } from "../helper/helper"

function New_group(props) {
    const [input, setInput] = useState("");
    const [selectedUsers, setSelectedUsers] = useState([]);

    useEffect(() => {
        setInput(""); //reset

        //creates list of users to choose
        let arr = [];
        if (selectedUsers[0] == undefined) {
            props.userList.forEach(user => {
                if (user.contact_id != props.login.id) arr.push([user.contact_id, user.user_name, false]);
            })
        }
        setSelectedUsers(arr);
    }, [props.newGroupTab])


    const insertID = (index) => {
        let arr = [];
        arr = selectedUsers;
        // console.log(arr);
        arr[index][2] = !arr[index][2];
        setSelectedUsers(arr);
    };

    const prepareInvitation = () => {
        let groupName = input;
        let newUsers = [];

        selectedUsers.forEach(user => {
            if (user[2]) {
                newUsers.push([user[0], user[1]])
            }
        });

        if (props.newGroupTab.mode == "chat") {
            let invite = {
                "group_name": groupName,
                users: newUsers
            }
            props.createConversation(null, groupName, 0, invite);
        } else {
            props.sendInviteToGroup(null, newUsers)
        }


        // props.prepareGroup(groupName, users);

    }

    //new group, add-invites

    return (
        <div className="new-group-div">

            {props.newGroupTab.mode == "chat" &&
                <>
                    <h1>Enter group name</h1>
                    <input className="group-input" placeholder="Group name" value={input} onChange={(e) => { setInput(e.target.value) }} required ></input>
                </>
            }

            {props.newGroupTab.mode == "invite" &&
                <h1>Select users to invite</h1>
            }


            <h2>{selectedUsers.length > 0 ? "Invite users!" : "No users to invite :("}</h2>
            <div className="users">
                {selectedUsers.map((user, index) => {
                    return (
                        <div key={user[0]} className={user[2] ? "user highlight" : "user"} onClick={() => insertID(index)}>
                            <div className='profile-img'>
                                <img />
                                <div className='user__active'></div>
                            </div>
                            <h2>{capitaliseLetter(user[1])}</h2>
                            {user[2] && <img src={require('../icons/check.png')} alt="Checked" />}

                        </div>
                    )
                })
                }
            </div>

            <div className="button" onClick={() => prepareInvitation()}>Create</div>
            <div className="button" onClick={() => props.updateNewGroupTab()}>Cancel</div>
        </div>
    );
}

export default New_group;
