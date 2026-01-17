package com.skillchain.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;

@Entity
@Table(name = "call_signaling")
@Getter
@Setter
public class CallSignaling {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long sessionId;

    @Column(nullable = false)
    private String senderUsername;

    @Column(columnDefinition = "TEXT")
    private String data; // JSON string of offer/answer/candidates

    private String type; // OFFER, ANSWER, CANDIDATE

    private LocalDateTime createdAt = LocalDateTime.now();
}
