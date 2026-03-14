// models/ReferralSignup.js
// Local audit trail for referral codes used during signup on forenotes-master.
// The authoritative referral data lives in forenotes_refer's DB.

import mongoose from 'mongoose';

const referralSignupSchema = new mongoose.Schema({
    // Clerk user ID of the new user who signed up with a referral code
    userId: {
        type: String,
        required: true,
        unique: true, // One referral per user
        index: true
    },

    // The referral code entered during signup
    referralCode: {
        type: String,
        required: true
    },

    // Clerk user ID of the referrer (populated after validation)
    referrerId: {
        type: String,
        default: null
    },

    // Whether the referral was successfully recorded in forenotes_refer
    status: {
        type: String,
        enum: ['RECORDED', 'FAILED'],
        default: 'RECORDED',
        index: true
    },

    // When the referral was processed
    processedAt: {
        type: Date,
        default: Date.now
    },

    // Error message if the recording failed
    errorMessage: {
        type: String,
        default: null
    }

}, {
    timestamps: true
});

// Indexes
referralSignupSchema.index({ referralCode: 1 });
referralSignupSchema.index({ referrerId: 1 });

// Avoid model recompilation in dev/hot-reload
const ReferralSignup = mongoose.models.ReferralSignup || mongoose.model('ReferralSignup', referralSignupSchema);

export default ReferralSignup;
