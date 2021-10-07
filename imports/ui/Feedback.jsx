import React from "react";
import { FeedbackCollection } from "../api/modules";
import { useTracker } from "meteor/react-meteor-data";

export const Feedback = ({ module }) => {
  const feedback = useTracker(() => {
    return FeedbackCollection.find({ module: module._id }).fetch();
  });

  return (
    <div className="feedback-container">
      <h3>{"Feedback service"}</h3>
      <div className="allFeedback">
        {feedback.map((feedback) => (
          <div className="feedback" key={feedback._id}>
            <b>{feedback.body}</b>
          </div>
        ))}
      </div>
    </div>
  );
};
