import { useState } from "react";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
const cardStyle = {
  style: {
    base: {
      color: "#32325d", // Text color
      fontFamily: "Arial, sans-serif", // Font family
      fontSize: "16px", // Font size
      "::placeholder": {
        color: "#aab7c4", // Placeholder text color
      },
    },
    invalid: {
      color: "#fa755a", // Text color for invalid input
    },
  },
};
function PaymentForm() {
  const stripe = useStripe();
  const elements = useElements();
  const [paymentStatus, setPaymentStatus] = useState("");
  const handlePayment = async (e) => {
    e.preventDefault();
    console.log(elements);

    const paymentIntent = await fetch(
      "http://127.0.0.1:4444/payment/create-payment-intent",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: 2000, currency: "usd" }), // $20.00 USD
      }
    ).then((res) => res.json());
    console.log(paymentIntent);
    if (!stripe || !elements) return;

    const cardElement = elements.getElement(CardElement);

    const { error } = await stripe.confirmCardPayment(
      paymentIntent.client_secret,
      {
        payment_method: {
          card: cardElement,
        },
      }
    );

    if (error) {
      setPaymentStatus("Payment Failed: " + error.message);
    } else {
      setPaymentStatus("Payment Successful!");
    }
  };

  return (
    <form
      onSubmit={handlePayment}
      style={{ maxWidth: "400px", margin: "auto" }}
    >
      <CardElement options={cardStyle} />
      <button
        type="submit"
        disabled={!stripe}
        style={{ marginTop: "20px", padding: "10px 20px" }}
      >
        Pay
      </button>
      <p>{paymentStatus}</p>
    </form>
  );
}

export default PaymentForm;
