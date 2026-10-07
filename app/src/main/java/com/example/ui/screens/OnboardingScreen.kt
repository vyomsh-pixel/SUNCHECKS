package com.example.ui.screens

import androidx.compose.animation.AnimatedContent
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.slideInHorizontally
import androidx.compose.animation.slideOutHorizontally
import androidx.compose.animation.togetherWith
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
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
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.automirrored.filled.ArrowForward
import androidx.compose.material.icons.filled.AutoAwesome
import androidx.compose.material.icons.filled.Bolt
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.DateRange
import androidx.compose.material.icons.filled.Email
import androidx.compose.material.icons.filled.Favorite
import androidx.compose.material.icons.filled.LocalFireDepartment
import androidx.compose.material.icons.filled.Psychology
import androidx.compose.material.icons.filled.RocketLaunch
import androidx.compose.material.icons.filled.SmartToy
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Checkbox
import androidx.compose.material3.CheckboxDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateListOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.model.Persona
import com.example.ui.theme.AmberWarm
import com.example.ui.theme.CyanAccent
import com.example.ui.theme.EmeraldSuccess
import com.example.ui.theme.IndigoDark
import com.example.ui.theme.IndigoLight
import com.example.ui.theme.IndigoPrimary
import com.example.ui.viewmodel.MainViewModel

@Composable
fun OnboardingScreen(
    viewModel: MainViewModel,
    modifier: Modifier = Modifier
) {
    var step by remember { mutableIntStateOf(0) }

    // User preferences state
    var name by remember { mutableStateOf("") }
    var email by remember { mutableStateOf("") }
    var selectedPersona by remember { mutableStateOf(Persona.WORKING_PROFESSIONAL) }
    var roleDetails by remember { mutableStateOf("Software Engineering") }
    var workStyle by remember { mutableStateOf("Morning Focus") }
    var primaryChallenge by remember { mutableStateOf("Overcoming Procrastination") }
    var goals by remember { mutableStateOf("Deep Work, Consistency & Work-Life Balance") }

    val selectedHabits = remember {
        mutableStateListOf<String>().apply {
            addAll(Persona.WORKING_PROFESSIONAL.defaultHabits.take(3))
        }
    }

    val totalSteps = 4
    val progress = (step + 1).toFloat() / totalSteps

    Box(
        modifier = modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background)
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(20.dp)
        ) {
            // Header: Step Progress & Back
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                if (step > 0) {
                    IconButton(
                        onClick = { step-- },
                        modifier = Modifier.testTag("onboarding_back_button")
                    ) {
                        Icon(
                            imageVector = Icons.AutoMirrored.Filled.ArrowBack,
                            contentDescription = "Back"
                        )
                    }
                } else {
                    Spacer(modifier = Modifier.size(48.dp))
                }

                Text(
                    text = "Step ${step + 1} of $totalSteps",
                    style = MaterialTheme.typography.labelMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )

                if (step < totalSteps - 1) {
                    Text(
                        text = "Skip",
                        fontSize = 13.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = MaterialTheme.colorScheme.primary,
                        modifier = Modifier
                            .clickable {
                                viewModel.completeOnboarding(
                                    name = name,
                                    email = email,
                                    persona = selectedPersona,
                                    roleDetails = roleDetails,
                                    workStyle = workStyle,
                                    challenge = primaryChallenge,
                                    goals = goals,
                                    selectedHabits = selectedHabits
                                )
                            }
                            .padding(8.dp)
                            .testTag("onboarding_skip_button")
                    )
                } else {
                    Spacer(modifier = Modifier.size(48.dp))
                }
            }

            LinearProgressIndicator(
                progress = { progress },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(6.dp)
                    .clip(RoundedCornerShape(3.dp)),
                color = MaterialTheme.colorScheme.primary,
                trackColor = MaterialTheme.colorScheme.surfaceVariant
            )

            Spacer(modifier = Modifier.height(16.dp))

            // Step Content Animated
            Box(
                modifier = Modifier
                    .weight(1f)
                    .fillMaxWidth()
            ) {
                AnimatedContent(
                    targetState = step,
                    transitionSpec = {
                        if (targetState > initialState) {
                            slideInHorizontally { it } + fadeIn() togetherWith
                                    slideOutHorizontally { -it } + fadeOut()
                        } else {
                            slideInHorizontally { -it } + fadeIn() togetherWith
                                    slideOutHorizontally { it } + fadeOut()
                        }
                    },
                    label = "onboarding_steps"
                ) { currentStep ->
                    when (currentStep) {
                        0 -> OnboardingStepWelcome()
                        1 -> OnboardingStepRoleSelection(
                            selectedPersona = selectedPersona,
                            onPersonaChanged = {
                                selectedPersona = it
                                roleDetails = when (it) {
                                    Persona.STUDENT -> "Computer Science / College"
                                    Persona.WORKING_PROFESSIONAL -> "Software Engineering"
                                    Persona.FREELANCER -> "Design & Development"
                                    Persona.ENTREPRENEUR -> "Tech Startup"
                                    Persona.CREATIVE -> "Digital Art & Writing"
                                    Persona.HEALTH_ENTHUSIAST -> "Strength & Wellness"
                                }
                                selectedHabits.clear()
                                selectedHabits.addAll(it.defaultHabits.take(3))
                            },
                            name = name,
                            onNameChanged = { name = it },
                            email = email,
                            onEmailChanged = { email = it },
                            roleDetails = roleDetails,
                            onRoleDetailsChanged = { roleDetails = it },
                            workStyle = workStyle,
                            onWorkStyleChanged = { workStyle = it },
                            challenge = primaryChallenge,
                            onChallengeChanged = { primaryChallenge = it }
                        )
                        2 -> OnboardingStepHabits(
                            selectedPersona = selectedPersona,
                            selectedHabits = selectedHabits,
                            onToggleHabit = { habit ->
                                if (selectedHabits.contains(habit)) {
                                    selectedHabits.remove(habit)
                                } else {
                                    selectedHabits.add(habit)
                                }
                            },
                            goals = goals,
                            onGoalsChanged = { goals = it }
                        )
                        3 -> OnboardingStepMeetPulseBot(
                            name = name,
                            persona = selectedPersona,
                            workStyle = workStyle,
                            challenge = primaryChallenge
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(12.dp))

            // Bottom CTA Button
            Button(
                onClick = {
                    if (step < totalSteps - 1) {
                        step++
                    } else {
                        viewModel.completeOnboarding(
                            name = name,
                            email = email,
                            persona = selectedPersona,
                            roleDetails = roleDetails,
                            workStyle = workStyle,
                            challenge = primaryChallenge,
                            goals = goals,
                            selectedHabits = selectedHabits
                        )
                    }
                },
                shape = RoundedCornerShape(16.dp),
                colors = ButtonDefaults.buttonColors(
                    containerColor = MaterialTheme.colorScheme.primary
                ),
                modifier = Modifier
                    .fillMaxWidth()
                    .height(52.dp)
                    .testTag("onboarding_primary_action_button")
            ) {
                Text(
                    text = if (step == totalSteps - 1) "Launch DayPulse 🚀" else "Continue →",
                    fontWeight = FontWeight.Bold,
                    fontSize = 16.sp
                )
            }
        }
    }
}

@Composable
private fun OnboardingStepWelcome() {
    val scrollState = rememberScrollState()

    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(scrollState),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Spacer(modifier = Modifier.height(16.dp))

        // Hero Graphic Box
        Box(
            modifier = Modifier
                .size(110.dp)
                .clip(CircleShape)
                .background(
                    Brush.radialGradient(
                        listOf(IndigoLight, IndigoDark)
                    )
                ),
            contentAlignment = Alignment.Center
        ) {
            Icon(
                imageVector = Icons.Default.LocalFireDepartment,
                contentDescription = null,
                tint = AmberWarm,
                modifier = Modifier.size(56.dp)
            )
        }

        Spacer(modifier = Modifier.height(20.dp))

        Text(
            text = "Welcome to DayPulse",
            style = MaterialTheme.typography.headlineMedium,
            fontWeight = FontWeight.ExtraBold,
            textAlign = TextAlign.Center
        )

        Spacer(modifier = Modifier.height(6.dp))

        Text(
            text = "Your daily logging companion with personalized AI routines, habit streaks, and email digests.",
            style = MaterialTheme.typography.bodyMedium,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
            textAlign = TextAlign.Center,
            lineHeight = 20.sp,
            modifier = Modifier.padding(horizontal = 16.dp)
        )

        Spacer(modifier = Modifier.height(24.dp))

        // 3 Key Benefits Cards
        BenefitRow(
            icon = Icons.Default.Bolt,
            color = AmberWarm,
            title = "Track Your Real Energy & Mood",
            description = "Log your daily headspace in 30 seconds. Learn when you peak and how to sustain momentum."
        )

        Spacer(modifier = Modifier.height(12.dp))

        BenefitRow(
            icon = Icons.Default.SmartToy,
            color = CyanAccent,
            title = "Personalized AI Strategy",
            description = "Smart routine suggestions and PulseBot advice calibrated to your exact role (Student, Professional, etc.)."
        )

        Spacer(modifier = Modifier.height(12.dp))

        BenefitRow(
            icon = Icons.Default.Email,
            color = EmeraldSuccess,
            title = "Email Reminders & Daily Digests",
            description = "Keep yourself accountable with beautiful formatted summaries dispatched straight to your inbox."
        )

        Spacer(modifier = Modifier.height(20.dp))
    }
}

@Composable
private fun BenefitRow(
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    color: Color,
    title: String,
    description: String
) {
    Card(
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f)
        ),
        modifier = Modifier.fillMaxWidth()
    ) {
        Row(
            modifier = Modifier.padding(14.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Surface(
                shape = CircleShape,
                color = color.copy(alpha = 0.2f),
                modifier = Modifier.size(42.dp)
            ) {
                Box(contentAlignment = Alignment.Center) {
                    Icon(imageVector = icon, contentDescription = null, tint = color, modifier = Modifier.size(22.dp))
                }
            }
            Spacer(modifier = Modifier.width(14.dp))
            Column {
                Text(text = title, fontWeight = FontWeight.Bold, fontSize = 13.sp)
                Spacer(modifier = Modifier.height(2.dp))
                Text(text = description, fontSize = 11.sp, color = MaterialTheme.colorScheme.onSurfaceVariant, lineHeight = 16.sp)
            }
        }
    }
}

@OptIn(ExperimentalLayoutApi::class)
@Composable
private fun OnboardingStepRoleSelection(
    selectedPersona: Persona,
    onPersonaChanged: (Persona) -> Unit,
    name: String,
    onNameChanged: (String) -> Unit,
    email: String,
    onEmailChanged: (String) -> Unit,
    roleDetails: String,
    onRoleDetailsChanged: (String) -> Unit,
    workStyle: String,
    onWorkStyleChanged: (String) -> Unit,
    challenge: String,
    onChallengeChanged: (String) -> Unit
) {
    val scrollState = rememberScrollState()

    val workStyles = listOf("Morning Focus 🌅", "Night Owl 🦉", "Steady Flow ⚖️")
    val challenges = listOf(
        "Overcoming Procrastination",
        "Burnout & Energy Drops",
        "Distractions & Screen Time",
        "Work-Life Boundaries"
    )

    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(scrollState)
    ) {
        Text(
            text = "Select Your Persona",
            style = MaterialTheme.typography.titleLarge,
            fontWeight = FontWeight.Bold
        )
        Text(
            text = "DayPulse tailors its AI routine engine and tone specifically to your role.",
            fontSize = 12.sp,
            color = MaterialTheme.colorScheme.onSurfaceVariant
        )

        Spacer(modifier = Modifier.height(14.dp))

        // Persona Cards Grid / List
        Persona.entries.forEach { persona ->
            val isSelected = persona == selectedPersona
            Card(
                shape = RoundedCornerShape(16.dp),
                border = if (isSelected) BorderStroke(2.dp, MaterialTheme.colorScheme.primary) else null,
                colors = CardDefaults.cardColors(
                    containerColor = if (isSelected) MaterialTheme.colorScheme.primaryContainer
                    else MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f)
                ),
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(vertical = 4.dp)
                    .clickable { onPersonaChanged(persona) }
                    .testTag("onboarding_role_${persona.name.lowercase()}")
            ) {
                Row(
                    modifier = Modifier.padding(14.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(text = persona.iconEmoji, fontSize = 24.sp)
                    Spacer(modifier = Modifier.width(12.dp))
                    Column(modifier = Modifier.weight(1f)) {
                        Text(
                            text = persona.title,
                            fontWeight = FontWeight.Bold,
                            fontSize = 14.sp
                        )
                        Text(
                            text = persona.subtitle,
                            fontSize = 11.sp,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                    if (isSelected) {
                        Icon(
                            imageVector = Icons.Default.CheckCircle,
                            contentDescription = "Selected",
                            tint = MaterialTheme.colorScheme.primary,
                            modifier = Modifier.size(20.dp)
                        )
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        // Your Details
        Text(text = "Your Details", fontWeight = FontWeight.Bold, fontSize = 14.sp)
        Spacer(modifier = Modifier.height(8.dp))

        OutlinedTextField(
            value = name,
            onValueChange = onNameChanged,
            label = { Text("What should we call you?") },
            singleLine = true,
            shape = RoundedCornerShape(12.dp),
            modifier = Modifier.fillMaxWidth()
        )

        Spacer(modifier = Modifier.height(8.dp))

        OutlinedTextField(
            value = email,
            onValueChange = onEmailChanged,
            label = { Text("Digest & Reminder Email") },
            singleLine = true,
            shape = RoundedCornerShape(12.dp),
            modifier = Modifier.fillMaxWidth()
        )

        Spacer(modifier = Modifier.height(8.dp))

        OutlinedTextField(
            value = roleDetails,
            onValueChange = onRoleDetailsChanged,
            label = { Text("Specialization / Field (e.g. CS, Finance, Art)") },
            singleLine = true,
            shape = RoundedCornerShape(12.dp),
            modifier = Modifier.fillMaxWidth()
        )

        Spacer(modifier = Modifier.height(14.dp))

        // Work Style
        Text(text = "Peak Rhythm:", fontWeight = FontWeight.SemiBold, fontSize = 12.sp)
        Spacer(modifier = Modifier.height(6.dp))
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            workStyles.forEach { style ->
                val isSelected = style == workStyle
                Surface(
                    shape = RoundedCornerShape(12.dp),
                    color = if (isSelected) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.surfaceVariant,
                    modifier = Modifier
                        .weight(1f)
                        .clickable { onWorkStyleChanged(style) }
                ) {
                    Text(
                        text = style,
                        fontSize = 11.sp,
                        fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal,
                        color = if (isSelected) Color.White else MaterialTheme.colorScheme.onSurface,
                        textAlign = TextAlign.Center,
                        modifier = Modifier.padding(vertical = 10.dp)
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(14.dp))

        // Primary Challenge
        Text(text = "Biggest Obstacle to Conquer:", fontWeight = FontWeight.SemiBold, fontSize = 12.sp)
        Spacer(modifier = Modifier.height(6.dp))
        FlowRow(
            horizontalArrangement = Arrangement.spacedBy(6.dp),
            verticalArrangement = Arrangement.spacedBy(6.dp)
        ) {
            challenges.forEach { ch ->
                val isSelected = ch == challenge
                Surface(
                    shape = RoundedCornerShape(10.dp),
                    color = if (isSelected) MaterialTheme.colorScheme.primaryContainer else MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f),
                    border = if (isSelected) BorderStroke(1.5.dp, MaterialTheme.colorScheme.primary) else null,
                    modifier = Modifier.clickable { onChallengeChanged(ch) }
                ) {
                    Text(
                        text = ch,
                        fontSize = 11.sp,
                        color = if (isSelected) MaterialTheme.colorScheme.onPrimaryContainer else MaterialTheme.colorScheme.onSurface,
                        modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp)
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(24.dp))
    }
}

@Composable
private fun OnboardingStepHabits(
    selectedPersona: Persona,
    selectedHabits: List<String>,
    onToggleHabit: (String) -> Unit,
    goals: String,
    onGoalsChanged: (String) -> Unit
) {
    val scrollState = rememberScrollState()

    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(scrollState)
    ) {
        Text(
            text = "Starter Routine for ${selectedPersona.title}s",
            style = MaterialTheme.typography.titleLarge,
            fontWeight = FontWeight.Bold
        )
        Text(
            text = "Pick the daily keystone habits you want to track consistently.",
            fontSize = 12.sp,
            color = MaterialTheme.colorScheme.onSurfaceVariant
        )

        Spacer(modifier = Modifier.height(14.dp))

        selectedPersona.defaultHabits.forEach { habit ->
            val isChecked = selectedHabits.contains(habit)
            Card(
                shape = RoundedCornerShape(14.dp),
                colors = CardDefaults.cardColors(
                    containerColor = if (isChecked) MaterialTheme.colorScheme.primaryContainer.copy(alpha = 0.4f)
                    else MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.3f)
                ),
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(vertical = 4.dp)
                    .clickable { onToggleHabit(habit) }
            ) {
                Row(
                    modifier = Modifier.padding(12.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Checkbox(
                        checked = isChecked,
                        onCheckedChange = { onToggleHabit(habit) },
                        colors = CheckboxDefaults.colors(checkedColor = MaterialTheme.colorScheme.primary)
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = habit,
                        fontSize = 13.sp,
                        fontWeight = if (isChecked) FontWeight.SemiBold else FontWeight.Normal,
                        color = MaterialTheme.colorScheme.onSurface
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(18.dp))

        Text(text = "Your Core Goals & Priorities:", fontWeight = FontWeight.Bold, fontSize = 13.sp)
        Spacer(modifier = Modifier.height(6.dp))
        OutlinedTextField(
            value = goals,
            onValueChange = onGoalsChanged,
            placeholder = { Text("What are you striving for this quarter?") },
            shape = RoundedCornerShape(12.dp),
            minLines = 2,
            modifier = Modifier.fillMaxWidth()
        )

        Spacer(modifier = Modifier.height(24.dp))
    }
}

@Composable
private fun OnboardingStepMeetPulseBot(
    name: String,
    persona: Persona,
    workStyle: String,
    challenge: String
) {
    val scrollState = rememberScrollState()

    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(scrollState),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Spacer(modifier = Modifier.height(10.dp))

        Surface(
            shape = CircleShape,
            color = MaterialTheme.colorScheme.primary.copy(alpha = 0.15f),
            modifier = Modifier.size(80.dp)
        ) {
            Box(contentAlignment = Alignment.Center) {
                Icon(
                    imageVector = Icons.Default.SmartToy,
                    contentDescription = null,
                    tint = MaterialTheme.colorScheme.primary,
                    modifier = Modifier.size(44.dp)
                )
            }
        }

        Spacer(modifier = Modifier.height(14.dp))

        Text(
            text = "PulseBot Is Calibrated!",
            style = MaterialTheme.typography.headlineSmall,
            fontWeight = FontWeight.ExtraBold,
            textAlign = TextAlign.Center
        )

        Text(
            text = "Custom-tailored for $name as a ${persona.title}",
            style = MaterialTheme.typography.bodyMedium,
            color = MaterialTheme.colorScheme.primary,
            fontWeight = FontWeight.SemiBold
        )

        Spacer(modifier = Modifier.height(20.dp))

        // AI Sample Advice Preview Card
        Card(
            shape = RoundedCornerShape(20.dp),
            colors = CardDefaults.cardColors(
                containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.7f)
            ),
            modifier = Modifier.fillMaxWidth()
        ) {
            Column(modifier = Modifier.padding(18.dp)) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(
                        imageVector = Icons.Default.AutoAwesome,
                        contentDescription = null,
                        tint = AmberWarm,
                        modifier = Modifier.size(18.dp)
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = "PulseBot's First Coaching Message:",
                        fontWeight = FontWeight.Bold,
                        fontSize = 12.sp,
                        color = MaterialTheme.colorScheme.primary
                    )
                }

                Spacer(modifier = Modifier.height(10.dp))

                Text(
                    text = "“Hey $name! As a ${persona.title}, you don't need 14 hours of grind to win. We're going to tackle '$challenge' using your $workStyle rhythm.\n\nEvery day, log your mood and energy here, tackle your top intention, and let me send your summary email at night. Let's make every day count!”",
                    fontSize = 13.sp,
                    lineHeight = 20.sp,
                    color = MaterialTheme.colorScheme.onSurface
                )
            }
        }

        Spacer(modifier = Modifier.height(20.dp))

        // 3 Feature Pills
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceEvenly
        ) {
            FeaturePill(icon = "🔥", label = "Daily Streaks")
            FeaturePill(icon = "⚡", label = "Energy Meter")
            FeaturePill(icon = "✉️", label = "Email Digests")
        }

        Spacer(modifier = Modifier.height(24.dp))
    }
}

@Composable
private fun FeaturePill(icon: String, label: String) {
    Surface(
        shape = RoundedCornerShape(12.dp),
        color = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f),
        modifier = Modifier.padding(4.dp)
    ) {
        Row(
            modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(icon, fontSize = 14.sp)
            Spacer(modifier = Modifier.width(4.dp))
            Text(label, fontSize = 11.sp, fontWeight = FontWeight.SemiBold)
        }
    }
}
