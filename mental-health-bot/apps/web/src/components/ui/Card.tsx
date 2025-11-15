import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'sm' | 'md' | 'lg';
  hover?: boolean;
}

export function Card({
  children,
  className = '',
  padding = 'md',
  hover = false,
}: CardProps) {
  const paddingStyles = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  return (
    <div
      className={`bg-white rounded-xl shadow-lg ${paddingStyles[padding]} ${
        hover ? 'hover:shadow-xl transition-shadow cursor-pointer' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={`mb-4 ${className}`}>{children}</div>;
}

export function CardTitle({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <h3 className={`text-xl font-bold text-gray-900 ${className}`}>{children}</h3>;
}

export function CardContent({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={className}>{children}</div>;
}
