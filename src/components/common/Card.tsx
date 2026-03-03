import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export const Card = ({ children, className = '' }: CardProps) => {
  return (
    <div className={`bg-white rounded-2xl shadow-sm ${className}`}>
      {children}
    </div>
  );
};

export const CardHeader = ({ children, className = '' }: CardProps) => {
  return (
    <div className={`px-6 py-4 ${className}`}>
      {children}
    </div>
  );
};

interface CardBodyProps {
  children: React.ReactNode;
  className?: string;
}

export const CardBody = ({
  children,
  className = '',
}: CardBodyProps) => {
  return (
    <div className={`px-3 py-3 sm:px-4 sm:py-4 md:px-6 md:py-5 ${className}`}>
      {children}
    </div>
  );
};

export const CardFooter = ({ children, className = '' }: CardProps) => {
  return (
    <div className={`px-6 py-4 border-t border-gray-100 ${className}`}>
      {children}
    </div>
  );
};