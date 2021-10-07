import { Meteor } from 'meteor/meteor';
import React, { useState, Fragment, useEffect } from "react";
import { getModules, Module } from "./Module.jsx";
import { Feedback } from "./Feedback.jsx";
import { useTracker } from 'meteor/react-meteor-data';

export const StudentView = ({ user }) => {
  const [module, setModule] = useTracker(() => {
    return getModules(user);
  });
  
  return (
    <div className="studentModule">
      <Fragment>
        <Module module={module} title={user.username} />
        <Feedback module={module} />
      </Fragment>  
    </div>
  );
};
