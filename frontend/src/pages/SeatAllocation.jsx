import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { ArrowRightLeft, AlertCircle, CheckCircle2, ShieldCheck, Users } from 'lucide-react';
import CustomSelect from '../components/CustomSelect';

const SeatAllocation = () => {
  const queryClient = useQueryClient();
  const [selectedApplicant, setSelectedApplicant] = useState('');
  const [selectedProgram, setSelectedProgram] = useState('');

  const { data: applicants, isLoading: appsLoading } = useQuery({
    queryKey: ['applicantsDropdown'], queryFn: async () => (await api.get('/applicants')).data
  });
  const { data: masterData, isLoading: masterLoading } = useQuery({
    queryKey: ['masterData'], queryFn: async () => (await api.get('/master')).data
  });

  const allocateMutation = useMutation({
    mutationFn: async (payload) => (await api.post('/admissions/allocate', payload)).data,
    onMutate: () => {
      toast.loading('Allocating seat...', { id: 'allocate' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['masterData']);
      toast.success('Seat Allocated Successfully!', { id: 'allocate' });
      setSelectedApplicant('');
      setSelectedProgram('');
    },
    onError: (err) => toast.error(`Allocation Failed: ${err.response?.data?.error || err.message}`, { id: 'allocate' })
  });

  // Backend returned array for applicants if no limit provided
  const eligibleApplicants = (Array.isArray(applicants) ? applicants : applicants?.applicants || [])
    .filter(a => a.documentsStatus === 'Verified') || [];
    
  const selectedAppDetails = eligibleApplicants.find(a => a._id === selectedApplicant);
  
  const programQuotas = masterData?.quotas?.filter(q => q.programId._id === selectedProgram && q.isActive !== false) || [];
  const applicableQuota = selectedAppDetails 
    ? programQuotas.find(q => q.type === selectedAppDetails.quotaType) 
    : null;

  const handleAllocate = () => {
    if (!selectedApplicant || !selectedProgram) return toast.error('Please select both applicant and program');
    if (!applicableQuota) return toast.error('No valid quota configuration found');
    
    allocateMutation.mutate({
      applicantId: selectedApplicant,
      programId: selectedProgram,
      quotaType: applicableQuota.type
    });
  };

  if (appsLoading || masterLoading) return <div className="flex justify-center py-20"><div className="animate-spin h-10 w-10 border-4 border-slate-200 border-b-blue-800 rounded-full"></div></div>;

  const applicantOptions = eligibleApplicants.map(a => ({
    value: a._id,
    label: `${a.name} - ${a.marks}% [${a.quotaType}]`
  }));

  const programOptions = masterData?.programs?.filter(prog => prog.isActive !== false).map(prog => ({
    value: prog._id,
    label: `${prog.name} (${prog.courseType})`
  })) || [];

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in pb-12">
      <div>
        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center">
          <ArrowRightLeft className="mr-3 text-blue-800" size={32} />
          Secure Seat Allocation
        </h2>
        <p className="text-slate-500 mt-2">Atomic transactions ensure zero overbooking during assignment.</p>
      </div>

      <div className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/40 border border-slate-200/60 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-red-900/5 rounded-full blur-3xl -z-10 translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-900/5 rounded-full blur-3xl -z-10 -translate-x-1/2 translate-y-1/2"></div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 relative z-10">
          
          <div className="space-y-6 bg-slate-50/50 p-6 rounded-2xl border border-slate-100">
            <h3 className="text-lg font-bold text-slate-800 flex items-center">
              <span className="w-8 h-8 rounded-full bg-blue-900 text-white flex items-center justify-center text-sm mr-3 shadow-md">1</span>
              Select Verified Candidate
            </h3>
            
            <div className="z-20 relative">
              <CustomSelect 
                options={applicantOptions}
                value={selectedApplicant}
                onChange={setSelectedApplicant}
                placeholder="-- Click to Select Candidate --"
                disabled={allocateMutation.isPending}
              />

              {selectedApplicant && selectedAppDetails ? (
                <div className="mt-4 p-5 bg-gradient-to-br from-blue-900 to-slate-900 text-white rounded-xl shadow-lg border border-blue-800 animate-fade-in">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-extrabold text-lg flex items-center">
                        {selectedAppDetails.name}
                        <ShieldCheck size={16} className="ml-2 text-emerald-400" />
                      </h4>
                      <p className="text-blue-200 text-sm mt-1">{selectedAppDetails.email}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-black text-rose-400">{selectedAppDetails.marks}%</div>
                      <div className="text-xs font-bold uppercase tracking-wider text-blue-300">Merit Score</div>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-blue-800/50 flex justify-between items-center text-sm font-medium">
                    <span className="text-slate-300">Requested Quota:</span>
                    <span className="bg-white/10 px-3 py-1 rounded-full text-blue-100 border border-white/20">{selectedAppDetails.quotaType}</span>
                  </div>
                </div>
              ) : (
                <div className="mt-4 p-5 border-2 border-dashed border-slate-200 rounded-xl text-center text-slate-400 flex flex-col items-center justify-center">
                  <Users size={24} className="mb-2 opacity-50" />
                  <p className="text-sm font-medium">No candidate selected</p>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6 bg-slate-50/50 p-6 rounded-2xl border border-slate-100 z-10 relative">
            <h3 className="text-lg font-bold text-slate-800 flex items-center">
              <span className="w-8 h-8 rounded-full bg-rose-900 text-white flex items-center justify-center text-sm mr-3 shadow-md">2</span>
              Target Program & Quota
            </h3>

            <div>
              <CustomSelect
                options={programOptions}
                value={selectedProgram}
                onChange={setSelectedProgram}
                placeholder="-- Choose Target Program --"
                disabled={!selectedApplicant || allocateMutation.isPending}
              />

              {selectedProgram && applicableQuota && (
                <div className="mt-4 p-6 bg-white rounded-xl shadow-lg border border-slate-200 animate-fade-in relative overflow-hidden z-0">
                  <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${applicableQuota.filledSeats >= applicableQuota.totalSeats ? 'bg-red-600' : 'bg-green-600'}`}></div>
                  
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-bold text-slate-800">{applicableQuota.type} Availability</h4>
                    {applicableQuota.filledSeats >= applicableQuota.totalSeats ? (
                      <span className="flex items-center text-red-700 bg-red-50 font-bold text-xs uppercase px-3 py-1 rounded-full border border-red-200">
                        <AlertCircle size={14} className="mr-1" /> Exhausted
                      </span>
                    ) : (
                      <span className="flex items-center text-green-800 bg-green-50 font-bold text-xs uppercase px-3 py-1 rounded-full border border-green-200">
                        <CheckCircle2 size={14} className="mr-1" /> Available
                      </span>
                    )}
                  </div>
                  
                  <div className="flex justify-between text-sm font-semibold text-slate-600 mb-2">
                    <span>Filled: {applicableQuota.filledSeats}</span>
                    <span>Total: {applicableQuota.totalSeats}</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden ring-1 ring-inset ring-slate-200">
                    <div className={`h-full transition-all duration-500 rounded-full ${applicableQuota.filledSeats >= applicableQuota.totalSeats ? 'bg-red-600' : 'bg-green-600'}`} 
                         style={{ width: `${Math.min((applicableQuota.filledSeats / applicableQuota.totalSeats) * 100, 100)}%` }}></div>
                  </div>
                </div>
              )}

              {selectedProgram && !applicableQuota && selectedApplicant && (
                 <div className="mt-4 p-4 bg-red-50 border border-red-200 text-red-800 rounded-xl text-sm font-medium flex items-center animate-fade-in text-center z-0">
                   <AlertCircle size={18} className="mr-2 flex-shrink-0" />
                   Invalid config: No '{selectedAppDetails.quotaType}' quota seats configured for this exact program.
                 </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-200 flex justify-end z-0 relative">
          <button 
            onClick={handleAllocate}
            disabled={allocateMutation.isPending || !applicableQuota || applicableQuota.filledSeats >= applicableQuota.totalSeats}
            className="group relative overflow-hidden flex items-center bg-gradient-to-r from-blue-900 to-slate-900 hover:from-blue-800 hover:to-slate-800 text-white font-bold py-3 px-8 rounded-xl shadow-xl shadow-blue-900/30 transition-all hover:-translate-y-1 disabled:opacity-50 disabled:hover:translate-y-0 disabled:cursor-not-allowed"
          >
            {allocateMutation.isPending ? (
              <span className="flex items-center"><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-3"></div> Processing Atomic Lock...</span>
            ) : (
              <span className="flex items-center">
                Lock Seat Allocation
                <ArrowRightLeft className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SeatAllocation;
