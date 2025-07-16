import AuthRoute from "./auth/routes";
import ConceptRoute from "./routes/common/concepts.route";
import OptionsRoute from "./routes/common/options.route";
import Debug from "./routes/common/debug.route";
import Prospects from "./routes/prospects.route";
import cron from "node-cron";
import UserRoute from "./routes/common/users.route";
import { authenticate } from "./auth/middlewares/auth.middleware";
import { logger } from "./utils/logger";
import { errorHandler } from "./middlewares/errorLogs.middleware";
import app from "./app";
import { sendUnattendedProspectsEmail } from "./services/prospect.service";
import ProspectsFiles from "./modules/prospects-documentation";

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
  cron.schedule("30 11 * * *", sendUnattendedProspectsEmail);
  cron.schedule("30 07 * * *", sendUnattendedProspectsEmail);
  app.use(Debug);
  app.use(AuthRoute);
  app.use(Prospects);
  app.use(ProspectsFiles);
  app.use(authenticate, UserRoute);
  app.use(authenticate, OptionsRoute);
  app.use(authenticate, ConceptRoute);
  
  app.use(errorHandler);
  app.listen(process.env.PORT, () => {
    logger.info(
      `Worker ${process.pid} escuchando en el puerto ${process.env.PORT}`
    );
  });
}
