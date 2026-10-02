import express from "express";
import cors from "cors";
import helmet from "helmet";
import webhookRoutes from "./routes/webhook.routes.js";
import { clerkMiddleware } from "@clerk/express";
import {
  generalRateLimiter,
} from "./middleware/rateLimit.middleware.js";
import { env } from "./config/env.js";
import authRoutes from "./routes/auth.routes.js";
import referralRoutes from "./routes/referral.routes.js";
import { notFoundMiddleware } from "./middleware/notFound.middleware.js";
import { errorMiddleware } from "./middleware/error.middleware.js";
import { requestIdMiddleware } from "./middleware/requestId.middleware.js";
import { requestLoggerMiddleware } from "./middleware/requestLogger.middleware.js";
import { getDependencyHealth } from "./config/health.js";
import { isShuttingDown } from "./utils/runtime.js";
const app = express();
import userSessionRoutes from "./routes/userSession.routes.js";
app.disable("x-powered-by");

// Request identity must exist before any middleware can fail.
app.use(requestIdMiddleware);
app.use(requestLoggerMiddleware);
if (env.isProduction) {
  app.set("trust proxy", 1);
}

/*
|--------------------------------------------------------------------------
| Clerk Middleware
|--------------------------------------------------------------------------
*/

app.use(
  clerkMiddleware({
    authorizedParties: [env.clientUrl],
  }),
);

/*
|--------------------------------------------------------------------------
| Security
|--------------------------------------------------------------------------
*/

app.use(helmet());

/*
|--------------------------------------------------------------------------
| CORS
|--------------------------------------------------------------------------
*/

app.use(
  cors({
    origin: env.clientUrl,
    credentials: true,
  }),
);

app.use("/api/webhooks", webhookRoutes);

/*
|--------------------------------------------------------------------------
| Body Parser
|--------------------------------------------------------------------------
*/

app.use(express.json());

app.use(
  express.urlencoded({
    extended: true,
  }),
);

/*
|--------------------------------------------------------------------------
| Rate Limiter for all api request
|--------------------------------------------------------------------------
*/
app.use("/api/v1", generalRateLimiter);


app.use("/api/v1/referrals", referralRoutes);
/*
|--------------------------------------------------------------------------
| Health Check
|--------------------------------------------------------------------------
*/

app.get("/health", (req, res) => {
  return res.status(200).json({
    success: true,
    status: "ok",
    environment: env.nodeEnv,
    requestId: req.requestId,
  });
});

app.get("/health/live", (req, res) => {
  return res.status(200).json({
    success: true,
    status: "alive",
    requestId: req.requestId,
  });
});

app.get("/health/ready", (req, res) => {
  const health = getDependencyHealth();

  if (isShuttingDown() || !health.ready) {
    return res.status(503).json({
      success: false,
      status: "not_ready",
      dependencies: health,
      requestId: req.requestId,
    });
  }

  return res.status(200).json({
    success: true,
    status: "ready",
    dependencies: health,
    requestId: req.requestId,
  });
});
app.use("/api/v1/auth", authRoutes);

app.use(
  "/api/v1/sessions",
  userSessionRoutes,
);
/*
|--------------------------------------------------------------------------
| 404
|--------------------------------------------------------------------------
*/

app.use(notFoundMiddleware);

/*
|--------------------------------------------------------------------------
| Global Error Handler
|--------------------------------------------------------------------------
*/

app.use(errorMiddleware);

export default app;
