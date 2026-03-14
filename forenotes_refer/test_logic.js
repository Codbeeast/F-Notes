const mongoose = require('mongoose');

// minimal schemas
const userSchema = new mongoose.Schema({ _id: String, referralCode: String }, { collection: 'users' });
const accessReqSchema = new mongoose.Schema({ clerkUserId: String, referralCode: String, status: String }, { collection: 'referralaccessrequests' });

async function check() {
    await mongoose.connect('mongodb+srv://vishwakarmapriyanshu9099:WYCqxf1olIxoqEAm@cluster0.pb1f3.mongodb.net/tradejournal?retryWrites=true&w=majority');
    const User = mongoose.model('User', userSchema);
    const ReferralAccessRequest = mongoose.model('ReferralAccessRequest', accessReqSchema);

    const referralCode = 'INFPROMO1';
    let referrer = await User.findOne({ referralCode }).lean();
    let referrerIdForRecord;

    console.log('1. User.findOne:', referrer);

    if (!referrer) {
        const accessReq = await ReferralAccessRequest.findOne({
            referralCode,
            status: 'APPROVED'
        }).lean();
        console.log('2. ReferralAccessRequest.findOne:', accessReq);

        if (accessReq) {
            referrer = await User.findById(accessReq.clerkUserId).lean();
            console.log('3. User.findById:', referrer);

            if (!referrer) {
                referrerIdForRecord = accessReq.clerkUserId;
            }
        }
    }

    if (referrer) {
        referrerIdForRecord = referrer._id;
    }

    console.log('4. final referrerIdForRecord:', referrerIdForRecord);
    process.exit(0);
}
check().catch(console.error);
