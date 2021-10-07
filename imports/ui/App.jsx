import { Meteor } from 'meteor/meteor';
import React, { useState, Fragment, useEffect } from "react";
import { getModules, Module } from "./Module.jsx";
import { Feedback } from "./Feedback.jsx";
import { useTracker } from 'meteor/react-meteor-data';
import { LoginForm } from './LoginForm.jsx';
import { StudentView } from './StudentView.jsx';
import { InstructorView } from './InstructorView.jsx';

export const App = () => {
  const user = useTracker(() => Meteor.user());
  
  return (
    <div className="app">
      { user ? (user.username == "instructor" ? ( <InstructorView user={user} /> ) : ( <StudentView user={user} /> )) : ( <LoginForm/> )  }      
    </div>
  );
};
