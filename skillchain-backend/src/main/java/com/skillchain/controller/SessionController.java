package com.skillchain.controller;

import com.skillchain.entity.*;
import com.skillchain.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/sessions")
public class SessionController {

    @Autowired
    private SessionRepository sessionRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SkillRepository skillRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private BadgeRepository badgeRepository;

    private void createNotification(User user, String message, String type, String relatedId) {
        Notification n = new Notification();
        n.setUser(user);
        n.setMessage(message);
        n.setType(type);
        n.setRelatedId(relatedId);
        notificationRepository.save(n);
    }

    private void grantBadge(User user, String name, String category, String icon) {
        Badge badge = new Badge();
        badge.setUser(user);
        badge.setBadgeName(name);
        badge.setCategory(category);
        badge.setIcon(icon);
        badgeRepository.save(badge);

        createNotification(user, "Congratulations! You earned a new badge: " + name + " " + icon, "BADGE",
                badge.getId().toString());
    }

    @GetMapping("/my")
    public List<Session> getMySessions(Authentication authentication) {
        return sessionRepository.findAllByUsername(authentication.getName());
    }

    @PostMapping("/request")
    public ResponseEntity<?> requestSession(@RequestBody SessionRequest request, Authentication authentication) {
        User learner = userRepository.findByUsername(authentication.getName()).orElseThrow();
        User teacher = userRepository.findById(request.teacherId()).orElseThrow();
        Skill skill = skillRepository.findByName(request.skillName()).orElseThrow();

        Session session = new Session();
        session.setLearner(learner);
        session.setTeacher(teacher);
        session.setSkill(skill);
        session.setScheduledAt(request.scheduledAt());
        session.setDescription(request.description());
        session.setStatus(SessionStatus.PENDING);

        sessionRepository.save(session);

        // Notify Teacher
        createNotification(teacher,
                learner.getFullName() + " requested to learn " + skill.getName() + " from you.",
                "REQUEST", session.getId().toString());

        return ResponseEntity.ok("Session requested successfully!");
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(
            @PathVariable Long id,
            @RequestParam SessionStatus status,
            @RequestParam(required = false) Integer rating,
            @RequestParam(required = false) String feedback,
            Authentication authentication) {

        Session session = sessionRepository.findById(id).orElseThrow();
        String username = authentication.getName();

        if (!session.getTeacher().getUsername().equals(username)
                && !session.getLearner().getUsername().equals(username)) {
            return ResponseEntity.status(403).body("Unauthorized");
        }

        if (status == SessionStatus.COMPLETED) {
            // Learner rates the teacher
            if (!session.getLearner().getUsername().equals(username)) {
                return ResponseEntity.badRequest().body("Only the learner can mark session as completed and rate it");
            }
            session.setRating(rating);
            session.setFeedback(feedback);

            // Reward Points
            User teacher = session.getTeacher();
            User learner = session.getLearner();

            teacher.setPoints(teacher.getPoints() + 50); // Teacher gets 50
            learner.setPoints(learner.getPoints() + 10); // Learner gets 10

            userRepository.save(teacher);
            userRepository.save(learner);
        }

        session.setStatus(status);
        sessionRepository.save(session);

        // Notify appropriately
        if (status == SessionStatus.ACCEPTED) {
            createNotification(session.getLearner(),
                    session.getTeacher().getFullName() + " accepted your session request for "
                            + session.getSkill().getName() + "!",
                    "ACCEPTED", session.getId().toString());
        } else if (status == SessionStatus.CANCELLED) {
            User otherUser = username.equals(session.getTeacher().getUsername()) ? session.getLearner()
                    : session.getTeacher();
            createNotification(otherUser,
                    username + " cancelled the session for " + session.getSkill().getName(),
                    "CANCELLED", session.getId().toString());
        } else if (status == SessionStatus.COMPLETED) {
            createNotification(session.getTeacher(),
                    session.getLearner().getFullName() + " marked the session as completed and gave you a "
                            + session.getRating() + " star rating!",
                    "COMPLETED", session.getId().toString());

            // --- Achievement Logic ---
            // 1. First Session Badge for Learner
            if (badgeRepository.findByUserIdOrderByAwardedAtDesc(session.getLearner().getId()).isEmpty()) {
                grantBadge(session.getLearner(), "First Steps", "LEARNER", "🎓");
            }

            // 2. High Rating Badge for Teacher
            if (session.getRating() != null && session.getRating() >= 5) {
                grantBadge(session.getTeacher(), "Top Teacher", "TEACHER", "🌟");
            }
        }

        return ResponseEntity.ok("Session updated successfully!");
    }

    record SessionRequest(Long teacherId, String skillName, LocalDateTime scheduledAt, String description) {
    }
}
