// Shop Floor Diagnostic Script
// Copy and paste this into your browser console (F12) while on Shop Floor page

console.log('=== SHOP FLOOR DIAGNOSTIC ===');

// 1. Check authentication
const accessToken = localStorage.getItem('access_token');
const refreshToken = localStorage.getItem('refresh_token');
console.log('1. Authentication:');
console.log('   Access Token:', accessToken ? 'EXISTS' : 'MISSING');
console.log('   Refresh Token:', refreshToken ? 'EXISTS' : 'MISSING');

// 2. Check API base URL
console.log('\n2. API Configuration:');
console.log('   Current URL:', window.location.href);
console.log('   Expected API:', 'http://localhost:3000/api');

// 3. Test API calls manually
console.log('\n3. Testing API Calls...');

// Test "My Jobs" endpoint
fetch('http://localhost:3000/api/production/shop-floor/my-jobs', {
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  }
})
.then(res => {
  console.log('   My Jobs API Status:', res.status);
  return res.json();
})
.then(data => {
  console.log('   My Jobs Response:', data);
  console.log('   My Jobs Count:', Array.isArray(data) ? data.length : 0);
})
.catch(err => console.error('   My Jobs Error:', err));

// Test "All Jobs" endpoint
fetch('http://localhost:3000/api/production/jobs?status=in_progress,queued,paused', {
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  }
})
.then(res => {
  console.log('   All Jobs API Status:', res.status);
  return res.json();
})
.then(data => {
  console.log('   All Jobs Response:', data);
  console.log('   All Jobs Count:', data?.data?.length || 0);
})
.catch(err => console.error('   All Jobs Error:', err));

// 4. Check all production jobs (any status)
fetch('http://localhost:3000/api/production/jobs', {
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  }
})
.then(res => {
  console.log('\n4. All Production Jobs (any status):');
  console.log('   Status:', res.status);
  return res.json();
})
.then(data => {
  console.log('   Total Jobs:', data?.total || 0);
  if (data?.data?.length > 0) {
    console.log('   Jobs by Status:');
    const statusCounts = {};
    data.data.forEach(job => {
      statusCounts[job.status] = (statusCounts[job.status] || 0) + 1;
    });
    console.table(statusCounts);
    console.log('   Job Details:');
    data.data.forEach(job => {
      console.log(`   - ${job.job_number}: ${job.status} (Operator: ${job.assigned_operator?.full_name || 'None'})`);
    });
  } else {
    console.log('   ⚠️ NO PRODUCTION JOBS EXIST IN DATABASE');
  }
})
.catch(err => console.error('   Error:', err));

console.log('\n=== END DIAGNOSTIC ===');
console.log('Please copy the entire output above and share it.');
