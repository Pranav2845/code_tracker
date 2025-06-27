// File: src/pages/onboarding/components/ValidationMessage.jsx
import React from "react";
import Icon from "../../../components/AppIcon";

const ValidationMessage = ({ message }) => {
  if (!message) return null;
  
  return (
    <div className="flex items-center mt-1 text-error text-sm">
      <Icon name="AlertCircle" size={14} className="mr-1" />
      <span>{message}</span>
    </div>
  );
};

export default ValidationMessage;