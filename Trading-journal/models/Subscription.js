// models/Subscription.js
import mongoose from 'mongoose';

const subscriptionSchema = new mongoose.Schema({
    // User reference (Clerk user ID)
    userId: {
        type: String,
        ref: 'User',
        required: true,
        index: true
    },

    username: {
        type: String,
        sparse: true
    },

    // User email for trial tracking (one trial per email lifetime)
    userEmail: {
        type: String,
        lowercase: true,
        trim: true,
        sparse: true
    },

    // Razorpay subscription ID
    razorpaySubscriptionId: {
        type: String,
        unique: true,
        sparse: true // allows null for trial subscriptions
    },

    // Plan details
    planType: {
        type: String,
        enum: ['1_MONTH', '3_MONTHS', '6_MONTHS', '12_MONTHS', 'TRIAL', 'SPECIAL_OFFER'],
        required: true
    },

    planAmount: {
        type: Number,
        required: true,
        default: 0 // 0 for trial, actual amount for paid plans
    },

    billingCycle: {
        type: String,
        enum: ['monthly', 'quarterly', 'half_yearly', 'yearly', 'one_time'],
        required: true
    },

    // Bonus period tracking
    billingPeriod: {
        type: Number,
        default: 0, // 0 for trial, actual months for paid plans
        required: true
    },

    bonusMonths: {
        type: Number,
        default: 0 // Additional free months
    },

    totalMonths: {
        type: Number,
        default: function () {
            return (this.billingPeriod || 1) + (this.bonusMonths || 0);
        }
    },

    // Payment type tracking
    isRecurring: {
        type: Boolean,
        default: true // false for one-time payments
    },

    paymentType: {
        type: String,
        enum: ['subscription', 'onetime'],
        default: 'subscription'
    },

    // For one-time payments (Razorpay Order ID instead of Subscription ID)
    razorpayOrderId: {
        type: String,
        sparse: true // Allows null/undefined, creates sparse index
    },

    razorpayPaymentId: {
        type: String,
        sparse: true
    },

    // Trial information
    isTrialActive: {
        type: Boolean,
        default: false
    },

    isTrialUsed: {
        type: Boolean,
        default: false
    },

    trialStartDate: {
        type: Date,
        default: null
    },

    trialEndDate: {
        type: Date,
        default: null
    },

    // Subscription status
    status: {
        type: String,
        enum: ['created', 'trial', 'active', 'past_due', 'cancelled', 'expired'],
        default: 'created',
        index: true
    },

    // Autopay configuration
    autoPayEnabled: {
        type: Boolean,
        default: false
    },

    paymentMethod: {
        type: String,
        enum: ['card', 'upi', 'netbanking', 'wallet', null],
        default: null
    },

    // Billing dates
    startDate: {
        type: Date,
        required: true,
        default: Date.now
    },

    currentPeriodStart: {
        type: Date,
        default: Date.now
    },

    currentPeriodEnd: {
        type: Date,
        required: true
    },

    nextBillingDate: {
        type: Date,
        default: null
    },

    // Cancellation details
    cancelledAt: {
        type: Date,
        default: null
    },

    cancelReason: {
        type: String,
        default: null
    },

    // Razorpay plan ID
    razorpayPlanId: {
        type: String,
        default: null
    },

    // Payment history references
    paymentIds: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Payment'
    }],

    // Promo offer tracking
    isPromoOffer: {
        type: Boolean,
        default: false
    },

    promoCode: {
        type: String,
        default: null
    },

    // Metadata
    metadata: {
        type: Map,
        of: String,
        default: {}
    }

}, {
    timestamps: true
});

// Indexes for performance
subscriptionSchema.index({ userId: 1, status: 1 });
subscriptionSchema.index({ nextBillingDate: 1 });
subscriptionSchema.index({ userEmail: 1, isTrialUsed: 1 }); // For email-based trial lookup

// Virtual for checking if subscription is valid
subscriptionSchema.virtual('isValid').get(function () {
    if (this.isTrialActive && this.trialEndDate > new Date()) {
        return true;
    }
    return this.status === 'active' && this.currentPeriodEnd > new Date();
});

// Method to check if trial is expired
subscriptionSchema.methods.isTrialExpired = function () {
    if (!this.isTrialActive) return false;
    return this.trialEndDate && this.trialEndDate <= new Date();
};

// Method to calculate days remaining
subscriptionSchema.methods.daysRemaining = function () {
    const endDate = this.isTrialActive ? this.trialEndDate : this.currentPeriodEnd;
    const now = new Date();
    const diffTime = endDate - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
};

// Static method to find active subscription for user
// PRIORITY: Active paid subscription > Active trial
subscriptionSchema.statics.findActiveSubscription = async function (userId) {
    // FIRST: Look for active PAID subscription (highest priority)
    let subscription = await this.findOne({
        userId,
        status: 'active',
        isTrialActive: { $ne: true }, // Not a trial
        currentPeriodEnd: { $gt: new Date() }
    }).sort({ createdAt: -1 });

    // SECOND: If no paid subscription, look for active trial
    if (!subscription) {
        subscription = await this.findOne({
            userId,
            status: 'trial',
            isTrialActive: true,
            trialEndDate: { $gt: new Date() }
        }).sort({ createdAt: -1 });
    }

    // THIRD: Check for corrupted subscriptions that need repair
    if (!subscription) {
        const corruptedSub = await this.findOne({
            userId,
            isTrialActive: true,
            trialEndDate: { $gt: new Date() },
            status: { $nin: ['trial', 'active'] } // Status is out of sync
        }).sort({ createdAt: -1 });

        if (corruptedSub) {
            // Auto-repair: set status back to 'trial'
            corruptedSub.status = 'trial';
            await corruptedSub.save();
            subscription = corruptedSub;
        }
    }

    return subscription;
};

// Avoid model recompilation in dev/hot-reload
const Subscription = mongoose.models.Subscription || mongoose.model('Subscription', subscriptionSchema);

export default Subscription;
