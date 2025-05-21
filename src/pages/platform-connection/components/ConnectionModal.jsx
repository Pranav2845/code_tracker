import React, { useState, useEffect, useRef } from "react";
import Icon from "../../../components/AppIcon";
import FormInput from "./FormInput";

const ConnectionModal = ({ platform, onClose, onConnect, isConnecting }) => {
  const [credentials, setCredentials] = useState({
    username: ""
  });
  
  const [errors, setErrors] = useState({
    username: ""
  });
  
  const modalRef = useRef(null);
  const initialFocusRef = useRef(null);
  
  useEffect(() => {
    // Focus the first input when modal opens
    if (initialFocusRef.current) {
      initialFocusRef.current.focus();
    }
    
    // Handle escape key to close modal
    const handleEscapeKey = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    
    // Handle click outside to close modal
    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        onClose();
      }
    };
    
    document.addEventListener("keydown", handleEscapeKey);
    document.addEventListener("mousedown", handleClickOutside);
    
    // Prevent scrolling on body when modal is open
    document.body.style.overflow = "hidden";
    
    return () => {
      document.removeEventListener("keydown", handleEscapeKey);
      document.removeEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "auto";
    };
  }, [onClose]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials({
      ...credentials,
      [name]: value
    });
    
    // Clear error when user types
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ""
      });
    }
  };
  
  const validateForm = () => {
    let isValid = true;
    const newErrors = { username: "" };
    
    if (!credentials.username.trim()) {
      newErrors.username = "Username is required";
      isValid = false;
    }
    
    setErrors(newErrors);
    return isValid;
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      onConnect(credentials);
    }
  };
  
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div 
        ref={modalRef}
        className="bg-surface rounded-lg shadow-xl w-full max-w-md animate-scale-in"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className="flex items-start justify-between p-6 border-b border-border">
          <div className="flex items-center">
            <div 
              className="w-10 h-10 rounded-md flex items-center justify-center mr-3"
              style={{ backgroundColor: `${platform.color}20`, color: platform.color }}
            >
              <Icon name={platform.icon} size={20} />
            </div>
            <h2 id="modal-title" className="text-xl font-semibold text-text-primary">
              Connect {platform.name}
            </h2>
          </div>
          
          <button
            onClick={onClose}
            className="text-text-tertiary hover:text-text-primary rounded-full p-1 transition-colors"
            aria-label="Close modal"
          >
            <Icon name="X" size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="p-6">
            <p className="text-text-secondary mb-6">
              Enter your {platform.name} username to connect your account and track your progress.
            </p>
            
            <div className="space-y-4">
              <FormInput
                ref={initialFocusRef}
                id="username"
                name="username"
                label={`${platform.name} Username`}
                placeholder="Enter your username"
                value={credentials.username}
                onChange={handleChange}
                error={errors.username}
                icon="User"
              />
              
              <div className="bg-primary-50 p-3 rounded-md">
                <div className="flex">
                  <Icon name="Info" size={16} className="text-primary mt-0.5 mr-2 flex-shrink-0" />
                  <p className="text-xs text-text-secondary">
                    We use your username to fetch your coding activity and progress from {platform.name}.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end gap-3 p-4 bg-background rounded-b-lg border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary py-2 px-4"
              disabled={isConnecting}
            >
              Cancel
            </button>
            
            <button
              type="submit"
              className="btn btn-primary py-2 px-4 flex items-center"
              disabled={isConnecting}
            >
              {isConnecting ? (
                <>
                  <Icon name="Loader2" size={16} className="animate-spin mr-2" />
                  Connecting...
                </>
              ) : (
                <>
                  <Icon name="Link" size={16} className="mr-2" />
                  Connect
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ConnectionModal;