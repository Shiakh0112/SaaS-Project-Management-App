import { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { FiPlus, FiMoreVertical, FiEdit2, FiTrash2, FiX, FiCheck } from 'react-icons/fi';
import { useDispatch, useSelector } from 'react-redux';
import { createTask } from '../../app/slices/taskSlice';
import { updateList, deleteList } from '../../app/slices/boardSlice';
import TaskCard from './TaskCard';
import ConfirmDialog from '../common/ConfirmDialog';
import useClickOutside from '../../hooks/useClickOutside';

const ListColumn = ({ list, tasks, boardId, projectId }) => {
  const dispatch = useDispatch();
  const { current: board } = useSelector((s) => s.boards);
  const [addingTask, setAddingTask] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [listName, setListName] = useState(list.name);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const menuRef = useClickOutside(() => setMenuOpen(false));

  const { setNodeRef, isOver } = useDroppable({ id: list._id, data: { type: 'list', listId: list._id } });

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;
    await dispatch(createTask({
      title: taskTitle.trim(),
      listId: list._id,
      boardId,
      projectId,
    }));
    setTaskTitle('');
    setAddingTask(false);
  };

  const handleRenameList = async () => {
    if (listName.trim() && listName !== list.name) {
      await dispatch(updateList({ id: list._id, data: { name: listName.trim() } }));
    }
    setEditingName(false);
  };

  const handleDeleteList = async () => {
    await dispatch(deleteList(list._id));
    setConfirmDelete(false);
  };

  return (
    <div className="flex-shrink-0 w-72">
      <div className={`bg-gray-100 dark:bg-gray-800/60 rounded-2xl flex flex-col max-h-full transition-colors ${isOver ? 'bg-primary-50 dark:bg-primary-900/20 ring-2 ring-primary-400' : ''}`}>
        {/* Header */}
        <div className="flex items-center justify-between px-3 py-3">
          {editingName ? (
            <div className="flex items-center gap-1 flex-1">
              <input
                value={listName}
                onChange={(e) => setListName(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleRenameList(); if (e.key === 'Escape') setEditingName(false); }}
                className="input py-1 text-sm font-semibold flex-1"
                autoFocus
              />
              <button onClick={handleRenameList} className="p-1 text-green-600 hover:bg-green-100 rounded"><FiCheck size={14} /></button>
              <button onClick={() => setEditingName(false)} className="p-1 text-gray-500 hover:bg-gray-200 rounded"><FiX size={14} /></button>
            </div>
          ) : (
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <h3 className="font-semibold text-sm text-gray-800 dark:text-gray-200 truncate">{list.name}</h3>
              <span className="badge bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs">{tasks.length}</span>
            </div>
          )}

          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 transition-colors"
            >
              <FiMoreVertical size={14} />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-8 w-40 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 z-20 py-1 animate-fade-in">
                <button
                  onClick={() => { setEditingName(true); setMenuOpen(false); }}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 w-full"
                >
                  <FiEdit2 size={13} /> Rename
                </button>
                <button
                  onClick={() => { setConfirmDelete(true); setMenuOpen(false); }}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 w-full"
                >
                  <FiTrash2 size={13} /> Delete
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Tasks */}
        <div ref={setNodeRef} className="flex-1 overflow-y-auto px-3 pb-2 space-y-2 min-h-[2rem]">
          <SortableContext items={tasks.map((t) => t._id)} strategy={verticalListSortingStrategy}>
            {tasks.map((task) => (
              <TaskCard key={task._id} task={task} />
            ))}
          </SortableContext>
        </div>

        {/* Add task */}
        <div className="px-3 pb-3">
          {addingTask ? (
            <form onSubmit={handleAddTask} className="space-y-2">
              <textarea
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) handleAddTask(e); if (e.key === 'Escape') setAddingTask(false); }}
                className="input resize-none text-sm"
                rows={2}
                placeholder="Task title..."
                autoFocus
              />
              <div className="flex gap-2">
                <button type="submit" className="btn-primary text-xs py-1.5 px-3">Add</button>
                <button type="button" onClick={() => setAddingTask(false)} className="btn-secondary text-xs py-1.5 px-3">Cancel</button>
              </div>
            </form>
          ) : (
            <button
              onClick={() => setAddingTask(true)}
              className="flex items-center gap-2 w-full px-2 py-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-colors"
            >
              <FiPlus size={15} /> Add task
            </button>
          )}
        </div>
      </div>

      <ConfirmDialog
        isOpen={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={handleDeleteList}
        title="Delete List"
        message={`Delete "${list.name}" and all its tasks?`}
      />
    </div>
  );
};

export default ListColumn;
