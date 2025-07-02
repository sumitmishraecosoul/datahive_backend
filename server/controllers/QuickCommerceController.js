const { BlobServiceClient } = require("@azure/storage-blob");
const csv = require("csv-parser");
const { Readable } = require("stream");

const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME;
const accountKey = process.env.AZURE_STORAGE_ACCOUNT_KEY;
const containerName = process.env.AZURE_CONTAINER_NAME;
const blobQuickCommercePath = process.env.AZURE_BLOB_QUICK_COMMERCE_PATH;

const connectionString = `DefaultEndpointsProtocol=https;AccountName=${accountName};AccountKey=${accountKey};EndpointSuffix=core.windows.net`;

exports.getQuickCommerce = async (req, res) => {
  try {
    const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
    const containerClient = blobServiceClient.getContainerClient(containerName);
    const blobClient = containerClient.getBlobClient(blobQuickCommercePath);
    const response = await blobClient.download();
    const downloaded = await streamToString(response.readableStreamBody);

    const results = [];
    Readable.from(downloaded)
      .pipe(csv())
      .on("data", (data) => results.push(data))
      .on("end", () => res.status(200).json(results));
  } catch (error) {
    console.error("Error fetching quick commerce:", error);
    res.status(500).json({ message: "Failed to fetch quick commerce data", error });
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
