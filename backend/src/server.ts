import { app } from "./app";
import { connectDB } from "./config/db";
import { env } from "./config/env";

async function startServer() {
  try {
    await connectDB();
  } catch (err) {
    console.error("Could not connect to the database, shutting down", err);
    process.exit(1);
  }

  app.listen(env.port, () => {
    console.log(`Server listening on http://localhost:${env.port}`);
  });
}

startServer();
