const http = require('http');

const API_BASE = 'http://localhost:5282/api';

async function request(method, path, body, token) {
  return new Promise((resolve) => {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json'
      }
    };
    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(`${API_BASE}${path}`, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: data ? JSON.parse(data) : null });
        } catch(e) {
          resolve({ status: res.statusCode, data });
        }
      });
    });

    req.on('error', (e) => {
      resolve({ status: 500, error: e.message });
    });

    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function runTests() {
  const results = {};
  console.log("Starting backend tests...");

  // AUTH-REG-B03: Missing fields
  let res = await request('POST', '/auth/register', { email: '' });
  results['AUTH-REG-B03'] = res.status === 400 ? 'Pass' : 'Fail';

  // AUTH-REG-B01: Valid Registration
  const email = `test${Date.now()}@voyager.com`;
  res = await request('POST', '/auth/register', {
    email: email,
    password: 'Password123!',
    firstName: 'Test',
    lastName: 'User'
  });
  results['AUTH-REG-B01'] = (res.status === 200 || res.status === 201) ? 'Pass' : `Fail (${res.status})`;

  // AUTH-REG-B02: Existing email
  res = await request('POST', '/auth/register', {
    email: email,
    password: 'Password123!',
    firstName: 'Test',
    lastName: 'User'
  });
  results['AUTH-REG-B02'] = res.status === 400 ? 'Pass' : `Fail (${res.status})`;

  // AUTH-LOG-B03: Non-existent email
  res = await request('POST', '/auth/login', {
    email: 'doesnotexist@voyager.com',
    password: 'Password123!'
  });
  results['AUTH-LOG-B03'] = res.status === 401 ? 'Pass' : `Fail (${res.status})`;

  // AUTH-LOG-B02: Incorrect password
  res = await request('POST', '/auth/login', {
    email: email,
    password: 'WrongPassword!'
  });
  results['AUTH-LOG-B02'] = res.status === 401 ? 'Pass' : `Fail (${res.status})`;

  // AUTH-LOG-B01: Valid Login
  res = await request('POST', '/auth/login', {
    email: email,
    password: 'Password123!'
  });
  let token = null;
  if (res.status === 200 && res.data && res.data.accessToken) {
    results['AUTH-LOG-B01'] = 'Pass';
    token = res.data.accessToken;
  } else {
    results['AUTH-LOG-B01'] = `Fail (${res.status})`;
  }

  // AUTH-PRO-B03: No token
  res = await request('GET', '/profile', null, null);
  results['AUTH-PRO-B03'] = res.status === 401 ? 'Pass' : `Fail (${res.status})`;

  // AUTH-PRO-B01: Get Profile
  if (token) {
    res = await request('GET', '/profile', null, token);
    results['AUTH-PRO-B01'] = res.status === 200 ? 'Pass' : `Fail (${res.status})`;
  } else {
    results['AUTH-PRO-B01'] = 'Fail (No Token)';
  }

  console.log(JSON.stringify(results, null, 2));
}

runTests();
