import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { Building2, School, GraduationCap, Grid, Save, Trash2, Edit2, CheckCircle2, XCircle, Loader2, Search } from 'lucide-react';
import CustomSelect from '../components/CustomSelect';
import PaginationBar from '../components/PaginationBar';

const MasterSetup = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('institution');

  const [editMode, setEditMode] = useState({ active: false, id: null, type: null });
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [togglingId, setTogglingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  // Table-specific state
  const [tablePage, setTablePage] = useState(1);
  const [tableSearch, setTableSearch] = useState('');
  const [tableLimit, setTableLimit] = useState(5);

  // Endpoint map: tab id -> API type slug
  const TAB_ENDPOINT = { institution: 'institutions', campus: 'campuses', department: 'departments', program: 'programs', quota: 'quotas' };

  // 1) Full data for dropdowns (all active records)
  const { data, isLoading } = useQuery({
    queryKey: ['masterData'],
    queryFn: async () => (await api.get('/master')).data
  });

  // 2) Paginated data for the table
  const { data: tableData, isLoading: tableLoading } = useQuery({
    queryKey: ['masterTable', activeTab, tablePage, tableSearch, tableLimit],
    queryFn: async () => (
      await api.get(`/master/paginated/${TAB_ENDPOINT[activeTab]}`, {
        params: { page: tablePage, limit: tableLimit, search: tableSearch }
      })
    ).data,
    keepPreviousData: true
  });

  const tableRows = tableData?.data || [];
  const totalPages = tableData?.totalPages || 1;
  const totalRecords = tableData?.total || 0;

  const [institutionForm, setInstitutionForm] = useState({ name: '' });
  const [campusForm, setCampusForm] = useState({ name: '', institutionId: '' });
  const [deptForm, setDeptForm] = useState({ name: '', campusId: '' });
  const [programForm, setProgramForm] = useState({ name: '', departmentId: '', courseType: 'UG', entryType: 'Regular', academicYear: '2026-2027', totalIntake: '' });
  const [quotaForm, setQuotaForm] = useState({ programId: '', kcet: '', comedk: '', management: '' });

  const resetForms = useCallback(() => {
    setEditMode({ active: false, id: null, type: null });
    setConfirmDeleteId(null);
    setInstitutionForm({ name: '' });
    setCampusForm({ name: '', institutionId: '' });
    setDeptForm({ name: '', campusId: '' });
    setProgramForm({ name: '', departmentId: '', courseType: 'UG', entryType: 'Regular', academicYear: '2026-2027', totalIntake: '' });
    setQuotaForm({ programId: '', kcet: '', comedk: '', management: '' });
  }, []);

  const switchTab = (tabId) => { setActiveTab(tabId); setTablePage(1); setTableSearch(''); resetForms(); };

  const saveMutation = useMutation({
    mutationFn: async ({ endpoint, payload, isEdit, editId }) => {
      if (isEdit) {
        return (await api.put(`/master/${endpoint}/${editId}`, payload)).data;
      }
      return (await api.post(`/master/${endpoint}`, payload)).data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['masterData']);
      queryClient.invalidateQueries(['masterTable']);
      toast.success(`Configuration ${editMode.active ? 'Updated' : 'Saved'} Successfully!`);
      resetForms();
    },
    onError: (err) => {
      toast.error(`Error: ${err.response?.data?.error || err.message}`);
    }
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ endpoint, id }) => {
      setTogglingId(id);
      return (await api.patch(`/master/${endpoint}/${id}/toggle`)).data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['masterData']);
      queryClient.invalidateQueries(['masterTable']);
      setTogglingId(null);
      toast.success('Status toggled successfully');
    },
    onError: (err) => {
      toast.error(err.response?.data?.error || err.message);
      setTogglingId(null);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async ({ endpoint, id }) => {
      setDeletingId(id);
      return (await api.delete(`/master/${endpoint}/${id}`)).data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['masterData']);
      queryClient.invalidateQueries(['masterTable']);
      setDeletingId(null);
      setConfirmDeleteId(null);
      toast.success('Record deleted permanently');
    },
    onError: (err) => {
      toast.error(err.response?.data?.error || err.message, { duration: 5000 });
      setDeletingId(null);
      setConfirmDeleteId(null);
    }
  });

  const handleEdit = (endpoint, item) => {
    setEditMode({ active: true, id: item._id, type: endpoint });
    setConfirmDeleteId(null);
    if (endpoint === 'institutions') setInstitutionForm({ name: item.name });
    if (endpoint === 'campuses') setCampusForm({ name: item.name, institutionId: item.institutionId?._id || item.institutionId });
    if (endpoint === 'departments') setDeptForm({ name: item.name, campusId: item.campusId?._id || item.campusId });
    if (endpoint === 'programs') setProgramForm({ name: item.name, departmentId: item.departmentId?._id || item.departmentId, courseType: item.courseType, entryType: item.entryType, academicYear: item.academicYear, totalIntake: item.totalIntake });
  };

  if (isLoading) return <div className="flex justify-center py-20"><div className="animate-spin h-8 w-8 border-b-2 border-indigo-600 rounded-full"></div></div>;

  const tabs = [
    { id: 'institution', label: 'Institution', icon: <Building2 size={18} />, endpoint: 'institutions' },
    { id: 'campus', label: 'Campuses', icon: <Building2 size={18} />, endpoint: 'campuses' },
    { id: 'department', label: 'Departments', icon: <Grid size={18} />, endpoint: 'departments' },
    { id: 'program', label: 'Programs', icon: <GraduationCap size={18} />, endpoint: 'programs' },
    { id: 'quota', label: 'Seat Quotas', icon: <School size={18} />, endpoint: 'quotas' }
  ];

  const instOptions = data?.institutions?.filter(i => i.isActive).map(i => ({ value: i._id, label: i.name })) || [];
  const campusOptions = data?.campuses?.filter(c => c.isActive).map(c => ({ value: c._id, label: `${c.name} (${c.institutionId.name})` })) || [];
  const deptOptions = data?.departments?.filter(d => d.isActive).map(d => ({ value: d._id, label: `${d.name} (${d.campusId.name})` })) || [];
  const progOptions = data?.programs?.filter(p => p.isActive).map(p => ({ value: p._id, label: `${p.name} (Max Intake: ${p.totalIntake})` })) || [];

  const programsWithQuotas = new Set(data?.quotas?.filter(q => q.isActive).map(q => q.programId?._id));
  const quotaTabProgOptions = data?.programs?.filter(p => p.isActive && !programsWithQuotas.has(p._id)).map(p => ({ value: p._id, label: `${p.name} (Max Intake: ${p.totalIntake})` })) || [];

  const ActionButtons = ({ item, endpoint, allowEdit = true }) => {
    const isToggling = togglingId === item._id && toggleMutation.isPending;
    const isDeleting = deletingId === item._id && deleteMutation.isPending;

    return (
      <div className="flex space-x-2 items-center relative justify-end">
        <button 
          onClick={() => isToggling ? null : toggleMutation.mutate({ endpoint, id: item._id })}
          disabled={isToggling || isDeleting}
          className={`p-1.5 rounded-md text-xs font-bold transition-colors disabled:opacity-50 ${item.isActive ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'}`}
          title={item.isActive ? "Deprecate (Disable)" : "Activate"}
        >
          {isToggling ? <Loader2 size={16} className="animate-spin" /> : (
            item.isActive ? <XCircle size={16} /> : <CheckCircle2 size={16} />
          )}
        </button>
        {allowEdit && (
          <button 
            onClick={() => handleEdit(endpoint, item)} 
            disabled={isToggling || isDeleting}
            className="p-1.5 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors disabled:opacity-50" 
            title="Edit"
          >
            <Edit2 size={16} />
          </button>
        )}
        <div className="relative">
          <button 
            onClick={() => confirmDeleteId === item._id ? setConfirmDeleteId(null) : setConfirmDeleteId(item._id)} 
            disabled={isToggling || isDeleting}
            className={`p-1.5 text-rose-700 rounded-md transition-colors disabled:opacity-50 ${confirmDeleteId === item._id ? 'bg-rose-200' : 'bg-rose-100 hover:bg-rose-200'}`} 
            title="Delete Permanently"
          >
            {isDeleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
          </button>
          
          {confirmDeleteId === item._id && !isDeleting && (
            <div className="absolute top-1/2 right-[125%] -translate-y-1/2 w-48 bg-slate-900 text-white p-3 rounded-xl shadow-2xl border border-slate-700 z-50 animate-fade-in text-left">
              <p className="text-xs font-bold text-slate-200 mb-2">Delete permanently?</p>
              <div className="flex space-x-2">
                <button 
                  onClick={() => deleteMutation.mutate({ endpoint, id: item._id })} 
                  className="flex-1 bg-rose-600 text-white text-xs font-bold py-1.5 rounded-lg hover:bg-rose-700 transition-colors"
                >
                  Confirm
                </button>
                <button 
                  onClick={() => setConfirmDeleteId(null)} 
                  className="flex-1 bg-slate-700 text-slate-300 text-xs font-bold py-1.5 rounded-lg hover:bg-slate-600 transition-colors"
                >
                  Cancel
                </button>
              </div>
              <div className="absolute top-1/2 -right-1.5 -translate-y-1/2 w-3 h-3 bg-slate-900 border-t border-r border-slate-700 rotate-45"></div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const StatusBadge = ({ isActive }) => (
    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider shadow-sm border ${isActive ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-50 text-slate-500 border-slate-200'}`}>
      {isActive ? 'Active' : 'Deprecated'}
    </span>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in pb-12">
      <div>
        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Master Configurations</h2>
        <p className="text-slate-500 mt-2">Manage the foundational academic hierarchy and seat matrices interactively.</p>
      </div>
      
      <div className="flex space-x-1 p-1 bg-white border border-slate-200 rounded-xl shadow-sm overflow-x-auto w-full md:w-auto">
        {tabs.map((tab) => (
          <button 
            key={tab.id}
            onClick={() => switchTab(tab.id)}
            className={`flex items-center whitespace-nowrap px-5 py-3 rounded-lg text-sm font-semibold transition-all duration-200 ${
              activeTab === tab.id 
              ? 'bg-indigo-50 text-indigo-700 shadow-sm ring-1 ring-indigo-200/50' 
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <span className={`mr-2 ${activeTab === tab.id ? 'text-indigo-600' : 'text-slate-400'}`}>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-0 items-start">
        
        {/* LEFT COMPONENT: FORM */}
        <div className="lg:col-span-4 bg-white p-6 md:p-8 rounded-3xl shadow-lg border border-slate-200/70 relative z-20 sticky transition-all top-6">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/40 to-transparent rounded-3xl pointer-events-none"></div>
          
          <div className="relative z-10 w-full">
            <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center justify-between border-b border-slate-100 pb-4">
              {editMode.active ? <span className="text-amber-600 flex items-center"><Edit2 size={18} className="mr-2"/> Editing Record</span> : 'Create New Record'}
              {editMode.active && <button onClick={resetForms} className="text-xs font-bold text-slate-500 hover:text-slate-800 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-300">Cancel Edit</button>}
            </h3>
            
            {activeTab === 'institution' && (
              <form onSubmit={(e) => { e.preventDefault(); saveMutation.mutate({ endpoint: 'institutions', payload: institutionForm, isEdit: editMode.active, editId: editMode.id }); }} className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Institution Name</label>
                  <input required type="text" placeholder="e.g. Global Institute" 
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50 text-sm" 
                    value={institutionForm.name} onChange={e => setInstitutionForm({...institutionForm, name: e.target.value})} />
                </div>
                <button disabled={saveMutation.isPending} className="flex items-center justify-center w-full px-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg transition-all disabled:opacity-50">
                  {saveMutation.isPending ? <Loader2 size={18} className="animate-spin mr-2" /> : <Save size={18} className="mr-2" />} 
                  {editMode.active ? 'Update Institution' : 'Save Institution'}
                </button>
              </form>
            )}

            {activeTab === 'campus' && (
              <form onSubmit={(e) => { e.preventDefault(); saveMutation.mutate({ endpoint: 'campuses', payload: campusForm, isEdit: editMode.active, editId: editMode.id }); }} className="space-y-6">
                <div className="relative z-50">
                  <label className="block text-sm font-bold text-slate-700 mb-2">Select Institution</label>
                  <CustomSelect options={instOptions} value={campusForm.institutionId} onChange={v => setCampusForm({...campusForm, institutionId: v})} placeholder="-- Choose Institution --" />
                </div>
                <div className="relative z-0">
                  <label className="block text-sm font-bold text-slate-700 mb-2">Campus Name</label>
                  <input required type="text" placeholder="e.g. North Campus" className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 bg-slate-50 text-sm"
                    value={campusForm.name} onChange={e => setCampusForm({...campusForm, name: e.target.value})} />
                </div>
                <button disabled={saveMutation.isPending || !campusForm.institutionId} className="flex items-center justify-center w-full px-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg transition-all z-0 relative disabled:opacity-50">
                  {saveMutation.isPending ? <Loader2 size={18} className="animate-spin mr-2" /> : <Save size={18} className="mr-2" />} 
                  {editMode.active ? 'Update Campus' : 'Save Campus'}
                </button>
              </form>
            )}

            {activeTab === 'department' && (
              <form onSubmit={(e) => { e.preventDefault(); saveMutation.mutate({ endpoint: 'departments', payload: deptForm, isEdit: editMode.active, editId: editMode.id }); }} className="space-y-6">
                <div className="relative z-50">
                  <label className="block text-sm font-bold text-slate-700 mb-2">Select Campus</label>
                  <CustomSelect options={campusOptions} value={deptForm.campusId} onChange={v => setDeptForm({...deptForm, campusId: v})} placeholder="-- Choose Campus --" />
                </div>
                <div className="relative z-0">
                  <label className="block text-sm font-bold text-slate-700 mb-2">Department Name</label>
                  <input required type="text" placeholder="e.g. Comp Sci" className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 bg-slate-50 text-sm"
                    value={deptForm.name} onChange={e => setDeptForm({...deptForm, name: e.target.value})} />
                </div>
                <button disabled={saveMutation.isPending || !deptForm.campusId} className="flex items-center justify-center w-full px-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg transition-all z-0 relative disabled:opacity-50">
                  {saveMutation.isPending ? <Loader2 size={18} className="animate-spin mr-2" /> : <Save size={18} className="mr-2" />} 
                  {editMode.active ? 'Update Department' : 'Save Department'}
                </button>
              </form>
            )}

            {activeTab === 'program' && (
              <form onSubmit={(e) => { e.preventDefault(); saveMutation.mutate({ endpoint: 'programs', payload: {...programForm, totalIntake: Number(programForm.totalIntake)}, isEdit: editMode.active, editId: editMode.id }); }} className="space-y-6">
                <div className="space-y-4">
                  <div className="relative z-50">
                    <label className="block text-sm font-bold text-slate-700 mb-2">Select Department</label>
                    <CustomSelect options={deptOptions} value={programForm.departmentId} onChange={v => setProgramForm({...programForm, departmentId: v})} placeholder="-- Choose Department --" />
                  </div>
                  <div className="relative z-0">
                    <label className="block text-sm font-bold text-slate-700 mb-2">Program Name</label>
                    <input required placeholder="B.Tech AI" type="text" className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 bg-slate-50 text-sm"
                      value={programForm.name} onChange={e => setProgramForm({...programForm, name: e.target.value})} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="relative z-0">
                      <label className="block text-sm font-bold text-slate-700 mb-2">Total Intake</label>
                      <input required type="number" min="1" placeholder="60" className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 bg-slate-50 text-sm"
                        value={programForm.totalIntake} onChange={e => setProgramForm({...programForm, totalIntake: e.target.value})} />
                    </div>
                    <div className="relative z-30">
                      <label className="block text-sm font-bold text-slate-700 mb-2">Course Type</label>
                      <CustomSelect options={[{value: 'UG', label: 'UG'}, {value: 'PG', label: 'PG'}]} value={programForm.courseType} onChange={v => setProgramForm({...programForm, courseType: v})} />
                    </div>
                  </div>
                  <div className="relative z-20">
                    <label className="block text-sm font-bold text-slate-700 mb-2">Entry Type</label>
                    <CustomSelect options={[{value: 'Regular', label: 'Regular'}, {value: 'Lateral', label: 'Lateral'}]} value={programForm.entryType} onChange={v => setProgramForm({...programForm, entryType: v})} />
                  </div>
                </div>
                <button disabled={saveMutation.isPending || !programForm.departmentId} className="flex items-center justify-center w-full px-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg transition-all disabled:opacity-50">
                  {saveMutation.isPending ? <Loader2 size={18} className="animate-spin mr-2" /> : <Save size={18} className="mr-2" />} 
                  {editMode.active ? 'Update Program' : 'Save Program'}
                </button>
              </form>
            )}

            {activeTab === 'quota' && (
              <div className="space-y-6">
                {editMode.active ? (
                  <div className="p-4 bg-amber-50 text-amber-800 rounded-xl border border-amber-200 text-sm font-medium">
                    Individual quotas cannot be explicitly edited here. To modify quota allocation safely, deprecate the quota using the toggle switch in the table and create a new Quota instance.
                  </div>
                ) : (
                <form onSubmit={(e) => { 
                  e.preventDefault(); 
                  const quotas = [
                    { type: 'KCET', totalSeats: Number(quotaForm.kcet) || 0 },
                    { type: 'COMEDK', totalSeats: Number(quotaForm.comedk) || 0 },
                    { type: 'Management', totalSeats: Number(quotaForm.management) || 0 }
                  ].filter(q => q.totalSeats > 0);
                  saveMutation.mutate({ endpoint: 'quotas', payload: { programId: quotaForm.programId, quotas }, isEdit: false }); 
                }}>
                  <div className="relative z-50 mb-6">
                    <label className="block text-sm font-bold text-slate-700 mb-2">Select Program (Active)</label>
                    <CustomSelect options={quotaTabProgOptions} value={quotaForm.programId} onChange={v => setQuotaForm({...quotaForm, programId: v})} placeholder="-- Choose Unallocated Program --" />
                  </div>
                  <div className="space-y-4 relative z-0 mb-6">
                    <div className="flex items-center p-3 rounded-xl border border-slate-200 bg-slate-50 relative">
                      <div className="w-full max-w-[120px] font-bold text-sm text-indigo-700 uppercase tracking-widest pl-2">KCET</div>
                      <input type="number" placeholder="Seats" min="0" className="w-full flex-grow px-4 py-2 rounded-lg border border-slate-300 focus:ring-indigo-500 font-mono" value={quotaForm.kcet} onChange={e => setQuotaForm({...quotaForm, kcet: e.target.value})} />
                    </div>
                    <div className="flex items-center p-3 rounded-xl border border-slate-200 bg-slate-50 relative">
                      <div className="w-full max-w-[120px] font-bold text-sm text-fuchsia-700 uppercase tracking-widest pl-2">COMEDK</div>
                      <input type="number" placeholder="Seats" min="0" className="w-full flex-grow px-4 py-2 rounded-lg border border-slate-300 focus:ring-indigo-500 font-mono" value={quotaForm.comedk} onChange={e => setQuotaForm({...quotaForm, comedk: e.target.value})} />
                    </div>
                    <div className="flex items-center p-3 rounded-xl border border-slate-200 bg-slate-50 relative">
                      <div className="w-full max-w-[120px] font-bold text-sm text-rose-700 uppercase tracking-widest pl-2">MGMT</div>
                      <input type="number" placeholder="Seats" min="0" className="w-full flex-grow px-4 py-2 rounded-lg border border-slate-300 focus:ring-indigo-500 font-mono" value={quotaForm.management} onChange={e => setQuotaForm({...quotaForm, management: e.target.value})} />
                    </div>
                  </div>
                  <button disabled={saveMutation.isPending || !quotaForm.programId} className="flex items-center justify-center w-full px-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg transition-all z-0 relative disabled:opacity-50">
                    {saveMutation.isPending ? <Loader2 size={18} className="animate-spin mr-2" /> : <Save size={18} className="mr-2" />} 
                    Issue Seat Matrix
                  </button>
                </form>
                )}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COMPONENT: PAGINATED TABLE */}
        <div className="lg:col-span-8 bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-200/80 relative z-0 flex flex-col min-h-full">
          {/* Table Header with Search */}
          <div className="p-5 border-b border-slate-100 bg-slate-50/50 rounded-t-3xl flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            <h3 className="font-bold text-slate-800 flex items-center capitalize text-lg">
              {tabs.find(t => t.id === activeTab)?.icon} <span className="ml-2">Configured {activeTab}s</span>
              <span className="ml-3 text-xs font-bold text-slate-400 uppercase bg-white px-2 py-0.5 rounded-full border border-slate-200 shadow-sm">{totalRecords} total</span>
            </h3>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Search records..."
                className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400 shadow-sm"
                value={tableSearch}
                onChange={e => { setTableSearch(e.target.value); setTablePage(1); }}
              />
            </div>
          </div>

          {/* Table Body */}
          <div className="overflow-x-auto overflow-y-auto relative" style={{ maxHeight: '480px' }}>
            {tableLoading && (
              <div className="absolute inset-0 bg-white/70 flex items-center justify-center z-10">
                <Loader2 className="animate-spin text-indigo-500" size={28} />
              </div>
            )}
            <table className="min-w-full divide-y divide-slate-100 table-fixed">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-5 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider w-1/2">Details</th>
                  <th className="px-5 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider w-1/6">Status</th>
                  <th className="px-5 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider w-1/3">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-50">
                {tableRows.map(item => {
                  const ep = TAB_ENDPOINT[activeTab];
                  return (
                    <tr key={item._id} className={`hover:bg-indigo-50/50 transition-colors ${editMode.id === item._id ? 'bg-amber-50/40 ring-1 ring-inset ring-amber-200' : ''}`}>
                      <td className="px-5 py-4 text-sm">
                        {activeTab === 'institution' && (
                          <div className="font-extrabold text-slate-800 truncate">{item.name}</div>
                        )}
                        {activeTab === 'campus' && (
                          <>
                            <div className="font-extrabold text-slate-800 truncate">{item.name}</div>
                            <div className="text-xs font-medium text-slate-500 mt-0.5 bg-slate-100 px-2 py-0.5 rounded-md inline-block">Inst: {item.institutionId?.name}</div>
                          </>
                        )}
                        {activeTab === 'department' && (
                          <>
                            <div className="font-extrabold text-slate-800 truncate">{item.name}</div>
                            <div className="text-xs font-medium text-slate-500 mt-0.5 bg-slate-100 px-2 py-0.5 rounded-md inline-block">Campus: {item.campusId?.name}</div>
                          </>
                        )}
                        {activeTab === 'program' && (
                          <>
                            <div className="font-extrabold text-slate-800 truncate flex items-center">
                              {item.name}
                              <span className="text-[10px] bg-indigo-100 text-indigo-700 font-bold ml-2 px-1.5 py-0.5 rounded uppercase">{item.courseType}</span>
                            </div>
                            <div className="text-xs font-medium text-slate-500 mt-1">{item.departmentId?.name} <span className="mx-1 text-slate-300">|</span> Intake: <span className="font-bold text-slate-700">{item.totalIntake}</span></div>
                          </>
                        )}
                        {activeTab === 'quota' && (
                          <>
                            <div className="font-extrabold text-slate-800">{item.type} Allocation</div>
                            <div className="text-xs font-medium text-slate-500 mt-1">{item.programId?.name} <span className="mx-1 text-slate-300">|</span> {item.totalSeats} seats <span className="mx-1 text-slate-300">|</span> Filled: <span className="font-bold text-rose-600">{item.filledSeats}</span></div>
                          </>
                        )}
                      </td>
                      <td className="px-5 py-4"><StatusBadge isActive={item.isActive} /></td>
                      <td className="px-5 py-4"><ActionButtons item={item} endpoint={ep} allowEdit={activeTab !== 'quota'} /></td>
                    </tr>
                  );
                })}

                {!tableLoading && tableRows.length === 0 && (
                  <tr>
                    <td colSpan="3" className="px-10 py-20 text-center">
                      <Grid className="mx-auto h-12 w-12 text-slate-200 mb-3" />
                      <p className="text-slate-400 font-medium">
                        {tableSearch ? `No results for "${tableSearch}"` : `No ${activeTab}s configured yet.`}
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <PaginationBar
            page={tablePage}
            totalPages={totalPages}
            total={totalRecords}
            limit={tableLimit}
            onPageChange={setTablePage}
            onLimitChange={(n) => { setTableLimit(n); setTablePage(1); }}
          />
        </div>
      </div>
    </div>
  );
};

export default MasterSetup;
