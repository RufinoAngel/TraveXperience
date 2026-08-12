package com.travexperience.wear

import android.Manifest
import android.os.Build
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.compose.setContent
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.compose.ui.platform.LocalContext
import androidx.wear.compose.material.Scaffold
import androidx.wear.compose.material.TimeText
import androidx.wear.compose.navigation.SwipeDismissableNavHost
import androidx.wear.compose.navigation.composable
import androidx.wear.compose.navigation.rememberSwipeDismissableNavController
import com.google.android.horologist.annotations.ExperimentalHorologistApi
import com.google.android.horologist.compose.layout.AppScaffold
import com.travexperience.wear.service.ExploreLocationService
import com.travexperience.wear.ui.screens.AccountScreen
import com.travexperience.wear.ui.screens.ItineraryScreen
import com.travexperience.wear.ui.screens.NearbyScreen
import com.travexperience.wear.ui.screens.PairingScreen
import com.travexperience.wear.ui.viewmodel.AccountViewModel
import com.travexperience.wear.ui.viewmodel.ItineraryViewModel
import com.travexperience.wear.ui.viewmodel.NearbyViewModel
import com.travexperience.wear.ui.viewmodel.PairingViewModel
import com.travexperience.wear.ui.viewmodel.TraveXperienceViewModelFactory
import com.travexperience.wear.ui.theme.TraveXperienceWearTheme

private object Routes {
    const val ITINERARY = "itinerary"
    const val NEARBY = "nearby"
    const val ACCOUNT = "account"
}

class MainActivity : ComponentActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            val launcher = registerForActivityResult(ActivityResultContracts.RequestPermission()) {}
            launcher.launch(Manifest.permission.POST_NOTIFICATIONS)
        }

        setContent {
            TraveXperienceWearTheme {
                TraveXperienceApp()
            }
        }
    }
}

@OptIn(ExperimentalHorologistApi::class)
@Composable
private fun TraveXperienceApp() {
    val app = LocalContext.current.applicationContext as TraveXperienceWearApp
    
    // Optimizacion: usamos remember para que no se cree la fabrica en cada recomposicion
    val factory = androidx.compose.runtime.remember(app) { 
        TraveXperienceViewModelFactory(app) 
    }

    val hasSession by app.tokenStore.hasSessionFlow.collectAsState(initial = null)

    AppScaffold {
        when (hasSession) {
            null -> Unit // primer valor todavía no llegó desde EncryptedSharedPreferences
            false -> {
                val pairingViewModel: PairingViewModel = viewModel(factory = factory)
                PairingScreen(
                    viewModel = pairingViewModel,
                    onPaired = { /* no-op: hasSessionFlow pasa a true solo y recompone */ }
                )
            }
            true -> TraveXperienceNavHost(app, factory)
        }
    }
}

@Composable
private fun TraveXperienceNavHost(
    app: TraveXperienceWearApp,
    factory: TraveXperienceViewModelFactory
) {
    val navController = rememberSwipeDismissableNavController()

    Scaffold(
        timeText = { TimeText() }
    ) {
        SwipeDismissableNavHost(
            navController = navController,
            startDestination = Routes.ITINERARY
        ) {
            composable(Routes.ITINERARY) {
                val viewModel: ItineraryViewModel = viewModel(factory = factory)
                ItineraryScreen(
                    viewModel = viewModel,
                    onExploreNearby = { navController.navigate(Routes.NEARBY) },
                    onOpenAccount = { navController.navigate(Routes.ACCOUNT) },
                    onSessionExpired = {
                        app.tokenStore.clearSession()
                        navController.popBackStack(Routes.ITINERARY, inclusive = true)
                    }
                )
            }

            composable(Routes.NEARBY) {
                val viewModel: NearbyViewModel = viewModel(factory = factory)
                NearbyScreen(viewModel = viewModel)
            }

            composable(Routes.ACCOUNT) {
                val viewModel: AccountViewModel = viewModel(factory = factory)
                AccountScreen(
                    viewModel = viewModel,
                    onUnlinked = { navController.popBackStack() }
                )
            }
        }
    }
}
