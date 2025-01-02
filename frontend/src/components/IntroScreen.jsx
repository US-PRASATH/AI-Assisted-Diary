import React from "react";
import { Link } from "react-router";
import logo from "../assets/logo.png";
function IntroScreen(){
    return(
        <div>
        <img className='h-12' src={logo}></img>
      <h1 className='text-5xl mt-60'>your daily dose of gratitude and positivity</h1>
      <div className="mt-6">
      <Link to="/login" className='text-xl mt-6 bg-gray-800 text-white rounded-full px-3 py-3'>Open Diary -></Link>
      </div>
        </div>
    );
}
export default IntroScreen;