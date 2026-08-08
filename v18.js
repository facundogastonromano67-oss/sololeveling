(()=>{
const pg=document.body?.dataset?.page||'';
if(pg!=='home')return;
function stabilizeHomeViewport(){
  const b=document.body, h=document.documentElement;
  b?.classList.remove('page-exit');
  b?.style.removeProperty('transform');
  h?.style.removeProperty('transform');
  // No tocamos el zoom del usuario: sólo quitamos escalas internas de la app.
  document.querySelectorAll('.v16-module-hero,.v16-module-hero>img').forEach(el=>el.style.removeProperty('transform'));
}
stabilizeHomeViewport();
window.addEventListener('pageshow',stabilizeHomeViewport);
window.addEventListener('orientationchange',()=>setTimeout(stabilizeHomeViewport,80));
})();
