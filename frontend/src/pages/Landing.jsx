import { Link } from 'react-router-dom';
import { Target, Users, ShieldCheck, Zap } from 'lucide-react';

const Landing = () => {
  return (
    <div className="min-h-screen bg-slate-50 relative overflow-x-hidden font-sans scroll-smooth">
      {/* Background Decorator Shapes */}
      {/* Top Left Yellow Blob */}
      <div 
        className="absolute -top-32 -left-32 w-96 h-96 lg:w-[600px] lg:h-[600px] bg-amber-400 rounded-br-[100px] sm:rounded-br-[200px] lg:rounded-br-[300px] -z-10"
      ></div>
      {/* Center Light Blue Shape behind illustration */}
      <div className="absolute top-1/2 left-10 lg:left-32 -translate-y-1/2 w-80 h-[500px] lg:w-[600px] lg:h-[700px] bg-indigo-100 rounded-[100px] -z-10"></div>
      
      {/* Navigation Bar */}
      <header className="max-w-7xl mx-auto px-6 lg:px-12 py-8 flex items-center justify-between z-10 relative">
        <div className="flex items-center">
          <h1 className="text-xl lg:text-2xl font-black tracking-widest text-slate-900 uppercase">EduNexus</h1>
        </div>
        <nav className="flex items-center space-x-8">
          <a href="#about" className="font-bold text-slate-700 hover:text-indigo-600 transition-colors uppercase text-sm tracking-widest hidden sm:block">
            About Us
          </a>
        </nav>
      </header>

      {/* Main Hero Area */}
      <main className="max-w-7xl mx-auto px-6 lg:px-12 mt-12 lg:mt-24 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10 mb-32">
        {/* Left Side: Illustration */}
        <div className="flex justify-center lg:justify-start relative perspective-1000 group">
          {/* Main Image with floating hover effect */}
          <img 
            src="/hero-image.png" 
            alt="EduNexus Team Illustration" 
            className="w-full max-w-lg lg:max-w-2xl drop-shadow-[0_20px_25px_rgba(0,0,0,0.15)] z-10 relative animate-fade-in group-hover:-translate-y-3 transition-transform duration-[800ms] ease-out origin-bottom"
          />
          {/* Mirror Reflection Shadow */}
          <div className="absolute top-[96%] left-0 w-full h-[60%] z-0 select-none pointer-events-none opacity-[0.25] group-hover:opacity-[0.10] group-hover:blur-[6px] transition-all duration-[800ms] ease-out mix-blend-multiply flex justify-center lg:justify-start" 
               style={{ 
                 maskImage: 'linear-gradient(to bottom, black 0%, transparent 60%)', 
                 WebkitMaskImage: 'linear-gradient(to bottom, black 0%, transparent 60%)' 
               }}>
            <img 
              src="/hero-image.png" 
              alt="" 
              className="w-full max-w-lg lg:max-w-2xl scale-y-[-1] grayscale-[40%] blur-[2px] opacity-80 group-hover:scale-y-[-0.95]"
            />
          </div>
        </div>

        {/* Right Side: Typography & CTAs */}
        <div className="flex flex-col items-center lg:items-start text-center lg:text-left pt-10">
          <h2 className="text-5xl sm:text-7xl lg:text-[4.5rem] font-black text-slate-900 leading-tight tracking-tighter mb-6 uppercase">
            Admission <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-500">Excellence</span>
          </h2>
          <p className="text-slate-500 text-lg sm:text-xl font-medium max-w-lg mb-10 leading-relaxed">
            The ultimate admission management CRM engineered to track, allocate, and verify applicants seamlessly. Unify your institution's growth with intelligent telemetry.
          </p>
          <div className="flex flex-wrap justify-center lg:justify-start gap-4">
            <Link 
              to="/app" 
              className="bg-slate-900 text-white font-bold py-4 px-10 rounded-xl hover:bg-slate-800 transition-colors shadow-xl shadow-slate-900/20 uppercase tracking-widest text-sm"
            >
              Enter System
            </Link>
            <a 
              href="#about"
              className="bg-white text-slate-700 border-2 border-slate-200 font-bold py-4 px-10 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-colors uppercase tracking-widest text-sm"
            >
              Learn More
            </a>
          </div>
        </div>
      </main>

      {/* About Us Section */}
      <section id="about" className="bg-white py-24 relative z-20 shadow-[0_-20px_50px_rgba(0,0,0,0.02)]">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          
          <div className="text-center max-w-3xl mx-auto mb-20 animate-fade-in">
            <h3 className="text-indigo-600 font-black tracking-widest uppercase text-sm mb-3">About EduNexus</h3>
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 tracking-tight">Streamlining Institutional Operations</h2>
            <p className="text-slate-500 text-lg leading-relaxed font-medium">
              We started with a simple belief: University administrations shouldn't be bogged down by paperwork, fractured data silos, or chaotic allocation matrices. EduNexus is built specifically for modern registrars and admission boards who demand clarity and velocity.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Feature 1 */}
            <div className="bg-slate-50 border border-slate-100 p-8 rounded-3xl hover:-translate-y-2 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-300 group">
              <div className="w-14 h-14 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                <Target size={28} />
              </div>
              <h4 className="text-xl font-black text-slate-900 mb-3">Precision Allocation</h4>
              <p className="text-slate-500 font-medium leading-relaxed text-sm">Automated seat distribution driven by rigorous category mapping and absolute transparency—eliminating allocation conflicts entirely.</p>
            </div>

            {/* Feature 2 */}
            <div className="bg-slate-50 border border-slate-100 p-8 rounded-3xl hover:-translate-y-2 hover:shadow-2xl hover:shadow-rose-500/10 transition-all duration-300 group">
              <div className="w-14 h-14 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-rose-500 group-hover:text-white transition-all">
                <Users size={28} />
              </div>
              <h4 className="text-xl font-black text-slate-900 mb-3">Applicant Integrity</h4>
              <p className="text-slate-500 font-medium leading-relaxed text-sm">Every registration is pinned to immutable constraints. Single-source-of-truth profiles mean no duplicate entries or missing documents.</p>
            </div>

            {/* Feature 3 */}
            <div className="bg-slate-50 border border-slate-100 p-8 rounded-3xl hover:-translate-y-2 hover:shadow-2xl hover:shadow-emerald-500/10 transition-all duration-300 group">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                <ShieldCheck size={28} />
              </div>
              <h4 className="text-xl font-black text-slate-900 mb-3">Military-grade Security</h4>
              <p className="text-slate-500 font-medium leading-relaxed text-sm">Server-enforced validation, unified RBAC access patterns, and strictly orchestrated endpoints protect institutional data at all times.</p>
            </div>

            {/* Feature 4 */}
            <div className="bg-slate-50 border border-slate-100 p-8 rounded-3xl hover:-translate-y-2 hover:shadow-2xl hover:shadow-amber-500/10 transition-all duration-300 group">
              <div className="w-14 h-14 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-amber-500 group-hover:text-white transition-all">
                <Zap size={28} />
              </div>
              <h4 className="text-xl font-black text-slate-900 mb-3">Real-time Telemetry</h4>
              <p className="text-slate-500 font-medium leading-relaxed text-sm">Make high-value decisions using instant, interactive visual dashboards tracking seat utilization and financial ledger health.</p>
            </div>
          </div>
          
        </div>
      </section>

      {/* Footer Minimal */}
      <footer className="bg-slate-950 py-10 text-center border-t border-slate-900">
        <p className="text-slate-500 text-sm font-bold tracking-widest uppercase">
          © {new Date().getFullYear()} EduNexus CRM. All rights reserved.
        </p>
      </footer>
    </div>
  );
};

export default Landing;
