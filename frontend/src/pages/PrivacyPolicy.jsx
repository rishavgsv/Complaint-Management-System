import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-[#070707] text-white font-sans p-6 pb-24">
      <div className="max-w-3xl mx-auto pt-10">
        <Link to="/" className="inline-flex items-center text-white/50 hover:text-white transition-colors mb-12">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
        </Link>
        
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h1 className="text-4xl font-extrabold mb-4">Privacy Policy</h1>
          <p className="text-white/50 text-sm mb-12">Last Updated: April 2026</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="prose prose-invert prose-brand max-w-none text-white/70 space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">1. Data Collection</h2>
            <p>We collect information you provide directly to us when submitting a complaint, including your name, enrollment number, contact details, and uploaded media evidence. Automatically collected data includes log information and device telemetry for debugging purposes.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">2. Use of Information</h2>
            <p>Your data is used exclusively to facilitate, track, and resolve campus maintenance issues. Contact details may be accessed by technicians and administrators to verify location details or follow up on complex resolves.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">3. Data Sharing</h2>
            <p>Under no circumstances is student information sold or shared with external third-party advertisers. Data is solely distributed internally across authorized university staff portals.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">4. Security Measures</h2>
            <p>All transmitted data is protected via industry-standard encryption protocols. Media uploads are securely stored in cloud services with strict access control limited only to credentialed system personnel.</p>
          </section>
        </motion.div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
