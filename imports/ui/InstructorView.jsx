import { Meteor } from 'meteor/meteor';
import React, { useState, Fragment, useEffect } from "react";
import { getModules, Module } from "./Module.jsx";
import { Feedback } from "./Feedback.jsx";
import { useTracker } from 'meteor/react-meteor-data';
import { LoginForm } from './LoginForm.jsx';

export const InstructorView = ({ user }) => {
  const [modules, setModules] = useTracker(() => {
    return getModules(user);
  });

  const getStudentName = (id) => {
      const student = Meteor.users.find({ _id: id }).fetch()[0];
      return student.username;
  }

  const submitFeedback = () => {
      alert("submitted")
  }

  return (
    <div className="InstructorView">
        <Fragment>
            {getModules(user).map((module) => 
                <Fragment key={module._id}>
                    <Module module={module} title={getStudentName(module.user)}/>
                    <form onSubmit={submitFeedback}>
                        <input></input>
                        <button>Submit</button>
                    </form>
                </Fragment>
            )}
        </Fragment>
    </div>
  );
};
