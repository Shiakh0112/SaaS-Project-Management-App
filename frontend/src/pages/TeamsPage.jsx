import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  FiUsers, FiPlus, FiMail, FiMoreVertical, FiTrash2,
  FiUserCheck, FiUserX, FiShield, FiChevronDown,
} from 'react-icons/fi';
import {
  fetchMyTeams, fetchTeamById, createTeam,
  inviteMember, updateMemberRole, removeMember,
} from '../app/slices/teamSlice';
import Modal from '../components/common/Modal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import Alert from '../components/common/Alert';
import Spinner from '../components/common/Spinner';
import Avatar from '../components/common/Avatar';
import { RoleBadge } from '../components/common/Badge';
import useClickOutside from '../hooks/useClickOutside';
import toast from 'react-hot-toast';

const ROLES = ['admin', 'member', 'viewer'];

const MemberRow = ({ member, teamId, isOwner, currentUserId, dispatch }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState(false);
  const [removing, setRemoving] = useState(false);
  const menuRef = useClickOutside(() => setMenuOpen(false));
  const isSelf = member.user._id === currentUserId;

  const handleRoleChange = async (role) => {
    setMenuOpen(false);
    const res = await dispatch(updateMemberRole({ teamId, userId: member.user._id, role }));
    if (!res.error) toast.success('Role updated');
  };

  const handleRemove = async () => {
    setRemoving(true);
    const res = await dispatch(removeMember({ teamId, userId: member.user._id }));
    setRemoving(false);
    setConfirmRemove(false);
    if (!res.error) toast.success('Member removed');
  };

  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700 last:border-0">
      <div className="flex items-center gap-3">
        <Avatar src={member.user.avatar} name={member.user.name || 'U'} size="md" />
        <div>
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {member.user.name} {isSelf && <span className="text-xs text-gray-400">(you)</span>}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">{member.user.email}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <RoleBadge role={member.role} />
        {isOwner && !isSelf && member.role !== 'owner' && (
          <div className="relative" ref={menuRef}>
            <button onClick={() => setMenuOpen(!menuOpen)}
              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 transition-colors">
              <FiMoreVertical size={15} />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-8 w-44 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 z-20 py-1 animate-fade-in">
                <p className="px-3 py-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">Change Role</p>
                {ROLES.map((r) => (
                  <button key={r} onClick={() => handleRoleChange(r)}
                    className={`flex items-center gap-2 px-3 py-2 text-sm w-full hover:bg-gray-50 dark:hover:bg-gray-700 ${member.role === r ? 'text-primary-600 font-medium' : 'text-gray-700 dark:text-gray-300'}`}>
                    <FiShield size={13} /> {r}
                  </button>
                ))}
                <div className="border-t border-gray-100 dark:border-gray-700 mt-1 pt-1">
                  <button onClick={() => { setMenuOpen(false); setConfirmRemove(true); }}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 w-full">
                    <FiUserX size={13} /> Remove
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      <ConfirmDialog
        isOpen={confirmRemove}
        onClose={() => setConfirmRemove(false)}
        onConfirm={handleRemove}
        loading={removing}
        title="Remove Member"
        message={`Remove ${member.user.name} from this team?`}
      />
    </div>
  );
};

const TeamsPage = () => {
  const dispatch = useDispatch();
  const { list: teams, current: team, loading, error } = useSelector((s) => s.teams);
  const { user } = useSelector((s) => s.auth);

  const [selectedTeamId, setSelectedTeamId] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [showInvite, setShowInvite] = useState(false);
  const [createForm, setCreateForm] = useState({ name: '', description: '' });
  const [inviteForm, setInviteForm] = useState({ email: '', role: 'member' });
  const [creating, setCreating] = useState(false);
  const [inviting, setInviting] = useState(false);

  useEffect(() => { dispatch(fetchMyTeams()); }, [dispatch]);

  useEffect(() => {
    if (teams.length > 0 && !selectedTeamId) setSelectedTeamId(teams[0]._id);
  }, [teams]);

  useEffect(() => {
    if (selectedTeamId) dispatch(fetchTeamById(selectedTeamId));
  }, [selectedTeamId, dispatch]);

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    setCreating(true);
    const res = await dispatch(createTeam(createForm));
    setCreating(false);
    if (!res.error) {
      toast.success('Team created!');
      setShowCreate(false);
      setCreateForm({ name: '', description: '' });
      setSelectedTeamId(res.payload.data.team._id);
    }
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    setInviting(true);
    const res = await dispatch(inviteMember({ teamId: selectedTeamId, ...inviteForm }));
    setInviting(false);
    if (!res.error) {
      toast.success('Invitation sent!');
      setShowInvite(false);
      setInviteForm({ email: '', role: 'member' });
    }
  };

  const isOwner = team?.members?.find((m) => m.user._id === user?._id)?.role === 'owner';

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Teams</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{teams.length} teams</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="btn-primary">
          <FiPlus size={16} /> New Team
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Team list */}
        <div className="lg:col-span-1 space-y-2">
          {loading && teams.length === 0 ? (
            <div className="flex justify-center py-8"><Spinner /></div>
          ) : teams.length === 0 ? (
            <div className="card p-6 text-center">
              <FiUsers size={32} className="text-gray-300 dark:text-gray-600 mx-auto mb-2" />
              <p className="text-sm text-gray-500 dark:text-gray-400">No teams yet</p>
            </div>
          ) : (
            teams.map((t) => (
              <button
                key={t._id}
                onClick={() => setSelectedTeamId(t._id)}
                className={`w-full text-left p-3 rounded-xl border transition-all ${selectedTeamId === t._id
                  ? 'bg-primary-50 dark:bg-primary-900/20 border-primary-200 dark:border-primary-700'
                  : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-primary-200'}`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-primary-600 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    {t.name[0].toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-sm text-gray-900 dark:text-gray-100 truncate">{t.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{t.members?.length || 0} members</p>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>

        {/* Team detail */}
        <div className="lg:col-span-3">
          {!team ? (
            <div className="card p-12 text-center">
              <FiUsers size={40} className="text-gray-300 dark:text-gray-600 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400">Select a team to view details</p>
            </div>
          ) : (
            <div className="card">
              {/* Team header */}
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary-600 rounded-2xl flex items-center justify-center text-white font-bold text-lg">
                      {team.name[0].toUpperCase()}
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">{team.name}</h2>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{team.description || 'No description'}</p>
                    </div>
                  </div>
                  {isOwner && (
                    <button onClick={() => setShowInvite(true)} className="btn-primary">
                      <FiMail size={15} /> Invite Member
                    </button>
                  )}
                </div>
              </div>

              {/* Members */}
              <div className="p-6">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                  <FiUsers size={15} className="text-primary-600" />
                  Members ({team.members?.length || 0})
                </h3>
                {loading ? (
                  <div className="flex justify-center py-8"><Spinner /></div>
                ) : (
                  <div>
                    {team.members?.map((member) => (
                      <MemberRow
                        key={member.user._id}
                        member={member}
                        teamId={team._id}
                        isOwner={isOwner}
                        currentUserId={user?._id}
                        dispatch={dispatch}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create Team Modal */}
      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Create Team">
        <form onSubmit={handleCreateTeam} className="p-6 space-y-4">
          <div>
            <label className="label">Team Name *</label>
            <input value={createForm.name} onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
              className="input" placeholder="e.g. Engineering" required />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea value={createForm.description} onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
              className="input resize-none" rows={3} placeholder="What does this team work on?" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setShowCreate(false)} className="btn-secondary flex-1 justify-center">Cancel</button>
            <button type="submit" disabled={creating} className="btn-primary flex-1 justify-center">
              {creating ? <Spinner size="sm" /> : 'Create Team'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Invite Modal */}
      <Modal isOpen={showInvite} onClose={() => setShowInvite(false)} title="Invite Member">
        <form onSubmit={handleInvite} className="p-6 space-y-4">
          <div>
            <label className="label">Email Address *</label>
            <div className="relative">
              <FiMail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="email" value={inviteForm.email}
                onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                className="input pl-9" placeholder="colleague@example.com" required />
            </div>
          </div>
          <div>
            <label className="label">Role</label>
            <select value={inviteForm.role} onChange={(e) => setInviteForm({ ...inviteForm, role: e.target.value })} className="input">
              {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setShowInvite(false)} className="btn-secondary flex-1 justify-center">Cancel</button>
            <button type="submit" disabled={inviting} className="btn-primary flex-1 justify-center">
              {inviting ? <Spinner size="sm" /> : 'Send Invite'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default TeamsPage;
