const fs = require('fs');
const { PDFDocument } = require('pdf-lib');

async function listPdfFieldNames(pdfPath) {
    // Load the PDF document
    const pdfBytes = await fs.promises.readFile(pdfPath);
    const pdfDoc = await PDFDocument.load(pdfBytes);

    // Get the form from the PDF
    const form = pdfDoc.getForm();

    // Get all fields in the form
    const fields = form.getFields();

    // Map each field to its name
    const fieldNames = fields.map(field => field.getName());

    // Log or return the field names
    console.log(fieldNames);
    return fieldNames;
}

// Call the function with the path to your PDF
listPdfFieldNames('./user_2af93RBP9kZsSM2t3Vzlhnghfnl_official_filled.pdf');
