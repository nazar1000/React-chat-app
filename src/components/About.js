import "../styles/About.scss"

function About(props) {

    return (
        <div className="help">
            <h1>About</h1>

            <ul>
                <li><h3>This website is just a personal project.</h3></li>
                <li><h3>Please don't send personal information as this chat is not secured.</h3></li>
                <li><h3>All messages are deleted every 30 minutes, you can see the timer at the bottom of the screen </h3></li>
                <li><h3>Everything you do here is at your own risk.</h3></li>
                <li><h3>Glitches may occur</h3></li>
            </ul>
        </div>
    )
}

export default About