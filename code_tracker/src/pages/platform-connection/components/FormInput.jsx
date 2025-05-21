import React, { forwardRef } from "react";
import Icon from "../../../components/AppIcon";

const FormInput = forwardRef(({ 
  id, 
  name, 
  label, 
  type = "text", 
  placeholder, 
  value, 
  onChange, 
  error, 
  icon 
}, ref) => {
  return (
    <div className="space-y-1">
      <label htmlFor={id} className="block text-sm font-medium text-text-primary">
        {label}
      </label>
      
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon name={icon} size={16} className="text-text-tertiary" />
          </div>
        )}
        
        <input
          ref={ref}
          id={id}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`input w-full ${icon ? 'pl-10' : 'pl-3'} ${error ? 'border-error focus:ring-error' : 'border-border focus:ring-primary'}`}
          aria-invalid={error ? "true" : "false"}
          aria-describedby={error ? `${id}-error` : undefined}
        />
      </div>
      
      {error && (
        <p id={`${id}-error`} className="text-error text-xs mt-1 flex items-center">
          <Icon name="AlertCircle" size={12} className="mr-1" />
          {error}
        </p>
      )}
    </div>
  );
});

FormInput.displayName = "FormInput";

export default FormInput;