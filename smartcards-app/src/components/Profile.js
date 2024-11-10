import { useAuth0 } from '@auth0/auth0-react';

const Profile = () => {
    const { user, isAuthenticated } = useAuth0();
    return (
        isAuthenticated && (
            <div style={{cursor: "pointer"}}>
                {/*style={{cursor: "pointer", border: "2px solid black", borderRadius: "30px", width: "fit-content", padding: "40px 80px 40px 80xp", margin: "auto"}}*/}
                <h1>Welcome Back, {user?.name}</h1>
                <h2>Click here to continue</h2>
            </div>

            // <article>
            //     {user?.picture && <img src={user.picture} alt={user?.name} />}
            //     <h2>{user?.name}</h2>
            //     <ul>
            //         {
            //             Object.keys(user).map((objKey, i) => <li key={i}>{objKey}: {user[objKey]}</li>)
            //         }
            //     </ul>
            // </article>
        )
    )
}

export default Profile