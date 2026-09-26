/* Alderman — Android app glue (Capacitor). Does nothing in a normal browser.
   Provides:
   - window.KoggeNative: the notification bridge game.js already speaks to
     (cancelAll / scheduleNotifications / requestPermission), backed by Local Notifications.
   - window.AldermanNative.googleIdToken(): native Google sign-in (Credential Manager) for Cloud.linkGoogle,
     because Google refuses its sign-in page inside embedded web views.
   - Back button: closes the open letter or dialog, otherwise sends the app to the background.
   - App pause/resume: tells the game, so it saves and schedules notifications. */
(function(){
  'use strict';
  const C = window.Capacitor;
  if(!C || !C.isNativePlatform || !C.isNativePlatform()) return;
  const P = C.Plugins, LN = P.LocalNotifications, App = P.App;
  const CHANNEL = 'kontor';
  let queue = Promise.resolve(), channelReady = null, asked = false;
  const later = fn => { queue = queue.then(fn).catch(e => console.warn('notifications:', e)); return queue; };
  const channel = () => channelReady || (channelReady = LN.createChannel({ id:CHANNEL, name:'News from the Kontor', description:'Arrivals, trade routes, town news and money matters', importance:3, visibility:1 }).catch(()=>{}));

  if(LN) window.KoggeNative = {
    async requestPermission(){
      try{ const p = await LN.checkPermissions(); if(p.display === 'prompt' || p.display === 'prompt-with-rationale'){ asked = true; await LN.requestPermissions(); } }catch(e){}
    },
    cancelAll(){
      later(async()=>{ const r = await LN.getPending(); if(r.notifications.length) await LN.cancel({ notifications:r.notifications.map(n=>({ id:n.id })) }); });
    },
    scheduleNotifications(json){
      const list = JSON.parse(json || '[]'); if(!list.length) return;
      later(async()=>{
        const p = await LN.checkPermissions(); if(p.display !== 'granted') return;
        await channel();
        await LN.schedule({ notifications:list.map(n=>({ id:n.id, title:n.title, body:n.body, channelId:CHANNEL,
          smallIcon:'ic_stat_alderman', iconColor:'#d2a957', isExactNotification:false,
          schedule:{ at:new Date(n.atMs), allowWhileIdle:true } })) });
      });
    },
  };

  const FA = P.FirebaseAuthentication;
  window.AldermanNative = {
    // Returns a Google ID token for the Firebase web SDK, or null if the player backed out.
    async googleIdToken(){
      if(!FA) throw new Error('Google sign-in is not available in this build.');
      const r = await FA.signInWithGoogle({ skipNativeAuth:true });
      return r && r.credential ? r.credential.idToken : null;
    },
  };

  // Full screen: hide Android's navigation bar (a swipe from the edge shows it for a moment).
  const immersive = () => { try{ P.SystemBars && P.SystemBars.hide({ bar:'NavigationBar' }); }catch(e){} };
  immersive();

  if(App){
    App.addListener('appStateChange', s => { try{ if(s.isActive) immersive(); s.isActive ? window.koggeForeground && window.koggeForeground() : window.koggeBackground && window.koggeBackground(); }catch(e){} });
    App.addListener('backButton', () => {
      const open = id => { const el = document.getElementById(id); return el && !el.hidden; };
      if(open('letterWrap') || open('dlgWrap')) document.dispatchEvent(new KeyboardEvent('keydown', { key:'Escape', bubbles:true }));
      else App.minimizeApp();
    });
  }
})();
