// src/views/KidView.jsx
import React from "react";
import GenericReadingView from "./GenericReadingView";

const KidView = ({ moduleContext }) => {
  return <GenericReadingView modeId="child" moduleContext={moduleContext} />;
};

export default KidView;