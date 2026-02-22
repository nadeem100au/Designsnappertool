
import { useState } from 'react';
import { toast } from 'sonner';
import { projectId, publicAnonKey } from '../utils/supabase/info';

export const useRazorpay = () => {
    const [loading, setLoading] = useState(false);

    const loadRazorpayScript = async () => {
        return new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const processPayment = async ({
        amount,
        currency = 'INR',
        receipt,
        accessToken,
        onSuccess,
        onError
    }: {
        amount: number;
        currency?: string;
        receipt?: string;
        accessToken?: string;
        onSuccess?: (details: any) => void;
        onError?: (error: any) => void;
    }) => {
        setLoading(true);
        try {
            const scriptLoaded = await loadRazorpayScript();
            if (!scriptLoaded) {
                const error = new Error('Razorpay SDK failed to load');
                toast.error(error.message);
                if (onError) onError(error);
                setLoading(false);
                return;
            }

            // 1. Create Order
            const orderResponse = await fetch(`https://${projectId}.supabase.co/functions/v1/payment-handler/order`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${publicAnonKey}`,
                },
                body: JSON.stringify({ amount, currency, receipt: receipt || `receipt_${Date.now()}`, accessToken })
            });

            if (!orderResponse.ok) {
                const errorText = await orderResponse.text();
                console.error("Order creation failed:", orderResponse.status, errorText);
                try {
                    const errorData = JSON.parse(errorText);
                    throw new Error(errorData.error || `Failed to create order: ${orderResponse.status}`);
                } catch (e) {
                    throw new Error(`Failed to create order: ${orderResponse.status} - ${errorText}`);
                }
            }

            const orderData = await orderResponse.json();
            if (!orderData || !orderData.id) throw new Error("Failed to create order");

            // 2. Open Razorpay Options
            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID,
                amount: orderData.amount,
                currency: orderData.currency,
                name: "Design Snapper",
                description: "Pro Plan Upgrade",
                order_id: orderData.id,
                handler: async function (response: any) {
                    // 3. Verify Payment
                    try {
                        const verifyResponse = await fetch(`https://${projectId}.supabase.co/functions/v1/payment-handler/verify`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${publicAnonKey}`,
                            },
                            body: JSON.stringify({
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature,
                                accessToken,
                            })
                        });

                        if (!verifyResponse.ok) {
                            const errorData = await verifyResponse.json().catch(() => ({}));
                            throw new Error(errorData.error || 'Payment verification failed');
                        }

                        const verifyData = await verifyResponse.json();

                        if (verifyData.status === 'success') {
                            toast.success('Payment Successful!');
                            if (onSuccess) onSuccess(response);
                        } else {
                            toast.error('Payment Verification Failed');
                            if (onError) onError(verifyData);
                        }
                    } catch (err) {
                        console.error("Verification Error", err);
                        toast.error('Payment verification failed');
                        if (onError) onError(err);
                    }
                },
                prefill: {
                    name: "Design Snapper User",
                    email: "user@example.com",
                    contact: "9999999999"
                },
                theme: { color: "#0F172A" }
            };

            const paymentObject = new window.Razorpay(options);
            paymentObject.open();

        } catch (error: any) {
            console.error("Payment Error:", error);
            toast.error(error.message || 'Payment failed');
            if (onError) onError(error);
        } finally {
            setLoading(false);
        }
    };

    return { processPayment, loading };
};
