import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { FiPlus, FiFolder, FiMoreVertical, FiEdit2, FiTrash2, FiUsers, FiCalendar } from 'react-icons/fi';
import { fetchProjects, createProject, deleteProject } from '../app/slices/projectSlice';
import { fetchMyTeams } from '../app/slices/teamSlice';
import Modal from '../components/common/Modal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import Alert from '../components/common/Alert';
import Spinner from '../components/common/Spinner';
import Avatar from '../components/common/Avatar';
import { PROJECT_COLORS, formatDate } from '../utils/helpers';
import useClickOutside from '../hooks/useClickOutside';

const ProjectCard = ({ project, onDelete }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useClickOutside(() => setMenuOpen(false));

  return (
    <div className="card hover:shadow-md transition-all duration-200 group overflow-hidden">
      {/* Color bar */}
      <div className="h-1.5 w-full" style={{ backgroundColor: project.color || '#6366f1' }} />

      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <Link to={`/projects/${project._id}`} className="flex items-center gap-3 flex-1 min-w-0">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
              style={{ backgroundColor: project.color || '#6366f1' }}
            >
              {project.name[0].toUpperCase()}
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate group-hover:text-primary-600 transition-colors">
                {project.name}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{project.team?.name}</p>
            </div>
          </Link>

          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 opacity-0 group-hover:opacity-100 transition-all"
            >
              <FiMoreVertical size={16} />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-8 w-40 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 z-10 py-1 animate-fade-in">
                <Link
                  to={`/projects/${project._id}`}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <FiEdit2 size={14} /> Open
                </Link>
                <button
                  onClick={() => { setMenuOpen(false); onDelete(project); }}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 w-full"
                >
                  <FiTrash2 size={14} /> Delete
                </button>
              </div>
            )}
          </div>
        </div>

        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 line-clamp-2 min-h-[2.5rem]">
          {project.description || 'No description provided'}
        </p>

        <div className="flex items-center justify-between">
          <div className="flex -space-x-1.5">
            {project.members?.slice(0, 4).map((m, i) => (
              <Avatar key={i} src={m.avatar} name={m.name || 'U'} size="xs" className="ring-2 ring-white dark:ring-gray-800" />
            ))}
            {project.members?.length > 4 && (
              <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 ring-2 ring-white dark:ring-gray-800 flex items-center justify-center text-xs text-gray-600 dark:text-gray-400 font-medium">
                +{project.members.length - 4}
              </div>
            )}
          </div>
          {project.dueDate && (
            <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
              <FiCalendar size={12} />
              {formatDate(project.dueDate)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const CreateProjectModal = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  const { list: teams } = useSelector((s) => s.teams);
  const { loading, error } = useSelector((s) => s.projects);
  const [form, setForm] = useState({ name: '', description: '', teamId: '', color: PROJECT_COLORS[0], visibility: 'team' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await dispatch(createProject(form));
    if (!res.error) onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Project">
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        {error && <Alert type="error" message={error} />}

        <div>
          <label className="label">Project Name *</label>
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="input"
            placeholder="My Awesome Project"
            required
          />
        </div>

        <div>
          <label className="label">Description</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="input resize-none"
            rows={3}
            placeholder="What is this project about?"
          />
        </div>

        <div>
          <label className="label">Team *</label>
          <select
            value={form.teamId}
            onChange={(e) => setForm({ ...form, teamId: e.target.value })}
            className="input"
            required
          >
            <option value="">Select a team</option>
            {teams.map((t) => (
              <option key={t._id} value={t._id}>{t.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="label">Color</label>
          <div className="flex gap-2 flex-wrap">
            {PROJECT_COLORS.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => setForm({ ...form, color })}
                className={`w-7 h-7 rounded-full transition-transform ${form.color === color ? 'scale-125 ring-2 ring-offset-2 ring-gray-400' : 'hover:scale-110'}`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>

        <div>
          <label className="label">Visibility</label>
          <select value={form.visibility} onChange={(e) => setForm({ ...form, visibility: e.target.value })} className="input">
            <option value="team">Team</option>
            <option value="private">Private</option>
            <option value="public">Public</option>
          </select>
        </div>

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="btn-secondary flex-1 justify-center">Cancel</button>
          <button type="submit" disabled={loading} className="btn-primary flex-1 justify-center">
            {loading && <Spinner size="sm" />} Create Project
          </button>
        </div>
      </form>
    </Modal>
  );
};

const ProjectsPage = () => {
  const dispatch = useDispatch();
  const { list: projects, loading } = useSelector((s) => s.projects);
  const [showCreate, setShowCreate] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    dispatch(fetchProjects());
    dispatch(fetchMyTeams());
  }, [dispatch]);

  const handleDelete = async () => {
    setDeleting(true);
    await dispatch(deleteProject(deleteTarget._id));
    setDeleting(false);
    setDeleteTarget(null);
  };

  const filtered = projects.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Projects</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{projects.length} total projects</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="btn-primary">
          <FiPlus size={16} /> New Project
        </button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input max-w-xs"
          placeholder="Search projects..."
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Spinner size="lg" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <FiFolder size={48} className="text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
            {search ? 'No projects found' : 'No projects yet'}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            {search ? 'Try a different search term' : 'Create your first project to get started'}
          </p>
          {!search && (
            <button onClick={() => setShowCreate(true)} className="btn-primary inline-flex">
              <FiPlus size={16} /> Create Project
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((project) => (
            <ProjectCard key={project._id} project={project} onDelete={setDeleteTarget} />
          ))}
        </div>
      )}

      <CreateProjectModal isOpen={showCreate} onClose={() => setShowCreate(false)} />
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete Project"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This will also delete all boards and tasks.`}
      />
    </div>
  );
};

export default ProjectsPage;
