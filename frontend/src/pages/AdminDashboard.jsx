import React, { useEffect, useState, useCallback } from 'react';
import { getAdminComplaints, assignComplaint, updateStatus, verifyComplaint, getWorkerStats } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis } from 'recharts';
import { LogOut, Filter, CheckCircle, Clock, Activity, AlertCircle, X, ChevronDown, Image as ImageIcon, Download, FileText, Menu, ShieldCheck, ShieldX, Search as SearchIcon, ChevronLeft, ChevronRight, Star, Calendar, ArrowRight } from 'lucide-react';
import * as XLSX from 'xlsx';

const AdminDashboard = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [filter, setFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [activeTab, setActiveTab] = useState('complaints'); // complaints | stats
  const [workerStats, setWorkerStats] = useState([]);
  
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    if (!user || user.role !== 'Admin') {
      navigate('/login');
      return;
    }
    fetchWorkerStats();
  }, [navigate]);

  useEffect(() => {
    if (user?.role === 'Admin') {
      const timer = setTimeout(() => {
        fetchComplaints();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [page, filter, searchQuery]);

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const { data } = await getAdminComplaints({
        page,
        limit: 10,
        search: searchQuery,
        category: filter === 'All' ? '' : filter
      });
      // Handle both paginated and unpaginated responses just in case
      setComplaints(data.complaints || data);
      if (data.pages) setTotalPages(data.pages);
      else setTotalPages(1);
    } catch (error) {
      console.error('Error fetching complaints:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchWorkerStats = async () => {
    try {
      const { data } = await getWorkerStats();
      setWorkerStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await updateStatus(id, newStatus);
      fetchComplaints();
      
      // Update local modal state immediately for snappier UI if modal is open
      if (selectedComplaint && selectedComplaint._id === id) {
          setSelectedComplaint(prev => ({ ...prev, status: newStatus }));
      }
    } catch (error) {
      console.error('Failed to update status', error);
    }
  };

  const handleVerify = async (id, action) => {
    try {
      await verifyComplaint(id, action);
      setSelectedComplaint(null);
      fetchComplaints();
    } catch (err) {
      console.error('Verify failed', err);
    }
  };

  const filteredComplaints = complaints; // Already filtered from server

  const handleExportExcel = () => {
    if (filteredComplaints.length === 0) return;
    
    // 1. Structure the data specifically for columns
    const excelData = filteredComplaints.map(c => ({
        'Complaint ID': c.complaintId,
        'Student Name': c.name,
        'Enrollment Number': c.enrollmentNumber,
        'Email': c.email,
        'Phone': c.phone,
        'Category': c.category,
        'Status': c.status,
        'Submitted At': new Date(c.createdAt).toLocaleString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
        'Description': c.description
    }));

    // 2. Convert raw JSON objects to an Excel Worksheet
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    
    // 3. Define basic flexible column widths
    const cols = [
        { wch: 20 }, // ID
        { wch: 25 }, // Name
        { wch: 15 }, // Enrollment
        { wch: 30 }, // Email
        { wch: 15 }, // Phone
        { wch: 15 }, // Category
        { wch: 15 }, // Status
        { wch: 25 }, // Submitted At
        { wch: 80 }  // Description
    ];
    worksheet['!cols'] = cols;

    // 4. Create Workbook and append the sheet
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Complaints Ledger");
    
    // 5. Trigger download natively
    XLSX.writeFile(workbook, `Complaints_Export_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const handleExportReport = () => {
     if (filteredComplaints.length === 0) return;
     
     const printWindow = window.open('', '_blank');
     if (!printWindow) return;

     const total = filteredComplaints.length;
     const resolved = filteredComplaints.filter(c => c.status === 'Resolved').length;
     const pending = filteredComplaints.filter(c => c.status === 'Pending').length;

     const htmlContent = `
       <html>
         <head>
           <title>Complaint Executive Report</title>
           <style>
             body { font-family: 'Inter', system-ui, sans-serif; padding: 40px; color: #333; line-height: 1.6; }
             h1 { color: #111; border-bottom: 2px solid #eee; padding-bottom: 10px; margin-bottom: 5px; }
             .summary-box { display: flex; gap: 20px; margin: 30px 0; }
             .stat-card { border: 1px solid #ddd; padding: 20px; border-radius: 8px; flex: 1; text-align: center; background: #fff; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
             .stat-card h3 { margin: 0; color: #666; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; }
             .stat-card p { margin: 10px 0 0; font-size: 32px; font-weight: bold; color: #000; }
             table { border-collapse: collapse; margin-top: 30px; width: 100%; box-shadow: 0 2px 8px rgba(0,0,0,0.05); }
             th, td { border: 1px solid #eee; padding: 16px; text-align: left; font-size: 14px; }
             th { background-color: #f8f9fa; font-weight: 700; color: #444; text-transform: uppercase; letter-spacing: 0.5px; }
             tr:nth-child(even) { background-color: #fafafa; }
             .status-Resolved { color: #10b981; font-weight: bold; }
             .status-Pending { color: #f59e0b; font-weight: bold; }
             .status-In { color: #3b82f6; font-weight: bold; }
             @media print {
                .no-print { display: none; }
                body { padding: 0; }
                .stat-card { box-shadow: none; border: 1px solid #ccc; }
                table { box-shadow: none; }
             }
           </style>
         </head>
         <body>
           <div style="display: flex; justify-content: space-between; align-items: flex-end;">
             <div>
               <h1>Executive Summary Report</h1>
               <p style="color: #666; margin: 0; font-size: 14px;"><strong>Filter Applied:</strong> ${filter} Categories</p>
             </div>
             <p style="color: #666; font-size: 14px; text-align: right;">Generated: ${new Date().toLocaleString()}</p>
           </div>
           
           <div class="summary-box">
              <div class="stat-card"><h3>Total Issues</h3><p>${total}</p></div>
              <div class="stat-card"><h3>Resolved</h3><p style="color: #10b981;">${resolved}</p></div>
              <div class="stat-card"><h3>Pending</h3><p style="color: #f59e0b;">${pending}</p></div>
           </div>

           <h2 style="margin-top: 40px; color: #222;">Detailed Issue Registry</h2>
           <table>
             <thead>
               <tr>
                 <th>Complaint ID</th>
                 <th>Student Name</th>
                 <th>Category</th>
                 <th>Status</th>
                 <th>Submitted Date</th>
               </tr>
             </thead>
             <tbody>
               ${filteredComplaints.map(c => `
                 <tr>
                   <td style="font-family: monospace; font-size: 15px;"><strong>${c.complaintId}</strong></td>
                   <td>${c.name}</td>
                   <td><span style="background: #eef2ff; color: #4f46e5; padding: 4px 8px; border-radius: 4px; font-weight: bold; font-size: 12px;">${c.category}</span></td>
                   <td class="status-${c.status.split(' ')[0]}">${c.status}</td>
                   <td>${new Date(c.createdAt).toLocaleDateString()}</td>
                 </tr>
               `).join('')}
             </tbody>
           </table>
           
           <div class="no-print" style="margin-top: 50px; text-align: center;">
             <button onclick="window.print()" style="padding: 12px 24px; background: #000; color: #fff; border: none; border-radius: 6px; cursor: pointer; font-size: 16px; font-weight: bold; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">Print to PDF</button>
           </div>
           <script>
             window.onload = () => setTimeout(() => window.print(), 500);
           </script>
         </body>
       </html>
     `;

     printWindow.document.write(htmlContent);
     printWindow.document.close();
  };

  // Analytics logic
  const categoryData = complaints.reduce((acc, curr) => {
    const existing = acc.find(item => item.name === curr.category);
    if (existing) existing.value += 1;
    else acc.push({ name: curr.category, value: 1 });
    return acc;
  }, []);

  const statusData = complaints.reduce((acc, curr) => {
    const existing = acc.find(item => item.name === curr.status);
    if (existing) existing.value += 1;
    else acc.push({ name: curr.status, value: 1 });
    return acc;
  }, []);

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

  return (
    <div className="min-h-screen bg-[#f8fafc] flex relative overflow-hidden lg:overflow-visible">
      
      {/* Mobile Drawer Backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
         className={`w-64 bg-brand-900 text-white flex flex-col fixed inset-y-0 z-40 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
            sidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
         }`}
      >
        <div className="p-6 flex justify-between items-center border-b border-brand-800">
          <span className="text-2xl font-bold tracking-tight text-white">Admin Portal</span>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1 bg-brand-800 rounded-md text-brand-200 hover:text-white transition-colors">
             <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 p-4 flex flex-col gap-2">
          <div className="mb-4 px-2 py-3 bg-brand-800/50 border border-brand-700/50 rounded-xl">
            <p className="text-xs font-semibold text-brand-200/70 uppercase tracking-widest mb-1">Logged in As</p>
            <p className="font-bold text-lg leading-tight truncate">{user?.name}</p>
          </div>
          <button 
             onClick={() => {setActiveTab('complaints'); setSidebarOpen(false);}} 
             className={`flex items-center w-full p-3 rounded-lg font-medium tracking-wide transition-colors ${activeTab === 'complaints' ? 'bg-brand-800 text-white' : 'text-brand-200 hover:text-white hover:bg-brand-800/50'}`}
          >
            <Activity className="w-5 h-5 mr-3" /> Issues Ledger
          </button>
          <button 
             onClick={() => {setActiveTab('stats'); setSidebarOpen(false);}} 
             className={`flex items-center w-full p-3 rounded-lg font-medium tracking-wide transition-colors ${activeTab === 'stats' ? 'bg-brand-800 text-white' : 'text-brand-200 hover:text-white hover:bg-brand-800/50'}`}
          >
            <Activity className="w-5 h-5 mr-3" /> Worker Perf.
          </button>
        </div>
        <div className="p-4 border-t border-brand-800/80">
          <button onClick={handleLogout} className="flex items-center text-brand-200 hover:text-white transition-colors w-full p-3 rounded-lg hover:bg-brand-800/50 font-medium tracking-wide">
            <LogOut className="w-5 h-5 mr-3" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main UI Wrapper (Responsive Margin) */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen min-w-0 max-w-full bg-transparent">
        
        {/* Mobile Header AppBar (Hidden on Desktop) */}
        <div className="lg:hidden flex items-center justify-between bg-white/90 backdrop-blur-md border-b border-gray-200/80 px-4 py-3 sticky top-0 z-20 shadow-sm">
           <h1 className="text-lg font-bold tracking-tight text-gray-900">Admin View</h1>
           <button onClick={() => setSidebarOpen(true)} className="p-2 bg-gray-100/80 border border-gray-200/60 rounded-lg text-gray-700 hover:bg-gray-200 hover:text-gray-900 transition-colors shadow-sm active:scale-95">
              <Menu className="w-5 h-5" />
           </button>
        </div>

        {/* Scrollable Main Content Box */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-x-hidden min-w-0 flex flex-col pt-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
               {activeTab === 'complaints' ? 'System Overview' : 'Worker Performance Dashboard'}
            </h1>
            <div className="flex gap-3">
                <button 
                  onClick={handleExportExcel} 
                  disabled={filteredComplaints.length === 0}
                  className="flex items-center px-4 py-2 bg-[#107c41] border border-[#107c41] text-white font-medium rounded-lg shadow-sm hover:bg-[#0c5c30] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Download className="w-4 h-4 mr-2" /> Export to Excel
                </button>
                <button 
                  onClick={handleExportReport}
                  disabled={filteredComplaints.length === 0}
                  className="flex items-center px-4 py-2 bg-brand-600 text-white font-medium rounded-lg shadow-sm shadow-brand-500/30 hover:bg-brand-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <FileText className="w-4 h-4 mr-2" /> Generate Report
                </button>
            </div>
          </div>

          {activeTab === 'stats' ? (
             <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden relative z-0">
               <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                 <h2 className="text-xl font-bold text-gray-800">Worker Analytics</h2>
               </div>
               <div className="overflow-x-auto">
                 <table className="w-full text-left text-sm">
                   <thead className="bg-gray-50 text-gray-600 border-b border-gray-100">
                     <tr>
                       <th className="px-6 py-4 font-semibold">Worker</th>
                       <th className="px-6 py-4 font-semibold">Department</th>
                       <th className="px-6 py-4 font-semibold text-center">Assigned</th>
                       <th className="px-6 py-4 font-semibold text-center">Completed</th>
                       <th className="px-6 py-4 font-semibold text-center">Avg Rating</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-gray-100">
                     {workerStats.map(ws => (
                       <tr key={ws._id} className="hover:bg-gray-50 transition-colors">
                         <td className="px-6 py-4 font-medium text-gray-900">{ws.name}</td>
                         <td className="px-6 py-4"><span className="px-3 py-1 bg-brand-100 text-brand-700 rounded-full text-xs font-bold">{ws.department}</span></td>
                         <td className="px-6 py-4 text-center font-bold text-blue-600">{ws.total}</td>
                         <td className="px-6 py-4 text-center font-bold text-green-600">{ws.completed}</td>
                         <td className="px-6 py-4">
                           <div className="flex items-center justify-center gap-1 font-bold">
                             {ws.avgRating ? <>{ws.avgRating} <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" /></> : <span className="text-gray-400">N/A</span>}
                           </div>
                         </td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               </div>
             </div>
          ) : (
             <>

        {loading ? (
          <div className="flex h-64 items-center justify-center">
             <div className="w-10 h-10 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* Analytics Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[
                { title: 'Total Issues', value: complaints.length, icon: AlertCircle, color: 'text-blue-500', bg: 'bg-blue-50' },
                { title: 'Pending', value: complaints.filter(c => c.status === 'Pending').length, icon: Clock, color: 'text-yellow-500', bg: 'bg-yellow-50' },
                { title: 'Work Done', value: complaints.filter(c => c.status === 'Work Done').length, icon: ShieldCheck, color: 'text-purple-500', bg: 'bg-purple-50' },
                { title: 'Completed', value: complaints.filter(c => c.status === 'Completed').length, icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-50' }
              ].map((stat, idx) => (
                <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">{stat.title}</p>
                    <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                  <div className={`p-4 rounded-xl ${stat.bg} ${stat.color}`}>
                    <stat.icon className="w-6 h-6" />
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-80">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Category Distribution</h3>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={categoryData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                      {categoryData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-80">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Status Distribution</h3>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={statusData}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip cursor={{fill: '#f3f4f6'}} />
                    <Bar dataKey="value" fill="#8884d8" radius={[8, 8, 0, 0]}>
                      {statusData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[(index + 1) % COLORS.length]} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Complaint List Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden relative z-0">
              <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gray-50/50">
                <h2 className="text-xl font-bold text-gray-800">All Complaints</h2>
                
                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                    {/* Search Bar */}
                    <div className="relative">
                        <SearchIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input 
                           type="text"
                           placeholder="Search ID, name..."
                           value={searchQuery}
                           onChange={e => { setSearchQuery(e.target.value); setPage(1); }}
                           className="pl-9 pr-4 py-2 w-full sm:w-64 border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
                        />
                    </div>

                    <div className="relative">
                        <select 
                            value={filter} 
                            onChange={(e) => { setFilter(e.target.value); setPage(1); }}
                            className="appearance-none flex items-center text-sm font-medium text-gray-600 bg-white pl-10 pr-8 py-2 border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-brand-500 cursor-pointer w-full"
                        >
                            <option value="All">All Categories</option>
                            <option value="Electrician">Electrician</option>
                            <option value="Carpenter">Carpenter</option>
                            <option value="AC">AC Technician</option>
                            <option value="Lift">Lift / Elevator</option>
                            <option value="Water RO">Water / RO</option>
                        </select>
                        <Filter className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                        <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 text-gray-600 border-b border-gray-100">
                    <tr>
                      <th className="px-6 py-4 font-semibold">ID</th>
                      <th className="px-6 py-4 font-semibold">Name</th>
                      <th className="px-6 py-4 font-semibold">Category / Priority</th>
                      <th className="px-6 py-4 font-semibold">Resolution ETA</th>
                      <th className="px-6 py-4 font-semibold">Status</th>
                      <th className="px-6 py-4 font-semibold">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredComplaints.length === 0 ? (
                        <tr>
                            <td colSpan="6" className="px-6 py-12 text-center text-gray-500 font-medium tracking-wide">
                                No complaints found for this filter.
                            </td>
                        </tr>
                    ) : filteredComplaints.map((c) => (
                      <tr key={c._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 font-medium text-gray-900">{c.complaintId}</td>
                        <td className="px-6 py-4">
                          <p className="font-semibold text-gray-800">{c.name}</p>
                          <p className="text-xs text-gray-500">{c.enrollmentNumber}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            c.priority === 'Urgent' ? 'bg-red-50 text-red-600 border border-red-200' :
                            c.priority === 'High' ? 'bg-orange-50 text-orange-600 border border-orange-200' :
                            c.priority === 'Low' ? 'bg-gray-50 text-gray-600 border border-gray-200' :
                            'bg-blue-50 text-blue-600 border border-blue-200'
                          }`}>
                            {c.priority}
                          </span>
                          <span className="block mt-1 text-xs text-gray-500 font-semibold">{c.category}</span>
                        </td>
                        <td className="px-6 py-4">
                          <p className={`text-xs font-semibold flex items-center gap-1 ${c.dueDate && new Date(c.dueDate) < new Date() && c.status !== 'Completed' ? 'text-red-500' : 'text-gray-600'}`}>
                            <Calendar className="w-3.5 h-3.5" />
                            {c.dueDate ? new Date(c.dueDate).toLocaleDateString() : 'N/A'}
                          </p>
                          {c.dueDate && new Date(c.dueDate) < new Date() && c.status !== 'Completed' && (
                             <span className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded font-bold uppercase mt-1 inline-block">Overdue</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                           <span className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
                              c.status === 'Completed' ? 'bg-green-100 text-green-700' :
                              c.status === 'Work Done' ? 'bg-purple-100 text-purple-700' :
                              c.status === 'In Progress' ? 'bg-blue-100 text-blue-700' :
                              'bg-yellow-100 text-yellow-700'
                           }`}>{c.status}</span>
                           {c.status === 'Work Done' && (
                             <span className="ml-2 text-[10px] font-semibold text-purple-600 animate-pulse">● Needs Review</span>
                           )}
                        </td>
                        <td className="px-6 py-4">
                          <button 
                             onClick={() => setSelectedComplaint(c)}
                             className="text-brand-600 hover:text-brand-800 font-medium border border-brand-200 bg-brand-50 hover:bg-brand-100 px-4 py-1.5 rounded-lg transition-colors"
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            
             {/* Pagination Wrapper */}
             <div className="mt-4 flex flex-col sm:flex-row items-center justify-between px-2 gap-4">
                 <p className="text-sm text-gray-500">Page {page} of {totalPages}</p>
                 <div className="flex gap-2">
                     <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 flex items-center gap-1 disabled:opacity-50"><ChevronLeft className="w-4 h-4"/> Prev</button>
                     <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages} className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 flex items-center gap-1 disabled:opacity-50">Next <ChevronRight className="w-4 h-4"/></button>
                 </div>
             </div>
             
          </>
        )}
        </>
        )}
        </main>
      </div>

      {/* Complaint Details Modal */}
      <AnimatePresence>
         {selectedComplaint && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
               {/* Backdrop */}
               <motion.div 
                 initial={{ opacity: 0 }} 
                 animate={{ opacity: 1 }} 
                 exit={{ opacity: 0 }} 
                 onClick={() => setSelectedComplaint(null)}
                 className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
               />

               {/* Modal Content */}
               <motion.div 
                 initial={{ opacity: 0, scale: 0.95, y: 20 }} 
                 animate={{ opacity: 1, scale: 1, y: 0 }} 
                 exit={{ opacity: 0, scale: 0.95, y: 20 }} 
                 className="bg-white rounded-2xl shadow-2xl z-10 w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col"
               >
                  <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50/80">
                      <div>
                        <div className="flex items-center gap-3">
                            <h2 className="text-2xl font-bold tracking-tight text-gray-900">Issue Details</h2>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                selectedComplaint.priority === 'Urgent' ? 'bg-red-50 text-red-600 border border-red-200' :
                                selectedComplaint.priority === 'High' ? 'bg-orange-50 text-orange-600 border border-orange-200' :
                                selectedComplaint.priority === 'Low' ? 'bg-gray-50 text-gray-600 border border-gray-200' :
                                'bg-blue-50 text-blue-600 border border-blue-200'
                            }`}>{selectedComplaint.priority}</span>
                        </div>
                        <p className="text-sm text-gray-500 mt-1 uppercase tracking-widest font-semibold">{selectedComplaint.complaintId}</p>
                      </div>
                      <button onClick={() => setSelectedComplaint(null)} className="p-2 bg-white rounded-full text-gray-400 hover:text-gray-700 border border-gray-200 hover:bg-gray-100 transition-colors shadow-sm">
                          <X className="w-5 h-5" />
                      </button>
                  </div>

                  <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                         {/* Personal Info Column */}
                         <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
                             <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Student Profile</h4>
                             <div className="space-y-4">
                                 <div>
                                    <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">Full Name</p>
                                    <p className="font-semibold text-gray-800">{selectedComplaint.name}</p>
                                 </div>
                                 <div className="grid grid-cols-2 gap-4">
                                     <div>
                                        <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">Enrollment</p>
                                        <p className="font-semibold text-gray-800">{selectedComplaint.enrollmentNumber}</p>
                                     </div>
                                     <div>
                                        <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">Phone</p>
                                        <p className="font-semibold text-gray-800">{selectedComplaint.phone}</p>
                                     </div>
                                 </div>
                                 <div>
                                    <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">Email</p>
                                    <p className="font-semibold text-gray-800">{selectedComplaint.email}</p>
                                 </div>
                             </div>
                         </div>

                         {/* Issue Metadata Column */}
                         <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
                             <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Complaint Vector</h4>
                             <div className="space-y-4">
                                 <div className="flex items-center justify-between border-b border-gray-200 pb-3">
                                    <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">Department Category</p>
                                    <span className="px-3 py-1 bg-brand-100 text-brand-700 rounded-lg text-xs font-bold">{selectedComplaint.category}</span>
                                 </div>
                                 
                                 <div className="flex items-center justify-between border-b border-gray-200 pb-3">
                                    <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">Current Status</p>
                                    <select 
                                         value={selectedComplaint.status}
                                         onChange={(e) => handleUpdateStatus(selectedComplaint._id, e.target.value)}
                                         className={`px-3 py-1 rounded-lg text-xs font-bold border-0 cursor-pointer outline-none focus:ring-2 ${
                                            selectedComplaint.status === 'Resolved' ? 'bg-green-100 text-green-700 ring-green-500' :
                                            selectedComplaint.status === 'In Progress' ? 'bg-blue-100 text-blue-700 ring-blue-500' :
                                            'bg-yellow-100 text-yellow-700 ring-yellow-500'
                                         }`}
                                     >
                                         <option value="Pending">Pending</option>
                                         <option value="In Progress">In Progress</option>
                                         <option value="Resolved">Resolved</option>
                                     </select>
                                 </div>

                                 <div className="grid grid-cols-2 gap-4 pt-1">
                                    {Object.entries(selectedComplaint.details || {}).map(([key, value]) => (
                                        <div key={key}>
                                           <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-1 flex items-center gap-1">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
                                           <p className="font-medium text-gray-800 capitalize bg-white px-3 py-1.5 rounded-md border border-gray-100 shadow-sm">{value}</p>
                                        </div>
                                    ))}
                                 </div>
                             </div>
                         </div>
                      </div>

                      {selectedComplaint.statusHistory && selectedComplaint.statusHistory.length > 0 && (
                          <div className="mb-8 bg-gray-50 p-5 rounded-2xl border border-gray-100">
                              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Resolution Timeline</h4>
                              <div className="space-y-4">
                                 {selectedComplaint.statusHistory.map((step, idx) => (
                                    <div key={idx} className="flex gap-4 relative">
                                        {idx !== selectedComplaint.statusHistory.length - 1 && <div className="absolute left-2 top-6 bottom-[-24px] w-[2px] bg-gray-200"></div>}
                                        <div className={`w-4 h-4 rounded-full mt-1 shrink-0 ring-4 relative z-10 ${
                                            step.status === 'Resolved' || step.status === 'Work Done' ? 'bg-green-500 ring-green-100' : 
                                            step.status === 'Pending' ? 'bg-yellow-500 ring-yellow-100' : 
                                            'bg-brand-500 ring-brand-100'
                                        }`}></div>
                                        <div className="flex-1 pb-4">
                                            <p className="font-bold text-sm text-gray-800">{step.status}</p>
                                            {step.note && <p className="text-sm text-gray-600 mt-0.5 whitespace-pre-line">{step.note}</p>}
                                            <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider mt-1">{new Date(step.timestamp).toLocaleString()}</p>
                                        </div>
                                    </div>
                                 ))}
                              </div>
                          </div>
                      )}

                      <div className="mb-8">
                         <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Written Description</h4>
                         <div className="bg-blue-50 text-blue-900 border border-blue-100 p-5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap shadow-sm">
                             {selectedComplaint.description}
                         </div>
                      </div>

                      {/* Explicitly Display the Image if present */}
                      {selectedComplaint.image && (
                          <div className="mb-8 relative group cursor-pointer overflow-hidden rounded-2xl border border-gray-200 shadow-sm" onClick={() => window.open(selectedComplaint.image, '_blank')}>
                             <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 absolute top-3 left-3 z-10 bg-white/80 px-2 py-1 rounded backdrop-blur-sm border border-gray-200">Attached Media</h4>
                             <img src={selectedComplaint.image} alt="Complaint Evidence" className="w-full h-auto object-cover max-h-96 group-hover:scale-105 transition-transform duration-500" />
                             <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                                 <span className="text-white bg-black/60 px-4 py-2 rounded-lg backdrop-blur-md flex items-center font-medium">
                                     <ImageIcon className="w-5 h-5 mr-2" /> View Original
                                 </span>
                             </div>
                          </div>
                      )}

                      {/* Completion Proof Image (Worker Upload) */}
                      {selectedComplaint.completionImage && (
                          <div className="mb-6">
                             <h4 className="text-xs font-bold text-green-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                               <ShieldCheck className="w-3.5 h-3.5" /> Worker Completion Proof
                             </h4>
                             <div className="relative group cursor-pointer overflow-hidden rounded-2xl border-2 border-green-200 shadow-sm" onClick={() => window.open(selectedComplaint.completionImage, '_blank')}>
                               <img src={selectedComplaint.completionImage} alt="Completion Proof" className="w-full h-auto object-cover max-h-80 group-hover:scale-105 transition-transform duration-500" />
                               <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                                  <span className="text-white bg-black/60 px-4 py-2 rounded-lg backdrop-blur-md flex items-center font-medium"><ImageIcon className="w-4 h-4 mr-2" /> View Full Image</span>
                               </div>
                             </div>
                          </div>
                      )}

                      {/* Admin Verify / Reject Actions */}
                      {selectedComplaint.status === 'Work Done' && (
                         <div className="border-t border-gray-100 pt-5 mt-2">
                           <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Admin Verification</p>
                           <div className="flex gap-3">
                             <button
                               onClick={() => handleVerify(selectedComplaint._id, 'approve')}
                               className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl transition-colors shadow-sm"
                             >
                               <ShieldCheck className="w-4 h-4" /> Approve & Complete
                             </button>
                             <button
                               onClick={() => handleVerify(selectedComplaint._id, 'reject')}
                               className="flex-1 flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 font-semibold py-3 rounded-xl transition-colors"
                             >
                               <ShieldX className="w-4 h-4" /> Reject & Return
                             </button>
                           </div>
                           <p className="text-xs text-gray-400 mt-3 text-center">Approving will notify the student. Rejecting will send work back to the assigned worker.</p>
                         </div>
                      )}
                      
                      <p className="text-xs text-center text-gray-400 mt-6">Submitted on {new Date(selectedComplaint.createdAt).toLocaleString()}</p>
                  </div>
               </motion.div>
            </div>
         )}
      </AnimatePresence>

    </div>
  );
};

export default AdminDashboard;
