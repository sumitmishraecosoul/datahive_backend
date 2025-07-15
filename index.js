// const express = require("express");
// const fs = require("fs");
// const csv = require("csv-parser");
// const cors = require("cors");
// const app = express();
// const PORT = 5000;

// app.use(cors());

// // Load and parse inventory.csv
// app.get("/api/inventory", (req, res) => {
//   const results = [];
//   fs.createReadStream("inventory.csv")
//     .pipe(csv())
//     .on("data", (data) => {
//       // Convert numeric fields
//       for (const key in data) {
//         const value = parseFloat(data[key]);
//         if (!isNaN(value)) data[key] = value;
//       }
//       results.push(data);
//     })
//     .on("end", () => {
//       res.json(results);
//     });
// });

// app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));


// const express = require("express");
// const cors = require("cors");
// const { BlobServiceClient } = require("@azure/storage-blob");
// const Papa = require("papaparse");

// const app = express();
// app.use(cors());
// app.use(express.json());

// const PORT = process.env.PORT || 5000;

// const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
// const containerName = "supply-pulse/datahive";
// const blobName = "inventory_DBMS.csv";

// app.get("/api/inventory", async (req, res) => {
//   try {
//     const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
//     const containerClient = blobServiceClient.getContainerClient(containerName);
//     const blobClient = containerClient.getBlobClient(blobName);
//     const downloadBlockBlobResponse = await blobClient.download();

//     const downloaded = await streamToString(downloadBlockBlobResponse.readableStreamBody);
//     const parsed = Papa.parse(downloaded, { header: true });
//     res.json(parsed.data);
//   } catch (err) {
//     console.error("Error loading inventory CSV:", err.message);
//     res.status(500).json({ error: "Failed to fetch inventory data" });
//   }
// });

// async function streamToString(readableStream) {
//   return new Promise((resolve, reject) => {
//     const chunks = [];
//     readableStream.on("data", (data) => chunks.push(data.toString()));
//     readableStream.on("end", () => resolve(chunks.join("")));
//     readableStream.on("error", reject);
//   });
// }

// app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));







require("dotenv").config();
const express = require('express');
const cors = require('cors');
const inventoryRoutes = require('./server/routes/inventoryRoutes');
const quickCommerceRoutes = require("./server/routes/QuickCommerceRoutes");
const containerRoutes = require('./server/routes/containerRoutes');
const quickCommerceExecutiveRoutes = require("./server//routes/QuickCommerceExecutiveRoutes");

const app = express();
const PORT = process.env.PORT || 5000;
console.log("PORT ===> ", PORT);

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/inventory', inventoryRoutes);
app.use("/api/quick-commerce", quickCommerceRoutes);
app.use("/api/container", containerRoutes);
app.use("/api/quick-commerce-executive", quickCommerceExecutiveRoutes);


app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
