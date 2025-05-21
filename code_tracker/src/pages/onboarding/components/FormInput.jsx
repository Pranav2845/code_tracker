import React from "react";
import ValidationMessage from './ValidationMessage';


const FormInput = ({
  label,
  type = "text",
  id,
  name,
  value,
  onChange,
  placeholder,
  error,
  required = false,
  autoFocus = false,
}) => {
  return (
    <div className="mb-4">
      <label
        htmlFor={id}
        className="block text-sm font-medium text-text-primary mb-1"
      >
        {label} {required && <span className="text-error">*</span>}
      </label>
      <input
        type={type}
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className={`input w-full ${
          error ? "border-error focus:ring-error" : ""
        }`}
        required={required}
      />
      {error && <ValidationMessage message={error} />}
    </div>
  );
};

export default FormInput;