import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Phone, Mail, MapPin, User, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

const CONTACTS = [
  { department: 'Campus Security', name: 'Officer John Smith', phone: '+1 (800) 123-4567', email: 'security@university.edu', type: 'Emergency' },
  { department: 'Maintenance & IT', name: 'Tech Support Desk', phone: '+1 (800) 987-6543', email: 'maintenance@university.edu', type: '24/7 Support' },
  { department: 'Hostel Administration', name: 'Mrs. Sarah Connor (Chief Warden)', phone: '+1 (800) 555-0199', email: 'warden@university.edu', type: 'Operations' },
];

const HelpCenter = () => {
  return (
    <div className="min-h-screen bg-[#070707] text-white selection:bg-brand-500 font-sans p-6 pb-24">
      <div className="max-w-4xl mx-auto pt-10">
        <Link to="/" className="inline-flex items-center text-white/50 hover:text-white transition-colors mb-12">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
        </Link>
        
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h1 className="text-4xl font-extrabold mb-4">Help Center</h1>
          <p className="text-white/50 text-lg mb-12 max-w-2xl">Need immediate assistance? Reach out to the verified campus contacts below. For regular maintenance, please use the standard complaint system.</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {CONTACTS.map((contact, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="bg-[#111111] border border-white/10 rounded-2xl p-6 hover:border-white/20 hover:bg-[#141414] transition-all"
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold text-white">{contact.department}</h3>
                <span className="text-xs font-mono px-2 py-1 rounded bg-brand-500/10 text-brand-400 border border-brand-500/20">{contact.type}</span>
              </div>
              <div className="space-y-3">
                <div className="flex items-center text-white/60"><User className="w-4 h-4 mr-3" /> {contact.name}</div>
                <div className="flex items-center text-white/60"><Phone className="w-4 h-4 mr-3" /> <a href={`tel:${contact.phone}`} className="hover:text-brand-400">{contact.phone}</a></div>
                <div className="flex items-center text-white/60"><Mail className="w-4 h-4 mr-3" /> <a href={`mailto:${contact.email}`} className="hover:text-brand-400">{contact.email}</a></div>
                <div className="flex items-center text-white/60"><Clock className="w-4 h-4 mr-3" /> Mon-Fri, 9AM - 5PM</div>
              </div>
            </motion.div>
          ))}
        </div>
        
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }} className="mt-16 bg-gradient-to-r from-brand-600/20 to-transparent p-8 rounded-2xl border border-brand-500/20">
          <h2 className="text-2xl font-bold mb-2">Central Office Location</h2>
          <p className="text-white/60 mb-4">Main Administrative Building, Room 402<br/>University Campus Central Square</p>
          <a href="https://maps.google.com" target="_blank" rel="noopener noreferrer" className="inline-flex items-center px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium transition-colors">
            <MapPin className="w-4 h-4 mr-2" /> Open Offline Map
          </a>
        </motion.div>
      </div>
    </div>
  );
};

export default HelpCenter;
