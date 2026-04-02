import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';

const FAQS = [
  {
    q: "How long does it typically take to resolve a complaint?",
    a: "Standard complaints are usually resolved within 48 hours. Urgent cases (like power failures or water supply issues) are escalated to 4-hour SLA resolution times."
  },
  {
    q: "Can I update my complaint details after submission?",
    a: "Once submitted, the complaint details cannot be edited to maintain tamper-proof logs. However, you can add comments or additional information during the 'In Progress' phase."
  },
  {
    q: "How do I know my issue has been permanently fixed?",
    a: "Technicians are required to upload photo evidence of the completed work. You will be able to review this completion image in your tracking dashboard before providing feedback."
  },
  {
    q: "What if the issue persists after it's marked as 'Work Done'?",
    a: "You have the ability to re-open a complaint if the fix is unsatisfactory. The system automatically elevates re-opened complaints to higher authorities for immediate attention."
  },
  {
    q: "Are the complaint logs visible to all students?",
    a: "No. Your submissions are private and can only be viewed by you (via your tracking ID), the assigned technician, and relevant university administrative staff."
  }
];

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <div className="min-h-screen bg-[#070707] text-white selection:bg-brand-500 font-sans p-6 pb-24">
      <div className="max-w-3xl mx-auto pt-10">
        <Link to="/" className="inline-flex items-center text-white/50 hover:text-white transition-colors mb-12">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
        </Link>
        
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h1 className="text-4xl font-extrabold mb-4">Frequently Asked Questions</h1>
          <p className="text-white/50 text-lg mb-12">Find answers to the most common queries regarding the campus resolution process.</p>
        </motion.div>

        <div className="space-y-4">
          {FAQS.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: idx * 0.1 }}
                className={`border ${isOpen ? 'border-brand-500/30 bg-[#111111]' : 'border-white/10 bg-[#0a0a0a]'} rounded-xl overflow-hidden transition-colors`}
              >
                <button 
                  className="w-full text-left px-6 py-5 flex justify-between items-center focus:outline-none"
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                >
                  <span className="font-medium text-lg pr-8">{faq.q}</span>
                  <ChevronDown className={`w-5 h-5 text-white/50 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                      className="px-6 pb-5 text-white/50 leading-relaxed"
                    >
                      {faq.a}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default FAQ;
