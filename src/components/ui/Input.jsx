// src/components/ui/Input.jsx
import React, { forwardRef } from 'react';
import Icon from '../AppIcon';

const Input = forwardRef(({
  type = 'text',
  label,
  labelClassName = '',
  placeholder,
  value,
  onChange,
  onBlur,
  onFocus,
  error,
  icon,
  iconPosition = 'left',
  className = '',
  id,
  required = false,
  disabled = false,
  variant = 'default',
  onIconClick,
  ...props
}, ref) => {
  const inputId = id || `input-${Math.random().toString(36).substring(2, 9)}`;

  const baseInputClasses = 'input';
  const variantClasses = {
    default: '',
    'with-icon': icon ? (iconPosition === 'left' ? 'pl-10' : 'pr-10') : '',
    'with-validation': error ? 'border-error focus:ring-error' : '',
    'search': 'pl-10 rounded-full',
  };

  const inputClasses = `${baseInputClasses} ${variantClasses[variant]} ${className}`;

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className={`block text-sm font-medium text-text-primary mb-1 ${labelClassName}`}
        >
          {label}
          {required && <span className="text-error ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        {/* Left custom icon */}
        {(icon && iconPosition === 'left') && (
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Icon
              name={icon}
              size={18}
              className="text-text-tertiary"
            />
          </div>
        )}

        {/* Left search icon for search variant */}
        {variant === 'search' && (
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Icon
              name="Search"
              size={18}
              className="text-text-tertiary"
            />
          </div>
        )}

        <input
          ref={ref}
          id={inputId}
          type={type}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          onFocus={onFocus}
          placeholder={placeholder}
          disabled={disabled}
          className={inputClasses}
          required={required}
          aria-invalid={error ? 'true' : 'false'}
          {...props}
        />

        {/* Right icon (clickable if onIconClick is provided) */}
        {icon && iconPosition === 'right' && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            <Icon
              name={icon}
              size={18}
              className={`text-text-tertiary ${onIconClick ? 'cursor-pointer' : 'pointer-events-none'}`}
              onClick={onIconClick}
            />
          </div>
        )}

        {/* Validation icon */}
        {error && variant === 'with-validation' && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            <Icon name="AlertCircle" size={18} className="text-error" />
          </div>
        )}
      </div>

      {error && (
        <p className="mt-1 text-sm text-error">{error}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
