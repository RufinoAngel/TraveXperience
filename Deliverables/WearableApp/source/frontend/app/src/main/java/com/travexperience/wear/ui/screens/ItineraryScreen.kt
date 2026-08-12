package com.travexperience.wear.ui.screens

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.wear.compose.foundation.lazy.ScalingLazyColumn
import androidx.wear.compose.foundation.lazy.items
import androidx.wear.compose.material.Card
import androidx.wear.compose.material.Chip
import androidx.wear.compose.material.ChipDefaults
import androidx.wear.compose.material.ListHeader
import androidx.wear.compose.material.MaterialTheme
import androidx.wear.compose.material.Text
import com.google.android.horologist.annotations.ExperimentalHorologistApi
import com.google.android.horologist.compose.layout.ScalingLazyColumn
import com.google.android.horologist.compose.layout.ScreenScaffold
import com.google.android.horologist.compose.layout.rememberColumnState
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Cloud
import androidx.compose.material.icons.filled.Thermostat
import androidx.compose.material.icons.filled.WbSunny
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.wear.compose.material.Icon
import com.travexperience.wear.data.network.dto.WeatherDataDto
import com.travexperience.wear.data.network.dto.ItineraryActivityDto
import com.travexperience.wear.data.network.dto.ItineraryActiveData
import com.travexperience.wear.ui.components.EmptyState
import com.travexperience.wear.ui.components.ErrorState
import com.travexperience.wear.ui.components.LoadingState
import com.travexperience.wear.ui.components.StaleDataBanner
import com.travexperience.wear.ui.viewmodel.ItineraryViewModel
import com.travexperience.wear.util.UiResult

@Composable
fun ItineraryScreen(
    viewModel: ItineraryViewModel,
    onExploreNearby: () -> Unit,
    onOpenAccount: () -> Unit,   // <- nuevo
    onSessionExpired: () -> Unit
) {
    val state by viewModel.state.collectAsState()

    when (val current = state) {
        is UiResult.Loading -> LoadingState()

        is UiResult.Success -> {
            val itinerary = current.data.itinerary
            if (itinerary == null) {
                EmptyState(
                    message = "No tienes un itinerario activo para hoy",
                    actionLabel = "Actualizar",
                    onAction = viewModel::retry
                )
            } else {
                ItineraryList(
                    data = current.data,
                    onExploreNearby = onExploreNearby,
                    onOpenAccount = onOpenAccount,
                    onRefresh = viewModel::retry
                )
            }
        }

        is UiResult.NetworkError -> {
            val cached = current.cachedData?.itinerary
            if (cached != null) {
                ItineraryList(
                    data = current.cachedData,
                    onExploreNearby = onExploreNearby,
                    onOpenAccount = onOpenAccount,
                    onRefresh = viewModel::retry,   // <- agregado
                    showStaleBanner = true
                )
            } else {
                ErrorState(
                    message = "No hay conexión con el servidor. Revisa tu internet.",
                    onRetry = viewModel::retry,
                    extraActionLabel = "Cuenta",
                    onExtraAction = onOpenAccount
                )
            }
        }

        is UiResult.ApiError -> ErrorState(
            message = current.message,
            onRetry = viewModel::retry
        )

        is UiResult.SessionExpired -> {
            onSessionExpired()
        }
    }
}

@OptIn(ExperimentalHorologistApi::class)
@Composable
private fun ItineraryList(
    data: ItineraryActiveData,
    onExploreNearby: () -> Unit,
    onOpenAccount: () -> Unit,
    onRefresh: () -> Unit,
    showStaleBanner: Boolean = false
) {
    val itinerary = data.itinerary ?: return
    val columnState = rememberColumnState()
    
    // Optimizacion: calculamos la lista plana una sola vez o cuando cambien los datos
    val allActivities = androidx.compose.runtime.remember(itinerary) {
        itinerary.today.flatMap { it.items }
    }

    ScreenScaffold(scrollState = columnState) {
        ScalingLazyColumn(
            columnState = columnState,
            modifier = Modifier.fillMaxSize()
        ) {
            if (showStaleBanner) {
                item { StaleDataBanner() }
            }

            item {
                ListHeader {
                    Text(
                        text = itinerary.title,
                        style = MaterialTheme.typography.title3,
                        color = MaterialTheme.colors.primary,
                        textAlign = TextAlign.Center
                    )
                }
            }

            data.weather?.let { weather ->
                item {
                    WeatherSection(weather)
                }
            }

            // ACCESO RÁPIDO AL MAPA Y CUENTA
            item {
                Row(
                    modifier = Modifier.fillMaxWidth().padding(horizontal = 8.dp, vertical = 4.dp),
                    horizontalArrangement = Arrangement.spacedBy(4.dp)
                ) {
                    Chip(
                        onClick = onExploreNearby,
                        label = { Text("Mapa", maxLines = 1) },
                        colors = ChipDefaults.secondaryChipColors(),
                        modifier = Modifier.weight(1f)
                    )
                    Chip(
                        onClick = onOpenAccount,
                        label = { Text("Cuenta", maxLines = 1) },
                        colors = ChipDefaults.secondaryChipColors(),
                        modifier = Modifier.weight(1f)
                    )
                }
            }

            itinerary.today.forEach { day ->
                item {
                    val dayHeader = remember(day.date, day.title) {
                        day.title ?: "Fecha: ${day.date}"
                    }
                    Text(
                        text = dayHeader,
                        style = MaterialTheme.typography.caption1,
                        color = MaterialTheme.colors.secondary,
                        modifier = Modifier.padding(top = 12.dp, bottom = 4.dp, start = 8.dp)
                    )
                }
                items(day.items) { activity ->
                    ActivityChip(activity)
                }
            }

            item {
                Chip(
                    onClick = onRefresh,
                    label = { Text("Actualizar") },
                    colors = ChipDefaults.secondaryChipColors(),
                    modifier = Modifier.fillMaxWidth().padding(top = 8.dp)
                )
            }
        }
    }
}

@Composable
private fun WeatherSection(weather: WeatherDataDto) {
    Chip(
        onClick = {},
        label = { Text("${weather.temperature.toInt()}°C · ${weather.condition}") },
        secondaryLabel = { Text("Clima en destino") },
        icon = {
            val icon = when {
                weather.condition.contains("Sol", true) || weather.condition.contains("Despejado", true) -> Icons.Default.WbSunny
                weather.condition.contains("Nube", true) || weather.condition.contains("Nublado", true) -> Icons.Default.Cloud
                else -> Icons.Default.Thermostat
            }
            Icon(icon, contentDescription = null)
        },
        colors = ChipDefaults.childChipColors(),
        modifier = Modifier.fillMaxWidth().padding(horizontal = 8.dp, vertical = 4.dp)
    )
}

@Composable
private fun ActivityChip(activity: ItineraryActivityDto) {
    val subtitle = remember(activity.time, activity.location) {
        listOfNotNull(activity.time, activity.location).joinToString(" · ")
    }
    
    Card(
        onClick = {},
        modifier = Modifier.fillMaxWidth().padding(horizontal = 4.dp, vertical = 2.dp)
    ) {
        Text(
            text = activity.name,
            style = MaterialTheme.typography.button,
            color = Color.White // Alto contraste
        )
        if (subtitle.isNotBlank()) {
            Text(
                text = subtitle,
                style = MaterialTheme.typography.caption2.copy(fontWeight = FontWeight.Medium),
                color = MaterialTheme.colors.secondary
            )
        }
    }
}

