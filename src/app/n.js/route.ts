import { BRAND } from "@/config/brand";
import { CLICK_COOKIE, CLICK_QUERY_PARAM } from "@/features/tracking/constants";

export const dynamic = "force-static";

// The pixel, under our own global (BRAND.pixelGlobal):
// window.amplio('track', 'signup', { email }).
// Visits attribute themselves on load; the click id comes from the ?nn= param
// the tracked link appended, or the cookie it set.
const SCRIPT = `(function(){
  var w = window, d = document;
  var s = d.currentScript || (function(){ var a = d.getElementsByTagName('script'); return a[a.length-1]; })();
  var site = s && s.getAttribute('data-site');
  var endpoint = (s && s.src ? s.src.replace(/\\/n\\.js.*$/, '') : '') + '/api/pixel';
  function param(name){ var m = w.location.search.match(new RegExp('[?&]' + name + '=([^&]+)')); return m ? decodeURIComponent(m[1]) : null; }
  function cookie(name){ var m = d.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)')); return m ? decodeURIComponent(m[1]) : null; }
  var clickId = param('${CLICK_QUERY_PARAM}') || cookie('${CLICK_COOKIE}');
  if (clickId) { try { w.localStorage.setItem('${BRAND.key}_click', clickId); } catch (e) {} }
  else { try { clickId = w.localStorage.getItem('${BRAND.key}_click'); } catch (e) {} }
  var visitorId; try { visitorId = w.localStorage.getItem('${BRAND.key}_vid'); if (!visitorId) { visitorId = Math.random().toString(36).slice(2) + Date.now().toString(36); w.localStorage.setItem('${BRAND.key}_vid', visitorId); } } catch (e) {}
  function send(type, props){
    if (!site) return;
    props = props || {};
    var body = JSON.stringify({ site: site, type: type, clickId: clickId || null, visitorId: visitorId || null, value: typeof props.value === 'number' ? props.value : undefined, orderId: props.order_id ? String(props.order_id) : undefined });
    try { if (navigator.sendBeacon) { navigator.sendBeacon(endpoint, new Blob([body], { type: 'application/json' })); return; } } catch (e) {}
    try { fetch(endpoint, { method: 'POST', body: body, headers: { 'Content-Type': 'application/json' }, keepalive: true }); } catch (e) {}
  }
  function handle(args){ if (args[0] === 'track' && args[1]) send(args[1], args[2]); }
  var queued = (w.${BRAND.pixelGlobal} && w.${BRAND.pixelGlobal}.q) || [];
  w.${BRAND.pixelGlobal} = function(){ handle(arguments); };
  w.${BRAND.pixelGlobal}.q = [];
  for (var i = 0; i < queued.length; i++) handle(queued[i]);
  send('visit');
})();`;

export function GET() {
  return new Response(SCRIPT, {
    headers: { "Content-Type": "application/javascript; charset=utf-8", "Cache-Control": "public, max-age=300" },
  });
}
