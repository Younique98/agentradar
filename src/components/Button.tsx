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
        'inline-flex justify-center items-center transition-colors font-sans font-semibold appearance-none',
        'ring-offset-2 focus-visible:ring-2 focus-visible:ring-signal-text text-center w-full outline-none border-0 rounded-lg',
        'text-white bg-signal hover:bg-signal-hover',
        'cursor-pointer px-4 py-3 text-base',
        disabled && 'opacity-50 cursor-not-allowed',
        className,
      )}
    >
      {children}
    </button>
  );
};
