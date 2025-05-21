import React from "react";
import Icon from "../../../components/AppIcon";

const ActionButton = ({ onClick, label, icon, disabled = false }) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="btn btn-primary py-2 px-6 flex items-center"
    >
      <span className="mr-2">{label}</span>
      {icon && <Icon name={icon} size={18} />}
    </button>
  );
};

export default ActionButton;