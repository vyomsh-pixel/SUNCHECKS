package com.example.ui.viewmodel

import android.app.Application
import android.content.Context
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.example.data.local.AppDatabase
import com.example.data.local.ChatMessageEntity
import com.example.data.local.DailyLogEntity
import com.example.data.local.UserProfileEntity
import com.example.data.model.AiSuggestionItem
import com.example.data.model.Mood
import com.example.data.model.Persona
import com.example.data.model.TaskItem
import com.example.data.remote.AdviceType
import com.example.data.repository.DayPulseRepository
import com.example.utils.EmailReminderHelper
import com.example.utils.NotificationHelper
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import java.util.UUID

enum class AppNavTab(val title: String, val iconName: String) {
    DAILY_LOG("Daily Log", "edit"),
    AI_SUGGESTIONS("Smart Routine", "sparkles"),
    ASSISTANT_BOT("AI Advisor", "chat"),
    ANALYTICS("Trends", "chart"),
    PROFILE_REMINDERS("Profile & Email", "settings")
}

data class UiState(
    val profile: UserProfileEntity? = null,
    val currentLog: DailyLogEntity? = null,
    val tasks: List<TaskItem> = emptyList(),
    val suggestions: List<AiSuggestionItem> = emptyList(),
    val allLogs: List<DailyLogEntity> = emptyList(),
    val chatMessages: List<ChatMessageEntity> = emptyList(),
    val isLoadingAiPlan: Boolean = false,
    val isChatReplying: Boolean = false,
    val isGeneratingQuickAdvice: Boolean = false,
    val currentTab: AppNavTab = AppNavTab.DAILY_LOG,
    val isOnboardingActive: Boolean = false,
    val snackbarMessage: String? = null,
    val emailPreviewPair: Pair<String, String>? = null,
    val latestCoachingTip: String? = null
)

class MainViewModel(application: Application) : AndroidViewModel(application) {

    private val repository = DayPulseRepository(AppDatabase.getInstance(application))

    private val _uiState = MutableStateFlow(UiState())
    val uiState: StateFlow<UiState> = _uiState.asStateFlow()

    init {
        viewModelScope.launch {
            val initialProfile = repository.ensureProfileExists()
            val todayLog = repository.getOrCreateTodayLog()

            _uiState.value = _uiState.value.copy(
                profile = initialProfile,
                currentLog = todayLog,
                tasks = repository.parseTasks(todayLog.tasksJson),
                suggestions = repository.parseSuggestions(todayLog.aiSuggestionsJson),
                isOnboardingActive = !initialProfile.isOnboardingCompleted
            )

            // Auto generate initial suggestions if empty
            if (todayLog.aiSuggestionsJson == "[]" || todayLog.aiSuggestionsJson.isBlank()) {
                refreshAiPlan()
            }
        }

        // Observe User Profile
        viewModelScope.launch {
            repository.getUserProfile().collect { profile ->
                if (profile != null) {
                    _uiState.value = _uiState.value.copy(profile = profile)
                }
            }
        }

        // Observe All Logs
        viewModelScope.launch {
            repository.getAllLogs().collect { logs ->
                _uiState.value = _uiState.value.copy(allLogs = logs)
            }
        }

        // Observe Chat
        viewModelScope.launch {
            repository.getChatMessages().collect { msgs ->
                _uiState.value = _uiState.value.copy(chatMessages = msgs)
            }
        }
    }

    fun setNavTab(tab: AppNavTab) {
        _uiState.value = _uiState.value.copy(currentTab = tab)
    }

    fun openOnboardingFlow() {
        _uiState.value = _uiState.value.copy(isOnboardingActive = true)
    }

    fun completeOnboarding(
        name: String,
        email: String,
        persona: Persona,
        roleDetails: String,
        workStyle: String,
        challenge: String,
        goals: String,
        selectedHabits: List<String>
    ) {
        val currentProfile = _uiState.value.profile ?: return
        viewModelScope.launch {
            val updatedProfile = currentProfile.copy(
                name = name.ifBlank { "DayPulse Explorer" },
                email = email.ifBlank { "rajkesir74@gmail.com" },
                persona = persona.title,
                roleDetails = roleDetails,
                workStyle = workStyle,
                primaryChallenge = challenge,
                focusPriorities = goals.ifBlank { persona.focusAreas.joinToString(", ") },
                isOnboardingCompleted = true
            )
            repository.saveProfile(updatedProfile)

            // Populate today's habits from onboarding selection
            if (selectedHabits.isNotEmpty()) {
                val newTasks = selectedHabits.map {
                    TaskItem(
                        id = UUID.randomUUID().toString(),
                        title = it,
                        isCompleted = false,
                        category = "Routine"
                    )
                }
                _uiState.value = _uiState.value.copy(tasks = newTasks)
                val currentLog = _uiState.value.currentLog
                if (currentLog != null) {
                    val updatedLog = currentLog.copy(tasksJson = repository.serializeTasks(newTasks))
                    repository.saveLog(updatedLog)
                }
            }

            _uiState.value = _uiState.value.copy(
                profile = updatedProfile,
                isOnboardingActive = false
            )

            // Refresh AI recommendations with the newly calibrated profile
            refreshAiPlan()
            showSnackbar("Welcome to DayPulse, ${updatedProfile.name}! Your AI is now calibrated.")
        }
    }

    fun requestQuickAdvice(type: AdviceType) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isGeneratingQuickAdvice = true)
            try {
                val advice = repository.requestQuickAdvice(type)
                _uiState.value = _uiState.value.copy(
                    isGeneratingQuickAdvice = false,
                    latestCoachingTip = advice
                )
                showSnackbar("${type.title} generated by PulseBot!")
            } catch (e: Exception) {
                _uiState.value = _uiState.value.copy(isGeneratingQuickAdvice = false)
                showSnackbar("Could not generate advice: ${e.message}")
            }
        }
    }

    fun updateMood(mood: Mood) {
        val current = _uiState.value.currentLog ?: return
        val updated = current.copy(mood = mood.name)
        persistCurrentLog(updated)
    }

    fun toggleMoodTag(tag: String) {
        val current = _uiState.value.currentLog ?: return
        val currentTags = current.moodTags.split(",").map { it.trim() }.filter { it.isNotEmpty() }.toMutableList()
        if (currentTags.contains(tag)) {
            currentTags.remove(tag)
        } else {
            currentTags.add(tag)
        }
        val updated = current.copy(moodTags = currentTags.joinToString(","))
        persistCurrentLog(updated)
    }

    fun updateEnergyLevel(level: Int) {
        val current = _uiState.value.currentLog ?: return
        val updated = current.copy(energyLevel = level.coerceIn(1, 10))
        persistCurrentLog(updated)
    }

    fun updateFocusIntention(text: String) {
        val current = _uiState.value.currentLog ?: return
        val updated = current.copy(focusIntention = text)
        persistCurrentLog(updated)
    }

    fun updateGratitude(text: String) {
        val current = _uiState.value.currentLog ?: return
        val updated = current.copy(gratitude = text)
        persistCurrentLog(updated)
    }

    fun updateEveningReflection(text: String) {
        val current = _uiState.value.currentLog ?: return
        val updated = current.copy(eveningReflection = text)
        persistCurrentLog(updated)
    }

    fun toggleTask(taskId: String) {
        val currentTasks = _uiState.value.tasks.toMutableList()
        val index = currentTasks.indexOfFirst { it.id == taskId }
        if (index != -1) {
            val item = currentTasks[index]
            currentTasks[index] = item.copy(isCompleted = !item.isCompleted)
            _uiState.value = _uiState.value.copy(tasks = currentTasks)

            val currentLog = _uiState.value.currentLog ?: return
            val updated = currentLog.copy(tasksJson = repository.serializeTasks(currentTasks))
            persistCurrentLog(updated)
        }
    }

    fun addTask(title: String, category: String = "Routine") {
        if (title.isBlank()) return
        val currentTasks = _uiState.value.tasks.toMutableList()
        val newTask = TaskItem(
            id = UUID.randomUUID().toString(),
            title = title.trim(),
            isCompleted = false,
            category = category
        )
        currentTasks.add(newTask)
        _uiState.value = _uiState.value.copy(tasks = currentTasks)

        val currentLog = _uiState.value.currentLog ?: return
        val updated = currentLog.copy(tasksJson = repository.serializeTasks(currentTasks))
        persistCurrentLog(updated)
    }

    fun deleteTask(taskId: String) {
        val currentTasks = _uiState.value.tasks.filterNot { it.id == taskId }
        _uiState.value = _uiState.value.copy(tasks = currentTasks)

        val currentLog = _uiState.value.currentLog ?: return
        val updated = currentLog.copy(tasksJson = repository.serializeTasks(currentTasks))
        persistCurrentLog(updated)
    }

    fun adoptAiSuggestion(suggestion: AiSuggestionItem) {
        addTask(title = suggestion.title, category = suggestion.category)

        val currentSuggestions = _uiState.value.suggestions.map {
            if (it.id == suggestion.id) it.copy(isAdopted = true) else it
        }
        _uiState.value = _uiState.value.copy(suggestions = currentSuggestions)

        val currentLog = _uiState.value.currentLog ?: return
        val updated = currentLog.copy(aiSuggestionsJson = repository.serializeSuggestions(currentSuggestions))
        persistCurrentLog(updated)
        showSnackbar("Added \"${suggestion.title}\" to today's tasks!")
    }

    fun refreshAiPlan() {
        val log = _uiState.value.currentLog ?: return
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoadingAiPlan = true)
            try {
                val suggestions = repository.generateAndSaveAiPlan(log.date)
                _uiState.value = _uiState.value.copy(
                    suggestions = suggestions,
                    isLoadingAiPlan = false
                )
                showSnackbar("Smart AI suggestions updated for your role!")
            } catch (e: Exception) {
                _uiState.value = _uiState.value.copy(isLoadingAiPlan = false)
                showSnackbar("Using personalized routine suggestions.")
            }
        }
    }

    fun sendChatMessage(message: String) {
        if (message.isBlank()) return
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isChatReplying = true)
            try {
                repository.sendChatMessage(message.trim())
            } catch (e: Exception) {
                showSnackbar("Could not send message: ${e.message}")
            } finally {
                _uiState.value = _uiState.value.copy(isChatReplying = false)
            }
        }
    }

    fun clearChat() {
        viewModelScope.launch {
            repository.clearChat()
            showSnackbar("Chat conversation cleared.")
        }
    }

    fun updatePersona(newPersona: Persona) {
        val currentProfile = _uiState.value.profile ?: return
        viewModelScope.launch {
            val updatedProfile = currentProfile.copy(persona = newPersona.title)
            repository.saveProfile(updatedProfile)
            _uiState.value = _uiState.value.copy(profile = updatedProfile)
            refreshAiPlan()
            showSnackbar("Switched persona to ${newPersona.title}!")
        }
    }

    fun updateFullProfile(
        name: String,
        email: String,
        persona: Persona,
        roleDetails: String,
        workStyle: String,
        challenge: String,
        priorities: String,
        reminderHour: Int,
        reminderMinute: Int,
        reminderEnabled: Boolean,
        morningDigestEnabled: Boolean
    ) {
        val currentProfile = _uiState.value.profile ?: return
        viewModelScope.launch {
            val updated = currentProfile.copy(
                name = name,
                email = email,
                persona = persona.title,
                roleDetails = roleDetails,
                workStyle = workStyle,
                primaryChallenge = challenge,
                focusPriorities = priorities,
                reminderHour = reminderHour,
                reminderMinute = reminderMinute,
                reminderEnabled = reminderEnabled,
                morningDigestEnabled = morningDigestEnabled
            )
            repository.saveProfile(updated)
            _uiState.value = _uiState.value.copy(profile = updated)
            refreshAiPlan()
            showSnackbar("Profile updated! AI calibrated for ${persona.title}.")
        }
    }

    fun prepareEmailPreview() {
        val profile = _uiState.value.profile ?: return
        val log = _uiState.value.currentLog ?: return
        val pair = EmailReminderHelper.generateDailySummaryEmail(
            profile = profile,
            log = log,
            tasks = _uiState.value.tasks,
            suggestions = _uiState.value.suggestions
        )
        _uiState.value = _uiState.value.copy(emailPreviewPair = pair)
    }

    fun dismissEmailPreview() {
        _uiState.value = _uiState.value.copy(emailPreviewPair = null)
    }

    fun sendEmailDigest(context: Context) {
        val profile = _uiState.value.profile ?: return
        val log = _uiState.value.currentLog ?: return
        val pair = _uiState.value.emailPreviewPair ?: EmailReminderHelper.generateDailySummaryEmail(
            profile = profile,
            log = log,
            tasks = _uiState.value.tasks,
            suggestions = _uiState.value.suggestions
        )
        EmailReminderHelper.openEmailClient(
            context = context,
            toEmail = profile.email,
            subject = pair.first,
            body = pair.second
        )
        dismissEmailPreview()
    }

    fun triggerTestNotification(context: Context) {
        val profile = _uiState.value.profile
        val persona = profile?.persona ?: "DayPulse Explorer"
        NotificationHelper.showReminderNotification(
            context = context,
            title = "DayPulse Daily Reminder 🔔",
            message = "Time for your daily pulse! Check in with your $persona habits and log your wins today."
        )
        showSnackbar("Test reminder notification sent!")
    }

    fun clearSnackbar() {
        _uiState.value = _uiState.value.copy(snackbarMessage = null)
    }

    private fun showSnackbar(msg: String) {
        _uiState.value = _uiState.value.copy(snackbarMessage = msg)
    }

    private fun persistCurrentLog(log: DailyLogEntity) {
        _uiState.value = _uiState.value.copy(currentLog = log)
        viewModelScope.launch {
            repository.saveLog(log)
        }
    }
}
