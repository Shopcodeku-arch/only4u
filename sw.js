/* ONLY4U service worker: hanya untuk menampilkan notifikasi sistem & membuka website saat notifikasi diklik */
self.addEventListener("install",function(){self.skipWaiting()});
self.addEventListener("activate",function(e){e.waitUntil(self.clients.claim())});
self.addEventListener("notificationclick",function(e){
  e.notification.close();
  var d=e.notification.data||{},go=d.go||"";
  e.waitUntil(self.clients.matchAll({type:"window",includeUncontrolled:true}).then(function(l){
    for(var i=0;i<l.length;i++){if("focus" in l[i]){l[i].postMessage({o4uGo:go});return l[i].focus()}}
    return self.clients.openWindow("/")
  }))
});
