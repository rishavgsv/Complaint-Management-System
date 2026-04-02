import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ComplaintForm from '../components/ComplaintForm';
import ComplaintTracker from '../components/ComplaintTracker';
import { 
  ShieldCheck, LogIn, Sparkles, PlusCircle, Search, 
  Activity, Zap, Clock, Smartphone, Shield, Users,
  Wrench, Droplets, Wind, ArrowRight, LayoutDashboard, CheckCircle, Mail, MapPin, Phone, ChevronRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

const CATEGORIES = [
  { id: 'Electrician', icon: <Zap className="w-8 h-8 text-yellow-500" />, label: 'Electrician',   desc: 'Wiring, sockets, power cuts',    color: 'from-yellow-500/20 to-amber-500/5 border-yellow-500/30 hover:border-yellow-400/60 shadow-yellow-500/10' },
  { id: 'Carpenter',   icon: <Wrench className="w-8 h-8 text-orange-500" />, label: 'Carpenter',     desc: 'Furniture, doors, repairs',      color: 'from-orange-500/20 to-red-500/5 border-orange-500/30 hover:border-orange-400/60 shadow-orange-500/10' },
  { id: 'AC',          icon: <Wind className="w-8 h-8 text-blue-500" />, label: 'AC Tech',        desc: 'Cooling, heating, HVAC',         color: 'from-blue-500/20 to-cyan-500/5 border-blue-500/30 hover:border-blue-400/60 shadow-blue-500/10' },
  { id: 'Lift',        icon: <Activity className="w-8 h-8 text-purple-500" />, label: 'Lift / Elevator', desc: 'Mechanical, stuck lifts',     color: 'from-purple-500/20 to-violet-500/5 border-purple-500/30 hover:border-purple-400/60 shadow-purple-500/10' },
  { id: 'Water RO',    icon: <Droplets className="w-8 h-8 text-cyan-500" />, label: 'Water / RO',    desc: 'Plumbing, drinking water',       color: 'from-cyan-500/20 to-teal-500/5 border-cyan-500/30 hover:border-cyan-400/60 shadow-cyan-500/10' },
];

const FEATURES = [
  { title: "Instant Routing", desc: "Complaints are intelligently routed to the exact department in milliseconds avoiding delays.", icon: <Zap className="w-6 h-6 text-brand-400" /> },
  { title: "Real-Time Tracking", desc: "Watch your issue progress from 'Submitted' to 'Resolved' with live status updates.", icon: <Activity className="w-6 h-6 text-brand-400" /> },
  { title: "Proof-Based Fixes", desc: "Technicians upload photo evidence of the resolved issue to guarantee transparency.", icon: <ShieldCheck className="w-6 h-6 text-brand-400" /> },
  { title: "Smart Dashboards", desc: "Dedicated portals for staff and authorities ensure no complaint slips through the cracks.", icon: <LayoutDashboard className="w-6 h-6 text-brand-400" /> },
];

const STATS = [
  { label: "Complaints Resolved", value: "12,500+" },
  { label: "Avg. Resolution Time", value: "< 4 Hours" },
  { label: "Student Satisfaction", value: "98.5%" },
];

const SmartPhone = ({ className }) => <Smartphone className={className} />;

const WORKFLOW = [
  { step: "01", title: "Submit Complaint", desc: "Quickly log your issue with location and photo evidence.", icon: <PlusCircle className="w-6 h-6" /> },
  { step: "02", title: "Auto-Assign", desc: "System instantly notifies the relevant technician via WhatsApp & Dashboard.", icon: <SmartPhone className="w-6 h-6" /> },
  { step: "03", title: "Track & Resolve", desc: "Get real-time updates until the issue is perfectly fixed.", icon: <CheckCircle className="w-6 h-6" /> },
];

const PublicHome = () => {
  const [activeTab, setActiveTab] = useState('submit');
  const [preselectedCategory, setPreselectedCategory] = useState('');
  const formRef = useRef(null);

  const handleQuickSelect = (catId) => {
    setPreselectedCategory(catId);
    setActiveTab('submit');
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleSwitchToTrack = () => {
    setActiveTab('track');
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  return (
    <div className="min-h-screen bg-[#070707] text-white selection:bg-brand-500 selection:text-white font-sans overflow-x-hidden">
      {/* Premium Navbar - Dark Glass */}
      <nav className="fixed w-full top-0 z-50 bg-[#070707]/80 backdrop-blur-xl border-b border-white/5 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3 cursor-pointer"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            >
              <div className="p-2.5 bg-gradient-to-tr from-brand-600 to-brand-400 rounded-xl shadow-[0_0_20px_rgba(37,99,235,0.3)]">
                <ShieldCheck className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">
                Resolve<span className="text-brand-400">.</span>
              </span>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <Link 
                to="/login"
                className="group flex items-center px-5 py-2.5 text-sm font-medium text-white/90 bg-white/5 hover:bg-white/10 hover:text-white rounded-full border border-white/5 hover:border-white/10 transition-all duration-300 backdrop-blur-md hover:shadow-lg hover:shadow-white/5"
                >
                <Users className="w-4 h-4 mr-2 group-hover:text-brand-400 transition-colors duration-300" /> 
                <span>Admin & Staff Login</span>
              </Link>
            </motion.div>
          </div>
        </div>
      </nav>

      {/* Dynamic Hero Section */}
      <div className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden flex flex-col justify-center border-b border-white/5">
        {/* Animated Gradient Orbs */}
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-brand-600/20 rounded-full mix-blend-screen filter blur-[140px] animate-blob pointer-events-none" />
        <div className="absolute top-1/3 right-1/4 w-[500px] h-[500px] bg-purple-600/15 rounded-full mix-blend-screen filter blur-[120px] animate-blob animation-delay-2000 pointer-events-none" />
        <div className="absolute -bottom-32 left-1/3 w-[700px] h-[700px] bg-blue-600/15 rounded-full mix-blend-screen filter blur-[140px] animate-blob animation-delay-4000 pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mt-8">
          <motion.div
             initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, ease: "easeOut" }}
             className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-brand-300 text-xs sm:text-sm font-medium mb-8 backdrop-blur-md"
          >
             <Sparkles className="w-4 h-4 text-brand-400" /> The Standard in Campus Issue Resolution
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
            className="text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-tight mb-8 leading-[1.1]"
          >
            Report, Track & Resolve <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-300 via-brand-400 to-purple-400">
               Campus Issues — All in One Place.
            </span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="text-lg md:text-xl text-white/50 max-w-3xl mx-auto mb-12 font-light leading-relaxed"
          >
            Submit complaints instantly, get real-time updates, and ensure faster resolution with automated, direct routing to responsible campus staff.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <button
              onClick={() => handleQuickSelect('')}
              className="group relative flex items-center justify-center gap-2 px-8 py-4 w-full sm:w-auto rounded-full text-base font-semibold bg-white text-black shadow-[0_0_40px_rgba(255,255,255,0.15)] hover:shadow-[0_0_60px_rgba(255,255,255,0.3)] transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
            >
              <PlusCircle className="w-5 h-5 group-hover:rotate-90 transition-transform duration-500" /> Raise a Complaint
            </button>
            <button
              onClick={handleSwitchToTrack}
              className="group relative flex items-center justify-center gap-2 px-8 py-4 w-full sm:w-auto rounded-full text-base font-semibold bg-white/5 text-white border border-white/10 hover:bg-white/10 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
            >
              <Search className="w-5 h-5 text-white/50 group-hover:text-white transition-colors duration-300" /> Track Your Complaint
            </button>
          </motion.div>
        </div>
      </div>

      {/* Trust & Credibility Section */}
      <section className="py-12 border-b border-white/5 bg-[#0a0a0a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-white/10">
            {STATS.map((stat, i) => (
              <motion.div 
                key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="pt-6 md:pt-0 pb-6 md:pb-0"
              >
                <div className="text-4xl md:text-5xl font-extrabold text-white mb-2 tracking-tight">{stat.value}</div>
                <div className="text-sm font-medium text-white/40 uppercase tracking-widest">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">How It Works</h2>
            <p className="text-white/50 max-w-2xl mx-auto">A seamless, fully transparent process from submission to completion.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
             <div className="hidden md:block absolute top-1/2 left-[10%] right-[10%] h-[1px] bg-gradient-to-r from-transparent via-brand-500/30 to-transparent -translate-y-1/2 z-0" />
             {WORKFLOW.map((item, i) => (
               <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.2 }}
                 className="relative z-10 flex flex-col items-center text-center group">
                 <div className="w-16 h-16 rounded-2xl bg-[#141414] border border-white/10 flex items-center justify-center text-brand-400 mb-6 shadow-xl group-hover:scale-110 transition-transform duration-500 group-hover:border-brand-500/50 group-hover:shadow-brand-500/20">
                   {item.icon}
                 </div>
                 <div className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                   <span className="text-xs text-brand-400 font-mono bg-brand-500/10 px-2 py-0.5 rounded-full">{item.step}</span> {item.title}
                 </div>
                 <p className="text-white/40 text-sm max-w-[250px] leading-relaxed">{item.desc}</p>
               </motion.div>
             ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-[#0a0a0a] border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-16 md:flex justify-between items-end">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Why Use Resolve?</h2>
              <p className="text-white/50 max-w-xl text-lg">We've engineered a platform that eliminates bureaucracy and prioritizes rapid action.</p>
            </div>
            <button onClick={() => handleQuickSelect('')} className="hidden md:flex items-center gap-2 text-brand-400 hover:text-brand-300 transition-colors text-sm font-semibold mt-4 md:mt-0">
              Get Started <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {FEATURES.map((feat, i) => (
              <motion.div key={i} initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.1 }}
                className="bg-[#111111] border border-white/5 p-8 rounded-3xl hover:bg-[#141414] hover:border-white/10 transition-all duration-300 flex items-start gap-5 group">
                <div className="p-3 bg-brand-500/10 rounded-xl shrink-0 group-hover:bg-brand-500/20 transition-colors">
                  {feat.icon}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">{feat.title}</h3>
                  <p className="text-white/50 leading-relaxed text-sm">{feat.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Main Form / Quick Select Area */}
      <div ref={formRef} className="relative py-24 pb-32">
         {/* Category Quick Select */}
         <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20 mb-12">
            <div className="text-center mb-8">
               <h2 className="text-2xl font-bold text-white mb-2">Quick Start</h2>
               <p className="text-white/40 text-sm">Select an issue category below to instantly begin your complaint.</p>
            </div>
            <div className="grid grid-cols-1 min-[450px]:grid-cols-2 md:grid-cols-5 gap-3 md:gap-4">
              {CATEGORIES.map((cat, i) => {
                const isSelected = preselectedCategory === cat.id;
                return (
                  <motion.button key={cat.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
                    onClick={() => handleQuickSelect(cat.id)}
                    className={`bg-gradient-to-b ${cat.color} p-4 rounded-2xl flex flex-col items-center justify-center gap-3 transition-all duration-300 group relative overflow-hidden border ${
                      isSelected 
                        ? 'ring-2 ring-brand-500 border-brand-500 shadow-[0_0_20px_rgba(37,99,235,0.4)] -translate-y-1' 
                        : 'hover:-translate-y-1'
                    }`}
                  >
                    <div className={`absolute inset-0 bg-white/5 transition-opacity ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`} />
                    <div className={`transform transition-transform duration-300 ${isSelected ? 'scale-110' : 'group-hover:scale-110'}`}>{cat.icon}</div>
                    <span className="text-sm font-bold text-white/90">{cat.label}</span>
                  </motion.button>
                );
              })}
            </div>
         </div>

         {/* Form / Tracker Component */}
         <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20">
             <div className="flex bg-[#141414] p-1.5 rounded-2xl border border-white/5 backdrop-blur-xl shadow-2xl relative max-w-xs mx-auto mb-10">
               <button onClick={() => setActiveTab('submit')} className={`flex-1 relative px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 z-10 ${activeTab === 'submit' ? 'bg-white text-black shadow-lg shadow-white/10' : 'text-white/50 hover:text-white'}`}>
                 Submit
               </button>
               <button onClick={() => setActiveTab('track')} className={`flex-1 relative px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 z-10 ${activeTab === 'track' ? 'bg-white text-black shadow-lg shadow-white/10' : 'text-white/50 hover:text-white'}`}>
                 Track
               </button>
             </div>

             <AnimatePresence mode="wait">
                {activeTab === 'submit' ? (
                    <motion.div key="submit" initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} exit={{ opacity: 0, y: -20, filter: 'blur(10px)' }} transition={{ duration: 0.4 }}>
                        <ComplaintForm preselectedCategory={preselectedCategory} onAddTrack={handleSwitchToTrack} />
                    </motion.div>
                ) : (
                    <motion.div key="track" initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} exit={{ opacity: 0, y: -20, filter: 'blur(10px)' }} transition={{ duration: 0.4 }}>
                        <ComplaintTracker />
                    </motion.div>
                )}
             </AnimatePresence>
         </div>
      </div>
      
      {/* Enhanced Footer */}
      <footer className="border-t border-white/5 bg-black pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-1.5 bg-brand-600 rounded-lg">
                  <ShieldCheck className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-white">Resolve.</span>
              </div>
              <p className="text-white/40 text-sm max-w-sm mb-6 leading-relaxed">
                The modern standard for University campus issue resolution. Elevating student experience through technology.
              </p>
              <div className="flex gap-4">
                 <a href="mailto:support@university.edu" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-all"><Mail className="w-4 h-4" /></a>
                 <a href="tel:+18001234567" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-all"><Phone className="w-4 h-4" /></a>
                 <a href="https://maps.google.com/?q=University+Campus" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-all"><MapPin className="w-4 h-4" /></a>
              </div>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Resources</h4>
              <ul className="space-y-3">
                <li><Link to="/help" className="text-white/40 hover:text-white text-sm transition-colors">Help Center</Link></li>
                <li><button onClick={handleSwitchToTrack} className="text-white/40 hover:text-white text-sm transition-colors cursor-pointer text-left">Track Complaint</button></li>
                <li><Link to="/guidelines" className="text-white/40 hover:text-white text-sm transition-colors">Student Guidelines</Link></li>
                <li><Link to="/faq" className="text-white/40 hover:text-white text-sm transition-colors">FAQ</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-3">
                <li><Link to="/privacy" className="text-white/40 hover:text-white text-sm transition-colors">Privacy Policy</Link></li>
                <li><Link to="/terms" className="text-white/40 hover:text-white text-sm transition-colors">Terms of Service</Link></li>
                <li><Link to="/login" className="text-white/40 hover:text-brand-400 text-sm transition-colors font-medium flex items-center gap-1 group">Staff Portal <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" /></Link></li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-white/30 text-sm">&copy; {new Date().getFullYear()} University Resolve. All rights reserved.</p>
            <p className="text-white/30 text-sm flex items-center gap-1">Built with <ShieldCheck className="w-3 h-3" /> by modern engineering</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PublicHome;
