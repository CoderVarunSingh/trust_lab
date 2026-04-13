const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: require('path').resolve(__dirname, '../../.env') });

const connectDB = async () => {
  try {
    // Try the configured MONGO_URI first
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.log(`⚠️  Local MongoDB not available. Starting in-memory database...`);
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongod = await MongoMemoryServer.create();
      const uri = mongod.getUri();
      const conn = await mongoose.connect(uri);
      console.log(`✅ In-Memory MongoDB started: ${conn.connection.host}`);
      console.log(`💡 Data will be lost on server restart. For persistence, install MongoDB locally.`);

      // Auto-seed when using in-memory DB
      try {
        const seedDB = require('../seed/seed');
        await seedDB();
        console.log(`🌱 Demo data seeded automatically.`);
      } catch (seedErr) {
        console.log(`⚠️  Auto-seed skipped: ${seedErr.message}`);
      }
    } catch (memErr) {
      console.error(`❌ MongoDB Error: ${error.message}`);
      console.error(`❌ In-Memory fallback also failed: ${memErr.message}`);
      process.exit(1);
    }
  }
};

module.exports = connectDB;

