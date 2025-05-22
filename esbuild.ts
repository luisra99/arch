require("esbuild").build({
    entryPoints: ["./src/index.ts"],  // Tu archivo principal
    bundle: true,  // Empaqueta todas las dependencias en un solo archivo
    minify: true,  // Minifica el código para optimizar tamaño
    platform: "node",  // Define que es para Node.js
    target: "node18",  // Especifica la versión objetivo de Node.js
    outfile: "dist/server.js",  // Archivo de salida
    legalComments: "none"
}).catch(() => process.exit(1));
