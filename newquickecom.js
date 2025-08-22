const express = require('express');

const { BlobServiceClient } = require('@azure/storage-blob');

const csv = require('csv-parser');

const stream = require('stream');

 

const AZURE_STORAGE_ACCOUNT_NAME = 'kineticadbms';

const AZURE_STORAGE_ACCOUNT_KEY = 'JfMzO69p3Ip+Sz+YkXxp7sHxZw0O/JunSaS5qKnSSQnxk1lPhwiQwnGyyJif7sGB01l9amAdvU/t+ASthIK/ZQ==';

const AZURE_CONTAINER_NAME = 'thrive-worklytics';

const BLOB_PATH = 'supply-chain-db/supply-chain_quickcomerce_invoice.csv';

 

const AZURE_CONNECTION_STRING = `DefaultEndpointsProtocol=https;AccountName=${AZURE_STORAGE_ACCOUNT_NAME};AccountKey=${AZURE_STORAGE_ACCOUNT_KEY};EndpointSuffix=core.windows.net`;

 

const router = express.Router();

 

// -------- Get CSV Data from Azure Blob --------

async function getCsvData() {

  const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_CONNECTION_STRING);

  const containerClient = blobServiceClient.getContainerClient(AZURE_CONTAINER_NAME);

  const blobClient = containerClient.getBlobClient(BLOB_PATH);

 

  const exists = await blobClient.exists();

  if (!exists) {

    throw new Error(`Blob not found at path: ${BLOB_PATH}`);

  }

 

  const downloadBlockBlobResponse = await blobClient.download();

  const results = [];

 

  return new Promise((resolve, reject) => {

    const passThrough = new stream.PassThrough();

    downloadBlockBlobResponse.readableStreamBody.pipe(passThrough);

 

    passThrough

      .pipe(csv())

      .on('data', (data) => {

        // Convert numeric fields

        for (const key in data) {

          const value = parseFloat(data[key]);

          if (!isNaN(value)) data[key] = value;

        }

        results.push(data);

      })

      .on('end', () => resolve(results))

      .on('error', (err) => reject(err));

  });

}

 

// -------- API Route --------

router.get('/', async (req, res) => {

  console.log("GET /summary called (CSV version)");

  try {

    const data = await getCsvData();

 

    const skuSet = new Set();

    const locationSet = new Set();

 

    let sumSellable = 0,

        sumInvoiced = 0,

        sumInTransit = 0,

        sumWarehouse = 0,

        sumDelivered = 0,

        sumShortage = 0,

        sumSurplus = 0;

 

    data.forEach(row => {

      skuSet.add(row['SKU']);

      locationSet.add(row['Location']);

 

      const sellableAfterReq = Number(row['Sellable after Required Qty'] || 0);

 

      // Surplus vs Shortage calculation

      if (sellableAfterReq >= 0) {

        sumSurplus += sellableAfterReq;

      } else {

        sumShortage += Math.abs(sellableAfterReq);

      }

 

      sumSellable += Number(row['Sellable(In Hand)'] || 0);

      sumInvoiced += Number(row['Invoiced_Qty'] || 0);

      sumInTransit += Number(row['In-Transit'] || 0);

      sumWarehouse += Number(row['Warehouse Qty'] || 0);

      sumDelivered += Number(row['Delivered'] || 0);

    });

 

    const summary = {

      sku_count: skuSet.size,

      location_count: locationSet.size,

      sumSurplus,

      sumShortage,

      sum_sellable_in_hand: sumSellable,

      sum_invoiced_qty: sumInvoiced,

      sum_in_transit: sumInTransit,

      sum_warehouse_qty: sumWarehouse,

      sum_delivered: sumDelivered,

    };

 

    res.json({ summary, table: data });

  } catch (err) {

    console.error("Summary API error:", err);

    res.status(500).json({ error: err.message });

  }

});

 

module.exports = router;