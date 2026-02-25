export const handlePayment = async (amount: number, description: string, userData: { name: string, email: string, contact: string }) => {
    try {
        // 1. Create order on the server
        // @ts-ignore
        const API_BASE_URL = (import.meta.env as any).VITE_API_URL || 'https://www.crackuiux.in/';
        const response = await fetch(`${API_BASE_URL}/api/create-order`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                amount, // amount in INR
                currency: 'INR',
                receipt: `receipt_${Date.now()}`,
                notes: {
                    customer_name: userData.name,
                    customer_email: userData.email,
                    customer_contact: userData.contact
                }
            }),
        });

        const order = await response.json();

        if (!order.id) {
            alert('Error creating order. Please try again.');
            return;
        }

        // 2. Open Razorpay Checkout modal
        const options = {
            key: "rzp_live_SJXjGismaU9oWm", // Using your test key by default for now
            amount: order.amount,
            currency: order.currency,
            name: "Auro Lakshmanan",
            description: description,
            image: "https://your-logo-url.com/logo.png",
            order_id: order.id,
            handler: async function (response: any) {
                // Payment successful on client-side
                console.log('Payment ID:', response.razorpay_payment_id);
                console.log('Order ID:', response.razorpay_order_id);

                // The webhook on the server will handle the actual data processing (e.g., updating DB)
                // We show immediate feedback to the user here
                alert('Payment Successful! Your registration is being processed.');
                // Redirect or update UI state as needed
            },
            prefill: {
                name: userData.name,
                email: userData.email,
                contact: userData.contact,
            },
            notes: {
                address: "Workshop Access",
                customer_name: userData.name,
                customer_email: userData.email,
                customer_contact: userData.contact
            },
            theme: {
                color: "#9333ea", // Purple to match the design
            },
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.open();
    } catch (error) {
        console.error('Payment Error:', error);
        alert('Something went wrong. Please try again later.');
    }
};
