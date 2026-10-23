/* DOFAST service worker : app + CDN (Font Awesome, Firebase SDK, jsPDF…) disponibles hors ligne */
const V='dofast-v6';
self.addEventListener('install',e=>{self.skipWaiting();e.waitUntil(caches.open(V).then(c=>c.addAll(['./','manifest.webmanifest']).catch(()=>{})))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==V).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const r=e.request;if(r.method!=='GET')return;
  const u=new URL(r.url);
  if(u.hostname.includes('firebaseio.com')||u.hostname.includes('googleapis.com')&&u.pathname.includes('identitytoolkit')||u.pathname.includes('/api/'))return;
  e.respondWith(caches.open(V).then(async c=>{
    const hit=await c.match(r,{ignoreSearch:r.mode==='navigate'});
    const net=fetch(r).then(res=>{if(res&&(res.ok||res.type==='opaque'))c.put(r,res.clone());return res}).catch(()=>hit);
    return hit||net;  // cache d'abord, mise à jour en arrière-plan (l'app se met à jour toute seule)
  }));
});
