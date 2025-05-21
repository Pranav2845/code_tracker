import React from 'react';

function Card({
  children,
  className = '',
  variant = 'default',
  onClick,
  ...props
}) {
  const baseClasses = 'card p-4 rounded-lg border border-border bg-surface';
  
  const variantClasses = {
    default: 'shadow-sm',
    interactive: 'shadow-sm hover:shadow transition-shadow cursor-pointer',
    metric: 'shadow-sm border-l-4 border-l-primary',
    'platform-specific': 'shadow-sm',
  };
  
  const platformClasses = {
    leetcode: 'border-l-4 border-l-leetcode',
    codeforces: 'border-l-4 border-l-codeforces',
  };
  
  let finalClasses = `${baseClasses} ${variantClasses[variant]} ${className}`;
  
  if (variant === 'platform-specific' && props.platform) {
    finalClasses = `${finalClasses} ${platformClasses[props.platform] || ''}`;
    delete props.platform;
  }
  
  const cardProps = {
    className: finalClasses,
    ...props,
  };
  
  if (variant === 'interactive') {
    cardProps.onClick = onClick;
    cardProps.tabIndex = props.tabIndex || 0;
    cardProps.role = 'button';
    cardProps.onKeyDown = (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onClick && onClick(e);
      }
      props.onKeyDown && props.onKeyDown(e);
    };
  }
  
  return (
    <div {...cardProps}>
      {children}
    </div>
  );
}

export default Card;