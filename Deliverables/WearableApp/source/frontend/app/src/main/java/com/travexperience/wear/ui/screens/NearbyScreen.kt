package com.travexperience.wear.ui.screens

import android.Manifest
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.provider.Settings
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberUpdatedState
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.core.content.ContextCompat
import androidx.wear.compose.material.Card
import androidx.wear.compose.material.Chip
import androidx.wear.compose.material.ChipDefaults
import androidx.wear.compose.material.MaterialTheme
import androidx.wear.compose.material.Text
import com.google.android.horologist.annotations.ExperimentalHorologistApi
import com.google.android.horologist.compose.layout.ScalingLazyColumn
import com.google.android.horologist.compose.layout.ScreenScaffold
import com.google.android.horologist.compose.layout.rememberColumnState
import com.travexperience.wear.data.network.dto.NearbyPlaceDto
import com.travexperience.wear.service.ExploreLocationService
import com.travexperience.wear.ui.components.EmptyState
import com.travexperience.wear.ui.components.ErrorState
import com.travexperience.wear.ui.components.LoadingState
import com.travexperience.wear.ui.components.NearbyMiniMap
import com.travexperience.wear.ui.components.StaleDataBanner
import com.travexperience.wear.ui.viewmodel.NearbyViewModel
import com.travexperience.wear.util.UiResult

private const val DEFAULT_RADIUS_METERS = 1500.0

@Composable
fun NearbyScreen(viewModel: NearbyViewModel) {
    val context = LocalContext.current
    val permissions = arrayOf(
        Manifest.permission.ACCESS_FINE_LOCATION,
        Manifest.permission.ACCESS_COARSE_LOCATION
    )

    var hasLocationPermission by remember {
        mutableStateOf(
            permissions.all {
                ContextCompat.checkSelfPermission(context, it) == PackageManager.PERMISSION_GRANTED
            }
        )
    }

    val permissionLauncher = rememberLauncherForActivityResult(
        ActivityResultContracts.RequestMultiplePermissions()
    ) { results ->
        hasLocationPermission = results.values.all { it }
    }

    if (!hasLocationPermission) {
        LocationPermissionRequired(
            onRequestPermission = { permissionLauncher.launch(permissions) },
            onOpenSettings = {
                context.startActivity(
                    Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS).apply {
                        data = Uri.fromParts("package", context.packageName, null)
                    }
                )
            }
        )
        return
    }

    // Iniciamos el service solo cuando sabemos que hay permiso.
    // DisposableEffect se encarga de detenerlo al salir de la pantalla.
    androidx.compose.runtime.DisposableEffect(Unit) {
        ExploreLocationService.start(context)
        onDispose { ExploreLocationService.stop(context) }
    }

    // Arranca el tracking cuando la pantalla entra en composición, y lo corta al salir
    // (navegar a otra pantalla dispara onDispose) — el Foreground Service de background
    // (modo "explorar activo") es un mecanismo aparte, no depende de esta pantalla.
    val currentViewModel by rememberUpdatedState(viewModel)
    DisposableEffect(Unit) {
        currentViewModel.startTracking()
        onDispose { currentViewModel.stopTracking() }
    }

    val nearbyState by viewModel.nearbyState.collectAsState()
    val selectedPlace by viewModel.selectedPlace.collectAsState()

    when (val current = nearbyState) {
        is UiResult.Loading -> LoadingState()

        is UiResult.Success -> NearbyContent(
            places = current.data.places,
            selectedPlaceId = selectedPlace?.id,
            onPlaceClick = viewModel::selectPlace,
            onRefresh = { viewModel.startTracking() } // Botón manual si se necesita
        )

        is UiResult.NetworkError -> {
            val cached = current.cachedData
            if (cached != null) {
                Column(modifier = Modifier.fillMaxSize()) {
                    StaleDataBanner()
                    NearbyContent(
                        places = cached.places,
                        selectedPlaceId = selectedPlace?.id,
                        onPlaceClick = viewModel::selectPlace,
                        onRefresh = { viewModel.startTracking() }
                    )
                }
            } else {
                ErrorState(
                    message = current.message ?: "No hay conexión con el servidor. Revisa tu internet.",
                    onRetry = { viewModel.startTracking() },
                    extraActionLabel = "Atrás",
                    onExtraAction = { /* simplemente dejar que el Swipe-to-dismiss funcione o podrías navegar */ }
                )
            }
        }

        is UiResult.ApiError -> ErrorState(message = current.message, onRetry = {})

        is UiResult.SessionExpired -> ErrorState(
            message = "Tu sesión venció. Abre TraveXperience en tu teléfono.",
            onRetry = {}
        )
    }
}

@Composable
private fun NearbyContent(
    places: List<NearbyPlaceDto>,
    selectedPlaceId: String?,
    onPlaceClick: (NearbyPlaceDto) -> Unit,
    onRefresh: () -> Unit
) {
    val selected = places.firstOrNull { it.id == selectedPlaceId } ?: places.firstOrNull()

    Box(
        modifier = Modifier.fillMaxSize(),
        contentAlignment = Alignment.Center
    ) {
        NearbyMiniMap(
            places = places,
            maxRadiusMeters = DEFAULT_RADIUS_METERS,
            selectedPlaceId = selectedPlaceId,
            onPlaceClick = onPlaceClick,
            modifier = Modifier
                .fillMaxSize()
                .padding(16.dp)
        )

        if (places.isEmpty()) {
            Text(
                text = "Buscando lugares...",
                style = MaterialTheme.typography.caption2,
                color = MaterialTheme.colors.secondary,
                modifier = Modifier.align(Alignment.TopCenter).padding(top = 24.dp)
            )
        }

        selected?.let { place ->
            Card(
                onClick = { onPlaceClick(place) },
                modifier = Modifier
                    .align(Alignment.BottomCenter)
                    .padding(bottom = 12.dp)
                    .padding(horizontal = 24.dp)
            ) {
                Text(
                    text = place.name,
                    style = MaterialTheme.typography.caption1,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis
                )
                Text(
                    text = "${place.category} · ${place.distanceMeters.toInt()}m",
                    style = MaterialTheme.typography.caption2,
                    color = MaterialTheme.colors.primary
                )
            }
        }
    }
}

@OptIn(ExperimentalHorologistApi::class)
@Composable
private fun LocationPermissionRequired(
    onRequestPermission: () -> Unit,
    onOpenSettings: () -> Unit
) {
    val columnState = rememberColumnState()
    ScreenScaffold(scrollState = columnState) {
        ScalingLazyColumn(
            columnState = columnState,
            modifier = Modifier.fillMaxSize()
        ) {
            item {
                Text(
                    text = "Permiso de ubicación",
                    style = MaterialTheme.typography.title3,
                    color = MaterialTheme.colors.primary,
                    textAlign = TextAlign.Center,
                    modifier = Modifier.padding(top = 10.dp)
                )
            }
            item {
                Text(
                    text = "Necesitamos tu ubicación para mostrarte los lugares más cercanos de tu ruta.",
                    style = MaterialTheme.typography.body2,
                    textAlign = TextAlign.Center,
                    modifier = Modifier
                        .padding(horizontal = 16.dp)
                        .padding(vertical = 8.dp)
                )
            }
            item {
                Chip(
                    onClick = onRequestPermission,
                    label = { Text("Dar permiso", modifier = Modifier.fillMaxWidth(), textAlign = TextAlign.Center) },
                    colors = ChipDefaults.primaryChipColors(),
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 16.dp)
                        .padding(top = 4.dp)
                )
            }
            item {
                Text(
                    text = "Si el botón no funciona, actívalo en ajustes:",
                    style = MaterialTheme.typography.caption2,
                    textAlign = TextAlign.Center,
                    modifier = Modifier
                        .padding(horizontal = 16.dp)
                        .padding(top = 12.dp, bottom = 4.dp)
                )
            }
            item {
                Chip(
                    onClick = onOpenSettings,
                    label = { Text("Abrir Ajustes", modifier = Modifier.fillMaxWidth(), textAlign = TextAlign.Center) },
                    colors = ChipDefaults.secondaryChipColors(),
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 16.dp)
                )
            }
        }
    }
}
