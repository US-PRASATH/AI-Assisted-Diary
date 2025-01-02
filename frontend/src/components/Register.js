import React, { useState, useContext } from 'react';
// import { UserContext } from './UserContext';
import { useNavigate } from "react-router";
import api from '../api';

const Register = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    companyName: "",
  });

  const navigate = useNavigate();
  // const { setUser } = useContext(UserContext);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    api.post("/register",{
      "email":formData.email,
      "password":formData.password
    }).then((response)=>{
      try{
      // props.setIsLoggedIn(true);
      navigate("/login");
      console.log(response);
    }
    catch(e){
      alert("Invalid credentials");
    }
    });
    // if (formData.password === formData.confirmPassword) {
    //   alert(`Registration successful`);
    //   setUser(formData);
    //   navigate("/login");
    // } else {
    //   alert("Passwords do not match");
    // }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-8 bg-white shadow-lg rounded-lg">
        <h2 className="text-2xl font-bold text-center text-gray-800">Register</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700">Username</label>
            <input
              type="text"
              name="username"
              id="username"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              onChange={handleChange}
              value={formData.username}
            />
          </div> */}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              name="email"
              id="email"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              onChange={handleChange}
              value={formData.email}
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              name="password"
              id="password"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              onChange={handleChange}
              value={formData.password}
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              id="confirmPassword"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              onChange={handleChange}
              value={formData.confirmPassword}
            />
          </div>

          {/* <div>
            <label htmlFor="companyName" className="block text-sm font-medium text-gray-700">Company Name</label>
            <input
              type="text"
              name="companyName"
              id="companyName"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              onChange={handleChange}
              value={formData.companyName}
            />
          </div> */}

          <div>
            <input
              type="submit"
              value="Register"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            />
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
