// Script to check and update chat limits
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import { connectDB } from '../lib/db.js';
import ChatLimit from '../models/ChatLimit.js';
import User from '../models/User.js'; // Also check User collection

async function checkAndUpdateLimits() {
    try {
        await connectDB();
        console.log('✅ Connected to database');

        // 1. Update ChatLimit collection
        const chatLimits = await ChatLimit.find({});
        console.log(`\n📊 Found ${chatLimits.length} document(s) in ChatLimit collection`);

        if (chatLimits.length > 0) {
            chatLimits.forEach((limit, index) => {
                console.log(`   User ${index + 1} (${limit.userId}): ${limit.promptsRemaining}/${limit.monthlyLimit}`);
            });

            const result = await ChatLimit.updateMany(
                {},
                { $set: { monthlyLimit: 60, promptsRemaining: 60 } }
            );
            console.log(`   ✅ Updated ${result.modifiedCount} ChatLimit document(s) to 60`);
        }

        // 2. Update User collection (chatUsage field)
        const users = await User.find({ 'chatUsage.monthlyLimit': { $lt: 60 } });
        console.log(`\n📊 Found ${users.length} user(s) with old limit in User collection`);

        if (users.length > 0) {
            const userResult = await User.updateMany(
                {},
                { $set: { 'chatUsage.monthlyLimit': 60 } }
            );
            console.log(`   ✅ Updated ${userResult.modifiedCount} User document(s) to 60`);
        }

        console.log('\n✅ Database update complete!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

checkAndUpdateLimits();
