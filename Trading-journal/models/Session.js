// models/Session.js

import mongoose from 'mongoose';

const { Schema, model, models } = mongoose;

const SessionSchema = new Schema(
  {
    // Link each session to a specific user
    userId: {
      type: String,
      required: true,
      index: true
    },

    // Human-friendly session title
    sessionName: {
      type: String,
      required: true
    },

    // Primary trading pair for the session
    pair: {
      type: String,
      required: true
    },

    // Optional free-form details
    description: {
      type: String,
      default: ''
    },

    // Session time window
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date
    },

    // Workflow status
    status: {
      type: String,
      enum: ['active', 'completed', 'paused'],
      default: 'active'
    },

    // Any extra notes
    notes: {
      type: String,
      default: ''
    },

    // Which strategies belong to this session
    strategies: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Strategy'
      }
    ]
  },
  {
    timestamps: true
  }
);

// Compound index to fetch a user's sessions in reverse-chronological order
SessionSchema.index({ userId: 1, createdAt: -1 });

export default models.Session || model('Session', SessionSchema);