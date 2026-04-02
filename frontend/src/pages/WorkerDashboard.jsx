import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { getWorkerComplaints, setInProgress, markWorkDone } from '../services/api';
import { LogOut, CheckCircle, Upload, X, Image as ImageIcon, AlertCircle, Menu } from 'lucide-react';

const categoryMeta = {
  'Electrician': { icon: '⚡', color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/20' },
  'Carpenter':   { icon: '🪚', color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/20' },
  'AC':          { icon: '❄️', color: 'text-blue-400',   bg: 'bg-blue-500/10 border-blue-500/20' },
  'Lift':        { icon: '🛗', color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20' },
  'Water RO':    { icon: '💧', color: 'text-cyan-400',   bg: 'bg-cyan-500/10 border-cyan-500/20' },
};

const statusMeta = {
  'Pending':    { color: 'bg-yellow-100 text-yellow-800', dot: 'bg-yellow-400' },
  'In Progress':{ color: 'bg-blue-100 text-blue-800',    dot: 'bg-blue-400' },
  'Work Done':  { color: 'bg-green-100 text-green-800',  dot: 'bg-green-400' },
  'Completed':  { color: 'bg-gray-100 text-gray-600',    dot: 'bg-gray-400' },
};

const WorkerDashboard = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [workDoneModal, setWorkDoneModal] = useState(null);
  const [proofImage, setProofImage] = useState(null);
  const [proofPreview, setProofPreview] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const fileRef = useRef();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    if (!user || user.role !== 'Worker') { navigate('/login'); return; }
    fetchComplaints();
  }, [navigate]);

  const fetchComplaints = async () => {
    try {
      const { data } = await getWorkerComplaints();
      setComplaints(data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  const handleSetInProgress = async (id) => {
    try { await setInProgress(id); fetchComplaints(); }
    catch (err) { console.error(err); }
  };

  const handleWorkDoneSubmit = async () => {
    if (!proofImage) { setSubmitError('Please attach a completion proof image.'); return; }
    setSubmitting(true); setSubmitError('');
    try {
      const fd = new FormData();
      fd.append('completionImage', proofImage);
      await markWorkDone(workDoneModal._id, fd);
      setWorkDoneModal(null);
      setProofImage(null); setProofPreview('');
      fetchComplaints();
    } catch (err) {
      setSubmitError(err.response?.data?.message || 'Submission failed');
    } finally { setSubmitting(false); }
  };

  const pending   = complaints.filter(c => c.status === 'Pending').length;
  const inProg    = complaints.filter(c => c.status === 'In Progress').length;
  const done      = complaints.filter(c => ['Work Done', 'Completed'].includes(c.status)).length;
  const meta      = categoryMeta[user?.department] || { icon: '🔧', color: 'text-gray-400', bg: 'bg-gray-500/10' };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex relative">
      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`w-64 bg-slate-900 text-white flex flex-col fixed inset-y-0 z-40 transform transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 border-b border-slate-800 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-bold">Worker Portal</h2>
            <p className="text-xs text-slate-400 mt-0.5">Complaint Management</p>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1 rounded bg-slate-800 text-slate-400"><X className="w-4 h-4" /></button>
        </div>
        <div className="p-4 flex-1">
          <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4 mb-6">
            <div className="text-2xl mb-2">{meta.icon}</div>
            <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold mb-1">Logged in as</p>
            <p className="font-bold text-white truncate">{user?.name}</p>
            <span className={`mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${meta.bg} ${meta.color}`}>
              {user?.department} Technician
            </span>
          </div>
          <div className="space-y-2">
            {[
              { label: 'Pending', count: pending, color: 'text-yellow-400' },
              { label: 'In Progress', count: inProg, color: 'text-blue-400' },
              { label: 'Completed', count: done, color: 'text-green-400' },
            ].map(stat => (
              <div key={stat.label} className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-slate-800/50 transition-colors">
                <span className="text-sm text-slate-400">{stat.label}</span>
                <span className={`text-sm font-bold ${stat.color}`}>{stat.count}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="p-4 border-t border-slate-800">
          <button onClick={handleLogout} className="flex items-center gap-3 text-slate-400 hover:text-white transition-colors w-full p-3 rounded-lg hover:bg-slate-800 font-medium">
            <LogOut className="w-5 h-5" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        {/* Mobile Header */}
        <div className="lg:hidden sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-gray-200 px-4 py-3 flex items-center justify-between shadow-sm">
          <h1 className="font-bold text-gray-900">Worker Dashboard</h1>
          <button onClick={() => setSidebarOpen(true)} className="p-2 bg-gray-100 rounded-lg text-gray-700">
            <Menu className="w-5 h-5" />
          </button>
        </div>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">My Assignments</h1>
            <p className="text-gray-500 mt-1">Manage your assigned complaints and upload completion proof.</p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
            </div>
          ) : complaints.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <div className="text-5xl mb-4">✅</div>
              <p className="text-lg font-medium">All clear! No assigned complaints.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {complaints.map(c => {
                const sm = statusMeta[c.status] || statusMeta['Pending'];
                const cm = categoryMeta[c.category] || { icon: '🔧', color: 'text-gray-400', bg: '' };
                return (
                  <motion.div
                    key={c._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
                  >
                    <div className="p-5">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{cm.icon}</span>
                          <div>
                            <p className="font-bold text-gray-900 text-sm">{c.category}</p>
                            <p className="text-xs text-gray-500 font-mono">{c.complaintId}</p>
                          </div>
                        </div>
                        <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${sm.color}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${sm.dot}`} />
                          {c.status}
                        </span>
                      </div>

                      {/* Location */}
                      {c.details?.location && (
                        <p className="text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2 mb-3">
                          📍 {c.details.location}
                          {c.details.issueType && <span className="text-brand-600 ml-2">— {c.details.issueType}</span>}
                        </p>
                      )}

                      {/* Description */}
                      <p className="text-sm text-gray-600 line-clamp-2 mb-4">{c.description}</p>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => setSelectedComplaint(c)}
                          className="flex-1 text-xs font-medium text-gray-600 border border-gray-200 rounded-lg py-2 hover:bg-gray-50 transition-colors"
                        >
                          View Details
                        </button>
                        {c.status === 'Pending' && (
                          <button
                            onClick={() => handleSetInProgress(c._id)}
                            className="flex-1 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded-lg py-2 hover:bg-blue-100 transition-colors"
                          >
                            Mark In Progress
                          </button>
                        )}
                        {c.status === 'In Progress' && (
                          <button
                            onClick={() => { setWorkDoneModal(c); setSubmitError(''); }}
                            className="flex-1 text-xs font-semibold text-green-700 bg-green-50 border border-green-200 rounded-lg py-2 hover:bg-green-100 transition-colors"
                          >
                            ✓ Work Done
                          </button>
                        )}
                      </div>
                    </div>
                    {c.status === 'Work Done' && (
                      <div className="bg-green-50 border-t border-green-100 px-5 py-2.5">
                        <p className="text-xs text-green-700 font-medium">⏳ Awaiting admin verification...</p>
                      </div>
                    )}
                    {c.status === 'Completed' && (
                      <div className="bg-gray-50 border-t border-gray-100 px-5 py-2.5">
                        <p className="text-xs text-gray-500 font-medium">✅ Verified & Completed</p>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          )}
        </main>
      </div>

      {/* View Details Modal */}
      <AnimatePresence>
        {selectedComplaint && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSelectedComplaint(null)} className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl z-10 w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-gray-900">Complaint Details</h3>
                  <p className="text-xs text-gray-500 font-mono">{selectedComplaint.complaintId}</p>
                </div>
                <button onClick={() => setSelectedComplaint(null)} className="p-2 border border-gray-200 rounded-full hover:bg-gray-100 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  {[
                    ['Student', selectedComplaint.name],
                    ['Enrollment', selectedComplaint.enrollmentNumber],
                    ['Category', selectedComplaint.category],
                    ['Location', selectedComplaint.details?.location || 'N/A'],
                    ['Issue Tag', selectedComplaint.details?.issueType || 'N/A'],
                    ['Submitted', new Date(selectedComplaint.createdAt).toLocaleDateString()],
                  ].map(([k, v]) => (
                    <div key={k} className="bg-gray-50 rounded-xl p-3">
                      <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold mb-1">{k}</p>
                      <p className="text-sm font-medium text-gray-800">{v}</p>
                    </div>
                  ))}
                </div>
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                  <p className="text-[11px] font-bold text-blue-600 uppercase tracking-wider mb-2">Description</p>
                  <p className="text-sm text-blue-900 leading-relaxed">{selectedComplaint.description}</p>
                </div>
                {selectedComplaint.image && (
                  <div>
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Submitted Evidence</p>
                    <img src={selectedComplaint.image} alt="Complaint evidence" className="w-full rounded-xl object-cover max-h-52 border border-gray-200" />
                  </div>
                )}
                {selectedComplaint.completionImage && (
                  <div>
                    <p className="text-[11px] font-bold text-green-500 uppercase tracking-wider mb-2">✅ Completion Proof</p>
                    <img src={selectedComplaint.completionImage} alt="Completion proof" className="w-full rounded-xl object-cover max-h-52 border border-green-200" />
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Work Done Modal */}
      <AnimatePresence>
        {workDoneModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => { setWorkDoneModal(null); setProofImage(null); setProofPreview(''); setSubmitError(''); }}
              className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl z-10 w-full max-w-md shadow-2xl overflow-hidden">
              <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-5">
                <h3 className="text-lg font-bold">Mark as Work Done</h3>
                <p className="text-sm text-white/80 mt-1">Upload photographic proof of completion. This is mandatory.</p>
              </div>
              <div className="p-6 space-y-4">
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-500 font-mono">{workDoneModal.complaintId}</p>
                  <p className="text-sm font-medium text-gray-800 mt-1">{workDoneModal.description?.substring(0, 80)}...</p>
                </div>

                {/* Image Upload */}
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-2">Completion Proof Image <span className="text-red-500">*</span></p>
                  {proofPreview ? (
                    <div className="relative rounded-xl overflow-hidden border-2 border-green-300">
                      <img src={proofPreview} alt="Preview" className="w-full h-44 object-cover" />
                      <button onClick={() => { setProofImage(null); setProofPreview(''); }}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <label onClick={() => fileRef.current.click()}
                      className="flex flex-col items-center justify-center h-36 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-green-400 hover:bg-green-50 transition-all">
                      <Upload className="w-7 h-7 text-gray-400 mb-2" />
                      <p className="text-sm text-gray-500 font-medium">Click to upload a photo</p>
                      <p className="text-xs text-gray-400 mt-1">JPG, PNG, WebP — max 10MB</p>
                    </label>
                  )}
                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => {
                    const f = e.target.files[0];
                    if (f) { setProofImage(f); setProofPreview(URL.createObjectURL(f)); }
                  }} />
                </div>

                {submitError && (
                  <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 p-3 rounded-xl text-sm">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" /> {submitError}
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <button onClick={() => { setWorkDoneModal(null); setProofImage(null); setProofPreview(''); setSubmitError(''); }}
                    className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                    Cancel
                  </button>
                  <button onClick={handleWorkDoneSubmit} disabled={submitting || !proofImage}
                    className="flex-1 py-2.5 bg-green-600 text-white rounded-xl text-sm font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                    {submitting ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                    {submitting ? 'Submitting...' : 'Submit Work Done'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default WorkerDashboard;
