import { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  FiX, FiCalendar, FiUser, FiPaperclip, FiMessageSquare,
  FiCheckSquare, FiTrash2, FiEdit2, FiCheck, FiUpload, FiLock, FiExternalLink,
} from 'react-icons/fi';
import { updateTask, deleteTask, addComment, clearSelectedTask } from '../../app/slices/taskSlice';
import api from '../../services/api';
import Avatar from '../common/Avatar';
import { PriorityBadge, StatusBadge } from '../common/Badge';
import { formatRelativeTime } from '../../utils/helpers';
import Spinner from '../common/Spinner';
import ConfirmDialog from '../common/ConfirmDialog';
import toast from 'react-hot-toast';

const PRIORITIES = ['low', 'medium', 'high', 'urgent'];
const STATUSES = ['todo', 'in-progress', 'review', 'done'];

const TaskModal = () => {
  const dispatch = useDispatch();
  const { selectedTask: task } = useSelector((s) => s.tasks);
  const { user } = useSelector((s) => s.auth);
  const { list: lists } = useSelector((s) => s.boards);
  const commentFileRef = useRef(null);
  const attachFileRef = useRef(null);
  const [attachFile, setAttachFile] = useState(null);
  const [uploadingAttach, setUploadingAttach] = useState(false);

  const canUpload = ['pro', 'enterprise'].includes(user?.subscription?.plan);

  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [comment, setComment] = useState('');
  const [addingComment, setAddingComment] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newCheckItem, setNewCheckItem] = useState('');
  const [addingCheck, setAddingCheck] = useState(false);

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || '');
    }
  }, [task]);

  if (!task) return null;

  const handleClose = () => dispatch(clearSelectedTask());

  const handleSaveTitle = async () => {
    if (title.trim() && title !== task.title) {
      setSaving(true);
      await dispatch(updateTask({ id: task._id, data: { title: title.trim() } }));
      setSaving(false);
    }
    setEditing(false);
  };

  const handleSaveDescription = async () => {
    setSaving(true);
    await dispatch(updateTask({ id: task._id, data: { description } }));
    setSaving(false);
  };

  const handleFieldUpdate = async (field, value) => {
    await dispatch(updateTask({ id: task._id, data: { [field]: value } }));
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!comment.trim() && !attachFile) return;
    setAddingComment(true);
    const formData = new FormData();
    formData.append('content', comment.trim() || '📎 Attachment');
    if (attachFile) formData.append('attachment', attachFile);
    await dispatch(addComment({ id: task._id, data: formData, isFormData: true }));
    setComment('');
    setAttachFile(null);
    setAddingComment(false);
  };

  const handleDirectAttach = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingAttach(true);
    try {
      const formData = new FormData();
      formData.append('attachment', file);
      const res = await api.post('/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      const { url, originalName } = res.data.data;
      const existing = task.attachments || [];
      await dispatch(updateTask({ id: task._id, data: { attachments: [...existing, { url, name: originalName }] } }));
      toast.success('File attached!');
    } catch {
      toast.error('Upload failed');
    } finally {
      setUploadingAttach(false);
      e.target.value = '';
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    await dispatch(deleteTask(task._id));
    setDeleting(false);
    setConfirmDelete(false);
    handleClose();
  };

  const handleChecklistToggle = async (index) => {
    const updated = task.checklist.map((item, i) =>
      i === index ? { ...item, isCompleted: !item.isCompleted } : item
    );
    await dispatch(updateTask({ id: task._id, data: { checklist: updated } }));
  };

  const handleAddCheckItem = async (e) => {
    e.preventDefault();
    if (!newCheckItem.trim()) return;
    const updated = [...(task.checklist || []), { title: newCheckItem.trim(), isCompleted: false }];
    await dispatch(updateTask({ id: task._id, data: { checklist: updated } }));
    setNewCheckItem('');
    setAddingCheck(false);
  };

  const completedChecks = task.checklist?.filter((c) => c.isCompleted).length || 0;
  const totalChecks = task.checklist?.length || 0;
  const checkProgress = totalChecks > 0 ? (completedChecks / totalChecks) * 100 : 0;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-12 overflow-y-auto">
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={handleClose} />
        <div className="relative w-full max-w-3xl bg-white dark:bg-gray-800 rounded-2xl shadow-2xl animate-slide-up mb-8">
          {/* Cover */}
          {task.coverImage && (
            <div className="h-32 rounded-t-2xl overflow-hidden">
              <img src={task.coverImage} alt="" className="w-full h-full object-cover" />
            </div>
          )}

          <div className="p-6">
            {/* Header */}
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex-1">
                {editing ? (
                  <div className="flex gap-2">
                    <input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') handleSaveTitle(); if (e.key === 'Escape') setEditing(false); }}
                      className="input text-lg font-bold flex-1"
                      autoFocus
                    />
                    <button onClick={handleSaveTitle} className="p-2 text-green-600 hover:bg-green-100 rounded-lg">
                      {saving ? <Spinner size="sm" /> : <FiCheck size={16} />}
                    </button>
                  </div>
                ) : (
                  <h2
                    onClick={() => setEditing(true)}
                    className="text-xl font-bold text-gray-900 dark:text-gray-100 cursor-pointer hover:text-primary-600 transition-colors"
                  >
                    {task.title}
                  </h2>
                )}
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <PriorityBadge priority={task.priority} />
                  <StatusBadge status={task.status} />
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => setConfirmDelete(true)} className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-600 transition-colors">
                  <FiTrash2 size={16} />
                </button>
                <button onClick={handleClose} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 transition-colors">
                  <FiX size={18} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Main content */}
              <div className="md:col-span-2 space-y-5">
                {/* Description */}
                <div>
                  <label className="label flex items-center gap-2"><FiEdit2 size={13} /> Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    onBlur={handleSaveDescription}
                    className="input resize-none text-sm"
                    rows={4}
                    placeholder="Add a description..."
                  />
                </div>

                {/* Checklist */}
                {(task.checklist?.length > 0 || addingCheck) && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="label flex items-center gap-2 mb-0">
                        <FiCheckSquare size={13} /> Checklist
                        <span className="text-xs text-gray-500">({completedChecks}/{totalChecks})</span>
                      </label>
                    </div>
                    {totalChecks > 0 && (
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mb-3">
                        <div
                          className="bg-green-500 h-1.5 rounded-full transition-all duration-300"
                          style={{ width: `${checkProgress}%` }}
                        />
                      </div>
                    )}
                    <div className="space-y-2">
                      {task.checklist?.map((item, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={item.isCompleted}
                            onChange={() => handleChecklistToggle(i)}
                            className="w-4 h-4 rounded text-primary-600 cursor-pointer"
                          />
                          <span className={`text-sm flex-1 ${item.isCompleted ? 'line-through text-gray-400' : 'text-gray-700 dark:text-gray-300'}`}>
                            {item.title}
                          </span>
                        </div>
                      ))}
                      {addingCheck && (
                        <form onSubmit={handleAddCheckItem} className="flex gap-2">
                          <input
                            value={newCheckItem}
                            onChange={(e) => setNewCheckItem(e.target.value)}
                            className="input text-sm flex-1"
                            placeholder="Add item..."
                            autoFocus
                          />
                          <button type="submit" className="btn-primary text-xs py-1.5 px-3">Add</button>
                          <button type="button" onClick={() => setAddingCheck(false)} className="btn-secondary text-xs py-1.5 px-3">Cancel</button>
                        </form>
                      )}
                    </div>
                  </div>
                )}

                <button
                  onClick={() => setAddingCheck(true)}
                  className="flex items-center gap-2 text-sm text-gray-500 hover:text-primary-600 transition-colors"
                >
                  <FiCheckSquare size={14} /> Add checklist item
                </button>

                {/* Comments */}
                <div>
                  <label className="label flex items-center gap-2">
                    <FiMessageSquare size={13} /> Comments ({task.comments?.length || 0})
                  </label>
                  <div className="space-y-3 mb-3 max-h-48 overflow-y-auto">
                    {task.comments?.map((c, i) => (
                      <div key={i} className="flex gap-3">
                        <Avatar src={c.user?.avatar} name={c.user?.name || 'U'} size="sm" />
                        <div className="flex-1 bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-semibold text-gray-900 dark:text-gray-100">{c.user?.name}</span>
                            <span className="text-xs text-gray-400">{formatRelativeTime(c.createdAt)}</span>
                          </div>
                          <p className="text-sm text-gray-700 dark:text-gray-300">{c.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <form onSubmit={handleAddComment} className="flex gap-2">
                    <Avatar src={user?.avatar} name={user?.name || 'U'} size="sm" />
                    <div className="flex-1 space-y-2">
                      <div className="flex gap-2">
                        <input
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                          className="input text-sm flex-1"
                          placeholder="Write a comment..."
                        />
                        <button type="submit" disabled={addingComment || (!comment.trim() && !attachFile)} className="btn-primary text-xs py-1.5 px-3">
                          {addingComment ? <Spinner size="sm" /> : 'Send'}
                        </button>
                      </div>
                      {/* File attachment with comment — Pro/Enterprise only */}
                      {canUpload ? (
                        <div className="flex items-center gap-2">
                          <input
                            ref={commentFileRef}
                            type="file"
                            className="hidden"
                            onChange={(e) => setAttachFile(e.target.files[0] || null)}
                          />
                          {attachFile ? (
                            <div className="flex items-center gap-2 text-xs bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 px-2 py-1 rounded-lg">
                              <FiPaperclip size={11} />
                              <span className="truncate max-w-[150px]">{attachFile.name}</span>
                              <button type="button" onClick={() => setAttachFile(null)} className="text-red-500 hover:text-red-600">
                                <FiX size={11} />
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => commentFileRef.current?.click()}
                              className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-primary-600 transition-colors"
                            >
                              <FiUpload size={13} /> Attach to comment
                            </button>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-xs text-gray-400">
                          <FiLock size={11} />
                          <span>File attachments on <a href="/subscription" className="text-primary-600 hover:underline">Pro plan</a></span>
                        </div>
                      )}
                    </div>
                  </form>
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-4">
                {/* Priority */}
                <div>
                  <label className="label text-xs">Priority</label>
                  <select
                    value={task.priority}
                    onChange={(e) => handleFieldUpdate('priority', e.target.value)}
                    className="input text-sm"
                  >
                    {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>

                {/* Status */}
                <div>
                  <label className="label text-xs">Status</label>
                  <select
                    value={task.status}
                    onChange={(e) => handleFieldUpdate('status', e.target.value)}
                    className="input text-sm"
                  >
                    {STATUSES.map((s) => <option key={s} value={s}>{s.replace('-', ' ')}</option>)}
                  </select>
                </div>

                {/* Due Date */}
                <div>
                  <label className="label text-xs flex items-center gap-1"><FiCalendar size={11} /> Due Date</label>
                  <input
                    type="date"
                    value={task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : ''}
                    onChange={(e) => handleFieldUpdate('dueDate', e.target.value || null)}
                    className="input text-sm"
                  />
                </div>

                {/* Assignees */}
                <div>
                  <label className="label text-xs flex items-center gap-1"><FiUser size={11} /> Assignees</label>
                  <div className="flex flex-wrap gap-1.5">
                    {task.assignees?.map((a, i) => (
                      <div key={i} className="flex items-center gap-1.5 bg-gray-100 dark:bg-gray-700 rounded-full px-2 py-1">
                        <Avatar src={a.avatar} name={a.name || 'U'} size="xs" />
                        <span className="text-xs text-gray-700 dark:text-gray-300">{a.name}</span>
                      </div>
                    ))}
                    {task.assignees?.length === 0 && (
                      <span className="text-xs text-gray-400">No assignees</span>
                    )}
                  </div>
                </div>

                {/* Created by */}
                <div>
                  <label className="label text-xs">Created by</label>
                  <div className="flex items-center gap-2">
                    <Avatar src={task.createdBy?.avatar} name={task.createdBy?.name || 'U'} size="xs" />
                    <span className="text-xs text-gray-600 dark:text-gray-400">{task.createdBy?.name}</span>
                  </div>
                </div>

                {/* Attachments */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="label text-xs flex items-center gap-1 mb-0">
                      <FiPaperclip size={11} /> Attachments ({task.attachments?.length || 0})
                    </label>
                    {canUpload ? (
                      <>
                        <input ref={attachFileRef} type="file" className="hidden" onChange={handleDirectAttach} />
                        <button
                          onClick={() => attachFileRef.current?.click()}
                          disabled={uploadingAttach}
                          className="flex items-center gap-1 text-xs text-primary-600 hover:text-primary-700 font-medium transition-colors disabled:opacity-50"
                        >
                          {uploadingAttach ? <Spinner size="sm" /> : <><FiUpload size={11} /> Add</>}
                        </button>
                      </>
                    ) : (
                      <a href="/subscription" className="flex items-center gap-1 text-xs text-gray-400 hover:text-primary-600">
                        <FiLock size={10} /> Pro
                      </a>
                    )}
                  </div>
                  {task.attachments?.length > 0 ? (
                    <div className="space-y-1.5">
                      {task.attachments.map((att, i) => (
                        <a
                          key={i}
                          href={att.url}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-2 text-xs text-primary-600 hover:text-primary-700 bg-primary-50 dark:bg-primary-900/20 rounded-lg px-2 py-1.5 group"
                        >
                          <FiPaperclip size={11} className="flex-shrink-0" />
                          <span className="truncate flex-1">{att.name}</span>
                          <FiExternalLink size={10} className="opacity-0 group-hover:opacity-100 flex-shrink-0" />
                        </a>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400 dark:text-gray-500 italic">
                      {canUpload ? 'No attachments yet' : 'Upgrade to Pro to attach files'}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete Task"
        message={`Delete "${task.title}"? This cannot be undone.`}
      />
    </>
  );
};

export default TaskModal;
