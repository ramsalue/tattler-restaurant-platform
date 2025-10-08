// Load variables from fyle .env
require('dotenv').config();

const { MongoClient } = require('mongodb');

// Get conection variables of the entorn
const uri = process.env.MONGODB_URI;

// Veirfy if URI exists
if (!uri) {
  console.error("Error: didn't find MONGODB_URI on file .env");
  process.exit(1);
}

const client = new MongoClient(uri);

async function runTest() {
  console.log("Trying to connect to MongoDB Atlas...");
  try {
    // Connect with server cliente
    await client.connect();
    // Confirm connection doing a ping with data base
    await client.db("admin").command({ ping: 1 });
    console.log("Connection to MongoDB Atlas.");
    console.log("Tu cadena de conexión en el archivo .env es correcta.");
  } catch (error) {
    console.error("Connection to MongoDB Atlas failed!");
    console.error(" Make sure of the following:");
    console.error(" 1. The password in your .env file is correct and has no special characters that need encoding.");
    console.error(" 2. Your current IP address is in the Network Access list in MongoDB Atlas (or access from 0.0.0.0/0 is enabled).");
    console.error(" 3. The cluster name and user are correct in the connection string.");
    // console.error("\nError details:", error); // Uncomment this line to see the full error
  } finally {
    // Ensure the client will close upon completion/failure
    await client.close();
    console.log("Connection closed.");
  }
}

runTest();