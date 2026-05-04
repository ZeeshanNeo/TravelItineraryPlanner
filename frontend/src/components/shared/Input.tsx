import type { InputHTMLAttributes, ReactNode } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  fullWidth?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

const Input = ({ label, error, fullWidth = false, leftIcon, rightIcon, className = '', ...props }: InputProps) => {
  const widthClass = fullWidth ? 'w-full' : '';

  return (
    <div className={`${widthClass}`}>
      {label && (
        <label className="block text-sm font-bold text-foreground mb-2 ml-1">
          {label}
          {props.required && <span className="text-rose-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        {leftIcon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            {leftIcon}
          </div>
        )}
        <input
          className={`px-5 py-4 bg-slate-50 dark:bg-slate-900 border-2 rounded-2xl shadow-sm focus:ring-4 focus:ring-primary/10 focus:border-primary focus:bg-white dark:focus:bg-slate-800 outline-none transition-all duration-300 font-bold text-foreground placeholder:text-muted-foreground/50 placeholder:font-medium ${error ? 'border-rose-500' : 'border-border'} ${widthClass} ${leftIcon ? 'pl-14' : ''} ${rightIcon ? 'pr-14' : ''} ${className}`}
          {...props}
        />
        {rightIcon && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            {rightIcon}
          </div>
        )}
      </div>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};

export default Input;
