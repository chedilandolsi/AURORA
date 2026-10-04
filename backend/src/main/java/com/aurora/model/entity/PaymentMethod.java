package com.aurora.model.entity;

public enum PaymentMethod {
    /** Paid online via Stripe Checkout (international cards / wallets). */
    STRIPE,
    /** Tunisian Dinar payment placeholder (Local PSP / Flouci / Konnect). */
    LOCAL_PSP
}
