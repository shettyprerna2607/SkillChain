package com.skillchain.controller;

import com.skillchain.entity.Skill;
import com.skillchain.entity.User;
import com.skillchain.entity.UserSkill;
import com.skillchain.entity.ProficiencyLevel; // ← Use entity package
import com.skillchain.entity.SkillType; // ← Use entity package
import com.skillchain.repository.SkillRepository;
import com.skillchain.repository.UserRepository;
import com.skillchain.repository.UserSkillRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/skills")
public class SkillProfileController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SkillRepository skillRepository;

    @Autowired
    private UserSkillRepository userSkillRepository;

    // Request record - Move inside for better visibility
    public record AddSkillRequest(
            String skillName,
            String category,
            SkillType type,
            ProficiencyLevel proficiencyLevel,
            String description) {
    }

    @PostMapping("/add")
    public ResponseEntity<?> addSkill(@RequestBody AddSkillRequest request, Authentication authentication) {
        try {
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.status(401).body("Unauthorized - please log in");
            }

            String username = authentication.getName();
            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            // Case-insensitive skill matching
            String normalizedName = request.skillName().trim();
            Skill skill = skillRepository.findByName(normalizedName)
                    .orElseGet(() -> {
                        Skill newSkill = new Skill();
                        newSkill.setName(normalizedName);
                        newSkill.setCategory(request.category());
                        newSkill.setDescription(request.description() != null ? request.description() : "");
                        return skillRepository.saveAndFlush(newSkill); // Force immediate save
                    });

            // Check if already exists
            boolean exists = userSkillRepository.findByUserId(user.getId()).stream()
                    .anyMatch(us -> us.getSkill().getId().equals(skill.getId()) &&
                            us.getType() == request.type());

            if (exists) {
                return ResponseEntity.badRequest().body("Quest already active: You are already " +
                        (request.type() == SkillType.LEARN ? "learning " : "teaching ") + normalizedName);
            }

            UserSkill userSkill = new UserSkill();
            userSkill.setUser(user);
            userSkill.setSkill(skill);
            userSkill.setType(request.type());

            if (request.type() == SkillType.TEACH) {
                userSkill.setProficiencyLevel(request.proficiencyLevel());
            } else {
                userSkill.setProficiencyLevel(null);
            }

            userSkillRepository.saveAndFlush(userSkill);

            // Helpful for local testing: Clear the entity manager if possible to avoid
            // cache lag
            // In typical Spring Data JPA, saveAndFlush is sufficient.

            return ResponseEntity.ok("Skill added successfully!");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Server Error: " + e.getMessage());
        }
    }

    // Get my skills — simplified for reliability
    @GetMapping("/my")
    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public ResponseEntity<?> getMySkills(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).body("Unauthorized");
        }

        String username = authentication.getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<UserSkill> skills = userSkillRepository.findByUserId(user.getId());

        List<java.util.Map<String, Object>> simplifiedSkills = skills.stream().map(us -> {
            java.util.Map<String, Object> map = new java.util.HashMap<>();
            map.put("id", us.getId());
            map.put("type", us.getType());
            map.put("proficiencyLevel", us.getProficiencyLevel());

            java.util.Map<String, String> skillMap = new java.util.HashMap<>();
            skillMap.put("name", us.getSkill().getName());
            skillMap.put("category", us.getSkill().getCategory());
            map.put("skill", skillMap);

            return map;
        }).collect(java.util.stream.Collectors.toList());

        return ResponseEntity.ok(simplifiedSkills);
    }
}
