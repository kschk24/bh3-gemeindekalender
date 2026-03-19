import type { User } from '../../types';

interface UserAvatarProps {
  user: Pick<User, 'email' | 'avatar'>;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-20 h-20 text-2xl',
};

export default function UserAvatar({ user, size = 'md', className = '' }: UserAvatarProps) {
  const base = `rounded-full flex items-center justify-center flex-shrink-0 ${sizeClasses[size]} ${className}`;

  if (user.avatar) {
    if (user.avatar.startsWith('data:')) {
      return (
        <img
          src={user.avatar}
          alt=""
          aria-hidden="true"
          className={`${base} object-cover`}
        />
      );
    }
    // Emoji preset
    return (
      <div className={`${base} bg-primary-100 dark:bg-primary-900`} aria-hidden="true">
        <span>{user.avatar}</span>
      </div>
    );
  }

  // Fallback: initials
  const initials = user.email.slice(0, 2).toUpperCase();
  return (
    <div className={`${base} bg-primary-500 text-white font-bold`} aria-hidden="true">
      {initials}
    </div>
  );
}
