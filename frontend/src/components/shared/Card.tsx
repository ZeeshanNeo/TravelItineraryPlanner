import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const Card = ({ children, className = '', padding = 'md' }: CardProps) => {
  const paddingClasses = {
    none: 'p-0',
    sm: 'p-4',
    md: 'p-8',
    lg: 'p-12',
  };

  return (
    <div className={`bg-card rounded-[2rem] shadow-xl shadow-slate-200/60 border border-border ${paddingClasses[padding]} ${className}`}>
      {children}
    </div>
  );
};

export default Card;
