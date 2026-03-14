const mongoose = require('mongoose');

const accessReqSchema = new mongoose.Schema({ clerkUserId: String, referralCode: String, status: String }, { collection: 'referralaccessrequests' });

async function check() {
    await mongoose.connect('mongodb+srv://vishwakarmapriyanshu9099:WYCqxf1olIxoqEAm@cluster0.pb1f3.mongodb.net/tradejournal?retryWrites=true&w=majority');
    const ReferralAccessRequest = mongoose.model('ReferralAccessRequest', accessReqSchema);

    const referralCode = 'INFPROMO1';
    
    // Test 1: native driver
    const doc = await mongoose.connection.collection('referralaccessrequests').findOne({ referralCode });
    console.log('1. Native driver full doc:', doc);
    
    // Test 2: Mongoose without status
    const mDoc1 = await ReferralAccessRequest.findOne({ referralCode }).lean();
    console.log('2. Mongoose without status:', mDoc1);
    
    // Test 3: Mongoose with status
    const mDoc2 = await ReferralAccessRequest.findOne({ referralCode, status: 'APPROVED' }).lean();
    console.log('3. Mongoose with status:', mDoc2);
    
    process.exit(0);
}
check().catch(console.error);
