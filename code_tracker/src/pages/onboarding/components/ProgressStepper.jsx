import React from "react";
import Icon from "../../../components/AppIcon";

const ProgressStepper = ({ currentStep, totalSteps }) => {
  return (
    <div className="w-full max-w-md mx-auto mb-8">
      <div className="flex items-center justify-between">
        {Array.from({ length: totalSteps }).map((_, index) => (
          <React.Fragment key={index}>
            {/* Step circle */}
            <div className="flex flex-col items-center">
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  index < currentStep
                    ? "bg-primary border-primary text-white"
                    : index === currentStep
                    ? "border-primary text-primary" :"border-border text-text-tertiary bg-background"
                }`}
              >
                {index < currentStep ? (
                  <Icon name="Check" size={20} />
                ) : (
                  <span className="text-sm font-medium">{index + 1}</span>
                )}
              </div>
              <span
                className={`mt-2 text-xs font-medium ${
                  index <= currentStep ? "text-text-primary" : "text-text-tertiary"
                }`}
              >
                {index === 0
                  ? "Profile"
                  : index === 1
                  ? "Connect" :"Complete"}
              </span>
            </div>

            {/* Connector line between steps */}
            {index < totalSteps - 1 && (
              <div
                className={`flex-1 h-0.5 mx-2 ${
                  index < currentStep ? "bg-primary" : "bg-border"
                }`}
              ></div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default ProgressStepper;