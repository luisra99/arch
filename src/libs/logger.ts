import pino from 'pino';
// Destino para los errores

const logger = pino(
  {
    level: 'info', // Solo info y más severos
    transport: {
      targets: [
        {
          target: 'pino-pretty', // Para consola bonita
          options: {
            colorize: true,
            translateTime: 'SYS:yyyy-mm-dd HH:MM:ss',
            ignore: 'pid,hostname', // Para quitar info extra
          },
          level: 'info',
        },
        {
          target: 'pino/file', // Para archivo
          options: { destination: '../logs/errors.log' },
          level: 'error', // Solo errores van a este archivo
        },
      ],
    },
  }
);

export default logger;
