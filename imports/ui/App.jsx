import { Meteor } from 'meteor/meteor';
import React, { useState, Fragment } from "react";
import { Info, createModule } from "./Info.jsx";
import { Feedback } from "./Feedback.jsx";
import { useTracker } from 'meteor/react-meteor-data';
import { LoginForm } from './LoginForm.jsx';

export const App = () => {
  const user = useTracker(() => Meteor.user());
  const [moduleID, setModuleID] = useState(createModule());

  return (
    <div className="app">
      { user ? (
        <Fragment>
          <Info moduleID={moduleID} />
          <Feedback moduleID={moduleID} />
        </Fragment>
      ) : (
        <LoginForm />
      )}      
    </div>
  );
};
