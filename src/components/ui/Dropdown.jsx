import React, { useState, useRef, useEffect } from 'react';
import Icon from '../AppIcon';

function Dropdown({
  options = [],
  value,
  onChange,
  placeholder = 'Select an option',
  variant = 'single-select',
  className = '',
  searchable = false,
  disabled = false,
  label,
  error,
  ...props
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);
  
  // For multi-select, ensure value is always an array
  const selectedValues = variant.includes('multi') 
    ? (Array.isArray(value) ? value : [])
    : value;
  
  const filteredOptions = searchable && searchTerm
    ? options.filter(option => 
        option.label.toLowerCase().includes(searchTerm.toLowerCase()))
    : options;
  
  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
      if (!isOpen && searchable) {
        setTimeout(() => {
          searchInputRef.current?.focus();
        }, 10);
      }
    }
  };
  
  const handleSelect = (option) => {
    if (variant.includes('multi')) {
      const isSelected = selectedValues.some(val => val === option.value);
      const newValue = isSelected
        ? selectedValues.filter(val => val !== option.value)
        : [...selectedValues, option.value];
      onChange(newValue);
    } else {
      onChange(option.value);
      setIsOpen(false);
    }
    
    if (searchable && !variant.includes('multi')) {
      setSearchTerm('');
    }
  };
  
  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setIsOpen(false);
      setSearchTerm('');
    }
  };
  
  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  const getSelectedLabel = () => {
    if (variant.includes('multi')) {
      if (selectedValues.length === 0) return placeholder;
      if (selectedValues.length === 1) {
        const option = options.find(opt => opt.value === selectedValues[0]);
        return option ? option.label : placeholder;
      }
      return `${selectedValues.length} items selected`;
    } else {
      const option = options.find(opt => opt.value === selectedValues);
      return option ? option.label : placeholder;
    }
  };
  
  const baseClasses = 'relative w-full';
  const triggerClasses = `flex items-center justify-between w-full px-3 py-2 text-sm border rounded-md ${
    disabled ? 'bg-background opacity-60 cursor-not-allowed' : 'bg-surface cursor-pointer'
  } ${error ? 'border-error' : 'border-border'} ${isOpen ? 'ring-2 ring-primary-500' : ''}`;
  
  return (
    <div className={`${baseClasses} ${className}`} ref={dropdownRef} {...props}>
      {label && (
        <label className="block text-sm font-medium text-text-primary mb-1">
          {label}
        </label>
      )}
      
      <div 
        className={triggerClasses}
        onClick={handleToggle}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleToggle();
          }
        }}
        tabIndex={disabled ? -1 : 0}
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <span className="truncate">{getSelectedLabel()}</span>
        <Icon 
          name={isOpen ? 'ChevronUp' : 'ChevronDown'} 
          size={18} 
          className="text-text-tertiary"
        />
      </div>
      
      {error && (
        <p className="mt-1 text-sm text-error">{error}</p>
      )}
      
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-surface border border-border rounded-md shadow-lg max-h-60 overflow-auto animate-fade-in">
          {searchable && (
            <div className="sticky top-0 p-2 bg-surface border-b border-border">
              <input
                ref={searchInputRef}
                type="text"
                className="w-full px-3 py-1 text-sm border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          )}
          
          <ul 
            className="py-1" 
            role="listbox" 
            aria-multiselectable={variant.includes('multi')}
          >
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => {
                const isSelected = variant.includes('multi')
                  ? selectedValues.includes(option.value)
                  : selectedValues === option.value;
                
                return (
                  <li
                    key={option.value}
                    className={`px-3 py-2 text-sm cursor-pointer flex items-center ${
                      isSelected 
                        ? 'bg-primary-50 text-primary' :'text-text-primary hover:bg-background'
                    }`}
                    onClick={() => handleSelect(option)}
                    role="option"
                    aria-selected={isSelected}
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleSelect(option);
                      }
                    }}
                  >
                    {variant.includes('checkboxes') && (
                      <span className="mr-2">
                        {isSelected ? (
                          <Icon name="CheckSquare" size={16} className="text-primary" />
                        ) : (
                          <Icon name="Square" size={16} className="text-text-tertiary" />
                        )}
                      </span>
                    )}
                    <span className="truncate">{option.label}</span>
                  </li>
                );
              })
            ) : (
              <li className="px-3 py-2 text-sm text-text-tertiary">No options found</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

export default Dropdown;