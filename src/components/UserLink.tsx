import React from 'react';
import { useNavigate } from 'react-router-dom';

interface UserLinkProps {
  user: {
    id: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    name?: string;
    hasPublicProfile?: boolean;
  };
  showName?: boolean;
  showEmail?: boolean;
  className?: string;
  children?: React.ReactNode;
}

const UserLink: React.FC<UserLinkProps> = ({ 
  user, 
  showName = true, 
  showEmail = false, 
  className = "",
  children 
}) => {
  const navigate = useNavigate();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (user.hasPublicProfile !== false) {
      navigate(`/profile/${user.id}`);
    }
  };

  const isClickable = user.hasPublicProfile !== false;
  const displayName = user.name || (user.firstName && user.lastName 
    ? `${user.firstName} ${user.lastName}` 
    : user.firstName || user.lastName || 'Unknown User');
  
  const baseClassName = `${isClickable 
    ? 'cursor-pointer hover:text-blue-600 hover:underline' 
    : 'cursor-default'} ${className}`;

  if (children) {
    return (
      <span 
        onClick={isClickable ? handleClick : undefined}
        className={baseClassName}
        title={isClickable ? 'View profile' : 'Profile not available'}
      >
        {children}
      </span>
    );
  }

  return (
    <span 
      onClick={isClickable ? handleClick : undefined}
      className={baseClassName}
      title={isClickable ? 'View profile' : 'Profile not available'}
    >
      {showName && displayName}
      {showEmail && user.email && (
        <span className="text-gray-500 text-sm">
          {showName ? ` (${user.email})` : user.email}
        </span>
      )}
    </span>
  );
};

export default UserLink;
