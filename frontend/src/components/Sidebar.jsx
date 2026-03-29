import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Settings, Users, ArrowRightLeft, CheckSquare, GraduationCap } from 'lucide-react';

const Sidebar = () => {
  const links = [
    { to: '/app', label: 'Overview', icon: <LayoutDashboard size={20} /> },
    { to: '/app/master', label: 'Master Config', icon: <Settings size={20} /> },
    { to: '/app/applicants', label: 'Applicants', icon: <Users size={20} /> },
    { to: '/app/allocation', label: 'Allocation', icon: <ArrowRightLeft size={20} /> },
    { to: '/app/admission', label: 'Confirmation', icon: <CheckSquare size={20} /> },
  ];

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
      
      <div className="p-4 border-t border-slate-800 bg-slate-900/50">
        <div className="flex items-center px-4 py-3 rounded-xl bg-slate-800/80 border border-emerald-900/50 backdrop-blur-sm">
          <div className="w-8 h-8 rounded-full bg-emerald-800 flex items-center justify-center text-xs font-bold text-emerald-100 shadow-md">
            AD
          </div>
          <div className="ml-3">
            <p className="text-sm font-bold text-slate-200">Admin User</p>
            <p className="text-[10px] text-emerald-400 font-semibold tracking-wide uppercase">System Active</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
