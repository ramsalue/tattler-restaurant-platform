// Carga las variables de entorno del archivo .env
require('dotenv').config();

const { MongoClient } = require('mongodb');

// Obtiene la cadena de conexión de las variables de entorno
const uri = process.env.MONGODB_URI;

// Verifica si la URI existe
if (!uri) {
  console.error("❌ Error: No se encontró la variable MONGODB_URI en tu archivo .env");
  process.exit(1);
}

const client = new MongoClient(uri);

async function runTest() {
  console.log("Intentando conectar a MongoDB Atlas...");
  try {
    // Conectar el cliente al servidor
    await client.connect();
    // Confirmar la conexión haciendo un ping a la base de datos
    await client.db("admin").command({ ping: 1 });
    console.log("✅ ¡Éxito! Te conectaste correctamente a MongoDB Atlas.");
    console.log("✅ Tu cadena de conexión en el archivo .env es correcta.");
  } catch (error) {
    console.error("❌ ¡Falló la conexión a MongoDB Atlas!");
    console.error("   Asegúrate de lo siguiente:");
    console.error("   1. La contraseña en tu archivo .env es correcta y no tiene caracteres especiales que necesiten ser codificados.");
    console.error("   2. Tu dirección IP actual está en la lista de acceso de red ('Network Access') en MongoDB Atlas (o está habilitado el acceso desde 0.0.0.0/0).");
    console.error("   3. El nombre del clúster y el usuario son correctos en la cadena de conexión.");
    // console.error("\nDetalles del error:", error); // Descomenta esta línea para ver el error completo
  } finally {
    // Asegura que el cliente se cerrará cuando termines/falles
    await client.close();
    console.log("🔌 Conexión cerrada.");
  }
}

runTest();