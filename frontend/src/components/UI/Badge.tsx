import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'success' | 'error' | 'warning' | 'info';
  className?: string;
}

export function Badge({ children, variant = 'primary', className = '' }: BadgeProps) {
  const variantClass = `badge-${variant}`;
  
  return (
    <span className={`badge ${variantClass} ${className}`}>
      {children}
    </span>
  );
}
