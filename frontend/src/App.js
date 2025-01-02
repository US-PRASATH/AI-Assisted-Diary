// import logo from './logo.svg';
import './App.css';
import React, {useState, useEffect} from 'react';
import Dashboard from './components/Dashboard';
import logo from "./assets/logo.png";
//import logo from './assets/logo.png'
import IntroScreen from './components/IntroScreen';
import { Route,Routes, useNavigate } from 'react-router';
import JournalEntry from './components/JournalEntry';
import Login from './components/Login';
import Register from './components/Register';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './components/AuthContext';
function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  // useEffect(() => {
   
  //   // if (!isLoggedIn && window.location.pathname === "/") {
  //   //   navigate("/login");
  //   // }
  // }, [isLoggedIn]);
  return (
    <AuthProvider>
    
    <div className="App">
      <img className='h-12' src={logo}></img>
      <Routes>
        <Route path="/" Component={IntroScreen}/>
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login setIsLoggedIn={setIsLoggedIn} />} />
        <Route path="/dashboard" element={
          // <ProtectedRoute isLoggedIn={isLoggedIn}>
          <Dashboard/>
        // </ProtectedRoute>
        }/>
        <Route path="/journalentry/:id" element={
          // <ProtectedRoute isLoggedIn={isLoggedIn}>
          <JournalEntry/>
          // </ProtectedRoute>
        }/>
      </Routes>
    </div>
    </AuthProvider>
  );
}

export default App;
