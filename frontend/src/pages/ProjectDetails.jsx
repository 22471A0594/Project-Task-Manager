import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { projectService, taskService, memberService } from '../services';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Plus, Users, CheckSquare, Clock, Trash2, UserPlus, X, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

const STATUS_COLORS = {
  TODO: 'bg-primary-500/10 text-primary-400',
  IN_PROGRESS: 'bg-warning/10 text-warning',
  COMPLETED: 'bg-success/10 text-success',
};
const PRIORITY_COLORS = {
  LOW: 'bg-dark-600/50 text-dark-300',
  MEDIUM: 'bg-warning/10 text-warning',
  HIGH: 'bg-danger/10 text-danger',
};

export default function ProjectDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin, user } = useAuth();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [allUsers, setAllUsers] = useState([]);
  const [showAddMember, setShowAddMember] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState('');
  const [taskForm, setTaskForm] = useState({ title: '', description: '', priority: 'MEDIUM', dueDate: '', assignedToId: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadProject(); if (isAdmin) loadUsers(); }, [id]);

  const loadProject = async () => {
    try {
      const res = await projectService.getById(id);
      setProject(res.data.data);
    } catch { toast.error('Failed to load project'); navigate('/projects'); }
    finally { setLoading(false); }
  };

  const loadUsers = async () => {
    try { const res = await memberService.getUsers(); setAllUsers(res.data.data); } catch {}
  };

  const handleAddMember = async () => {
    if (!selectedUser) return;
    try {
      await memberService.addMember(id, selectedUser);
      toast.success('Member added');
      setShowAddMember(false);
      setSelectedUser('');
      loadProject();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleRemoveMember = async (userId) => {
    if (!confirm('Remove this member?')) return;
    try { await memberService.removeMember(id, userId); toast.success('Member removed'); loadProject(); }
    catch { toast.error('Failed'); }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!taskForm.title.trim()) return toast.error('Title is required');
    setSaving(true);
    try {
      await taskService.create({ ...taskForm, projectId: id, assignedToId: taskForm.assignedToId || null });
      toast.success('Task created');
      setShowTaskModal(false);
      setTaskForm({ title: '', description: '', priority: 'MEDIUM', dueDate: '', assignedToId: '' });
      loadProject();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const handleUpdateStatus = async (taskId, status) => {
    try { await taskService.update(taskId, { status }); toast.success('Status updated'); loadProject(); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleDeleteTask = async (taskId) => {
    if (!confirm('Delete this task?')) return;
    try { await taskService.delete(taskId); toast.success('Task deleted'); loadProject(); }
    catch { toast.error('Failed'); }
  };

  if (loading) return <div className="space-y-4">{[...Array(3)].map((_, i) => <div key={i} className="skeleton h-32 rounded-2xl" />)}</div>;
  if (!project) return null;

  const isOverdue = (d) => d && new Date(d) < new Date();
  const memberIds = project.members.map((m) => m.userId);
  const availableUsers = allUsers.filter((u) => !memberIds.includes(u.id));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <button onClick={() => navigate('/projects')} className="mt-1 p-2 rounded-xl hover:bg-dark-800 text-dark-400 hover:text-dark-200 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-dark-50">{project.title}</h1>
          <p className="text-dark-400 mt-1">{project.description || 'No description'}</p>
          <div className="flex items-center gap-4 mt-3 text-sm text-dark-400">
            <span className="flex items-center gap-1"><CheckSquare className="w-4 h-4" /> {project.totalTasks} tasks</span>
            <span className="flex items-center gap-1"><Users className="w-4 h-4" /> {project.members.length} members</span>
            <span className="text-primary-400 font-medium">{project.progress}% complete</span>
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="glass-card p-5">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-dark-400">Overall Progress</span>
          <span className="text-dark-200 font-medium">{project.completedTasks}/{project.totalTasks} tasks</span>
        </div>
        <div className="h-3 bg-dark-700 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-primary-500 to-success rounded-full transition-all duration-700" style={{ width: `${project.progress}%` }} />
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Tasks */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-dark-100">Tasks</h2>
            {isAdmin && (
              <button onClick={() => setShowTaskModal(true)} className="btn-primary text-sm flex items-center gap-2">
                <Plus className="w-4 h-4" /> Add Task
              </button>
            )}
          </div>
          {project.tasks.length === 0 ? (
            <div className="glass-card p-8 text-center"><p className="text-dark-500">No tasks yet</p></div>
          ) : (
            <div className="space-y-3">
              {project.tasks.map((task) => (
                <div key={task.id} className="glass-card p-4 hover:border-dark-600 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h3 className="font-medium text-dark-200">{task.title}</h3>
                        <span className={`badge text-[10px] ${PRIORITY_COLORS[task.priority]}`}>{task.priority}</span>
                      </div>
                      {task.description && <p className="text-xs text-dark-500 mb-2 line-clamp-1">{task.description}</p>}
                      <div className="flex items-center gap-3 text-xs text-dark-500">
                        {task.assignedTo && <span>→ {task.assignedTo.name}</span>}
                        {task.dueDate && (
                          <span className={`flex items-center gap-1 ${isOverdue(task.dueDate) && task.status !== 'COMPLETED' ? 'text-danger' : ''}`}>
                            {isOverdue(task.dueDate) && task.status !== 'COMPLETED' && <AlertTriangle className="w-3 h-3" />}
                            <Clock className="w-3 h-3" /> {new Date(task.dueDate).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <select value={task.status} onChange={(e) => handleUpdateStatus(task.id, e.target.value)}
                        disabled={!isAdmin && task.assignedToId !== user?.id}
                        className={`text-xs px-2 py-1 rounded-lg border-0 cursor-pointer ${STATUS_COLORS[task.status]} bg-opacity-100`}>
                        <option value="TODO">To Do</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="COMPLETED">Completed</option>
                      </select>
                      {isAdmin && (
                        <button onClick={() => handleDeleteTask(task.id)} className="p-1.5 rounded-lg hover:bg-danger/10 text-dark-500 hover:text-danger transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Members */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-dark-100">Members</h2>
            {isAdmin && (
              <button onClick={() => setShowAddMember(true)} className="p-2 rounded-xl hover:bg-dark-800 text-dark-400 hover:text-primary-400 transition-colors">
                <UserPlus className="w-4 h-4" />
              </button>
            )}
          </div>
          <div className="glass-card p-4 space-y-3">
            {project.members.map((m) => (
              <div key={m.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-dark-800/30 transition-colors">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-accent flex items-center justify-center text-white font-semibold text-xs">
                  {m.user.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-dark-200 truncate">{m.user.name}</p>
                  <p className="text-xs text-dark-500">{m.user.role}</p>
                </div>
                {isAdmin && m.userId !== user?.id && (
                  <button onClick={() => handleRemoveMember(m.userId)} className="text-dark-500 hover:text-danger transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add Member Modal */}
      {showAddMember && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowAddMember(false)}>
          <div className="glass-card w-full max-w-md p-6 animate-slide-up" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-bold text-dark-100 mb-4">Add Member</h2>
            {availableUsers.length === 0 ? <p className="text-dark-400 text-sm">All users are already members</p> : (
              <>
                <select value={selectedUser} onChange={(e) => setSelectedUser(e.target.value)} className="select-field mb-4">
                  <option value="">Select a user</option>
                  {availableUsers.map((u) => <option key={u.id} value={u.id}>{u.name} ({u.email})</option>)}
                </select>
                <div className="flex justify-end gap-3">
                  <button onClick={() => setShowAddMember(false)} className="btn-secondary text-sm">Cancel</button>
                  <button onClick={handleAddMember} className="btn-primary text-sm">Add</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Create Task Modal */}
      {showTaskModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowTaskModal(false)}>
          <div className="glass-card w-full max-w-lg p-6 animate-slide-up" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-dark-100">Create Task</h2>
              <button onClick={() => setShowTaskModal(false)} className="text-dark-400 hover:text-dark-200"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleCreateTask} className="space-y-4">
              <div><label className="label-text">Title</label><input value={taskForm.title} onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })} className="input-field" placeholder="Task title" /></div>
              <div><label className="label-text">Description</label><textarea value={taskForm.description} onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })} className="input-field min-h-[80px] resize-none" placeholder="Optional" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="label-text">Priority</label>
                  <select value={taskForm.priority} onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })} className="select-field">
                    <option value="LOW">Low</option><option value="MEDIUM">Medium</option><option value="HIGH">High</option>
                  </select>
                </div>
                <div><label className="label-text">Due Date</label><input type="date" value={taskForm.dueDate} onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })} className="input-field" /></div>
              </div>
              <div><label className="label-text">Assign To</label>
                <select value={taskForm.assignedToId} onChange={(e) => setTaskForm({ ...taskForm, assignedToId: e.target.value })} className="select-field">
                  <option value="">Unassigned</option>
                  {project.members.map((m) => <option key={m.userId} value={m.userId}>{m.user.name}</option>)}
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowTaskModal(false)} className="btn-secondary text-sm">Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary text-sm">{saving ? 'Creating...' : 'Create Task'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
