package com.skillchain.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
@Getter
@Setter
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String message;

    private String type; // REQUEST, ACCEPTED, COMPLETED, BADGE

    private boolean isRead = false;

    private LocalDateTime createdAt = LocalDateTime.now();

    private String relatedId; // e.g., session ID if applicable
}
