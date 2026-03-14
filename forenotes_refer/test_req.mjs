import fetch from 'node-fetch';

async function test() {
    const res = await fetch('http://localhost:3000/api/referral/record-signup', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-referral-secret': 'WYCqxf1olIxoqEAm@'
        },
        body: JSON.stringify({
            referralCode: 'TEST1234',
            referredUserId: 'user_2xyz_test_1',
            referredUserEmail: 'test@example.com',
            referredUserName: 'Test User'
        })
    });
    const data = await res.json();
    console.log('Status:', res.status);
    console.log('Response:', data);
}

test();
