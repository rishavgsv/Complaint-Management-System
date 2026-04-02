/**
 * University Complaint System - API Test Suite (25 tests, 5 groups)
 * Run: node test.js
 */

const BASE = 'http://localhost:5000/api';
let adminToken = '';
let workerToken = '';
let complaintId = '';
let complaintMongoId = '';
let passed = 0;
let failed = 0;
const allResults = [];

function log(group, name, ok, detail) {
  const icon = ok ? 'PASS' : 'FAIL';
  const line = `  [${icon}] ${name}${detail ? ' -- ' + detail : ''}`;
  console.log(line);
  allResults.push({ group, name, ok, detail });
  if (ok) passed++; else failed++;
}

async function post(url, body, token) {
  const r = await fetch(BASE + url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: JSON.stringify(body)
  });
  return { status: r.status, data: await r.json().catch(() => ({})) };
}

async function get(url, token) {
  const r = await fetch(BASE + url, {
    headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) }
  });
  return { status: r.status, data: await r.json().catch(() => ({})) };
}

async function put(url, body, token) {
  const r = await fetch(BASE + url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: JSON.stringify(body)
  });
  return { status: r.status, data: await r.json().catch(() => ({})) };
}

// ── GROUP 1: Authentication ───────────────────────────────────────
async function testAuth() {
  console.log('\nGROUP 1: Authentication Tests');
  console.log('--------------------------------------------------');

  let r = await post('/auth/login', { email: 'admin@university.edu', password: 'password123' });
  adminToken = r.data?.token || '';
  log('Auth', 'TC1: Admin login with valid credentials', r.status === 200 && !!adminToken, `HTTP ${r.status}`);

  r = await post('/auth/login', { email: 'electrician@university.edu', password: 'password123' });
  workerToken = r.data?.token || '';
  log('Auth', 'TC2: Worker login with valid credentials', r.status === 200 && !!workerToken, `HTTP ${r.status}, role=${r.data?.role}`);

  r = await post('/auth/login', { email: 'admin@university.edu', password: 'wrongpassword' });
  log('Auth', 'TC3: Login rejected with wrong password', r.status === 401, `HTTP ${r.status}`);

  r = await post('/auth/login', { email: 'ghost@university.edu', password: 'password123' });
  log('Auth', 'TC4: Login rejected for non-existent user', r.status === 401, `HTTP ${r.status}`);

  r = await post('/auth/login', {});
  log('Auth', 'TC5: Login fails with empty body', r.status >= 400, `HTTP ${r.status}`);
}

// ── GROUP 2: Complaint Submission ─────────────────────────────────
async function testSubmission() {
  console.log('\nGROUP 2: Complaint Submission Tests');
  console.log('--------------------------------------------------');

  const body = {
    name: 'Test Student',
    enrollmentNumber: 'TEST001',
    email: 'student@test.edu',
    phone: '9876543210',
    category: 'Electrician',
    description: 'Socket in room 204 not working. Entire power point is dead.',
    details: JSON.stringify({ location: 'Block A Room 204', issueType: 'Socket not working' })
  };

  let r = await fetch(`${BASE}/complaints`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  }).then(async res => ({ status: res.status, data: await res.json().catch(() => ({})) }));
  complaintId = r.data?.complaintId || '';
  log('Submission', 'TC1: Valid complaint submitted and ID returned', r.status === 201 && !!complaintId, `ID=${complaintId}`);

  r = await get(`/complaints/${complaintId}`);
  complaintMongoId = r.data?._id || '';
  log('Submission', 'TC2: Complaint retrievable by tracking ID', r.status === 200, `assigned=${!!r.data?.assignedTo}`);

  log('Submission', 'TC3: Complaint auto-assigned to worker', !!complaintMongoId && !!r.data?.assignedTo, `mongoId=${complaintMongoId}`);

  r = await fetch(`${BASE}/complaints`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Incomplete' })
  }).then(async res => ({ status: res.status, data: await res.json().catch(() => ({})) }));
  log('Submission', 'TC4: Complaint rejected when required fields missing', r.status >= 400, `HTTP ${r.status}`);

  r = await get('/complaints/INVALID-ID-99999');
  log('Submission', 'TC5: Unknown tracking ID returns 404', r.status === 404, `HTTP ${r.status}`);
}

// ── GROUP 3: Worker Endpoints ─────────────────────────────────────
async function testWorker() {
  console.log('\nGROUP 3: Worker Endpoint Tests');
  console.log('--------------------------------------------------');

  let r = await get('/complaints/worker/assigned', workerToken);
  log('Worker', 'TC1: Worker fetches own assigned complaints', r.status === 200 && Array.isArray(r.data), `count=${r.data?.length}`);

  if (complaintMongoId) {
    r = await put(`/complaints/${complaintMongoId}/status`, { status: 'In Progress' }, workerToken);
    log('Worker', 'TC2: Worker marks complaint In Progress', r.status === 200, `HTTP ${r.status}`);
  } else {
    log('Worker', 'TC2: Worker marks complaint In Progress', false, 'Skipped - no complaint ID');
  }

  if (complaintMongoId) {
    r = await put(`/complaints/${complaintMongoId}/status`, { status: 'Completed' }, workerToken);
    log('Worker', 'TC3: Worker blocked from setting Completed directly', r.status === 400, `HTTP ${r.status}`);
  } else {
    log('Worker', 'TC3: Worker blocked from setting Completed directly', false, 'Skipped');
  }

  r = await get('/complaints/worker/assigned');
  log('Worker', 'TC4: Unauthenticated request blocked on worker route', r.status === 401, `HTTP ${r.status}`);

  r = await get('/complaints/admin/all', workerToken);
  log('Worker', 'TC5: Worker token blocked from admin-only route', r.status === 403, `HTTP ${r.status}`);
}

// ── GROUP 4: Admin Endpoints ──────────────────────────────────────
async function testAdmin() {
  console.log('\nGROUP 4: Admin Endpoint Tests');
  console.log('--------------------------------------------------');

  let r = await get('/complaints/admin/all', adminToken);
  log('Admin', 'TC1: Admin fetches all complaints', r.status === 200 && Array.isArray(r.data), `count=${r.data?.length}`);

  r = await get('/complaints/admin/all', workerToken);
  log('Admin', 'TC2: Worker token rejected from admin/all (RBAC)', r.status === 403, `HTTP ${r.status}`);

  r = await get('/complaints/admin/all');
  log('Admin', 'TC3: Unauthenticated request blocked from admin/all', r.status === 401, `HTTP ${r.status}`);

  if (complaintMongoId) {
    // Force status = In Progress — complaint is NOT Work Done yet, so verify should reject
    r = await put(`/complaints/${complaintMongoId}/status`, { status: 'In Progress' }, adminToken);
    r = await put(`/complaints/${complaintMongoId}/verify`, { action: 'approve' }, adminToken);
    log('Admin', 'TC4: Verify blocked when not in Work Done status', r.status === 400, `HTTP ${r.status}, msg="${r.data?.message}"`);
  } else {
    log('Admin', 'TC4: Verify blocked when not in Work Done status', false, 'Skipped');
  }

  if (complaintMongoId) {
    r = await put(`/complaints/${complaintMongoId}/verify`, { action: 'badAction' }, adminToken);
    log('Admin', 'TC5: Invalid verify action returns 400', r.status === 400, `HTTP ${r.status}, msg="${r.data?.message}"`);
  } else {
    log('Admin', 'TC5: Invalid verify action returns 400', false, 'Skipped');
  }
}

// ── GROUP 5: Security & Edge Cases ───────────────────────────────
async function testSecurity() {
  console.log('\nGROUP 5: Security & Edge Case Tests');
  console.log('--------------------------------------------------');

  let r = await get('/complaints/admin/all', 'fake.jwt.token.here');
  log('Security', 'TC1: Forged JWT token rejected', r.status === 401, `HTTP ${r.status}`);

  r = await fetch(`${BASE}/complaints/admin/all`, {
    headers: { Authorization: 'NotBearer malformed' }
  }).then(async res => ({ status: res.status, data: await res.json().catch(() => ({})) }));
  log('Security', 'TC2: Malformed auth header rejected', r.status === 401, `HTTP ${r.status}`);

  r = await put('/complaints/000000000000000000000000/status', { status: 'In Progress' }, adminToken);
  log('Security', 'TC3: Non-existent MongoDB ID returns 404', r.status === 404, `HTTP ${r.status}`);

  if (complaintMongoId) {
    // Force Work Done via admin direct status update, then test admin approve flow
    await put(`/complaints/${complaintMongoId}/status`, { status: 'Work Done' }, adminToken);
    r = await put(`/complaints/${complaintMongoId}/verify`, { action: 'approve' }, adminToken);
    log('Security', 'TC4: Admin approves Work Done complaint successfully', r.status === 200, `HTTP ${r.status}, status=${r.data?.complaint?.status}`);
  } else {
    log('Security', 'TC4: Admin approves Work Done complaint successfully', false, 'Skipped');
  }

  if (complaintMongoId) {
    r = await put(`/complaints/${complaintMongoId}/verify`, { action: 'approve' }, workerToken);
    log('Security', 'TC5: Worker cannot call admin verify endpoint', r.status === 403, `HTTP ${r.status}`);
  } else {
    log('Security', 'TC5: Worker cannot call admin verify endpoint', false, 'Skipped');
  }
}

// ── RUNNER ────────────────────────────────────────────────────────
async function runAll() {
  console.log('');
  console.log('=======================================================');
  console.log('  UNIVERSITY COMPLAINT SYSTEM - API TEST SUITE');
  console.log('  Running 25 tests across 5 groups');
  console.log('=======================================================');

  await testAuth();
  await testSubmission();
  await testWorker();
  await testAdmin();
  await testSecurity();

  console.log('\n=======================================================');
  console.log('  RESULTS SUMMARY');
  console.log('=======================================================');
  const groups = [...new Set(allResults.map(r => r.group))];
  for (const g of groups) {
    const gr = allResults.filter(r => r.group === g);
    const gp = gr.filter(r => r.ok).length;
    console.log(`  ${g.padEnd(12)}: ${gp}/${gr.length} passed`);
  }
  console.log('-------------------------------------------------------');
  console.log(`  TOTAL       : ${passed}/${passed + failed} passed`);
  if (failed > 0) {
    console.log('\n  FAILED TESTS:');
    allResults.filter(r => !r.ok).forEach(r => console.log(`    - [${r.group}] ${r.name} (${r.detail})`));
  }
  console.log('=======================================================\n');
}

runAll().catch(err => {
  console.error('\nTest runner crashed:', err.message);
  console.log('Ensure backend is running on port 5000!\n');
  process.exit(1);
});
