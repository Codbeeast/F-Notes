// models/Trade.js
import mongoose from 'mongoose';
const { Schema, model, models } = mongoose;

const TradeSchema = new Schema(
  {
    // Link every trade to a specific user
    userId: {
      type: String,
      required: true,
      index: true
    },
    // Reference to parent strategy, scoped per user
    strategy: {
      type: Schema.Types.ObjectId,
      ref: 'Strategy',
      required: true,
      index: true
    },
    // Core trade details
    date: {
      type: Date,
      required: true
    },
    time: {
      type: String,
      required: true
    },
    session: {
      type: String,
      required: true
    },
    market: {
      type: String,
      required: true
    },
    pair: {
      type: String,
      required: true
    },
    positionType: {
      type: String,
      required: true
    },
    entry: {
      type: Number,
      required: true
    },
    exit: {
      type: Number,
      required: true
    },
    // Strategy metadata captured on the trade
    setupType: {
      type: String,
      required: true
    },
    confluences: {
      type: [String],
      default: [],
      required: true
    },
    entryType: {
      type: String,
      required: true
    },
    timeFrame: {
      type: String,
      required: true
    },
    // Risk and performance metrics
    risk: {
      type: Number,
      min: [0, 'Risk cannot be negative'],
      max: [100, 'Risk cannot exceed 100%']
    },
    lotSize: {
      type: Number,
      min: [0.01, 'Lot size must be at least 0.01'],
      default: 0.01
    },
    rFactor: {
      type: Number
      // Removed min validation to allow negative values
    },
    rulesFollowed: {
      type: String,
      enum: ['Yes', 'No', 'Partially'],
      default: 'Yes'
    },
    pipsLost: Number,
    pipsGain: Number,
    pnl: {
      type: Number,
      required: true
    },
    // News events
    news: String,
    affectedByNews: {
      type: String,
      enum: ['affected', 'not affected'],
      default: 'not affected'
    },
    newsImpactDetails: {
      type: String,
      default: ''
    },
    // Visuals and commentary - Updated to support multiple images
    image: String, // Keep for backward compatibility
    images: {
      type: [String], // Array of image URLs for multiple image support
      default: [],
      validate: {
        validator: function (images) {
          return images.length <= 10; // Maximum 10 images per trade
        },
        message: 'Maximum 10 images allowed per trade'
      }
    },
    notes: String,
    // Actions taken during the setup
    actions: {
      type: [String],
      default: []
    },
    // Behavioral and confidence ratings (1–10), in the order: patience, confidence
    fearToGreed: {
      type: Number,
      min: 1,
      max: 10,
      required: true  // Make it required instead of having a default
    },
    fomoRating: {
      type: Number,
      min: 1,
      max: 10,
      required: true
    },
    executionRating: {
      type: Number,
      min: 1,
      max: 10,
      required: true
    },
    patience: {
      type: Number,
      min: 1,
      max: 10,
      required: true
    },
    confidence: {
      type: Number,
      min: 1,
      max: 10,
      required: true
    },
  },
  { timestamps: true }
);

// Pre-save middleware to handle backward compatibility and data consistency
TradeSchema.pre('save', function (next) {
  // Ensure images is always an array
  if (!this.images) {
    this.images = [];
  }

  // If images array is provided but image field is empty, set image to first image for backward compatibility
  if (this.images && this.images.length > 0 && !this.image) {
    this.image = this.images[0];
  }

  // If image field is provided but images array is empty, add it to images array
  if (this.image && (!this.images || this.images.length === 0)) {
    this.images = [this.image];
  }

  // If both image and images exist, ensure image is in the images array
  if (this.image && this.images && this.images.length > 0) {
    if (!this.images.includes(this.image)) {
      this.images.unshift(this.image); // Add to beginning to maintain primary image
    }
  }

  // Remove duplicates and filter out empty/null values from images array
  if (this.images && this.images.length > 0) {
    this.images = [...new Set(this.images.filter(img => img && img.trim() !== ''))];
  }

  // If images array becomes empty, clear the primary image field too
  if (!this.images || this.images.length === 0) {
    this.image = '';
    this.images = [];
  }

  next();
});

// Virtual field to get all images (combines image and images for full compatibility)
TradeSchema.virtual('allImages').get(function () {
  const imageSet = new Set();

  // Add single image if exists
  if (this.image && this.image.trim() !== '') {
    imageSet.add(this.image);
  }

  // Add images array if exists
  if (this.images && this.images.length > 0) {
    this.images.forEach(img => {
      if (img && img.trim() !== '') {
        imageSet.add(img);
      }
    });
  }

  return Array.from(imageSet);
});

// Virtual field to get image count
TradeSchema.virtual('imageCount').get(function () {
  return this.allImages.length;
});

// Method to add image to the trade
TradeSchema.methods.addImage = function (imageUrl) {
  if (!imageUrl || imageUrl.trim() === '') return false;

  if (!this.images) this.images = [];

  // Don't add if already exists
  if (this.images.includes(imageUrl)) return false;

  this.images.push(imageUrl);

  // Set as primary image if it's the first one
  if (!this.image) {
    this.image = imageUrl;
  }

  return true;
};

// Method to remove image from the trade
TradeSchema.methods.removeImage = function (imageUrl) {
  if (!imageUrl || !this.images) return false;

  const initialLength = this.images.length;
  this.images = this.images.filter(img => img !== imageUrl);

  // If the removed image was the primary image, set new primary
  if (this.image === imageUrl) {
    this.image = this.images.length > 0 ? this.images[0] : '';
  }

  return this.images.length < initialLength;
};

// Compound indexes for efficient per-user and per-strategy lookups
TradeSchema.index({ userId: 1, createdAt: -1 });
TradeSchema.index({ userId: 1, strategy: 1, createdAt: -1 });
TradeSchema.index({ userId: 1, date: -1 }); // For date-based queries

// Ensure virtual fields are included in JSON output
TradeSchema.set('toJSON', { virtuals: true });
TradeSchema.set('toObject', { virtuals: true });

// Check if the model exists and delete it to prevent "OverwriteModelError"
// whilst allowing schema updates in development
if (mongoose.models.Trade) {
  delete mongoose.models.Trade;
}

export default model('Trade', TradeSchema);