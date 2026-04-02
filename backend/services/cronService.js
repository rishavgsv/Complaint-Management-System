import cron from 'node-cron';
import Complaint from '../models/Complaint.js';
import User from '../models/User.js';
import { sendEmail } from './emailService.js';

const startCronJobs = () => {

  // ── 1. 8:00 AM Daily Worker Briefing ────────────────────────────────────
  cron.schedule('0 8 * * *', async () => {
    console.log('[CRON] Running 8 AM Daily Worker Briefing...');
    try {
      const workers = await User.find({ role: 'Worker' });

      for (const worker of workers) {
        const pendingComplaints = await Complaint.find({
          assignedTo: worker._id,
          status: { $in: ['Pending', 'In Progress'] }
        }).sort({ createdAt: 1 });

        if (pendingComplaints.length === 0) continue;

        const rows = pendingComplaints.map(c => `
          <tr style="border-bottom:1px solid #eee;">
            <td style="padding:10px;font-family:monospace;font-weight:bold;">${c.complaintId}</td>
            <td style="padding:10px;">${c.details?.location || 'N/A'}</td>
            <td style="padding:10px;">${c.description.substring(0, 80)}...</td>
            <td style="padding:10px;">
              <span style="padding:4px 10px;border-radius:20px;font-size:12px;font-weight:bold;
                background:${c.status === 'Pending' ? '#fef3c7' : '#dbeafe'};
                color:${c.status === 'Pending' ? '#92400e' : '#1e40af'};">
                ${c.status}
              </span>
            </td>
            <td style="padding:10px;color:#6b7280;font-size:12px;">${new Date(c.createdAt).toLocaleDateString()}</td>
          </tr>`).join('');

        const html = `
          <div style="font-family:sans-serif;max-width:700px;margin:auto;">
            <div style="background:#1e3a8a;color:white;padding:24px 32px;border-radius:12px 12px 0 0;">
              <h1 style="margin:0;font-size:22px;">📋 Daily Task Briefing</h1>
              <p style="margin:6px 0 0;opacity:0.8;">Good morning, ${worker.name}! Here are your active complaints for today.</p>
            </div>
            <div style="background:#f8fafc;padding:24px 32px;">
              <p style="color:#374151;">You have <b>${pendingComplaints.length}</b> active task(s) requiring attention:</p>
              <table style="width:100%;border-collapse:collapse;background:white;border-radius:8px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
                <thead>
                  <tr style="background:#f1f5f9;color:#64748b;font-size:12px;text-transform:uppercase;">
                    <th style="padding:12px;text-align:left;">ID</th>
                    <th style="padding:12px;text-align:left;">Location</th>
                    <th style="padding:12px;text-align:left;">Description</th>
                    <th style="padding:12px;text-align:left;">Status</th>
                    <th style="padding:12px;text-align:left;">Submitted</th>
                  </tr>
                </thead>
                <tbody>${rows}</tbody>
              </table>
              <p style="margin-top:24px;color:#6b7280;font-size:13px;">Login to your dashboard to update statuses and upload completion proofs.</p>
            </div>
            <div style="background:#1e3a8a;color:rgba(255,255,255,0.6);padding:16px 32px;border-radius:0 0 12px 12px;font-size:12px;">
              University Complaint Resolution System — Automated Daily Digest
            </div>
          </div>`;

        await sendEmail(worker.email, `📋 Daily Task Briefing — ${new Date().toLocaleDateString()}`, html);
        console.log(`[CRON] Briefing sent to ${worker.name} (${pendingComplaints.length} tasks)`);
      }
      console.log('[CRON] Daily briefing completed.');
    } catch (error) {
      console.error('[CRON] Error in daily briefing:', error);
    }
  });

  // ── 2. Midnight SLA Escalation (3-day threshold) ─────────────────────────
  cron.schedule('0 0 * * *', async () => {
    console.log('[CRON] Running nightly SLA escalation sweep...');
    try {
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

      const staleComplaints = await Complaint.find({
        status: 'Pending',
        createdAt: { $lte: threeDaysAgo }
      });

      for (const complaint of staleComplaints) {
        const alreadyEscalated = complaint.comments.some(
          c => c.role === 'System' && c.text.includes('ESCALATION')
        );
        if (alreadyEscalated) continue;

        complaint.comments.push({
          text: `SYSTEM ESCALATION: Complaint ${complaint.complaintId} has exceeded the 3-day SLA without being addressed. Immediate resolution required.`,
          name: 'Auto-Bot',
          role: 'System',
          createdAt: new Date()
        });
        await complaint.save();
        console.log(`[CRON] Escalated: ${complaint.complaintId}`);
      }
      console.log('[CRON] SLA sweep completed.');
    } catch (error) {
      console.error('[CRON] Error in SLA sweep:', error);
    }
  });

  console.log('[System] Cron jobs initialized: 8 AM Daily Briefing + Midnight SLA Escalation.');
};

export default startCronJobs;
