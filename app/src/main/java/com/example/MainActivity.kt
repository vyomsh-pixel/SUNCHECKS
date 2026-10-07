package com.example

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.BackHandler
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.activity.viewModels
import androidx.compose.animation.AnimatedContent
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.togetherWith
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AutoAwesome
import androidx.compose.material.icons.filled.BarChart
import androidx.compose.material.icons.filled.ChatBubble
import androidx.compose.material.icons.filled.DateRange
import androidx.compose.material.icons.filled.Notifications
import androidx.compose.material3.CenterAlignedTopAppBar
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.Scaffold
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.example.data.model.Persona
import com.example.ui.screens.AiSuggestionsScreen
import com.example.ui.screens.AnalyticsScreen
import com.example.ui.screens.AssistantBotScreen
import com.example.ui.screens.DailyLogScreen
import com.example.ui.screens.OnboardingScreen
import com.example.ui.screens.RemindersProfileScreen
import com.example.ui.theme.DayPulseTheme
import com.example.ui.viewmodel.AppNavTab
import com.example.ui.viewmodel.MainViewModel

class MainActivity : ComponentActivity() {

    private val viewModel: MainViewModel by viewModels()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        setContent {
            DayPulseTheme {
                MainRoot(viewModel = viewModel)
            }
        }
    }

    override fun onStop() {
        super.onStop()
        viewModel.flushPendingLogPersist()
    }
}

@Composable
fun MainRoot(viewModel: MainViewModel) {
    val uiState by viewModel.uiState.collectAsStateWithLifecycle()

    AnimatedContent(
        targetState = uiState.isOnboardingActive,
        transitionSpec = { fadeIn() togetherWith fadeOut() },
        label = "onboarding_switcher"
    ) { isOnboarding ->
        if (isOnboarding) {
            OnboardingScreen(
                onCompleteOnboarding = { name, email, persona, roleDetails, workStyle, challenge, goals, habits ->
                    viewModel.completeOnboarding(name, email, persona, roleDetails, workStyle, challenge, goals, habits)
                }
            )
        } else {
            DayPulseApp(viewModel = viewModel)
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DayPulseApp(viewModel: MainViewModel) {
    val uiState by viewModel.uiState.collectAsStateWithLifecycle()
    val snackbarHostState = remember { SnackbarHostState() }
    val persona = Persona.fromString(uiState.profile?.persona)

    // Back button handling: If not on Daily Log, return to Daily Log
    BackHandler(enabled = uiState.currentTab != AppNavTab.DAILY_LOG) {
        viewModel.setNavTab(AppNavTab.DAILY_LOG)
    }

    LaunchedEffect(uiState.snackbarMessage) {
        uiState.snackbarMessage?.let { msg ->
            snackbarHostState.showSnackbar(msg)
            viewModel.clearSnackbar()
        }
    }

    Scaffold(
        modifier = Modifier.fillMaxSize(),
        topBar = {
            CenterAlignedTopAppBar(
                title = {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Text(
                            text = "DayPulse",
                            style = MaterialTheme.typography.titleLarge,
                            fontWeight = FontWeight.ExtraBold,
                            color = MaterialTheme.colorScheme.primary
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Surface(
                            shape = RoundedCornerShape(8.dp),
                            color = MaterialTheme.colorScheme.primaryContainer
                        ) {
                            Text(
                                text = "${persona.iconEmoji} ${persona.title}",
                                style = MaterialTheme.typography.labelSmall,
                                fontWeight = FontWeight.SemiBold,
                                color = MaterialTheme.colorScheme.onPrimaryContainer,
                                modifier = Modifier.padding(horizontal = 8.dp, vertical = 3.dp)
                            )
                        }
                    }
                },
                colors = TopAppBarDefaults.centerAlignedTopAppBarColors(
                    containerColor = MaterialTheme.colorScheme.surface
                )
            )
        },
        bottomBar = {
            NavigationBar(
                containerColor = MaterialTheme.colorScheme.surface,
                tonalElevation = 3.dp
            ) {
                NavigationBarItem(
                    selected = uiState.currentTab == AppNavTab.DAILY_LOG,
                    onClick = { viewModel.setNavTab(AppNavTab.DAILY_LOG) },
                    icon = { Icon(Icons.Default.DateRange, contentDescription = "Daily Log") },
                    label = { Text("Log", style = MaterialTheme.typography.labelSmall) },
                    modifier = Modifier.testTag("nav_tab_daily_log")
                )
                NavigationBarItem(
                    selected = uiState.currentTab == AppNavTab.AI_SUGGESTIONS,
                    onClick = { viewModel.setNavTab(AppNavTab.AI_SUGGESTIONS) },
                    icon = { Icon(Icons.Default.AutoAwesome, contentDescription = "Smart AI Routine") },
                    label = { Text("AI Routine", style = MaterialTheme.typography.labelSmall) },
                    modifier = Modifier.testTag("nav_tab_ai_routine")
                )
                NavigationBarItem(
                    selected = uiState.currentTab == AppNavTab.ASSISTANT_BOT,
                    onClick = { viewModel.setNavTab(AppNavTab.ASSISTANT_BOT) },
                    icon = { Icon(Icons.Default.ChatBubble, contentDescription = "AI Advisor Bot") },
                    label = { Text("Advisor", style = MaterialTheme.typography.labelSmall) },
                    modifier = Modifier.testTag("nav_tab_assistant")
                )
                NavigationBarItem(
                    selected = uiState.currentTab == AppNavTab.ANALYTICS,
                    onClick = { viewModel.setNavTab(AppNavTab.ANALYTICS) },
                    icon = { Icon(Icons.Default.BarChart, contentDescription = "Trends") },
                    label = { Text("Trends", style = MaterialTheme.typography.labelSmall) },
                    modifier = Modifier.testTag("nav_tab_analytics")
                )
                NavigationBarItem(
                    selected = uiState.currentTab == AppNavTab.PROFILE_REMINDERS,
                    onClick = { viewModel.setNavTab(AppNavTab.PROFILE_REMINDERS) },
                    icon = { Icon(Icons.Default.Notifications, contentDescription = "Profile & Reminders") },
                    label = { Text("Profile", style = MaterialTheme.typography.labelSmall) },
                    modifier = Modifier.testTag("nav_tab_reminders")
                )
            }
        },
        snackbarHost = { SnackbarHost(snackbarHostState) }
    ) { innerPadding ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
        ) {
            when (uiState.currentTab) {
                AppNavTab.DAILY_LOG -> DailyLogScreen(
                    uiState = uiState,
                    onNavigateToTab = { viewModel.setNavTab(it) },
                    onEmailDigestClick = { viewModel.prepareEmailPreview() },
                    onUpdateFocusIntention = { viewModel.updateFocusIntention(it) },
                    onMoodSelected = { viewModel.updateMood(it) },
                    onToggleMoodTag = { viewModel.toggleMoodTag(it) },
                    onEnergyChange = { viewModel.updateEnergyLevel(it) },
                    onToggleTask = { viewModel.toggleTask(it) },
                    onAddTask = { viewModel.addTask(it) },
                    onDeleteTask = { viewModel.deleteTask(it) },
                    onUpdateGratitude = { viewModel.updateGratitude(it) },
                    onUpdateEveningReflection = { viewModel.updateEveningReflection(it) },
                    onDismissEmailPreview = { viewModel.dismissEmailPreview() },
                    onSendEmailDigest = { viewModel.sendEmailDigest(it) }
                )
                AppNavTab.AI_SUGGESTIONS -> AiSuggestionsScreen(
                    uiState = uiState,
                    onUpdatePersona = { viewModel.updatePersona(it) },
                    onRefreshAiPlan = { viewModel.refreshAiPlan() },
                    onAdoptSuggestion = { viewModel.adoptAiSuggestion(it) }
                )
                AppNavTab.ASSISTANT_BOT -> AssistantBotScreen(
                    uiState = uiState,
                    onClearChat = { viewModel.clearChat() },
                    onRequestQuickAdvice = { viewModel.requestQuickAdvice(it) },
                    onSendChatMessage = { viewModel.sendChatMessage(it) }
                )
                AppNavTab.ANALYTICS -> AnalyticsScreen(
                    uiState = uiState
                )
                AppNavTab.PROFILE_REMINDERS -> RemindersProfileScreen(
                    uiState = uiState,
                    onOpenOnboarding = { viewModel.openOnboardingFlow() },
                    onUpdateProfile = { name, email, persona, roleDetails, workStyle, challenge, priorities, reminderHour, reminderMinute, reminderEnabled, morningDigestEnabled ->
                        viewModel.updateFullProfile(name, email, persona, roleDetails, workStyle, challenge, priorities, reminderHour, reminderMinute, reminderEnabled, morningDigestEnabled)
                    },
                    onPrepareEmailPreview = { viewModel.prepareEmailPreview() },
                    onTriggerTestNotification = { viewModel.triggerTestNotification(it) }
                )
            }
        }
    }
}
