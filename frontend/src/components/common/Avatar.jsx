import { getInitials } from '../../utils/helpers';

const Avatar = ({ src, name = '', size = 'md', className = '' }) => {
  const sizes = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-xs',
    md: 'w-9 h-9 text-sm',
    lg: 'w-11 h-11 text-base',
    xl: 'w-14 h-14 text-lg',
  };

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={`${sizes[size]} rounded-full object-cover flex-shrink-0 ${className}`}
      />
    );
  }

  const colors = [
    'bg-purple-500', 'bg-blue-500', 'bg-green-500',
    'bg-yellow-500', 'bg-red-500', 'bg-pink-500', 'bg-indigo-500',
  ];
  const color = colors[name.charCodeAt(0) % colors.length] || 'bg-gray-500';

  return (
    <div
      className={`${sizes[size]} ${color} rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0 ${className}`}
    >
      {getInitials(name)}
    </div>
  );
};

export default Avatar;
