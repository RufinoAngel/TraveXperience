package com.travexperience.wear.ui.theme

import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color
import androidx.wear.compose.material.Colors
import androidx.wear.compose.material.MaterialTheme

// Paleta consistente con la app móvil/web: acento dorado/ámbar sobre fondo oscuro.
val AmberAccent = Color(0xFFE0A62D)
val AmberAccentVariant = Color(0xFFC98A12)
val BackgroundDark = Color(0xFF121212)
val SurfaceDark = Color(0xFF1E1B16)
val OnDark = Color(0xFFF5F0E6)
val ErrorRed = Color(0xFFCF6679)

private val TraveXperienceColors = Colors(
    primary = AmberAccent,
    primaryVariant = AmberAccentVariant,
    secondary = AmberAccent,
    secondaryVariant = AmberAccentVariant,
    background = BackgroundDark,
    surface = SurfaceDark,
    error = ErrorRed,
    onPrimary = Color.Black,
    onSecondary = Color.Black,
    onBackground = OnDark,
    onSurface = OnDark,
    onError = Color.Black
)

@Composable
fun TraveXperienceWearTheme(content: @Composable () -> Unit) {
    MaterialTheme(
        colors = TraveXperienceColors,
        content = content
    )
}
