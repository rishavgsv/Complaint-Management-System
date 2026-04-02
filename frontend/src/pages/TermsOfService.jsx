import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-[#070707] text-white font-sans p-6 pb-24">
      <div className="max-w-3xl mx-auto pt-10">
        <Link to="/" className="inline-flex items-center text-white/50 hover:text-white transition-colors mb-12">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
        </Link>
        
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h1 className="text-4xl font-extrabold mb-4">Terms of Service</h1>
          <p className="text-white/50 text-sm mb-12">Effective Date: April 2026</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="prose prose-invert max-w-none text-white/70 space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">1. Acceptance of Terms</h2>
            <p>By accessing or utilizing the Resolve Complaint Management System, you confirm your acceptance of these operational rules and campus regulations pertaining to facility management.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">2. Proper Usage</h2>
            <p>You agree to only use the platform for reporting genuine issues within the university boundaries. Frivolous, abusive, or fake complaints are considered a breach of university code of conduct and may lead to disciplinary action.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">3. Liability</h2>
            <p>While the university strives to achieve expected SLAs (Service Level Agreements) for problem resolution, technical constraints or heavy loads might cause reasonable delays. The system does not guarantee fixed uptime for the platform itself.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">4. Media Uploads</h2>
            <p>Any photographic evidence uploaded must be relevant to the issue. Uploading inappropriate, offensive, or identifying (non-consensual) imagery is strictly prohibited.</p>
          </section>
        </motion.div>
      </div>
    </div>
  );
};

export default TermsOfService;
