import { useAuth } from '../context/AuthContext';
import { Shield, User, Mail, Calendar, FolderKanban, CheckSquare } from 'lucide-react';

export default function Profile() {
  const { user } = useAuth();

  if (!user) return null;

  const stats = user._count || {};

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-dark-50">Profile</h1>

      {/* Profile Card */}
      <div className="glass-card p-8 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-600/5 to-accent/5" />
        <div className="relative z-10">
          <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary-500 to-accent flex items-center justify-center text-white font-bold text-4xl mx-auto shadow-xl shadow-primary-600/20 mb-5">
            {user.name?.charAt(0)?.toUpperCase()}
          </div>
          <h2 className="text-2xl font-bold text-dark-50">{user.name}</h2>
          <p className="text-dark-400 mt-1">{user.email}</p>
          <div className="mt-3">
            {user.role === 'ADMIN' ? (
              <span className="badge bg-primary-500/10 text-primary-400 px-4 py-1.5 text-sm flex items-center gap-1.5 w-fit mx-auto">
                <Shield className="w-4 h-4" /> Administrator
              </span>
            ) : (
              <span className="badge bg-dark-600/50 text-dark-300 px-4 py-1.5 text-sm flex items-center gap-1.5 w-fit mx-auto">
                <User className="w-4 h-4" /> Team Member
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="glass-card p-6 space-y-4">
        <h3 className="text-lg font-semibold text-dark-100 mb-2">Account Details</h3>
        <div className="flex items-center gap-4 p-3 rounded-xl bg-dark-800/30">
          <Mail className="w-5 h-5 text-primary-400" />
          <div>
            <p className="text-xs text-dark-500">Email</p>
            <p className="text-sm text-dark-200">{user.email}</p>
          </div>
        </div>
        <div className="flex items-center gap-4 p-3 rounded-xl bg-dark-800/30">
          <Calendar className="w-5 h-5 text-primary-400" />
          <div>
            <p className="text-xs text-dark-500">Member Since</p>
            <p className="text-sm text-dark-200">
              {new Date(user.createdAt).toLocaleDateString('en-US', {
                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
              })}
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-3 gap-4">
          <div className="glass-card p-5 text-center">
            <FolderKanban className="w-6 h-6 text-primary-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-dark-50">{stats.createdProjects || 0}</p>
            <p className="text-xs text-dark-400 mt-1">Projects Created</p>
          </div>
          <div className="glass-card p-5 text-center">
            <CheckSquare className="w-6 h-6 text-success mx-auto mb-2" />
            <p className="text-2xl font-bold text-dark-50">{stats.assignedTasks || 0}</p>
            <p className="text-xs text-dark-400 mt-1">Tasks Assigned</p>
          </div>
          <div className="glass-card p-5 text-center">
            <User className="w-6 h-6 text-accent mx-auto mb-2" />
            <p className="text-2xl font-bold text-dark-50">{stats.memberships || 0}</p>
            <p className="text-xs text-dark-400 mt-1">Memberships</p>
          </div>
        </div>
      )}
    </div>
  );
}
