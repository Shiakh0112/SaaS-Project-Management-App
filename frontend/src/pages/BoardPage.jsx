import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  DndContext, DragOverlay, useSensor, useSensors,
  closestCorners, MouseSensor, TouchSensor,
} from '@dnd-kit/core';
import { FiPlus, FiArrowLeft } from 'react-icons/fi';
import { fetchTasks, moveTask, optimisticMove } from '../app/slices/taskSlice';
import { fetchBoards, fetchLists, createList, setCurrentBoard } from '../app/slices/boardSlice';
import { fetchProjectById } from '../app/slices/projectSlice';
import ListColumn from '../components/board/ListColumn';
import TaskCard from '../components/board/TaskCard';
import TaskModal from '../components/task/TaskModal';
import Spinner from '../components/common/Spinner';
import { joinBoard, leaveBoard } from '../services/socket';

const BoardPage = () => {
  const { projectId, boardId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { list: tasks, selectedTask } = useSelector((s) => s.tasks);
  const { lists, list: boards, current: board } = useSelector((s) => s.boards);
  const { current: project } = useSelector((s) => s.projects);

  const [activeTask, setActiveTask] = useState(null);
  const [showAddList, setShowAddList] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [addingList, setAddingList] = useState(false);

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } })
  );

  useEffect(() => {
    if (projectId) dispatch(fetchProjectById(projectId));
    if (projectId) dispatch(fetchBoards(projectId));
  }, [projectId, dispatch]);

  useEffect(() => {
    if (boardId) {
      dispatch(fetchTasks(boardId));
      dispatch(fetchLists(boardId));
      joinBoard(boardId);
    }
    return () => { if (boardId) leaveBoard(boardId); };
  }, [boardId, dispatch]);

  useEffect(() => {
    if (boards.length > 0 && boardId) {
      const found = boards.find((b) => b._id === boardId);
      if (found) dispatch(setCurrentBoard(found));
    }
  }, [boards, boardId, dispatch]);

  // Build display lists: use Redux lists state, fallback to deriving from tasks
  const displayLists = lists.length > 0
    ? lists
    : [...new Set(tasks.map((t) => typeof t.list === 'object' ? t.list._id : t.list))]
        .map((id) => {
          const t = tasks.find((t) => (typeof t.list === 'object' ? t.list._id : t.list) === id);
          return { _id: id, name: typeof t?.list === 'object' ? t.list.name : 'List' };
        });

  const getListTasks = (listId) =>
    tasks.filter((t) => {
      const tListId = typeof t.list === 'object' ? t.list._id : t.list;
      return tListId === listId && !t.isArchived;
    }).sort((a, b) => a.position - b.position);

  const handleDragStart = ({ active }) => {
    const task = tasks.find((t) => t._id === active.id);
    if (task) setActiveTask(task);
  };

  const handleDragEnd = useCallback(async ({ active, over }) => {
    setActiveTask(null);
    if (!over || active.id === over.id) return;

    const task = tasks.find((t) => t._id === active.id);
    if (!task) return;

    const overId = over.id;
    // Check if dropped on a list or a task
    const overTask = tasks.find((t) => t._id === overId);
    const targetListId = overTask
      ? (typeof overTask.list === 'object' ? overTask.list._id : overTask.list)
      : overId; // dropped on list container

    const targetListTasks = getListTasks(targetListId);
    let newPosition = 0;

    if (overTask) {
      newPosition = overTask.position;
    } else {
      newPosition = targetListTasks.length;
    }

    // Optimistic update
    dispatch(optimisticMove({ taskId: task._id, newListId: targetListId, newPosition }));

    // API call
    await dispatch(moveTask({ id: task._id, listId: targetListId, position: newPosition }));
  }, [tasks, dispatch]);

  const handleAddList = async (e) => {
    e.preventDefault();
    if (!newListName.trim()) return;
    setAddingList(true);
    await dispatch(createList({ name: newListName.trim(), boardId }));
    setNewListName('');
    setShowAddList(false);
    setAddingList(false);
    dispatch(fetchLists(boardId));
  };

  const allLists = displayLists;

  return (
    <div className="flex flex-col h-full">
      {/* Board header */}
      <div
        className="flex items-center justify-between px-6 py-3 border-b border-gray-200 dark:border-gray-700 flex-shrink-0"
        style={{ backgroundColor: board?.background ? `${board.background}15` : undefined }}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(`/projects/${projectId}`)}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 transition-colors"
          >
            <FiArrowLeft size={16} />
          </button>
          <div>
            <h1 className="font-bold text-gray-900 dark:text-gray-100">{board?.name || 'Board'}</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">{project?.name}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 dark:text-gray-400">{tasks.length} tasks</span>
        </div>
      </div>

      {/* Board content */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-4 p-6 h-full items-start">
            {allLists.map((list) => (
              <ListColumn
                key={list._id}
                list={list}
                tasks={getListTasks(list._id)}
                boardId={boardId}
                projectId={projectId}
              />
            ))}

            {/* Add list */}
            <div className="flex-shrink-0 w-72">
              {showAddList ? (
                <form onSubmit={handleAddList} className="bg-gray-100 dark:bg-gray-800/60 rounded-2xl p-3 space-y-2">
                  <input
                    value={newListName}
                    onChange={(e) => setNewListName(e.target.value)}
                    className="input text-sm"
                    placeholder="List name..."
                    autoFocus
                    onKeyDown={(e) => e.key === 'Escape' && setShowAddList(false)}
                  />
                  <div className="flex gap-2">
                    <button type="submit" disabled={addingList} className="btn-primary text-xs py-1.5 px-3">
                      {addingList ? <Spinner size="sm" /> : 'Add List'}
                    </button>
                    <button type="button" onClick={() => setShowAddList(false)} className="btn-secondary text-xs py-1.5 px-3">Cancel</button>
                  </div>
                </form>
              ) : (
                <button
                  onClick={() => setShowAddList(true)}
                  className="flex items-center gap-2 w-full px-4 py-3 bg-gray-100/80 dark:bg-gray-800/40 hover:bg-gray-200 dark:hover:bg-gray-700/60 rounded-2xl text-sm text-gray-600 dark:text-gray-400 transition-colors border-2 border-dashed border-gray-300 dark:border-gray-600"
                >
                  <FiPlus size={16} /> Add another list
                </button>
              )}
            </div>
          </div>

          <DragOverlay>
            {activeTask && <TaskCard task={activeTask} overlay />}
          </DragOverlay>
        </DndContext>
      </div>

      {selectedTask && <TaskModal />}
    </div>
  );
};

export default BoardPage;
