package com.travexperience.wear.ui.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewmodel.CreationExtras
import com.travexperience.wear.TraveXperienceWearApp
import com.travexperience.wear.location.LocationProvider

/**
 * Factory manual (sin Hilt) que toma las dependencias ya armadas en
 * [TraveXperienceWearApp] y las inyecta en cada ViewModel.
 */
class TraveXperienceViewModelFactory(
    private val app: TraveXperienceWearApp
) : ViewModelProvider.Factory {

    override fun <T : ViewModel> create(modelClass: Class<T>, extras: CreationExtras): T {
        @Suppress("UNCHECKED_CAST")
        return when (modelClass) {
            ItineraryViewModel::class.java ->
                ItineraryViewModel(app.wearableRepository, app.authInterceptor) as T

            NearbyViewModel::class.java ->
                NearbyViewModel(app.wearableRepository, LocationProvider(app)) as T

            PairingViewModel::class.java ->
                PairingViewModel(app.pairingRepository) as T

            AccountViewModel::class.java ->
                AccountViewModel(app.pairingRepository) as T

            else -> throw IllegalArgumentException("ViewModel desconocido: ${modelClass.name}")
        }
    }
}
