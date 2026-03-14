import fetch from 'node-fetch';

async function testSubmit() {
  console.log("Testing POST to forenotes_refer /api/referral/record-signup...");
  
  const body = {
    referralCode: "N9LYyUXl", // The only APPROVED request in DB
    referredUserId: "user_test123",
    referredUserEmail: "test@example.com",
    referredUserName: "Test User",
  };

  try {
    const res = await fetch('http://localhost:3000/api/referral/record-signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-referral-secret': 'WYCqxf1olIxoqEAm@'
      },
      body: JSON.stringify(body)
    });

    const data = await res.json();
    console.log("Status:", res.status);
    console.log("Response:", data);
  } catch (err) {
    console.error("Fetch Error:", err);
  }
}

testSubmit();
