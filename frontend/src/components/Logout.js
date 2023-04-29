import React, { useContext } from "react";
import { SessionContext } from "./SessionContext";
import { useNavigate } from "react-router-dom";

const Logout = () => {
  const navigate = useNavigate();
  const { setSessionData } = useContext(SessionContext);

  const handleLogout = async () => {
    fetch("http://localhost:3000/logout", {
      method: "POST",
      credentials: "include",
    }).then((response) => {
      if (!response.ok) {
        throw new Error("Invalid response");
      }
    })

      setSessionData(null);
      navigate("/");
  };

  return <button onClick={handleLogout}>Logout</button>;
};

export default Logout;