import React from 'react';
import clsx from 'clsx';

type ButtonProps = {
  type?: 'button' | 'submit' | 'reset';
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
};

export const Button: React.FC<ButtonProps> = ({
  type = 'button',
  children,
  onClick,
  className,
  disabled,
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={clsx(
        'inline-flex justify-center items-center transition-colors font-display appearance-none',
        'ring-offset-2 focus:ring-2 focus-visible:ring-2 text-center w-full outline-none border-0 rounded',
        'text-white bg-primary-600 hover:bg-primary-700 focus:ring-primary-100 focus-visible:ring-primary-100',
        'cursor-pointer px-4 py-3 text-base',
        disabled && 'opacity-50 cursor-not-allowed',
        className,
      )}
    >
      {children}
    </button>
  );
};
