// File: src/pages/platform-connection/components/PlatformCard.jsx
import React from "react";
import Icon from "../../../components/AppIcon";

const PlatformCard = ({ id, platform, onConnect, onDisconnect }) => {
  const { name, icon, color, description, isConnected, username } = platform;
  
  return (
    <div 
      id={id}
      className="card p-6 transition-all duration-200 hover:shadow-md focus-within:ring-2 focus-within:ring-primary focus-within:ring-opacity-50"
      tabIndex="0"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center">
          <div 
            className="w-10 h-10 rounded-md flex items-center justify-center mr-3"
            style={{ backgroundColor: `${color}20`, color: color }}
          >
            <Icon name={icon} size={20} />
          </div>
          <h3 className="text-lg font-semibold text-text-primary">{name}</h3>
        </div>
        
        {isConnected && (
          <div className="flex items-center text-success">
            <Icon name="CheckCircle" size={18} className="mr-1" />
            <span className="text-sm font-medium">Connected</span>
          </div>
        )}
      </div>
      
      <p className="text-text-secondary text-sm mb-6">{description}</p>
      
      {isConnected ? (
        <div className="space-y-4">
          <div className="bg-background p-3 rounded-md">
            <div className="flex items-center">
              <Icon name="User" size={16} className="text-text-tertiary mr-2" />
              <span className="text-sm font-medium text-text-primary">{username}</span>
            </div>
          </div>
          
          <button
            onClick={onDisconnect}
            className="w-full btn btn-outline py-2 px-4 text-sm"
            aria-label={`Disconnect ${name} account`}
          >
            <Icon name="Unlink" size={16} className="mr-2" />
            Disconnect
          </button>
        </div>
      ) : (
        <button
          onClick={onConnect}
          className="w-full btn btn-primary py-2 px-4 text-sm"
          aria-label={`Connect ${name} account`}
        >
          <Icon name="Link" size={16} className="mr-2" />
          Connect Account
        </button>
      )}
    </div>
  );
};

export default PlatformCard;