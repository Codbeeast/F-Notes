// models/AdminSettings.js
import mongoose from 'mongoose';

const adminSettingsSchema = new mongoose.Schema({
    _id: {
        type: String,
        default: 'referral_settings'
    },

    // Reward calculation mode
    rewardMode: {
        type: String,
        enum: ['fixed', 'percentage'],
        default: 'fixed'
    },

    // Fixed reward amount in paise (3000 = ₹30)
    fixedAmount: {
        type: Number,
        default: 3000
    },

    // Percentage reward (e.g. 30 = 30%)
    percentage: {
        type: Number,
        default: 30
    },

    // Minimum purchase amount in paise to qualify for referral reward
    minPurchaseAmount: {
        type: Number,
        default: 0
    },

    // Settings apply from this date (future changes don't affect past referrals)
    applyFrom: {
        type: Date,
        default: Date.now
    },

    updatedAt: {
        type: Date,
        default: Date.now
    },

    updatedBy: {
        type: String,
        default: null
    }
}, {
    _id: false // We set _id manually
});

const AdminSettings = mongoose.models.AdminSettings || mongoose.model('AdminSettings', adminSettingsSchema);

export default AdminSettings;

// Helper: get or create the singleton settings document
export async function getSettings() {
    let settings = await AdminSettings.findById('referral_settings').lean();
    if (!settings) {
        settings = await AdminSettings.create({ _id: 'referral_settings' });
        settings = settings.toObject();
    }
    return settings;
}
