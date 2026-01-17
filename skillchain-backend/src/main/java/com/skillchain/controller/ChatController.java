package com.skillchain.controller;

import com.skillchain.entity.ChatMessage;
import com.skillchain.entity.ChatRoom;
import com.skillchain.entity.User;
import com.skillchain.repository.ChatMessageRepository;
import com.skillchain.repository.ChatRoomRepository;
import com.skillchain.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/chat")
public class ChatController {

    @Autowired
    private ChatRoomRepository chatRoomRepository;

    @Autowired
    private ChatMessageRepository chatMessageRepository;

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/rooms")
    public List<ChatRoom> getRooms() {
        if (chatRoomRepository.count() == 0) {
            seedRooms();
        }
        return chatRoomRepository.findAll();
    }

    private void seedRooms() {
        createRoom("General Lounge", "Hang out and chat with everyone.", "SOCIAL", "☕");
        createRoom("Tech Talk", "Discuss latest frameworks and code.", "TECH", "💻");
        createRoom("Creative Corner", "Share art, music, and design.", "ART", "🎨");
        createRoom("Career Advice", "Get tips on landing your dream job.", "CAREER", "🚀");
    }

    private void createRoom(String name, String desc, String category, String icon) {
        ChatRoom room = new ChatRoom();
        room.setName(name);
        room.setDescription(desc);
        room.setCategory(category);
        room.setIcon(icon);
        chatRoomRepository.save(room);
    }

    @GetMapping("/rooms/{roomId}/messages")
    public List<ChatMessage> getMessages(@PathVariable Long roomId) {
        return chatMessageRepository.findByChatRoomIdOrderBySentAtAsc(roomId);
    }

    @PostMapping("/rooms/{roomId}/send")
    public ChatMessage sendMessage(
            @PathVariable Long roomId,
            @RequestBody String content,
            Authentication authentication) {

        ChatRoom room = chatRoomRepository.findById(roomId).orElseThrow();
        User sender = userRepository.findByUsername(authentication.getName()).orElseThrow();

        ChatMessage message = new ChatMessage();
        message.setChatRoom(room);
        message.setSender(sender);
        message.setContent(content);
        message.setSentAt(LocalDateTime.now());

        return chatMessageRepository.save(message);
    }
}
