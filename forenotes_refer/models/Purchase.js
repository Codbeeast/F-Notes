// models/Purchase.js
import mongoose from 'mongoose';

const purchaseSchema = new mongoose.Schema({
    // Clerk user ID of the purchaser
    clerkUserId: {
        type: String,
        required: true,
        index: true
    },

    // Amount in paise (integer)
    amount: {
        type: Number,
        required: true
    },

    // Payment status
    status: {
        type: String,
        enum: ['SUCCESS', 'FAILED'],
        default: 'SUCCESS'
    }
}, {
    timestamps: true
});

purchaseSchema.index({ clerkUserId: 1 });

const Purchase = mongoose.models.Purchase || mongoose.model('Purchase', purchaseSchema);

export default Purchase;
