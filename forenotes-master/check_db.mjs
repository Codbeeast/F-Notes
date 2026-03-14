import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: '.env.local' });

const referralSignupSchema = new mongoose.Schema({
    userId: String,
    referralCode: String,
    referrerId: String,
    status: String,
    processedAt: Date,
    errorMessage: String
}, { collection: 'referralsignups' }); // or use default let Mongoose infer

async function check() {
    await mongoose.connect(process.env.MONGODB_URI);
    const ReferralSignup = mongoose.models.ReferralSignup || mongoose.model('ReferralSignup', referralSignupSchema);
    
    const docs = await ReferralSignup.find().sort({ processedAt: -1 }).limit(5).lean();
    console.log(JSON.stringify(docs, null, 2));
    
    process.exit(0);
}

check().catch(console.error);
