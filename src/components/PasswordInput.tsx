"use client";

import { useState, forwardRef, InputHTMLAttributes } from "react";
import { Eye, EyeOff } from "lucide-react";

type PasswordInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  wrapperClassName?: string;
};

const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className = "", wrapperClassName = "", ...props }, ref) => {
    const [visible, setVisible] = useState(false);

    return (
      <div className={`relative ${wrapperClassName}`}>
        <input
          ref={ref}
          type={visible ? "text" : "password"}
          className={`${className} pr-11`}
          {...props}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          tabIndex={-1}
          aria-label={visible ? "Hide password" : "Show password"}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
        >
          {visible ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
    );
  }
);

PasswordInput.displayName = "PasswordInput";

export default PasswordInput;
