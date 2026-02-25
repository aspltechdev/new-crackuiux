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
    const { paymentId, amount } = paymentDetails;
    const formattedAmount = (amount / 100).toFixed(2);

    const mailOptions = {
        from: `"Auro Lakshmanan" <${process.env.EMAIL_USER}>`,
        to: toEmail,
        subject: 'Confirmed: Your 3-Hour UI/UX Interview Workshop Registration',
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    .container { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e0e0e0; border-radius: 12px; overflow: hidden; }
                    .header { background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%); color: white; padding: 45px 20px; text-align: center; }
                    .content { padding: 35px; color: #374151; line-height: 1.6; }
                    .workshop-box { background-color: #f5f3ff; border: 1px solid #ddd6fe; border-radius: 12px; padding: 25px; margin: 25px 0; }
                    .btn { display: inline-block; background-color: #7c3aed; color: white !important; padding: 16px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 15px; box-shadow: 0 4px 6px -1px rgba(124, 58, 237, 0.3); }
                    .footer { background-color: #f9fafb; color: #6b7280; padding: 25px; text-align: center; font-size: 13px; border-top: 1px solid #f3f4f6; }
                    .receipt-item { display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 15px; border-bottom: 1px solid #f3f4f6; padding-bottom: 8px; }
                    .label { color: #6b7280; font-weight: 500; }
                    .contact-box { background-color: #fdf2f8; border: 1px solid #fbcfe8; border-radius: 8px; padding: 15px; margin-top: 25px; font-size: 14px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1 style="margin: 0; font-size: 26px; letter-spacing: -0.5px;">Registration Confirmed!</h1>
                        <p style="margin-top: 12px; opacity: 0.95; font-size: 16px;">Master your UI/UX interviews in just 3 hours.</p>
                    </div>
                    <div class="content">
                        <p>Hello <strong>${customerName}</strong>,</p>
                        <p>Congratulations! You have successfully registered for the <strong>3-Hour UI/UX Interview Cracking Masterclass</strong>. We’ve received your payment, and your seat is now officially secured.</p>
                        
                        <div class="workshop-box">
                            <h3 style="margin-top: 0; color: #1e1b4b; font-size: 18px;">📅 Workshop Schedule</h3>
                            <p style="margin: 8px 0;"><strong>Date:</strong> Sunday, 1st March 2026</p>
                            <p style="margin: 8px 0;"><strong>Time:</strong> 10:00 AM – 01:00 PM IST</p>
                            <p style="margin: 8px 0;"><strong>Duration:</strong> 3 Hours (Power-packed Session)</p>
                            <a href="https://calendar.app.google/qeQhP6riDS8PpqBS9" class="btn">Join Now — ₹${formattedAmount} Only</a>
                        </div>

                        <h3 style="color: #111827; margin-top: 35px; margin-bottom: 15px; font-size: 18px;">Payment Summary</h3>
                        <div class="receipt-item">
                            <span class="label">Transaction ID</span>
                            <span style="font-family: monospace; color: #4b5563;">${paymentId}</span>
                        </div>
                        <div class="receipt-item">
                            <span class="label">Total Paid</span>
                            <span style="color: #111827; font-weight: 600;">₹${formattedAmount}</span>
                        </div>
                        <div class="receipt-item">
                            <span class="label">Status</span>
                            <span style="color: #059669; font-weight: bold;">Successful</span>
                        </div>

                        <div class="contact-box">
                            <h4 style="margin-top: 0; color: #be185d;">📞 Need Help?</h4>
                            <p style="margin: 5px 0;">If you have any questions or face issues joining, please reach out to us:</p>
                            <p style="margin: 3px 0;"><strong>Email:</strong> aspltechdev@gmail.com</p>
                            <p style="margin: 3px 0;"><strong>WhatsApp/Call:</strong> +91 99017 24479</p>
                        </div>

                        <p style="margin-top: 30px; border-top: 1px solid #f3f4f6; pt-15px;">See you on the 1st of March!</p>
                        <p>Best regards,<br><strong style="color: #7c3aed;">Auro Lakshmanan</strong><br><span style="font-size: 13px; color: #6b7280;">UI/UX Design Mentor</span></p>
                    </div>
                    <div class="footer">
                        <p>© ${new Date().getFullYear()} Auro Lakshmanan Design Mentor. All rights reserved.</p>
                        <p style="color: #9ca3af; font-size: 11px;">This is an automated enrollment confirmation for the workshop.</p>
                    </div>
                </div>
            </body>
            </html>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Detailed workshop confirmation sent:', toEmail);
    } catch (error) {
        console.error('Error sending detailed email:', error);
    }
}

async function sendFailureEmail(toEmail, customerName, paymentDetails) {
    const { paymentId, amount, reason } = paymentDetails;
    const formattedAmount = (amount / 100).toFixed(2);

    const mailOptions = {
        from: `"Auro Lakshmanan" <${process.env.EMAIL_USER}>`,
        to: toEmail,
        subject: 'Action Required: Payment Failed for UI/UX Workshop',
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    .container { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e0e0e0; border-radius: 12px; overflow: hidden; }
                    .header { background: linear-gradient(135deg, #f43f5e 0%, #e11d48 100%); color: white; padding: 45px 20px; text-align: center; }
                    .content { padding: 35px; color: #374151; line-height: 1.6; }
                    .error-box { background-color: #fff1f2; border: 1px solid #fecdd3; border-radius: 12px; padding: 25px; margin: 25px 0; }
                    .btn { display: inline-block; background-color: #e11d48; color: white !important; padding: 16px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 15px; }
                    .footer { background-color: #f9fafb; color: #6b7280; padding: 25px; text-align: center; font-size: 13px; }
                    .contact-box { background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 15px; margin-top: 25px; font-size: 14px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1 style="margin: 0; font-size: 26px;">Payment Unsuccessful</h1>
                        <p style="margin-top: 12px; opacity: 0.95;">Don't miss out on securing your seat!</p>
                    </div>
                    <div class="content">
                        <p>Hello <strong>${customerName}</strong>,</p>
                        <p>We attempted to process your payment for the <strong>3-Hour UI/UX Interview Cracking Masterclass</strong>, but unfortunately, the transaction was unsuccessful.</p>
                        
                        <div class="error-box">
                            <h3 style="margin-top: 0; color: #9f1239; font-size: 18px;">Reason for Failure</h3>
                            <p><strong>Bank/Gateway Message:</strong> ${reason || 'Transaction declined by bank/network.'}</p>
                            <p style="margin-top: 10px; font-size: 14px; color: #4b5563;">Don't worry, your seat can still be reserved! Please try registering again using a different UPI ID, card, or payment method.</p>
                            <a href="https://aspltesting.online" class="btn">Resume Registration</a>
                        </div>

                        <div class="contact-box">
                            <h4 style="margin-top: 0; color: #475569;">📞 Having issues?</h4>
                            <p style="margin: 5px 0;">If you are facing payment difficulties, feel free to contact us directly:</p>
                            <p style="margin: 3px 0;"><strong>WhatsApp/Call:</strong> +91 99017 24479</p>
                            <p style="margin: 3px 0;"><strong>Email:</strong> aspltechdev@gmail.com</p>
                        </div>

                        <p style="margin-top: 30px;">Best regards,<br><strong>Auro Lakshmanan</strong></p>
                    </div>
                    <div class="footer">
                        <p>© ${new Date().getFullYear()} Auro Lakshmanan UI/UX. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Payment failure email sent to:', toEmail);
    } catch (error) {
        console.error('Error sending failure email:', error);
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
                const failedPayment = payload.payment.entity;
                console.log('Payment Failed:', failedPayment.id);

                const failEmail = failedPayment.email;
                const failName = failedPayment.notes?.customer_name || 'Designer';

                sendFailureEmail(failEmail, failName, {
                    paymentId: failedPayment.id,
                    amount: failedPayment.amount,
                    reason: failedPayment.error_description
                });
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
