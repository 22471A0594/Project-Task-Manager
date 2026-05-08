import { Link } from 'react-router-dom';
import {
  Rocket,
  CheckSquare,
  Users,
  BarChart3,
  Shield,
  ArrowRight,
  Sparkles,
  Zap,
  Globe,
} from 'lucide-react';

const features = [
  {
    icon: CheckSquare,
    title: 'Task Management',
    description: 'Create, assign, and track tasks with priorities, deadlines, and status updates.',
    color: 'from-primary-500 to-primary-600',
  },
  {
    icon: Users,
    title: 'Team Collaboration',
    description: 'Add team members to projects, assign roles, and collaborate seamlessly.',
    color: 'from-accent to-purple-600',
  },
  {
    icon: BarChart3,
    title: 'Analytics Dashboard',
    description: 'Real-time insights with charts showing project progress and team performance.',
    color: 'from-success to-emerald-600',
  },
  {
    icon: Shield,
    title: 'Role-Based Access',
    description: 'Secure access control with Admin and Member roles for complete data safety.',
    color: 'from-warning to-amber-600',
  },
  {
    icon: Zap,
    title: 'Lightning Fast',
    description: 'Built with modern tech stack for blazing fast performance and responsiveness.',
    color: 'from-danger to-rose-600',
  },
  {
    icon: Globe,
    title: 'Deploy Anywhere',
    description: 'Production-ready architecture with Railway deployment support out of the box.',
    color: 'from-cyan-500 to-blue-600',
  },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-dark-950 overflow-hidden">
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-primary-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-accent/10 rounded-full blur-[120px]" />
        <div className="absolute top-[40%] right-[20%] w-[300px] h-[300px] bg-success/5 rounded-full blur-[100px]" />
      </div>

      {/* Navbar */}
      <nav className="relative z-10 border-b border-dark-700/30">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl gradient-bg flex items-center justify-center shadow-lg shadow-primary-600/20">
              <Rocket className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold gradient-text">ProjectPilot</span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="px-5 py-2 text-sm font-medium text-dark-300 hover:text-white transition-colors"
            >
              Sign In
            </Link>
            <Link to="/signup" className="btn-primary text-sm flex items-center gap-2">
              Get Started <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-24 lg:pt-32 lg:pb-36">
        <div className="text-center max-w-4xl mx-auto animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-600/10 border border-primary-500/20 text-primary-400 text-sm font-medium mb-8">
            <Sparkles className="w-4 h-4" />
            Modern Project Management Platform
          </div>
          <h1 className="text-5xl lg:text-7xl font-extrabold leading-tight mb-6">
            Manage Projects
            <br />
            <span className="gradient-text">Like a Pro</span>
          </h1>
          <p className="text-lg lg:text-xl text-dark-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            ProjectPilot brings your team together with powerful task management,
            real-time analytics, and seamless collaboration — all in one beautiful platform.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/signup" className="btn-primary text-base px-8 py-3.5 flex items-center gap-2">
              Start for Free <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="/login"
              className="btn-secondary text-base px-8 py-3.5"
            >
              Sign In to Dashboard
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-20 grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-3xl mx-auto animate-slide-up">
          {[
            { value: '10K+', label: 'Active Users' },
            { value: '50K+', label: 'Tasks Completed' },
            { value: '99.9%', label: 'Uptime' },
            { value: '4.9★', label: 'User Rating' },
          ].map((stat, i) => (
            <div key={i} className="glass-card p-5 text-center">
              <div className="text-2xl font-bold gradient-text">{stat.value}</div>
              <div className="text-sm text-dark-400 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pb-24">
        <div className="text-center mb-14">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            Everything you need to{' '}
            <span className="gradient-text">ship faster</span>
          </h2>
          <p className="text-dark-400 text-lg max-w-2xl mx-auto">
            From task tracking to analytics, ProjectPilot has all the tools your team needs.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((feature, i) => (
            <div
              key={i}
              className="glass-card-hover p-7 group"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div
                className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-5 
                  shadow-lg group-hover:scale-110 transition-transform duration-300`}
              >
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-dark-100 mb-2">{feature.title}</h3>
              <p className="text-dark-400 text-sm leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pb-24">
        <div className="glass-card p-12 lg:p-16 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary-600/10 to-accent/10" />
          <div className="relative z-10">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Ready to transform your workflow?
            </h2>
            <p className="text-dark-400 text-lg mb-8 max-w-xl mx-auto">
              Join thousands of teams already using ProjectPilot to deliver projects on time.
            </p>
            <Link to="/signup" className="btn-primary text-base px-8 py-3.5 inline-flex items-center gap-2">
              Get Started Now <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-dark-700/30 py-8">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Rocket className="w-5 h-5 text-primary-500" />
            <span className="font-semibold gradient-text">ProjectPilot</span>
          </div>
          <p className="text-sm text-dark-500">
            © {new Date().getFullYear()} ProjectPilot. Built with ❤️ for teams everywhere.
          </p>
        </div>
      </footer>
    </div>
  );
}
