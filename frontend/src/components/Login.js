import React, { useState, useContext } from "react";
import { useNavigate } from 'react-router-dom';
import { SessionContext } from "./SessionContext";

function Login() {
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const { sessionData, setSessionData } = useContext(SessionContext);
  const navigate = useNavigate();

  const handleNameChange = (event) => {
    setName(event.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (sessionData) {
      setError("You are already logged in.");
      return;
    } else {
      try {
        const response = await fetch("http://localhost:3000/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ name }),
          credentials: "include",
        });
        if (response.ok) {
          setName("");
          setError("");
          const data = await response.json();
          if (data && data.userId) {
            setSessionData(name);
            navigate('/feed');
          }
        } else if (response.status === 404) {
          setError("User not found");
        } else {
          setError("Unexpected error occurred");
        }
      } catch (error) {
        setError("Network error occurred");
      }
    }
  };

  return (
    <div className="signing">
      <h1>Login</h1>
      <form onSubmit={handleSubmit}>
        <div className="form-control">
          <label>Name: </label>
          <input
            type="text"
            id="name"
            name="name"
            value={name}
            onChange={handleNameChange}
            required
          />
        </div>
        <br/>
        <button type="submit">Login</button>
      </form>
      {error && <div className="error">{error}</div>}
    </div>
  );
};

export default Login;
