import puppeteer from 'puppeteer';
export async function generateReceiptPdf(app, order, restaurant) {
  return new Promise((resolve, reject) => {
    app.render('customer/receiptTemplate', { order, restaurant }, async (err, html) => {
      if (err) {
        console.error("Template Render Error in Generator:", err);
        return reject(err);
      }
      let browser;
      try {
        browser = await puppeteer.launch({
          headless: 'new',
          args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        const page = await browser.newPage();
        await page.setContent(html, { waitUntil: 'networkidle0' });
        const pdfBuffer = await page.pdf({
          format: 'A4',
          printBackground: true,
          margin: {
            top: '20px',
            bottom: '20px',
            left: '20px',
            right: '20px'
          }
        });
        await browser.close();
        resolve(Buffer.from(pdfBuffer));
      } catch (pdfError) {
        if (browser) await browser.close();
        console.error("Puppeteer PDF Error in Generator:", pdfError);
        reject(pdfError);
      }
    });
  });
}
