package com.example

import com.example.data.local.DailyLogEntity
import com.example.data.local.UserProfileEntity
import com.example.data.model.AiSuggestionItem
import com.example.data.model.Mood
import com.example.data.model.Persona
import com.example.data.model.TaskItem
import com.example.utils.EmailReminderHelper
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

class ExampleUnitTest {
    @Test
    fun testPersonaDefaultHabits() {
        val student = Persona.STUDENT
        assertTrue(student.defaultHabits.isNotEmpty())

        val professional = Persona.WORKING_PROFESSIONAL
        assertTrue(professional.defaultHabits.isNotEmpty())

        val founder = Persona.ENTREPRENEUR
        assertTrue(founder.defaultHabits.isNotEmpty())
    }

    @Test
    fun testMoodParsing() {
        assertEquals(Mood.ECSTATIC, Mood.fromString("ECSTATIC"))
        assertEquals(Mood.GOOD, Mood.fromString("GOOD"))
        assertEquals(Mood.GOOD, Mood.fromString(null))
    }

    @Test
    fun testProfileOnboardingState() {
        val initialProfile = UserProfileEntity(
            email = "user@example.com",
            persona = "Working Professional",
            isOnboardingCompleted = false
        )
        assertFalse(initialProfile.isOnboardingCompleted)
        assertEquals("Software & Tech", initialProfile.roleDetails)

        val completedProfile = initialProfile.copy(
            isOnboardingCompleted = true,
            roleDetails = "Fintech Product Manager"
        )
        assertTrue(completedProfile.isOnboardingCompleted)
        assertEquals("Fintech Product Manager", completedProfile.roleDetails)
    }

    @Test
    fun testEmailReminderGeneration() {
        val profile = UserProfileEntity(
            email = "user@example.com",
            persona = "Student",
            currentStreak = 4
        )
        val log = DailyLogEntity(
            date = "2026-10-06",
            mood = "GOOD",
            moodTags = "Focused,Calm",
            energyLevel = 8,
            focusIntention = "Ace Chemistry Exam",
            gratitude = "Good coffee and study group",
            eveningReflection = "Understood reaction mechanisms"
        )
        val tasks = listOf(
            TaskItem(id = "1", title = "Study 2h", isCompleted = true),
            TaskItem(id = "2", title = "Review flashcards", isCompleted = false)
        )
        val suggestions = listOf(
            AiSuggestionItem(
                id = "s1",
                title = "Pomodoro study block",
                description = "Focus for 25m without distractions",
                timeOfDay = "Morning",
                category = "Focus"
            )
        )

        val (subject, body) = EmailReminderHelper.generateDailySummaryEmail(
            profile, log, tasks, suggestions
        )

        assertTrue(subject.contains("[DayPulse]"))
        assertTrue(body.contains("user@example.com"))
        assertTrue(body.contains("Ace Chemistry Exam"))
        assertTrue(body.contains("4 Days"))
        assertTrue(body.contains("Study 2h"))
    }
}
