// scripts/manage-promo.js
// Usage: node scripts/manage-promo.js <command> [options]
// Commands:
//   init <promoCode> [maxRedemptions]  - Initialize a new promo
//   status <promoCode>                 - Check promo status
//   reset <promoCode>                  - Reset redemption count
//   setLimit <promoCode> <limit>       - Set max redemptions
//   deactivate <promoCode>             - Deactivate promo
//   activate <promoCode>               - Activate promo
//   list                               - List all promos

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

// Simple PromoRedemption schema for the script
const promoRedemptionSchema = new mongoose.Schema({
    promoCode: String,
    description: String,
    maxRedemptions: Number,
    currentRedemptions: Number,
    redemptions: [{
        userId: String,
        redeemedAt: Date,
        razorpayOrderId: String,
        razorpayPaymentId: String,
        subscriptionId: mongoose.Schema.Types.ObjectId,
        status: String
    }],
    isActive: Boolean,
    offerDetails: {
        planType: String,
        amount: Number,
        durationMonths: Number
    },
    expiresAt: Date
}, { timestamps: true });

const PromoRedemption = mongoose.model('PromoRedemption', promoRedemptionSchema);

async function connectDB() {
    if (!process.env.MONGODB_URI) {
        console.error('❌ MONGODB_URI not found in environment variables');
        process.exit(1);
    }

    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');
    } catch (error) {
        console.error('❌ Failed to connect to MongoDB:', error.message);
        process.exit(1);
    }
}

async function initPromo(promoCode, maxRedemptions = 10) {
    const existing = await PromoRedemption.findOne({ promoCode });
    if (existing) {
        console.log('⚠️  Promo already exists. Use "setLimit" to modify.');
        return;
    }

    const promo = await PromoRedemption.create({
        promoCode,
        description: 'Special 6-Month Offer @ ₹1',
        maxRedemptions: parseInt(maxRedemptions),
        currentRedemptions: 0,
        isActive: true,
        offerDetails: {
            planType: '6_MONTHS',
            amount: 1,
            durationMonths: 6
        }
    });

    console.log('✅ Promo initialized:');
    console.log(`   Code: ${promo.promoCode}`);
    console.log(`   Max Redemptions: ${promo.maxRedemptions}`);
    console.log(`   Status: ${promo.isActive ? 'Active' : 'Inactive'}`);
}

async function getStatus(promoCode) {
    const promo = await PromoRedemption.findOne({ promoCode });
    if (!promo) {
        console.log('❌ Promo not found');
        return;
    }

    console.log('\n📊 Promo Status:');
    console.log('═══════════════════════════════════════');
    console.log(`   Code: ${promo.promoCode}`);
    console.log(`   Description: ${promo.description}`);
    console.log(`   Status: ${promo.isActive ? '🟢 Active' : '🔴 Inactive'}`);
    console.log(`   Redemptions: ${promo.currentRedemptions}/${promo.maxRedemptions}`);
    console.log(`   Remaining Slots: ${promo.maxRedemptions - promo.currentRedemptions}`);
    console.log(`   Amount: ₹${promo.offerDetails?.amount || 1}`);
    console.log(`   Duration: ${promo.offerDetails?.durationMonths || 6} months`);

    if (promo.redemptions && promo.redemptions.length > 0) {
        console.log('\n   📋 Redemption History:');
        promo.redemptions.forEach((r, i) => {
            const status = r.status === 'completed' ? '✅' : r.status === 'pending' ? '⏳' : '❌';
            console.log(`   ${i + 1}. ${status} User: ${r.userId.slice(-8)}... | ${r.redeemedAt?.toLocaleDateString() || 'N/A'}`);
        });
    }
    console.log('═══════════════════════════════════════\n');
}

async function resetPromo(promoCode) {
    const result = await PromoRedemption.findOneAndUpdate(
        { promoCode },
        {
            $set: {
                currentRedemptions: 0,
                redemptions: []
            }
        },
        { new: true }
    );

    if (!result) {
        console.log('❌ Promo not found');
        return;
    }

    console.log('✅ Promo reset successfully');
    console.log(`   Current redemptions: ${result.currentRedemptions}`);
}

async function setLimit(promoCode, limit) {
    const result = await PromoRedemption.findOneAndUpdate(
        { promoCode },
        { $set: { maxRedemptions: parseInt(limit) } },
        { new: true }
    );

    if (!result) {
        console.log('❌ Promo not found');
        return;
    }

    console.log('✅ Limit updated successfully');
    console.log(`   New max redemptions: ${result.maxRedemptions}`);
    console.log(`   Current redemptions: ${result.currentRedemptions}`);
    console.log(`   Remaining slots: ${result.maxRedemptions - result.currentRedemptions}`);
}

async function deactivatePromo(promoCode) {
    const result = await PromoRedemption.findOneAndUpdate(
        { promoCode },
        { $set: { isActive: false } },
        { new: true }
    );

    if (!result) {
        console.log('❌ Promo not found');
        return;
    }

    console.log('✅ Promo deactivated');
}

async function activatePromo(promoCode) {
    const result = await PromoRedemption.findOneAndUpdate(
        { promoCode },
        { $set: { isActive: true } },
        { new: true }
    );

    if (!result) {
        console.log('❌ Promo not found');
        return;
    }

    console.log('✅ Promo activated');
}

async function listPromos() {
    const promos = await PromoRedemption.find({});

    if (promos.length === 0) {
        console.log('📭 No promos found');
        return;
    }

    console.log('\n📋 All Promos:');
    console.log('═══════════════════════════════════════════════════════');
    promos.forEach((p, i) => {
        const status = p.isActive ? '🟢' : '🔴';
        console.log(`${i + 1}. ${status} ${p.promoCode} | ${p.currentRedemptions}/${p.maxRedemptions} redeemed`);
    });
    console.log('═══════════════════════════════════════════════════════\n');
}

async function main() {
    const args = process.argv.slice(2);
    const command = args[0];

    if (!command) {
        console.log(`
┌─────────────────────────────────────────────────────────┐
│              🎁 Promo Management Script                 │
├─────────────────────────────────────────────────────────┤
│  Usage: node scripts/manage-promo.js <command> [args]  │
├─────────────────────────────────────────────────────────┤
│  Commands:                                              │
│    init <code> [maxRedemptions]  Initialize new promo   │
│    status <code>                 Check promo status     │
│    reset <code>                  Reset redemptions      │
│    setLimit <code> <limit>       Set max redemptions    │
│    deactivate <code>             Deactivate promo       │
│    activate <code>               Activate promo         │
│    list                          List all promos        │
└─────────────────────────────────────────────────────────┘
        `);
        process.exit(0);
    }

    await connectDB();

    switch (command) {
        case 'init':
            await initPromo(args[1], args[2] || 10);
            break;
        case 'status':
            await getStatus(args[1]);
            break;
        case 'reset':
            await resetPromo(args[1]);
            break;
        case 'setLimit':
            await setLimit(args[1], args[2]);
            break;
        case 'deactivate':
            await deactivatePromo(args[1]);
            break;
        case 'activate':
            await activatePromo(args[1]);
            break;
        case 'list':
            await listPromos();
            break;
        default:
            console.log('❌ Unknown command:', command);
    }

    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB');
}

main().catch(console.error);
