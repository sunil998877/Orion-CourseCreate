import React, { useState, useRef } from 'react';

interface TooltipProps {
  content: string;
  children: React.ReactNode;
}

const Tooltip: React.FC<TooltipProps> = ({ content, children }) => {
  const [isVisible, setIsVisible] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);

  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onClick={() => setIsVisible(!isVisible)}
        className="inline-flex cursor-help"
      >
        {children}
      </div>

      {isVisible && (
        <div
          ref={tooltipRef}
          className="absolute z-10 px-3 py-2 text-sm text-white bg-gray-800 rounded-md shadow-sm transition-opacity duration-300 w-48 transform -translate-x-1/2 left-1/2 -top-1"
          style={{ marginTop: '-30px' }}
        >
          {content}
          <div className="absolute w-2 h-2 bg-gray-800 transform rotate-45 left-1/2 -translate-x-1/2 -bottom-1"></div>
        </div>
      )}
    </div>
  );
};

export default Tooltip;