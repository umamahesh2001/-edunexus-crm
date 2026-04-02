import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Settings, Users, ArrowRightLeft, CheckSquare, GraduationCap, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  // Role-based navigation links
  const allLinks = [
    { to: '/app', label: 'Overview', icon: <LayoutDashboard size={20} />, roles: ['Admin', 'Admission Officer', 'Management'] },
    { to: '/app/master', label: 'Master Config', icon: <Settings size={20} />, roles: ['Admin'] },
    { to: '/app/applicants', label: 'Applicants', icon: <Users size={20} />, roles: ['Admin', 'Admission Officer'] },
    { to: '/app/allocation', label: 'Allocation', icon: <ArrowRightLeft size={20} />, roles: ['Admin', 'Admission Officer'] },
    { to: '/app/admission', label: 'Confirmation', icon: <CheckSquare size={20} />, roles: ['Admin', 'Admission Officer'] },
  ];

  const links = allLinks.filter(link => link.roles.includes(user?.role));

  // Role badge colors
  const roleBadge = {
    'Admin': { bg: 'bg-indigo-800', text: 'text-indigo-100', dot: 'bg-indigo-400' },
    'Admission Officer': { bg: 'bg-emerald-800', text: 'text-emerald-100', dot: 'bg-emerald-400' },
    'Management': { bg: 'bg-amber-800', text: 'text-amber-100', dot: 'bg-amber-400' }
  };

  const badge = roleBadge[user?.role] || roleBadge['Admin'];
  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';

  return (
    <aside className="w-64 bg-slate-950 text-slate-300 flex flex-col h-full shadow-2xl shrink-0 transition-all border-r border-rose-900/30">
      <div className="p-6 h-20 flex items-center border-b border-slate-800 bg-slate-900/80 backdrop-blur-md">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-900 flex items-center justify-center mr-3 shadow-lg shadow-indigo-900/40 border border-indigo-500/30">
          <GraduationCap className="text-white" size={20} />
        </div>
        <div className="flex flex-col">
          <h2 className="text-xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-100 to-violet-400 leading-none">
            EduNexus
          </h2>
          <span className="text-[9px] font-black text-indigo-400 uppercase tracking-[0.2em] mt-0.5 ml-0.5">Admissions CRM</span>
        </div>
      </div>

      <nav className="flex-1 px-3 py-6 space-y-1.5 overflow-y-auto">
        <p className="px-4 text-[10px] font-bold text-rose-500/70 uppercase tracking-widest mb-4">Core Management</p>
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === '/app'}
            className={({ isActive }) =>
              `group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-300 relative overflow-hidden ${
                isActive
                  ? 'bg-blue-900/40 text-blue-300 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)] border border-blue-800/50'
                  : 'hover:bg-slate-800/60 hover:text-slate-100 border border-transparent'
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-blue-500 rounded-r-full shadow-[0_0_12px_rgba(59,130,246,0.6)]"></div>
                )}
                <span className={`mr-3 transition-colors duration-300 ${isActive ? 'text-blue-400' : 'text-slate-500 group-hover:text-rose-400'}`}>
                  {link.icon}
                </span>
                {link.label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-800 bg-slate-900/50 space-y-3">
        <div className="flex items-center px-4 py-3 rounded-xl bg-slate-800/80 border border-slate-700/50 backdrop-blur-sm">
          <div className={`w-8 h-8 rounded-full ${badge.bg} flex items-center justify-center text-xs font-bold ${badge.text} shadow-md`}>
            {initials}
          </div>
          <div className="ml-3 min-w-0 flex-1">
            <p className="text-sm font-bold text-slate-200 truncate">{user?.name || 'User'}</p>
            <div className="flex items-center mt-0.5">
              <span className={`w-1.5 h-1.5 rounded-full ${badge.dot} mr-1.5`}></span>
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide truncate">{user?.role}</p>
            </div>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center px-4 py-2.5 rounded-xl bg-slate-800/50 hover:bg-red-900/30 border border-slate-700/50 hover:border-red-800/50 text-slate-400 hover:text-red-400 text-sm font-semibold transition-all duration-200"
        >
          <LogOut size={16} className="mr-2" />
          Sign Out
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
