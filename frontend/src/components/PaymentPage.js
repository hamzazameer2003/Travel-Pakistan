import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import './PaymentPage.css';

const stripePromise = loadStripe('pk_test_51Q2wKV051QwKVJxY4Xc2Y0k (your test publish key)'); // Replace with your Stripe publishable key

const CheckoutForm = ({ clientSecret, tour, seats, onPaymentSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!stripe) return;

    const clientSecret = new URLSearchParams(window.location.search).get(
      'payment_intent_client_secret'
    );

    if (!clientSecret) return;

    stripe.retrievePaymentIntent(clientSecret).then(({ paymentIntent }) => {
      switch (paymentIntent.status) {
        case 'succeeded':
          setMessage('Payment succeeded!');
          onPaymentSuccess(paymentIntent.id);
          break;
        case 'processing':
          setMessage('Your payment is processing.');
          break;
        case 'requires_payment_method':
          setMessage('Your payment was not successful, please try again.');
          break;
        default:
          setMessage('Something went wrong.');
          break;
      }
    });
  }, [stripe, onPaymentSuccess]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) return;

    setIsLoading(true);
    const { error } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: elements.getElement(CardElement),
      },
    });

    if (error.type === 'card_error' || error.type === 'validation_error') {
      setMessage(error.message);
    } else {
      setMessage('An unexpected error occurred.');
    }

    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      <CardElement />
      <button disabled={!stripe || isLoading} className="pay-btn">
        {isLoading ? 'Processing...' : `Pay Rs${tour?.price * (seats || 1)}`}
      </button>
      {message && <p className="message">{message}</p>}
    </form>
  );
};

const PaymentPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [tour, setTour] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('stripe');
  const [clientSecret, setClientSecret] = useState('');
  const [message, setMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const urlParams = new URLSearchParams(location.search);
  const tourId = urlParams.get('tourId');
  const seats = parseInt(urlParams.get('seats')) || 1;

  useEffect(() => {
    if (!tourId) return;

    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    fetchTour();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tourId, navigate]);

  const fetchTour = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/tours/${tourId}`);
      const data = await response.json();
      setTour(data);
    } catch (error) {
      console.error('Error fetching tour:', error);
    }
  };

  const createPaymentIntent = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch('http://localhost:5000/api/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token,
        },
        body: JSON.stringify({ amount: tour.price * seats, tourId, seats }),
      });
      const data = await response.json(); // eslint-disable-line no-unused-vars
      setClientSecret(data.clientSecret);
    } catch (error) {
      console.error('Error creating payment intent:', error);
    }
  };

  const handlePaymentSuccess = async (paymentIntentId) => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch('http://localhost:5000/api/payment-success', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token,
        },
        body: JSON.stringify({ paymentIntentId, tourId, paymentMethod, seats }),
      });
      const data = await response.json();
      setMessage('Payment completed successfully! You will receive a booking confirmation.');
      setTimeout(() => navigate('/dashboard'), 3000);
    } catch (error) {
      console.error('Error confirming payment:', error);
    }
  };

  const handleAlternativePayment = async () => {
    setIsProcessing(true);
    const token = localStorage.getItem('token');

    // Simulate mobile wallet/Easypaisa validation and payment
    setTimeout(async () => {
      try {
        const response = await fetch('http://localhost:5000/api/payment-success', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': token,
          },
          body: JSON.stringify({ paymentIntentId: 'simulated-' + Date.now(), tourId, paymentMethod, seats }),
        });
        const data = await response.json();
        setMessage('Payment completed successfully via ' + paymentMethod + '!');
        setTimeout(() => navigate('/dashboard'), 3000);
      } catch (error) {
        console.error('Error confirming payment:', error);
        setMessage('Payment failed. Please try again.');
      }
      setIsProcessing(false);
    }, 2000);
  };

  if (!tour) return <div>Loading...</div>;

  return (
    <div className="payment-page">
      <h1>Payment for {tour.title}</h1>
      <div className="tour-summary">
        <p><strong>Destination:</strong> {tour.destination}</p>
        <p><strong>Seats Booked:</strong> {seats}</p>
        <p><strong>Price per person:</strong> Rs{tour.price}</p>
        <p><strong>Total Amount:</strong> Rs{tour.price * seats}</p>
        <p><strong>Duration:</strong> {tour.duration}</p>
      </div>

      <div className="payment-methods">
        <h3>Select Payment Method</h3>
        <div className="method-options">
          <label>
            <input
              type="radio"
              value="stripe"
              checked={paymentMethod === 'stripe'}
              onChange={(e) => setPaymentMethod(e.target.value)}
            />
            Credit/Debit Card (International)
          </label>
          <label>
            <input
              type="radio"
              value="easypaisa"
              checked={paymentMethod === 'easypaisa'}
              onChange={(e) => setPaymentMethod(e.target.value)}
            />
            Easypaisa
          </label>
          <label>
            <input
              type="radio"
              value="jazzcash"
              checked={paymentMethod === 'jazzcash'}
              onChange={(e) => setPaymentMethod(e.target.value)}
            />
            JazzCash
          </label>
        </div>

        {paymentMethod === 'stripe' && (
          <>
            <button onClick={createPaymentIntent} disabled={!tour} className="start-payment-btn">
              Start Card Payment
            </button>
            {clientSecret && (
              <Elements stripe={stripePromise}>
                <CheckoutForm clientSecret={clientSecret} tour={tour} seats={seats} onPaymentSuccess={handlePaymentSuccess} />
              </Elements>
            )}
          </>
        )}

        {(paymentMethod === 'easypaisa' || paymentMethod === 'jazzcash') && (
          <div className="mobile-payment">
            <p>Enter your {paymentMethod} account details:</p>
            <input type="number" placeholder="Account Number" className="mobile-input" />
            <button onClick={handleAlternativePayment} disabled={isProcessing} className="pay-btn">
              {isProcessing ? 'Processing...' : `Pay Rs${tour.price * seats} via ${paymentMethod}`}
            </button>
          </div>
        )}
      </div>

      <button onClick={() => navigate(-1)} className="back-btn">Back to Tour</button>
      {message && <p className="status">{message}</p>}
    </div>
  );
};

export default PaymentPage;
