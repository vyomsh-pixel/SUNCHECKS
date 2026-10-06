package com.example.data.remote

import android.util.Log
import com.example.BuildConfig
import com.example.data.local.ChatMessageEntity
import com.example.data.local.DailyLogEntity
import com.example.data.local.UserProfileEntity
import com.example.data.model.AiSuggestionItem
import com.example.data.model.Mood
import com.example.data.model.Persona
import com.example.data.model.TaskItem
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.json.JSONArray
import org.json.JSONObject
import java.util.UUID

enum class AdviceType(val title: String, val icon: String) {
    PRODUCTIVITY_TIP("Productivity Tip", "⚡"),
    MOTIVATION_BOOST("Motivation Boost", "🔥"),
    ROLE_STRATEGY("Daily Strategy", "🎯"),
    EVENING_REFLECTION("Reflection Feedback", "✨")
}

class GeminiRepository {

    suspend fun generateDailyPlan(
        persona: Persona,
        mood: Mood,
        energyLevel: Int,
        focusIntention: String,
        goals: String,
        roleDetails: String = "",
        workStyle: String = "",
        challenge: String = ""
    ): List<AiSuggestionItem> = withContext(Dispatchers.IO) {
        val apiKey = BuildConfig.GEMINI_API_KEY
        val hasKey = apiKey.isNotBlank() && apiKey != "MY_GEMINI_API_KEY"

        if (hasKey) {
            try {
                val prompt = """
                    You are DayPulse AI, an elite productivity and wellness advisor.
                    Generate 4 distinct, highly tailored daily action suggestions for a user with these details:
                    - Role/Persona: ${persona.title} (${persona.subtitle})
                    - Specialization / Major: $roleDetails
                    - Work Style: $workStyle
                    - Primary Challenge: $challenge
                    - Current Mood: ${mood.displayName} (${mood.emoji})
                    - Energy Level: $energyLevel out of 10
                    - Today's Main Focus: ${if (focusIntention.isNotBlank()) focusIntention else "Balance & High-Leverage Output"}
                    - Personal Goals: $goals

                    Return ONLY a JSON array with exactly 4 objects. Each object must have these exact string fields:
                    - "title": short actionable action title (max 6 words)
                    - "description": punchy reason and instruction (1-2 sentences)
                    - "timeOfDay": "Morning", "Afternoon", or "Evening"
                    - "category": "Focus", "Wellness", "Productivity", or "Recovery"

                    Do NOT wrap in markdown formatting backticks if possible, just the raw JSON array.
                """.trimIndent()

                val request = GeminiRequest(
                    contents = listOf(
                        GeminiContent(parts = listOf(GeminiPart(text = prompt)))
                    )
                )

                val response = GeminiClient.apiService.generateContent(apiKey, request)
                val rawText = response.candidates?.firstOrNull()?.content?.parts?.firstOrNull()?.text

                if (!rawText.isNullOrBlank()) {
                    val parsed = parseSuggestionsFromJson(rawText)
                    if (parsed.isNotEmpty()) {
                        return@withContext parsed
                    }
                }
            } catch (e: Exception) {
                Log.e("GeminiRepository", "Error fetching AI plan from Gemini: ${e.message}", e)
            }
        }

        // Fallback to role-tailored intelligent suggestions
        return@withContext getFallbackSuggestions(persona, mood, energyLevel)
    }

    suspend fun getAssistantResponse(
        userMessage: String,
        profile: UserProfileEntity,
        log: DailyLogEntity?,
        tasks: List<TaskItem>,
        recentHistory: List<ChatMessageEntity>
    ): String = withContext(Dispatchers.IO) {
        val persona = Persona.fromString(profile.persona)
        val apiKey = BuildConfig.GEMINI_API_KEY
        val hasKey = apiKey.isNotBlank() && apiKey != "MY_GEMINI_API_KEY"

        val completedTasks = tasks.filter { it.isCompleted }.map { it.title }
        val pendingTasks = tasks.filterNot { it.isCompleted }.map { it.title }

        val contextSummary = buildString {
            append("User Profile: ${profile.name}, Role: ${persona.title} (${profile.roleDetails}), Work Style: ${profile.workStyle}, Core Bottleneck: ${profile.primaryChallenge}, Streak: ${profile.currentStreak} days.")
            if (log != null) {
                append(" Today's Mood: ${log.mood} (Tags: ${log.moodTags}), Energy Level: ${log.energyLevel}/10.")
                if (log.focusIntention.isNotBlank()) append(" Core Intention: \"${log.focusIntention}\".")
                if (completedTasks.isNotEmpty()) append(" Completed Tasks: ${completedTasks.joinToString(", ")}.")
                if (pendingTasks.isNotEmpty()) append(" Pending Tasks: ${pendingTasks.joinToString(", ")}.")
                if (log.gratitude.isNotBlank()) append(" Gratitude: \"${log.gratitude}\".")
                if (log.eveningReflection.isNotBlank()) append(" Evening Reflection: \"${log.eveningReflection}\".")
            } else {
                append(" No log recorded yet today.")
            }
        }

        if (hasKey) {
            try {
                val systemPrompt = """
                    You are PulseBot, the elite life, routine, and productivity companion inside DayPulse.
                    You possess deep expertise in performance psychology, habit building, and compassionate coaching.
                    Current User Context:
                    $contextSummary

                    Instructions:
                    - Address the user's question directly with actionable, concise, and empathetic advice.
                    - Specifically connect your answer to their role as a ${persona.title} and their current state (energy: ${log?.energyLevel ?: 7}/10, mood: ${log?.mood ?: "GOOD"}, pending tasks).
                    - If they are stressed or have low energy, provide gentle pacing and micro-steps. If their energy is high, push for deep-work focus.
                    - Format with clean bullet points and bold headers when helpful.
                """.trimIndent()

                val contentsList = mutableListOf<GeminiContent>()

                // Add recent history context (last 4 messages)
                recentHistory.takeLast(4).forEach { msg ->
                    contentsList.add(
                        GeminiContent(
                            parts = listOf(GeminiPart(text = msg.content)),
                            role = if (msg.sender == "user") "user" else "model"
                        )
                    )
                }

                // Add latest prompt
                contentsList.add(
                    GeminiContent(
                        parts = listOf(GeminiPart(text = userMessage)),
                        role = "user"
                    )
                )

                val request = GeminiRequest(
                    contents = contentsList,
                    systemInstruction = GeminiContent(
                        parts = listOf(GeminiPart(text = systemPrompt))
                    )
                )

                val response = GeminiClient.apiService.generateContent(apiKey, request)
                val reply = response.candidates?.firstOrNull()?.content?.parts?.firstOrNull()?.text
                if (!reply.isNullOrBlank()) {
                    return@withContext reply.trim()
                }
            } catch (e: Exception) {
                Log.e("GeminiRepository", "Error calling Gemini chat: ${e.message}", e)
            }
        }

        // Contextual fallback response
        return@withContext generateFallbackAssistantReply(userMessage, persona, profile, log, pendingTasks)
    }

    suspend fun generateQuickAdvice(
        type: AdviceType,
        profile: UserProfileEntity,
        log: DailyLogEntity?,
        tasks: List<TaskItem>
    ): String = withContext(Dispatchers.IO) {
        val persona = Persona.fromString(profile.persona)
        val apiKey = BuildConfig.GEMINI_API_KEY
        val hasKey = apiKey.isNotBlank() && apiKey != "MY_GEMINI_API_KEY"

        val prompt = when (type) {
            AdviceType.PRODUCTIVITY_TIP -> "Provide 1 high-leverage, unconventional productivity tip tailored to a ${persona.title} (${profile.roleDetails}) with an energy level of ${log?.energyLevel ?: 7}/10 facing the challenge of '${profile.primaryChallenge}'."
            AdviceType.MOTIVATION_BOOST -> "Provide an uplifting, motivational message for a ${persona.title} currently feeling ${log?.mood ?: "focused"} on a ${profile.currentStreak}-day consistency streak. Remind them why their daily efforts matter."
            AdviceType.ROLE_STRATEGY -> "Give a 3-step action game plan for today based on their #1 intention: '${log?.focusIntention?.ifBlank { "High-Leverage Execution" }}' suited for their work style (${profile.workStyle})."
            AdviceType.EVENING_REFLECTION -> "Provide a brief evening wind-down reflection and praise based on today's inputs (Gratitude: '${log?.gratitude?.ifBlank { "Consistent Effort" }}')."
        }

        if (hasKey) {
            try {
                val request = GeminiRequest(
                    contents = listOf(
                        GeminiContent(parts = listOf(GeminiPart(text = prompt)))
                    ),
                    systemInstruction = GeminiContent(
                        parts = listOf(GeminiPart(text = "You are PulseBot in DayPulse. Deliver direct, punchy, uplifting advice (under 120 words)."))
                    )
                )
                val response = GeminiClient.apiService.generateContent(apiKey, request)
                val reply = response.candidates?.firstOrNull()?.content?.parts?.firstOrNull()?.text
                if (!reply.isNullOrBlank()) {
                    return@withContext reply.trim()
                }
            } catch (e: Exception) {
                Log.e("GeminiRepository", "Error generating quick advice: ${e.message}")
            }
        }

        return@withContext generateFallbackQuickAdvice(type, persona, profile, log)
    }

    private fun parseSuggestionsFromJson(rawText: String): List<AiSuggestionItem> {
        val list = mutableListOf<AiSuggestionItem>()
        try {
            var cleanJson = rawText.trim()
            if (cleanJson.startsWith("```json")) {
                cleanJson = cleanJson.removePrefix("```json").trim()
            }
            if (cleanJson.startsWith("```")) {
                cleanJson = cleanJson.removePrefix("```").trim()
            }
            if (cleanJson.endsWith("```")) {
                cleanJson = cleanJson.removeSuffix("```").trim()
            }

            val array = JSONArray(cleanJson)
            for (i in 0 until array.length()) {
                val obj = array.getJSONObject(i)
                list.add(
                    AiSuggestionItem(
                        id = UUID.randomUUID().toString(),
                        title = obj.optString("title", "Daily Action"),
                        description = obj.optString("description", "Actionable routine step"),
                        timeOfDay = obj.optString("timeOfDay", "Morning"),
                        category = obj.optString("category", "Productivity")
                    )
                )
            }
        } catch (e: Exception) {
            Log.e("GeminiRepository", "Error parsing json suggestions: ${e.message}")
        }
        return list
    }

    private fun getFallbackSuggestions(persona: Persona, mood: Mood, energy: Int): List<AiSuggestionItem> {
        return when (persona) {
            Persona.STUDENT -> listOf(
                AiSuggestionItem(
                    id = UUID.randomUUID().toString(),
                    title = "25m Focused Pomodoro Sprint",
                    description = "Pick your highest-priority study chapter. Turn off all phone notifications and conquer one topic.",
                    timeOfDay = "Morning",
                    category = "Focus"
                ),
                AiSuggestionItem(
                    id = UUID.randomUUID().toString(),
                    title = "Active Recall Session",
                    description = "Close notes and write down key concepts from memory, then cross-check discrepancies.",
                    timeOfDay = "Afternoon",
                    category = "Productivity"
                ),
                AiSuggestionItem(
                    id = UUID.randomUUID().toString(),
                    title = "Campus / Fresh Air Break",
                    description = "Step outside for 15 minutes without screens to reset cognitive fatigue.",
                    timeOfDay = "Afternoon",
                    category = "Wellness"
                ),
                AiSuggestionItem(
                    id = UUID.randomUUID().toString(),
                    title = "Desk Clear & Tomorrow's Outline",
                    description = "Tidy study space and list the exact 2 chapters to tackle first tomorrow morning.",
                    timeOfDay = "Evening",
                    category = "Recovery"
                )
            )
            Persona.WORKING_PROFESSIONAL -> listOf(
                AiSuggestionItem(
                    id = UUID.randomUUID().toString(),
                    title = "Eat the Frog: Top Deliverable",
                    description = "Dedicate the first 90 minutes solely to your most critical project before checking chat or emails.",
                    timeOfDay = "Morning",
                    category = "Focus"
                ),
                AiSuggestionItem(
                    id = UUID.randomUUID().toString(),
                    title = "Inbox Zero Sprint (30m)",
                    description = "Batch process pending emails and messages in a single timed window to avoid context switching.",
                    timeOfDay = "Afternoon",
                    category = "Productivity"
                ),
                AiSuggestionItem(
                    id = UUID.randomUUID().toString(),
                    title = "Midday Hydration & Posture Reset",
                    description = "Drink 500ml water, stretch your neck and shoulders, and take a quick 10m walk.",
                    timeOfDay = "Afternoon",
                    category = "Wellness"
                ),
                AiSuggestionItem(
                    id = UUID.randomUUID().toString(),
                    title = "Hard Workday Shutdown Ritual",
                    description = "Log today's accomplishments, close laptop tabs, and transition mind to evening relaxation.",
                    timeOfDay = "Evening",
                    category = "Recovery"
                )
            )
            Persona.FREELANCER -> listOf(
                AiSuggestionItem(
                    id = UUID.randomUUID().toString(),
                    title = "High-Value Client Milestone",
                    description = "Focus on the primary billable task while your creative stamina is highest.",
                    timeOfDay = "Morning",
                    category = "Focus"
                ),
                AiSuggestionItem(
                    id = UUID.randomUUID().toString(),
                    title = "Pipeline & Invoice Check",
                    description = "Follow up with warm leads or verify client payment status.",
                    timeOfDay = "Afternoon",
                    category = "Productivity"
                ),
                AiSuggestionItem(
                    id = UUID.randomUUID().toString(),
                    title = "Creative Input Recharge",
                    description = "Read industry news or listen to a podcast episode outside your desk.",
                    timeOfDay = "Afternoon",
                    category = "Wellness"
                ),
                AiSuggestionItem(
                    id = UUID.randomUUID().toString(),
                    title = "Daily Billing Log & Boundary Set",
                    description = "Record today's output and switch client chats to Do Not Disturb.",
                    timeOfDay = "Evening",
                    category = "Recovery"
                )
            )
            Persona.CREATIVE -> listOf(
                AiSuggestionItem(
                    id = UUID.randomUUID().toString(),
                    title = "Morning Free-Flow Sketch/Draft",
                    description = "Create for 20 minutes with zero judgment or expectations of perfection.",
                    timeOfDay = "Morning",
                    category = "Focus"
                ),
                AiSuggestionItem(
                    id = UUID.randomUUID().toString(),
                    title = "Deep Creative Project Block",
                    description = "Work on the main piece of art, music, or writing with inspiring background sounds.",
                    timeOfDay = "Afternoon",
                    category = "Productivity"
                ),
                AiSuggestionItem(
                    id = UUID.randomUUID().toString(),
                    title = "Sensory Reset Walk",
                    description = "Step outside with eyes tuned to colors, textures, and architecture.",
                    timeOfDay = "Afternoon",
                    category = "Wellness"
                ),
                AiSuggestionItem(
                    id = UUID.randomUUID().toString(),
                    title = "Idea Journaling & Reflection",
                    description = "Jot down emerging creative concepts before going to sleep.",
                    timeOfDay = "Evening",
                    category = "Recovery"
                )
            )
            Persona.HEALTH_ENTHUSIAST -> listOf(
                AiSuggestionItem(
                    id = UUID.randomUUID().toString(),
                    title = "Morning Sunlight & Hydration",
                    description = "Drink 500ml water with electrolytes and get 10 minutes of direct morning sunlight.",
                    timeOfDay = "Morning",
                    category = "Wellness"
                ),
                AiSuggestionItem(
                    id = UUID.randomUUID().toString(),
                    title = "Dedicated Training Session",
                    description = "Execute your planned strength or conditioning workout with progressive effort.",
                    timeOfDay = "Morning",
                    category = "Focus"
                ),
                AiSuggestionItem(
                    id = UUID.randomUUID().toString(),
                    title = "Nutrient & Protein Fueling",
                    description = "Ensure complete meal with whole foods to optimize muscle recovery and afternoon energy.",
                    timeOfDay = "Afternoon",
                    category = "Productivity"
                ),
                AiSuggestionItem(
                    id = UUID.randomUUID().toString(),
                    title = "Foam Rolling & Sleep Wind-Down",
                    description = "10 minutes of myofascial release, dim screens, and cool bedroom for restorative sleep.",
                    timeOfDay = "Evening",
                    category = "Recovery"
                )
            )
            Persona.ENTREPRENEUR -> listOf(
                AiSuggestionItem(
                    id = UUID.randomUUID().toString(),
                    title = "Strategic Milestone Deep Dive",
                    description = "First 90 minutes dedicated exclusively to your highest ROI product or revenue lever.",
                    timeOfDay = "Morning",
                    category = "Focus"
                ),
                AiSuggestionItem(
                    id = UUID.randomUUID().toString(),
                    title = "Customer Feedback Review",
                    description = "Read 3 user reviews or conduct a discovery call to sharpen product direction.",
                    timeOfDay = "Afternoon",
                    category = "Productivity"
                ),
                AiSuggestionItem(
                    id = UUID.randomUUID().toString(),
                    title = "Physical State & Cardio Reset",
                    description = "20m brisk run or workout to clear mental overload and restore executive presence.",
                    timeOfDay = "Afternoon",
                    category = "Wellness"
                ),
                AiSuggestionItem(
                    id = UUID.randomUUID().toString(),
                    title = "Bottleneck Unblocker for Tomorrow",
                    description = "Identify the single biggest operational obstacle and schedule its removal.",
                    timeOfDay = "Evening",
                    category = "Recovery"
                )
            )
        }
    }

    private fun generateFallbackAssistantReply(
        prompt: String,
        persona: Persona,
        profile: UserProfileEntity,
        log: DailyLogEntity?,
        pendingTasks: List<String>
    ): String {
        val lower = prompt.lowercase()
        val energy = log?.energyLevel ?: 7
        val intention = log?.focusIntention?.ifBlank { "your main priority" } ?: "your main priority"

        return when {
            lower.contains("study") || lower.contains("exam") || lower.contains("homework") ->
                "Here is an optimized study plan tailored for you as a **${persona.title}** (${profile.roleDetails}):\n\n" +
                "1. **Energy Alignment**: Your energy is currently $energy/10. " +
                (if (energy >= 7) "Take advantage of this high stamina to tackle the most difficult theorem or chapter now." else "Since energy is moderate, start with practice quizzes or flashcard review.") + "\n" +
                "2. **Use the 50/10 Rule**: 50 minutes of single-task immersion, then 10 minutes away from screens.\n" +
                "3. **Focus on: $intention**: Finish this core objective before opening secondary tasks."

            lower.contains("procrastinat") || lower.contains("overwhelm") || lower.contains("start") ->
                "Overcoming **${profile.primaryChallenge}** starts with shrinking the friction:\n\n" +
                "• **The 2-Minute Rule**: Commit to working on your top priority for just 2 minutes. You have full permission to stop after 2 minutes. 90% of the friction is simply starting.\n" +
                "• **Pending Tasks**: You have ${pendingTasks.size} tasks pending. Pick just ONE (e.g. '${pendingTasks.firstOrNull() ?: intention}') and close all other tabs.\n" +
                "• Take one deep breath and take action right now."

            lower.contains("burnout") || lower.contains("tired") || lower.contains("stress") ->
                "I hear you, ${profile.name}. As a ${persona.title}, you carry significant responsibility, but rest is productive:\n\n" +
                "• **Protect your evening**: Establish a non-negotiable shutdown ritual tonight.\n" +
                "• **Physical Basics**: Drink 500ml of water right now and step away from the screen for 5 minutes.\n" +
                "• You're currently on a **${profile.currentStreak}-day streak**—remember that sustainable pace beats sporadic exhaustion every time."

            lower.contains("routine") || lower.contains("plan") || lower.contains("schedule") ->
                "For a **${persona.title}** with a **${profile.workStyle}** rhythm, here is your playbook:\n\n" +
                "1. **Peak Block**: Protect 90 minutes when your mental sharpness peaks.\n" +
                "2. **Task Execution**: Tackle '$intention' before checking emails or social feeds.\n" +
                "3. **Evening Synthesis**: Record your wins in DayPulse and send yourself the email digest!"

            else ->
                "As a **${persona.title}** navigating ${profile.roleDetails}, here is my advice for you today:\n\n" +
                "• **Current Intention**: Keep your sights locked on: *\"$intention\"*.\n" +
                "• **Energy State**: With an energy level of $energy/10, ${if (energy >= 7) "you're in a great state to execute aggressively." else "pace yourself and eliminate low-value busywork."}\n" +
                "• How can I specifically assist you with your pending priorities right now?"
        }
    }

    private fun generateFallbackQuickAdvice(
        type: AdviceType,
        persona: Persona,
        profile: UserProfileEntity,
        log: DailyLogEntity?
    ): String {
        val energy = log?.energyLevel ?: 7
        val intention = log?.focusIntention?.ifBlank { "Daily Breakthrough" } ?: "Daily Breakthrough"

        return when (type) {
            AdviceType.PRODUCTIVITY_TIP ->
                "⚡ **${persona.title} Productivity Hack**: Use 'Timeboxing'. Allocate an exact 45-minute calendar appointment specifically for \"$intention\". Turn off notifications. When the timer rings, step away. Single-tasking with $energy/10 energy yields 3x the output of distracted multitasking."

            AdviceType.MOTIVATION_BOOST ->
                "🔥 **You've got this, ${profile.name}!** You are on a **${profile.currentStreak}-day consistency streak**. Every time you check in and hold yourself accountable, you separate yourself from the crowd. Keep building the future you want—one focused hour at a time!"

            AdviceType.ROLE_STRATEGY ->
                "🎯 **Strategy for ${persona.title}s**: \n1. Knock out \"$intention\" first.\n2. Batch secondary chores into one 30m sprint.\n3. Complete your evening DayPulse log to close the mental loop and sleep soundly."

            AdviceType.EVENING_REFLECTION ->
                "✨ **Daily Reflection Feedback**: Celebrate whatever progress you made today. Consistency is an identity, not a single test or project. Clear your desk, breathe deeply, and rest well for tomorrow!"
        }
    }
}
