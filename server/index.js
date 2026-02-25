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

async function sendWorkshopEmail(toEmail, customerName, paymentDetails) {
    const { paymentId, amount, date } = paymentDetails;
    const formattedAmount = (amount / 100).toFixed(2);

    const mailOptions = {
        from: `"Auro Lakshmanan" <${process.env.EMAIL_USER}>`,
        to: toEmail,
        subject: 'Confirmed: Your UI/UX Interview Workshop Registration',
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    .container { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e0e0e0; border-radius: 12px; overflow: hidden; }
                    .header { background: linear-gradient(135deg, #9333ea 0%, #7e22ce 100%); color: white; padding: 40px 20px; text-align: center; }
                    .content { padding: 30px; color: #374151; }
                    .workshop-box { background-color: #f9fafb; border: 1px dashed #d1d5db; border-radius: 8px; padding: 20px; margin: 25px 0; }
                    .btn { display: inline-block; background-color: #9333ea; color: white !important; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 10px; }
                    .footer { background-color: #f3f4f6; color: #6b7280; padding: 20px; text-align: center; font-size: 12px; }
                    .receipt-item { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px; }
                    .label { color: #9ca3af; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1 style="margin: 0; font-size: 24px;">Registration Confirmed!</h1>
                        <p style="margin-top: 10px; opacity: 0.9;">Get ready to crack your UI/UX interviews.</p>
                    </div>
                    <div class="content">
                        <p>Hello <strong>${customerName}</strong>,</p>
                        <p>We've received your payment. You are now officially enrolled in the <strong>UI/UX Interview Cracking Workshop</strong>. We are excited to have you join us!</p>
                        
                        <div class="workshop-box">
                            <h3 style="margin-top: 0; color: #111827;">Workshop Details</h3>
                            <p><strong>📅 Date:</strong> Upcoming Sunday</p>
                            <p><strong>⏰ Time:</strong> 10:00 AM - 01:00 PM IST</p>
                            <p><strong>📍 Location:</strong> Online (Google Calendar)</p>
                            <a href="https://calendar.app.google/qeQhP6riDS8PpqBS9" class="btn">Add to Calendar & View Link</a>
                        </div>

                        <h3 style="color: #111827; border-bottom: 1px solid #edf2f7; padding-bottom: 10px;">Payment Receipt</h3>
                        <div class="receipt-item">
                            <span class="label">Payment ID:</span>
                            <span>${paymentId}</span>
                        </div>
                        <div class="receipt-item">
                            <span class="label">Amount Paid:</span>
                            <span>INR ${formattedAmount}</span>
                        </div>
                        <div class="receipt-item">
                            <span class="label">Status:</span>
                            <span style="color: #059669; font-weight: bold;">Successful</span>
                        </div>

                        <p style="margin-top: 30px;">If you have any questions before the workshop, feel free to reply to this email.</p>
                        <p>See you soon!</p>
                        <p>Best regards,<br><strong>Auro Lakshmanan</strong></p>
                    </div>
                    <div class="footer">
                        <p>© ${new Date().getFullYear()} Auro Lakshmanan UI/UX. All rights reserved.</p>
                        <p>This is an automated confirmation of your registration.</p>
                    </div>
                </div>
            </body>
            </html>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Workshop confirmation email sent to:', toEmail);
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

                sendWorkshopEmail(customerEmail, customerName, {
                    paymentId: payment.id,
                    amount: payment.amount,
                    date: new Date(payment.created_at * 1000).toLocaleDateString()
                });
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
