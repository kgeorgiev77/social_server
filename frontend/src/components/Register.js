import React, { useState } from "react";

function Register() {
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleNameChange = (event) => {
    setName(event.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await fetch("http://localhost:3000/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name }),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error);
      }
      setName("");
      setError("");
      setSuccess(true);
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className="signing">
      <h1>Register</h1>
      <form onSubmit={handleSubmit}>
        <div>
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
        <button type="submit">Register</button>
      </form>
      {error && <div className="error">{error}</div>}
      {success && (
        <div className="success">
          Registered successfully! You can now login.
        </div>
      )}
    </div>
  );
}

export default Register;
