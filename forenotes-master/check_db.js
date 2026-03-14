const mongoose = require('mongoose');

const referralSignupSchema = new mongoose.Schema({
    userId: String,
    referralCode: String,
    referrerId: String,
    status: String,
    processedAt: Date,
    errorMessage: String
}, { collection: 'referralsignups' });

async function check() {
    await mongoose.connect('mongodb+srv://vishwakarmapriyanshu9099:WYCqxf1olIxoqEAm@cluster0.pb1f3.mongodb.net/tradejournal?retryWrites=true&w=majority');
    const ReferralSignup = mongoose.models.ReferralSignup || mongoose.model('ReferralSignup', referralSignupSchema);
    
    console.log('Fetching last 5 referal signups...');
    const docs = await ReferralSignup.find().sort({ processedAt: -1 }).limit(5).lean();
    console.log(JSON.stringify(docs, null, 2));
    
    process.exit(0);
}

check().catch(console.error);
