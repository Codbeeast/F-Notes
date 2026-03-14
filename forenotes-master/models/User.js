// models/User.js
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  // use Clerk user id as primary key
  _id: { type: String, required: true },

  // required profile fields
  email: { type: String, required: true, lowercase: true, trim: true },
  username: { type: String, required: true, unique: true, sparse: true, trim: true },
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  imageUrl: { type: String, required: true, trim: true },

  // chat usage tracking for monthly limits
  chatUsage: {
    monthlyPromptCount: { type: Number, default: 0 },
    monthlyLimit: { type: Number, default: 60 }, // Configurable limit per user
    lastResetDate: {
      type: Date,
      default: function () {
        const now = new Date();
        return new Date(now.getFullYear(), now.getMonth(), 1);
      }
    },
    currentMonth: {
      type: String,
      default: function () {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      }
    }
  },

}, {
  timestamps: true,    // adds createdAt and updatedAt
});

// avoid model recompilation in dev/hot-reload
const User = mongoose.models.User || mongoose.model('User', userSchema);

export default User;