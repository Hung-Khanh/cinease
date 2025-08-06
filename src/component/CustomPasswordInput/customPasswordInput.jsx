"use client";

import { useState } from "react";
import { EyeOutlined, EyeInvisibleOutlined } from "@ant-design/icons";

const CustomPasswordInput = ({
  placeholder,
  value,
  onChange,
  hasError = false,
  style = {},
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div
      className={`custom-password-input ${hasError ? "error" : ""}`}
      style={style}
    >
      <input
        type={showPassword ? "text" : "password"}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="password-input-field"
      />
      <button
        type="button"
        className="password-toggle-btn"
        onClick={togglePasswordVisibility}
      >
        {showPassword ? <EyeInvisibleOutlined /> : <EyeOutlined />}
      </button>
    </div>
  );
};

export default CustomPasswordInput;
