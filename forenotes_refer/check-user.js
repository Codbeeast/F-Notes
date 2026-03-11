import mongoose from "mongoose";
import User from "./models/User.js";

async function run() {
    await mongoose.connect('mongodb+srv://vishwakarmapriyanshu9099:WYCqxf1olIxoqEAm@cluster0.pb1f3.mongodb.net/tradejournal');
    const users = await User.find({}).lean();
    console.log(JSON.stringify(users, null, 2));
    process.exit(0);
}

run().catch(console.error);
