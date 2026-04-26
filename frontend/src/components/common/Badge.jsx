import { PRIORITY_COLORS, STATUS_COLORS, ROLE_COLORS } from '../../utils/helpers';

export const PriorityBadge = ({ priority }) => (
  <span className={`badge ${PRIORITY_COLORS[priority] || PRIORITY_COLORS.medium}`}>
    {priority}
  </span>
);

export const StatusBadge = ({ status }) => (
  <span className={`badge ${STATUS_COLORS[status] || STATUS_COLORS.todo}`}>
    {status?.replace('-', ' ')}
  </span>
);

export const RoleBadge = ({ role }) => (
  <span className={`badge ${ROLE_COLORS[role] || ROLE_COLORS.member}`}>
    {role}
  </span>
);

export const PlanBadge = ({ plan }) => {
  const colors = {
    free: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
    pro: 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400',
    enterprise: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  };
  return <span className={`badge ${colors[plan] || colors.free}`}>{plan}</span>;
};
