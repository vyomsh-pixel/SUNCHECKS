# DayPulse ⚡
### Smart Daily Logger, Persona Routine Optimizer & AI Advisor

DayPulse is a modern, privacy-first Android daily journaling and routine optimization application built entirely with **Kotlin** and **Jetpack Compose (Material 3)**.

Designed for high performers across different walks of life, DayPulse personalizes daily habit tracking, routine planning, and AI coaching based on your selected identity—whether you're a **Student**, **Working Professional**, **Freelancer**, **Founder & Entrepreneur**, **Creative**, or **Health & Fitness Enthusiast**.

---

## 🌟 Key Features

### 1. Daily Logging & Pulse Tracking
- **Emotional Headspace & Mood**: 5 visual mood states (*Ecstatic, Good, Neutral, Low Energy, Overwhelmed*) with tactile context chips (*Productive, Focused, Calm, Energized, Creative, Busy, etc.*).
- **Segmented Energy Meter**: 10-level battery visualizer with dynamic power states (*Surge Mode, Flow State, Steady Flow, Recharge Mode*).
- **Daily North Star Intention**: Identify the single #1 priority that makes today a victory.
- **Keystone Habits & Tasks Checklist**: Interactive checkable habits with real-time percentage progress bar and custom task creation.
- **Gratitude & Evening Reflections**: Guided prompts to capture wins, lessons learned, and tomorrow's adjustments.
- **Consistency Streaks**: Automatic streak calculation, all-time records, and milestone badges.

### 2. Multi-Persona User Profile System
- **Predefined Roles**:
  - 🎓 **Student**: Academic deep study blocks, spaced repetition, active recall, and exam prep.
  - 💼 **Working Professional**: Deep work timeboxing, meeting boundaries, and shutdown rituals.
  - 🚀 **Freelancer & Creator**: Billable milestones, business development pipeline, and creative recovery.
  - 💡 **Founder & Entrepreneur**: High-ROI product velocity, bottleneck removal, and team syncs.
  - 🎨 **Creative & Artist**: Free-flow morning ideation, project finishing, and sensory walks.
  - ⚡ **Health & Fitness**: Nutrition, strength, mobility, and circadian sleep optimization.
- **Custom Attributes**: Field / Major, Peak Rhythm (*Morning Focus, Night Owl, Steady Flow*), and Core Bottleneck (*Procrastination, Burnout, Distractions, Boundaries*).

### 3. Smart AI Routine Generator (Powered by Gemini 3.5 Flash)
- Generates structured, time-of-day daily recommendations (*Morning 🌅, Afternoon ☀️, Evening 🌙*).
- Contextually calibrated to your current mood, energy level, and daily focus intention.
- **One-Tap Adoption**: Tap *"Add to Tasks"* to immediately add any AI routine recommendation to today's active checklist.

### 4. PulseBot (AI Life & Productivity Companion)
- Context-aware conversational assistant factoring in your role, current energy level (1–10), and pending tasks.
- **Quick Coaching Action Deck**:
  - ⚡ **Productivity Tip**: High-leverage tactics tailored to current battery levels and backlog.
  - 🔥 **Motivation Boost**: Inspiring pep talks referencing your active streak and intentions.
  - 🎯 **Daily Strategy**: 3-step action plans to conquer your top intention.
  - ✨ **Reflection Feedback**: Compassionate evening feedback closing mental loops before sleep.

### 5. Email Reminders & Check-in Digests
- **One-Click Email Dispatch**: Previews and dispatches a comprehensive, formatted daily summary directly to your configured email via Android's native email client.
- **Schedule Notification Alerts**: Configurable evening check-in alarms and local reminders.

### 6. Interactive 4-Step Onboarding Flow
- Guides new users through core philosophies, persona customization, keystone habit selection, and live PulseBot AI calibration.
- Re-accessible anytime via the **Tutorial** button in Settings.

---

## 🛠️ Tech Stack & Architecture

- **Language**: Kotlin 2.2+ (100% Kotlin)
- **UI Framework**: Jetpack Compose with Material 3 (M3)
- **Architecture**: MVVM (Model-View-ViewModel) + Clean Architecture Repository pattern
- **Local Persistence**: Android Room Database (SQLite) with Kotlin Coroutines Flow
- **Networking**: Retrofit 2 + OkHttp (60s timeouts) + Moshi Kotlin Codegen
- **AI Engine**: Google Gemini API (`gemini-3.5-flash`) with resilient offline fallback algorithms
- **Typography**: Google Fonts bundled locally (`Outfit` for display/headlines, `Plus Jakarta Sans` for body/labels)
- **Testing**: JUnit 4 + Robolectric JVM tests

---

## 🚀 How to Run Locally in Your IDE (Android Studio)

### Prerequisites
1. **Android Studio**: Ladybug (2024.2.1+) or newer
2. **JDK**: Java 17 or Java 21
3. **Android SDK**: Compile SDK 36, Min SDK 24

### Steps
1. **Clone or Download** the repository to your machine.
2. Open **Android Studio** and choose **Open an Existing Project**, selecting the project root directory.
3. Allow Gradle to sync.
4. (Optional) In the project root, create a `.env` file with your Gemini API key:
   ```properties
   GEMINI_API_KEY=your_gemini_api_key_here
   ```
   *(If not provided, DayPulse automatically runs in resilient Smart Offline AI Mode with curated rule-based recommendations).*
5. Select a device or emulator and press **Run (Shift + F10)**.

### Running Unit & Robolectric Tests
```bash
gradle :app:testDebugUnitTest
```

### Building APK
```bash
gradle :app:assembleDebug
```
The generated APK will be in `app/build/outputs/apk/debug/app-debug.apk`.

---

## 📤 Pushing to Your GitHub Repository from AI Studio

To export this codebase to your GitHub account:
1. Look at the top navigation bar or **Settings** menu in the Google AI Studio interface.
2. Click **"Export"** or **"Push to GitHub"**.
3. Authorize GitHub and select your target repository name.
4. Clone the repository locally:
   ```bash
   git clone https://github.com/<your-username>/<your-repo-name>.git
   cd <your-repo-name>
   ```
5. You can now work on it with any IDE (Android Studio, VS Code, Cursor) and your favorite developer agents!
