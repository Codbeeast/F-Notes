const mongoose = require('mongoose');
const fs = require('fs');

async function fetchUsers() {
    await mongoose.connect('mongodb+srv://vishwakarmapriyanshu9099:WYCqxf1olIxoqEAm@cluster0.pb1f3.mongodb.net/tradejournal?retryWrites=true&w=majority');
    
    const User = mongoose.connection.collection('users');
    const users = await User.find({}).toArray();
    
    const formatted = users.map((u, i) => ({
        index: i + 1,
        id: u._id,
        name: `${u.firstName || ''} ${u.lastName || ''}`.trim(),
        email: u.email,
        role: u.role || 'user',
        referralCode: u.referralCode || 'None',
        referredBy: u.referredBy && (u.referredBy.referralCode || u.referredBy.clerkUserId) ? (u.referredBy.referralCode || u.referredBy.clerkUserId) : 'None'
    }));
    
    fs.writeFileSync('users_dump.json', JSON.stringify(formatted, null, 2));
    
    process.exit(0);
}

fetchUsers().catch(console.error);
