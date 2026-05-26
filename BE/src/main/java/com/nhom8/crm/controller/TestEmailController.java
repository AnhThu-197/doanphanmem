package com.nhom8.crm.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Profile;
import org.springframework.http.ResponseEntity;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.web.bind.annotation.*;

import jakarta.mail.internet.MimeMessage;
import java.nio.charset.StandardCharsets;
import java.util.Map;

/**
 * Controller test gửi email trực tiếp — KHÔNG dùng @Async
 * Dùng để debug: GET /api/test-email?to=abc@gmail.com
 * XÓA file này sau khi debug xong
 */
@RestController
@RequestMapping("/test-email")
@RequiredArgsConstructor
@Slf4j
public class TestEmailController {

    private final JavaMailSender mailSender;

    @Value("${app.mail.from}")
    private String fromEmail;

    @Value("${app.mail.from-name}")
    private String fromName;

    @Value("${spring.mail.username}")
    private String smtpUsername;

    /**
     * Test gửi email đồng bộ — lỗi sẽ hiện rõ trong response
     * URL: GET http://localhost:8081/api/test-email?to=EMAIL_NHAN
     */
    @GetMapping
    public ResponseEntity<Map<String, Object>> testEmail(
            @RequestParam String to) {

        log.info("=== BẮT ĐẦU TEST EMAIL ===");
        log.info("SMTP username: {}", smtpUsername);
        log.info("From: {} <{}>", fromName, fromEmail);
        log.info("To: {}", to);

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(
                    message, true, StandardCharsets.UTF_8.name());

            helper.setFrom(fromEmail, fromName);
            helper.setTo(to);
            helper.setSubject("[CRM Test] Email test tu Spring Boot");
            helper.setText(
                "<h2>Test Email Thanh Cong!</h2>" +
                "<p>Email nay duoc gui tu Spring Boot CRM Nhom 8.</p>" +
                "<p>SMTP: smtp.gmail.com:587</p>" +
                "<p>From: " + fromEmail + "</p>",
                true
            );

            mailSender.send(message);

            log.info("✅ TEST EMAIL THÀNH CÔNG tới: {}", to);
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Gui email thanh cong toi: " + to,
                "from", fromEmail,
                "to", to
            ));

        } catch (Exception e) {
            log.error("❌ TEST EMAIL THẤT BẠI: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(Map.of(
                "success", false,
                "error", e.getMessage(),
                "cause", e.getCause() != null ? e.getCause().getMessage() : "unknown",
                "type", e.getClass().getSimpleName()
            ));
        }
    }
}
