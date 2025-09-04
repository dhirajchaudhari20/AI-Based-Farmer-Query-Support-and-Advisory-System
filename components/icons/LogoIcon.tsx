import React from 'react';

interface LogoIconProps {
  className?: string;
}

const LogoIcon: React.FC<LogoIconProps> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className || "h-8 w-8 text-green-500"}
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path d="M17.61,6.39C17.61,3.74,15.26,2,12,2S6.39,3.74,6.39,6.39c0,1.61,0.91,3.03,2.22,3.78 c0.1,0.05,0.18,0.12,0.25,0.21c0.08,0.09,0.15,0.19,0.21,0.29L12,22l3.14-11.34c0.06-0.1,0.13-0.19,0.21-0.29 c0.07-0.08,0.15-0.15,0.25-0.21C16.7,9.42,17.61,7.99,17.61,6.39z" />
  </svg>
);

export default LogoIcon;