import { useState, useEffect } from 'react';
import { memberService } from '../services';
import { useAuth } from '../context/AuthContext';
import { Users, Shield, User, Search } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Team() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const { isAdmin } = useAuth();

  useEffect(() => { loadUsers(); }, []);

  const loadUsers = async () => {
    try { const res = await memberService.getUsers(); setUsers(res.data.data); }
    catch { toast.error('Failed to load team'); }
    finally { setLoading(false); }
  };

  const filtered = users.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return (
    <div className="space-y-4">
      <div className="skeleton h-10 w-40 rounded-xl" />
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => <div key={i} className="skeleton h-32 rounded-2xl" />)}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-dark-50">Team</h1>
          <p className="text-dark-400 mt-1">{users.length} team member{users.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search members..."
            className="input-field pl-10 py-2 text-sm w-56" />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <Users className="w-12 h-12 text-dark-600 mx-auto mb-4" />
          <p className="text-dark-400">No members found</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((member, i) => (
            <div key={member.id} className="glass-card-hover p-6 animate-slide-up" style={{ animationDelay: `${i * 50}ms` }}>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-accent flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-primary-600/20">
                  {member.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-dark-100 truncate">{member.name}</h3>
                  <p className="text-sm text-dark-400 truncate">{member.email}</p>
                  <div className="flex items-center gap-1.5 mt-2">
                    {member.role === 'ADMIN' ? (
                      <span className="badge bg-primary-500/10 text-primary-400 flex items-center gap-1">
                        <Shield className="w-3 h-3" /> Admin
                      </span>
                    ) : (
                      <span className="badge bg-dark-600/50 text-dark-300 flex items-center gap-1">
                        <User className="w-3 h-3" /> Member
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-dark-700/50 text-xs text-dark-500">
                Joined {new Date(member.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
