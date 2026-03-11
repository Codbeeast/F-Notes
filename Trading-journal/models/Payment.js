// models/Payment.js
import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
    // User reference
    userId: {
        type: String,
        ref: 'User',
        required: true,
        index: true
    },

    // User details at time of payment
    firstName: {
        type: String,
        trim: true
    },
    lastName: {
        type: String,
        trim: true
    },
    email: {
        type: String,
        lowercase: true,
        trim: true
    },

    // Subscription reference
    subscriptionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subscription',
        required: true,
        index: true
    },

    // Razorpay identifiers
    razorpayPaymentId: {
        type: String,
        unique: true,
        sparse: true
    },

    razorpayOrderId: {
        type: String,
        index: true
    },

    razorpaySubscriptionId: {
        type: String,
        index: true
    },

    razorpaySignature: {
        type: String
    },

    // Payment details
    amount: {
        type: Number,
        required: true // in rupees
    },

    currency: {
        type: String,
        default: 'INR'
    },

    status: {
        type: String,
        enum: ['pending', 'authorized', 'captured', 'failed', 'refunded'],
        default: 'pending',
        index: true
    },

    // Payment method information
    method: {
        type: String,
        enum: ['card', 'upi', 'netbanking', 'wallet', 'emi', null],
        default: null
    },

    methodDetails: {
        cardType: String,
        cardNetwork: String,
        cardLast4: String,
        upiId: String,
        bank: String,
        wallet: String
    },

    // Webhook and event data
    webhookEvent: {
        type: String,
        default: null
    },

    webhookData: {
        type: mongoose.Schema.Types.Mixed,
        default: null
    },

    // Error tracking
    errorCode: {
        type: String,
        default: null
    },

    errorDescription: {
        type: String,
        default: null
    },

    errorReason: {
        type: String,
        default: null
    },

    // Refund information
    refundId: {
        type: String,
        default: null
    },

    refundAmount: {
        type: Number,
        default: 0
    },

    refundedAt: {
        type: Date,
        default: null
    },

    // Timestamps for tracking
    authorizedAt: {
        type: Date,
        default: null
    },

    capturedAt: {
        type: Date,
        default: null
    },

    failedAt: {
        type: Date,
        default: null
    },

    // Metadata
    metadata: {
        type: Map,
        of: String,
        default: {}
    },

    // Receipt and invoice
    receipt: {
        type: String,
        default: null
    },

    invoiceId: {
        type: String,
        default: null
    }

}, {
    timestamps: true
});

// Indexes for performance
paymentSchema.index({ userId: 1, status: 1 });
paymentSchema.index({ createdAt: -1 });

// Static method to find payments by user
paymentSchema.statics.findByUser = async function (userId, limit = 10) {
    return await this.find({ userId })
        .sort({ createdAt: -1 })
        .limit(limit)
        .populate('subscriptionId');
};

// Static method to find successful payments
paymentSchema.statics.findSuccessful = async function (userId) {
    return await this.find({
        userId,
        status: { $in: ['authorized', 'captured'] }
    }).sort({ createdAt: -1 });
};

// Avoid model recompilation in dev/hot-reload
const Payment = mongoose.models.Payment || mongoose.model('Payment', paymentSchema);

export default Payment;
