
import '../styles/log_out_warning.scss';
import * as Axios from 'axios';
// import { Axios } from 'axios';
import { useEffect, useState } from 'react';
// Axios.defaults.withCredentials = true;


function Log_Out_Warning(props) {
    const [timer, setTimer] = useState(120) //120 seconds before log out


    useEffect(() => {
        setTimer(timer - 1);
        if (timer <= 0) {
            setTimer(120);
            props.handleLogout();
        }
    }, [props.counter])

    return (
        <div className='log-out-warning-bg'>
            <div className='log-out-warning-container'>
                <h2>Are you still there?</h2>
                <h3>You will logout in:</h3>
                <h2>{timer}</h2>

                <div className='button' onClick={() => {
                    setTimer(120);
                    props.resetLogOutTimer();
                }}>Still here!</div>

                <div className='button' onClick={() => {
                    props.handleLogout();
                }}>No, log me out!</div>
            </div>
        </div>
    )
}

export default Log_Out_Warning;