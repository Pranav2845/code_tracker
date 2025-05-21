import React from "react";
import { Link } from "react-router-dom";
import Icon from "../components/AppIcon";

const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
      <div className="text-center max-w-md">
        <div className="flex justify-center mb-6">
          <div className="w-24 h-24 rounded-full bg-primary-50 flex items-center justify-center">
            <Icon name="FileQuestion" size={48} className="text-primary" />
          </div>
        </div>
        
        <h1 className="text-4xl font-bold text-text-primary mb-2">404</h1>
        <h2 className="text-2xl font-semibold text-text-primary mb-4">Page Not Found</h2>
        <p className="text-text-secondary mb-8">
          The page you are looking for doesn't exist or has been moved.
        </p>
        
        <Link 
          to="/dashboard" 
          className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary hover:bg-primary-dark transition-colors duration-200"
        >
          <Icon name="ArrowLeft" className="mr-2" size={18} />
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default NotFound;