// Vida RPG V6 - configuración de servicios externos.
// La app funciona completamente en modo local si estos valores quedan vacíos.
window.VIDA_RPG_CONFIG = {
  supabaseUrl: "",
  supabaseAnonKey: "",
  premiumCheckoutUrl: "",
  privacyPolicyUrl: "",
  termsUrl: "",
  coinPurchaseBackendUrl: "",
  pvpBackendUrl: ""
};

// Integración futura opcional de anuncios recompensados.
// Un proveedor real puede definir:
// window.VIDA_RPG_REWARDED_AD = { show: async () => true };

// Compras reales de monedas: el frontend NO debe acreditar monedas sin confirmación de servidor.
// Un proveedor puede definir window.VIDA_RPG_COIN_PURCHASE = { buy: async (packId) => ({verified:true,transactionId:'...',coins:100}) };
// PvP online multi-dispositivo puede definir window.VIDA_RPG_PVP con un adaptador autenticado.
