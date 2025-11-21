import mongoose from "mongoose";

const MONGO_URI =
  process.env.MONGO_URI ||
  "mongodb+srv://singhtiivu_db_user:ycQdNFP55jGaLCL6@revracker.2h2xptb.mongodb.net/?appName=revracker";

let isConnected = false;

async function connectDB() {
  if (isConnected) return mongoose;
  try {
    await mongoose.connect(MONGO_URI, {
      dbName: process.env.MONGO_DB || "mad_backend",
    });
    isConnected = true;
    return mongoose;
  } catch (err) {
    console.error("MongoDB connection error:", err.message);
    throw err;
  }
}

// Auto-connect on import
await connectDB();

export default mongoose;

