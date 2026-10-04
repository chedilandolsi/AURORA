package com.aurora.model.entity;

public enum OrderStatus {
    /** Checkout session created, awaiting payment settlement. */
    PENDING,
    /** Payment settled by customer; awaiting admin confirmation. */
    PENDING_CONFIRMATION,
    /** Order confirmed and in preparation by atelier master. */
    CONFIRMED,
    /** Handed over to DHL Express with active tracking number. */
    ON_THE_WAY,
    /** Successfully delivered to collector address. */
    DELIVERED,
    /** Rejected by atelier admin; stock returned to catalog. */
    REJECTED,
    /** Cancelled. */
    CANCELLED
}
