package com.aurora.service;

import com.aurora.model.entity.Order;
import com.aurora.model.entity.OrderItem;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;

@Slf4j
@Service
public class EmailService {

    private final ObjectProvider<JavaMailSender> mailSenderProvider;

    @Value("${app.mail.from:atelier@aurora-masks.tn}")
    private String fromEmail;

    @Value("${app.mail.brand-name:AURORA Atelier}")
    private String brandName;

    public EmailService(ObjectProvider<JavaMailSender> mailSenderProvider) {
        this.mailSenderProvider = mailSenderProvider;
    }

    @Async
    public void sendManualOrderReceivedEmail(Order order) {
        if (order.getCustomerEmail() == null || order.getCustomerEmail().isBlank()) {
            return;
        }

        String subject = "AURORA Atelier — Order Reservation Received [#" + order.getOrderNumber() + "]";
        String body = buildReceivedHtml(order);
        sendHtmlEmail(order.getCustomerEmail(), subject, body);
    }

    @Async
    public void sendOrderConfirmationEmail(Order order) {
        if (order.getCustomerEmail() == null || order.getCustomerEmail().isBlank()) {
            return;
        }

        String subject = "AURORA Atelier — Order Confirmed & Preparation Begun [#" + order.getOrderNumber() + "]";
        String body = buildConfirmationHtml(order);
        sendHtmlEmail(order.getCustomerEmail(), subject, body);
    }

    @Async
    public void sendOrderShippedEmail(Order order) {
        if (order.getCustomerEmail() == null || order.getCustomerEmail().isBlank()) {
            return;
        }

        String subject = "AURORA Atelier — Your Mask Has Shipped via DHL Express [#" + order.getOrderNumber() + "]";
        String body = buildShippedHtml(order);
        sendHtmlEmail(order.getCustomerEmail(), subject, body);
    }

    @Async
    public void sendOrderRejectionEmail(Order order, String reason) {
        if (order.getCustomerEmail() == null || order.getCustomerEmail().isBlank()) {
            return;
        }

        String subject = "AURORA Atelier — Update Regarding Order [#" + order.getOrderNumber() + "]";
        String body = buildRejectionHtml(order, reason);
        sendHtmlEmail(order.getCustomerEmail(), subject, body);
    }

    private void sendHtmlEmail(String toEmail, String subject, String htmlContent) {
        JavaMailSender mailSender = mailSenderProvider.getIfAvailable();
        if (mailSender == null) {
            log.warn("JavaMailSender bean is not configured. Email to {} with subject '{}' was skipped.", toEmail, subject);
            return;
        }

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, MimeMessageHelper.MULTIPART_MODE_MIXED_RELATED, StandardCharsets.UTF_8.name());

            helper.setFrom(fromEmail, brandName);
            helper.setTo(toEmail);
            helper.setSubject(subject);
            helper.setText(htmlContent, true);

            mailSender.send(message);
            log.info("Dispatched artisanal email to {} for subject: {}", toEmail, subject);
        } catch (MessagingException me) {
            log.error("Failed to construct or send MIME email to {}: {}", toEmail, me.getMessage());
        } catch (Exception ex) {
            log.warn("SMTP host unavailable or email dispatch error for {}: {}. Continuing gracefully.", toEmail, ex.getMessage());
        }
    }

    private String buildReceivedHtml(Order order) {
        String formattedDate = DateTimeFormatter.ofPattern("MMMM dd, yyyy")
                .withZone(ZoneId.systemDefault())
                .format(order.getCreatedAt());

        return "<!DOCTYPE html>"
                + "<html>"
                + "<head><meta charset='UTF-8'></head>"
                + "<body style='margin:0;padding:0;background-color:#0d0c0a;font-family:-apple-system,BlinkMacSystemFont,\"Segoe UI\",Roboto,sans-serif;color:#f3efe6;'>"
                + "  <div style='max-width:640px;margin:30px auto;background:#161513;border:1px solid #2e281f;border-radius:12px;overflow:hidden;box-shadow:0 12px 40px rgba(0,0,0,0.6);'>"
                + "    <div style='background:linear-gradient(135deg, #1c1813 0%, #2b2318 100%);padding:36px 30px;border-bottom:1px solid #3d3220;text-align:center;'>"
                + "      <div style='font-size:11px;letter-spacing:4px;text-transform:uppercase;color:#d4af37;margin-bottom:8px;'>Atelier Artisanal Tunisien</div>"
                + "      <h1 style='margin:0;font-size:26px;font-weight:300;letter-spacing:2px;color:#ffffff;text-transform:uppercase;'>A U R O R A</h1>"
                + "      <div style='font-size:12px;color:#a89b88;margin-top:6px;'>Sidi Bou Saïd • Carthage • Tunis</div>"
                + "    </div>"
                + "    <div style='padding:32px 30px;'>"
                + "      <h2 style='font-size:20px;font-weight:400;color:#f0e6d2;margin-top:0;'>Order Reservation Received</h2>"
                + "      <p style='color:#bbb0a0;line-height:1.6;'>Dear " + escapeHtml(order.getCustomerName()) + ",</p>"
                + "      <p style='color:#bbb0a0;line-height:1.6;'>We have received your reservation order <strong>#" + escapeHtml(order.getOrderNumber()) + "</strong> placed on " + formattedDate + ". Your reserved pieces have been placed on hold in our atelier.</p>"
                + "      <div style='background:#1f1c17;border-left:3px solid #d4af37;padding:16px 20px;margin:24px 0;border-radius:0 8px 8px 0;'>"
                + "        <div style='color:#e6c975;font-weight:600;font-size:13px;text-transform:uppercase;letter-spacing:1px;'>Status: Awaiting Master Artisan Confirmation</div>"
                + "        <p style='color:#a89b88;margin:6px 0 0;font-size:13px;line-height:1.5;'>Our atelier master will inspect inventory authenticity and approve fulfillment. You will receive an instant notification once confirmed.</p>"
                + "      </div>"
                + buildItemsTableHtml(order)
                + "      <div style='margin-top:28px;padding-top:20px;border-top:1px solid #2a241b;color:#8a7f70;font-size:12px;line-height:1.6;'>"
                + "        <strong>Shipping Destination:</strong><br/>"
                + escapeHtml(order.getShippingAddressLine1()) + (order.getShippingAddressLine2() != null && !order.getShippingAddressLine2().isBlank() ? ", " + escapeHtml(order.getShippingAddressLine2()) : "") + "<br/>"
                + escapeHtml(order.getShippingCity()) + ", " + escapeHtml(order.getShippingPostalCode()) + " (" + escapeHtml(order.getShippingCountry()) + ")<br/>"
                + "      </div>"
                + "    </div>"
                + "    <div style='background:#100f0d;padding:20px;text-align:center;font-size:11px;color:#6b6255;border-top:1px solid #201c16;'>"
                + "      AURORA — High Artisanal Tunisian Wooden Masks • Handcrafted in Tunisia • Worldwide DHL Express Delivery"
                + "    </div>"
                + "  </div>"
                + "</body>"
                + "</html>";
    }

    private String buildConfirmationHtml(Order order) {
        String formattedDate = DateTimeFormatter.ofPattern("MMMM dd, yyyy")
                .withZone(ZoneId.systemDefault())
                .format(order.getCreatedAt());

        return "<!DOCTYPE html>"
                + "<html>"
                + "<head><meta charset='UTF-8'></head>"
                + "<body style='margin:0;padding:0;background-color:#0d0c0a;font-family:-apple-system,BlinkMacSystemFont,\"Segoe UI\",Roboto,sans-serif;color:#f3efe6;'>"
                + "  <div style='max-width:640px;margin:30px auto;background:#161513;border:1px solid #2e281f;border-radius:12px;overflow:hidden;box-shadow:0 12px 40px rgba(0,0,0,0.6);'>"
                + "    <div style='background:linear-gradient(135deg, #1c1813 0%, #2b2318 100%);padding:36px 30px;border-bottom:1px solid #3d3220;text-align:center;'>"
                + "      <div style='font-size:11px;letter-spacing:4px;text-transform:uppercase;color:#d4af37;margin-bottom:8px;'>Atelier Artisanal Tunisien</div>"
                + "      <h1 style='margin:0;font-size:26px;font-weight:300;letter-spacing:2px;color:#ffffff;text-transform:uppercase;'>A U R O R A</h1>"
                + "      <div style='font-size:12px;color:#a89b88;margin-top:6px;'>Sidi Bou Saïd • Carthage • Tunis</div>"
                + "    </div>"
                + "    <div style='padding:32px 30px;'>"
                + "      <div style='display:inline-block;padding:6px 14px;background:rgba(74,222,128,0.15);border:1px solid rgba(74,222,128,0.3);border-radius:20px;color:#4ade80;font-size:12px;font-weight:600;letter-spacing:1px;text-transform:uppercase;margin-bottom:16px;'>✓ Order Confirmed</div>"
                + "      <h2 style='font-size:22px;font-weight:400;color:#f0e6d2;margin-top:0;'>Your Mask Collection is Being Prepared</h2>"
                + "      <p style='color:#bbb0a0;line-height:1.6;'>Cher/Chère " + escapeHtml(order.getCustomerName()) + ",</p>"
                + "      <p style='color:#bbb0a0;line-height:1.6;'>We are delighted to confirm your order <strong>#" + escapeHtml(order.getOrderNumber()) + "</strong>. Our master craftsmen in Sidi Bou Saïd have inspected your chosen masks, oiled them with native Mediterranean olive wood balm, and are preparing your collection for museum-grade packaging and DHL Express courier dispatch.</p>"
                + (order.getReviewNote() != null && !order.getReviewNote().isBlank()
                    ? "<div style='background:#1f1c17;border-left:3px solid #d4af37;padding:14px 18px;margin:20px 0;border-radius:0 8px 8px 0;font-size:13px;color:#d8ccba;font-style:italic;'>\"" + escapeHtml(order.getReviewNote()) + "\"<br/><span style='font-size:11px;color:#8a7f70;font-style:normal;'>— Atelier Artisan Reviewer</span></div>"
                    : "")
                + buildItemsTableHtml(order)
                + "      <div style='margin-top:28px;padding-top:20px;border-top:1px solid #2a241b;color:#8a7f70;font-size:12px;line-height:1.6;'>"
                + "        <strong>Delivery Address:</strong><br/>"
                + escapeHtml(order.getShippingAddressLine1()) + (order.getShippingAddressLine2() != null && !order.getShippingAddressLine2().isBlank() ? ", " + escapeHtml(order.getShippingAddressLine2()) : "") + "<br/>"
                + escapeHtml(order.getShippingCity()) + ", " + escapeHtml(order.getShippingPostalCode()) + " (" + escapeHtml(order.getShippingCountry()) + ")<br/>"
                + "      </div>"
                + "    </div>"
                + "    <div style='background:#100f0d;padding:20px;text-align:center;font-size:11px;color:#6b6255;border-top:1px solid #201c16;'>"
                + "      AURORA — High Artisanal Tunisian Wooden Masks • Handcrafted in Tunisia • Worldwide DHL Express Delivery"
                + "    </div>"
                + "  </div>"
                + "</body>"
                + "</html>";
    }

    private String buildRejectionHtml(Order order, String reason) {
        return "<!DOCTYPE html>"
                + "<html>"
                + "<head><meta charset='UTF-8'></head>"
                + "<body style='margin:0;padding:0;background-color:#0d0c0a;font-family:-apple-system,BlinkMacSystemFont,\"Segoe UI\",Roboto,sans-serif;color:#f3efe6;'>"
                + "  <div style='max-width:640px;margin:30px auto;background:#161513;border:1px solid #2e281f;border-radius:12px;overflow:hidden;box-shadow:0 12px 40px rgba(0,0,0,0.6);'>"
                + "    <div style='background:linear-gradient(135deg, #1c1813 0%, #2b2318 100%);padding:36px 30px;border-bottom:1px solid #3d3220;text-align:center;'>"
                + "      <div style='font-size:11px;letter-spacing:4px;text-transform:uppercase;color:#d4af37;margin-bottom:8px;'>Atelier Artisanal Tunisien</div>"
                + "      <h1 style='margin:0;font-size:26px;font-weight:300;letter-spacing:2px;color:#ffffff;text-transform:uppercase;'>A U R O R A</h1>"
                + "      <div style='font-size:12px;color:#a89b88;margin-top:6px;'>Sidi Bou Saïd • Carthage • Tunis</div>"
                + "    </div>"
                + "    <div style='padding:32px 30px;'>"
                + "      <div style='display:inline-block;padding:6px 14px;background:rgba(239,68,68,0.15);border:1px solid rgba(239,68,68,0.3);border-radius:20px;color:#ef4444;font-size:12px;font-weight:600;letter-spacing:1px;text-transform:uppercase;margin-bottom:16px;'>Order Status Update</div>"
                + "      <h2 style='font-size:22px;font-weight:400;color:#f0e6d2;margin-top:0;'>Regarding Your Order #" + escapeHtml(order.getOrderNumber()) + "</h2>"
                + "      <p style='color:#bbb0a0;line-height:1.6;'>Dear " + escapeHtml(order.getCustomerName()) + ",</p>"
                + "      <p style='color:#bbb0a0;line-height:1.6;'>Thank you for your interest in our artisanal Tunisian wooden mask gallery. After review by our atelier team, we regret to inform you that we are unable to fulfill order <strong>#" + escapeHtml(order.getOrderNumber()) + "</strong> at this time.</p>"
                + (reason != null && !reason.isBlank()
                    ? "<div style='background:#1f1717;border-left:3px solid #ef4444;padding:14px 18px;margin:20px 0;border-radius:0 8px 8px 0;font-size:13px;color:#e8c6c6;'><strong>Artisan Note:</strong> " + escapeHtml(reason) + "</div>"
                    : "")
                + "      <p style='color:#bbb0a0;line-height:1.6;'>No charges were incurred, and any reserved atelier items have been released back to our catalog. If you have questions or wish to explore alternative bespoke commissions, please feel free to reply directly to this message.</p>"
                + "    </div>"
                + "    <div style='background:#100f0d;padding:20px;text-align:center;font-size:11px;color:#6b6255;border-top:1px solid #201c16;'>"
                + "      AURORA — High Artisanal Tunisian Wooden Masks • Handcrafted in Tunisia • Worldwide DHL Express Delivery"
                + "    </div>"
                + "  </div>"
                + "</body>"
                + "</html>";
    }

    private String buildShippedHtml(Order order) {
        return "<!DOCTYPE html>"
                + "<html>"
                + "<head><meta charset='UTF-8'></head>"
                + "<body style='margin:0;padding:0;background-color:#0d0c0a;font-family:-apple-system,BlinkMacSystemFont,\"Segoe UI\",Roboto,sans-serif;color:#f3efe6;'>"
                + "  <div style='max-width:640px;margin:30px auto;background:#161513;border:1px solid #2e281f;border-radius:12px;overflow:hidden;box-shadow:0 12px 40px rgba(0,0,0,0.6);'>"
                + "    <div style='background:linear-gradient(135deg, #1c1813 0%, #2b2318 100%);padding:36px 30px;border-bottom:1px solid #3d3220;text-align:center;'>"
                + "      <div style='font-size:11px;letter-spacing:4px;text-transform:uppercase;color:#d4af37;margin-bottom:8px;'>Atelier Artisanal Tunisien</div>"
                + "      <h1 style='margin:0;font-size:26px;font-weight:300;letter-spacing:2px;color:#ffffff;text-transform:uppercase;'>A U R O R A</h1>"
                + "      <div style='font-size:12px;color:#a89b88;margin-top:6px;'>Sidi Bou Saïd • Carthage • Tunis</div>"
                + "    </div>"
                + "    <div style='padding:32px 30px;'>"
                + "      <div style='display:inline-block;padding:6px 14px;background:rgba(212,175,55,0.15);border:1px solid rgba(212,175,55,0.3);border-radius:20px;color:#d4af37;font-size:12px;font-weight:600;letter-spacing:1px;text-transform:uppercase;margin-bottom:16px;'>✈ Dispatched via DHL Express</div>"
                + "      <h2 style='font-size:22px;font-weight:400;color:#f0e6d2;margin-top:0;'>Your Mask Collection is On the Way</h2>"
                + "      <p style='color:#bbb0a0;line-height:1.6;'>Cher/Chère " + escapeHtml(order.getCustomerName()) + ",</p>"
                + "      <p style='color:#bbb0a0;line-height:1.6;'>Great news from the atelier: your order <strong>#" + escapeHtml(order.getOrderNumber()) + "</strong> has been handed over to DHL Express with priority diplomatic handling.</p>"
                + "      <div style='background:#1f1c17;border:1px solid #3d3220;padding:20px;margin:24px 0;border-radius:8px;text-align:center;'>"
                + "        <div style='color:#8a7f70;font-size:11px;text-transform:uppercase;letter-spacing:2px;'>DHL Express Waybill / Tracking Reference</div>"
                + "        <div style='color:#ffffff;font-size:20px;font-family:monospace;font-weight:bold;letter-spacing:3px;margin:8px 0;'>" + escapeHtml(order.getTrackingNumber()) + "</div>"
                + "        <p style='color:#a89b88;font-size:12px;margin:0;'>Live tracking timeline is now active in your Aurora account.</p>"
                + "      </div>"
                + buildItemsTableHtml(order)
                + "      <div style='margin-top:28px;padding-top:20px;border-top:1px solid #2a241b;color:#8a7f70;font-size:12px;line-height:1.6;'>"
                + "        <strong>Courier Destination:</strong><br/>"
                + escapeHtml(order.getShippingAddressLine1()) + "<br/>"
                + escapeHtml(order.getShippingCity()) + ", " + escapeHtml(order.getShippingPostalCode()) + " (" + escapeHtml(order.getShippingCountry()) + ")<br/>"
                + "      </div>"
                + "    </div>"
                + "    <div style='background:#100f0d;padding:20px;text-align:center;font-size:11px;color:#6b6255;border-top:1px solid #201c16;'>"
                + "      AURORA — High Artisanal Tunisian Wooden Masks • Handcrafted in Tunisia • Worldwide DHL Express Delivery"
                + "    </div>"
                + "  </div>"
                + "</body>"
                + "</html>";
    }

    private String buildItemsTableHtml(Order order) {
        StringBuilder sb = new StringBuilder();
        sb.append("<div style='margin-top:24px;border:1px solid #29241d;border-radius:8px;overflow:hidden;'>");
        sb.append("<table style='width:100%;border-collapse:collapse;font-size:13px;text-align:left;'>");
        sb.append("<tr style='background:#1c1914;color:#a89b88;border-bottom:1px solid #29241d;'>");
        sb.append("<th style='padding:12px 14px;'>Mask</th>");
        sb.append("<th style='padding:12px 14px;text-align:center;'>Qty</th>");
        sb.append("<th style='padding:12px 14px;text-align:right;'>Price</th>");
        sb.append("</tr>");

        if (order.getItems() != null) {
            for (OrderItem item : order.getItems()) {
                sb.append("<tr style='border-bottom:1px solid #241f17;'>");
                sb.append("<td style='padding:12px 14px;color:#e0d8cc;'><strong>").append(escapeHtml(item.getProductName())).append("</strong>");
                if (item.getProductWoodType() != null && !item.getProductWoodType().isBlank()) {
                    sb.append("<br/><span style='font-size:11px;color:#8a7f70;'>").append(escapeHtml(item.getProductWoodType())).append("</span>");
                }
                sb.append("</td>");
                sb.append("<td style='padding:12px 14px;text-align:center;color:#bbb0a0;'>").append(item.getQuantity()).append("</td>");
                sb.append("<td style='padding:12px 14px;text-align:right;color:#d4af37;'>").append(formatMoney(item.getTotalPrice(), order.getCurrency())).append("</td>");
                sb.append("</tr>");
            }
        }

        sb.append("<tr style='background:#161310;'>");
        sb.append("<td colspan='2' style='padding:10px 14px;color:#8a7f70;'>Shipping (DHL Express)</td>");
        sb.append("<td style='padding:10px 14px;text-align:right;color:#8a7f70;'>")
                .append(order.getShippingAmount().compareTo(BigDecimal.ZERO) == 0 ? "FREE" : formatMoney(order.getShippingAmount(), order.getCurrency()))
                .append("</td>");
        sb.append("</tr>");

        sb.append("<tr style='background:#1a1612;font-weight:600;border-top:1px solid #332a1e;'>");
        sb.append("<td colspan='2' style='padding:12px 14px;color:#f3efe6;'>Total Investment</td>");
        sb.append("<td style='padding:12px 14px;text-align:right;color:#d4af37;font-size:15px;'>")
                .append(formatMoney(order.getTotalAmount(), order.getCurrency()))
                .append("</td>");
        sb.append("</tr>");

        sb.append("</table>");
        sb.append("</div>");
        return sb.toString();
    }

    private String formatMoney(BigDecimal amount, String currency) {
        if (amount == null) return "0.00";
        String symbol = "USD".equalsIgnoreCase(currency) ? "$" : "€";
        return symbol + String.format("%.2f", amount);
    }

    private String escapeHtml(String text) {
        if (text == null) return "";
        return text.replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;")
                .replace("'", "&#39;");
    }
}
