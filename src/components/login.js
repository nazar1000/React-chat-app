
import '../styles/Login.scss';
import * as Axios from 'axios';
// import { Axios } from 'axios';
import { useState } from 'react';
// Axios.defaults.withCredentials = true;
import { timedError } from '../helper/helper';



function Login(props) {
    const [input, setInput] = useState(""); //login form
    Axios.defaults.withCredentials = true;

    const handleLogin = () => {

        let userInput = input.trim();
        //Checks login for invalid pattern
        let pattern = /[^a-z 1-9_-]/i;
        let pattern1 = /\s/i;

        let error = "";



        if (userInput.match(pattern) != null) error += "Only a-z, 1-9, - and _ are allowed, \n";
        if (userInput.match(pattern1) != null) error += "Username cannot have spaces \n";
        if (userInput == "") error += "Username cannot be empty! ";
        //create error message here
        // console.log(error);


        // if (error != "" || input == "") return;
        if (error != "") {
            // props.updateError("login", error)
            timedError(props.updateError, "error", error, 10)
            return;
        }

        // event.preventDefault();
        // if (error.downloadError) return;

        //Currently works both as login and register as no password is required;
        Axios.post('http://127.0.0.1:3001/api/login', {
            username: userInput,
        }).then((res) => {
            // console.log(res);
            if (res.error) {
                if (res.error == "User exists") console.log("Error: userExist"); // User exists
                else if (res.error.code == "ECONNREFUSED") console.log("Error: Connection Error");// No connection to db
            } else if (res.data.contact_id) {
                // console.log(res.data)
                // console.log(res);
                props.handleLogin(res.data);
                props.updateError("error", "", true);
                timedError(props.updateError, "info", "Successful login", 10)
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
        <div className='login-bg'>
            <div className="login-div">

                <h1>Login</h1>
                <h3>Enter your username:</h3>
                <input type="text" pattern='[abc][0-9]' placeholder='Username' onChange={(e) => { setInput(e.target.value) }}></input>

                <div className="button" onClick={handleLogin}>Login</div>
                <p className='error'>{props.error?.login}</p>
            </div>
        </div>
    );
}

export default Login;
