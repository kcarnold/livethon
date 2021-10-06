import React, { useState } from "react";
import { Info, createModule } from "./Info.jsx";
import { Feedback } from "./Feedback.jsx";

export const App = () => {
  const [moduleID, setModuleID] = useState(createModule());

  return (
    <div className="app">
      <Info moduleID={moduleID} />
      <Feedback moduleID={moduleID} />
    </div>
  );
};
