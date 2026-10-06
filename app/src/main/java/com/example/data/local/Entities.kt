package com.example.data.local

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "daily_logs")
data class DailyLogEntity(
    @PrimaryKey
    val date: String, // Format: YYYY-MM-DD
    val mood: String = "GOOD",
    val moodTags: String = "Focused,Productive",
    val energyLevel: Int = 7, // 1 to 10
    val focusIntention: String = "",
    val gratitude: String = "",
    val eveningReflection: String = "",
    val tasksJson: String = "[]",
    val aiSuggestionsJson: String = "[]",
    val updatedAt: Long = System.currentTimeMillis()
)

@Entity(tableName = "user_profile")
data class UserProfileEntity(
    @PrimaryKey
    val id: Int = 1,
    val name: String = "DayPulse Explorer",
    val email: String = "rajkesir74@gmail.com",
    val persona: String = "Working Professional",
    val focusPriorities: String = "Deep Work, Career Growth, Health",
    val roleDetails: String = "Software & Tech",
    val workStyle: String = "Morning Focus",
    val primaryChallenge: String = "Overcoming Procrastination",
    val reminderHour: Int = 20, // 8:00 PM
    val reminderMinute: Int = 0,
    val reminderEnabled: Boolean = true,
    val morningDigestEnabled: Boolean = true,
    val currentStreak: Int = 1,
    val bestStreak: Int = 1,
    val lastLoggedDate: String = "",
    val isOnboardingCompleted: Boolean = false
)

@Entity(tableName = "chat_messages")
data class ChatMessageEntity(
    @PrimaryKey(autoGenerate = true)
    val id: Long = 0,
    val sender: String, // "user" or "assistant"
    val content: String,
    val timestamp: Long = System.currentTimeMillis()
)
