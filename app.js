(()=>{const tg=window.Telegram&&window.Telegram.WebApp?window.Telegram.WebApp:null;if(tg){tg.ready();tg.expand();try{tg.setHeaderColor('#0b1118');tg.setBackgroundColor('#0b1118')}catch(_){}}const $=id=>document.getElementById(id);const emptyState=$('emptyState'),youtubeWrap=$('youtubeWrap'),youtubeFrame=$('youtubeFrame'),directWrap=$('directWrap'),video=$('video'),webWrap=$('webWrap'),webFrame=$('webFrame'),webNote=$('webNote'),webSafetyToggle=$('webSafetyToggle'),errorBox=$('errorBox'),modeBadge=$('modeBadge'),urlInput=$('urlInput'),focusExit=$('focusExit');let hls=null,currentMode='empty',webSafe=false,currentWebSrc='';
function hideAll(){emptyState.classList.add('hidden');youtubeWrap.classList.add('hidden');directWrap.classList.add('hidden');webWrap.classList.add('hidden');webSafetyToggle.classList.add('hidden');errorBox.classList.add('hidden');errorBox.textContent='';if(hls){try{hls.destroy()}catch(_){}hls=null}try{video.pause();video.removeAttribute('src');video.load()}catch(_){}youtubeFrame.removeAttribute('src');webFrame.removeAttribute('src')}
function showError(msg){hideAll();errorBox.textContent=msg;errorBox.classList.remove('hidden');modeBadge.textContent='Lỗi';currentMode='error'}
function youtubeId(input){try{const u=new URL(input);const host=u.hostname.replace(/^www\./,'').replace(/^m\./,'');if(host==='youtu.be')return u.pathname.split('/').filter(Boolean)[0]||null;if(host.endsWith('youtube.com')){if(u.pathname==='/watch')return u.searchParams.get('v');const m=u.pathname.match(/^\/(?:shorts|live|embed)\/([^/?#]+)/);if(m)return m[1]}}catch(_){}return null}
function isDirect(input){try{const u=new URL(input);return /\.(m3u8|mp4|webm|m4v|mov)(?:$|[?#])/i.test(u.pathname+u.search)}catch(_){return false}}
function openYoutube(id){if(!/^[A-Za-z0-9_-]{6,20}$/.test(id||''))return showError('Video ID YouTube không hợp lệ.');hideAll();youtubeFrame.src='https://www.youtube.com/embed/'+encodeURIComponent(id)+'?playsinline=1&rel=0';youtubeWrap.classList.remove('hidden');modeBadge.textContent='YouTube';currentMode='youtube'}
function openDirect(src){hideAll();directWrap.classList.remove('hidden');modeBadge.textContent='Clean Player';currentMode='direct';if(/\.m3u8(?:$|[?#])/i.test(src)){if(video.canPlayType('application/vnd.apple.mpegurl')){video.src=src}else if(window.Hls&&Hls.isSupported()){hls=new Hls({enableWorker:true,lowLatencyMode:true});hls.loadSource(src);hls.attachMedia(video);hls.on(Hls.Events.ERROR,(_,data)=>{if(data&&data.fatal)showError('Không phát được HLS: '+(data.type||'unknown error'))})}else{return showError('Thiết bị/WebView này không hỗ trợ HLS.')}}else{video.src=src}video.play().catch(()=>{})}
function applyWebSafety(reload=true){
  if(webSafe){
    webFrame.setAttribute('sandbox','allow-scripts allow-same-origin allow-forms allow-presentation allow-modals');
    webSafetyToggle.textContent='🛡️ Safe Web';
    webNote.textContent='Safe Web: chặn phần lớn popup/chuyển hướng ngoài; một số player/fullscreen có thể bị giới hạn.';
    modeBadge.textContent='Safe Web';
  }else{
    webFrame.removeAttribute('sandbox');
    webSafetyToggle.textContent='🔓 Full Web';
    webNote.textContent='Full Web: không sandbox để ưu tiên player và fullscreen. Popup/chuyển hướng của website có thể xuất hiện.';
    modeBadge.textContent='Full Web';
  }
  if(reload&&currentWebSrc){
    webFrame.src='about:blank';
    setTimeout(()=>{webFrame.src=currentWebSrc},0);
  }
}
function openWeb(src){
  hideAll();
  currentWebSrc=src;
  webSafe=false;
  applyWebSafety(false);
  webFrame.src=src;
  webWrap.classList.remove('hidden');
  webSafetyToggle.classList.remove('hidden');
  currentMode='web';
}
function openAny(input){input=(input||'').trim();if(!/^https:\/\//i.test(input))return showError('Mini App chỉ mở URL HTTPS.');urlInput.value=input;const yid=youtubeId(input);if(yid)return openYoutube(yid);if(isDirect(input))return openDirect(input);return openWeb(input)}
function decodeStartParam(token){try{let s=(token||'').replace(/-/g,'+').replace(/_/g,'/');while(s.length%4)s+='=';const bytes=Uint8Array.from(atob(s),c=>c.charCodeAt(0));return new TextDecoder().decode(bytes)}catch(_){return null}}
function loadQuery(){const startParam=tg&&tg.initDataUnsafe?tg.initDataUnsafe.start_param:null;if(startParam){const decoded=decodeStartParam(startParam);if(decoded&&/^https:\/\//i.test(decoded))return openAny(decoded)}const p=new URLSearchParams(location.search),mode=p.get('mode'),v=p.get('v'),src=p.get('src');if(mode==='youtube'&&v)return openYoutube(v);if((mode==='direct'||mode==='web')&&src){try{return mode==='direct'?openDirect(src):openWeb(src)}catch(_){return showError('URL media không hợp lệ.')}}emptyState.classList.remove('hidden')}
async function requestJarvisFullscreen(){
  document.body.classList.add('focus-mode');
  try{window.scrollTo(0,0)}catch(_){}
  if(tg){
    try{tg.expand()}catch(_){}
    try{if(typeof tg.disableVerticalSwipes==='function')tg.disableVerticalSwipes()}catch(_){}
    try{if(typeof tg.requestFullscreen==='function'&&!tg.isFullscreen)tg.requestFullscreen()}catch(_){}
  }
}
function exitJarvisFullscreen(){
  document.body.classList.remove('focus-mode');
  if(tg){
    try{if(typeof tg.enableVerticalSwipes==='function')tg.enableVerticalSwipes()}catch(_){}
    try{if(typeof tg.exitFullscreen==='function'&&tg.isFullscreen)tg.exitFullscreen()}catch(_){}
  }
}
$('openBtn').addEventListener('click',()=>openAny(urlInput.value));
urlInput.addEventListener('keydown',e=>{if(e.key==='Enter')openAny(urlInput.value)});
$('closeBtn').addEventListener('click',()=>tg?tg.close():history.back());
$('playPause').addEventListener('click',()=>{if(currentMode==='direct'){if(video.paused)video.play().catch(()=>{});else video.pause()}});
$('back10').addEventListener('click',()=>{if(currentMode==='direct'&&Number.isFinite(video.currentTime))video.currentTime=Math.max(0,video.currentTime-10)});
$('forward10').addEventListener('click',()=>{if(currentMode==='direct'&&Number.isFinite(video.currentTime))video.currentTime+=10});
$('fullscreen').addEventListener('click',requestJarvisFullscreen);
webSafetyToggle.addEventListener('click',()=>{if(currentMode!=='web')return;webSafe=!webSafe;applyWebSafety(true)});
focusExit.addEventListener('click',exitJarvisFullscreen);
loadQuery()})();