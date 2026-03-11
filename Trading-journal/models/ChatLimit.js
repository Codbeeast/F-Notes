import mongoose from 'mongoose';

const chatLimitSchema = new mongoose.Schema({
    userId: {
        type: String, // Clerk User ID
        required: true,
        unique: true,
        index: true
    },
    username: {
        type: String, // Clerk Username
        required: false
    },
    email: {
        type: String, // Clerk Email (optional but useful)
        required: false
    },
    monthlyLimit: {
        type: Number,
        default: 60,
        required: true
    },
    promptsUsed: {
        type: Number,
        default: 0
    },
    lastResetDate: {
        type: Date,
        default: Date.now
    },
    currentMonth: {
        type: String,
        required: true,
        default: () => {
            const now = new Date();
            return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        }
    }
}, { timestamps: true });

// Prevent recompilation
const ChatLimit = mongoose.models.ChatLimit || mongoose.model('ChatLimit', chatLimitSchema);

export default ChatLimit;
