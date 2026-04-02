import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle, XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const StudentGuidelines = () => {
  return (
    <div className="min-h-screen bg-[#070707] text-white font-sans p-6 pb-24">
      <div className="max-w-3xl mx-auto pt-10">
        <Link to="/" className="inline-flex items-center text-white/50 hover:text-white transition-colors mb-12">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
        </Link>
        
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h1 className="text-4xl font-extrabold mb-4">Student Guidelines</h1>
          <p className="text-white/50 text-lg mb-12">Please read these rules carefully before raising a complaint to ensure swift processing.</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* DOS */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="bg-[#111111] border border-green-500/20 rounded-2xl p-8">
            <h2 className="text-2xl font-bold flex items-center text-green-400 mb-6"><CheckCircle className="w-6 h-6 mr-3" /> What you should do</h2>
            <ul className="space-y-4">
              <li className="flex items-start"><CheckCircle className="w-5 h-5 text-green-500/50 mr-3 shrink-0 mt-0.5"/> <span className="text-white/70">Always attach clear, well-lit photo evidence of the issue.</span></li>
              <li className="flex items-start"><CheckCircle className="w-5 h-5 text-green-500/50 mr-3 shrink-0 mt-0.5"/> <span className="text-white/70">Provide highly exact location details (e.g., "Block C, Room 304, Top left corner").</span></li>
              <li className="flex items-start"><CheckCircle className="w-5 h-5 text-green-500/50 mr-3 shrink-0 mt-0.5"/> <span className="text-white/70">Select the correct category to avoid routing delays.</span></li>
              <li className="flex items-start"><CheckCircle className="w-5 h-5 text-green-500/50 mr-3 shrink-0 mt-0.5"/> <span className="text-white/70">Check the Track tab before raising duplicate issues for the same area.</span></li>
            </ul>
          </motion.div>

          {/* DONTS */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.3 }} className="bg-[#111111] border border-red-500/20 rounded-2xl p-8">
            <h2 className="text-2xl font-bold flex items-center text-red-400 mb-6"><XCircle className="w-6 h-6 mr-3" /> What you shouldn't do</h2>
            <ul className="space-y-4">
              <li className="flex items-start"><XCircle className="w-5 h-5 text-red-500/50 mr-3 shrink-0 mt-0.5"/> <span className="text-white/70">Do not spam the system with duplicate complaints. Doing so will deprioritize your requests.</span></li>
              <li className="flex items-start"><XCircle className="w-5 h-5 text-red-500/50 mr-3 shrink-0 mt-0.5"/> <span className="text-white/70">Do not use vague descriptions like "Thing broken."</span></li>
              <li className="flex items-start"><XCircle className="w-5 h-5 text-red-500/50 mr-3 shrink-0 mt-0.5"/> <span className="text-white/70">Do not mark Low priority items as Urgent. Staff will re-categorize and issue warnings.</span></li>
              <li className="flex items-start"><XCircle className="w-5 h-5 text-red-500/50 mr-3 shrink-0 mt-0.5"/> <span className="text-white/70">Never submit complaints on behalf of undocumented areas outside your clearance.</span></li>
            </ul>
          </motion.div>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }} className="prose prose-invert max-w-none text-white/50">
          <p>The University Resolve system operates on a zero-tolerance policy against abuse. Fraudulent complaints that waste technician hours are actively monitored by the Authority dashboard. Ensure your requests are verifiable and legitimate.</p>
        </motion.div>
      </div>
    </div>
  );
};

export default StudentGuidelines;
