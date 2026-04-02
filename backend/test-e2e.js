const http = require('http');

const api = (url, opts = {}) => new Promise((resolve, reject) => {
  const body = opts.body ? JSON.stringify(opts.body) : null;
  const req = http.request('http://localhost:5000/api' + url, {
    method: opts.method || 'GET',
    headers: { 'Content-Type': 'application/json', ...(opts.headers || {}) }
  }, (res) => {
    let data = '';
    res.on('data', d => data += d);
    res.on('end', () => resolve({ status: res.statusCode, data: JSON.parse(data) }));
  });
  req.on('error', reject);
  if (body) req.write(body);
  req.end();
});

(async () => {
  let passed = 0, failed = 0;
  const test = (name, condition) => {
    if (condition) { console.log('  PASS:', name); passed++; }
    else { console.log('  FAIL:', name); failed++; }
  };

  // ===== AUTHENTICATION & RBAC =====
  console.log('\n=== AUTHENTICATION & RBAC ===');
  const adminLogin = await api('/auth/login', { method: 'POST', body: { email: 'admin@edunexus.com', password: 'admin123' } });
  const adminToken = adminLogin.data.token;
  const H = { Authorization: 'Bearer ' + adminToken };
  test('Admin login succeeds', adminLogin.status === 200 && adminLogin.data.user.role === 'Admin');

  const officerLogin = await api('/auth/login', { method: 'POST', body: { email: 'officer@edunexus.com', password: 'officer123' } });
  const officerToken = officerLogin.data.token;
  const OH = { Authorization: 'Bearer ' + officerToken };
  test('Officer login succeeds', officerLogin.status === 200 && officerLogin.data.user.role === 'Admission Officer');

  const mgmtLogin = await api('/auth/login', { method: 'POST', body: { email: 'management@edunexus.com', password: 'mgmt123' } });
  const mgmtToken = mgmtLogin.data.token;
  const MH = { Authorization: 'Bearer ' + mgmtToken };
  test('Management login succeeds', mgmtLogin.status === 200 && mgmtLogin.data.user.role === 'Management');

  // RBAC Tests
  const noAuth = await api('/master');
  test('Unauthenticated request blocked (401)', noAuth.status === 401);

  const mgmtCreate = await api('/master/institutions', { method: 'POST', body: { name: 'Test' }, headers: MH });
  test('Management CANNOT create institution (403)', mgmtCreate.status === 403);

  const mgmtDash = await api('/dashboard', { headers: MH });
  test('Management CAN view dashboard (200)', mgmtDash.status === 200);

  const officerMaster = await api('/master/institutions', { method: 'POST', body: { name: 'Test' }, headers: OH });
  test('Officer CANNOT create institution (403)', officerMaster.status === 403);

  const officerApplicant = await api('/applicants', { headers: OH });
  test('Officer CAN read applicants (200)', officerApplicant.status === 200);

  const mgmtAllocate = await api('/admissions/allocate', { method: 'POST', body: {}, headers: MH });
  test('Management CANNOT allocate seats (403)', mgmtAllocate.status === 403);

  // ===== MASTER DATA & QUOTA SETUP =====
  console.log('\n=== MASTER DATA & QUOTA SETUP ===');
  const master = await api('/master', { headers: H });
  const program = master.data.programs[0];
  const quotas = master.data.quotas.filter(q => q.programId._id === program._id);

  test('Program exists with totalIntake=60', program && program.totalIntake === 60);

  const kcetQuota = quotas.find(q => q.type === 'KCET');
  const comedkQuota = quotas.find(q => q.type === 'COMEDK');
  const mgmtQuota = quotas.find(q => q.type === 'Management');

  test('KCET quota: 27 seats', kcetQuota && kcetQuota.totalSeats === 27);
  test('COMEDK quota: 18 seats', comedkQuota && comedkQuota.totalSeats === 18);
  test('Management quota: 15 seats', mgmtQuota && mgmtQuota.totalSeats === 15);

  const totalQuota = kcetQuota.totalSeats + comedkQuota.totalSeats + mgmtQuota.totalSeats;
  test('RULE 1: Total quota (27+18+15=60) equals intake (60)', totalQuota === program.totalIntake);

  // ===== RULE 1: Quota cannot exceed intake =====
  console.log('\n=== RULE 1: QUOTA CANNOT EXCEED INTAKE ===');
  const overQuota = await api('/master/quotas', {
    method: 'POST',
    body: { programId: program._id, quotas: [{ type: 'KCET', totalSeats: 100 }] },
    headers: H
  });
  test('Creating quota exceeding intake is BLOCKED', overQuota.status === 400);

  // ===== APPLICANT MANAGEMENT =====
  console.log('\n=== APPLICANT MANAGEMENT ===');
  const apps = await api('/applicants', { headers: H });
  const applicants = Array.isArray(apps.data) ? apps.data : apps.data.applicants;
  const alice = applicants.find(a => a.name === 'Alice Smith');
  const bob = applicants.find(a => a.name === 'Bob Johnson');

  test('Alice: Verified, KCET, 95%', alice && alice.documentsStatus === 'Verified' && alice.quotaType === 'KCET');
  test('Bob: Submitted (not Verified yet)', bob && bob.documentsStatus === 'Submitted');

  // ===== DOCUMENTS MUST BE VERIFIED =====
  console.log('\n=== RULE: DOCUMENTS MUST BE VERIFIED BEFORE ALLOCATION ===');
  const allocBob = await api('/admissions/allocate', {
    method: 'POST',
    body: { applicantId: bob._id, programId: program._id, quotaType: 'COMEDK', admissionMode: 'Government', allotmentNumber: 'GOV-001' },
    headers: OH
  });
  test('Unverified applicant allocation BLOCKED', allocBob.status === 400 && allocBob.data.error.includes('verified'));

  // ===== GOVERNMENT FLOW VALIDATION =====
  console.log('\n=== GOVERNMENT ADMISSION FLOW ===');

  const noAllotment = await api('/admissions/allocate', {
    method: 'POST',
    body: { applicantId: alice._id, programId: program._id, quotaType: 'KCET', admissionMode: 'Government' },
    headers: OH
  });
  test('Govt flow WITHOUT allotment number BLOCKED', noAllotment.status === 400 && noAllotment.data.error.includes('Allotment'));

  const govtMgmtQuota = await api('/admissions/allocate', {
    method: 'POST',
    body: { applicantId: alice._id, programId: program._id, quotaType: 'Management', admissionMode: 'Government', allotmentNumber: 'GOV-001' },
    headers: OH
  });
  test('Govt flow with Management quota BLOCKED', govtMgmtQuota.status === 400 && govtMgmtQuota.data.error.includes('KCET or COMEDK'));

  const govtAlloc = await api('/admissions/allocate', {
    method: 'POST',
    body: { applicantId: alice._id, programId: program._id, quotaType: 'KCET', admissionMode: 'Government', allotmentNumber: 'KCET-2026-AL-001234' },
    headers: OH
  });
  test('Valid Govt allocation succeeds (201)', govtAlloc.status === 201);
  test('admissionMode = Government', govtAlloc.data.admissionMode === 'Government');
  test('allotmentNumber stored correctly', govtAlloc.data.allotmentNumber === 'KCET-2026-AL-001234');
  test('Status = Allocated (not Confirmed yet)', govtAlloc.data.status === 'Allocated');
  test('feeStatus = Pending', govtAlloc.data.feeStatus === 'Pending');

  // ===== RULE 5: SEAT COUNTER UPDATES =====
  console.log('\n=== RULE 5: REAL-TIME SEAT COUNTER UPDATE ===');
  const masterAfter = await api('/master', { headers: H });
  const kcetAfter = masterAfter.data.quotas.find(q => q._id === kcetQuota._id);
  test('KCET filledSeats incremented to 1', kcetAfter.filledSeats === 1);

  // ===== DUPLICATE ALLOCATION BLOCKED =====
  console.log('\n=== NO DUPLICATE ALLOCATION ===');
  const dupAlloc = await api('/admissions/allocate', {
    method: 'POST',
    body: { applicantId: alice._id, programId: program._id, quotaType: 'KCET', admissionMode: 'Government', allotmentNumber: 'KCET-2026-AL-999' },
    headers: OH
  });
  test('Duplicate allocation for same applicant BLOCKED', dupAlloc.status === 400 && dupAlloc.data.error.includes('already'));

  // ===== DUPLICATE ALLOTMENT NUMBER BLOCKED =====
  console.log('\n=== DUPLICATE ALLOTMENT NUMBER BLOCKED ===');
  const newApp = await api('/applicants', {
    method: 'POST',
    body: { name: 'Charlie Test', email: 'charlie@test.com', phone: '9999999999', category: 'GM', entryType: 'Regular', quotaType: 'KCET', marks: 90 },
    headers: OH
  });
  await api('/applicants/' + newApp.data._id + '/documents', { method: 'PATCH', body: { documentsStatus: 'Submitted' }, headers: OH });
  await api('/applicants/' + newApp.data._id + '/documents', { method: 'PATCH', body: { documentsStatus: 'Verified' }, headers: OH });

  const dupAllotment = await api('/admissions/allocate', {
    method: 'POST',
    body: { applicantId: newApp.data._id, programId: program._id, quotaType: 'KCET', admissionMode: 'Government', allotmentNumber: 'KCET-2026-AL-001234' },
    headers: OH
  });
  test('Duplicate allotment number BLOCKED', dupAllotment.status === 400 && dupAllotment.data.error.includes('allotment'));

  // ===== MANAGEMENT FLOW VALIDATION =====
  console.log('\n=== MANAGEMENT ADMISSION FLOW ===');

  const mgmtKcet = await api('/admissions/allocate', {
    method: 'POST',
    body: { applicantId: newApp.data._id, programId: program._id, quotaType: 'KCET', admissionMode: 'Management' },
    headers: OH
  });
  test('Mgmt flow with KCET quota BLOCKED', mgmtKcet.status === 400 && mgmtKcet.data.error.includes('Management quota'));

  const mgmtAlloc = await api('/admissions/allocate', {
    method: 'POST',
    body: { applicantId: newApp.data._id, programId: program._id, quotaType: 'Management', admissionMode: 'Management' },
    headers: OH
  });
  test('Valid Mgmt allocation succeeds (201)', mgmtAlloc.status === 201);
  test('admissionMode = Management', mgmtAlloc.data.admissionMode === 'Management');
  test('No allotment number for Mgmt', mgmtAlloc.data.allotmentNumber === null);

  // ===== RULE 4: FEE MUST BE PAID =====
  console.log('\n=== RULE 4: ADMISSION CONFIRMED ONLY IF FEE PAID ===');
  const admissionId = govtAlloc.data._id;

  const confirmNoPay = await api('/admissions/' + admissionId + '/confirm', {
    method: 'POST',
    body: { feeStatus: 'Pending' },
    headers: OH
  });
  test('Confirm without fee payment BLOCKED', confirmNoPay.status === 400 && confirmNoPay.data.error.includes('Paid'));

  // ===== RULE 3: ADMISSION NUMBER GENERATED ONCE =====
  console.log('\n=== RULE 3: ADMISSION NUMBER GENERATED ONLY ONCE ===');
  const confirmPaid = await api('/admissions/' + admissionId + '/confirm', {
    method: 'POST',
    body: { feeStatus: 'Paid' },
    headers: OH
  });
  test('Confirm with fee=Paid succeeds (200)', confirmPaid.status === 200);
  test('Status changed to Confirmed', confirmPaid.data.status === 'Confirmed');
  test('Unique admission number generated', !!confirmPaid.data.admissionNumber);
  const admNumFormat = /^[A-Z]{4}\/\d{4}\/[A-Z]{2}\/[A-Z.]+\/[A-Z]+\/\d{4}$/.test(confirmPaid.data.admissionNumber);
  test('Format: INST/YYYY/COURSE/BRANCH/QUOTA/XXXX', admNumFormat);
  console.log('    Generated: ' + confirmPaid.data.admissionNumber);

  const reConfirm = await api('/admissions/' + admissionId + '/confirm', {
    method: 'POST',
    body: { feeStatus: 'Paid' },
    headers: OH
  });
  test('Re-confirmation BLOCKED (immutable)', reConfirm.status === 400 && reConfirm.data.error.includes('already confirmed'));

  // ===== RULE 2: BLOCK WHEN QUOTA FULL =====
  console.log('\n=== RULE 2: NO SEAT ALLOCATION IF QUOTA FULL ===');
  const masterCheck = await api('/master', { headers: H });
  const mgmtQuotaNow = masterCheck.data.quotas.find(q => q._id === mgmtQuota._id);
  console.log('    Management quota: filled=' + mgmtQuotaNow.filledSeats + ' / total=' + mgmtQuotaNow.totalSeats);

  const remaining = mgmtQuotaNow.totalSeats - mgmtQuotaNow.filledSeats;
  console.log('    Filling ' + remaining + ' remaining Management seats...');

  for (let i = 0; i < remaining; i++) {
    const fa = await api('/applicants', {
      method: 'POST',
      body: { name: 'Fill-' + i, email: 'fill' + i + '@test.com', phone: '80000000' + (10 + i), category: 'GM', entryType: 'Regular', quotaType: 'Management', marks: 80 },
      headers: OH
    });
    await api('/applicants/' + fa.data._id + '/documents', { method: 'PATCH', body: { documentsStatus: 'Submitted' }, headers: OH });
    await api('/applicants/' + fa.data._id + '/documents', { method: 'PATCH', body: { documentsStatus: 'Verified' }, headers: OH });
    await api('/admissions/allocate', {
      method: 'POST',
      body: { applicantId: fa.data._id, programId: program._id, quotaType: 'Management', admissionMode: 'Management' },
      headers: OH
    });
  }

  const finalMaster = await api('/master', { headers: H });
  const finalMgmt = finalMaster.data.quotas.find(q => q._id === mgmtQuota._id);
  test('Management quota fully filled: ' + finalMgmt.filledSeats + '/' + finalMgmt.totalSeats, finalMgmt.filledSeats === finalMgmt.totalSeats);

  // Now overflow
  const overflowApp = await api('/applicants', {
    method: 'POST',
    body: { name: 'Overflow User', email: 'overflow@test.com', phone: '7777777777', category: 'GM', entryType: 'Regular', quotaType: 'Management', marks: 75 },
    headers: OH
  });
  await api('/applicants/' + overflowApp.data._id + '/documents', { method: 'PATCH', body: { documentsStatus: 'Submitted' }, headers: OH });
  await api('/applicants/' + overflowApp.data._id + '/documents', { method: 'PATCH', body: { documentsStatus: 'Verified' }, headers: OH });

  const overflowAlloc = await api('/admissions/allocate', {
    method: 'POST',
    body: { applicantId: overflowApp.data._id, programId: program._id, quotaType: 'Management', admissionMode: 'Management' },
    headers: OH
  });
  test('Allocation when quota FULL is BLOCKED (no overbooking)', overflowAlloc.status === 400 && overflowAlloc.data.error.includes('full'));

  // ===== DASHBOARD =====
  console.log('\n=== DASHBOARD VERIFICATION ===');
  const dash = await api('/dashboard', { headers: MH });
  test('Dashboard shows totalIntake', dash.data.totalIntake >= 60);
  test('Dashboard shows confirmed admissions', dash.data.totalAdmitted >= 1);
  test('Dashboard shows remainingSeats', typeof dash.data.remainingSeats === 'number');
  test('Dashboard shows quotaStats breakdown', dash.data.quotaStats && dash.data.quotaStats.length > 0);
  test('Dashboard shows pending docs count', typeof dash.data.pendingDocumentsCount === 'number');
  test('Dashboard shows fee pending list', !!dash.data.feePendingList);

  // ===== FINAL SUMMARY =====
  console.log('\n' + '='.repeat(55));
  console.log('  TOTAL: ' + passed + ' PASSED / ' + failed + ' FAILED / ' + (passed + failed) + ' TESTS');
  console.log('='.repeat(55));

  process.exit(failed > 0 ? 1 : 0);
})().catch(e => { console.error('Fatal:', e); process.exit(1); });
