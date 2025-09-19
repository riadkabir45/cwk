// Shared navigation configuration for both Navbar and Sidebar
export interface NavItem {
  to: string;
  label: string;
  icon?: string;
  children?: NavItem[];
  requiredRoles?: string[];
}

export const getNavigationItems = (role: string): NavItem[] => {
  const baseNavItems: NavItem[] = [
    { 
      to: '/', 
      label: 'Home', 
      icon: 'home' 
    },
    {
      to: '/communities',
      label: 'Communities',
      icon: 'communities',
      children: [
        { to: '/tasks/create', label: 'Create Community', icon: 'create' },
        { to: '/tasks/list', label: 'Browse Communities', icon: 'browse' },
        { to: '/tasks/statuses', label: 'My Progress', icon: 'progress' },
        { to: '/mentors/leaderboard', label: 'Mentor Leaderboard', icon: 'mentor' }
      ]
    },
    {
      to: '/chats',
      label: 'Chats',
      icon: 'chats',
      children: [
        { to: '/chat/find', label: 'Find Chat', icon: 'find' },
        { to: '/chat/connections', label: 'Pending Connections', icon: 'connections' },
        { to: '/chat/list', label: 'Chat List', icon: 'list' }
      ]
    },
    {
      to: '/leaderboard',
      label: 'User Rankings',
      icon: 'rankings'
    },
    {
      to: '/profile',
      label: 'My Profile',
      icon: 'profile'
    }
  ];

  // Add admin navigation for authorized users
  const isAdmin = role === 'admin' || role === 'ADMIN' || role === 'moderator' || role === 'MODERATOR';
  
  if (isAdmin) {
    baseNavItems.push({
      to: '/admin',
      label: 'Admin Panel',
      icon: 'admin',
      requiredRoles: ['ADMIN', 'MODERATOR']
    });
  }

  return baseNavItems;
};