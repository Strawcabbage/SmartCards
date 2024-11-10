import LoginButton from "./components/LoginButtion";
import LogoutButton from "./components/LogoutButton";
import Profile from"./components/Profile";

function LoginCode() {
    return (
        <div>
            <header>
                <h1>Auth0 Login</h1>
                <LoginButton/>
                <LogoutButton/>
                <Profile/>
            </header>

        </div>
    );
}

export default LoginCode;
