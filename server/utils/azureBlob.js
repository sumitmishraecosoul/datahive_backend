const { BlobServiceClient } = require("@azure/storage-blob");
const csv = require("csv-parser");
const stream = require("stream");

const getQuickCommerceData = async () => {
  const account = process.env.AZURE_STORAGE_ACCOUNT_NAME;
  const key = process.env.AZURE_STORAGE_ACCOUNT_KEY;
  const containerName = process.env.AZURE_STORAGE_CONTAINER;
  const blobName = process.env.AZURE_BLOB_NAME;

  const connStr = `DefaultEndpointsProtocol=https;AccountName=${account};AccountKey=${key};EndpointSuffix=core.windows.net`;
  const blobServiceClient = BlobServiceClient.fromConnectionString(connStr);
  const containerClient = blobServiceClient.getContainerClient(containerName);
  const blobClient = containerClient.getBlobClient(blobName);
  const downloadBlockBlobResponse = await blobClient.download();

  return new Promise((resolve, reject) => {
    const results = [];
    downloadBlockBlobResponse.readableStreamBody
      .pipe(csv())
      .on("data", (row) => results.push(row))
      .on("end", () => resolve(results))
      .on("error", (err) => reject(err));
  });
};

module.exports = { getQuickCommerceData };
