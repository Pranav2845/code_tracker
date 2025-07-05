// File: src/pages/platform-connection/components/ConnectionModal.jsx
import React, { useState, useEffect, useRef } from "react";
import Icon from "../../../components/AppIcon";
import FormInput from "./FormInput";

const ConnectionModal = ({ platform, onClose, onConnect, isConnecting }) => {
  const [credentials, setCredentials] = useState({ username: "" });
  const [errors, setErrors] = useState({ username: "" });
  const modalRef = useRef(null);
  const initialFocusRef = useRef(null);

  useEffect(() => {
    initialFocusRef.current?.focus();

    const handleEscape = (e) => e.key === "Escape" && onClose();
    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    document.addEventListener("mousedown", handleClickOutside);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.removeEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "auto";
    };
  }, [onClose]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateForm = () => {
    const newErr = { username: "" };
    let ok = true;
    if (!credentials.username.trim()) {
      newErr.username =
        platform.id === "cses" ? "User ID is required" : "Username is required";
      ok = false;
    }
    setErrors(newErr);
    return ok;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    onConnect(credentials);
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
            className="text-text-tertiary hover:text-text-primary rounded-full p-1"
            aria-label="Close modal"
          >
            <Icon name="X" size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-6">
            <p className="text-text-secondary mb-6">
              {platform.id === "cses"
                ? "Enter your numeric CSES user ID to connect your account and track your progress."
                : `Enter your ${platform.name} username to connect your account and track your progress.`}
            </p>
            <div className="space-y-4">
              <FormInput
                ref={initialFocusRef}
                id="username"
                name="username"
                label={platform.id === "cses" ? "CSES User ID" : `${platform.name} Username`}
                placeholder={platform.id === "cses" ? "Enter your user ID" : "Enter your username"}
                value={credentials.username}
                onChange={handleChange}
                error={errors.username}
                icon="User"
              />
              <div className="bg-primary-50 dark:bg-gray-700 p-3 rounded-md">
                <div className="flex">
                  <Icon name="Info" size={16} className="text-primary mt-0.5 mr-2" />
                  <p className="text-xs text-gray-700 dark:text-gray-300">
                    We use your{" "}
                    {platform.id === "cses" ? "user ID" : "username"} to fetch your coding
                    activity and progress from {platform.name}.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 p-4 bg-background rounded-b-lg border-t border-border">
            <button
              type="button"
              onClick={onClose}
              disabled={isConnecting}
              className="px-4 py-2 rounded bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
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
