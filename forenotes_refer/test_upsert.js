const mongoose = require('mongoose');

async function testUpdate() {
    await mongoose.connect('mongodb+srv://vishwakarmapriyanshu9099:WYCqxf1olIxoqEAm@cluster0.pb1f3.mongodb.net/tradejournal?retryWrites=true&w=majority');
    
    // Test the upsert from the Admin API
    try {
        const id = 'test_user_123';
        const User = mongoose.connection.collection('users');
        
        // Wait, the API uses Mongoose model! I need to use the model.
        // Let's import the model.
        const userSchema = new mongoose.Schema({
            _id: { type: String, required: true },
            email: { type: String, required: true, lowercase: true, trim: true },
            username: { type: String, required: true, unique: true, sparse: true, trim: true },
            firstName: { type: String, required: true, trim: true },
            lastName: { type: String, required: true, trim: true },
            imageUrl: { type: String, required: true, trim: true },
            role: { type: String, default: 'user' },
            referralCode: { type: String, unique: true, sparse: true },
            referralEnabled: { type: Boolean, default: false },
        });
        const UserModel = mongoose.models.User || mongoose.model('User', userSchema);
        
        console.log("Attempting upsert...");
        const res = await UserModel.findByIdAndUpdate(
            id,
            { $set: { referralCode: 'TESTCODE', referralEnabled: true } },
            { new: true, upsert: true }
        );
        console.log("Upsert succeeded:", res);
        
        await UserModel.findByIdAndDelete(id);
    } catch (e) {
        console.error("Upsert failed:", e.message);
    }
    process.exit(0);
}

testUpdate().catch(console.error);
