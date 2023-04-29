import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import Login from './components/Login';
import LogoutButton from './components/Logout';
import Posts from './components/Posts';
import Register from './components/Register';
import SessionProvider from './components/SessionProvider';
import './App.css';
import image from './images/limeIcon256.svg'

function App() {
  return (
    <SessionProvider>
      <div className="app">
      <Router className="router">  
        <div className='App-header'>
          <ul>
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <Link to="/register">Register</Link>
            </li>
            <li>
              <Link to="/login">Login</Link>
            </li>
            <li>
              <Link to="/feed">Feed</Link>
            </li>
            <li>
              <LogoutButton/>
            </li>
          </ul>
        </div>
        <Routes>
          <Route path="/" element={<div className="home"><h1 className="welcome">WELCOME</h1><img src={image}/></div>}/>
          <Route path="/register" element={<Register/>} />
          <Route path="/login" element={<><Login/></>} />
          <Route path="/logout" element={<LogoutButton/>} />
          <Route path="/feed" element={<Posts/>} />
        </Routes>
      </Router>
      </div>
    </SessionProvider>

  );
}

export default App;
