import dotenv from 'dotenv';
dotenv.config();
import nodemailer from 'nodemailer';

async function testEmail() {
    try {
        console.log("Using EMAIL_USER:", process.env.EMAIL_USER ? "Provided" : "Missing");
        console.log("Using EMAIL_PASS:", process.env.EMAIL_PASS ? "Provided" : "Missing");

        let transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
            tls: {
                rejectUnauthorized: false
            }
        });

        // verify connection configuration
        transporter.verify(function(error, success) {
            if (error) {
                console.log("Connection Error:", error);
            } else {
                console.log("Server is ready to take our messages");
            }
            process.exit(0);
        });

    } catch (e) {
        console.error('Test failed:', e);
        process.exit(1);
    }
}
testEmail();
