// models/ReferralAccessRequest.js
import mongoose from 'mongoose';

const referralAccessRequestSchema = new mongoose.Schema({
    // Clerk user ID of the requester
    clerkUserId: {
        type: String,
        required: true,
        index: true
    },

    // User details captured at the time of request
    name: { type: String, default: 'Unknown' },
    email: { type: String, default: '' },
    imageUrl: { type: String, default: '' },
    referralCode: { type: String, sparse: true, unique: true },

    // Request lifecycle
    status: {
        type: String,
        enum: ['REQUESTED', 'APPROVED', 'REJECTED'],
        default: 'REQUESTED',
        index: true
    },

    // When the request was submitted
    requestedAt: {
        type: Date,
        default: Date.now
    },

    // When admin reviewed
    reviewedAt: {
        type: Date,
        default: null
    },

    // Admin who reviewed
    reviewedBy: {
        type: String,
        default: null
    }
}, {
    timestamps: true
});

// One active request per user
referralAccessRequestSchema.index({ clerkUserId: 1, status: 1 });

// Force recompilation to pick up schema changes during dev hot-reload
if (mongoose.models.ReferralAccessRequest) {
    delete mongoose.models.ReferralAccessRequest;
}
const ReferralAccessRequest = mongoose.model('ReferralAccessRequest', referralAccessRequestSchema);

export default ReferralAccessRequest;
