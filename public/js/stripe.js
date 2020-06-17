/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';

const stripe = Stripe('pk_test_51Gv1lVDBso6ygppOmAGyFel3UFmpZ6lqFFcdT68ax9sqBQLEsxBRv7MIg8Kr03myFPcqV0bi8wdbkSHEmQE7oO0i00elXfKo2F');

export const bookTour = async (tourId) => {
    try {
        //1. Get Session from Server API
        const session = await axios(`/api/v1/bookings/checkout-session/${tourId}`);

        //2. Create Checkout Form + Charge Credit Card
        await stripe.redirectToCheckout({
            sessionId: session.data.session.id,
        });

    } catch (err) {
        console.log(err);
        showAlert('error', 'There was an error processing payment');
    }
}