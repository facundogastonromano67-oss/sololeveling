const CACHE='vida-rpg-v41';
const CORE_ASSETS=['./','index.html','styles.css','app.js','v20.js','manifest.json'];
const ASSETS=["g30-coach.js","missions-v2.js","arena-v2.js","./","academia.html","app.js","assessment.html","assessment-stable.js","assets/icons/bag.svg","assets/icons/book.svg","assets/icons/chart.svg","assets/icons/check.svg","assets/icons/clock.svg","assets/icons/dumbbell.svg","assets/icons/flame.svg","assets/icons/gear.svg","assets/icons/helmet.svg","assets/icons/home.svg","assets/icons/meal.svg","assets/icons/scroll.svg","assets/icons/sword.svg","assets/icons/user.svg","assets/images/cinematic/home-entry.webp","assets/images/cinematic/transformation.webp","assets/images/exercise/exercise-1.webp","assets/images/exercise/exercise-2.webp","assets/images/exercise/exercise-3.webp","assets/images/exercise/exercise-4.webp","assets/images/food/meal-1.webp","assets/images/food/meal-2.webp","assets/images/food/meal-3.webp","assets/images/food/meal-4.webp","assets/images/modules/academy.webp","assets/images/modules/arena.webp","assets/images/modules/evaluation.webp","assets/images/modules/g30.webp","assets/images/modules/home.webp","assets/images/modules/more.webp","assets/images/modules/profile.webp","assets/images/modules/progress.webp","assets/images/modules/recipes.webp","assets/images/modules/store.webp","assets/images/modules/training.webp","assets/images/portraits/gladiator.webp","assets/images/portraits/system.webp","combate.html","config.js","cuenta.html","dietario.html","entrenamiento.html","habilidades.html","historial.html","icon-192.svg","icon-512.svg","index.html","manifest.json","mas.html","misiones.html","nutricion.html","perfil.html","plan.html","progreso.html","recetario.html","styles.css","tareas.html","tienda.html","v10.js","v11.js","v12.js","v13.js","v14.js","v15.js","v16.js","v17.js","v18.js","v19.js","v20.js","v6.js","v7.js","v8.js","v9.js","visual-academia.svg","visual-arena.svg","visual-coliseo.svg","visual-g30.svg","visual-home.svg","visual-recipes.svg"];

async function cacheOptionalAsset(cache,asset){
  const response=await fetch(asset,{cache:'reload'});
  if(!response.ok)throw new Error(`No se pudo precachear ${asset}: ${response.status}`);
  await cache.put(asset,response);
}

self.addEventListener('install',event=>{
  self.skipWaiting();
  event.waitUntil((async()=>{
    const cache=await caches.open(CACHE);
    await cache.addAll(CORE_ASSETS);
    const optional=ASSETS.filter(asset=>!CORE_ASSETS.includes(asset));
    await Promise.allSettled(optional.map(asset=>cacheOptionalAsset(cache,asset)));
  })());
});

self.addEventListener('activate',event=>event.waitUntil((async()=>{
  const keys=await caches.keys();
  await Promise.all(keys.filter(key=>key!==CACHE&&key.startsWith('vida-rpg-')).map(key=>caches.delete(key)));
  await self.clients.claim();
})()));

self.addEventListener('fetch',event=>{
  const request=event.request;
  if(request.method!=='GET')return;
  const url=new URL(request.url);
  if(url.origin!==self.location.origin)return;
  const navigation=request.mode==='navigate';
  event.respondWith((async()=>{
    try{
      const response=await fetch(request);
      if(response.ok){const cache=await caches.open(CACHE);await cache.put(request,response.clone())}
      return response;
    }catch(error){
      const cached=await caches.match(request,{ignoreSearch:true});
      if(cached)return cached;
      if(navigation)return (await caches.match('index.html'))||(await caches.match('./'))||Response.error();
      return Response.error();
    }
  })());
});

self.addEventListener('notificationclick',event=>{
  event.notification.close();
  event.waitUntil(self.clients.matchAll({type:'window',includeUncontrolled:true}).then(windows=>windows[0]?windows[0].focus():self.clients.openWindow('./index.html')));
});
