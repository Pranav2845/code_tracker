import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "../../components/AppIcon";
import ProgressStepper from "./components/ProgressStepper";
import FormInput from "./components/FormInput";
import ActionButton from "./components/ActionButton";
import ValidationMessage from "./components/ValidationMessage";
import SkipDialog from "./components/SkipDialog";
import SuccessAnimation from "./components/SuccessAnimation";

const Onboarding = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [showSkipDialog, setShowSkipDialog] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
  });
  const [formErrors, setFormErrors] = useState({
    name: "",
    email: "",
  });

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: "",
      });
    }
  };

  // Validate email format
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Validate form data
  const validateForm = () => {
    const errors = {};
    let isValid = true;

    if (!formData.name.trim()) {
      errors.name = "Name is required";
      isValid = false;
    }

    if (!formData.email.trim()) {
      errors.email = "Email is required";
      isValid = false;
    } else if (!isValidEmail(formData.email)) {
      errors.email = "Please enter a valid email address";
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (currentStep === 0) {
      if (validateForm()) {
        setIsLoading(true);
        
        // Simulate API call with 5s timeout
        setTimeout(() => {
          setIsLoading(false);
          setCurrentStep(1);
        }, 2000);
      }
    } else if (currentStep === 1) {
      // Move to platform connection page
      navigate("/platform-connection");
    } else if (currentStep === 2) {
      // Go to dashboard
      navigate("/dashboard");
    }
  };

  // Handle skip button
  const handleSkip = () => {
    setShowSkipDialog(true);
  };

  // Confirm skip action
  const confirmSkip = () => {
    setShowSkipDialog(false);
    setCurrentStep(2); // Move to success step
  };

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // Mock data for platform information
  const platformInfo = {
    title: "Connect Your Coding Platforms",
    description: "Link your LeetCode, Codeforces, and other coding platforms to automatically track your progress and get personalized insights.",
    benefits: [
      "Automatic problem tracking across platforms",
      "Unified progress dashboard",
      "Personalized recommendations based on your performance"
    ]
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="bg-surface border-b border-border py-4">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center">
            <Icon name="Code" className="text-primary mr-2" size={24} />
            <span className="text-xl font-bold text-text-primary">Code Tracker</span>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center py-8 px-4">
        <div className="w-full max-w-md bg-surface rounded-lg shadow-sm border border-border p-6 md:p-8">
          {/* Progress stepper */}
          <ProgressStepper currentStep={currentStep} totalSteps={3} />

          {/* Step content */}
          <div className="mb-6">
            {currentStep === 0 && (
              <>
                <h1 className="text-2xl font-bold text-text-primary mb-2 text-center">Create Your Profile</h1>
                <p className="text-text-secondary text-center mb-6">Let's get started with some basic information</p>
                
                <form onSubmit={handleSubmit} onKeyDown={handleKeyDown}>
                  <FormInput
                    label="Full Name"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    error={formErrors.name}
                    required
                    autoFocus
                  />
                  
                  <FormInput
                    label="Email Address"
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email address"
                    error={formErrors.email}
                    required
                  />
                  
                  {error && (
                    <div className="mb-4">
                      <ValidationMessage message={error} />
                    </div>
                  )}
                  
                  <div className="flex justify-between mt-8">
                    <ActionButton
                      variant="ghost"
                      onClick={handleSkip}
                    >
                      Skip for now
                    </ActionButton>
                    
                    <ActionButton
                      type="submit"
                      variant="primary"
                      isLoading={isLoading}
                      icon="ArrowRight"
                      iconPosition="right"
                    >
                      Continue
                    </ActionButton>
                  </div>
                </form>
              </>
            )}
            
            {currentStep === 1 && (
              <>
                <h1 className="text-2xl font-bold text-text-primary mb-2 text-center">{platformInfo.title}</h1>
                <p className="text-text-secondary text-center mb-6">{platformInfo.description}</p>
                
                <div className="bg-background rounded-lg p-4 mb-6">
                  <h3 className="font-medium text-text-primary mb-2">Benefits:</h3>
                  <ul className="space-y-2">
                    {platformInfo.benefits.map((benefit, index) => (
                      <li key={index} className="flex items-start">
                        <Icon name="Check" className="text-success mr-2 mt-1 flex-shrink-0" size={16} />
                        <span className="text-text-secondary">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="flex justify-between mt-8">
                  <ActionButton
                    variant="ghost"
                    onClick={handleSkip}
                  >
                    Skip for now
                  </ActionButton>
                  
                  <ActionButton
                    onClick={handleSubmit}
                    variant="primary"
                    icon="ArrowRight"
                    iconPosition="right"
                  >
                    Connect Platforms
                  </ActionButton>
                </div>
              </>
            )}
            
            {currentStep === 2 && (
              <>
                <SuccessAnimation />
                
                <div className="flex justify-center">
                  <ActionButton
                    onClick={() => navigate("/dashboard")}
                    variant="primary"
                    icon="LayoutDashboard"
                    iconPosition="right"
                  >
                    Go to Dashboard
                  </ActionButton>
                </div>
              </>
            )}
          </div>
        </div>
      </main>

      {/* Skip dialog */}
      <SkipDialog
        isOpen={showSkipDialog}
        onClose={() => setShowSkipDialog(false)}
        onConfirm={confirmSkip}
      />
    </div>
  );
};

export default Onboarding;