import express, { Request, Response, NextFunction } from "express";
import { initializeTelexSDK } from "../src/index";

const app = express();
const port = 3111;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Test route
app.get("/", (req: Request, res: Response) => {
  res.json({ message: "Welcome to the Express server!" });
});

// throw errors at intervals
setInterval(() => {
  throw new Error("Test error");
}, 1000);

// Start server
app.listen(port, () => {
  console.log(`🚀 Server is running on port ${port}`);

  initializeTelexSDK({
    channelId: "0195b5ce-63bf-7837-a690-8aa9fab5965b",
  });
});
