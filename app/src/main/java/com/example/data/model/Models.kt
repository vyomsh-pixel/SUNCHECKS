package com.example.data.model

enum class Mood(val displayName: String, val emoji: String, val level: Int) {
    ECSTATIC("Ecstatic", "🤩", 5),
    GOOD("Good", "😊", 4),
    NEUTRAL("Neutral", "😐", 3),
    LOW("Low Energy", "😔", 2),
    STRESSED("Overwhelmed", "😫", 1);

    companion object {
        fun fromString(name: String?): Mood {
            return entries.find { it.name.equals(name, ignoreCase = true) } ?: GOOD
        }
    }
}

enum class Persona(
    val title: String,
    val subtitle: String,
    val iconEmoji: String,
    val defaultHabits: List<String>,
    val focusAreas: List<String>
) {
    STUDENT(
        title = "Student",
        subtitle = "Academics, exams, homework & personal growth",
        iconEmoji = "🎓",
        defaultHabits = listOf(
            "Review lecture notes (30m)",
            "Pomodoro deep study block (50m)",
            "Stay hydrated (2 Liters)",
            "Active recall / Flashcards",
            "Prepare bag & schedule for tomorrow"
        ),
        focusAreas = listOf("Exam Prep", "Assignment Deadlines", "Memory Retention", "Study-Life Balance")
    ),
    WORKING_PROFESSIONAL(
        title = "Working Professional",
        subtitle = "Career milestones, focus blocks & work-life balance",
        iconEmoji = "💼",
        defaultHabits = listOf(
            "Identify Top 3 Priority Tasks",
            "Inbox Zero / triage emails",
            "Deep work block without notifications (90m)",
            "Posture check & 10m walk",
            "Evening shutdown ritual"
        ),
        focusAreas = listOf("Sprint Deliverables", "Meeting Fatigue", "Career Growth", "Deep Work")
    ),
    FREELANCER(
        title = "Freelancer & Creator",
        subtitle = "Client deliverables, self-discipline & portfolio output",
        iconEmoji = "🚀",
        defaultHabits = listOf(
            "Complete core client deliverable",
            "Track billable hours & invoices",
            "Client outreach / marketing (30m)",
            "Creative brainstorming session",
            "Step away from the screen"
        ),
        focusAreas = listOf("Pipeline Management", "High-Focus Craft", "Work Boundaries", "Skill Mastery")
    ),
    CREATIVE(
        title = "Creative & Artist",
        subtitle = "Inspiration, expression, projects & mental clarity",
        iconEmoji = "🎨",
        defaultHabits = listOf(
            "Creative morning free-write or sketch",
            "Work on main creative project (1h)",
            "Collect inspiration / reference moodboard",
            "Mindful walk in nature",
            "Review creative progress"
        ),
        focusAreas = listOf("Creative Flow", "Resistance Overcoming", "Idea Generation", "Project Finishing")
    ),
    HEALTH_ENTHUSIAST(
        title = "Health & Fitness",
        subtitle = "Nutrition, workouts, recovery & physical vitality",
        iconEmoji = "⚡",
        defaultHabits = listOf(
            "Morning mobility / stretching (15m)",
            "Strength or cardio workout",
            "Hit daily protein & water target",
            "8,000+ daily steps",
            "Sleep 7-8 hours uninterrupted"
        ),
        focusAreas = listOf("Strength Progression", "Nutritional Tracking", "Rest & Recovery", "Mental Grit")
    ),
    ENTREPRENEUR(
        title = "Founder & Entrepreneur",
        subtitle = "Strategy, team execution, product velocity & resilience",
        iconEmoji = "💡",
        defaultHabits = listOf(
            "Strategic priorities check (First 30m)",
            "Key metric / KPI review",
            "Customer or investor conversation",
            "Solve #1 company bottleneck",
            "High-energy team sync / check-in"
        ),
        focusAreas = listOf("Company Vision", "Rapid Execution", "Revenue & Growth", "Stress Mastery")
    );

    companion object {
        fun fromString(title: String?): Persona {
            return entries.find { it.title.equals(title, ignoreCase = true) || it.name.equals(title, ignoreCase = true) }
                ?: WORKING_PROFESSIONAL
        }
    }
}

data class TaskItem(
    val id: String,
    val title: String,
    val isCompleted: Boolean = false,
    val category: String = "Routine"
)

data class AiSuggestionItem(
    val id: String,
    val title: String,
    val description: String,
    val timeOfDay: String, // "Morning", "Afternoon", "Evening"
    val category: String, // "Productivity", "Wellness", "Focus", "Recovery"
    val isAdopted: Boolean = false
)
