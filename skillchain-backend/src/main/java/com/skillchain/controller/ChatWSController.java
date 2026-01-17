package com.skillchain.controller;

import com.skillchain.entity.ChatMessage;
import com.skillchain.entity.ChatRoom;
import com.skillchain.entity.User;
import com.skillchain.repository.ChatMessageRepository;
import com.skillchain.repository.ChatRoomRepository;
import com.skillchain.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.time.LocalDateTime;
import java.util.Map;

@Controller
public class ChatWSController {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Autowired
    private ChatRoomRepository chatRoomRepository;

    @Autowired
    private ChatMessageRepository chatMessageRepository;

    @Autowired
    private UserRepository userRepository;

    @MessageMapping("/chat/{roomId}/send")
    public void sendMessage(@DestinationVariable Long roomId, @Payload Map<String, String> payload) {
        String content = payload.get("content");
        String username = payload.get("username");

        ChatRoom room = chatRoomRepository.findById(roomId).orElseThrow();
        User sender = userRepository.findByUsername(username).orElseThrow();

        ChatMessage message = new ChatMessage();
        message.setChatRoom(room);
        message.setSender(sender);
        message.setContent(content);
        message.setSentAt(LocalDateTime.now());

        ChatMessage saved = chatMessageRepository.save(message);

        // Broadcast the saved message to everyone in the room
        messagingTemplate.convertAndSend("/topic/room/" + roomId, saved);
    }
}
