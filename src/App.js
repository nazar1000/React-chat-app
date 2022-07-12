// import { Axios } from 'axios';
import { useState } from 'react';
import { useEffect } from 'react';
import './styles/App.css';


import Login from "./components/login.js";
import User_list from "./components/User_list.js";
import Chat from "./components/Chat.js";
import Conversations_list from "./components/Conversations_list.js";
import Log_Out_Warning from "./components/Log_Out_Warning.js";
import New_group from "./components/New_group.js";

function App() {
  const [login, setLogin] = useState("");
  const [logOutTimer, setLogOutTimer] = useState(60 * 30) //30 minutes
  const [logOutWarning, setLogOutWarning] = useState(false);
  // console.log(login);
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState([]);
  const [counter, setCounter] = useState(0);


  // Axios.defaults.withCredentials = true;

  useEffect(() => {

    const timer = setInterval(() => {
      setCounter(counter + 1);
      if (login.id != undefined) setLogOutTimer(logOutTimer - 1);
      // console.log("hello");
      if (logOutTimer <= 60 * 2) setLogOutWarning(true);
    }, 1000);
    return () => clearInterval(timer)
  }, [counter]);

  // useEffect(() => {
  //   let time = setTimeout(() => {
  //     console.log("works");
  //     setCounter(counter + 1);
  //   }, 1000);
  //   return () => clearTimeout(time);
  // }, [counter]);


  //Removes user
  const logOutUser = () => {
    setLogin(""); // Logs user out
    //Remove user data ?
  }

  const resetLogOutTimer = () => {
    setLogOutTimer(60 * 30);
    setLogOutWarning(false);
  }



  const updateActiveConversation = (converse) => {
    setActiveConversation(converse);
    console.log("updating conversation now")
    console.log(converse)
    console.log(activeConversation);
  }


  const handleLogin = (loginData) => {
    // console.log(log);
    setLogin({ id: loginData.contact_id, username: loginData.user_name });
    setCounter(0);
    resetLogOutTimer();
  }

  return (
    <div className="App">

      <h1>Counter: {counter}</h1>
      <h1>Logout in: {logOutTimer}</h1>

      {login == "" &&

        <Login handleLogin={handleLogin} />
      }

      {logOutWarning && login != "" &&
        <Log_Out_Warning logOutTimer={logOutTimer} resetLogOutTimer={resetLogOutTimer} logout={logOutUser} />
        // <h1>Warning?</h1>
      }

      {login != "" && !logOutWarning &&
        <>
          <div className='container'>
            <Conversations_list login={login} warning={logOutWarning} updateActiveConversation={updateActiveConversation} counter={counter} setConversations={setConversations} conversations={conversations} />
            <User_list login={login} warning={logOutWarning} counter={counter} updateActiveConversation={updateActiveConversation} conversations={conversations} />
          </div>
          <Chat activeConversation={activeConversation} login={login} counter={counter} />
        </>
      }


    </div>
  );
}

export default App;
// TODO

// FIX dates Done
// Removing user ?