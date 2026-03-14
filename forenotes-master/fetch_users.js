const mongoose = require('mongoose');

async function fetchUsers() {
    console.log("Connecting to the database...");
    await mongoose.connect('mongodb+srv://vishwakarmapriyanshu9099:WYCqxf1olIxoqEAm@cluster0.pb1f3.mongodb.net/tradejournal?retryWrites=true&w=majority');
    
    const User = mongoose.connection.collection('users');
    const users = await User.find({}).toArray();
    
    console.log(`\n================================`);
    console.log(` Found ${users.length} users in the DB`);
    console.log(`================================\n`);
    
    users.forEach((u, i) => {
        console.log(`[${i+1}] User ID: ${u._id}`);
        console.log(`    Name: ${u.firstName || ''} ${u.lastName || ''}`);
        console.log(`    Email: ${u.email}`);
        console.log(`    Role: ${u.role || 'user'}`);
        console.log(`    Their Referral Code: ${u.referralCode || 'None'}`);
        if (u.referredBy && Object.keys(u.referredBy).length > 0) {
            console.log(`    Referred By: ${u.referredBy.referralCode || u.referredBy.clerkUserId || 'None'}`);
        } else {
            console.log(`    Referred By: None`);
        }
        console.log('------------------------------------------------');
    });
    
    process.exit(0);
}

fetchUsers().catch(console.error);
