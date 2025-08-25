import React from 'react';

interface TileWrapperProps {
  children: React.ReactNode;
}

const TileWrapper: React.FC<TileWrapperProps> = ({ children }) => (
  <div className="bg-slate-100 rounded shadow p-4">
    {children}
  </div>
);

export default TileWrapper;