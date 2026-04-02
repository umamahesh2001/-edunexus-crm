import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GraduationCap, Eye, EyeOff, LogIn, Shield, Users, BarChart3 } from 'lucide-react';
import toast from 'react-hot-toast';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return toast.error('Please fill in all fields');

    setLoading(true);
    try {
      const user = await login(email, password);
      toast.success(`Welcome back, ${user.name}!`);
      navigate('/app', { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const quickLogin = async (email, password) => {
    setLoading(true);
    try {
      const user = await login(email, password);
      toast.success(`Welcome, ${user.name}!`);
      navigate('/app', { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.error || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  const roleCards = [
    {
      role: 'Admin',
      email: 'admin@edunexus.com',
      password: 'admin123',
      icon: <Shield size={18} />,
      desc: 'Full system access. Setup masters & quotas.',
      color: 'indigo'
    },
    {
      role: 'Admission Officer',
      email: 'officer@edunexus.com',
      password: 'officer123',
      icon: <Users size={18} />,
      desc: 'Manage applicants, allocate seats, confirm.',
      color: 'emerald'
    },
    {
      role: 'Management',
      email: 'management@edunexus.com',
      password: 'mgmt123',
      icon: <BarChart3 size={18} />,
      desc: 'View-only dashboard access.',
      color: 'amber'
    }
  ];

  const colorMap = {
    indigo: {
      bg: 'bg-indigo-50', border: 'border-indigo-200', hover: 'hover:border-indigo-400 hover:shadow-indigo-100',
      icon: 'bg-indigo-100 text-indigo-600', badge: 'bg-indigo-100 text-indigo-700', btn: 'bg-indigo-600 hover:bg-indigo-700'
    },
    emerald: {
      bg: 'bg-emerald-50', border: 'border-emerald-200', hover: 'hover:border-emerald-400 hover:shadow-emerald-100',
      icon: 'bg-emerald-100 text-emerald-600', badge: 'bg-emerald-100 text-emerald-700', btn: 'bg-emerald-600 hover:bg-emerald-700'
    },
    amber: {
      bg: 'bg-amber-50', border: 'border-amber-200', hover: 'hover:border-amber-400 hover:shadow-amber-100',
      icon: 'bg-amber-100 text-amber-600', badge: 'bg-amber-100 text-amber-700', btn: 'bg-amber-600 hover:bg-amber-700'
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 flex items-center justify-center p-4">
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">

        {/* Left - Login Form */}
        <div className="w-full max-w-md mx-auto lg:mx-0">
          <div className="flex items-center mb-8">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-900 flex items-center justify-center mr-4 shadow-lg shadow-indigo-900/30">
              <GraduationCap className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">EduNexus</h1>
              <p className="text-xs font-bold text-indigo-500 uppercase tracking-widest">Admission CRM</p>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-200/60 p-8">
            <h2 className="text-xl font-bold text-slate-900 mb-1">Sign in to your account</h2>
            <p className="text-sm text-slate-500 mb-8">Enter your credentials to access the system</p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@edunexus.com"
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-slate-50 text-sm transition-all"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full px-4 py-3 pr-12 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-slate-50 text-sm transition-all"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center py-3.5 px-6 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <LogIn size={18} className="mr-2" />
                    Sign In
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Right - Quick Login Cards */}
        <div className="w-full">
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4 text-center lg:text-left">Quick Access (Demo)</h3>
          <div className="space-y-3">
            {roleCards.map((card) => {
              const c = colorMap[card.color];
              return (
                <div
                  key={card.role}
                  className={`${c.bg} border ${c.border} ${c.hover} rounded-2xl p-5 transition-all hover:shadow-lg cursor-pointer group`}
                  onClick={() => quickLogin(card.email, card.password)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start">
                      <div className={`w-10 h-10 rounded-xl ${c.icon} flex items-center justify-center mr-4 shrink-0 group-hover:scale-110 transition-transform`}>
                        {card.icon}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-bold text-slate-900">{card.role}</h4>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${c.badge}`}>{card.email}</span>
                        </div>
                        <p className="text-sm text-slate-600">{card.desc}</p>
                      </div>
                    </div>
                    <div className={`${c.btn} text-white text-xs font-bold px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shrink-0`}>
                      Login
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <p className="text-xs text-slate-400 mt-4 text-center lg:text-left">
            Click any card above to instantly sign in with that role.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
