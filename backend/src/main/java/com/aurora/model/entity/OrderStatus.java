package com.aurora.model.entity;

public enum OrderStatus {
    /** Stripe checkout created, awaiting payment confirmation. */
    PENDING,
    PAID,
    /** Order placed without online payment; awaiting admin review. Stock is reserved. */
    PENDING_MANUAL_CONFIRMATION,
    /** Manual order approved by an admin and ready for fulfillment. */
    CONFIRMED,
    /** Manual order declined by an admin. Reserved stock has been restored. */
    REJECTED,
    PROCESSING,
    SHIPPED,
    DELIVERED,
    CANCELLED
}
