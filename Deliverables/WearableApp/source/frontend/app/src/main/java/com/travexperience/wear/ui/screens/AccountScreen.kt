package com.travexperience.wear.ui.screens

import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.wear.compose.material.Chip
import androidx.wear.compose.material.ChipDefaults
import androidx.wear.compose.material.CircularProgressIndicator
import androidx.wear.compose.material.MaterialTheme
import androidx.wear.compose.material.Text
import com.google.android.horologist.annotations.ExperimentalHorologistApi
import com.google.android.horologist.compose.layout.ScalingLazyColumn
import com.google.android.horologist.compose.layout.ScreenScaffold
import com.google.android.horologist.compose.layout.rememberColumnState
import com.travexperience.wear.ui.viewmodel.AccountViewModel

/**
 * Pantalla mínima de cuenta: por ahora solo ofrece "Desvincular reloj"
 */
@OptIn(ExperimentalHorologistApi::class)
@Composable
fun AccountScreen(viewModel: AccountViewModel, onUnlinked: () -> Unit) {
    val unlinking by viewModel.unlinking.collectAsState()
    var confirming by remember { mutableStateOf(false) }
    val columnState = rememberColumnState()

    ScreenScaffold(scrollState = columnState) {
        ScalingLazyColumn(
            columnState = columnState,
            modifier = Modifier.fillMaxSize()
        ) {
            item {
                Text(
                    text = "Cuenta",
                    style = MaterialTheme.typography.title3,
                    textAlign = TextAlign.Center,
                    modifier = Modifier.fillMaxWidth().padding(bottom = 8.dp)
                )
            }

            if (unlinking) {
                item { 
                    CircularProgressIndicator(
                        modifier = Modifier.padding(16.dp)
                    ) 
                }
            } else if (confirming) {
                item {
                    Text(
                        text = "¿Desvincular reloj?",
                        textAlign = TextAlign.Center,
                        style = MaterialTheme.typography.body2,
                        modifier = Modifier.fillMaxWidth().padding(horizontal = 12.dp, vertical = 4.dp)
                    )
                }
                item {
                    Chip(
                        onClick = { viewModel.unlink(onDone = onUnlinked) },
                        label = { Text("Sí, desvincular") },
                        colors = ChipDefaults.primaryChipColors(backgroundColor = MaterialTheme.colors.error),
                        modifier = Modifier.fillMaxWidth().padding(top = 4.dp)
                    )
                }
                item {
                    Chip(
                        onClick = { confirming = false },
                        label = { Text("Cancelar") },
                        colors = ChipDefaults.secondaryChipColors(),
                        modifier = Modifier.fillMaxWidth().padding(top = 4.dp)
                    )
                }
            } else {
                item {
                    Chip(
                        onClick = { confirming = true },
                        label = { Text("Desvincular reloj") },
                        colors = ChipDefaults.secondaryChipColors(),
                        modifier = Modifier.fillMaxWidth()
                    )
                }
            }
        }
    }
}
