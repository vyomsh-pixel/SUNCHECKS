package com.example.ui.screens

import android.content.Context
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AutoAwesome
import androidx.compose.material.icons.filled.Bookmark
import androidx.compose.material.icons.filled.Edit
import androidx.compose.material.icons.filled.Email
import androidx.compose.material.icons.filled.Favorite
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.local.DailyLogEntity
import com.example.data.local.UserProfileEntity
import com.example.data.model.Mood
import com.example.data.model.TaskItem
import com.example.ui.components.EnergyLevelSection
import com.example.ui.components.MoodSelectorSection
import com.example.ui.components.PromptCard
import com.example.ui.components.StreakHeroCard
import com.example.ui.components.TaskChecklistSection
import com.example.ui.theme.DayPulseTheme
import com.example.ui.theme.extendedColors
import com.example.ui.viewmodel.AppNavTab
import com.example.ui.viewmodel.UiState
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

@Composable
fun DailyLogScreen(
    uiState: UiState,
    onNavigateToTab: (AppNavTab) -> Unit,
    onEmailDigestClick: () -> Unit,
    onUpdateFocusIntention: (String) -> Unit,
    onMoodSelected: (Mood) -> Unit,
    onToggleMoodTag: (String) -> Unit,
    onEnergyChange: (Int) -> Unit,
    onToggleTask: (String) -> Unit,
    onAddTask: (String) -> Unit,
    onDeleteTask: (String) -> Unit,
    onUpdateGratitude: (String) -> Unit,
    onUpdateEveningReflection: (String) -> Unit,
    onDismissEmailPreview: () -> Unit,
    onSendEmailDigest: (Context) -> Unit,
    modifier: Modifier = Modifier
) {
    val scrollState = rememberScrollState()
    val context = LocalContext.current
    val log = uiState.currentLog
    val profile = uiState.profile
    val extended = MaterialTheme.extendedColors

    val todayFormatted = remember {
        SimpleDateFormat("EEEE, MMMM d, yyyy", Locale.getDefault()).format(Date())
    }

    Column(
        modifier = modifier
            .fillMaxSize()
            .verticalScroll(scrollState)
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        // Top Date Strip
        Row(
            modifier = Modifier.fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Box(
                    modifier = Modifier
                        .size(8.dp)
                        .clip(CircleShape)
                        .background(extended.success)
                )
                Spacer(modifier = Modifier.width(8.dp))
                Text(
                    text = todayFormatted.uppercase(),
                    style = MaterialTheme.typography.labelSmall,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    letterSpacing = 0.8.sp
                )
            }

            Surface(
                shape = RoundedCornerShape(8.dp),
                color = MaterialTheme.colorScheme.primaryContainer,
                modifier = Modifier.clickable { onNavigateToTab(AppNavTab.AI_SUGGESTIONS) }
            ) {
                Row(
                    modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Icon(
                        imageVector = Icons.Default.AutoAwesome,
                        contentDescription = null,
                        tint = MaterialTheme.colorScheme.primary,
                        modifier = Modifier.size(12.dp)
                    )
                    Spacer(modifier = Modifier.width(4.dp))
                    Text(
                        text = "AI Routine (${uiState.suggestions.size})",
                        style = MaterialTheme.typography.labelSmall,
                        fontWeight = FontWeight.Bold,
                        color = MaterialTheme.colorScheme.onPrimaryContainer
                    )
                }
            }
        }

        // Hero Streak & Quick Email Button
        StreakHeroCard(
            currentStreak = profile?.currentStreak ?: 1,
            bestStreak = profile?.bestStreak ?: 1,
            personaTitle = profile?.persona ?: "Working Professional",
            onEmailDigestClick = onEmailDigestClick
        )

        // Today's Focus Intention
        PromptCard(
            title = "Daily North Star • Top Intention",
            subtitle = "What single outcome defines victory for today?",
            icon = Icons.Default.Bookmark,
            iconTint = MaterialTheme.colorScheme.primary,
            value = log?.focusIntention ?: "",
            onValueChange = onUpdateFocusIntention,
            placeholder = "e.g. Master Chapter 4 / Ship feature release / 90m deep block...",
            testTag = "focus_intention_input"
        )

        // Mood Tracker Section
        MoodSelectorSection(
            selectedMood = Mood.fromString(log?.mood),
            onMoodSelected = onMoodSelected,
            currentTags = log?.moodTags ?: "",
            onTagToggled = onToggleMoodTag
        )

        // Energy Meter Section
        EnergyLevelSection(
            energyLevel = log?.energyLevel ?: 7,
            onEnergyChange = onEnergyChange
        )

        // Daily Habits & Tasks Checklist
        TaskChecklistSection(
            tasks = uiState.tasks,
            onToggleTask = onToggleTask,
            onAddTask = onAddTask,
            onDeleteTask = onDeleteTask
        )

        // Gratitude & Three Good Things
        PromptCard(
            title = "Gratitude & Energy Multipliers",
            subtitle = "What went surprisingly well or brought you peace today?",
            icon = Icons.Default.Favorite,
            iconTint = extended.warning,
            value = log?.gratitude ?: "",
            onValueChange = onUpdateGratitude,
            placeholder = "1. Energizing workout, 2. Breakthrough on code, 3. Great conversation...",
            testTag = "gratitude_input",
            minLines = 2
        )

        // Evening Reflections
        PromptCard(
            title = "Evening Reflection & Lessons",
            subtitle = "Close the mental loop. What will you do differently tomorrow?",
            icon = Icons.Default.Edit,
            iconTint = extended.info,
            value = log?.eveningReflection ?: "",
            onValueChange = onUpdateEveningReflection,
            placeholder = "Reflections on progress, wins, and tomorrow's adjustments...",
            testTag = "evening_reflection_input",
            minLines = 3
        )

        Spacer(modifier = Modifier.height(24.dp))
    }

    // Email Digest Preview Modal Dialog
    uiState.emailPreviewPair?.let { (subject, body) ->
        AlertDialog(
            onDismissRequest = onDismissEmailPreview,
            title = {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(
                        imageVector = Icons.Default.Email,
                        contentDescription = null,
                        tint = MaterialTheme.colorScheme.primary
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = "Email Reminder & Digest",
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold
                    )
                }
            },
            text = {
                Column {
                    Text(
                        text = "Recipient: ${profile?.email?.ifBlank { "Not configured" } ?: "Not configured"}",
                        style = MaterialTheme.typography.labelMedium,
                        fontWeight = FontWeight.SemiBold,
                        color = MaterialTheme.colorScheme.primary
                    )
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        text = subject,
                        style = MaterialTheme.typography.titleSmall,
                        fontWeight = FontWeight.Bold
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    Card(
                        shape = RoundedCornerShape(12.dp),
                        colors = CardDefaults.cardColors(
                            containerColor = MaterialTheme.colorScheme.surface
                        ),
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(200.dp)
                            .verticalScroll(rememberScrollState())
                    ) {
                        Text(
                            text = body,
                            style = MaterialTheme.typography.bodySmall,
                            modifier = Modifier.padding(12.dp)
                        )
                    }
                }
            },
            confirmButton = {
                Button(
                    onClick = { onSendEmailDigest(context) },
                    modifier = Modifier.testTag("confirm_send_email_button")
                ) {
                    Text("Open Email Client")
                }
            },
            dismissButton = {
                OutlinedButton(onClick = onDismissEmailPreview) {
                    Text("Cancel")
                }
            }
        )
    }
}

@Preview(showBackground = true)
@Composable
fun DailyLogScreenPreview() {
    DayPulseTheme {
        DailyLogScreen(
            uiState = UiState(
                profile = UserProfileEntity(name = "Vyom", persona = "Founder & Entrepreneur", currentStreak = 5, bestStreak = 12),
                currentLog = DailyLogEntity(date = "2026-10-07", energyLevel = 8, mood = "GOOD", focusIntention = "Ship the redesigned Calm Theme"),
                tasks = listOf(
                    TaskItem(id = "1", title = "Morning meditation & cold shower", isCompleted = true),
                    TaskItem(id = "2", title = "Deep work block: Architecture refactor", isCompleted = false)
                )
            ),
            onNavigateToTab = {},
            onEmailDigestClick = {},
            onUpdateFocusIntention = {},
            onMoodSelected = {},
            onToggleMoodTag = {},
            onEnergyChange = {},
            onToggleTask = {},
            onAddTask = {},
            onDeleteTask = {},
            onUpdateGratitude = {},
            onUpdateEveningReflection = {},
            onDismissEmailPreview = {},
            onSendEmailDigest = {}
        )
    }
}
