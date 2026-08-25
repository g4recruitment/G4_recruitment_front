import React from 'react';
import { twMerge } from 'tailwind-merge';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'outline' | 'ghost';
    isLoading?: boolean;
}

export const LegacyButton: React.FC<ButtonProps> = ({
    className,
    variant = 'primary',
    isLoading,
    children,
    ...props
}) => {
    const baseStyles = "font-bold py-3 px-8 rounded-full transition-all duration-300 flex items-center justify-center gap-2";

    const variants = {
        primary: "bg-[#D4AF37] text-black shadow-[0_0_15px_rgba(212,175,55,0.5)] hover:bg-[#F4C430] disabled:opacity-50",
        outline: "border-2 border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black",
        ghost: "bg-transparent text-white hover:bg-white/10"
    };

    return (
        <button
            className={twMerge(baseStyles, variants[variant], className)}
            disabled={isLoading || props.disabled}
            {...props}
        >
            {isLoading ? <span className="animate-spin">⏳</span> : children}
        </button>
    );
};
