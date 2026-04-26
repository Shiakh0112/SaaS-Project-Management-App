import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { FiCalendar, FiMessageSquare, FiPaperclip, FiMoreVertical } from 'react-icons/fi';
import { useDispatch } from 'react-redux';
import { setSelectedTask } from '../../app/slices/taskSlice';
import Avatar from '../common/Avatar';
import { PriorityBadge } from '../common/Badge';
import { formatDate, isOverdue, isDueSoon } from '../../utils/helpers';

const TaskCard = ({ task, overlay = false }) => {
  const dispatch = useDispatch();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task._id,
    data: { type: 'task', task },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const overdue = isOverdue(task.dueDate) && task.status !== 'done';
  const dueSoon = isDueSoon(task.dueDate) && task.status !== 'done';

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => dispatch(setSelectedTask(task))}
      className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-3 cursor-pointer hover:shadow-md hover:border-primary-300 dark:hover:border-primary-600 transition-all duration-200 group ${overlay ? 'shadow-xl rotate-2' : ''}`}
    >
      {/* Cover image */}
      {task.coverImage && (
        <img src={task.coverImage} alt="" className="w-full h-24 object-cover rounded-lg mb-3" />
      )}

      {/* Labels */}
      {task.labels?.length > 0 && (
        <div className="flex gap-1 flex-wrap mb-2">
          {task.labels.map((label, i) => (
            <span
              key={i}
              className="h-1.5 w-8 rounded-full"
              style={{ backgroundColor: label.color || '#6366f1' }}
              title={label.name}
            />
          ))}
        </div>
      )}

      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2 leading-snug">{task.title}</p>

      <div className="flex items-center gap-1.5 flex-wrap mb-2">
        <PriorityBadge priority={task.priority} />
      </div>

      {/* Due date */}
      {task.dueDate && (
        <div className={`flex items-center gap-1 text-xs mb-2 ${overdue ? 'text-red-600 dark:text-red-400' : dueSoon ? 'text-yellow-600 dark:text-yellow-400' : 'text-gray-500 dark:text-gray-400'}`}>
          <FiCalendar size={11} />
          {formatDate(task.dueDate)}
          {overdue && ' · Overdue'}
          {dueSoon && !overdue && ' · Due soon'}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between mt-2">
        <div className="flex items-center gap-2 text-gray-400">
          {task.comments?.length > 0 && (
            <span className="flex items-center gap-1 text-xs">
              <FiMessageSquare size={11} /> {task.comments.length}
            </span>
          )}
          {task.attachments?.length > 0 && (
            <span className="flex items-center gap-1 text-xs">
              <FiPaperclip size={11} /> {task.attachments.length}
            </span>
          )}
          {task.checklist?.length > 0 && (
            <span className="text-xs">
              {task.checklist.filter((c) => c.isCompleted).length}/{task.checklist.length}
            </span>
          )}
        </div>
        <div className="flex -space-x-1">
          {task.assignees?.slice(0, 3).map((a, i) => (
            <Avatar key={i} src={a.avatar} name={a.name || 'U'} size="xs" className="ring-1 ring-white dark:ring-gray-800" />
          ))}
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
