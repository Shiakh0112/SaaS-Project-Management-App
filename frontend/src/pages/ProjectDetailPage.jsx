import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  FiArrowLeft, FiPlus, FiLayout, FiMoreVertical,
  FiEdit2, FiTrash2, FiUsers, FiCalendar,
} from 'react-icons/fi';
import { fetchProjectById } from '../app/slices/projectSlice';
import { fetchBoards, createBoard, deleteBoard } from '../app/slices/boardSlice';
import Modal from '../components/common/Modal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import Alert from '../components/common/Alert';
import Spinner from '../components/common/Spinner';
import Avatar from '../components/common/Avatar';
import { formatDate } from '../utils/helpers';
import useClickOutside from '../hooks/useClickOutside';
import toast from 'react-hot-toast';

const BOARD_COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#ef4444', '#f97316', '#22c55e', '#14b8a6', '#3b82f6'];

const BoardCard = ({ board, projectId, onDelete }) => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useClickOutside(() => setMenuOpen(false));

  return (
    <div
      className="card hover:shadow-md transition-all duration-200 cursor-pointer group overflow-hidden"
      onClick={() => navigate(`/projects/${projectId}/boards/${board._id}`)}
    >
      <div className="h-2 w-full" style={{ backgroundColor: board.background || '#6366f1' }} />
      <div className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
              style={{ backgroundColor: board.background || '#6366f1' }}>
              <FiLayout size={16} />
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate group-hover:text-primary-600 transition-colors">
                {board.name}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                {board.description || 'No description'}
              </p>
            </div>
          </div>
          <div className="relative" ref={menuRef} onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 opacity-0 group-hover:opacity-100 transition-all"
            >
              <FiMoreVertical size={15} />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-8 w-36 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 z-10 py-1 animate-fade-in">
                <button
                  onClick={() => { setMenuOpen(false); onDelete(board); }}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 w-full"
                >
                  <FiTrash2 size={13} /> Delete
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const CreateBoardModal = ({ isOpen, onClose, projectId }) => {
  const dispatch = useDispatch();
  const { loading, error } = useSelector((s) => s.boards);
  const [form, setForm] = useState({ name: '', description: '', background: BOARD_COLORS[0] });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await dispatch(createBoard({ ...form, projectId }));
    if (!res.error) {
      toast.success('Board created!');
      onClose();
      setForm({ name: '', description: '', background: BOARD_COLORS[0] });
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Board">
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        {error && <Alert type="error" message={error} />}
        <div>
          <label className="label">Board Name *</label>
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="input" placeholder="e.g. Sprint 1" required />
        </div>
        <div>
          <label className="label">Description</label>
          <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="input resize-none" rows={2} placeholder="Optional description" />
        </div>
        <div>
          <label className="label">Color</label>
          <div className="flex gap-2 flex-wrap">
            {BOARD_COLORS.map((c) => (
              <button key={c} type="button" onClick={() => setForm({ ...form, background: c })}
                className={`w-7 h-7 rounded-full transition-transform ${form.background === c ? 'scale-125 ring-2 ring-offset-2 ring-gray-400' : 'hover:scale-110'}`}
                style={{ backgroundColor: c }} />
            ))}
          </div>
        </div>
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="btn-secondary flex-1 justify-center">Cancel</button>
          <button type="submit" disabled={loading} className="btn-primary flex-1 justify-center">
            {loading ? <Spinner size="sm" /> : 'Create Board'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

const ProjectDetailPage = () => {
  const { projectId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { current: project, loading: projLoading } = useSelector((s) => s.projects);
  const { list: boards, loading: boardLoading } = useSelector((s) => s.boards);

  const [showCreate, setShowCreate] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    dispatch(fetchProjectById(projectId));
    dispatch(fetchBoards(projectId));
  }, [projectId, dispatch]);

  const handleDelete = async () => {
    setDeleting(true);
    await dispatch(deleteBoard(deleteTarget._id));
    setDeleting(false);
    setDeleteTarget(null);
    toast.success('Board deleted');
  };

  if (projLoading && !project) {
    return <div className="flex justify-center items-center h-full"><Spinner size="lg" /></div>;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate('/projects')}
          className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-colors">
          <FiArrowLeft size={18} />
        </button>
        <div className="flex items-center gap-3 flex-1">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
            style={{ backgroundColor: project?.color || '#6366f1' }}>
            {project?.name?.[0]?.toUpperCase() || 'P'}
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">{project?.name}</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">{project?.description || 'No description'}</p>
          </div>
        </div>
        <button onClick={() => setShowCreate(true)} className="btn-primary">
          <FiPlus size={16} /> New Board
        </button>
      </div>

      {/* Project meta */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="card p-4">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Boards</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{boards.length}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Members</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{project?.members?.length || 0}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Team</p>
          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">{project?.team?.name || '—'}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Due Date</p>
          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            {project?.dueDate ? formatDate(project.dueDate) : '—'}
          </p>
        </div>
      </div>

      {/* Members */}
      {project?.members?.length > 0 && (
        <div className="mb-8">
          <h2 className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2 mb-3">
            <FiUsers size={16} className="text-primary-600" /> Members
          </h2>
          <div className="flex flex-wrap gap-3">
            {project.members.map((m, i) => (
              <div key={i} className="flex items-center gap-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2">
                <Avatar src={m.avatar} name={m.name || 'U'} size="sm" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{m.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{m.email}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Boards */}
      <div>
        <h2 className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2 mb-4">
          <FiLayout size={16} className="text-primary-600" /> Boards
        </h2>

        {boardLoading ? (
          <div className="flex justify-center py-12"><Spinner size="lg" /></div>
        ) : boards.length === 0 ? (
          <div className="text-center py-16 card">
            <FiLayout size={40} className="text-gray-300 dark:text-gray-600 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">No boards yet</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Create your first board to start organizing tasks</p>
            <button onClick={() => setShowCreate(true)} className="btn-primary inline-flex">
              <FiPlus size={16} /> Create Board
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {boards.map((board) => (
              <BoardCard key={board._id} board={board} projectId={projectId} onDelete={setDeleteTarget} />
            ))}
            <button
              onClick={() => setShowCreate(true)}
              className="card p-5 border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-primary-400 dark:hover:border-primary-500 flex items-center justify-center gap-2 text-gray-500 dark:text-gray-400 hover:text-primary-600 transition-all"
            >
              <FiPlus size={18} /> Add Board
            </button>
          </div>
        )}
      </div>

      <CreateBoardModal isOpen={showCreate} onClose={() => setShowCreate(false)} projectId={projectId} />
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete Board"
        message={`Delete "${deleteTarget?.name}" and all its tasks?`}
      />
    </div>
  );
};

export default ProjectDetailPage;
