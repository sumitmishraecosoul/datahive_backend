const { BlobServiceClient } = require('@azure/storage-blob');
const csv = require('csv-parser');
const { Readable } = require('stream');

// Load from environment
const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME;
const accountKey = process.env.AZURE_STORAGE_ACCOUNT_KEY;
const containerName = process.env.AZURE_CONTAINER_NAME;
const blobInventoryPath = process.env.AZURE_BLOB_INVENTORY_PATH;

exports.getInventory = async (req, res) => {
    console.log("accountName ===> ", accountName);
    console.log("accountKey ===> ", accountKey);    
    console.log("containerName ===> ", containerName);
    console.log("blobInventoryPath ===> ", blobInventoryPath);
    
    // Validate environment variables first
    if (!accountName || !accountKey || !containerName || !blobInventoryPath) {
        console.error("Missing one or more required Azure Storage environment variables.");
        return res.status(500).json({ message: "Missing Azure Storage config." });
    }

    try {
        const connectionString = `DefaultEndpointsProtocol=https;AccountName=${accountName};AccountKey=${accountKey};EndpointSuffix=core.windows.net`;
        const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
        const containerClient = blobServiceClient.getContainerClient(containerName);
        const blobClient = containerClient.getBlobClient(blobInventoryPath);

        const downloadBlockBlobResponse = await blobClient.download();
        const downloaded = await streamToString(downloadBlockBlobResponse.readableStreamBody);

        const results = [];
        Readable.from(downloaded)
            .pipe(csv())
            .on('data', (data) => results.push(data))
            .on('end', () => {
                res.status(200).json(results);
            });
    } catch (error) {
        console.error("Azure Blob fetch error:", error);
        res.status(500).json({ message: "Failed to fetch inventory data", error });
    }
};

function streamToString(stream) {
  const chunks = [];
  return new Promise((resolve, reject) => {
    stream.on("data", (chunk) => chunks.push(chunk));
    stream.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    stream.on("error", reject);
  });
}
