import React from 'react';

export const GlobalLoader: React.FC = () => {
  return (
    <div className="global-loader-overlay" role="status" aria-label="Loading">
      <div className="loader">
        <span />
        <span />
        <span />
      </div>
    </div>
  );
};
