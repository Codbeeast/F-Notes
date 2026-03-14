// models/Plan.js
import mongoose from 'mongoose';

const planSchema = new mongoose.Schema({
    // Plan identifier
    planId: {
        type: String,
        required: true,
        unique: true,
        enum: ['1_MONTH', '3_MONTHS', '6_MONTHS', '12_MONTHS']
    },

    // Display information
    name: {
        type: String,
        required: true
    },

    description: {
        type: String,
        default: ''
    },

    // Razorpay plan ID
    razorpayPlanId: {
        type: String,
        required: true,
        unique: true
    },

    // Pricing details
    amount: {
        type: Number,
        required: true // total amount in rupees
    },

    currency: {
        type: String,
        default: 'INR'
    },

    // Billing configuration
    billingCycle: {
        type: String,
        enum: ['monthly', 'quarterly', 'half_yearly', 'yearly'],
        required: true
    },

    billingPeriod: {
        type: Number,
        required: true // number of months
    },

    // Bonus/free period
    bonusMonths: {
        type: Number,
        default: 0
    },

    totalMonths: {
        type: Number,
        required: true // billingPeriod + bonusMonths
    },

    // Pricing calculations
    monthlyEquivalent: {
        type: Number,
        required: true // amount / totalMonths
    },

    savingsPercentage: {
        type: Number,
        default: 0
    },

    // Features
    features: [{
        name: String,
        description: String,
        included: {
            type: Boolean,
            default: true
        }
    }],

    // Display preferences
    isPopular: {
        type: Boolean,
        default: false
    },

    displayOrder: {
        type: Number,
        default: 0
    },

    // Status
    isActive: {
        type: Boolean,
        default: true
    },

    // Trial configuration
    trialDays: {
        type: Number,
        default: 7
    }

}, {
    timestamps: true
});

// Virtual for formatted price display
planSchema.virtual('displayPrice').get(function () {
    return `₹${this.amount.toLocaleString('en-IN')}`;
});

// Virtual for bonus display
planSchema.virtual('bonusDisplay').get(function () {
    if (this.bonusMonths === 0) return null;
    return `+ ${this.bonusMonths} month${this.bonusMonths > 1 ? 's' : ''} free`;
});

// Static method to get all active plans
planSchema.statics.getActivePlans = async function () {
    return await this.find({ isActive: true }).sort({ displayOrder: 1 });
};

// Static method to get plan by ID
planSchema.statics.getByPlanId = async function (planId) {
    return await this.findOne({ planId, isActive: true });
};

// Avoid model recompilation in dev/hot-reload
const Plan = mongoose.models.Plan || mongoose.model('Plan', planSchema);

export default Plan;
