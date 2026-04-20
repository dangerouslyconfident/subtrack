import React from 'react';
import { cn } from '../../lib/utils';

export function Card({ className, ...props }) {
  return (
    <div
      className={cn("glass-panel text-slate-50", className)}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }) {
  return <div className={cn("flex flex-col space-y-2 p-8 pb-6", className)} {...props} />;
}

export function CardTitle({ className, ...props }) {
  return <h3 className={cn("text-2xl font-bold tracking-tight text-white", className)} {...props} />;
}

export function CardContent({ className, ...props }) {
  return <div className={cn("p-8 pt-0", className)} {...props} />;
}
