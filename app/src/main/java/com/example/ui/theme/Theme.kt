package com.example.ui.theme

import android.os.Build
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.dynamicDarkColorScheme
import androidx.compose.material3.dynamicLightColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.Immutable
import androidx.compose.runtime.ReadOnlyComposable
import androidx.compose.runtime.staticCompositionLocalOf
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext

@Immutable
data class ExtendedColors(
    val moodEcstatic: Color,
    val moodGood: Color,
    val moodNeutral: Color,
    val moodLow: Color,
    val moodStressed: Color,
    val success: Color,
    val successContainer: Color,
    val warning: Color,
    val warningContainer: Color,
    val info: Color,
    val infoContainer: Color,
)

val LightExtendedColors = ExtendedColors(
    moodEcstatic = MoodEcstaticColor,
    moodGood = MoodGoodColor,
    moodNeutral = MoodNeutralColor,
    moodLow = MoodLowColor,
    moodStressed = MoodStressedColor,
    success = MeadowSuccess,
    successContainer = Color(0xFFD6E8D5),
    warning = OchreWarm,
    warningContainer = Color(0xFFF7E9DA),
    info = MistySlateAccent,
    infoContainer = Color(0xFFD7E7EE)
)

val DarkExtendedColors = ExtendedColors(
    moodEcstatic = Color(0xFF62A96F),
    moodGood = Color(0xFF74A987),
    moodNeutral = Color(0xFF91A397),
    moodLow = Color(0xFFC49F78),
    moodStressed = Color(0xFFC07979),
    success = Color(0xFF9CD1AA),
    successContainer = Color(0xFF234C32),
    warning = Color(0xFFD4A373),
    warningContainer = Color(0xFF4C3822),
    info = Color(0xFFA5CDDE),
    infoContainer = Color(0xFF224856)
)

val LocalExtendedColors = staticCompositionLocalOf { LightExtendedColors }

val MaterialTheme.extendedColors: ExtendedColors
    @Composable
    @ReadOnlyComposable
    get() = LocalExtendedColors.current

private val DarkColorScheme = darkColorScheme(
    primary = SageLight,
    onPrimary = Color(0xFF073820),
    primaryContainer = SageDark,
    onPrimaryContainer = Color(0xFFC5EBD0),
    secondary = MistySlateLight,
    onSecondary = Color(0xFF083344),
    secondaryContainer = Color(0xFF244B5B),
    onSecondaryContainer = Color(0xFFD0ECF8),
    tertiary = OchreLight,
    onTertiary = Color(0xFF3F250B),
    tertiaryContainer = Color(0xFF5A3916),
    onTertiaryContainer = Color(0xFFFBE4CD),
    background = DarkBg,
    onBackground = DarkOnSurface,
    surface = DarkSurface,
    onSurface = DarkOnSurface,
    surfaceVariant = DarkSurfaceVariant,
    onSurfaceVariant = DarkOnSurfaceSubtle,
    error = RustAccent,
    onError = Color.White
)

private val LightColorScheme = lightColorScheme(
    primary = SagePrimary,
    onPrimary = Color.White,
    primaryContainer = Color(0xFFD5EBD7),
    onPrimaryContainer = Color(0xFF0D3820),
    secondary = MistySlateAccent,
    onSecondary = Color.White,
    secondaryContainer = Color(0xFFD8E9F0),
    onSecondaryContainer = Color(0xFF133644),
    tertiary = OchreWarm,
    onTertiary = Color.White,
    tertiaryContainer = Color(0xFFF9E8D7),
    onTertiaryContainer = Color(0xFF4B2E10),
    background = LightBg,
    onBackground = LightOnSurface,
    surface = LightSurface,
    onSurface = LightOnSurface,
    surfaceVariant = LightSurfaceVariant,
    onSurfaceVariant = LightOnSurfaceSubtle,
    error = RustAccent,
    onError = Color.White
)

@Composable
fun DayPulseTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    dynamicColor: Boolean = true, // Dynamic color enabled by default on Android 12+
    content: @Composable () -> Unit
) {
    val colorScheme = when {
        dynamicColor && Build.VERSION.SDK_INT >= Build.VERSION_CODES.S -> {
            val context = LocalContext.current
            if (darkTheme) dynamicDarkColorScheme(context) else dynamicLightColorScheme(context)
        }
        darkTheme -> DarkColorScheme
        else -> LightColorScheme
    }

    val extendedColors = if (darkTheme) DarkExtendedColors else LightExtendedColors

    CompositionLocalProvider(LocalExtendedColors provides extendedColors) {
        MaterialTheme(
            colorScheme = colorScheme,
            typography = Typography,
            content = content
        )
    }
}
