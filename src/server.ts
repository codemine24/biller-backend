import { seedOwner } from "./app/db/index";
import http from "http";
import cron from "node-cron";
import app from "./app";
import clearOldOTPs from "./app/utils/clear-old-otps";
import config from "./app/config";

const port = config.port || 9000;

const server = http.createServer(app);

async function main() {
  try {
    await seedOwner();

    // start server
    server.listen(port, () => {
      console.log(`Biller server is running on port ${port}`);
    });

    // cron schedule to clear OTP
    cron.schedule("0 0 * * *", () => {
      clearOldOTPs();
    });
  } catch (error) {
    console.log(error);
  }
}

// handle unhandledRejection
process.on("unhandledRejection", () => {
  console.log("Unhandled rejection is detected. shutting down...");
  if (server) {
    server.close(() => {
      process.exit(1);
    });
  }
  process.exit(1);
});

// handle uncaught expception
process.on("uncaughtException", () => {
  console.log("Uncaught exception is detected. shutting down...");
  process.exit(1);
});

main();
