import { useState, useEffect } from 'react';
import { taskService, projectService } from '../services';
import { useAuth } from '../context/AuthContext';
import { Search, Filter, CheckSquare, Clock, AlertTriangle, Trash2, X, Edit3 } from 'lucide-react';
import toast from 'react-hot-toast';

const STATUS_COLORS = { TODO: 'bg-primary-500/10 text-primary-400', IN_PROGRESS: 'bg-warning/10 text-warning', COMPLETED: 'bg-success/10 text-success' };
const PRIORITY_COLORS = { LOW: 'bg-dark-600/50 text-dark-300', MEDIUM: 'bg-warning/10 text-warning', HIGH: 'bg-danger/10 text-danger' };
const STATUS_LABELS = { TODO: 'To Do', IN_PROGRESS: 'In Progress', COMPLETED: 'Completed' };

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: '', priority: '', search: '', overdue: '' });
  const [editTask, setEditTask] = useState(null);
  const [editForm, setEditForm] = useState({});
  const { isAdmin, user } = useAuth();

  useEffect(() => { loadTasks(); }, [filters]);

  const loadTasks = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.status) params.status = filters.status;
      if (filters.priority) params.priority = filters.priority;
      if (filters.search) params.search = filters.search;
      if (filters.overdue) params.overdue = filters.overdue;
      const res = await taskService.getAll(params);
      setTasks(res.data.data);
    } catch { toast.error('Failed to load tasks'); }
    finally { setLoading(false); }
  };

  const handleUpdateStatus = async (taskId, status) => {
    try { await taskService.update(taskId, { status }); toast.success('Updated'); loadTasks(); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleDelete = async (taskId) => {
    if (!confirm('Delete this task?')) return;
    try { await taskService.delete(taskId); toast.success('Deleted'); loadTasks(); }
    catch { toast.error('Failed'); }
  };

  const handleEditSave = async (e) => {
    e.preventDefault();
    try {
      await taskService.update(editTask.id, editForm);
      toast.success('Task updated');
      setEditTask(null);
      loadTasks();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const openEdit = (task) => {
    setEditTask(task);
    setEditForm({
      title: task.title,
      description: task.description || '',
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
    });
  };

  const isOverdue = (d, status) => d && new Date(d) < new Date() && status !== 'COMPLETED';
  const clearFilters = () => setFilters({ status: '', priority: '', search: '', overdue: '' });
  const hasFilters = filters.status || filters.priority || filters.search || filters.overdue;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-dark-50">Tasks</h1>
        <p className="text-dark-400 mt-1">Manage and track all tasks</p>
      </div>

      {/* Filters */}
      <div className="glass-card p-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
            <input value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              placeholder="Search tasks..." className="input-field pl-10 py-2 text-sm" />
          </div>
          <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })} className="select-field py-2 text-sm w-auto">
            <option value="">All Status</option>
            <option value="TODO">To Do</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
          </select>
          <select value={filters.priority} onChange={(e) => setFilters({ ...filters, priority: e.target.value })} className="select-field py-2 text-sm w-auto">
            <option value="">All Priority</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
          </select>
          <label className="flex items-center gap-2 text-sm text-dark-400 cursor-pointer">
            <input type="checkbox" checked={filters.overdue === 'true'} onChange={(e) => setFilters({ ...filters, overdue: e.target.checked ? 'true' : '' })}
              className="rounded border-dark-600 bg-dark-800 text-primary-500 focus:ring-primary-500" />
            Overdue Only
          </label>
          {hasFilters && <button onClick={clearFilters} className="text-xs text-primary-400 hover:text-primary-300">Clear</button>}
        </div>
      </div>

      {/* Task List */}
      {loading ? (
        <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="skeleton h-20 rounded-2xl" />)}</div>
      ) : tasks.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <CheckSquare className="w-12 h-12 text-dark-600 mx-auto mb-4" />
          <p className="text-dark-400">{hasFilters ? 'No tasks match your filters' : 'No tasks yet'}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tasks.map((task, i) => (
            <div key={task.id} className="glass-card p-4 hover:border-dark-600 transition-all animate-slide-up" style={{ animationDelay: `${i * 30}ms` }}>
              <div className="flex items-center gap-4">
                <div className={`w-2 h-10 rounded-full flex-shrink-0 ${task.status === 'COMPLETED' ? 'bg-success' : task.status === 'IN_PROGRESS' ? 'bg-warning' : 'bg-primary-500'}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h3 className={`font-medium ${task.status === 'COMPLETED' ? 'text-dark-500 line-through' : 'text-dark-200'}`}>{task.title}</h3>
                    <span className={`badge text-[10px] ${PRIORITY_COLORS[task.priority]}`}>{task.priority}</span>
                    {isOverdue(task.dueDate, task.status) && (
                      <span className="badge text-[10px] bg-danger/10 text-danger flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> OVERDUE
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-dark-500 flex-wrap">
                    {task.project && <span className="text-primary-400/70">{task.project.title}</span>}
                    {task.assignedTo && <span>→ {task.assignedTo.name}</span>}
                    {task.dueDate && (
                      <span className={`flex items-center gap-1 ${isOverdue(task.dueDate, task.status) ? 'text-danger' : ''}`}>
                        <Clock className="w-3 h-3" />{new Date(task.dueDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <select value={task.status} onChange={(e) => handleUpdateStatus(task.id, e.target.value)}
                    disabled={!isAdmin && task.assignedToId !== user?.id}
                    className={`text-xs px-2 py-1 rounded-lg border-0 cursor-pointer ${STATUS_COLORS[task.status]}`}>
                    <option value="TODO">To Do</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="COMPLETED">Completed</option>
                  </select>
                  {isAdmin && (
                    <>
                      <button onClick={() => openEdit(task)} className="p-1.5 rounded-lg hover:bg-dark-700 text-dark-500 hover:text-dark-200 transition-colors"><Edit3 className="w-3.5 h-3.5" /></button>
                      <button onClick={() => handleDelete(task.id)} className="p-1.5 rounded-lg hover:bg-danger/10 text-dark-500 hover:text-danger transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      {editTask && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setEditTask(null)}>
          <div className="glass-card w-full max-w-lg p-6 animate-slide-up" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-dark-100">Edit Task</h2>
              <button onClick={() => setEditTask(null)} className="text-dark-400 hover:text-dark-200"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleEditSave} className="space-y-4">
              <div><label className="label-text">Title</label><input value={editForm.title} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} className="input-field" /></div>
              <div><label className="label-text">Description</label><textarea value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} className="input-field min-h-[80px] resize-none" /></div>
              <div className="grid grid-cols-3 gap-3">
                <div><label className="label-text">Status</label>
                  <select value={editForm.status} onChange={(e) => setEditForm({ ...editForm, status: e.target.value })} className="select-field">
                    <option value="TODO">To Do</option><option value="IN_PROGRESS">In Progress</option><option value="COMPLETED">Completed</option>
                  </select></div>
                <div><label className="label-text">Priority</label>
                  <select value={editForm.priority} onChange={(e) => setEditForm({ ...editForm, priority: e.target.value })} className="select-field">
                    <option value="LOW">Low</option><option value="MEDIUM">Medium</option><option value="HIGH">High</option>
                  </select></div>
                <div><label className="label-text">Due Date</label><input type="date" value={editForm.dueDate} onChange={(e) => setEditForm({ ...editForm, dueDate: e.target.value })} className="input-field" /></div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setEditTask(null)} className="btn-secondary text-sm">Cancel</button>
                <button type="submit" className="btn-primary text-sm">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
