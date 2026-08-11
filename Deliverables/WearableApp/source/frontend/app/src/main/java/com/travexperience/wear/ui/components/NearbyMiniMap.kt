package com.travexperience.wear.ui.components

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.drawscope.Stroke
import com.travexperience.wear.data.network.dto.NearbyPlaceDto
import com.travexperience.wear.ui.theme.AmberAccent
import com.travexperience.wear.ui.theme.OnDark
import kotlin.math.cos
import kotlin.math.min
import kotlin.math.sin

/**
 * Mapa simplificado (sin Google Maps SDK): el usuario siempre va al centro y cada lugar
 * cercano se dibuja en un ángulo pseudo-estable (derivado de su id) a una distancia del
 * centro proporcional a [NearbyPlaceDto.distanceMeters] respecto del radio máximo recibido
 * del backend (por defecto 1.5km). Pensado para dar una noción rápida de "qué tan cerca"
 * y "más o menos en qué dirección relativa", no una posición geográfica exacta.
 */
@Composable
fun NearbyMiniMap(
    places: List<NearbyPlaceDto>,
    maxRadiusMeters: Double,
    selectedPlaceId: String?,
    onPlaceClick: (NearbyPlaceDto) -> Unit,
    modifier: Modifier = Modifier
) {
    // Optimizacion: calculamos los angulos una sola vez por lista de lugares
    val placesWithAngles = androidx.compose.runtime.remember(places) {
        places.map { it to angleForPlace(it.id) }
    }

    Canvas(
        modifier = modifier
            .fillMaxWidth()
            .aspectRatio(1f)
    ) {
        val center = Offset(size.width / 2f, size.height / 2f)
        val maxRadiusPx = min(size.width, size.height) / 2f - 24f

        // Círculos guía de referencia
        listOf(0.25f, 0.5f, 0.75f, 1f).forEach { fraction ->
            drawCircle(
                color = OnDark.copy(alpha = 0.10f),
                radius = maxRadiusPx * fraction,
                center = center,
                style = Stroke(width = 1f)
            )
        }
        
        // Lineas de ejes (Norte-Sur, Este-Oeste) para dar mas sensacion de mapa
        drawLine(
            color = OnDark.copy(alpha = 0.05f),
            start = Offset(center.x, center.y - maxRadiusPx),
            end = Offset(center.x, center.y + maxRadiusPx),
            strokeWidth = 1f
        )
        drawLine(
            color = OnDark.copy(alpha = 0.05f),
            start = Offset(center.x - maxRadiusPx, center.y),
            end = Offset(center.x + maxRadiusPx, center.y),
            strokeWidth = 1f
        )

        // Usuario al centro
        drawCircle(color = AmberAccent, radius = 8f, center = center)

        placesWithAngles.forEach { (place, angleRad) ->
            val distanceFraction = (place.distanceMeters / maxRadiusMeters).toFloat().coerceIn(0.1f, 1f)
            val px = center.x + maxRadiusPx * distanceFraction * cos(angleRad)
            val py = center.y + maxRadiusPx * distanceFraction * sin(angleRad)

            val isSelected = place.id == selectedPlaceId
            drawCircle(
                color = if (isSelected) AmberAccent else Color.White.copy(alpha = 0.7f),
                radius = if (isSelected) 10f else 6f,
                center = Offset(px, py)
            )
        }
    }
}

/** Ángulo estable (0..2π) derivado del id del lugar, solo para que no "salte" entre refrescos. */
private fun angleForPlace(placeId: String): Float {
    val hash = placeId.hashCode()
    val normalized = (hash and 0xFFFF).toFloat() / 0xFFFF.toFloat() // 0..1
    return normalized * (2 * Math.PI).toFloat()
}
