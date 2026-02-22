
import { Button } from './ui/button';
import { useRazorpay } from '../hooks/useRazorpay';

interface PaymentButtonProps {
    amount?: number;
    currency?: string;
    onSuccess?: (details: any) => void;
    onError?: (error: any) => void;
}

export const PaymentButton = ({
    amount = 500, // Default 500 INR
    currency = 'INR',
    onSuccess,
    onError
}: PaymentButtonProps) => {
    const { processPayment, loading } = useRazorpay();

    const handlePayment = () => {
        processPayment({
            amount,
            currency,
            onSuccess,
            onError
        });
    };

    return (
        <Button onClick={handlePayment} disabled={loading}>
            {loading ? 'Processing...' : `Pay ₹${amount}`}
        </Button>
    );
};
