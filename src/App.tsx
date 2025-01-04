import { useEffect } from "react";
// import { invoke } from "@tauri-apps/api/core";
import { fetch } from '@tauri-apps/plugin-http';
import { useAppState } from "./AppState";
import { useNavigate } from "react-router";
import LoadingCircle from "./components/LoadingCircle";

export default function App() {
  let navigate = useNavigate();
  const { apiPrefix, sessionId, setLoggedIn, setApiPrefix, setSessionId } = useAppState()

  useEffect(() => {
    async function checkLoginStatus() {
      if (!apiPrefix || !sessionId) {
        setLoggedIn(false)
        navigate("/login")
        return
      }
      setApiPrefix(apiPrefix)

      const check = await fetch(`${apiPrefix}/check-session?sessionHash=${sessionId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      }).then(response => response.json())

      if (check.hasErrors) {
        setLoggedIn(false)
        navigate("/login")
        return
      }

      setSessionId(sessionId)
      setLoggedIn(true)

      navigate("/dashboard")
    }

    checkLoginStatus();
  }, []);

  return (
    <div className="h-screen w-screen">
      <LoadingCircle />
    </div>
  )
}