const { PDFDocument } = require('pdf-lib');
const fs = require('fs').promises;
const fetch = require('node-fetch');

async function joinPDFs(pdfPaths, outputPath, jsonDataPath) {
  const mergedPdf = await PDFDocument.create();

  // Read JSON data
  const jsonData = JSON.parse(await fs.readFile(jsonDataPath, 'utf-8'));

  for (const pdfPath of pdfPaths) {
    const pdfBytes = await fs.readFile(pdfPath);
    const pdfDoc = await PDFDocument.load(pdfBytes, { updateMetadata: false });
    const copiedPages = await mergedPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());
    copiedPages.forEach((page) => mergedPdf.addPage(page));
  }

  // Example of adding additional content from JSON, like a rental workshop certificate
  const rentalWorkshopCertificateUrl = jsonData.rentalWorkshopCertificate;
  if (rentalWorkshopCertificateUrl) {
    const imageBytes = await fetchImageBytes(rentalWorkshopCertificateUrl);
    const image = await mergedPdf.embedJpg(imageBytes);
    const page = mergedPdf.addPage();
    page.drawImage(image, {
      x: 50,
      y: 200,
      width: 500,
      height: 500,
    });
  }

  // Save the merged PDF without flattening to keep it editable
  const mergedPdfBytes = await mergedPdf.save();
  await fs.writeFile(outputPath, mergedPdfBytes);
}

async function fetchImageBytes(imageUrl) {
  const response = await fetch(imageUrl);
  const imageBuffer = await response.buffer();
  return imageBuffer;
}

// Call the function with your PDF paths and JSON data path
joinPDFs(['letter-of-guarantee.pdf', 'rentorapdf_unlocked.pdf'], 'rentora_nowatermark.pdf', 'rentora1.json')
  .then(() => console.log('PDFs joined successfully.'))
  .catch((error) => console.error('Error joining PDFs:', error));