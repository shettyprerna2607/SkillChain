package com.skillchain.service;

import com.skillchain.entity.SkillChain;
import com.skillchain.entity.User;
import com.skillchain.entity.UserSkill;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.stream.Collectors;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class LLMService {

        @Value("${gemini.api.key:}")
        private String apiKey;

        private final String GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=";

        public Map<String, Object> getAdvancedAdvice(String query, User user, List<UserSkill> userSkills,
                        List<SkillChain> allChains) {

                if (apiKey == null || apiKey.trim().isEmpty()) {
                        System.err.println("AI COACH ERROR: API Key is MISSING in application.properties!");
                        return getPseudoAIResponse(query, user, userSkills, allChains);
                }

                String skillsStr = userSkills.stream()
                                .map(us -> us.getSkill().getName() + " ("
                                                + (us.getProficiencyLevel() != null ? us.getProficiencyLevel()
                                                                : "Learning")
                                                + ")")
                                .collect(Collectors.joining(", "));

                String chainsStr = allChains.stream()
                                .map(c -> c.getTitle() + ": " + c.getDescription())
                                .collect(Collectors.joining("\n"));

                String systemPrompt = "You are the SkillChain AI Coach. Be professional and encouraging.\n" +
                                "User: " + user.getFullName() + "\n" +
                                "Skills: " + (skillsStr.isEmpty() ? "None" : skillsStr) + "\n" +
                                "Streak: " + user.getStreakCount() + " days\n" +
                                "Quests Available:\n" + chainsStr + "\n\n" +
                                "User Query: " + query;

                try {
                        RestTemplate restTemplate = new RestTemplate();

                        // Set explicit headers
                        org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
                        headers.setContentType(org.springframework.http.MediaType.APPLICATION_JSON);

                        Map<String, Object> body = Map.of(
                                        "contents", List.of(
                                                        Map.of("parts", List.of(
                                                                        Map.of("text", systemPrompt)))));

                        org.springframework.http.HttpEntity<Map<String, Object>> entity = new org.springframework.http.HttpEntity<>(
                                        body, headers);

                        // Attempt the POST request
                        @SuppressWarnings("unchecked")
                        Map<String, Object> response = restTemplate.postForObject(GEMINI_URL + apiKey.trim(), entity,
                                        Map.class);

                        if (response == null || !response.containsKey("candidates")) {
                                throw new Exception("Invalid response structure from Gemini API");
                        }

                        // Extract text from Gemini response structure
                        @SuppressWarnings("unchecked")
                        List<Map<String, Object>> candidates = (List<Map<String, Object>>) response.get("candidates");
                        @SuppressWarnings("unchecked")
                        Map<String, Object> content = (Map<String, Object>) candidates.get(0).get("content");
                        @SuppressWarnings("unchecked")
                        List<Map<String, Object>> parts = (List<Map<String, Object>>) content.get("parts");
                        String aiText = (String) parts.get(0).get("text");

                        return Map.of("response", aiText, "suggestions", filterSuggestions(aiText, allChains));

                } catch (Exception e) {
                        System.err.println("Gemini API Error: " + e.getMessage());

                        Map<String, Object> fallback = getPseudoAIResponse(query, user, userSkills, allChains);

                        // Provide a user-friendly message for quota or connection errors
                        String helpfulMessage = (e.getMessage() != null && e.getMessage().contains("429"))
                                        ? "The Coach is taking a short meditation break. Try naturally in 30 seconds!"
                                        : fallback.get("response").toString();

                        return Map.of("response", "[DRAFT] " + helpfulMessage, "suggestions",
                                        fallback.get("suggestions"));
                }
        }

        private Map<String, Object> getPseudoAIResponse(String query, User user, List<UserSkill> userSkills,
                        List<SkillChain> allChains) {
                // Fallback "Brain" that is smarter than the old one but local
                String response;
                List<Map<String, Object>> suggestions = new ArrayList<>();

                if (query.contains("next") || query.contains("roadmap") || query.contains("learn")) {
                        SkillChain suggestion = allChains.stream().findFirst().orElse(null);
                        if (suggestion != null) {
                                Map<String, Object> simplified = new HashMap<>();
                                simplified.put("id", suggestion.getId());
                                simplified.put("title", suggestion.getTitle());
                                simplified.put("description", suggestion.getDescription());
                                simplified.put("icon", suggestion.getIcon());
                                suggestions.add(simplified);

                                response = "Greetings, " + user.getFullName()
                                                + "! My neural networks suggest you embark on the '" +
                                                suggestion.getTitle() + "' quest. You have " + user.getPoints()
                                                + " XP ready to stake, " +
                                                "and your " + user.getStreakCount()
                                                + "-day streak will grant you a bonus upon completion!";
                        } else {
                                response = "I couldn't find any quests for you right now, but keep building your streak!";
                        }
                } else {
                        response = "I am processing your request. As your Coach, I recommend focusing on building your streak to unlock higher XP multipliers before starting a major new Skill Chain!";
                }

                return Map.of("response", "[DRAFT MODE] " + response, "suggestions", suggestions);
        }

        private List<Map<String, Object>> filterSuggestions(String text, List<SkillChain> allChains) {
                return allChains.stream()
                                .filter(c -> text.toLowerCase().contains(c.getTitle().toLowerCase()))
                                .limit(2)
                                .map(c -> {
                                        Map<String, Object> simplified = new HashMap<>();
                                        simplified.put("id", c.getId());
                                        simplified.put("title", c.getTitle());
                                        simplified.put("description", c.getDescription());
                                        simplified.put("icon", c.getIcon());
                                        return simplified;
                                })
                                .collect(Collectors.toList());
        }
}
