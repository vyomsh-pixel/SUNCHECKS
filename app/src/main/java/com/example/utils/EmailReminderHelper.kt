package com.example.utils

import android.content.Context
import android.content.Intent
import android.net.Uri
import android.widget.Toast
import com.example.data.local.DailyLogEntity
import com.example.data.local.UserProfileEntity
import com.example.data.model.AiSuggestionItem
import com.example.data.model.Mood
import com.example.data.model.TaskItem
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

object EmailReminderHelper {

    fun generateDailySummaryEmail(
        profile: UserProfileEntity,
        log: DailyLogEntity,
        tasks: List<TaskItem>,
        suggestions: List<AiSuggestionItem>
    ): Pair<String, String> {
        val todayPretty = try {
            val sdf = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault())
            val date = sdf.parse(log.date)
            SimpleDateFormat("MMMM d, yyyy", Locale.getDefault()).format(date ?: Date())
        } catch (e: Exception) {
            log.date
        }

        val subject = "[DayPulse] Daily Log & AI Reflection - $todayPretty"

        val moodObj = Mood.fromString(log.mood)
        val completedTasks = tasks.filter { it.isCompleted }
        val completionRate = if (tasks.isNotEmpty()) (completedTasks.size * 100) / tasks.size else 0

        val tasksSection = if (tasks.isEmpty()) {
            "• No tasks logged yet today."
        } else {
            tasks.joinToString("\n") { task ->
                val box = if (task.isCompleted) "[✓]" else "[ ]"
                "$box ${task.title}"
            }
        }

        val suggestionsSection = if (suggestions.isEmpty()) {
            "• Focus on resting and staying consistent tomorrow!"
        } else {
            suggestions.joinToString("\n") { item ->
                "• [${item.timeOfDay}] ${item.title}: ${item.description}"
            }
        }

        val body = """
            ✨ DAYPULSE DAILY SUMMARY & REMINDER DIGEST ✨
            --------------------------------------------------
            Date: $todayPretty
            Persona Profile: ${profile.persona}
            Current Consistency Streak: ${profile.currentStreak} Days 🔥
            
            🌟 YOUR DAILY PULSE
            • Mood: ${moodObj.displayName} ${moodObj.emoji}
            • Tags: ${log.moodTags.ifBlank { "None" }}
            • Energy Level: ${log.energyLevel}/10 ⚡
            • Focus Intention: "${log.focusIntention.ifBlank { "Balance & Focus" }}"
            
            ✅ HABITS & TASKS ($completionRate% Completed)
            $tasksSection
            
            🧠 SMART AI ROUTINE SUGGESTIONS FOR YOU
            $suggestionsSection
            
            💖 GRATITUDE & REFLECTIONS
            • What went well / Gratitude:
              "${log.gratitude.ifBlank { "Not yet logged" }}"
            • Evening Reflection / Wins:
              "${log.eveningReflection.ifBlank { "Not yet logged" }}"
            
            --------------------------------------------------
            Target Goals: ${profile.focusPriorities}
            Sent via DayPulse App to ${profile.email}
            Keep up the incredible consistency! 🚀
        """.trimIndent()

        return Pair(subject, body)
    }

    fun openEmailClient(context: Context, toEmail: String, subject: String, body: String) {
        try {
            val uri = Uri.parse("mailto:" + Uri.encode(toEmail))
            val intent = Intent(Intent.ACTION_SENDTO, uri).apply {
                putExtra(Intent.EXTRA_SUBJECT, subject)
                putExtra(Intent.EXTRA_TEXT, body)
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            }
            context.startActivity(Intent.createChooser(intent, "Send DayPulse Digest via Email"))
        } catch (e: Exception) {
            // Fallback to standard share
            try {
                val fallbackIntent = Intent(Intent.ACTION_SEND).apply {
                    type = "message/rfc822"
                    putExtra(Intent.EXTRA_EMAIL, arrayOf(toEmail))
                    putExtra(Intent.EXTRA_SUBJECT, subject)
                    putExtra(Intent.EXTRA_TEXT, body)
                    addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                }
                context.startActivity(Intent.createChooser(fallbackIntent, "Send DayPulse Digest via Email"))
            } catch (ex: Exception) {
                Toast.makeText(context, "No email app found on device.", Toast.LENGTH_SHORT).show()
            }
        }
    }
}
