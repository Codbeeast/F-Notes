const mongoose = require('mongoose');

async function check() {
    await mongoose.connect('mongodb+srv://vishwakarmapriyanshu9099:WYCqxf1olIxoqEAm@cluster0.pb1f3.mongodb.net/tradejournal?retryWrites=true&w=majority');
    
    // Check User collection
    const User = mongoose.connection.collection('users');
    const user = await User.findOne({ referralCode: 'INFPROMO1' });
    console.log('User with INFPROMO1:', user ? user._id : 'Not found');
    
    // Check ReferralAccessRequest collection
    const Req = mongoose.connection.collection('referralaccessrequests');
    const req = await Req.findOne({ referralCode: 'INFPROMO1' });
    console.log('AccessRequest with INFPROMO1:', req ? req._id + ' (status: ' + req.status + ')' : 'Not found');
    
    // Also let's check what referral codes DO exist in the users collection
    const usersWithCodes = await User.find({ referralCode: { $exists: true, $ne: null } }).limit(5).toArray();
    console.log('Sample users with referral codes:', usersWithCodes.map(u => ({ id: u._id, code: u.referralCode })));
    
    process.exit(0);
}

check().catch(console.error);
