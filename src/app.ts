const compression = require("compression");
import express from "express";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import cors from "cors";
import * as dotenv from "dotenv";

dotenv.config();
const app = express();
app.use(
  cors({
    origin: "*",
    credentials: true,
  })
);

app.use(compression());
app.use(express.json());
app.use(morgan("dev"));
app.use(cookieParser());

export default app;
