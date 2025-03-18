import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    className?: string;
}

const Input: React.FC<InputProps> = ({ className, ...props }) => {
    return (
        <input
            className={`border px-3 py-2 rounded w-full ${className}`}
            {...props}
        />
    );
};

export default Input;