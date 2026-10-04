package com.aurora.service;

import com.aurora.dto.tracking.TrackingCheckpoint;
import com.aurora.dto.tracking.TrackingResponse;
import com.aurora.exception.ResourceNotFoundException;
import com.aurora.model.entity.Order;
import com.aurora.model.entity.OrderStatus;
import com.aurora.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class DhlTrackingService {

    private final OrderRepository orderRepository;

    @Value("${dhl.api-key:}")
    private String dhlApiKey;

    @Transactional(readOnly = true)
    public TrackingResponse getTrackingByOrderId(UUID orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", orderId));
        return buildTrackingResponse(order);
    }

    @Transactional(readOnly = true)
    public TrackingResponse getTrackingByOrderNumber(String orderNumber) {
        Order order = orderRepository.findByOrderNumber(orderNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "orderNumber", orderNumber));
        return buildTrackingResponse(order);
    }

    private TrackingResponse buildTrackingResponse(Order order) {
        String trackingNum = order.getTrackingNumber();
        if (trackingNum == null || trackingNum.isBlank()) {
            trackingNum = "DHL-TN-" + order.getOrderNumber().replace("AUR-", "");
        }

        String destinationCity = order.getShippingCity() != null ? order.getShippingCity() : "International";
        String destinationCountry = order.getShippingCountry() != null ? order.getShippingCountry() : "Destination";
        String destination = destinationCity + ", " + destinationCountry;

        Instant shippedAt = order.getShippedAt() != null ? order.getShippedAt() : order.getCreatedAt();
        Instant estimatedDelivery = shippedAt.plus(3, ChronoUnit.DAYS);

        List<TrackingCheckpoint> checkpoints = new ArrayList<>();
        boolean isDelivered = order.getStatus() == OrderStatus.DELIVERED;
        long elapsedHours = Duration.between(shippedAt, Instant.now()).toHours();

        // 1. Shipment Information Received
        checkpoints.add(TrackingCheckpoint.builder()
                .statusCode("DATA_RECEIVED")
                .title("Shipment Information Transmitted")
                .description("Artisanal consignment documentation generated and transmitted to DHL Express.")
                .location("Sidi Bou Saïd Atelier, Tunisia")
                .timestamp(shippedAt.minus(2, ChronoUnit.HOURS))
                .completed(true)
                .build());

        // 2. Picked up by Courier
        checkpoints.add(TrackingCheckpoint.builder()
                .statusCode("PICKED_UP")
                .title("Consignment Picked Up")
                .description("Handcrafted wooden mask collected in protective cedar preservation box by DHL courier.")
                .location("Poste Rapide / Carthage Depot, Tunisia")
                .timestamp(shippedAt)
                .completed(true)
                .build());

        // 3. Processed at Tunis-Carthage Airport Gateway
        boolean step3Done = isDelivered || elapsedHours >= 4;
        checkpoints.add(TrackingCheckpoint.builder()
                .statusCode("PROCESSED_ORIGIN")
                .title("Processed at Origin Gateway")
                .description("Inspected, weighed, and cleared export customs at Tunis-Carthage International Gateway.")
                .location("Tunis Carthage International Airport (TUN), Tunisia")
                .timestamp(shippedAt.plus(4, ChronoUnit.HOURS))
                .completed(step3Done)
                .build());

        // 4. Departed Tunis Facility
        boolean step4Done = isDelivered || elapsedHours >= 10;
        checkpoints.add(TrackingCheckpoint.builder()
                .statusCode("DEPARTED_FACILITY")
                .title("Departed International Gateway")
                .description("Flight departure on DHL Express air freighter to international hub.")
                .location("Tunis Air Freight Hub, Tunisia")
                .timestamp(shippedAt.plus(10, ChronoUnit.HOURS))
                .completed(step4Done)
                .build());

        // 5. Arrived at Destination Gateway
        boolean step5Done = isDelivered || elapsedHours >= 24;
        checkpoints.add(TrackingCheckpoint.builder()
                .statusCode("ARRIVED_DESTINATION")
                .title("Arrived at Destination Sort Facility")
                .description("Customs clearance formal entry validated. Transferred for regional routing.")
                .location(destinationCity + " Gateway Hub, " + destinationCountry)
                .timestamp(shippedAt.plus(24, ChronoUnit.HOURS))
                .completed(step5Done)
                .build());

        // 6. Forwarded for Local Delivery
        boolean step6Done = isDelivered || elapsedHours >= 36;
        checkpoints.add(TrackingCheckpoint.builder()
                .statusCode("WITH_COURIER")
                .title("With Delivery Courier")
                .description("Consignment placed in courier delivery vehicle for final signed delivery.")
                .location(destinationCity + " Central Hub, " + destinationCountry)
                .timestamp(shippedAt.plus(36, ChronoUnit.HOURS))
                .completed(step6Done)
                .build());

        // 7. Delivered
        Instant deliveredTime = order.getDeliveredAt() != null ? order.getDeliveredAt() : shippedAt.plus(48, ChronoUnit.HOURS);
        checkpoints.add(TrackingCheckpoint.builder()
                .statusCode("DELIVERED")
                .title(isDelivered ? "Delivered & Signed" : "Estimated Final Delivery")
                .description(isDelivered
                        ? "Delivered to " + order.getCustomerName() + " and signed for in pristine condition."
                        : "Scheduled arrival at " + order.getShippingAddressLine1())
                .location(destination)
                .timestamp(isDelivered ? deliveredTime : estimatedDelivery)
                .completed(isDelivered)
                .build());

        return TrackingResponse.builder()
                .trackingNumber(trackingNum)
                .carrier(order.getCarrier() != null ? order.getCarrier() : "DHL Express")
                .orderNumber(order.getOrderNumber())
                .status(order.getStatus())
                .origin("AURORA Atelier, Sidi Bou Saïd, Tunisia")
                .destination(destination)
                .estimatedDelivery(estimatedDelivery)
                .serviceType("DHL Express Worldwide — Carbon Neutral Artisanal Courier")
                .checkpoints(checkpoints)
                .build();
    }
}
