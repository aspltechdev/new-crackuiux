// Security Check: Initiating automated testing for Razorpay integration
import express from 'express';
import Razorpay from 'razorpay';
import cors from 'cors';
import dotenv from 'dotenv';
import crypto from 'crypto';
import nodemailer from 'nodemailer';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({
    verify: (req, res, buf) => {
        req.rawBody = buf;
    }
}));

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Email Transporter (Gmail example)
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

async function sendWorkshopEmail(toEmail, customerName) {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: toEmail,
        subject: 'Welcome to the UI/UX Workshop - Your Meeting Link!',
        html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <h2 style="color: #9333ea;">Hi ${customerName},</h2>
                <p>Thank you for your payment! You are officially registered for the <strong>UI/UX Workshop</strong>.</p>
                <div style="background-color: #f3e8ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h3 style="margin: 0; color: #7e22ce;">Event Details:</h3>
                    <p><strong>Meeting Link:</strong> <a href="https://calendar.app.google/qeQhP6riDS8PpqBS9" style="color: #9333ea; font-weight: bold;">Join Meeting Here</a></p>
                    <p><strong>Date & Time:</strong> Upcoming Sunday at 10:00 AM IST</p>
                </div>
                <p>Please make sure to join 5 minutes early. We look forward to seeing you there!</p>
                <p>Best regards,<br>Auro Lakshmanan</p>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Workshop email sent to:', toEmail);
    } catch (error) {
        console.error('Error sending email:', error);
    }
}

// Endpoint to create an order
app.post('/api/create-order', async (req, res) => {
    const { amount, currency = 'INR', receipt, notes } = req.body;

    try {
        const options = {
            amount: amount * 100, // amount in the smallest currency unit (paise for INR)
            currency,
            receipt: receipt || `receipt_${Date.now()}`,
            notes: notes || {}
        };

        const order = await razorpay.orders.create(options);
        res.status(200).json(order);
    } catch (error) {
        console.error('Error creating Razorpay order:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Razorpay Webhook Endpoint
app.post('/api/webhook', (req, res) => {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const signature = req.headers['x-razorpay-signature'];

    if (!secret) {
        console.error('Webhook secret not configured');
        return res.status(500).send('Webhook secret not configured');
    }

    const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(req.rawBody)
        .digest('hex');

    if (signature === expectedSignature) {
        const event = req.body.event;
        const payload = req.body.payload;

        console.log(`Received Razorpay Webhook: ${event}`);

        switch (event) {
            case 'payment.captured':
                const payment = payload.payment.entity;
                console.log('Payment Captured:', payment.id, payment.amount);

                // Automate: Send Meeting Link
                const customerEmail = payment.email;
                const customerName = payment.notes?.customer_name || 'Designer';

                sendWorkshopEmail(customerEmail, customerName);
                break;
            case 'payment.failed':
                console.log('Payment Failed:', payload.payment.entity.id);
                break;
            // Add more cases as needed
        }

        res.status(200).json({ status: 'ok' });
    } else {
        console.error('Invalid Webhook Signature');
        res.status(400).send('Invalid signature');
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
