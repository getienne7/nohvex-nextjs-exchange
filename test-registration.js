// Test script to verify registration API (ESM)
import https from 'node:https'

const testRegistration = () => {
  const data = JSON.stringify({
    name: 'Test User',
    email: `test-${Date.now()}@example.com`,
    password: 'testpass123',
  })

  const options = {
    hostname: 'nohvex-exchange-818ujogl5-getienne7s-projects.vercel.app',
    port: 443,
    path: '/api/register',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(data),
    },
  }

  const req = https.request(options, (res) => {
    console.log(`Status: ${res.statusCode}`)
    console.log(`Headers: ${JSON.stringify(res.headers, null, 2)}`)

    let body = ''
    res.on('data', (chunk) => {
      body += chunk
    })

    res.on('end', () => {
      console.log('Response Body:', body)
      if (res.statusCode === 200) {
        console.log('✅ Registration API is working correctly!')
      } else {
        console.log('❌ Registration API returned an error')
      }
    })
  })

  req.on('error', (e) => {
    console.error(`Problem with request: ${e.message}`)
  })

  req.write(data)
  req.end()
}

// Run if executed directly
if (process.argv[1] && new URL(import.meta.url).pathname.endsWith(new URL(`file://${process.argv[1]}`).pathname)) {
  testRegistration()
}
