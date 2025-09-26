import { PDFDocument, StandardFonts, rgb, PDFName, PDFString } from "pdf-lib";
import fs from "fs";
import path from "path";

/**
 * Add a clickable button to the top-right corner of a PDF
 * @param {string} inputPath - Path to the original PDF
 * @param {string} outputPath - Path where the modified PDF will be saved
 * @param {string} linkUrl - URL the button should link to
 */
export async function addButtonToPdf(inputPath, outputPath, linkUrl) {
  try {
    // Load the PDF
    const existingPdfBytes = fs.readFileSync(inputPath);
    const pdfDoc = await PDFDocument.load(existingPdfBytes);

    // Get first page & size
    const [firstPage] = pdfDoc.getPages();
    const { width, height } = firstPage.getSize();

    // Button dimensions and position (top-right corner)
    const buttonWidth = 130;
    const buttonHeight = 35;
    const margin = 15;
    const buttonX = width - buttonWidth - margin;
    const buttonY = height - buttonHeight - margin;

    // Embed a standard font to avoid text rendering issues
    const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

    // Button text
    const buttonText = '> Play Intro';
    
    // Calculate text positioning for centering
    const fontSize = 11;
    const textWidth = helveticaFont.widthOfTextAtSize(buttonText, fontSize);
    const textX = buttonX + (buttonWidth - textWidth) / 2;
    const textY = buttonY + (buttonHeight - fontSize) / 2 + 2; // Slight vertical adjustment

    // Add visual rectangle for the button background
    firstPage.drawRectangle({
      x: buttonX,
      y: buttonY,
      width: buttonWidth,
      height: buttonHeight,
      color: rgb(0.2, 0.6, 0.9), // Blue background
      borderColor: rgb(0.15, 0.45, 0.75),
      borderWidth: 1,
      borderOpacity: 1,
      opacity: 1
    });

    // Add text to the button with proper font
    firstPage.drawText(buttonText, {
      x: textX,
      y: textY,
      size: fontSize,
      font: helveticaFont,
      color: rgb(1, 1, 1) // White text
    });

    // Create a link annotation using the proper PDF-lib method
    const linkAnnot = firstPage.node.context.obj({
      Type: 'Annot',
      Subtype: 'Link',
      Rect: [buttonX, buttonY, buttonX + buttonWidth, buttonY + buttonHeight],
      Border: [0, 0, 0], // No visible border (we drew our own)
      A: {
        Type: 'Action',
        S: 'URI',
        URI: PDFString.of(linkUrl)
      },
      BS: {
        W: 0 // No border width
      }
    });

    // Register the annotation
    const linkAnnotRef = firstPage.node.context.register(linkAnnot);

    // Add annotation to the page
    const existingAnnots = firstPage.node.lookup(PDFName.of('Annots'));
    if (existingAnnots) {
      // Page already has annotations, add to existing array
      const annotsArray = firstPage.node.context.lookup(existingAnnots);
      annotsArray.push(linkAnnotRef);
    } else {
      // Create new annotations array
      const newAnnotsArray = firstPage.node.context.obj([linkAnnotRef]);
      firstPage.node.set(PDFName.of('Annots'), newAnnotsArray);
    }

    console.log(`✅ Created clickable button with URL: ${linkUrl}`);

    // Save new PDF with proper options
    const pdfBytes = await pdfDoc.save({
      useObjectStreams: false,
      addDefaultPage: false
    });
    fs.writeFileSync(outputPath, pdfBytes);

    console.log(`✅ PDF button added successfully: ${outputPath}`);
    return true;
  } catch (error) {
    console.error("❌ Error adding button to PDF:", error);
    throw error;
  }
}

/**
 * Create a downloadable version of resume with elevator pitch link
 * @param {string} originalResumePath - Path to the original resume
 * @param {string} shareId - Share ID of the elevator pitch video
 * @returns {string} Path to the modified resume
 */
export async function createDownloadableResume(originalResumePath, shareId) {
  try {
    const fileName = path.basename(originalResumePath);
    const fileNameWithoutExt = path.parse(fileName).name;
    const downloadablePath = path.join(
      path.dirname(originalResumePath),
      `${fileNameWithoutExt}_downloadable.pdf`
    );

    // Create the elevator pitch URL (frontend URL, not API)
    const pitchUrl = `http://localhost:5173/api/videos/share/${shareId}`;

    // Add button to PDF
    await addButtonToPdf(originalResumePath, downloadablePath, pitchUrl);

    return downloadablePath;
  } catch (error) {
    console.error("Error creating downloadable resume:", error);
    throw error;
  }
}
