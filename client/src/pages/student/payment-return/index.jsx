import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { captureAndFinalizePaymentService } from "@/services";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe("pk_test_51P856lAS9QcTsHP7gOYijnJr9FKzNqeY8ndtTuu5Dt0tNBbre3bIphUHT5JxlPc7KEyCWDAcSsv6I0KVS9WoQEJQ003urEchxY");

function StripePaymentReturnPage() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const paymentId = params.get("payment_intent");
  const orderId = JSON.parse(sessionStorage.getItem("currentOrderId"));

  useEffect(() => {
    if (paymentId) {
      async function capturePayment() {
        const response = await captureAndFinalizePaymentService(
          paymentId,
          orderId
        );
        if (response?.success) {
          sessionStorage.removeItem("currentOrderId");
          window.location.href = "/student-courses";
        }
      }
      capturePayment();
    }
  }, [paymentId]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Processing payment... Please wait</CardTitle>
      </CardHeader>
    </Card>
  );
}

export default StripePaymentReturnPage;
