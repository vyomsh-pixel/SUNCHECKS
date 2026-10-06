package com.example.data.repository

import com.example.data.local.AppDatabase
import com.example.data.local.ChatMessageEntity
import com.example.data.local.DailyLogEntity
import com.example.data.local.UserProfileEntity
import com.example.data.model.AiSuggestionItem
import com.example.data.model.Mood
import com.example.data.model.Persona
import com.example.data.model.TaskItem
import com.example.data.remote.GeminiRepository
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.firstOrNull
import org.json.JSONArray
import org.json.JSONObject
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import java.util.UUID

class DayPulseRepository(
    private val database: AppDatabase,
    private val geminiRepository: GeminiRepository = GeminiRepository()
) {
    private val logDao = database.dailyLogDao()
    private val profileDao = database.userProfileDao()
    private val chatDao = database.chatMessageDao()

    fun getTodayDateString(): String {
        val sdf = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault())
        return sdf.format(Date())
    }

    fun getFormattedDateDisplay(dateStr: String): String {
        return try {
            val sdf = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault())
            val date = sdf.parse(dateStr)
            val display = SimpleDateFormat("EEEE, MMMM d, yyyy", Locale.getDefault())
            date?.let { display.format(it) } ?: dateStr
        } catch (e: Exception) {
            dateStr
        }
    }

    fun getLogForDate(date: String): Flow<DailyLogEntity?> {
        return logDao.getLogByDate(date)
    }

    fun getAllLogs(): Flow<List<DailyLogEntity>> {
        return logDao.getAllLogs()
    }

    fun getUserProfile(): Flow<UserProfileEntity?> {
        return profileDao.getUserProfile()
    }

    fun getChatMessages(): Flow<List<ChatMessageEntity>> {
        return chatDao.getAllMessages()
    }

    suspend fun ensureProfileExists(): UserProfileEntity {
        var profile = profileDao.getUserProfileOnce()
        if (profile == null) {
            profile = UserProfileEntity(
                id = 1,
                name = "DayPulse Explorer",
                email = "rajkesir74@gmail.com",
                persona = Persona.WORKING_PROFESSIONAL.title,
                focusPriorities = "Deep Work, Career Growth, Health & Wellness",
                reminderHour = 20,
                reminderMinute = 0,
                reminderEnabled = true,
                morningDigestEnabled = true,
                currentStreak = 1,
                bestStreak = 1,
                lastLoggedDate = getTodayDateString()
            )
            profileDao.insertOrUpdateProfile(profile)
        }
        return profile
    }

    suspend fun saveProfile(profile: UserProfileEntity) {
        profileDao.insertOrUpdateProfile(profile)
    }

    suspend fun getOrCreateTodayLog(): DailyLogEntity {
        val today = getTodayDateString()
        var log = logDao.getLogByDateOnce(today)
        if (log == null) {
            val profile = ensureProfileExists()
            val personaEnum = Persona.fromString(profile.persona)
            val initialTasks = personaEnum.defaultHabits.map {
                TaskItem(
                    id = UUID.randomUUID().toString(),
                    title = it,
                    isCompleted = false,
                    category = "Routine"
                )
            }

            log = DailyLogEntity(
                date = today,
                mood = Mood.GOOD.name,
                moodTags = "Focused,Productive",
                energyLevel = 7,
                focusIntention = "",
                gratitude = "",
                eveningReflection = "",
                tasksJson = serializeTasks(initialTasks),
                aiSuggestionsJson = "[]",
                updatedAt = System.currentTimeMillis()
            )
            logDao.insertOrUpdateLog(log)
            updateStreakOnLog(today)
        }
        return log
    }

    suspend fun saveLog(log: DailyLogEntity) {
        logDao.insertOrUpdateLog(log.copy(updatedAt = System.currentTimeMillis()))
        updateStreakOnLog(log.date)
    }

    private suspend fun updateStreakOnLog(date: String) {
        val profile = ensureProfileExists()
        if (profile.lastLoggedDate != date) {
            val newStreak = profile.currentStreak + 1
            val bestStreak = maxOf(newStreak, profile.bestStreak)
            profileDao.insertOrUpdateProfile(
                profile.copy(
                    currentStreak = newStreak,
                    bestStreak = bestStreak,
                    lastLoggedDate = date
                )
            )
        }
    }

    suspend fun generateAndSaveAiPlan(date: String): List<AiSuggestionItem> {
        val profile = ensureProfileExists()
        val persona = Persona.fromString(profile.persona)
        val log = logDao.getLogByDateOnce(date) ?: getOrCreateTodayLog()

        val mood = Mood.fromString(log.mood)
        val suggestions = geminiRepository.generateDailyPlan(
            persona = persona,
            mood = mood,
            energyLevel = log.energyLevel,
            focusIntention = log.focusIntention,
            goals = profile.focusPriorities,
            roleDetails = profile.roleDetails,
            workStyle = profile.workStyle,
            challenge = profile.primaryChallenge
        )

        val updatedLog = log.copy(
            aiSuggestionsJson = serializeSuggestions(suggestions)
        )
        logDao.insertOrUpdateLog(updatedLog)
        return suggestions
    }

    suspend fun sendChatMessage(userText: String): String {
        val profile = ensureProfileExists()
        val today = getTodayDateString()
        val log = logDao.getLogByDateOnce(today)
        val tasks = if (log != null) parseTasks(log.tasksJson) else emptyList()

        // Save user message
        chatDao.insertMessage(
            ChatMessageEntity(
                sender = "user",
                content = userText,
                timestamp = System.currentTimeMillis()
            )
        )

        val history = chatDao.getAllMessages().firstOrNull() ?: emptyList()
        val reply = geminiRepository.getAssistantResponse(
            userMessage = userText,
            profile = profile,
            log = log,
            tasks = tasks,
            recentHistory = history
        )

        // Save assistant reply
        chatDao.insertMessage(
            ChatMessageEntity(
                sender = "assistant",
                content = reply,
                timestamp = System.currentTimeMillis()
            )
        )

        return reply
    }

    suspend fun requestQuickAdvice(type: com.example.data.remote.AdviceType): String {
        val profile = ensureProfileExists()
        val today = getTodayDateString()
        val log = logDao.getLogByDateOnce(today)
        val tasks = if (log != null) parseTasks(log.tasksJson) else emptyList()

        val advice = geminiRepository.generateQuickAdvice(
            type = type,
            profile = profile,
            log = log,
            tasks = tasks
        )

        // Add to chat history as assistant insight
        chatDao.insertMessage(
            ChatMessageEntity(
                sender = "assistant",
                content = advice,
                timestamp = System.currentTimeMillis()
            )
        )

        return advice
    }

    suspend fun clearChat() {
        chatDao.clearHistory()
    }

    // JSON Helper Methods
    fun parseTasks(json: String): List<TaskItem> {
        val list = mutableListOf<TaskItem>()
        if (json.isBlank()) return list
        try {
            val array = JSONArray(json)
            for (i in 0 until array.length()) {
                val obj = array.getJSONObject(i)
                list.add(
                    TaskItem(
                        id = obj.optString("id", UUID.randomUUID().toString()),
                        title = obj.optString("title", ""),
                        isCompleted = obj.optBoolean("isCompleted", false),
                        category = obj.optString("category", "General")
                    )
                )
            }
        } catch (e: Exception) {
            // ignore
        }
        return list
    }

    fun serializeTasks(tasks: List<TaskItem>): String {
        val array = JSONArray()
        tasks.forEach { item ->
            val obj = JSONObject()
            obj.put("id", item.id)
            obj.put("title", item.title)
            obj.put("isCompleted", item.isCompleted)
            obj.put("category", item.category)
            array.put(obj)
        }
        return array.toString()
    }

    fun parseSuggestions(json: String): List<AiSuggestionItem> {
        val list = mutableListOf<AiSuggestionItem>()
        if (json.isBlank()) return list
        try {
            val array = JSONArray(json)
            for (i in 0 until array.length()) {
                val obj = array.getJSONObject(i)
                list.add(
                    AiSuggestionItem(
                        id = obj.optString("id", UUID.randomUUID().toString()),
                        title = obj.optString("title", ""),
                        description = obj.optString("description", ""),
                        timeOfDay = obj.optString("timeOfDay", "Morning"),
                        category = obj.optString("category", "Productivity"),
                        isAdopted = obj.optBoolean("isAdopted", false)
                    )
                )
            }
        } catch (e: Exception) {
            // ignore
        }
        return list
    }

    fun serializeSuggestions(suggestions: List<AiSuggestionItem>): String {
        val array = JSONArray()
        suggestions.forEach { item ->
            val obj = JSONObject()
            obj.put("id", item.id)
            obj.put("title", item.title)
            obj.put("description", item.description)
            obj.put("timeOfDay", item.timeOfDay)
            obj.put("category", item.category)
            obj.put("isAdopted", item.isAdopted)
            array.put(obj)
        }
        return array.toString()
    }
}
