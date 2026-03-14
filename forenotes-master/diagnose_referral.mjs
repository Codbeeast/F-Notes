import mongoose from "mongoose";

const mongoUri = "mongodb+srv://vishwakarmapriyanshu9099:WYCqxf1olIxoqEAm@cluster0.pb1f3.mongodb.net/tradejournal";

mongoose.connect(mongoUri).then(async () => {
  const db = mongoose.connection.useDb("tradejournal");

  const signups = await db.collection("referralsignups").find({}).sort({ createdAt: -1 }).limit(10).toArray();
  const referrals = await db.collection("referrals").find({}).sort({ createdAt: -1 }).limit(10).toArray();
  const usersWithCode = await db.collection("users").find({ referralCode: { $exists: true, $ne: null } }).project({ _id: 1, referralCode: 1, referralEnabled: 1 }).toArray();
  const approved = await db.collection("referralaccessrequests").find({ status: "APPROVED" }).project({ clerkUserId: 1, referralCode: 1, status: 1 }).toArray();

  const result = {
    ReferralSignups: signups.map(s => ({ userId: s.userId, code: s.referralCode, status: s.status, error: s.errorMessage })),
    Referrals: referrals.map(r => ({ referrerId: r.referrerId, referredUserId: r.referredUserId, code: r.referralCode, status: r.status })),
    UsersWithCodes: usersWithCode.map(u => ({ id: u._id, code: u.referralCode, enabled: u.referralEnabled })),
    ApprovedRequests: approved.map(a => ({ userId: a.clerkUserId, code: a.referralCode, status: a.status })),
  };

  console.log(JSON.stringify(result, null, 2));
  mongoose.disconnect();
}).catch(console.error);
