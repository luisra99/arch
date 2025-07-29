import cron from "node-cron";
import app from "./app";
import logger from "@libs/logger";
import { errorLogger } from "@middlewares/error.logs.middleware";
import { authenticate } from "./auth/middlewares/auth.middleware";
import AuthRoute from "./auth/routes";
import Common from "@modules/common"
import ProspectsFiles from "@modules/prospects-documentation";
import Prospects from "@modules/prospects"
import { sendUnattendedProspectsEmailService } from "@modules/prospects/services/mailing.prospect.service";
import { env } from "@config/env";

const os = require("os");
const cluster = require("cluster");

if (cluster.isMaster) {
  const numCPUs = os.cpus().length;
  console.log(`Master ${process.pid} está corriendo`);

  // Crear un worker por cada núcleo
  for (let i = 0; i < 1; i++) {
    cluster.fork();
  }
  
  // Reiniciar un worker si falla
  cluster.on("exit", (worker: any) => {
    console.log(`Worker ${worker.process.pid} murió, creando uno nuevo...`);
    cluster.fork();
  });
} else {
  cron.schedule("30 11 * * *", ()=>sendUnattendedProspectsEmailService());
  cron.schedule("30 07 * * *", ()=>sendUnattendedProspectsEmailService());
  
  app.use(AuthRoute);
  app.use(Prospects);
  app.use(ProspectsFiles);
  app.use(authenticate, Common);
  
  app.use(errorLogger);
  app.listen(env.PORT, () => {
    logger.info(
      `Worker ${process.pid} escuchando en el puerto ${env.PORT}`
    );
  });
}
