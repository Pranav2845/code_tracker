import React from "react";
import Icon from "../../../components/AppIcon";
import ActionButton from "./ActionButton";

const SkipDialog = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-surface rounded-lg shadow-lg p-6 max-w-md w-full mx-4 animate-scale-in">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-warning bg-opacity-20 flex items-center justify-center mr-3">
              <Icon name="AlertTriangle" className="text-warning" size={20} />
            </div>
            <h3 className="text-lg font-semibold text-text-primary">Skip Setup?</h3>
          </div>
          <button 
            onClick={onClose}
            className="text-text-tertiary hover:text-text-primary transition-colors"
          >
            <Icon name="X" size={20} />
          </button>
        </div>
        
        <p className="text-text-secondary mb-6">
          Skipping platform connections will limit the functionality of Code Tracker. You won't be able to track your progress across coding platforms automatically.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-3 justify-end">
          <ActionButton 
            variant="ghost" 
            onClick={onClose}
          >
            Cancel
          </ActionButton>
          <ActionButton 
            variant="primary" 
            onClick={onConfirm}
          >
            Skip Anyway
          </ActionButton>
        </div>
      </div>
    </div>
  );
};

export default SkipDialog;