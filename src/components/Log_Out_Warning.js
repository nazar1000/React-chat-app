
// import '../styles/Login.css';
import * as Axios from 'axios';
// import { Axios } from 'axios';
import { useEffect, useState } from 'react';
// Axios.defaults.withCredentials = true;


function Log_Out_Warning(props) {

    useEffect(() => {
        if (props.logOutTimer <= 0) props.logout();

    }, [props.logOutTimer])



    return (
        <div>
            <h3>Are you still there?</h3>
            <h2>You will logout in:</h2>
            <h2>{props.logOutTimer}</h2>

            <div onClick={() => { props.resetLogOutTimer() }}>Still here!</div>
        </div>
    )
}

export default Log_Out_Warning;