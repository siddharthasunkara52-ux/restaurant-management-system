import nodemailer from 'nodemailer';

let transporter;

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: {
      	rejectUnauthorized: false
      }
    });
  }
  return transporter;
}

export async function sendReceiptEmail(toEmail, pdfBuffer, orderId) {
  try {
    const mailOptions = {
      from: `"RestaurantOS" <${process.env.EMAIL_USER}>`,
      to: toEmail,
      subject: 'Your Order Receipt 🍽️',
      text: 'Thank you for your order. Please find your receipt attached.',
      html: `
        <div style="font-family: sans-serif; padding: 20px;">
          <h2>Thank you for your order!</h2>
          <p>We hope you enjoy your meal. Your official receipt for Order #${orderId.substring(0, 8)} is attached to this email.</p>
        </div>
      `,
      attachments: [
        {
          filename: `receipt-${orderId.substring(0, 8)}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf',
        },
      ],
    };

    const info = await getTransporter().sendMail(mailOptions);
    console.log(`Receipt email sent to ${toEmail} [${info.messageId}]`);
    return true;
  } catch (err) {
    console.error(`Failed to send receipt email to ${toEmail}:`, err);
    throw err;
  }
}
