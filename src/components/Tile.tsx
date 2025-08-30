import React, { type ReactNode, type HTMLAttributes } from 'react';

interface TileProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

const Tile: React.FC<TileProps> = ({ children, className = '', ...rest }) => (
  <div className={`bg-slate-100 rounded shadow p-4 ${className}`} {...rest}>
    {children}
  </div>
);

export default Tile;