import React from "react";
import Icon from "../../../components/AppIcon";

const ActionButton = ({
  type = "button",
  onClick,
  children,
  variant = "primary",
  isLoading = false,
  disabled = false,
  icon = null,
  iconPosition = "left",
  className = "",
}) => {
  const baseClasses = "btn px-6 py-2 rounded-md font-medium transition-colors duration-200";
  
  const variantClasses = {
    primary: "btn-primary",
    secondary: "btn-secondary",
    outline: "btn-outline",
    ghost: "btn-ghost",
    link: "btn-link",
    destructive: "btn-destructive",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
    >
      {isLoading ? (
        <div className="flex items-center justify-center">
          <Icon name="Loader" className="animate-spin mr-2" size={18} />
          <span>Loading...</span>
        </div>
      ) : (
        <div className="flex items-center justify-center">
          {icon && iconPosition === "left" && (
            <Icon name={icon} className="mr-2" size={18} />
          )}
          {children}
          {icon && iconPosition === "right" && (
            <Icon name={icon} className="ml-2" size={18} />
          )}
        </div>
      )}
    </button>
  );
};

export default ActionButton;