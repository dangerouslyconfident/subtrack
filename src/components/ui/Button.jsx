import React from 'react';
import { cn } from '../../lib/utils';

export function Button({ 
  className, 
  variant = 'primary', 
  size = 'default', 
  children, 
  ...props 
}) {
  const baseStyles = "inline-flex items-center justify-center rounded-xl font-bold tracking-wide transition-all focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-500/50 disabled:pointer-events-none disabled:opacity-50 shadow-lg hover:-translate-y-0.5 active:translate-y-0";
  
  // We swapped out solid colors for translucent heavily-blurred alternatives
  const variants = {
    primary: "bg-white/10 text-white hover:bg-white/20 border border-white/20 backdrop-blur-md shadow-white/5",
    secondary: "bg-black/20 text-slate-100 hover:bg-black/40 border border-white/5 backdrop-blur-md",
    danger: "bg-red-500/20 text-red-200 hover:bg-red-500/40 border border-red-500/30 backdrop-blur-md",
    ghost: "hover:bg-white/10 text-slate-300 hover:text-white shadow-none"
  };

  const sizes = {
    default: "h-12 px-6 text-base",
    sm: "h-10 rounded-lg px-4 text-sm",
    icon: "h-12 w-12 rounded-full"
  };

  return (
    <button
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      {...props}
    >
      {children}
    </button>
  );
}
