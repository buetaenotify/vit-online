// Service worker: เก็บหน้าแอป (เปลือก) ไว้ในเครื่อง ให้เปิดได้เร็วและติดตั้งเป็นแอปได้
// เนื้อหาเว็บแอปจาก Google Apps Script ยังโหลดจากอินเทอร์เน็ตทุกครั้ง (ข้อมูลเป็นปัจจุบันเสมอ)
const CACHE = 'vit-online-v1';
const SHELL = ['./', './index.html', './config.js', './manifest.webmanifest',
  './icons/icon-192.png', './icons/icon-512.png', './icons/maskable-512.png', './icons/apple-touch-icon.png', './icons/favicon-32.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin) return;   // ไม่ยุ่งกับ Google
  // config.js ใช้ข้อมูลล่าสุดก่อน เผื่อครูเปลี่ยนลิงก์
  if (url.pathname.endsWith('/config.js')) {
    e.respondWith(fetch(e.request).then(r => { caches.open(CACHE).then(c => c.put(e.request, r.clone())); return r; }).catch(() => caches.match(e.request)));
    return;
  }
  e.respondWith(caches.match(e.request).then(hit => hit || fetch(e.request)));
});
