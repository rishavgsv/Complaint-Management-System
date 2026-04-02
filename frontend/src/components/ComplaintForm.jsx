import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { submitComplaint } from '../services/api';
import {
  Send, UploadCloud, CheckCircle, AlertCircle, ChevronRight, ChevronLeft,
  User, FileText, Image as ImageIcon, Mail, Phone, Hash, MapPin, Tag, X
} from 'lucide-react';

/* ─── CONSTANTS (defined once, at module level) ─────────────────── */
const CATEGORIES = [
  { id: 'Electrician', icon: '⚡', label: 'Electrician',   desc: 'Wiring, sockets, power cuts',    color: 'from-yellow-500/20 to-amber-500/10 border-yellow-500/40',  activeColor: 'from-yellow-500/30 to-amber-500/20 border-yellow-400 shadow-yellow-500/20' },
  { id: 'Carpenter',   icon: '🪚', label: 'Carpenter',     desc: 'Furniture, doors, wood repair',  color: 'from-orange-500/20 to-red-500/10 border-orange-500/40',    activeColor: 'from-orange-500/30 to-red-500/20 border-orange-400 shadow-orange-500/20' },
  { id: 'AC',          icon: '❄️', label: 'AC Technician', desc: 'Cooling, heating, HVAC',         color: 'from-blue-500/20 to-cyan-500/10 border-blue-500/40',        activeColor: 'from-blue-500/30 to-cyan-500/20 border-blue-400 shadow-blue-500/20' },
  { id: 'Lift',        icon: '🛗', label: 'Lift / Elevator', desc: 'Mechanical, stuck lifts',      color: 'from-purple-500/20 to-violet-500/10 border-purple-500/40',  activeColor: 'from-purple-500/30 to-violet-500/20 border-purple-400 shadow-purple-500/20' },
  { id: 'Water RO',    icon: '💧', label: 'Water / RO',    desc: 'Plumbing, drinking water, RO',   color: 'from-cyan-500/20 to-teal-500/10 border-cyan-500/40',        activeColor: 'from-cyan-500/30 to-teal-500/20 border-cyan-400 shadow-cyan-500/20' },
];

const STEPS = [
  { num: 1, label: 'Your Info',  icon: User },
  { num: 2, label: 'Issue Type', icon: FileText },
  { num: 3, label: 'Details',    icon: ImageIcon },
];

const slideVariants = {
  initial: (dir) => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
  animate: { x: 0, opacity: 1, transition: { duration: 0.32, ease: 'easeOut' } },
  exit:    (dir) => ({ x: dir > 0 ? -60 : 60, opacity: 0, transition: { duration: 0.22 } }),
};

/* ─── SUBCOMPONENTS — top-level so React never remounts them ────── */

const StepIndicator = ({ step }) => (
  <div className="mb-8 relative z-10">
    <div className="flex justify-between items-center mb-4 px-2">
      <span className="text-xs font-bold text-brand-400 uppercase tracking-widest">Step {step} of {STEPS.length}</span>
      <span className="text-xs font-semibold text-white/50">{STEPS.find(s => s.num === step)?.label}</span>
    </div>
    <div className="flex items-center justify-between w-full relative">
      {/* Background Line */}
      <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1 bg-white/5 rounded-full z-0 border border-white/5" />
      {/* Active Line */}
      <motion.div 
        className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-gradient-to-r from-brand-600 to-brand-400 rounded-full z-0 shadow-[0_0_10px_rgba(37,99,235,0.5)]"
        initial={{ width: '0%' }}
        animate={{ width: `${((step - 1) / (STEPS.length - 1)) * 100}%` }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      />
      
      {STEPS.map((s, i) => (
        <div key={s.num} className="relative z-10 flex flex-col items-center">
          <motion.div animate={{ scale: step === s.num ? 1.15 : 1 }}
            className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 shadow-xl ${
              step > s.num  ? 'bg-brand-500 border-brand-400 text-white' :
              step === s.num ? 'bg-[#1a1a1a] border-brand-500 text-brand-400 shadow-[0_0_15px_rgba(37,99,235,0.4)]' :
              'bg-[#111] border-white/10 text-white/30'}`}>
            {step > s.num ? <CheckCircle className="w-5 h-5" /> : <s.icon className="w-4 h-4" />}
          </motion.div>
        </div>
      ))}
    </div>
  </div>
);

/**
 * Field — MUST be defined outside ComplaintForm so React treats it as a
 * stable component type across re-renders. If defined inside, every keystroke
 * creates a new type, causing unmount/remount and focus loss.
 */
const Field = ({ label, name, type = 'text', placeholder, icon: Icon, autoComplete,
                 value, onChange, onBlur, error, isValid }) => (
  <div>
    <label className="flex items-center gap-1.5 text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">
      {Icon && <Icon className="w-3 h-3" />} {label}
    </label>
    <div className="relative">
      <input
        type={type}
        name={name}
        value={value}
        autoComplete={autoComplete}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={placeholder}
        className={`w-full bg-white/5 border rounded-xl text-white px-4 py-3.5 outline-none transition-all placeholder:text-white/20 text-sm ${
          error   ? 'border-red-500/60 focus:border-red-400 focus:ring-1 focus:ring-red-400/30' :
          isValid ? 'border-green-500/50 focus:border-green-400 focus:ring-1 focus:ring-green-400/30' :
                    'border-white/10 focus:border-brand-500 focus:ring-1 focus:ring-brand-500/30'
        }`}
      />
      {isValid && !error && (
        <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-400 pointer-events-none" />
      )}
    </div>
    {error && (
      <p className="text-[11px] text-red-400 mt-1.5 flex items-center gap-1">
        <AlertCircle className="w-3 h-3 flex-shrink-0" />{error}
      </p>
    )}
  </div>
);

/* ─── MAIN COMPONENT ────────────────────────────────────────────── */
const ComplaintForm = ({ preselectedCategory = '', onAddTrack = null }) => {
  const [step, setStep]           = useState(1);
  const [dir, setDir]             = useState(1);
  const [formData, setFormData]   = useState({ name: '', enrollmentNumber: '', email: '', phone: '', category: preselectedCategory, priority: 'Medium', description: '', image: null });
  const [details, setDetails]     = useState({ location: '', issueType: '' });
  const [loading, setLoading]     = useState(false);
  const [successId, setSuccessId] = useState('');
  const [error, setError]         = useState('');
  const [imagePreview, setImagePreview] = useState('');
  const [touched, setTouched]     = useState({});
  const fileRef = useRef();

  // Update category when user quick-selects from PublicHome
  useEffect(() => {
    if (preselectedCategory) {
      setFormData(prev => ({ ...prev, category: preselectedCategory }));
    }
  }, [preselectedCategory]);

  /* helpers */
  const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  const isPhone = (v) => /^\+?[0-9]{8,14}$/.test(v.replace(/\s/g, ''));

  const getError = (name) => {
    if (!touched[name]) return '';
    const v = formData[name];
    if (!v)                              return 'This field is required';
    if (name === 'email' && !isEmail(v)) return 'Enter a valid email address';
    if (name === 'phone' && !isPhone(v)) return 'Enter a valid phone number';
    return '';
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
  };
  const handleImageChange = (e) => {
    const f = e.target.files?.[0];
    if (f) { setFormData(prev => ({ ...prev, image: f })); setImagePreview(URL.createObjectURL(f)); }
  };
  const markTouched = (name) => setTouched(prev => ({ ...prev, [name]: true }));

  const isStep1Valid = formData.name && formData.enrollmentNumber && isEmail(formData.email) && isPhone(formData.phone);
  const isStep2Valid = formData.category && details.location.trim();
  const isStep3Valid = formData.description.trim().length >= 10;

  const goNext = () => { setDir(1);  setStep(p => p + 1); };
  const goBack = () => { setDir(-1); setStep(p => p - 1); };

  const handleSubmit = async () => {
    setLoading(true); setError('');
    const payload = new FormData();
    Object.entries(formData).forEach(([k, v]) => { if (k !== 'image' && v) payload.append(k, v); });
    if (formData.image) payload.append('image', formData.image);
    payload.append('details', JSON.stringify(details));
    try {
      const { data } = await submitComplaint(payload);
      setSuccessId(data.complaintId);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit. Please try again.');
    } finally { setLoading(false); }
  };

  const resetForm = () => {
    setStep(1); setDir(1); setSuccessId(''); setError(''); setImagePreview(''); setTouched({});
    setFormData({ name:'', enrollmentNumber:'', email:'', phone:'', category:preselectedCategory, priority:'Medium', description:'', image:null });
    setDetails({ location:'', issueType:'' });
  };

  const selCat = CATEGORIES.find(c => c.id === formData.category);

  /* ── SUCCESS ────────────────────────────────────────────────── */
  if (successId) return (
    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
      className="relative bg-gradient-to-br from-white/8 to-white/3 backdrop-blur-2xl border border-white/10 rounded-3xl p-10 max-w-lg w-full mx-auto text-center overflow-hidden shadow-2xl">
      <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent pointer-events-none" />
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', bounce: 0.5, delay: 0.1 }}
        className="w-24 h-24 bg-green-500/15 rounded-full flex items-center justify-center mx-auto mb-6 ring-4 ring-green-500/20 ring-offset-4 ring-offset-transparent">
        <CheckCircle className="w-12 h-12 text-green-400" />
      </motion.div>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <h2 className="text-3xl font-bold text-white mb-2">Complaint Submitted!</h2>
        <p className="text-white/50 mb-6 text-sm">Your complaint has been assigned to the {selCat?.label || ''} team. Track it anytime with your ID below.</p>
        <div className="bg-black/40 border border-white/10 p-5 rounded-2xl font-mono text-2xl text-brand-400 tracking-widest shadow-inner mb-6 select-all">{successId}</div>
        <p className="text-xs text-white/30 mb-8">Save this ID to track your complaint status online.</p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            {onAddTrack && (
                <button onClick={onAddTrack} className="w-full sm:w-auto bg-brand-600 hover:bg-brand-500 text-white font-semibold py-3 px-8 rounded-xl transition-all hover:scale-105 active:scale-95 shadow-lg shadow-brand-500/20 text-sm">
                    Track Complaint
                </button>
            )}
            <button onClick={resetForm} className="w-full sm:w-auto bg-white/10 hover:bg-white/15 border border-white/10 text-white font-semibold py-3 px-8 rounded-xl transition-all hover:scale-105 active:scale-95 text-sm">
              Submit Another
            </button>
        </div>
      </motion.div>
    </motion.div>
  );

  /* ── FORM ───────────────────────────────────────────────────── */
  return (
    <div className="relative bg-gradient-to-br from-white/8 to-white/3 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-[0_0_60px_rgba(0,0,0,0.6)] p-5 sm:p-8 max-w-2xl w-full mx-auto overflow-hidden">
      {/* ambient glows */}
      <div className="absolute -top-32 -right-32 w-64 h-64 bg-brand-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-blue-600/8 rounded-full blur-3xl pointer-events-none" />

      {/* header */}
      <div className="mb-6 relative">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-8 h-8 rounded-lg bg-brand-600/20 border border-brand-500/30 flex items-center justify-center">
            <Send className="w-4 h-4 text-brand-400" />
          </div>
          <h2 className="text-xl font-bold text-white">File a Complaint</h2>
        </div>
        <p className="text-white/40 text-sm pl-11">Your complaint will be instantly routed to the responsible team.</p>
      </div>

      <StepIndicator step={step} />

      {/* error banner */}
      <AnimatePresence>
        {error && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="bg-red-500/10 border border-red-500/20 text-red-400 p-3.5 rounded-xl flex items-center gap-3 mb-5 text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />{error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Steps */}
      <div className="relative min-h-[360px]">
        <AnimatePresence mode="wait" custom={dir}>

          {/* STEP 1 */}
          {step === 1 && (
            <motion.div key="step1" custom={dir} variants={slideVariants} initial="initial" animate="animate" exit="exit" className="space-y-5 absolute inset-0">
              <div className="mb-1">
                <h3 className="text-base font-bold text-white">Personal Details</h3>
                <p className="text-xs text-white/35 mt-0.5">We need these to link and deliver your complaint.</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Full Name" name="name" placeholder="e.g. Aisha Raza" icon={User} autoComplete="name"
                  value={formData.name} onChange={handleChange} onBlur={handleBlur}
                  error={getError('name')} isValid={!!(touched.name && formData.name && !getError('name'))} />
                <Field label="Enrollment No." name="enrollmentNumber" placeholder="e.g. 22B-7501-CS" icon={Hash} autoComplete="off"
                  value={formData.enrollmentNumber} onChange={handleChange} onBlur={handleBlur}
                  error={getError('enrollmentNumber')} isValid={!!(touched.enrollmentNumber && formData.enrollmentNumber && !getError('enrollmentNumber'))} />
                <Field label="Email Address" name="email" type="email" placeholder="you@university.edu" icon={Mail} autoComplete="email"
                  value={formData.email} onChange={handleChange} onBlur={handleBlur}
                  error={getError('email')} isValid={!!(touched.email && isEmail(formData.email))} />
                <Field label="Phone Number" name="phone" type="tel" placeholder="+92 300 1234567" icon={Phone} autoComplete="tel"
                  value={formData.phone} onChange={handleChange} onBlur={handleBlur}
                  error={getError('phone')} isValid={!!(touched.phone && isPhone(formData.phone))} />
              </div>
            </motion.div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <motion.div key="step2" custom={dir} variants={slideVariants} initial="initial" animate="animate" exit="exit" className="space-y-4 absolute inset-0 overflow-y-auto pr-1">
              <div className="mb-1">
                <h3 className="text-base font-bold text-white">What's the Issue?</h3>
                <p className="text-xs text-white/35 mt-0.5">Pick a trade — we'll auto-route to the right technician.</p>
              </div>
              <div className="grid grid-cols-1 min-[450px]:grid-cols-2 sm:grid-cols-3 gap-3">
                {CATEGORIES.map(cat => {
                  const isActive = formData.category === cat.id;
                  return (
                    <button key={cat.id} type="button"
                      onClick={() => setFormData(prev => ({ ...prev, category: cat.id }))}
                      className={`relative flex flex-col items-center gap-2 p-4 rounded-2xl border bg-gradient-to-br transition-all duration-200 cursor-pointer text-center ${
                        isActive ? `${cat.activeColor} shadow-xl scale-[1.03]` : `${cat.color} hover:scale-[1.02] hover:border-white/30`
                      }`}>
                      <span className="text-2xl">{cat.icon}</span>
                      <span className="text-sm font-bold text-white">{cat.label}</span>
                      <span className="text-[10px] text-white/45 leading-tight">{cat.desc}</span>
                      {isActive && (
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                          className="absolute -top-2 -right-2 w-5 h-5 bg-brand-500 rounded-full flex items-center justify-center shadow-md">
                          <CheckCircle className="w-3 h-3 text-white" />
                        </motion.div>
                      )}
                    </button>
                  );
                })}
              </div>

              <AnimatePresence>
                {formData.category && (
                  <motion.div key="loc-fields" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                    className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white/5 border border-white/10 rounded-2xl p-4 mt-4">
                    <div>
                      <label className="flex items-center gap-1.5 text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">
                        <MapPin className="w-3 h-3" /> Location / Block
                      </label>
                      <input value={details.location} onChange={e => setDetails(p => ({ ...p, location: e.target.value }))}
                        className="w-full bg-white/5 border border-white/10 focus:border-brand-500 focus:ring-1 focus:ring-brand-500/30 rounded-xl text-white px-4 py-3 outline-none text-sm placeholder:text-white/20 transition-all"
                        placeholder="e.g. Block-C, Room 301" />
                    </div>
                    <div>
                      <label className="flex items-center gap-1.5 text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">
                        <AlertCircle className="w-3 h-3" /> Priority Level
                      </label>
                      <select name="priority" value={formData.priority} onChange={handleChange}
                        className="w-full bg-white/5 border border-white/10 focus:border-brand-500 focus:ring-1 focus:ring-brand-500/30 rounded-xl text-white px-4 py-3 outline-none text-sm placeholder:text-white/20 transition-all appearance-none cursor-pointer">
                        <option value="Low" className="bg-gray-900">Low (Routine)</option>
                        <option value="Medium" className="bg-gray-900">Medium (Important)</option>
                        <option value="High" className="bg-gray-900">High (Urgent)</option>
                        <option value="Urgent" className="bg-gray-900">Urgent (Emergency)</option>
                      </select>
                    </div>
                    <div className="sm:col-span-2">
                      <label className="flex items-center gap-1.5 text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">
                        <Tag className="w-3 h-3" /> Specific Issue <span className="normal-case font-normal text-white/25 ml-1">(optional)</span>
                      </label>
                      <input value={details.issueType} onChange={e => setDetails(p => ({ ...p, issueType: e.target.value }))}
                        className="w-full bg-white/5 border border-white/10 focus:border-brand-500 focus:ring-1 focus:ring-brand-500/30 rounded-xl text-white px-4 py-3 outline-none text-sm placeholder:text-white/20 transition-all"
                        placeholder={
                          formData.category === 'Electrician' ? 'e.g. Socket dead, power trip' :
                          formData.category === 'Carpenter'   ? 'e.g. Cabinet door broken' :
                          formData.category === 'AC'          ? 'e.g. No cooling, leaking unit' :
                          formData.category === 'Lift'        ? 'e.g. Stuck on 3rd floor' :
                          'e.g. RO filter not working'} />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <motion.div key="step3" custom={dir} variants={slideVariants} initial="initial" animate="animate" exit="exit" className="space-y-5 absolute inset-0">
              <div className="mb-1">
                <h3 className="text-base font-bold text-white">Describe the Problem</h3>
                <p className="text-xs text-white/35 mt-0.5">Give enough detail so the technician knows exactly what to fix.</p>
              </div>
              <div>
                <label className="flex items-center gap-1.5 text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">
                  <FileText className="w-3 h-3" /> Description
                  <span className="normal-case font-normal text-white/25 ml-1">(min. 10 chars)</span>
                </label>
                <textarea name="description" value={formData.description} onChange={handleChange}
                  rows={4} placeholder="e.g. The main power socket near my study table in Block-C Room 301 stopped working yesterday. The entire strip is dead…"
                  className={`w-full bg-white/5 border rounded-xl text-white px-4 py-3.5 outline-none transition-all placeholder:text-white/20 text-sm resize-none ${
                    formData.description.length >= 10
                      ? 'border-green-500/50 focus:border-green-400 focus:ring-1 focus:ring-green-400/30'
                      : 'border-white/10 focus:border-brand-500 focus:ring-1 focus:ring-brand-500/30'
                  }`} />
                <div className="flex items-center justify-between mt-1.5">
                  {formData.description.length > 0 && formData.description.length < 10 && (
                    <p className="text-[11px] text-yellow-400 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />Minimum 10 characters ({formData.description.length}/10)
                    </p>
                  )}
                  <span className={`text-[10px] ml-auto ${formData.description.length >= 10 ? 'text-green-400' : 'text-white/25'}`}>
                    {formData.description.length} chars
                  </span>
                </div>
              </div>

              <div>
                <label className="flex items-center gap-1.5 text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">
                  <ImageIcon className="w-3 h-3" /> Attach Photo Evidence
                  <span className="normal-case font-normal text-white/25 ml-1">(optional)</span>
                </label>
                {imagePreview ? (
                  <div className="relative rounded-xl overflow-hidden border border-brand-500/30 group">
                    <img src={imagePreview} alt="Preview" className="w-full h-40 object-cover" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button type="button" onClick={() => { setFormData(p => ({ ...p, image: null })); setImagePreview(''); }}
                        className="bg-red-500/80 text-white rounded-full p-2 hover:bg-red-500 transition-colors">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="absolute bottom-2 left-3 bg-black/60 backdrop-blur-sm text-white text-[10px] px-2 py-1 rounded-full">Hover to remove</div>
                  </div>
                ) : (
                  <label onClick={() => fileRef.current.click()}
                    className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-white/15 rounded-xl cursor-pointer hover:border-brand-500/50 hover:bg-brand-500/5 transition-all group">
                    <UploadCloud className="w-8 h-8 text-white/20 group-hover:text-brand-400 transition-colors mb-2" />
                    <p className="text-sm text-white/35 group-hover:text-white/60 transition-colors">Click to upload a photo</p>
                    <p className="text-[10px] text-white/20 mt-1">JPG, PNG, WebP — max 10MB, auto-compressed</p>
                  </label>
                )}
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className={`flex gap-3 mt-6 pt-5 border-t border-white/8 ${step === 1 ? 'justify-end' : 'justify-between'}`}>
        {step > 1 && (
          <button type="button" onClick={goBack}
            className="flex items-center gap-2 px-5 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white rounded-xl text-sm font-medium transition-all">
            <ChevronLeft className="w-4 h-4" /> Back
          </button>
        )}
        {step < 3 ? (
          <button type="button" onClick={goNext}
            disabled={step === 1 ? !isStep1Valid : !isStep2Valid}
            className="flex items-center gap-2 px-6 py-3 bg-brand-600 hover:bg-brand-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-brand-600/25 active:scale-95">
            Continue <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button type="button" onClick={handleSubmit}
            disabled={!isStep3Valid || loading}
            className="flex items-center gap-2 px-7 py-3 bg-gradient-to-r from-brand-600 to-blue-600 hover:from-brand-500 hover:to-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-blue-600/25 active:scale-95">
            {loading ? (
              <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Submitting...</>
            ) : (
              <><Send className="w-4 h-4" /> Submit Complaint</>
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default ComplaintForm;
