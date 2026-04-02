import React, { useEffect, useState } from 'react';
import { getWorkerComplaints, updateStatus, addComment } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { LogOut, Search, Clock, MessageSquare, Briefcase } from 'lucide-react';

const AuthorityDashboard = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [commentText, setCommentText] = useState('');

  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    if (!user || (user.role !== 'Worker' && user.role !== 'Admin')) {
      navigate('/login');
      return;
    }
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      const { data } = await getWorkerComplaints();
      setComplaints(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await updateStatus(id, newStatus);
      fetchComplaints();
      if (selectedComplaint?._id === id) {
          setSelectedComplaint(prev => ({...prev, status: newStatus}));
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleAddComment = async (e) => {
      e.preventDefault();
      if(!commentText.trim() || !selectedComplaint) return;
      try {
          await addComment(selectedComplaint._id, commentText);
          setCommentText('');
          fetchComplaints();
          // Ideally fetch single complaint details to update local state cleanly
          setSelectedComplaint(prev => ({
              ...prev, 
              comments: [...prev.comments, { text: commentText, name: user.name, role: user.role, createdAt: new Date() }]
          }));
      } catch (err) {
          console.error(err);
      }
  }

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-72 bg-white border-r border-gray-200 flex flex-col fixed inset-y-0 shadow-sm z-10">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <h1 className="text-xl font-bold text-gray-900 tracking-tight flex items-center gap-2"><Briefcase className="w-5 h-5 text-brand-600"/> Workspace</h1>
        </div>
        
        <div className="p-6 border-b border-gray-100 bg-brand-50/50">
            <p className="text-sm text-gray-500 font-medium">Authority</p>
            <p className="text-lg font-bold text-gray-900">{user?.name}</p>
            <span className="inline-block mt-2 px-3 py-1 bg-brand-100 text-brand-700 text-xs font-bold uppercase rounded-full tracking-wider">{user?.department} Dept</span>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest px-2 mb-4">Assigned Tickets ({complaints.length})</p>
            {loading ? (
                <div className="p-4 text-center text-gray-400">Loading...</div>
            ) : complaints.map(c => (
                <button 
                  key={c._id}
                  onClick={() => setSelectedComplaint(c)}
                  className={`w-full text-left p-4 rounded-xl transition-all border ${selectedComplaint?._id === c._id ? 'bg-brand-50 border-brand-200 shadow-sm' : 'bg-white border-transparent hover:bg-gray-50'}`}
                >
                    <div className="flex justify-between items-start mb-2">
                        <span className="font-bold text-gray-900 text-sm">{c.complaintId}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${c.status === 'Resolved' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{c.status}</span>
                    </div>
                    <p className="text-xs text-gray-500 line-clamp-2">{c.description}</p>
                </button>
            ))}
        </div>

        <div className="p-4 border-t border-gray-100">
          <button onClick={handleLogout} className="flex items-center justify-center w-full text-gray-600 hover:text-red-500 hover:bg-red-50 transition-colors p-3 rounded-xl font-medium">
            <LogOut className="w-4 h-4 mr-2" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Pane */}
      <main className="flex-1 ml-72 p-8">
        {selectedComplaint ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 max-w-4xl mx-auto overflow-hidden flex flex-col h-[calc(100vh-4rem)]">
                <div className="p-6 border-b border-gray-100 flex justify-between items-start bg-gray-50/50">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-1">{selectedComplaint.complaintId}</h2>
                        <p className="text-gray-500 text-sm">Submitted by {selectedComplaint.name} ({selectedComplaint.enrollmentNumber})</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Update Status</span>
                        <select 
                            value={selectedComplaint.status}
                            onChange={(e) => handleUpdateStatus(selectedComplaint._id, e.target.value)}
                            className="bg-white border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-brand-500 focus:border-brand-500 block w-full p-2.5 font-bold shadow-sm"
                        >
                            <option value="Pending">Pending</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Resolved">Resolved</option>
                        </select>
                    </div>
                </div>
                
                <div className="flex-1 overflow-y-auto p-8 flex flex-col pb-32">
                    <div className="bg-brand-50/50 rounded-xl p-6 border border-brand-100 mb-8">
                        <h3 className="text-sm font-bold text-brand-900 uppercase tracking-wider mb-3">Issue Description</h3>
                        <p className="text-gray-800 leading-relaxed bg-white p-4 rounded-lg shadow-sm border border-brand-50">{selectedComplaint.description}</p>
                    </div>

                    <div className="space-y-6">
                        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2"><MessageSquare className="w-4 h-4" /> Discussion Thread</h3>
                        {selectedComplaint.comments?.map((comment, idx) => (
                            <div key={idx} className={`flex ${comment.role === 'Authority' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] p-4 rounded-2xl ${comment.role === 'Authority' ? 'bg-brand-600 text-white rounded-tr-none' : 'bg-gray-100 text-gray-800 rounded-tl-none'}`}>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className={`text-xs font-bold ${comment.role === 'Authority' ? 'text-brand-200' : 'text-gray-500'}`}>{comment.name}</span>
                                        <span className={`text-[10px] px-1.5 py-0.5 rounded-sm ${comment.role === 'Authority' ? 'bg-brand-700' : 'bg-gray-200 text-gray-500'}`}>{comment.role}</span>
                                    </div>
                                    <p className="text-sm leading-relaxed">{comment.text}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="absolute bottom-10 inset-x-0 w-full max-w-4xl mx-auto px-6">
                    <form onSubmit={handleAddComment} className="bg-white border border-gray-200 shadow-xl rounded-2xl p-2 flex gap-2">
                        <input 
                            type="text" 
                            value={commentText}
                            onChange={e => setCommentText(e.target.value)}
                            placeholder="Type an update or comment..." 
                            className="flex-1 px-4 py-3 outline-none text-gray-700 bg-transparent"
                        />
                        <button type="submit" className="bg-brand-600 hover:bg-brand-700 text-white px-6 py-3 rounded-xl font-bold transition-colors">Send</button>
                    </form>
                </div>
            </div>
        ) : (
            <div className="h-full flex flex-col items-center justify-center text-gray-400">
                <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                    <Search className="w-10 h-10 text-gray-300" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No Ticket Selected</h3>
                <p>Select a ticket from the sidebar to view details and respond.</p>
            </div>
        )}
      </main>
    </div>
  );
};

export default AuthorityDashboard;
