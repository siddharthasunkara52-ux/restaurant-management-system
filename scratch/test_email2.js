import dotenv from 'dotenv';
dotenv.config();
import nodemailer from 'nodemailer';

async function testEmail() {
    try {
        console.log("Checking Email Credentials...");
        console.log("User:", process.env.EMAIL_USER);
        const pass = process.env.EMAIL_PASS || "";
        console.log("Pass config length:", pass.length);

        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
             console.error("❌ Credentials are missing from .env!");
             process.exit(1);
        }

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
                console.log("\n❌ Connection Error:");
                console.error(error.message);
                
                if (error.message.includes('Invalid login')) {
                   console.log("\n💡 FIX FOR INVALID LOGIN: Make sure your App Password from Google does NOT have spaces, and ensure you have 2-Step Verification enabled.");
                }
            } else {
                console.log("\n✅ Server is ready to take our messages!");
            }
            process.exit(0);
        });

    } catch (e) {
        console.error('Test failed:', e);
        process.exit(1);
    }
}
testEmail();
