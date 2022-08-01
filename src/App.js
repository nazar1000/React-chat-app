import axios, * as Axios from 'axios';
import { useState } from 'react';
import { useEffect } from 'react';
// import './styles/App.css';
import './styles/main.scss'
import { capitaliseLetter, timedError } from './helper/helper';


import Login from "./components/login.js";
import Chat from "./components/Chat.js";
import Log_Out_Warning from "./components/Log_Out_Warning.js";
import Lists from './components/Lists.js';
import About from "./components/About.js"

function App() {
  // Login
  const [login, setLogin] = useState(""); //User info
  const [logOutTimer, setLogOutTimer] = useState(30 * 60) //30 minutes, user will be shown logOutWarning
  const [logOutWarning, setLogOutWarning] = useState(false); //LogOutWarning toggle
  const [helpPage, setHelpPage] = useState(false);

  const [popUpError, setPopUpError] = useState(); //Container for current error
  const [popUpInfo, setPopUpInfo] = useState(); //Container for current error

  //Mobile menu
  const [menu, setMenu] = useState({ mobile: true, open: false }); //state for detecting mobile mode and whether nav is open
  const [activeTab, setActiveTab] = useState("chats"); //active tabs for mobile

  //Chats
  const [chatID, setChatID] = useState(null); //Used to update conversation in chat window

  //Timer
  const [counter, setCounter] = useState(0); //global timer used for automatic refresh
  const [refresh, setRefresh] = useState({ users: false, chats: false, chat: false }); //manual refresh trigger for components
  const [resetTimer, setResetTimer] = useState(1000); //Server remaining time till all messages will be deleted
  const [statusTimer, setStatusTimer] = useState(300); //Changes status if user is inactive
  // Axios.defaults.withCredentials = true;


  //Resizes at the the start
  useEffect(() => {
    window.addEventListener("resize", () => resize());
    resize();
  }, [])

  //Counters
  useEffect(() => {
    //Timer, counts and decides about inactivity
    const timer = setInterval(() => {
      setCounter(counter + 1); //App counter

      if (login.id != undefined) {
        if (!logOutWarning) {
          //logout warning after 30 min of inactivity
          setLogOutTimer(logOutTimer => logOutTimer - 1);
          if (logOutTimer <= 0) setLogOutWarning(true);
        }

        //User activity - checks and updates whether user is still active every 5 min
        if (statusTimer > 0) setStatusTimer(statusTimer => statusTimer - 1);
        else if (statusTimer == 0) {
          updateStatusDB(1) // 2 online, 1 away, 0 offline
          setStatusTimer(-1); //Stops timer until user becomes active;
        }
        //Server reset timer
        if (resetTimer > 0) setResetTimer(resetTimer => resetTimer - 1);
        else if (resetTimer <= 0) setResetTimer(30 * 60);

      }

    }, 1000);
    return () => clearInterval(timer)

  }, [counter]);


  //if activity is detected
  const resetStatusTimer = () => {
    setStatusTimer(300);
    if (logOutTimer < 300) resetLogOutTimer();
    if (login.status == 1) updateStatusDB(2);
    // console.log(login.status)
  }

  //Updates user status in db
  const updateStatusDB = (status) => {
    Axios.put('http://127.0.0.1:3001/api/update_user_status', {
      "status": status,
      "userID": login.id
    }).then((res) => {
      if (res) {
        console.log("Updated status");
        setLogin(login => { return { ...login, "status": status } });
      }
    })
  }

  const resetLogOutTimer = () => {
    setLogOutTimer(30 * 60);
    setLogOutWarning(false);
    handleRefresh("users", true);
    handleRefresh("chats", true);
  }

  // Mobile menu
  const resize = () => {
    let windowWidth = window.innerWidth;

    if (windowWidth < 500) {
      setMenu({ mobile: true, open: false });
      setActiveTab("chatList");
    }
    else if (windowWidth >= 500) {
      setMenu({ mobile: false, open: true });
    }
  }

  const toggleNav = () => {
    setMenu(menu => { return { ...menu, open: !menu.open } });  //Toggles mobile menu
    // console.log(menu)
    return;
  }

  //Login
  const handleLogin = (loginData) => {
    // console.log(loginData);
    setLogin({
      id: loginData.contact_id,
      username: loginData.user_name,
      reset: loginData.reset,
      status: loginData.status
    });
    setResetTimer(loginData.reset);
    setCounter(0); //resets counter for no reason :P
    setChatID(null)//Resets chat;
    resetLogOutTimer(); //Resets inactivity warning timer


    //If after user has been logged off
    if (menu.mobile) {
      setActiveTab("chatList");
      // setActiveTab("userList"); //Errors chatList needs to be first to download chatList before users
    }
  }

  //Removes user
  const handleLogout = () => {
    let id = login.id;
    setLogin(""); // Logs user out
    if (menu.mobile) setMenu(menu => { return { ...menu, open: false } }); //Toggles menu on mobile

    //Remove user data
    Axios.post('http://127.0.0.1:3001/api/logout', {
      userID: id,
    }).then((res) => {
      // if (res) console.log(res.data);
      timedError(updateError, "info", "User logout!", 5)
    })

  }

  //Updates for components (sets the chat)
  const updateChatID = (chatID) => {
    setChatID(chatID);
  }

  //Manual refresh so other components know when to refresh
  const handleRefresh = (component, status) => {
    setRefresh(refresh => { return { ...refresh, [component]: status } });
  }

  //Error message
  const updateError = (type, message, clear = false) => {
    if (type == "error" && clear) setPopUpError();
    else if (type == "info" && clear) setPopUpInfo();

    // else setError({ [type]: message })
    else if (type == "error") setPopUpError(message);
    else if (type == "info") setPopUpInfo(message);
  }

  //Toggle for help page
  const toggleHelpPage = () => {
    setHelpPage(!helpPage)
    console.log(helpPage)
  }

  // Active tab for mobiles
  const updateActiveTab = (tabName) => {
    setActiveTab(tabName);
  }

  //Debug
  const test = () => {
    console.log(login)
    console.log("Chat ID " + chatID)
    console.log(activeTab);
    console.log(resetTimer);
    if (menu) {
      console.log(menu.mobile);
    } else console.log("menu is false");
  }

  return (
    <div className="App">
      <div className='debug'>
        <h3>Counter: {counter}</h3>
        <h3>Logout in: {logOutTimer}</h3>
        <h3>Status change in: {statusTimer}</h3>
        <h3>Server reset: {resetTimer}</h3>
        <button onClick={() => { test() }}> debug</button>
      </div >


      <div className='notification-div'>
        {popUpError && <h1 className='pop-up__error'>{popUpError}</h1>}
        {popUpInfo && <h1 className='pop-up__info'>{popUpInfo}</h1>}
      </div>

      {login == "" &&
        <Login
          handleLogin={handleLogin}

          error={popUpError}
          updateError={updateError} />
      }

      {helpPage == true &&
        <About toggleHelpPage={toggleHelpPage} />
      }

      {
        logOutWarning && login != "" &&
        <Log_Out_Warning counter={counter} logOutTimer={logOutTimer} resetLogOutTimer={resetLogOutTimer} handleLogout={handleLogout} />
        // <h1>Warning?</h1>
      }

      {
        login != "" && !logOutWarning &&
        <>
          {(activeTab != "chat" || !menu.mobile) &&
            <nav>
              <div className='nav__settings-menu' >
                {/* {console.log(login)} */}
                <h2>{"Hi " + capitaliseLetter(login?.username)}</h2>
                <h2 className='reset-text'>{"Reset in " + (Math.round(resetTimer / 60)) + " min"}</h2>
                <div className='nav__burger' onClick={() => { toggleNav() }}>
                  <div style={menu.open ? { backgroundColor: "rgb(255,0,0)" } : {}}></div>
                  <div style={menu.open ? { backgroundColor: "rgb(255,0,0)" } : {}}></div>
                  <div style={menu.open ? { backgroundColor: "rgb(255,0,0)" } : {}}></div>
                </div>
                {(!menu.mobile || (menu.open && menu.mobile)) &&
                  <ul>
                    <li onClick={() => handleLogout()}><h3>Log out</h3></li>
                  </ul>
                }
                <img className='help-button' src={require('./icons/help-white.png')} onClick={() => setHelpPage(helpPage => !helpPage)} />


              </div>
              <div className='nav__chat-menu'>
                <ul>
                  <li onClick={() => { setActiveTab("chatList"); handleRefresh("chats", true) }}><h3 style={activeTab == "chatList" ? { color: "#c5c5c5" } : {}}>Chats</h3></li>
                  <li onClick={() => { setActiveTab("userList"); handleRefresh("users", true) }}><h3 style={activeTab == "userList" ? { color: "#c5c5c5" } : {}}>Users</h3></li>
                </ul>
              </div>
            </nav>
          }

          {(activeTab != "chat" || !menu.mobile) &&
            // <div className='list-container'>
            // {activeTab != "chat" &&
            <Lists
              login={login}
              counter={counter}

              chatID={chatID}
              updateChatID={updateChatID}

              updateActiveTab={updateActiveTab}
              activeTab={activeTab}

              mobile={menu.mobile}
              refresh={refresh}
              handleRefresh={handleRefresh}
              resetStatusTimer={resetStatusTimer}

              updateError={updateError}
            />
            // }
            // </div>
          }


          {(activeTab == "chat" || !menu.mobile) &&
            <Chat
              login={login}
              counter={counter}

              chatID={chatID}
              setActiveTab={setActiveTab}

              mobile={menu.mobile}

              updateError={updateError}

              resetStatusTimer={resetStatusTimer} />

          }
        </>
      }


    </div >
  );
}


export default App;


