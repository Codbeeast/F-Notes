// Quick DB check script - run in MongoDB shell or via API
// This will help diagnose the subscription state issue

const userId = "YOUR_USER_ID_HERE"; // Replace with actual user ID

db.subscriptions.find({ userId: userId }).forEach(sub => {
    console.log("\n=== Subscription Debug Info ===");
    console.log("Subscription ID:", sub._id);
    console.log("Status:", sub.status);
    console.log("isTrialActive:", sub.isTrialActive);
    console.log("trialStartDate:", sub.trialStartDate);
    console.log("trialEndDate:", sub.trialEndDate);
    console.log("currentPeriodStart:", sub.currentPeriodStart);
    console.log("currentPeriodEnd:", sub.currentPeriodEnd);
    console.log("createdAt:", sub.createdAt);
    console.log("updatedAt:", sub.updatedAt);

    // Check query conditions
    const now = new Date();
    const statusMatch = ['trial', 'active'].includes(sub.status);
    const trialCondition = sub.isTrialActive && sub.trialEndDate > now;
    const activeCondition = sub.status === 'active' && sub.currentPeriodEnd > now;
    const orCondition = trialCondition || activeCondition;

    console.log("\n--- Query Condition Checks ---");
    console.log("Status in ['trial', 'active']:", statusMatch);
    console.log("Trial condition (isTrialActive && trialEndDate > now):", trialCondition);
    console.log("Active condition (status='active' && currentPeriodEnd > now):", activeCondition);
    console.log("$or condition met:", orCondition);
    console.log("SHOULD MATCH:", statusMatch && orCondition);
    console.log("===============================\n");
});
