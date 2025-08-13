// Test script to verify basic API connectivity
const https = require('https');

const testBasicAPI = () => {
  const options = {
    hostname: 'nohvex-exchange-818ujogl5-getienne7s-projects.vercel.app',
    port: 443,
    path: '/api/test',
    method: 'GET',
    headers: {
      'Accept': 'application/json'
    }
  };

  const req = https.request(options, (res) => {
    console.log(`Status: ${res.statusCode}`);
    console.log(`Headers: ${JSON.stringify(res.headers, null, 2)}`);
    
    let body = '';
    res.on('data', (chunk) => {
      body += chunk;
    });
    
    res.on('end', () => {
      console.log('Response Body:', body);
      if (res.statusCode === 200) {
        console.log('✅ Basic API is working correctly!');
      } else {
        console.log('❌ Basic API returned an error');
      }
    });
  });

  req.on('error', (e) => {
    console.error(`Problem with request: ${e.message}`);
  });

  req.end();
};

testBasicAPI();
