import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

const Layout = () => {
  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden selection:bg-indigo-500/30">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white/70 backdrop-blur-xl border-b border-slate-200/60 h-20 flex items-center justify-between px-8 sticky top-0 z-20 shadow-sm shadow-slate-200/20">
          <div>
            <h1 className="text-lg font-semibold text-slate-800">Welcome Back 👋</h1>
            <p className="text-sm text-slate-500 mt-0.5">Manage your Institutional Admissions Seamlessly</p>
          </div>
          <div className="flex items-center space-x-4">
            <button className="relative p-2 text-slate-400 hover:text-slate-600 transition-colors bg-white rounded-full border border-slate-200 shadow-sm hover:shadow-md">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 border-2 border-white rounded-full"></span>
            </button>
          </div>
        </header>
        
        <main className="flex-1 overflow-y-auto p-8 relative">
          <div className="absolute top-0 left-0 w-full h-64 bg-slate-50 border-b border-slate-200/50 -z-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-50/40 via-white to-white"></div>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
