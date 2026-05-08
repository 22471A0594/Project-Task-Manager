import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { projectService } from '../services';
import { useAuth } from '../context/AuthContext';
import { Plus, FolderKanban, Users, CheckSquare, Search, Trash2, Edit3, X } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editProject, setEditProject] = useState(null);
  const [form, setForm] = useState({ title: '', description: '' });
  const [saving, setSaving] = useState(false);
  const { isAdmin } = useAuth();

  useEffect(() => { loadProjects(); }, []);

  const loadProjects = async () => {
    try {
      const res = await projectService.getAll();
      setProjects(res.data.data);
    } catch { toast.error('Failed to load projects'); }
    finally { setLoading(false); }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return toast.error('Title is required');
    setSaving(true);
    try {
      if (editProject) {
        await projectService.update(editProject.id, form);
        toast.success('Project updated');
      } else {
        await projectService.create(form);
        toast.success('Project created');
      }
      setShowModal(false);
      setEditProject(null);
      setForm({ title: '', description: '' });
      loadProjects();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this project and all its tasks?')) return;
    try {
      await projectService.delete(id);
      toast.success('Project deleted');
      loadProjects();
    } catch { toast.error('Failed to delete'); }
  };

  const openEdit = (p) => {
    setEditProject(p);
    setForm({ title: p.title, description: p.description || '' });
    setShowModal(true);
  };

  const filtered = projects.filter((p) =>
    p.title.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="skeleton h-10 w-48 rounded-xl" />
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(6)].map((_, i) => <div key={i} className="skeleton h-52 rounded-2xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-dark-50">Projects</h1>
          <p className="text-dark-400 mt-1">{projects.length} project{projects.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search projects..."
              className="input-field pl-10 py-2 text-sm w-56" />
          </div>
          {isAdmin && (
            <button onClick={() => { setEditProject(null); setForm({ title: '', description: '' }); setShowModal(true); }}
              className="btn-primary flex items-center gap-2 text-sm">
              <Plus className="w-4 h-4" /> New Project
            </button>
          )}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <FolderKanban className="w-12 h-12 text-dark-600 mx-auto mb-4" />
          <p className="text-dark-400">No projects found</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((project, i) => (
            <div key={project.id} className="glass-card-hover p-6 flex flex-col animate-slide-up" style={{ animationDelay: `${i * 50}ms` }}>
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-primary-600/15 flex items-center justify-center">
                  <FolderKanban className="w-5 h-5 text-primary-400" />
                </div>
                {isAdmin && (
                  <div className="flex items-center gap-1">
                    <button onClick={() => openEdit(project)} className="p-1.5 rounded-lg hover:bg-dark-700 text-dark-400 hover:text-dark-200 transition-colors">
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => handleDelete(project.id)} className="p-1.5 rounded-lg hover:bg-danger/10 text-dark-400 hover:text-danger transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
              <Link to={`/projects/${project.id}`} className="flex-1">
                <h3 className="text-lg font-semibold text-dark-100 hover:text-primary-400 transition-colors mb-2">{project.title}</h3>
                <p className="text-sm text-dark-400 line-clamp-2 mb-4">{project.description || 'No description'}</p>
              </Link>
              {/* Progress bar */}
              <div className="mb-4">
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-dark-400">Progress</span>
                  <span className="text-dark-300 font-medium">{project.progress}%</span>
                </div>
                <div className="h-2 bg-dark-700 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-primary-500 to-accent rounded-full transition-all duration-500"
                    style={{ width: `${project.progress}%` }} />
                </div>
              </div>
              <div className="flex items-center gap-4 text-xs text-dark-400 pt-3 border-t border-dark-700/50">
                <span className="flex items-center gap-1"><CheckSquare className="w-3.5 h-3.5" /> {project._count?.tasks || 0} tasks</span>
                <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {project._count?.members || 0} members</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div className="glass-card w-full max-w-lg p-6 animate-slide-up" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-dark-100">{editProject ? 'Edit Project' : 'Create Project'}</h2>
              <button onClick={() => setShowModal(false)} className="text-dark-400 hover:text-dark-200"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="label-text">Title</label>
                <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="input-field" placeholder="Project name" />
              </div>
              <div>
                <label className="label-text">Description</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="input-field min-h-[100px] resize-none" placeholder="Optional description" />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary text-sm">Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary text-sm">
                  {saving ? 'Saving...' : editProject ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
