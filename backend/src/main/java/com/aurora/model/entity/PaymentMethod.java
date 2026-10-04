package com.aurora.model.entity;

public enum PaymentMethod {
    /** Paid online through Stripe Checkout. */
    STRIPE,
    /** Placed without online payment; settled offline after admin confirmation. */
    MANUAL
}
