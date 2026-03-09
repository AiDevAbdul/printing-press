async function test() {
  const BASE_URL = 'http://localhost:3000/api';
  
  try {
    console.log('Attempting login...');
    const loginResponse = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'tester@test.com',
        password: 'password123'
      })
    });
    
    if (!loginResponse.ok) {
       console.error('Login failed! Status:', loginResponse.status);
       console.error('Body:', await loginResponse.text());
       return;
    }

    const loginData = await loginResponse.json();
    const token = loginData.access_token;
    console.log('Login successful! Token acquired.');
    
    console.log('Attempting to fetch orders with token...');
    const ordersResponse = await fetch(`${BASE_URL}/orders`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!ordersResponse.ok) {
       console.error('Orders fetch failed! Status:', ordersResponse.status);
       console.error('Body:', await ordersResponse.text());
       return;
    }
    
    const ordersData = await ordersResponse.json();
    console.log('Orders fetch successful! Data length:', ordersData.length);
    console.log('Orders data:', JSON.stringify(ordersData, null, 2));
  } catch (err) {
    console.error('Test failed! Error:', err.message);
  }
}

test();
