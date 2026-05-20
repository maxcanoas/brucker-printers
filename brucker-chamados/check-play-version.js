const fs = require('fs');
const path = require('path');
const jwt = require('./api/node_modules/jsonwebtoken');
const https = require('https');

const sa = JSON.parse(fs.readFileSync(path.join(__dirname, 'mobile', 'google-service-account.json'), 'utf8'));
const PACKAGE = 'com.bruckerprinters.chamados';

const now = Math.floor(Date.now() / 1000);
const assertion = jwt.sign(
  {
    iss: sa.client_email,
    scope: 'https://www.googleapis.com/auth/androidpublisher',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
  },
  sa.private_key,
  { algorithm: 'RS256' }
);

function postForm(url, params) {
  return new Promise((resolve, reject) => {
    const body = new URLSearchParams(params).toString();
    const u = new URL(url);
    const req = https.request(
      { method: 'POST', host: u.host, path: u.pathname, headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Content-Length': Buffer.byteLength(body) } },
      (res) => { let data = ''; res.on('data', (c) => (data += c)); res.on('end', () => resolve({ status: res.statusCode, body: data })); }
    );
    req.on('error', reject); req.write(body); req.end();
  });
}

function apiCall(method, url, token, body) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const headers = { Authorization: `Bearer ${token}` };
    if (body) { headers['Content-Type'] = 'application/json'; headers['Content-Length'] = Buffer.byteLength(body); }
    else { headers['Content-Length'] = 0; }
    const req = https.request(
      { method, host: u.host, path: u.pathname + u.search, headers },
      (res) => { let data = ''; res.on('data', (c) => (data += c)); res.on('end', () => resolve({ status: res.statusCode, body: data })); }
    );
    req.on('error', reject); if (body) req.write(body); req.end();
  });
}

(async () => {
  const tok = await postForm('https://oauth2.googleapis.com/token', { grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion });
  if (tok.status !== 200) { console.error('Token error:', tok.status, tok.body); process.exit(1); }
  const accessToken = JSON.parse(tok.body).access_token;
  console.log('Got OAuth token.');

  const edit = await apiCall('POST', `https://androidpublisher.googleapis.com/androidpublisher/v3/applications/${PACKAGE}/edits`, accessToken);
  if (edit.status !== 200 && edit.status !== 201) { console.error('Edit error:', edit.status, edit.body); process.exit(1); }
  const editId = JSON.parse(edit.body).id;
  console.log('Edit session:', editId);

  const tracksRes = await apiCall('GET', `https://androidpublisher.googleapis.com/androidpublisher/v3/applications/${PACKAGE}/edits/${editId}/tracks`, accessToken);
  console.log('\n=== TRACKS ===');
  try { console.log(JSON.stringify(JSON.parse(tracksRes.body), null, 2)); } catch { console.log(tracksRes.body); }

  // Cleanup edit (don't commit)
  await apiCall('DELETE', `https://androidpublisher.googleapis.com/androidpublisher/v3/applications/${PACKAGE}/edits/${editId}`, accessToken);
})();
