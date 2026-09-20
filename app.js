(()=>{const tg=window.Telegram&&window.Telegram.WebApp?window.Telegram.WebApp:null;if(tg){tg.ready();tg.expand();try{tg.setHeaderColor('#0b1118');tg.setBackgroundColor('#0b1118')}catch(_){}}const $=id=>document.getElementById(id);const emptyState=$('emptyState'),youtubeWrap=$('youtubeWrap'),youtubeFrame=$('youtubeFrame'),directWrap=$('directWrap'),video=$('video'),webWrap=$('webWrap'),webFrame=$('webFrame'),errorBox=$('errorBox'),modeBadge=$('modeBadge'),urlInput=$('urlInput');let hls=null,currentMode='empty';
function hideAll(){emptyState.classList.add('hidden');youtubeWrap.classList.add('hidden');directWrap.classList.add('hidden');webWrap.classList.add('hidden');errorBox.classList.add('hidden');errorBox.textContent='';if(hls){try{hls.destroy()}catch(_){}hls=null}try{video.pause();video.removeAttribute('src');video.load()}catch(_){}youtubeFrame.removeAttribute('src');webFrame.removeAttribute('src')}
function showError(msg){hideAll();errorBox.textContent=msg;errorBox.classList.remove('hidden');modeBadge.textContent='Lỗi';currentMode='error'}
function youtubeId(input){try{const u=new URL(input);const host=u.hostname.replace(/^www\./,'').replace(/^m\./,'');if(host==='youtu.be')return u.pathname.split('/').filter(Boolean)[0]||null;if(host.endsWith('youtube.com')){if(u.pathname==='/watch')return u.searchParams.get('v');const m=u.pathname.match(/^\/(?:shorts|live|embed)\/([^/?#]+)/);if(m)return m[1]}}catch(_){}return null}
function isDirect(input){try{const u=new URL(input);return /\.(m3u8|mp4|webm|m4v|mov)(?:$|[?#])/i.test(u.pathname+u.search)}catch(_){return false}}
function openYoutube(id){if(!/^[A-Za-z0-9_-]{6,20}$/.test(id||''))return showError('Video ID YouTube không hợp lệ.');hideAll();youtubeFrame.src='https://www.youtube.com/embed/'+encodeURIComponent(id)+'?playsinline=1&rel=0';youtubeWrap.classList.remove('hidden');modeBadge.textContent='YouTube';currentMode='youtube'}
function openDirect(src){hideAll();directWrap.classList.remove('hidden');modeBadge.textContent='Clean Player';currentMode='direct';if(/\.m3u8(?:$|[?#])/i.test(src)){if(video.canPlayType('application/vnd.apple.mpegurl')){video.src=src}else if(window.Hls&&Hls.isSupported()){hls=new Hls({enableWorker:true,lowLatencyMode:true});hls.loadSource(src);hls.attachMedia(video);hls.on(Hls.Events.ERROR,(_,data)=>{if(data&&data.fatal)showError('Không phát được HLS: '+(data.type||'unknown error'))})}else{return showError('Thiết bị/WebView này không hỗ trợ HLS.')}}else{video.src=src}video.play().catch(()=>{})}
function openWeb(src){hideAll();webFrame.src=src;webWrap.classList.remove('hidden');modeBadge.textContent='Safe Web';currentMode='web'}
function openAny(input){input=(input||'').trim();if(!/^https:\/\//i.test(input))return showError('Mini App chỉ mở URL HTTPS.');urlInput.value=input;const yid=youtubeId(input);if(yid)return openYoutube(yid);if(isDirect(input))return openDirect(input);return openWeb(input)}
function loadQuery(){const p=new URLSearchParams(location.search),mode=p.get('mode'),v=p.get('v'),src=p.get('src');if(mode==='youtube'&&v)return openYoutube(v);if((mode==='direct'||mode==='web')&&src){try{return mode==='direct'?openDirect(src):openWeb(src)}catch(_){return showError('URL media không hợp lệ.')}}emptyState.classList.remove('hidden')}
async function requestJarvisFullscreen(){
  let telegramRequested=false;
  if(tg){
    try{tg.expand()}catch(_){}
    try{
      if(typeof tg.disableVerticalSwipes==='function')tg.disableVerticalSwipes();
    }catch(_){}
    try{
      if(typeof tg.requestFullscreen==='function'){
        if(!tg.isFullscreen)tg.requestFullscreen();
        telegramRequested=true;
      }
    }catch(_){}
  }

  if(telegramRequested)return;

  const el=currentMode==='direct'?video:currentMode==='youtube'?youtubeFrame:currentMode==='web'?webFrame:null;
  if(el&&el.requestFullscreen){
    try{await el.requestFullscreen();return}catch(_){}
  }

  modeBadge.textContent='Fullscreen không hỗ trợ';
}
if(tg&&typeof tg.onEvent==='function'){
  try{
    tg.onEvent('fullscreenChanged',e=>{
      if(e&&e.is_fullscreen)modeBadge.textContent=currentMode==='empty'?'Toàn màn hình':modeBadge.textContent;
    });
    tg.onEvent('fullscreenFailed',()=>{
      const el=currentMode==='direct'?video:currentMode==='youtube'?youtubeFrame:currentMode==='web'?webFrame:null;
      if(el&&el.requestFullscreen){
        Promise.resolve(el.requestFullscreen()).catch(()=>{modeBadge.textContent='Fullscreen không hỗ trợ'});
      }else{
        modeBadge.textContent='Fullscreen không hỗ trợ';
      }
    });
  }catch(_){}
}
$('openBtn').addEventListener('click',()=>openAny(urlInput.value));urlInput.addEventListener('keydown',e=>{if(e.key==='Enter')openAny(urlInput.value)});$('closeBtn').addEventListener('click',()=>tg?tg.close():history.back());$('playPause').addEventListener('click',()=>{if(currentMode==='direct'){if(video.paused)video.play().catch(()=>{});else video.pause()}});$('back10').addEventListener('click',()=>{if(currentMode==='direct'&&Number.isFinite(video.currentTime))video.currentTime=Math.max(0,video.currentTime-10)});$('forward10').addEventListener('click',()=>{if(currentMode==='direct'&&Number.isFinite(video.currentTime))video.currentTime+=10});$('fullscreen').addEventListener('click',requestJarvisFullscreen);loadQuery()})();