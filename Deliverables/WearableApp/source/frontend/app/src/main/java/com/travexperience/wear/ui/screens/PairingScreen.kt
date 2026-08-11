package com.travexperience.wear.ui.screens

import androidx.compose.foundation.border
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.Backspace
import androidx.compose.material.icons.filled.Check
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import androidx.wear.compose.material.Button
import androidx.wear.compose.material.ButtonDefaults
import androidx.wear.compose.material.CircularProgressIndicator
import androidx.wear.compose.material.Icon
import androidx.wear.compose.material.MaterialTheme
import androidx.wear.compose.material.Text
import com.google.android.horologist.annotations.ExperimentalHorologistApi
import com.google.android.horologist.compose.layout.ScalingLazyColumn
import com.google.android.horologist.compose.layout.ScreenScaffold
import com.google.android.horologist.compose.layout.rememberColumnState
import com.travexperience.wear.ui.viewmodel.PAIRING_CODE_LENGTH
import com.travexperience.wear.ui.viewmodel.PairingUiState
import com.travexperience.wear.ui.viewmodel.PairingViewModel

@OptIn(ExperimentalHorologistApi::class)
@Composable
fun PairingScreen(viewModel: PairingViewModel, onPaired: () -> Unit) {
    val digits by viewModel.digits.collectAsState()
    val uiState by viewModel.uiState.collectAsState()
    val columnState = rememberColumnState()

    if (uiState is PairingUiState.Paired) {
        onPaired()
        return
    }

    ScreenScaffold(scrollState = columnState) {
        ScalingLazyColumn(
            columnState = columnState,
            modifier = Modifier.fillMaxSize(),
        ) {
            item {
                Text(
                    text = "Vincular",
                    style = MaterialTheme.typography.title3,
                    textAlign = TextAlign.Center,
                    color = MaterialTheme.colors.primary,
                    modifier = Modifier.padding(top = 10.dp)
                )
            }

            item {
                Text(
                    text = "Ingresa el código de 6 dígitos que ves en tu teléfono",
                    style = MaterialTheme.typography.caption2,
                    textAlign = TextAlign.Center,
                    modifier = Modifier.padding(horizontal = 12.dp, vertical = 4.dp)
                )
            }

            item {
                CodeDigitsRow(digits = digits)
            }

            item {
                val errorMessage = (uiState as? PairingUiState.Error)?.message
                if (errorMessage != null) {
                    Text(
                        text = errorMessage,
                        style = MaterialTheme.typography.caption2,
                        color = MaterialTheme.colors.error,
                        textAlign = TextAlign.Center,
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(horizontal = 16.dp, vertical = 2.dp)
                    )
                }
            }

            item {
                Keypad(
                    enabled = uiState !is PairingUiState.Submitting,
                    onDigit = viewModel::onDigitPressed,
                    onBackspace = viewModel::onBackspace,
                    onConfirm = viewModel::onConfirm,
                    confirmEnabled = digits.length == PAIRING_CODE_LENGTH
                )
            }
        }

        if (uiState is PairingUiState.Submitting) {
            Box(
                modifier = Modifier.fillMaxSize(),
                contentAlignment = Alignment.Center
            ) {
                CircularProgressIndicator(
                    indicatorColor = MaterialTheme.colors.primary,
                    trackColor = MaterialTheme.colors.onSurface.copy(alpha = 0.1f)
                )
            }
        }
    }
}

@Composable
private fun CodeDigitsRow(digits: String) {
    Row(
        horizontalArrangement = Arrangement.Center,
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 8.dp)
    ) {
        for (i in 0 until PAIRING_CODE_LENGTH) {
            val char = digits.getOrNull(i)
            Box(
                modifier = Modifier
                    .padding(horizontal = 2.dp)
                    .size(width = 24.dp, height = 32.dp)
                    .clip(RoundedCornerShape(4.dp))
                    .background(
                        if (char != null) MaterialTheme.colors.primary.copy(alpha = 0.1f)
                        else MaterialTheme.colors.onSurface.copy(alpha = 0.05f)
                    ),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = char?.toString() ?: "•",
                    style = MaterialTheme.typography.title2,
                    color = if (char != null) MaterialTheme.colors.primary 
                            else MaterialTheme.colors.onSurface.copy(alpha = 0.2f)
                )
            }
        }
    }
}

@Composable
private fun Keypad(
    enabled: Boolean,
    onDigit: (Char) -> Unit,
    onBackspace: () -> Unit,
    onConfirm: () -> Unit,
    confirmEnabled: Boolean
) {
    val keySize = 42.dp // Más grande para Wear OS

    Column(
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.spacedBy(6.dp),
        modifier = Modifier.padding(bottom = 24.dp)
    ) {
        for (row in listOf("123", "456", "789")) {
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                for (digit in row) {
                    DigitKey(digit = digit, size = keySize, enabled = enabled, onClick = onDigit)
                }
            }
        }

        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            Button(
                onClick = onBackspace,
                enabled = enabled,
                colors = ButtonDefaults.secondaryButtonColors(),
                modifier = Modifier.size(keySize)
            ) {
                Icon(
                    imageVector = Icons.AutoMirrored.Filled.Backspace,
                    contentDescription = "Borrar",
                    modifier = Modifier.size(20.dp)
                )
            }

            DigitKey(digit = '0', size = keySize, enabled = enabled, onClick = onDigit)

            Button(
                onClick = onConfirm,
                enabled = enabled && confirmEnabled,
                colors = ButtonDefaults.primaryButtonColors(),
                modifier = Modifier.size(keySize)
            ) {
                Icon(
                    imageVector = Icons.Filled.Check,
                    contentDescription = "Confirmar",
                    modifier = Modifier.size(24.dp)
                )
            }
        }
    }
}

@Composable
private fun DigitKey(
    digit: Char,
    size: Dp,
    enabled: Boolean,
    onClick: (Char) -> Unit
) {
    Button(
        onClick = { onClick(digit) },
        enabled = enabled,
        colors = ButtonDefaults.secondaryButtonColors(),
        modifier = Modifier.size(size)
    ) {
        Text(text = digit.toString(), style = MaterialTheme.typography.title3)
    }
}
