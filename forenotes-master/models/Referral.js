// models/Referral.js
import mongoose from 'mongoose';

const referralSchema = new mongoose.Schema({
    // Referrer (User_A who shared the link)
    referrerId: {
        type: String,
        ref: 'User',
        required: true,
        index: true
    },

    // Referred user (User_B who signed up)
    referredUserId: {
        type: String,
        ref: 'User',
        required: true,
        index: true
    },

    // The referral code that was used
    referralCode: {
        type: String,
        required: true
    },

    // Referral lifecycle status
    status: {
        type: String,
        enum: ['PENDING', 'PURCHASE_COMPLETED', 'REWARDED'],
        default: 'PENDING',
        index: true
    },

    // Reward details
    rewardAmount: {
        type: Number,
        default: 30 // ₹30 reward per successful referral
    },

    // Subscription/Payment that triggered completion
    purchaseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subscription',
        default: null
    },

    // When the referrer was rewarded
    rewardedAt: {
        type: Date,
        default: null
    }

}, {
    timestamps: true
});

// Indexes for performance
referralSchema.index({ referrerId: 1, status: 1 });
referralSchema.index({ referredUserId: 1, status: 1 });

// Static: find all referrals made by a user
referralSchema.statics.findByReferrer = async function (referrerId) {
    return await this.find({ referrerId })
        .sort({ createdAt: -1 })
        .populate('referredUserId', 'firstName lastName imageUrl createdAt');
};

// Static: find pending referral for a referred user
referralSchema.statics.findPendingForUser = async function (referredUserId) {
    return await this.findOne({
        referredUserId,
        status: 'PENDING'
    });
};

// Avoid model recompilation in dev/hot-reload
const Referral = mongoose.models.Referral || mongoose.model('Referral', referralSchema);

export default Referral;
