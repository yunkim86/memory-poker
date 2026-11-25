// 기억 포커 오프라인 지원: 처음 열 때 게임 파일을 저장해 두고, 인터넷이 없으면 저장본으로 엽니다.
const V='memory-poker-v1';
const CORE=['./','./index.html','./manifest.webmanifest','./apple-touch-icon.png','./icon-192.png','./icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==V).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const r=e.request;if(r.method!=='GET')return;
  if(r.mode==='navigate'){
    // 게임 화면: 인터넷이 되면 최신 버전을 받아 저장, 안 되면 저장본 사용
    e.respondWith(fetch(r).then(res=>{if(res.ok){const cp=res.clone();caches.open(V).then(c=>c.put('./index.html',cp))}return res})
      .catch(()=>caches.match('./index.html').then(m=>m||caches.match('./'))));
    return;
  }
  // 아이콘·글꼴 등: 저장본 먼저, 없으면 받아서 저장
  e.respondWith(caches.match(r).then(m=>m||fetch(r).then(res=>{if(res.ok||res.type==='opaque'){const cp=res.clone();caches.open(V).then(c=>c.put(r,cp))}return res})));
});
