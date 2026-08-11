package com.travexperience.wear.ui.components

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.wear.compose.material.Button
import androidx.wear.compose.material.CircularProgressIndicator
import androidx.wear.compose.material.MaterialTheme
import androidx.wear.compose.material.Text
import com.google.android.horologist.annotations.ExperimentalHorologistApi
import com.google.android.horologist.compose.layout.ScalingLazyColumn
import com.google.android.horologist.compose.layout.ScreenScaffold
import com.google.android.horologist.compose.layout.rememberColumnState

@Composable
fun LoadingState(modifier: Modifier = Modifier) {
    Column(
        modifier = modifier.fillMaxSize(),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        CircularProgressIndicator(
            indicatorColor = MaterialTheme.colors.primary,
            trackColor = MaterialTheme.colors.onSurface.copy(alpha = 0.1f)
        )
    }
}

@OptIn(ExperimentalHorologistApi::class)
@Composable
fun ErrorState(
    message: String,
    onRetry: () -> Unit,
    extraActionLabel: String? = null,
    onExtraAction: (() -> Unit)? = null,
    modifier: Modifier = Modifier
) {
    val columnState = rememberColumnState()
    ScreenScaffold(scrollState = columnState) {
        ScalingLazyColumn(
            columnState = columnState,
            modifier = modifier.fillMaxSize()
        ) {
            item {
                Text(
                    text = "¡Ups!",
                    style = MaterialTheme.typography.title3,
                    color = MaterialTheme.colors.error,
                    modifier = Modifier.padding(bottom = 8.dp)
                )
            }
            item {
                Text(
                    text = message,
                    textAlign = TextAlign.Center,
                    style = MaterialTheme.typography.body2,
                    modifier = Modifier.padding(horizontal = 16.dp, vertical = 4.dp)
                )
            }
            item {
                Button(
                    onClick = onRetry,
                    modifier = Modifier.fillMaxWidth(0.8f).padding(top = 8.dp)
                ) {
                    Text("Reintentar")
                }
            }
            if (extraActionLabel != null && onExtraAction != null) {
                item {
                    Button(
                        onClick = onExtraAction,
                        colors = androidx.wear.compose.material.ButtonDefaults.secondaryButtonColors(),
                        modifier = Modifier.fillMaxWidth(0.8f).padding(top = 4.dp)
                    ) {
                        Text(extraActionLabel)
                    }
                }
            }
        }
    }
}

@OptIn(ExperimentalHorologistApi::class)
@Composable
fun EmptyState(
    message: String,
    actionLabel: String? = null,
    onAction: (() -> Unit)? = null,
    modifier: Modifier = Modifier
) {
    val columnState = rememberColumnState()
    ScreenScaffold(scrollState = columnState) {
        ScalingLazyColumn(
            columnState = columnState,
            modifier = modifier.fillMaxSize()
        ) {
            item {
                Text(
                    text = message,
                    textAlign = TextAlign.Center,
                    style = MaterialTheme.typography.body1,
                    modifier = Modifier.padding(horizontal = 16.dp, vertical = 12.dp)
                )
            }
            if (actionLabel != null && onAction != null) {
                item {
                    Button(
                        onClick = onAction,
                        modifier = Modifier.fillMaxWidth(0.8f)
                    ) {
                        Text(actionLabel)
                    }
                }
            }
        }
    }
}

/** Banner chico para mostrar arriba de datos cacheados: "Sin conexión — mostrando datos locales". */
@Composable
fun StaleDataBanner(modifier: Modifier = Modifier) {
    Text(
        text = "⚠ Sin conexión · datos locales",
        style = MaterialTheme.typography.caption2,
        color = MaterialTheme.colors.primary,
        textAlign = TextAlign.Center,
        modifier = modifier
            .fillMaxWidth()
            .padding(vertical = 4.dp)
    )
}

