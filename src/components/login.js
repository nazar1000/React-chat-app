
import '../styles/Login.css';
import * as Axios from 'axios';
// import { Axios } from 'axios';
import { useState } from 'react';
// Axios.defaults.withCredentials = true;



function Login(props) {
    const [input, setInput] = useState(""); //login form

    Axios.defaults.withCredentials = true;

    const handleLogin = () => {

        // let pattern = /[^a-z^1-9_-\S\0]/i;
        // let result = input.match(pattern);
        // console.log(result);
        // if (result != null) return;
        //set error;

        // event.preventDefault();
        // if (error.downloadError) return;

        Axios.post('http://127.0.0.1:3001/api/register', {
            username: input,
        }).then((res) => {
            // console.log(res);
            if (res.error) {
                if (res.error == "User exists") console.log("Error: userExist"); // User exists
                else if (res.error.code == "ECONNREFUSED") console.log("Error: Connection Error");// No connection to db
            } else if (res.data.contact_id) {
                // console.log(res);
                props.handleLogin(res.data);
            }


            // if (!res.data.auth) {
            // setLoginStatus(false);
            // signOut();
            // }
            // else {

            // localStorage.setItem("token", res.data.token)
            // setLoginStatus(true);
            // setPage("home");

            //Setting cookie for login
            // setCookie("user_name", res.data.result.first_name, { maxAge: 60 * 24 * 3 });
            // setCookie("user_email", res.data.result.email, { maxAge: 60 * 24 * 3 });
            // console.log(cookie)
            // console.log("Login: Response");
            // console.log(res.data);
            // }
        })
    }



    return (
        <div className="login-div">

            <h1>Login</h1>
            <h3>Enter your nick:</h3>
            <input type="text" pattern='[abc][0-9]' onChange={(e) => { setInput(e.target.value) }}></input>
            <div className="button" onClick={handleLogin}>Login</div>
        </div>
    );
}

export default Login;
