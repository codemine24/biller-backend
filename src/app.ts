import cookiePerser from "cookie-parser";
import cors from "cors";
import express, { Application, Request, Response } from "express";
import httpStatus from "http-status";
import globalErrorHandler from "./app/middlewares/global-error-handler";
import notFoundHandler from "./app/middlewares/not-found-handler";
import router from "./app/routes";

const app: Application = express();

// third party middleware configuration
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookiePerser());
app.use(
  cors({
    origin: ["http://localhost:5173"],
    credentials: true,
  })
);

// test server
app.get("/", (req: Request, res: Response) => {
  res.status(httpStatus.OK).json({
    success: true,
    message: "Biller server is working fine",
  });
});

// main routes
app.use("/api/v1", router);

// handle error
app.use(globalErrorHandler);
app.use(notFoundHandler);

export default app;
