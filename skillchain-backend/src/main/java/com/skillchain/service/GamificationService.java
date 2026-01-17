package com.skillchain.service;

import com.skillchain.entity.User;
import com.skillchain.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Service
public class GamificationService {

    @Autowired
    private UserRepository userRepository;

    @Transactional
    public void updateActivity(User user) {
        LocalDateTime now = LocalDateTime.now();
        LocalDate today = now.toLocalDate();

        if (user.getLastActivityDate() == null) {
            user.setStreakCount(1);
        } else {
            LocalDate lastDate = user.getLastActivityDate().toLocalDate();

            if (lastDate.isEqual(today.minusDays(1))) {
                // Continued streak
                user.setStreakCount(user.getStreakCount() + 1);
            } else if (lastDate.isBefore(today.minusDays(1))) {
                // Streak broken
                user.setStreakCount(1);
            }
            // If lastDate == today, do nothing to current streak
        }

        user.setLastActivityDate(now);
        userRepository.save(user);
    }

    public double getMultiplier(User user) {
        if (user.getStreakCount() >= 30)
            return 2.0;
        if (user.getStreakCount() >= 7)
            return 1.5;
        if (user.getStreakCount() >= 3)
            return 1.2;
        return 1.0;
    }
}
