const fetch = require('node-fetch');

async function testDebugAuth() {
  console.log('🔍 Testing Debug Auth API');
  console.log('═════════════════════════');
  
  const testData = {
    email: 'gletienne@gmail.com',
    password: 'newpassword123'
  };
  
  try {
    console.log(`Testing with email: ${testData.email}`);
    console.log(`Testing with password: ${testData.password}`);
    console.log('\nCalling production debug API...');
    
    const response = await fetch('https://nohvex-nextjs-exchange.vercel.app/api/debug-auth', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testData)
    });
    
    const result = await response.json();
    
    console.log('\n📊 Debug Results:');
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(result, null, 2));
    
    if (result.success) {
      console.log('\n✅ Password verification successful!');
    } else {
      console.log('\n❌ Password verification failed');
      console.log('Issue:', result.message);
    }
    
  } catch (error) {
    console.error('❌ Error calling debug API:', error.message);
  }
}

testDebugAuth();
