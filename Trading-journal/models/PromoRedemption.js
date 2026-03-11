// models/PromoRedemption.js
import mongoose from 'mongoose';

const redemptionRecordSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    redeemedAt: {
        type: Date,
        default: Date.now
    },
    razorpayOrderId: {
        type: String,
        required: true
    },
    razorpayPaymentId: {
        type: String,
        default: null
    },
    subscriptionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subscription'
    },
    status: {
        type: String,
        enum: ['pending', 'completed', 'expired'],
        default: 'pending'
    }
}, { _id: false });

const promoRedemptionSchema = new mongoose.Schema({
    promoCode: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    description: {
        type: String,
        default: 'Special Promo Offer'
    },
    maxRedemptions: {
        type: Number,
        default: 20
    },
    currentRedemptions: {
        type: Number,
        default: 0
    },
    redemptions: [redemptionRecordSchema],
    isActive: {
        type: Boolean,
        default: true
    },
    offerDetails: {
        planType: {
            type: String,
            default: '6_MONTHS'
        },
        amount: {
            type: Number,
            default: 1 // ₹1
        },
        durationMonths: {
            type: Number,
            default: 6
        }
    },
    expiresAt: {
        type: Date,
        default: null
    }
}, {
    timestamps: true
});

// Method to check if promo is still available
promoRedemptionSchema.methods.isAvailable = function () {
    if (!this.isActive) return false;
    if (this.expiresAt && this.expiresAt < new Date()) return false;
    if (this.currentRedemptions >= this.maxRedemptions) return false;
    return true;
};

// Method to get remaining slots
promoRedemptionSchema.methods.remainingSlots = function () {
    return Math.max(0, this.maxRedemptions - this.currentRedemptions);
};

// Static method for atomic slot reservation
promoRedemptionSchema.statics.reserveSlot = async function (promoCode, userId, razorpayOrderId) {
    // Atomic operation: only increment if under limit
    const result = await this.findOneAndUpdate(
        {
            promoCode,
            isActive: true,
            $expr: { $lt: ['$currentRedemptions', '$maxRedemptions'] },
            // Check expiry
            $or: [
                { expiresAt: null },
                { expiresAt: { $gt: new Date() } }
            ]
        },
        {
            $inc: { currentRedemptions: 1 },
            $push: {
                redemptions: {
                    userId,
                    razorpayOrderId,
                    redeemedAt: new Date(),
                    status: 'pending'
                }
            }
        },
        {
            new: true,
            runValidators: true
        }
    );

    return result;
};

// Static method to complete a redemption
promoRedemptionSchema.statics.completeRedemption = async function (promoCode, razorpayOrderId, razorpayPaymentId, subscriptionId) {
    return await this.findOneAndUpdate(
        {
            promoCode,
            'redemptions.razorpayOrderId': razorpayOrderId
        },
        {
            $set: {
                'redemptions.$.razorpayPaymentId': razorpayPaymentId,
                'redemptions.$.subscriptionId': subscriptionId,
                'redemptions.$.status': 'completed'
            }
        },
        { new: true }
    );
};

// Static method to release a slot (on payment failure/expiry)
promoRedemptionSchema.statics.releaseSlot = async function (promoCode, razorpayOrderId) {
    return await this.findOneAndUpdate(
        {
            promoCode,
            'redemptions.razorpayOrderId': razorpayOrderId,
            'redemptions.status': 'pending'
        },
        {
            $inc: { currentRedemptions: -1 },
            $set: { 'redemptions.$.status': 'expired' }
        },
        { new: true }
    );
};

const PromoRedemption = mongoose.models.PromoRedemption || mongoose.model('PromoRedemption', promoRedemptionSchema);

export default PromoRedemption;
