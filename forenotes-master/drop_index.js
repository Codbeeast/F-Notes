const mongoose = require('mongoose');

async function dropIndex() {
    console.log("Connecting...");
    await mongoose.connect('mongodb+srv://vishwakarmapriyanshu9099:WYCqxf1olIxoqEAm@cluster0.pb1f3.mongodb.net/tradejournal?retryWrites=true&w=majority');
    
    console.log("Dropping clerkId_1 index from users...");
    try {
        const User = mongoose.connection.collection('users');
        await User.dropIndex('clerkId_1');
        console.log("✅ Index dropped successfully.");
    } catch (e) {
        console.error("❌ Failed to drop index:", e.message);
    }
    
    process.exit(0);
}

dropIndex().catch(console.error);
