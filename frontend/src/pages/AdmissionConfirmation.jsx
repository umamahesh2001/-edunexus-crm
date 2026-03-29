import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { CheckSquare, CreditCard, Award, FileText, CheckCircle2, ShieldCheck } from 'lucide-react';
import PaginationBar from '../components/PaginationBar';

const AdmissionConfirmation = () => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5);

  const { data, isLoading } = useQuery({
    queryKey: ['admissions', page, limit],
    queryFn: async () => (await api.get(`/admissions?page=${page}&limit=${limit}`)).data
  });

  const admissions = data?.admissions || [];
  const totalPages = data?.totalPages || 1;
  const total = data?.total || 0;

  const confirmMutation = useMutation({
    mutationFn: async (id) => (await api.post(`/admissions/${id}/confirm`, { feeStatus: 'Paid' })).data,
    onMutate: () => {
      toast.loading('Processing fee and minting unique ID...', { id: 'confirm' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admissions']);
      toast.success('Fee Paid! Immutable Admission Number Minted.', { id: 'confirm' });
    },
    onError: (err) => {
      toast.error(`Error: ${err.response?.data?.error || err.message}`, { id: 'confirm' });
    }
  });

  if (isLoading) return <div className="flex justify-center py-20"><div className="animate-spin h-10 w-10 border-4 border-slate-200 border-b-emerald-800 rounded-full"></div></div>;

  return (
    <div className="space-y-8 animate-fade-in pb-12 max-w-7xl mx-auto">
      <div>
        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center">
          <CheckSquare className="mr-3 text-emerald-800" size={32} />
          Admission Confirmation & Payments
        </h2>
        <p className="text-slate-500 mt-2">Log fee payments to permanently generate an immutable admission identifier.</p>
      </div>

      <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 overflow-hidden border border-slate-200/80 relative flex flex-col min-h-[500px]">
        <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-r from-emerald-800 via-emerald-600 to-teal-500"></div>
        
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
             <h3 className="font-bold text-slate-700">Allocated Candidates</h3>
             <p className="text-xs font-semibold text-slate-500 uppercase">Page {page} &mdash; {total} Records</p>
        </div>

        <div className="overflow-x-auto overflow-y-auto" style={{ maxHeight: '520px' }}>
          <table className="min-w-full divide-y divide-slate-100">
            <thead className="bg-slate-50/80">
              <tr>
                <th className="px-6 py-5 text-left text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center"><FileText size={14} className="mr-2"/> Candidate</th>
                <th className="px-6 py-5 text-left text-xs font-bold text-slate-500 uppercase tracking-widest"><Award size={14} className="inline"/> Seat Info</th>
                <th className="px-6 py-5 text-left text-xs font-bold text-slate-500 uppercase tracking-widest min-w-[220px]">Admit Number (Immutable)</th>
                <th className="px-6 py-5 text-left text-xs font-bold text-slate-500 uppercase tracking-widest">Status Matrix</th>
                <th className="px-6 py-5 text-right text-xs font-bold text-slate-500 uppercase tracking-widest">Action Required</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-50">
              {admissions.map(adm => {
                const pending = adm.status === 'Allocated';
                return (
                <tr key={adm._id} className={`transition-colors duration-200 hover:bg-slate-50/50 ${pending ? 'bg-white' : 'bg-emerald-50/20'}`}>
                  <td className="px-6 py-5">
                    <div className="font-extrabold text-slate-900 text-sm">{adm.applicantId?.name}</div>
                    <div className="text-xs font-medium text-slate-500 mt-1">{adm.applicantId?.email}</div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="font-bold text-slate-800 text-sm">{adm.programId?.name}</div>
                    <div className="inline-block px-2 py-0.5 rounded text-[10px] font-bold tracking-widest uppercase bg-slate-100 text-slate-600 mt-1 border border-slate-200">
                      {adm.quotaType}
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    {adm.admissionNumber ? (
                      <div className="relative group inline-block">
                        <span className="font-mono bg-emerald-900 text-emerald-100 px-3 py-1.5 rounded-lg text-sm font-bold tracking-wider shadow-inner flex items-center border border-emerald-800">
                          {adm.admissionNumber}
                          <CheckCircle2 size={14} className="ml-2 text-emerald-400" />
                        </span>
                      </div>
                    ) : (
                      <span className="inline-flex items-center text-rose-800/60 font-medium text-xs bg-rose-50 px-3 py-1.5 rounded-lg border border-rose-100 border-dashed">
                        Pending Payment Generation
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap">
                    <div className="space-y-1.5 flex flex-col items-start">
                      <span className={`px-2.5 py-1 inline-flex text-[10px] uppercase tracking-wider font-bold rounded-md border
                        ${adm.applicantId?.documentsStatus === 'Verified' ? 'bg-indigo-100 text-indigo-800 border-indigo-200' : 'bg-amber-100 text-amber-800 border-amber-200'}`}>
                        Docs: {adm.applicantId?.documentsStatus || 'Pending'}
                      </span>
                      <span className={`px-2.5 py-1 inline-flex text-[10px] uppercase tracking-wider font-bold rounded-md border
                        ${adm.status === 'Confirmed' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : 'bg-slate-100 text-slate-700 border-slate-200'}`}>
                        {adm.status}
                      </span>
                      <span className={`px-2.5 py-1 inline-flex text-[10px] uppercase tracking-wider font-bold rounded-md border
                        ${adm.feeStatus === 'Paid' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : 'bg-rose-100 text-rose-800 border-rose-200'}`}>
                        Fee: {adm.feeStatus}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-right font-medium">
                    {pending ? (
                      <button 
                        onClick={() => { confirmMutation.mutate(adm._id); }}
                        disabled={confirmMutation.isPending || adm.applicantId?.documentsStatus !== 'Verified'}
                        className="inline-flex items-center px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white text-sm font-bold rounded-xl shadow-lg shadow-emerald-900/20 transition-all hover:-translate-y-0.5 focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50 disabled:hover:translate-y-0 disabled:cursor-not-allowed"
                      >
                        {confirmMutation.isPending ? 'Processing...' : (
                          <><CreditCard size={16} className="mr-2" /> Log Payment</>
                        )}
                      </button>
                    ) : (
                      <div className="inline-flex items-center text-emerald-700 font-extrabold text-sm px-4 py-2 bg-emerald-50 rounded-xl border border-emerald-100">
                        <ShieldCheck size={18} className="mr-2 text-emerald-600" /> Confirmed
                      </div>
                    )}
                  </td>
                </tr>
              )})}
            </tbody>
          </table>
          {admissions.length === 0 && (
            <div className="p-16 text-center">
               <CheckSquare className="mx-auto h-12 w-12 text-slate-300 mb-4" />
               <h3 className="text-lg font-bold text-slate-900">No Allocations Found</h3>
               <p className="text-slate-500 mt-2">Allocate seats first or explore different pages.</p>
            </div>
          )}
        </div>

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

export default AdmissionConfirmation;
