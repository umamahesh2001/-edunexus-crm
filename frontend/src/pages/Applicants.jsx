import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { z } from 'zod';
import api from '../api/axios';
import { UserPlus, Save, Search, X, CheckCircle2, AlertCircle, Edit2, Loader2, ShieldAlert } from 'lucide-react';
import CustomSelect from '../components/CustomSelect';
import PaginationBar from '../components/PaginationBar';

const applicantSchema = z.object({
  name: z.string().min(3, 'Full name must be at least 3 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().regex(/^[0-9]{10}$/, 'Phone number must be exactly 10 digits'),
  category: z.string().min(1, 'Category is required'),
  entryType: z.string().min(1, 'Entry type is required'),
  quotaType: z.string().min(1, 'Quota type is required'),
  marks: z.number({ invalid_type_error: 'Marks must be a valid number' })
          .min(0, 'Marks cannot be negative')
          .max(100, 'Marks cannot exceed 100%')
});

const Applicants = () => {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5);
  
  const initialForm = {
    name: '', email: '', phone: '', category: 'GM', 
    entryType: 'Regular', quotaType: 'KCET', marks: ''
  };
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});

  const { data, isLoading } = useQuery({
    queryKey: ['applicants', page, limit],
    queryFn: async () => (await api.get(`/applicants?page=${page}&limit=${limit}`)).data
  });

  const applicants = data?.applicants || [];
  const totalPages = data?.totalPages || 1;
  const total = data?.total || 0;

  const createMutation = useMutation({
    mutationFn: async (payload) => (await api.post('/applicants', payload)).data,
    onSuccess: () => {
      queryClient.invalidateQueries(['applicants']);
      closeModal();
      toast.success('Applicant Registered Successfully!');
    },
    onError: (err) => toast.error(`Registration Failed: ${err.response?.data?.error || err.message}`)
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, payload }) => (await api.put(`/applicants/${id}`, payload)).data,
    onSuccess: () => {
      queryClient.invalidateQueries(['applicants']);
      closeModal();
      toast.success('Applicant Profile Updated Successfully!');
    },
    onError: (err) => toast.error(`Update Failed: ${err.response?.data?.error || err.message}`)
  });

  const docStatusMutation = useMutation({
    mutationFn: async ({ id, status }) => (await api.patch(`/applicants/${id}/documents`, { documentsStatus: status })).data,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(['applicants']);
      toast.success(`Applicant documents marked as ${variables.status}`);
    }
  });

  const closeModal = () => {
    setShowForm(false);
    setIsEdit(false);
    setEditId(null);
    setForm(initialForm);
    setErrors({});
  };

  const openEditModal = (app) => {
    setForm({
      name: app.name, email: app.email, phone: app.phone, 
      category: app.category, entryType: app.entryType, 
      quotaType: app.quotaType, marks: app.marks
    });
    setIsEdit(true);
    setEditId(app._id);
    setShowForm(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrors({});
    
    // Typecast safely for Zod validation check
    const validationData = { ...form, marks: form.marks === '' ? undefined : Number(form.marks) };
    const result = applicantSchema.safeParse(validationData);

    if (!result.success) {
      const fieldErrors = {};
      result.error.issues.forEach(issue => { fieldErrors[issue.path[0]] = issue.message; });
      setErrors(fieldErrors);
      toast.error('Please correct the validation errors in the form');
      return;
    }

    if (isEdit) {
      updateMutation.mutate({ id: editId, payload: validationData });
    } else {
      createMutation.mutate(validationData);
    }
  };

  const handleInputChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const filteredApplicants = applicants.filter(a => a.name.toLowerCase().includes(searchTerm.toLowerCase()) || a.email.toLowerCase().includes(searchTerm.toLowerCase()) || a.phone.includes(searchTerm));

  const categoryOptions = [
    { value: 'GM', label: 'General Merit (GM)' }, { value: 'SC', label: 'SC' },
    { value: 'ST', label: 'ST' }, { value: 'OBC', label: 'OBC' }, { value: 'Others', label: 'Others' }
  ];

  const entryTypeOptions = [
    { value: 'Regular', label: 'Regular Entry' }, { value: 'Lateral', label: 'Lateral Entry Mode' }
  ];

  const quotaOptions = [
    { value: 'KCET', label: 'State KCET' }, { value: 'COMEDK', label: 'COMEDK' }, { value: 'Management', label: 'Management Bracket' }
  ];

  const InputError = ({ msg }) => msg ? (
    <div className="flex items-center text-[11px] text-rose-600 font-bold mt-1.5 animate-fade-in pl-1">
      <AlertCircle size={12} className="mr-1" /> {msg}
    </div>
  ) : null;

  return (
    <div className="space-y-8 animate-fade-in pb-12 max-w-7xl mx-auto position-relative">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 pb-6">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Applicant Management</h2>
          <p className="text-slate-500 mt-1">Register new candidates, enforce rules, and verify document submissions.</p>
        </div>
        <button 
          onClick={() => setShowForm(true)} 
          className="flex items-center px-5 py-2.5 bg-blue-800 hover:bg-blue-900 text-white font-semibold rounded-xl shadow-md shadow-blue-900/20 transition-all hover:-translate-y-0.5"
        >
          <UserPlus size={18} className="mr-2" /> New Applicant
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm overflow-y-auto w-full h-full pb-20 pt-10">
          <div className="bg-white p-6 md:p-8 rounded-3xl shadow-2xl border border-slate-200/70 relative w-full max-w-3xl animate-fade-in my-auto">
            <div className="absolute top-6 right-6 z-50">
              <button onClick={closeModal} className="p-2 text-slate-400 bg-slate-100 hover:bg-rose-100 hover:text-rose-600 rounded-full transition-colors group">
                <X size={20} className="group-hover:rotate-90 transition-transform duration-300" />
              </button>
            </div>
            
            <h3 className="text-xl font-bold text-slate-800 mb-2 flex items-center">
              {isEdit ? <span className="text-amber-600 flex items-center"><Edit2 size={20} className="mr-2"/> Edit Profile & Credentials</span> : 'New Applicant Registration'}
            </h3>
            <p className="text-sm font-medium text-slate-500 mb-8 pb-4 border-b border-slate-100">
              {isEdit ? 'Modify applicant progression paths. System lock ensures primary contact data cannot be spoofed.' : 'Fill out strictly validated candidate form for system entry.'}
            </p>
            
            {isEdit && (
              <div className="mb-6 p-3 bg-amber-50/50 border border-amber-200/50 rounded-xl flex items-start">
                 <ShieldAlert className="text-amber-500 mr-3 shrink-0" size={18} />
                 <p className="text-[11px] font-bold text-amber-700 leading-relaxed uppercase tracking-widest mt-0.5">Primary Contact Identities (Email & Phone) are Immutable strictly protected by backend protocols and cannot be altered.</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10 w-full">
              <div className="md:col-span-2 lg:col-span-1">
                <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${errors.name ? 'text-rose-700' : 'text-slate-700'}`}>Full Name</label>
                <input placeholder="Jane Doe" className={`w-full px-4 py-3 rounded-xl border bg-slate-50 focus:outline-none transition-colors shadow-sm ${errors.name ? 'border-rose-300 focus:ring-2 focus:ring-rose-500 background-rose-50' : 'border-slate-300 focus:ring-2 focus:ring-blue-800'}`} value={form.name} onChange={e => handleInputChange('name', e.target.value)}/>
                <InputError msg={errors.name} />
              </div>
              <div>
                <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${errors.email ? 'text-rose-700' : 'text-slate-700'}`}>Email Address</label>
                <input disabled={isEdit} type="email" placeholder="jane@example.com" className={`w-full px-4 py-3 rounded-xl border focus:outline-none transition-colors shadow-sm ${isEdit ? 'bg-slate-200/70 border-slate-300 text-slate-500 cursor-not-allowed select-none' : errors.email ? 'bg-slate-50 border-rose-300 focus:ring-2 focus:ring-rose-500 background-rose-50' : 'bg-slate-50 border-slate-300 focus:ring-2 focus:ring-blue-800'}`} value={form.email} onChange={e => handleInputChange('email', e.target.value)}/>
                <InputError msg={errors.email} />
              </div>
              <div className="md:col-span-2 lg:col-span-1">
                <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${errors.phone ? 'text-rose-700' : 'text-slate-700'}`}>Phone Number</label>
                <input disabled={isEdit} placeholder="10 Digits" className={`w-full px-4 py-3 rounded-xl border font-mono tracking-widest focus:outline-none transition-colors shadow-sm ${isEdit ? 'bg-slate-200/70 border-slate-300 text-slate-500 cursor-not-allowed select-none' : errors.phone ? 'bg-slate-50 border-rose-300 focus:ring-2 focus:ring-rose-500 background-rose-50' : 'bg-slate-50 border-slate-300 focus:ring-2 focus:ring-blue-800'}`} value={form.phone} onChange={e => handleInputChange('phone', e.target.value)}/>
                <InputError msg={errors.phone} />
              </div>
              <div className="relative z-40">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">Category</label>
                <CustomSelect options={categoryOptions} value={form.category} onChange={val => handleInputChange('category', val)} className={errors.category ? 'ring-1 ring-rose-500 border-rose-500 shadow-sm' : 'shadow-sm'} />
                <InputError msg={errors.category} />
              </div>
              <div className="relative z-30">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">Entry Type</label>
                <CustomSelect options={entryTypeOptions} value={form.entryType} onChange={val => handleInputChange('entryType', val)} className={errors.entryType ? 'ring-1 ring-rose-500 border-rose-500 shadow-sm' : 'shadow-sm'} />
                <InputError msg={errors.entryType} />
              </div>
              <div className="relative z-20">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">Quota Intention</label>
                <CustomSelect options={quotaOptions} value={form.quotaType} onChange={val => handleInputChange('quotaType', val)} className={errors.quotaType ? 'ring-1 ring-rose-500 border-rose-500 shadow-sm' : 'shadow-sm'} />
                <InputError msg={errors.quotaType} />
              </div>
              <div className="md:col-span-2 lg:col-span-1">
                <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${errors.marks ? 'text-rose-700' : 'text-slate-700'}`}>Qualifying Marks (%)</label>
                <input type="number" step="0.01" placeholder="e.g. 85.5" className={`w-full px-4 py-3 rounded-xl border bg-slate-50 font-mono text-xl focus:outline-none transition-colors shadow-sm ${errors.marks ? 'border-rose-300 focus:ring-2 focus:ring-rose-500 background-rose-50' : 'border-slate-300 focus:ring-2 focus:ring-blue-800'}`} value={form.marks} onChange={e => handleInputChange('marks', e.target.value)}/>
                <InputError msg={errors.marks} />
              </div>
              
              <div className="md:col-span-2 pt-6 mt-4 border-t border-slate-100 flex items-center justify-end space-x-3 relative z-0">
                <button type="button" onClick={closeModal} className="px-6 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-all">Cancel</button>
                <button disabled={createMutation.isPending || updateMutation.isPending} className="flex items-center px-8 py-3.5 bg-blue-800 hover:bg-blue-900 text-white font-bold rounded-xl shadow-lg shadow-blue-800/30 transition-all disabled:opacity-50">
                   {(createMutation.isPending || updateMutation.isPending) ? <Loader2 size={20} className="mr-2 animate-spin" /> : <Save size={20} className="mr-2" />} 
                   {isEdit ? 'Update Profile' : 'Confirm Registration'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white rounded-3xl shadow-sm overflow-hidden border border-slate-200/70 z-0 relative">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by Name, Email, or Phone..." 
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-800/50"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <p className="text-xs font-semibold text-slate-500 uppercase">Showing Page {page} (Total: {total})</p>
        </div>

        {isLoading ? <div className="p-12 flex justify-center"><div className="animate-spin h-8 w-8 border-b-2 border-blue-800 rounded-full"></div></div> : (
          <div className="overflow-x-auto overflow-y-auto" style={{ maxHeight: '520px' }}>
            <table className="min-w-full divide-y divide-slate-200 table-fixed">
              <thead className="bg-slate-300/30">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider w-[25%]">Candidate Profile</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider w-[25%]">Contact Info</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider w-[15%]">Merit Matrix</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider w-[15%]">Document Flow</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider w-[20%]">Management Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-100">
                {filteredApplicants.map(app => (
                  <tr key={app._id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-4 truncate">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-100 to-slate-200 text-blue-900 flex items-center justify-center font-bold shadow-inner border border-blue-200/50">
                            {app.name.charAt(0)}
                          </div>
                        </div>
                        <div className="ml-4 truncate">
                          <div className="text-sm font-extrabold text-slate-900 truncate">{app.name}</div>
                          <div className="text-[10px] uppercase font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md inline-block mt-1 border border-slate-200/50">{app.category}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 truncate">
                      <div className="text-sm font-medium text-slate-900 truncate" title={app.email}>{app.email}</div>
                      <div className="text-xs font-medium text-slate-500 mt-1 font-mono">{app.phone}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-extrabold text-slate-700 truncate">{app.quotaType} <span className="text-[10px] bg-slate-100 px-1 py-0.5 rounded ml-1 text-slate-500 font-bold border border-slate-200">{app.entryType}</span></div>
                      <div className="text-sm text-blue-800 font-extrabold mt-1">{app.marks}%</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 inline-flex text-[10px] uppercase tracking-wider font-bold rounded-full border shadow-sm
                        ${app.documentsStatus === 'Verified' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 
                          app.documentsStatus === 'Submitted' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-slate-50 text-slate-600 border-slate-200'}`}>
                        {app.documentsStatus === 'Verified' ? '✓ ' : ''}{app.documentsStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-right">
                       <div className="flex items-center justify-end space-x-2 w-full">
                          
                          {/* EDIT BUTTON */}
                          <button 
                            onClick={() => openEditModal(app)} 
                            className="bg-slate-100 hover:bg-slate-200 text-slate-700 p-2 rounded-lg transition-colors border border-slate-200 shadow-sm tooltip"
                            title="Edit Applicant Profile"
                          >
                            <Edit2 size={16} />
                          </button>
                      
                          {/* DOCUMENT VERIFICATION SELECTOR */}
                          <div className="min-w-[140px]">
                            {app.documentsStatus === 'Verified' ? (
                              <div className="w-full text-[11px] uppercase tracking-wider py-2 px-2 bg-slate-50/50 border border-slate-200/80 text-emerald-700 font-bold rounded-xl flex items-center justify-center shadow-sm">
                                <CheckCircle2 size={14} className="mr-1.5 text-emerald-500" /> Locked Match
                              </div>
                            ) : (
                              <CustomSelect 
                                options={[
                                  { value: 'Pending', label: '📝 Set Pending' },
                                  { value: 'Submitted', label: '📤 Log Submitted' },
                                  { value: 'Verified', label: '✅ Verify Docs' }
                                ]}
                                value={app.documentsStatus}
                                onChange={status => docStatusMutation.mutate({ id: app._id, status })}
                                disabled={docStatusMutation.isPending}
                                className="w-full text-[11px] font-bold shadow-none border border-slate-200/80 py-1.5 h-auto text-center"
                              />
                            )}
                          </div>
                       </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredApplicants.length === 0 && (
              <div className="p-16 text-center">
                <Search className="mx-auto h-12 w-12 text-slate-200 mb-4" />
                <h3 className="text-lg font-bold text-slate-900">No Candidates Found</h3>
                <p className="text-slate-500 mt-2 font-medium">Try adjusting your search query or flipping through pages.</p>
              </div>
            )}
          </div>
        )}
        
        <PaginationBar
          page={page}
          totalPages={totalPages}
          total={total}
          limit={limit}
          onPageChange={setPage}
          onLimitChange={(n) => { setLimit(n); setPage(1); }}
        />
      </div>
    </div>
  );
};

export default Applicants;
