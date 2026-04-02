import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Activity, CheckCircle, Clock, AlertCircle, Star, RotateCcw, Calendar, ShieldAlert } from 'lucide-react';
import { trackComplaint, submitFeedback, reopenComplaint } from '../services/api';

const ComplaintTracker = () => {
  const [complaintId, setComplaintId] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Feedback states
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [fbStatus, setFbStatus] = useState(''); // 'success' | 'error' | ''
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  // Reopen states
  const [reopenReason, setReopenReason] = useState('');
  const [showReopenForm, setShowReopenForm] = useState(false);
  const [reopening, setReopening] = useState(false);

  const handleTrack = async (e) => {
    if (e) e.preventDefault();
    if (!complaintId) return;

    setLoading(true);
    setError('');
    setResult(null);
    setFbStatus('');
    setRating(0);
    setFeedback('');

    try {
      const { data } = await trackComplaint(complaintId.trim());
      setResult(data);
      if (data.rating) setRating(data.rating);
      if (data.feedback) setFeedback(data.feedback);
    } catch (err) {
      setError(err.response?.data?.message || 'Complaint not found. Please verify your tracking ID.');
    } finally {
      setLoading(false);
    }
  };

  const handleFeedbackSubmit = async () => {
    if (rating === 0) return;
    setSubmittingFeedback(true);
    try {
      await submitFeedback(result.complaintId, rating, feedback);
      setFbStatus('success');
      // Refresh to show saved feedback
      handleTrack();
    } catch (err) {
      setFbStatus('error');
    } finally {
      setSubmittingFeedback(false);
    }
  };

  const handleReopen = async () => {
    if (!reopenReason.trim()) return;
    setReopening(true);
    try {
      await reopenComplaint(result.complaintId, reopenReason);
      setShowReopenForm(false);
      setComplaintId(''); // Clear or maybe auto-track the new one?
      setResult(null);
      alert('Complaint reopened successfully. Please note your new ID provided in the confirmation.');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to reopen complaint');
    } finally {
      setReopening(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Pending': return <Clock className="w-8 h-8 text-yellow-500" />;
      case 'In Progress': return <Activity className="w-8 h-8 text-brand-400" />;
      case 'Work Done': return <ShieldAlert className="w-8 h-8 text-purple-400" />;
      case 'Completed': return <CheckCircle className="w-8 h-8 text-green-400" />;
      default: return null;
    }
  };

  const isOverdue = result?.dueDate && new Date(result.dueDate) < new Date() && result.status !== 'Completed';

  return (
    <motion.div 
       initial={{ opacity: 0, y: 20 }}
       animate={{ opacity: 1, y: 0 }}
       className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-[0_0_40px_rgba(0,0,0,0.5)] p-8 max-w-2xl w-full mx-auto"
    >
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">Track Your Status</h2>
        <p className="text-white/50 text-sm">Enter your tracking ID to view real-time resolution updates.</p>
      </div>
      
      <form onSubmit={handleTrack} className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder="e.g. CMP-2026-0001"
          className="flex-1 bg-black/40 border border-white/10 text-white px-5 py-4 rounded-2xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all placeholder:text-white/20 font-mono text-lg uppercase tracking-wider shadow-inner"
          value={complaintId}
          onChange={(e) => setComplaintId(e.target.value)}
        />
        <button
          type="submit"
          disabled={loading || !complaintId.trim()}
          className="bg-brand-600 hover:bg-brand-500 text-white px-8 py-4 rounded-2xl font-bold transition-all flex items-center justify-center min-w-[160px] disabled:bg-white/5 disabled:text-white/30 disabled:border disabled:border-white/5 shadow-brand-500/25 hover:shadow-brand-500/40 shadow-lg relative overflow-hidden group"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              <Search className="w-5 h-5 mr-2" /> Track
            </>
          )}
        </button>
      </form>

      <AnimatePresence mode="wait">
          {error && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl flex items-center justify-center gap-3 mt-6">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm font-medium">{error}</p>
            </motion.div>
          )}
      </AnimatePresence>

      <AnimatePresence>
          {result && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="mt-8 border border-white/10 rounded-2xl overflow-hidden shadow-2xl bg-black/20 backdrop-blur-md">
              <div className="bg-white/5 p-5 border-b border-white/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <span className="font-mono font-bold text-brand-300 text-lg tracking-wider bg-brand-500/10 px-3 py-1 rounded-lg border border-brand-500/20">{result.complaintId}</span>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-white/40 uppercase tracking-widest font-semibold">Priority:</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                            result.priority === 'Urgent' ? 'bg-red-500/20 text-red-400' :
                            result.priority === 'High' ? 'bg-orange-500/20 text-orange-400' :
                            result.priority === 'Medium' ? 'bg-blue-500/20 text-blue-400' :
                            'bg-gray-500/20 text-gray-400'
                        }`}>{result.priority}</span>
                    </div>
                    {isOverdue && (
                        <span className="bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded animate-pulse">OVERDUE</span>
                    )}
                </div>
              </div>
              
              <div className="p-6 md:p-8">
                <div className="flex items-center gap-6 mb-8 bg-white/5 p-4 rounded-2xl border border-white/5">
                  <div className="p-4 bg-black/40 rounded-full shadow-inner shadow-black/50 border border-white/5">
                    {getStatusIcon(result.status)}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-1">Current Status</p>
                    <p className="text-2xl font-bold capitalize text-white flex items-center gap-3">
                        {result.status}
                        {result.status === 'Pending' && <span className="flex h-3 w-3 relative"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-yellow-500"></span></span>}
                    </p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-black/20 p-5 rounded-xl border border-white/5">
                    <div>
                        <p className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-1">Expected Resolution</p>
                        <p className={`text-sm font-medium flex items-center gap-2 ${isOverdue ? 'text-red-400' : 'text-white/80'}`}>
                            <Calendar className="w-3.5 h-3.5" />
                            {new Date(result.dueDate).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                        </p>
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-1">Category</p>
                        <p className="text-sm font-medium text-white/80">{result.category}</p>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-3">Description</p>
                    <p className="text-white/70 leading-relaxed bg-white/5 p-5 rounded-2xl border border-white/5 text-sm">{result.description}</p>
                  </div>
                </div>

                {/* Status History Timeline */}
                {result.statusHistory && result.statusHistory.length > 0 && (
                  <div className="mt-8 border-t border-white/10 pt-8">
                    <p className="text-xs font-bold text-white/40 uppercase tracking-widest mb-6 flex items-center gap-2">
                        <Activity className="w-4 h-4" /> Activity History
                    </p>
                    <div className="space-y-6 ml-2">
                        {result.statusHistory.map((h, i) => (
                           <div key={i} className="relative pl-8 before:absolute before:left-0 before:top-2 before:bottom-[-24px] before:w-px before:bg-white/10 last:before:hidden">
                              <div className="absolute left-[-4px] top-1.5 w-2 h-2 rounded-full bg-brand-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                                  <p className="text-sm font-bold text-white/90">{h.status}</p>
                                  <p className="text-[10px] text-white/30 font-mono">{new Date(h.changedAt).toLocaleString()}</p>
                              </div>
                              <p className="text-xs text-white/50">By {h.changedBy}</p>
                           </div>
                        ))}
                    </div>
                  </div>
                )}
                
                {/* Completion Proof */}
                {result.completionImage && (
                    <div className="mt-8">
                        <p className="text-xs font-bold text-white/40 uppercase tracking-widest mb-3">Completion Proof</p>
                        <img src={result.completionImage} alt="Completion Proof" className="w-full h-auto rounded-2xl border border-white/10" />
                    </div>
                )}

                {/* Feedback Widget */}
                {result.status === 'Completed' && (
                    <div className="mt-8 pt-8 border-t border-white/10">
                        {result.rating ? (
                          <div className="bg-brand-500/5 p-6 rounded-2xl border border-brand-500/10">
                              <div className="flex items-center gap-1 mb-3">
                                  {[1,2,3,4,5].map(s => (
                                      <Star key={s} className={`w-5 h-5 ${s <= result.rating ? 'fill-brand-400 text-brand-400' : 'text-white/10'}`} />
                                  ))}
                              </div>
                              <p className="text-sm italic text-white/70">"{result.feedback || 'No comments left.'}"</p>
                          </div>
                        ) : fbStatus === 'success' ? (
                          <div className="bg-green-500/10 p-5 rounded-2xl border border-green-500/20 flex items-center gap-3 text-green-400">
                              <CheckCircle className="w-5 h-5" />
                              <p className="text-sm font-bold">Feedback saved! Thank you.</p>
                          </div>
                        ) : (
                          <div className="space-y-4">
                              <p className="text-sm font-bold text-brand-300">How was your experience?</p>
                              <div className="flex items-center gap-3">
                                  {[1,2,3,4,5].map(s => (
                                      <button key={s} onClick={() => setRating(s)} className="transition-transform active:scale-95">
                                          <Star className={`w-8 h-8 transition-colors ${s <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-white/10 hover:text-white/30'}`} />
                                      </button>
                                  ))}
                              </div>
                              <textarea 
                                placeholder="Any additional comments?"
                                className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-sm text-white focus:ring-2 focus:ring-brand-500 outline-none"
                                value={feedback}
                                onChange={e => setFeedback(e.target.value)}
                              />
                              <button 
                                onClick={handleFeedbackSubmit}
                                disabled={rating === 0 || submittingFeedback}
                                className="w-full bg-brand-600 hover:bg-brand-500 text-white font-bold py-3 rounded-xl disabled:opacity-30"
                              >
                                {submittingFeedback ? 'Submitting...' : 'Submit Feedback'}
                              </button>
                          </div>
                        )}

                        {/* Reopen Button */}
                        {result.isReopened ? (
                            <div className="mt-4 text-xs text-orange-400 font-bold uppercase tracking-widest text-center">
                                This complaint has been reopened as a new issue
                            </div>
                        ) : (
                          <div className="mt-6 pt-6 border-t border-white/5 text-center">
                              {!showReopenForm ? (
                                <button onClick={() => setShowReopenForm(true)} className="text-white/40 hover:text-white text-xs font-semibold flex items-center gap-2 mx-auto transition-colors">
                                    <RotateCcw className="w-3.5 h-3.5" /> Still facing issues? Reopen Complaint
                                </button>
                              ) : (
                                <div className="space-y-3 bg-red-500/5 p-4 rounded-2xl border border-red-500/10">
                                    <textarea 
                                      placeholder="Reason for reopening?"
                                      className="w-full bg-black/40 border border-red-500/20 rounded-xl p-3 text-xs text-white outline-none focus:ring-1 focus:ring-red-500"
                                      value={reopenReason}
                                      onChange={e => setReopenReason(e.target.value)}
                                    />
                                    <div className="flex gap-2">
                                        <button onClick={() => setShowReopenForm(false)} className="flex-1 text-xs text-white/50 font-bold py-2">Cancel</button>
                                        <button onClick={handleReopen} disabled={!reopenReason.trim() || reopening} className="flex-1 bg-red-600 hover:bg-red-500 text-white text-xs font-bold py-2 rounded-lg">
                                            {reopening ? 'Reopening...' : 'Confirm Reopen'}
                                        </button>
                                    </div>
                                </div>
                              )}
                          </div>
                        )}
                    </div>
                )}
              </div>
            </motion.div>
          )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ComplaintTracker;
