import mongoose from "mongoose";
import { env } from "./env";

export async function connectDB() {
  try {
    mongoose.set("strictQuery", true);
    await mongoose.connect(env.mongodbUri);
    console.log(`Connected to MongoDB`);
  } catch (err) {
    console.error(`Failed to connect to MongoDB at ${env.mongodbUri}`, err);
    throw err;
  }
}
