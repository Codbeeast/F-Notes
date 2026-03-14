import mongoose from "mongoose";

const mongoUri = "mongodb+srv://vishwakarmapriyanshu9099:WYCqxf1olIxoqEAm@cluster0.pb1f3.mongodb.net/tradejournal";

mongoose.connect(mongoUri)
  .then(async () => {
    console.log("Connected to MongoDB");
    const db = mongoose.connection.useDb("tradejournal");
    
    // Find users with actual referral codes
    const users = await db.collection("users").find({ referralCode: { $exists: true, $ne: "" } }).limit(5).toArray();
    console.log("Valid referral codes to test with:");
    users.forEach(u => console.log(`- ${u.referralCode} (User: ${u.firstName} ${u.lastName})`));
    
    mongoose.disconnect();
  })
  .catch(console.error);
