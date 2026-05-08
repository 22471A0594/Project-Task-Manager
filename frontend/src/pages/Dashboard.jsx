import { useState, useEffect } from 'react';
import { dashboardService } from '../services';
import { useAuth } from '../context/AuthContext';
import { FolderKanban, CheckSquare, Clock, AlertTriangle, TrendingUp, ListTodo } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

const COLORS = ['#6366f1', '#f59e0b', '#10b981'];

function StatCard({ icon: Icon, label, value, color, delay }) {
  return (
    <div className="glass-card p-6 animate-slide-up" style={{ animationDelay: `${delay}ms` }}>
      <div className="flex items-center justify-between mb-4">
        <div className={`w-11 h-11 rounded-xl bg-${color}/10 flex items-center justify-center`}>
          <Icon className={`w-5 h-5 text-${color}`} />
        </div>
        <TrendingUp className="w-4 h-4 text-dark-500" />
      </div>
      <p className="text-3xl font-bold text-dark-50">{value}</p>
      <p className="text-sm text-dark-400 mt-1">{label}</p>
    </div>
  );
}

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-dark-800 border border-dark-700 rounded-xl px-4 py-2 shadow-xl">
        <p className="text-sm text-dark-200">{`${payload[0].name}: ${payload[0].value}`}</p>
      </div>
    );
  }
  return null;
};

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const res = await dashboardService.getStats();
      setStats(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="skeleton h-36 rounded-2xl" />
          ))}
        </div>
        <div className="grid lg:grid-cols-2 gap-5">
          <div className="skeleton h-80 rounded-2xl" />
          <div className="skeleton h-80 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!stats) return null;

  const statCards = [
    { icon: FolderKanban, label: 'Total Projects', value: stats.totalProjects, color: 'primary-500' },
    { icon: CheckSquare, label: 'Total Tasks', value: stats.totalTasks, color: 'accent' },
    { icon: ListTodo, label: 'Completed Tasks', value: stats.completedTasks, color: 'success' },
    { icon: AlertTriangle, label: 'Overdue Tasks', value: stats.overdueTasks, color: 'danger' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-dark-50">Dashboard</h1>
        <p className="text-dark-400 mt-1">Welcome back, {user?.name}. Here's what's happening.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map((s, i) => (
          <StatCard key={i} {...s} delay={i * 100} />
        ))}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-5">
        {/* Pie Chart - Tasks by Status */}
        <div className="glass-card p-6 animate-slide-up" style={{ animationDelay: '400ms' }}>
          <h2 className="text-lg font-semibold text-dark-100 mb-6">Tasks by Status</h2>
          {stats.totalTasks > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={stats.tasksByStatus}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={100}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {stats.tasksByStatus.map((entry, i) => (
                    <Cell key={i} fill={COLORS[i]} stroke="transparent" />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[250px] flex items-center justify-center text-dark-500">No tasks yet</div>
          )}
          <div className="flex justify-center gap-6 mt-4">
            {stats.tasksByStatus.map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                <span className="text-xs text-dark-400">{item.name} ({item.value})</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bar Chart - Project Progress */}
        <div className="glass-card p-6 animate-slide-up" style={{ animationDelay: '500ms' }}>
          <h2 className="text-lg font-semibold text-dark-100 mb-6">Project Progress</h2>
          {stats.projectProgress.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={stats.projectProgress}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={{ stroke: '#334155' }} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={{ stroke: '#334155' }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="completed" name="Completed" fill="#10b981" radius={[6, 6, 0, 0]} />
                <Bar dataKey="total" name="Total" fill="#6366f1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[280px] flex items-center justify-center text-dark-500">No projects yet</div>
          )}
        </div>
      </div>

      {/* Recent Tasks */}
      <div className="glass-card p-6 animate-slide-up" style={{ animationDelay: '600ms' }}>
        <h2 className="text-lg font-semibold text-dark-100 mb-4">Recent Activity</h2>
        {stats.recentTasks.length > 0 ? (
          <div className="space-y-3">
            {stats.recentTasks.map((task) => (
              <div key={task.id} className="flex items-center gap-4 p-3 rounded-xl bg-dark-800/30 hover:bg-dark-800/50 transition-colors">
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                  task.status === 'COMPLETED' ? 'bg-success' :
                  task.status === 'IN_PROGRESS' ? 'bg-warning' : 'bg-primary-500'
                }`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-dark-200 truncate">{task.title}</p>
                  <p className="text-xs text-dark-500">{task.project?.title}</p>
                </div>
                <span className={`badge ${
                  task.status === 'COMPLETED' ? 'bg-success/10 text-success' :
                  task.status === 'IN_PROGRESS' ? 'bg-warning/10 text-warning' : 'bg-primary-500/10 text-primary-400'
                }`}>
                  {task.status.replace('_', ' ')}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-dark-500 text-sm">No recent activity</p>
        )}
      </div>
    </div>
  );
}
