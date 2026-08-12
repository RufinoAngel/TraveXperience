package com.travexperience.wear

import android.app.Application
import com.travexperience.wear.data.local.TokenStore
import com.travexperience.wear.data.network.ApiService
import com.travexperience.wear.data.network.AuthInterceptor
import com.travexperience.wear.data.network.NetworkModule
import com.travexperience.wear.data.network.PairingApiService
import com.travexperience.wear.data.repository.PairingRepository
import com.travexperience.wear.data.repository.WearableRepository

class TraveXperienceWearApp : Application() {

    lateinit var tokenStore: TokenStore
        private set

    lateinit var authInterceptor: AuthInterceptor
        private set

    lateinit var apiService: ApiService
        private set

    lateinit var pairingApiService: PairingApiService
        private set

    lateinit var wearableRepository: WearableRepository
        private set

    lateinit var pairingRepository: PairingRepository
        private set

    override fun onCreate() {
        super.onCreate()

        tokenStore = TokenStore(this)

        // Cliente plano primero: no depende de nada del cliente autenticado, y el
        // TokenAuthenticator del cliente autenticado sí depende de este.
        val pairingOkHttpClient = NetworkModule.providePairingOkHttpClient()
        val pairingRetrofit = NetworkModule.providePairingRetrofit(pairingOkHttpClient)
        pairingApiService = NetworkModule.providePairingApiService(pairingRetrofit)

        authInterceptor = NetworkModule.provideAuthInterceptor(tokenStore)
        val tokenAuthenticator = NetworkModule.provideTokenAuthenticator(
            tokenStore, pairingApiService, authInterceptor
        )

        val okHttpClient = NetworkModule.provideOkHttpClient(authInterceptor, tokenAuthenticator)
        val retrofit = NetworkModule.provideRetrofit(okHttpClient)
        apiService = NetworkModule.provideApiService(retrofit)

        wearableRepository = WearableRepository(apiService)
        pairingRepository = PairingRepository(pairingApiService, apiService, tokenStore)
    }
}
