const mongoose = require('mongoose');

// Schema definition (simplified)
const chatLimitSchema = new mongoose.Schema({
    userId: String,
    monthlyLimit: Number,
    promptsUsed: Number,
    currentMonth: String
}, { timestamps: true });

const ChatLimit = mongoose.models.ChatLimit || mongoose.model('ChatLimit', chatLimitSchema);

const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });
const MONGODB_URI = process.env.MONGODB_URI;

async function checkUserLimit() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log("Connected to DB");

        const userId = "user_318xzqyXLywBgjkZSTqLgrkjrxn";
        const limitDoc = await ChatLimit.findOne({ userId });

        console.log("Found Document:");
        console.log(limitDoc);

        if (limitDoc) {
            console.log(`Prompts Used: ${limitDoc.promptsUsed}`);
            console.log(`Monthly Limit: ${limitDoc.monthlyLimit}`);
            console.log(`Is Limit Reached? ${limitDoc.promptsUsed >= limitDoc.monthlyLimit}`);
        } else {
            console.log("No document found for user.");
        }

    } catch (error) {
        console.error("Error:", error);
    } finally {
        await mongoose.disconnect();
    }
}

checkUserLimit();
