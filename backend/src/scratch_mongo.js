import mongoose from 'mongoose';

const MONGO_URI = 'mongodb://sheetalchouhan689_db_user:jc6VFFvzEMPsRuDC@ac-1c0zxlt-shard-00-00.oi3bnub.mongodb.net:27017,ac-1c0zxlt-shard-00-01.oi3bnub.mongodb.net:27017,ac-1c0zxlt-shard-00-02.oi3bnub.mongodb.net:27017/DealingIndiaPoster?ssl=true&replicaSet=atlas-q26ycz-shard-0&authSource=admin&retryWrites=true&w=majority';

async function run() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGO_URI);
    console.log("Connected.");

    const db = mongoose.connection.db;
    const users = await db.collection('users').find({}).toArray();

    console.log(`Total Users: ${users.length}`);
    
    console.log("\n--- ALL USERS DATA ---");
    users.forEach(u => {
      console.log(`ID: ${u._id} | Mobile: ${u.mobileNumber} | Email: "${u.email}" | Name: ${u.name} | RefCode: ${u.referralCode}`);
    });

    // Look for conflicting records (e.g. empty strings or nulls)
    const emptyEmails = users.filter(u => u.email === "" || u.email === null);
    console.log(`\nUsers with empty string or null email: ${emptyEmails.length}`);
    emptyEmails.forEach(u => console.log(`Duplicate potential email ID: ${u._id}`));

    const emptyMobiles = users.filter(u => u.mobileNumber === "" || u.mobileNumber === null);
    console.log(`\nUsers with empty string or null mobileNumber: ${emptyMobiles.length}`);

    // Let's list unique index errors if any
    const indexes = await db.collection('users').indexes();
    console.log("\n--- CURRENT INDEXES ---");
    console.log(JSON.stringify(indexes, null, 2));

  } catch (err) {
    console.error("Error running diagnostics:", err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

run();
