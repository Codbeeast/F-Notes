const mongoose = require('mongoose');

// Connect to DB directly
const mongoUri = 'mongodb+srv://vishwakarmapriyanshu9099:WYCqxf1olIxoqEAm@cluster0.pb1f3.mongodb.net/tradejournal';

async function checkUsers() {
    try {
        await mongoose.connect(mongoUri);
        console.log('Connected to DB');

        // Find the 5 most recently created users
        const collection = mongoose.connection.db.collection('users');
        const users = await collection.find().sort({ $natural: -1 }).limit(5).toArray();

        console.log('\n--- 5 Most Recent Users ---');
        for (const user of users) {
            console.log(`\nUser ID: ${user._id}`);
            console.log(`Has Email? ${!!user.email}`);
            console.log(`Has Name? ${!!user.firstName}`);
            console.log(`Referred By: ${user.referredBy?.clerkUserId || user.referredBy || 'None'}`);
            console.log(`Referral Code: ${user.referralCode || 'None'}`);
        }

        const referrals = await mongoose.connection.db.collection('referrals').find().toArray();
        console.log(`\nTotal Referral records in DB: ${referrals.length}`);

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await mongoose.disconnect();
    }
}

checkUsers();
