import { useQuery } from '@tanstack/react-query';
import api from '../api/axios';
import {
  BarChart, Bar, PieChart, Pie, Cell, RadialBarChart, RadialBar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import {
  Users, BookOpen, CheckCircle, AlertTriangle, TrendingUp,
  Award, FileText, CreditCard, Activity, Layers
} from 'lucide-react';

// ─── Color Palette (Premium) ──────────────────────────────────
const COLORS = {
  primary: '#6366f1',    // Indigo 500
  secondary: '#8b5cf6',  // Violet 500
  accent: '#06b6d4',     // Cyan 500
  success: '#10b981',    // Emerald 500
  warning: '#f59e0b',    // Amber 500
  danger: '#f43f5e',     // Rose 500
  neutral: '#475569',    // Slate 600
  surface: '#ffffff',
};
const PIE_COLORS = [COLORS.primary, COLORS.accent, COLORS.secondary, COLORS.success, COLORS.warning];

// ─── Custom Tooltip ───────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-900/95 backdrop-blur-md border border-slate-700/50 rounded-xl px-4 py-3 shadow-2xl">
      {label && <p className="text-slate-400 text-xs font-semibold mb-2 uppercase tracking-wider">{label}</p>}
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center gap-2 text-sm font-bold" style={{ color: entry.color || entry.fill }}>
          <span className="w-2 h-2 rounded-full" style={{ background: entry.color || entry.fill, boxShadow: `0 0 8px ${entry.color || entry.fill}` }}></span>
          <span className="text-slate-300">{entry.name}:</span>
          <span className="text-white">{entry.value}</span>
        </div>
      ))}
    </div>
  );
};

// ─── KPI Card ──────────────────────────────────────────────────
const KpiCard = ({ title, value, subtitle, icon, color, gradientFrom, gradientTo, trend }) => (
  <div className="bg-white rounded-3xl border border-slate-200/60 p-6 hover:shadow-2xl hover:shadow-slate-200/50 hover:-translate-y-1 transition-all duration-500 relative overflow-hidden group">
    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br opacity-5 blur-2xl rounded-full translate-x-10 -translate-y-10 transition-transform duration-700 group-hover:scale-150" style={{ backgroundImage: `linear-gradient(to bottom right, ${gradientFrom}, ${gradientTo})` }}></div>
    
    <div className="flex items-start justify-between relative z-10">
      <div>
        <p className="text-[11px] font-extrabold uppercase tracking-widest text-slate-500 mb-1">{title}</p>
        <p className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r" style={{ backgroundImage: `linear-gradient(to right, ${gradientFrom}, ${gradientTo})` }}>{value ?? '—'}</p>
        {subtitle && <p className="text-xs font-bold text-slate-400 mt-2 flex items-center gap-1.5"><Activity size={12} style={{color}} /> {subtitle}</p>}
      </div>
      <div className="p-3.5 rounded-2xl shrink-0 shadow-inner border border-white/50" style={{ background: `linear-gradient(135deg, ${gradientFrom}15, ${gradientTo}25)` }}>
        <div style={{ color }}>{icon}</div>
      </div>
    </div>
    
    {trend !== undefined && (
      <div className="mt-5 h-1.5 bg-slate-100 rounded-full overflow-hidden relative z-10">
        <div className="h-full rounded-full transition-all duration-1000 ease-out" style={{ width: `${Math.min(trend, 100)}%`, backgroundImage: `linear-gradient(to right, ${gradientFrom}, ${gradientTo})` }}></div>
      </div>
    )}
  </div>
);

// ─── Section Header ────────────────────────────────────────────
const SectionHeader = ({ title, subtitle, icon, color = COLORS.primary, gradientFrom = COLORS.primary, gradientTo = COLORS.secondary }) => (
  <div className="flex items-center gap-3 mb-6 relative z-10">
    <div className="p-2.5 rounded-xl shadow-inner border border-white/50" style={{ background: `linear-gradient(135deg, ${gradientFrom}15, ${gradientTo}20)`, color }}>{icon}</div>
    <div>
      <h3 className="font-black text-slate-800 text-lg tracking-tight">{title}</h3>
      {subtitle && <p className="text-[11px] font-bold text-slate-400 mt-0.5 uppercase tracking-wide">{subtitle}</p>}
    </div>
  </div>
);

// ─── Main Dashboard ────────────────────────────────────────────
const Dashboard = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: async () => (await api.get('/dashboard')).data
  });

  if (isLoading) return (
    <div className="space-y-8 animate-fade-in pb-16 max-w-screen-2xl mx-auto">
      <div className="flex justify-between items-center border-b border-slate-200/60 pb-6">
        <div className="space-y-3 relative w-1/3">
          <div className="h-8 w-64 bg-slate-200/60 rounded-xl animate-pulse"></div>
          <div className="h-4 w-48 bg-slate-100/60 rounded-md animate-pulse"></div>
        </div>
        <div className="h-10 w-32 bg-indigo-50 rounded-full animate-pulse"></div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="bg-white rounded-3xl border border-slate-100 p-6 h-40 relative overflow-hidden flex flex-col justify-between">
            <div className="flex justify-between items-start">
               <div className="space-y-3 w-1/2">
                 <div className="h-3 w-20 bg-slate-100 rounded animate-pulse"></div>
                 <div className="h-10 w-24 bg-slate-200 rounded-xl animate-pulse"></div>
               </div>
               <div className="w-14 h-14 rounded-2xl bg-slate-50 animate-pulse"></div>
            </div>
            <div className="h-1.5 w-full bg-slate-50 rounded mt-4 animate-pulse"></div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-4xl border border-slate-100 p-8 h-[360px] animate-pulse">
           <div className="h-6 w-48 bg-slate-200 rounded-lg mb-8"></div>
           <div className="h-56 w-full bg-slate-50 rounded-2xl"></div>
        </div>
        <div className="bg-white rounded-4xl border border-slate-100 p-8 h-[360px] flex flex-col items-center justify-center animate-pulse">
           <div className="w-48 h-48 rounded-full border-[12px] border-slate-50"></div>
        </div>
      </div>
    </div>
  );

  // Safe data transformations
  const docStatusData = (stats?.documentStatusBreakdown || []).map(d => ({
    name: d._id, value: d.count,
    fill: d._id === 'Verified' ? COLORS.success : d._id === 'Submitted' ? COLORS.warning : COLORS.danger
  }));

  const categoryData = (stats?.categoryBreakdown || []).map(d => ({ name: d._id, count: d.count }));

  const quotaChartData = (stats?.quotaStats || []).map(q => ({
    name: q._id,
    Filled: q.filledSeats,
    Available: Math.max(0, q.totalSeats - q.filledSeats),
    total: q.totalSeats
  }));

  const programFillData = (stats?.programFillStats || []).map(p => ({
    name: p._id.length > 20 ? p._id.substring(0, 18) + '…' : p._id,
    fullName: p._id,
    Filled: p.filledSeats,
    Available: Math.max(0, p.totalSeats - p.filledSeats),
  }));

  const feeStatusData = (stats?.feeStatusBreakdown || []).map(d => ({
    name: d._id, value: d.count,
    fill: d._id === 'Paid' ? COLORS.success : COLORS.danger
  }));

  const entryData = (stats?.entryTypeBreakdown || []).map(d => ({ name: d._id, value: d.count }));
  const quotaTypePie = (stats?.quotaTypeBreakdown || []).map(d => ({ name: d._id, value: d.count }));

  const totalApplicants = stats?.totalApplicants || 0;
  const admitted = stats?.totalAdmitted || 0;
  const allocated = stats?.totalAllocated || 0;
  const intake = stats?.totalIntake || 0;
  const utilization = intake > 0 ? Math.round(((admitted + allocated) / intake) * 100) : 0;

  // Radial gauge data
  const radialColor = utilization >= 90 ? COLORS.danger : utilization >= 60 ? COLORS.warning : COLORS.primary;
  const radialData = [{ name: 'Utilization', value: utilization, fill: radialColor }];

  return (
    <div className="space-y-8 animate-fade-in pb-16 max-w-screen-2xl mx-auto">
      {/* ── PAGE HEADER ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200/70 pb-6 relative">
        <div className="absolute top-0 right-1/4 w-96 h-32 bg-indigo-400/10 blur-[100px] rounded-full -z-10"></div>
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight">Analytics Overview</h2>
          <p className="text-slate-500 mt-1.5 font-bold tracking-wide">Real-time telemetry across admissions \& allocations</p>
        </div>
        <div className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 rounded-2xl text-sm font-bold text-white shadow-lg shadow-indigo-500/25 cursor-default hover:shadow-indigo-500/40 transition-shadow">
          <Activity size={16} className="text-white animate-pulse" />
          Live Telemetry
        </div>
      </div>

      {/* ── KPI CARDS ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        <KpiCard
          title="Total Program Intake" value={intake}
          subtitle="System Capacity"
          icon={<BookOpen size={24} />} 
          color={COLORS.primary} gradientFrom="#6366f1" gradientTo="#8b5cf6" 
          trend={100}
        />
        <KpiCard
          title="Total Applicants" value={totalApplicants}
          subtitle={`Ratio: ${intake > 0 ? (totalApplicants/intake).toFixed(1) : 0}x`}
          icon={<Users size={24} />} 
          color={COLORS.accent} gradientFrom="#06b6d4" gradientTo="#3b82f6"
          trend={intake > 0 ? Math.min((totalApplicants / intake) * 100, 100) : 0}
        />
        <KpiCard
          title="Confirmed Admissions" value={admitted}
          subtitle={`+${allocated} pending payment`}
          icon={<CheckCircle size={24} />} 
          color={COLORS.success} gradientFrom="#10b981" gradientTo="#2dd4bf"
          trend={intake > 0 ? Math.min((admitted / intake) * 100, 100) : 0}
        />
        <KpiCard
          title="Available Seats" value={stats?.remainingSeats ?? 0}
          subtitle={`${utilization}% slots filled`}
          icon={<AlertTriangle size={24} />} 
          color={radialColor} gradientFrom="#f43f5e" gradientTo="#f59e0b"
          trend={100 - utilization}
        />
      </div>

      {/* ── ROW 2: BAR + RADIAL ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quota fill bar chart */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200/60 p-8 shadow-[0_8px_30px_rgb(0,0,0,0.02)] relative overflow-hidden">
          <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-cyan-400/5 rounded-full blur-3xl point-events-none"></div>
          <SectionHeader title="Seat Distribution Pipeline" subtitle="Filled vs. Available seats modeled by quota" icon={<Layers size={20} />} color={COLORS.accent} gradientFrom="#0ea5e9" gradientTo="#3b82f6" />
          {quotaChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={quotaChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorFilled" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={1}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.9}/>
                  </linearGradient>
                  <linearGradient id="colorAvailable" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#e2e8f0" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#f1f5f9" stopOpacity={0.5}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fontWeight: 800, fill: '#64748b' }} axisLine={false} tickLine={false} dy={10} />
                <YAxis tick={{ fontSize: 11, fontWeight: 600, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{fill: '#f8fafc'}} />
                <Legend wrapperStyle={{ fontSize: 12, fontWeight: 800, paddingTop: '10px' }} iconType="circle" />
                <Bar dataKey="Filled" fill="url(#colorFilled)" radius={[6, 6, 0, 0]} maxBarSize={60} />
                <Bar dataKey="Available" fill="url(#colorAvailable)" radius={[6, 6, 0, 0]} maxBarSize={60} />
              </BarChart>
            </ResponsiveContainer>
          ) : <div className="h-[260px] flex items-center justify-center text-slate-300 font-bold border-2 border-dashed border-slate-100 rounded-2xl">Awaiting quota telemetry</div>}
        </div>

        {/* Seat Utilization Radial */}
        <div className="bg-white rounded-3xl border border-slate-200/60 p-8 shadow-[0_8px_30px_rgb(0,0,0,0.02)] flex flex-col items-center justify-center relative overflow-hidden">
          <SectionHeader title="Network Saturation" subtitle="Global utilization rate" icon={<TrendingUp size={20} />} color={radialColor} gradientFrom={radialColor} gradientTo={COLORS.neutral} />
          <ResponsiveContainer width="100%" height={200}>
            <RadialBarChart innerRadius="70%" outerRadius="100%" data={radialData} startAngle={225} endAngle={-45}>
              <RadialBar background={{ fill: '#f1f5f9' }} dataKey="value" cornerRadius={20} />
              <Tooltip content={<CustomTooltip />} />
            </RadialBarChart>
          </ResponsiveContainer>
          <div className="absolute inset-x-0 bottom-16 flex flex-col items-center z-10">
            <p className="text-6xl font-black tracking-tighter" style={{ color: radialColor }}>{utilization}%</p>
            <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mt-1 bg-white px-3 py-1 rounded-full shadow-sm border border-slate-100">{admitted + allocated} / {intake} Consumed</p>
          </div>
        </div>
      </div>

      {/* ── ROW 3: PROGRAM FILL + DOCUMENT PIE ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Program-wise horizontal bar */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200/60 p-8 shadow-[0_8px_30px_rgb(0,0,0,0.02)] relative">
          <div className="absolute -left-20 -top-20 w-64 h-64 bg-fuchsia-400/5 rounded-full blur-3xl point-events-none"></div>
          <SectionHeader title="Top Active Programs" subtitle="Ranked by volume of filled seats" icon={<Award size={20} />} color={COLORS.secondary} gradientFrom="#c084fc" gradientTo="#9333ea" />
          {programFillData.length > 0 ? (
            <ResponsiveContainer width="100%" height={320}>
              <BarChart layout="vertical" data={programFillData} margin={{ top: 0, right: 10, left: 20, bottom: 0 }}>
                <defs>
                   <linearGradient id="colorProgFilled" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="5%" stopColor="#c084fc" stopOpacity={1}/>
                    <stop offset="95%" stopColor="#9333ea" stopOpacity={0.9}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={true} vertical={false} />
                <XAxis type="number" tick={{ fontSize: 11, fontWeight: 600, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis dataKey="name" type="category" width={140} tick={{ fontSize: 11, fontWeight: 700, fill: '#475569' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{fill: '#f8fafc'}} />
                <Legend wrapperStyle={{ fontSize: 12, fontWeight: 800 }} iconType="circle" />
                <Bar dataKey="Filled" fill="url(#colorProgFilled)" radius={[0, 6, 6, 0]} maxBarSize={20} />
                <Bar dataKey="Available" fill="#f1f5f9" radius={[0, 6, 6, 0]} maxBarSize={20} />
              </BarChart>
            </ResponsiveContainer>
          ) : <div className="h-[320px] flex items-center justify-center text-slate-300 font-bold border-2 border-dashed border-slate-100 rounded-2xl">Awaiting program telemetry</div>}
        </div>

        {/* Document Status */}
        <div className="bg-white rounded-3xl border border-slate-200/60 p-8 shadow-[0_8px_30px_rgb(0,0,0,0.02)] flex flex-col">
          <SectionHeader title="Document Identity" subtitle="Verification checkpoint status" icon={<FileText size={20} />} color={COLORS.success} gradientFrom="#34d399" gradientTo="#059669" />
          {docStatusData.length > 0 ? (
            <div className="flex-1 flex flex-col justify-center">
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <defs>
                    {docStatusData.map((d, i) => (
                      <linearGradient key={`grad-${i}`} id={`pieGrad-${i}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={d.fill} stopOpacity={1}/>
                        <stop offset="100%" stopColor={d.fill} stopOpacity={0.7}/>
                      </linearGradient>
                    ))}
                  </defs>
                  <Pie data={docStatusData} cx="50%" cy="50%" innerRadius={65} outerRadius={95} paddingAngle={5} dataKey="value" stroke="none">
                    {docStatusData.map((entry, i) => <Cell key={i} fill={`url(#pieGrad-${i})`} style={{ filter: `drop-shadow(0px 4px 6px ${entry.fill}40)` }} />)}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-3 mt-4">
                {docStatusData.map((d, i) => (
                  <div key={i} className="flex items-center justify-between text-sm font-black p-3 rounded-xl bg-slate-50/50 border border-slate-100">
                    <div className="flex items-center gap-3">
                      <span className="w-3 h-3 rounded-full shadow-inner" style={{ background: d.fill }}></span>
                      <span className="text-slate-700">{d.name}</span>
                    </div>
                    <span className="text-slate-900 bg-white px-3 py-1 rounded-lg border border-slate-200/60 shadow-sm">{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : <div className="h-[320px] flex items-center justify-center text-slate-300 font-bold border-2 border-dashed border-slate-100 rounded-2xl">Awaiting documents</div>}
        </div>
      </div>

      {/* ── ROW 4: MINI METRICS CARDS ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Category */}
        <div className="bg-white rounded-3xl border border-slate-200/60 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
          <SectionHeader title="Category Schema" subtitle="Reservation matrices" icon={<Users size={16} />} color={COLORS.primary} gradientFrom="#818cf8" gradientTo="#4f46e5" />
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={categoryData} margin={{ top: 10, right: 0, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f8fafc" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 10, fontWeight: 800, fill: '#64748b' }} axisLine={false} tickLine={false} dy={5} />
                <YAxis tick={{ fontSize: 10, fontWeight: 600, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{fill: '#f1f5f9'}} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={30}>
                  {categoryData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : <div className="h-[160px] flex items-center justify-center text-slate-300 text-xs font-bold uppercase">No data</div>}
        </div>

        {/* Quota Type */}
        <div className="bg-white rounded-3xl border border-slate-200/60 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
          <SectionHeader title="Intent Vectors" subtitle="Applicants quota choices" icon={<Layers size={16} />} color={COLORS.warning} gradientFrom="#fbbf24" gradientTo="#d97706" />
          {quotaTypePie.length > 0 ? (
            <div className="flex flex-col h-[160px]">
              <ResponsiveContainer width="100%" height="60%">
                <PieChart>
                  <Pie data={quotaTypePie} cx="50%" cy="50%" innerRadius={35} outerRadius={50} dataKey="value" paddingAngle={4} stroke="none">
                    {quotaTypePie.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-auto">
                {quotaTypePie.slice(0, 3).map((d, i) => (
                  <div key={i} className="flex items-center justify-between text-xs font-bold">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }}></span>
                      <span className="text-slate-600 truncate max-w-[100px]">{d.name}</span>
                    </div>
                    <span className="text-slate-900 bg-slate-50 px-2 rounded-md">{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : <div className="h-[160px] flex items-center justify-center text-slate-300 text-xs font-bold uppercase">No data</div>}
        </div>

        {/* Entry Type */}
        <div className="bg-white rounded-3xl border border-slate-200/60 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
          <SectionHeader title="Access Routes" subtitle="Regular vs Lateral volume" icon={<TrendingUp size={16} />} color={COLORS.accent} gradientFrom="#38bdf8" gradientTo="#0284c7" />
          {entryData.length > 0 ? (
            <div className="flex flex-col h-[160px]">
              <ResponsiveContainer width="100%" height="60%">
                <PieChart>
                  <Pie data={entryData} cx="50%" cy="50%" innerRadius={35} outerRadius={50} dataKey="value" paddingAngle={4} stroke="none">
                    {entryData.map((_, i) => <Cell key={i} fill={[COLORS.accent, COLORS.secondary][i]} />)}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-auto">
                {entryData.map((d, i) => (
                  <div key={i} className="flex items-center justify-between text-xs font-bold">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ background: [COLORS.accent, COLORS.secondary][i] }}></span>
                      <span className="text-slate-600">{d.name}</span>
                    </div>
                    <span className="text-slate-900 bg-slate-50 px-2 rounded-md">{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : <div className="h-[160px] flex items-center justify-center text-slate-300 text-xs font-bold uppercase">No data</div>}
        </div>

        {/* Fee Status */}
        <div className="bg-white rounded-3xl border border-slate-200/60 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
           <SectionHeader title="Ledger State" subtitle="Financial fulfillment status" icon={<CreditCard size={16} />} color={COLORS.danger} gradientFrom="#fb7185" gradientTo="#e11d48" />
           {feeStatusData.length > 0 ? (
            <div className="flex flex-col h-[160px]">
              <ResponsiveContainer width="100%" height="60%">
                <PieChart>
                  <Pie data={feeStatusData} cx="50%" cy="50%" innerRadius={35} outerRadius={50} dataKey="value" paddingAngle={4} stroke="none">
                    {feeStatusData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-auto">
                {feeStatusData.map((d, i) => (
                  <div key={i} className="flex items-center justify-between text-xs font-bold">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ background: d.fill }}></span>
                      <span className="text-slate-600">{d.name}</span>
                    </div>
                    <span className="text-slate-900 bg-slate-50 px-2 rounded-md">{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : <div className="h-[160px] flex items-center justify-center text-slate-300 text-xs font-bold uppercase">No data</div>}
        </div>

      </div>

      {/* ── ROW 5: FEE PENDING ACTION LIST ── */}
      <div className="bg-white rounded-3xl border border-slate-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.02)] overflow-hidden">
        <div className="p-8 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-50/50">
          <SectionHeader title="Financial Ledger Exceptions" subtitle="Allocated nodes awaiting payment registration" icon={<CreditCard size={20} />} color={COLORS.danger} gradientFrom="#fb7185" gradientTo="#e11d48" />
          
          {(stats?.feePendingList?.length || 0) > 0 && (
            <div className="flex items-center gap-2 bg-rose-50 text-rose-700 text-xs font-black px-4 py-2 rounded-full border border-rose-200/60 shadow-inner">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
              {stats.feePendingList.length} PENDING TRANSACTIONS
            </div>
          )}
        </div>
        {stats?.feePendingList?.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="p-4 bg-emerald-50 rounded-full text-emerald-500">
              <CheckCircle size={48} />
            </div>
            <div className="text-center">
              <p className="text-slate-700 font-black text-lg">Ledger Normalized</p>
              <p className="text-slate-500 font-bold text-sm">All allocated seats have active payment proofs recorded.</p>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {stats?.feePendingList?.map(adm => (
              <div key={adm._id} className="flex flex-col sm:flex-row items-center justify-between px-8 py-5 hover:bg-slate-50 transition-colors group">
                <div className="flex items-center gap-5 w-full sm:w-auto mb-4 sm:mb-0">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-100 to-red-50 text-rose-700 flex items-center justify-center font-black text-lg border border-rose-200/60 shadow-sm group-hover:scale-110 transition-transform">
                    {adm.applicantId?.name?.charAt(0)}
                  </div>
                  <div>
                    <p className="font-black text-slate-800 text-base group-hover:text-rose-600 transition-colors">{adm.applicantId?.name}</p>
                    <p className="text-xs font-bold text-slate-400 mt-1 flex items-center gap-2">
                       <span className="text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">{adm.programId?.name}</span> 
                       <span className="text-slate-300">•</span> 
                       <span className="uppercase tracking-widest">{adm.quotaType} Route</span>
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between w-full sm:w-auto gap-6 sm:gap-8">
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-1">Doc State</span>
                    <span className={`text-[11px] font-black px-3 py-1 rounded-lg border uppercase tracking-widest shadow-sm ${adm.applicantId?.documentsStatus === 'Verified' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-amber-50 text-amber-600 border-amber-200'}`}>
                      {adm.applicantId?.documentsStatus}
                    </span>
                  </div>
                  <div className="p-3 bg-rose-50 rounded-xl rounded-tr-sm text-rose-500 border border-rose-100 group-hover:bg-rose-500 group-hover:text-white transition-colors cursor-pointer shadow-sm">
                    <CreditCard size={20} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

export default Dashboard;
