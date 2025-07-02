// const { BlobServiceClient } = require('@azure/storage-blob');
// const XLSX = require('xlsx');

// // Load from environment
// const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME;
// const accountKey = process.env.AZURE_STORAGE_ACCOUNT_KEY;
// const containerName = process.env.AZURE_CONTAINER_NAME;
// // const blobExcelPath = "datahive/container_summary.xlsx"; // hardcoded or use ENV
// const blobExcelPath = process.env.AZURE_BLOB_CONTAINER_SUMMARY_PATH;
// const connectionString = `DefaultEndpointsProtocol=https;AccountName=${accountName};AccountKey=${accountKey};EndpointSuffix=core.windows.net`;

// exports.getContainerSKUData = async (req, res) => {
//   try {
//     // Validation
//     if (!accountName || !accountKey || !containerName || !blobExcelPath) {
//       console.error("Missing Azure env variables");
//       return res.status(500).json({ message: "Azure config missing" });
//     }

//     // Setup Azure Blob Client
//     const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
//     const containerClient = blobServiceClient.getContainerClient(containerName);
//     const blobClient = containerClient.getBlobClient(blobExcelPath);

//     // Download Blob as Buffer
//     const downloadBlockBlobResponse = await blobClient.downloadToBuffer();

//     // Read Excel Workbook
//     const workbook = XLSX.read(downloadBlockBlobResponse, { type: "buffer" });

//     // Extract specific sheet
//     const sheetName = "Container_SKU";
//     console.log("Available Sheet Names:", workbook.SheetNames);

//     if (!workbook.SheetNames.includes(sheetName)) {
//       return res.status(404).json({ message: `Sheet '${sheetName}' not found in workbook.` });
//     }

//     const sheet = workbook.Sheets[sheetName];
//     const data = XLSX.utils.sheet_to_json(sheet);

//     res.status(200).json(data);
//   } catch (error) {
//     console.error("Error fetching Container_SKU sheet:", error);
//     res.status(500).json({ message: "Failed to read Excel data", error });
//   }
// };




const { BlobServiceClient } = require('@azure/storage-blob');
const XLSX = require('xlsx');

const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME;
const accountKey = process.env.AZURE_STORAGE_ACCOUNT_KEY;
const containerName = process.env.AZURE_CONTAINER_NAME;
const blobPath = process.env.AZURE_BLOB_CONTAINER_SUMMARY_PATH;

const connectionString = `DefaultEndpointsProtocol=https;AccountName=${accountName};AccountKey=${accountKey};EndpointSuffix=core.windows.net`;

exports.getContainerSKUData = async (req, res) => {
  try {
    const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
    const containerClient = blobServiceClient.getContainerClient(containerName);
    const blobClient = containerClient.getBlobClient(blobPath);

    const downloadBlockBlobResponse = await blobClient.download();
    const chunks = [];


    const listBlobs = async () => {
  const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
  const containerClient = blobServiceClient.getContainerClient(containerName);

  console.log("Listing blobs under 'datahive/'");
  for await (const blob of containerClient.listBlobsFlat({ prefix: "datahive/" })) {
    console.log("Blob name:", blob.name);
  }
};

listBlobs(); // Run once during startup


    for await (const chunk of downloadBlockBlobResponse.readableStreamBody) {
      chunks.push(chunk);
    }

    const buffer = Buffer.concat(chunks);
    const workbook = XLSX.read(buffer, { type: 'buffer' });

    console.log("Available Sheet Names:", workbook.SheetNames); // 🔍 Check what you now get

   const sheetNameToFind = "Container_SKU";
const matchedSheetName = workbook.SheetNames.find(
  name => name.toLowerCase() === sheetNameToFind.toLowerCase()
);

if (!matchedSheetName) {
  return res.status(400).json({
    message: `Sheet '${sheetNameToFind}' not found in workbook.`,
    availableSheets: workbook.SheetNames
  });
}

const worksheet = workbook.Sheets[matchedSheetName];
const jsonData = XLSX.utils.sheet_to_json(worksheet); // ✅ Make sure this matches exactly
    if (!workbook.SheetNames.includes(sheetName)) {
      return res.status(400).json({ message: `Sheet '${sheetName}' not found in workbook.` });
    }

    // const worksheet = workbook.Sheets[sheetName];
    // const jsonData = XLSX.utils.sheet_to_json(worksheet);

    res.status(200).json(jsonData);
  } catch (error) {
    console.error("Error fetching container data:", error.message);
    res.status(500).json({ message: "Failed to fetch container data", error: error.message });
  }
};
