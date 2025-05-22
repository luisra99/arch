import AuthRoute from "./auth/routes";
import ConceptRoute from "./routes/concepts.route";
import OptionsRoute from "./routes/options.route";
import Debug from "./routes/debug.route";
const os = require("os");

import UserRoute from "./routes/users.route";
import { authenticate } from "./auth/middlewares/auth.middleware";
import { logger } from "./utils/logger";
import { errorHandler } from "./middlewares/errorLogs.middleware";
import app from "./app";
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
  app.use(Debug);
  app.use(AuthRoute);
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
