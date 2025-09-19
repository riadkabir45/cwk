import React from 'react';

interface AvatarProps {
  src?: string | null;
  firstName?: string;
  lastName?: string;
  email?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
}

const Avatar: React.FC<AvatarProps> = ({
  src,
  firstName,
  lastName,
  email,
  size = 'md',
  className = ''
}) => {
  // Generate initials from first name, last name, or email
  const getInitials = (): string => {
    const trimmedFirstName = firstName?.trim();
    const trimmedLastName = lastName?.trim();
    
    if (trimmedFirstName && trimmedLastName) {
      return `${trimmedFirstName.charAt(0)}${trimmedLastName.charAt(0)}`.toUpperCase();
    }
    if (trimmedFirstName) {
      return trimmedFirstName.charAt(0).toUpperCase();
    }
    if (trimmedLastName) {
      return trimmedLastName.charAt(0).toUpperCase();
    }
    if (email) {
      return email.charAt(0).toUpperCase();
    }
    return 'U'; // Default to 'U' for User
  };

  // Generate background color based on initials for consistency
  const getBackgroundColor = (): string => {
    const initials = getInitials();
    const colors = [
      'bg-red-500',
      'bg-blue-500',
      'bg-green-500',
      'bg-yellow-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-teal-500',
      'bg-orange-500',
      'bg-cyan-500'
    ];
    
    // Use the first character's char code to pick a consistent color
    const charCode = initials.charCodeAt(0);
    return colors[charCode % colors.length];
  };

  // Size mappings
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-lg',
    '2xl': 'w-32 h-32 text-4xl'
  };

  const baseClasses = `rounded-full flex items-center justify-center ${sizeClasses[size]} ${className}`;

  if (src) {
    return (
      <img
        src={src}
        alt="Profile"
        className={`${baseClasses} object-cover`}
        onError={(e) => {
          // If image fails to load, replace with initials
          const target = e.target as HTMLImageElement;
          const parent = target.parentElement;
          if (parent) {
            parent.innerHTML = `
              <div class="${baseClasses} ${getBackgroundColor()} text-white font-semibold">
                ${getInitials()}
              </div>
            `;
          }
        }}
      />
    );
  }

  return (
    <div className={`${baseClasses} ${getBackgroundColor()} text-white font-semibold`}>
      {getInitials()}
    </div>
  );
};

export default Avatar;