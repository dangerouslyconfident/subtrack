import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utility function to cleanly merge Tailwind CSS classes.
 * We use this inside our reusable components (Button, Input) to allow
 * overriding default styles cleanly.
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
