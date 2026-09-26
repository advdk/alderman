/* Alderman: languages.
   The game is written in English. For another language, this file translates what the page shows:
   a MutationObserver looks at every text node and at aria-label / placeholder / title as they appear,
   and swaps in the translation (exact phrases first, then patterns for sentences with numbers and names).
   Anything without a translation stays English, so a missing phrase never breaks the game.
   1.0.2: German for menus, buttons and dialogs. Letters, events and the chronicle follow in 1.0.3.
   Mark an element with data-noi18n to leave it alone (player-typed names, letters). */
(function(){
  const PREF_KEY='alderman-prefs', LANGS={en:'English',de:'Deutsch'};
  let pref=''; try{ pref=(JSON.parse(localStorage.getItem(PREF_KEY)||'{}').lang)||''; }catch(e){}
  const nav=((navigator.languages&&navigator.languages[0])||navigator.language||'en').toLowerCase();
  const lang = LANGS[pref] ? pref : (nav.startsWith('de') ? 'de' : 'en');
  const DEde = lang==='de';

  /* ---------- word lists ---------- */
  const GOOD={Grain:'Getreide',Herring:'Hering',Beer:'Bier',Salt:'Salz',Timber:'Holz',Cloth:'Tuch',Iron:'Eisen',Wine:'Wein',Furs:'Pelze'};
  const SHIP={Snaikka:'Snaikka',Cog:'Kogge',Hulk:'Holk'};
  const TIER={Stranger:'Fremder','Known trader':'Bekannter Händler',Respected:'Angesehen',Burgher:'Bürger'};
  const EVENT={'Church festival':'Kirchweih','Hard winter':'Harter Winter','Newcomers':'Zuzug','Poor harvest':'Missernte',
    'Shipbuilding':'Schiffbau','Great fire':'Großer Brand','Hanseatic diet':'Hansetag','Herring shoals':'Heringsschwärme'};
  const cap=s=>s.charAt(0).toUpperCase()+s.slice(1);
  const look=(map,s)=>map[s]||map[cap(s)]||map[Object.keys(map).find(k=>k.toLowerCase()===s.toLowerCase())]||s;
  const g=s=>look(GOOD,s), sh=s=>look(SHIP,s), tier=s=>look(TIER,s);
  const pl=(n,one,many)=>(+n===1?one:many);
  const The=x=>x.startsWith('Convoy of the ')?'Der Konvoi der '+x.slice(14):'Die '+x;

  /* ---------- exact phrases ---------- */
  const DE={
    // title screen, header, bars
    'Unrolling the chart…':'Die Karte wird entrollt…', 'A Hanseatic Trading Tale':'Eine hansische Handelsgeschichte',
    'Continue':'Weiter', 'Begin':'Beginnen', 'New season':'Neue Saison', 'Begin anew':'Neu beginnen', 'Keep my season':'Meine Saison behalten',
    'Settings':'Einstellungen', 'Hall of fame':'Ruhmeshalle', 'Your first season is waiting in Lübeck.':'Deine erste Saison wartet in Lübeck.',
    'Your purse':'Deine Börse', 'Game speed and settings':'Spieltempo und Einstellungen', 'Open the chronicle':'Chronik öffnen', 'Game':'Spiel',
    'Close':'Schließen', 'Sea chart':'Seekarte', 'Fleet':'Flotte', 'Town':'Stadt', 'Cancel':'Abbrechen',
    'Honoured master,':'Verehrter Herr,', 'Your obedient factor,':'Euer ergebener Faktor,', 'Back to the Kontor':'Zurück ins Kontor',
    // town signs
    'Town hall':'Rathaus', 'Market hall':'Markthalle', 'Your warehouse':'Dein Lagerhaus', 'Warehouse for sale':'Lagerhaus zu verkaufen',
    'Shipyard':'Werft', 'Tavern':'Schenke', 'Market':'Markt', 'Warehouse':'Lagerhaus',
    // market
    'Trading with':'Handel mit', 'With':'Mit', 'Lots of':'Menge', 'Lot size':'Menge', 'Max':'Max',
    'Every barrel moves the price.':'Jedes Fass bewegt den Preis.', 'Average price per barrel, total below.':'Durchschnittspreis je Fass, darunter die Summe.',
    'None of your ships lies in port here and you have no warehouse, so there is nothing to load or unload.':'Keines deiner Schiffe liegt hier im Hafen, und du hast kein Lagerhaus. Es gibt nichts zu laden oder zu löschen.',
    'needed now':'jetzt gefragt', 'made':'hergestellt', 'wanted':'begehrt', 'Buy':'Kaufen', 'Sell':'Verkaufen', 'Purse':'Börse',
    // ship, convoy, fleet
    'Voyage progress':'Fortschritt der Reise', 'The hold is empty.':'Der Laderaum ist leer.', 'Trade route':'Handelsroute', 'Set sail…':'Segel setzen…',
    'Change course…':'Kurs ändern…', 'Show on the chart':'Auf der Karte zeigen', 'Sail together':'Gemeinsam segeln',
    'Join ships in the same port into a convoy: one hold to trade with, one order to sail.':'Fasse Schiffe im selben Hafen zu einem Konvoi zusammen: ein Laderaum für den Handel, ein Befehl zum Auslaufen.',
    'Leave the convoy':'Konvoi verlassen', 'Disband the convoy':'Konvoi auflösen', 'Each ship keeps its own cargo.':'Jedes Schiff behält seine Ladung.',
    'Add to the convoy':'Zum Konvoi hinzufügen', 'Convoy…':'Konvoi…', 'Your fleet':'Deine Flotte', 'One ship':'Ein Schiff', 'leads':'führt',
    'Your path to alderman and the standing of the merchant houses are kept at the town hall.':'Dein Weg zum Aldermann und die Rangfolge der Handelshäuser stehen im Rathaus.',
    'moments':'wenigen Augenblicken',
    // town hall
    'The council keeps the rolls of the Hanse: who trades, who prospers, and who might one day sit among the aldermen.':'Der Rat führt die Rollen der Hanse: wer handelt, wer gedeiht und wer eines Tages unter den Aldermännern sitzen könnte.',
    'Town news':'Stadtnachrichten', 'Now':'Jetzt', 'Your standing':'Dein Ansehen', 'the top':'die Spitze',
    'Trade here, and sell what the town wants.':'Handle hier und verkaufe, was die Stadt begehrt.',
    'The highest standing a merchant can hold here.':'Das höchste Ansehen, das ein Kaufmann hier erreichen kann.',
    'Your title':'Dein Titel', 'Alderman of the Hanse':'Aldermann der Hanse', 'Your path':'Dein Weg', 'The Baltic is yours to enjoy.':'Die Ostsee gehört dir.',
    'Merchants of the Hanse':'Kaufleute der Hanse', 'You':'Du', 'Your house':'Dein Haus',
    'Fortune counts money, ships, warehouses and goods at what they cost.':'Das Vermögen zählt Geld, Schiffe, Lagerhäuser und Waren zum Einkaufspreis.',
    // route
    'Under way':'Unterwegs', 'Plan a route':'Route planen', 'no warehouse':'kein Lagerhaus', 'Remove':'Entfernen', 'Unload':'Löschen', 'Load':'Laden',
    'Everything':'Alles', 'Add a stop':'Halt hinzufügen', 'Stop the route':'Route anhalten', 'Start the route':'Route starten',
    'The convoy sails these stops in order, round and round. At each stop it unloads into your warehouse, then loads from it. Your managers do the buying and selling.':'Der Konvoi läuft diese Häfen der Reihe nach an, immer im Kreis. An jedem Halt löscht er in dein Lagerhaus und lädt dann daraus. Deine Verwalter kaufen und verkaufen.',
    'The ship sails these stops in order, round and round. At each stop it unloads into your warehouse, then loads from it. Your managers do the buying and selling.':'Das Schiff läuft diese Häfen der Reihe nach an, immer im Kreis. An jedem Halt löscht es in dein Lagerhaus und lädt dann daraus. Deine Verwalter kaufen und verkaufen.',
    // chronicle
    'The chronicle':'Die Chronik', 'Coming up':'Demnächst', 'Written down':'Aufgezeichnet', 'No entries yet.':'Noch keine Einträge.', 'in moments':'gleich',
    // warehouse and manager
    'Price':'Preis', 'Buy the warehouse':'Lagerhaus kaufen', 'Store':'Einlagern', 'Trading manager':'Verwalter', 'Orders':'Aufträge',
    'No one hired':'Niemand eingestellt', 'Hire':'Einstellen',
    'No ship of yours is in port, so nothing can be moved in or out. You can still trade from the warehouse in the market hall.':'Keines deiner Schiffe liegt im Hafen, also kann nichts ein- oder ausgelagert werden. In der Markthalle kannst du trotzdem aus dem Lagerhaus handeln.',
    'The warehouse is empty, and so is the hold.':'Das Lagerhaus ist leer, der Laderaum auch.',
    'Off':'Aus', 'On':'An', 'Less':'Weniger', 'More':'Mehr', 'Stock up to (barrels)':'Auffüllen bis (Fässer)', 'Pay at most (mk)':'Höchstens zahlen (mk)',
    'Keep in store (barrels)':'Im Lager behalten (Fässer)', 'Sell for at least (mk)':'Mindestens erzielen (mk)',
    'Once a day your manager buys into the warehouse or sells out of it, within these limits and as far as your purse allows.':'Einmal am Tag kauft dein Verwalter ins Lagerhaus ein oder verkauft daraus, in diesen Grenzen und soweit deine Börse reicht.',
    'Purse reserve':'Rücklage', 'He never spends below this, and always leaves three days of wages on top.':'Darunter gibt er nie aus, und er lässt immer drei Tageslöhne obendrauf.',
    'Back to the warehouse':'Zurück zum Lagerhaus', 'Dismiss':'Entlassen', 'Keep him':'Behalten', 'Dismiss the manager':'Verwalter entlassen',
    // shipyard
    'The shipwrights take your order, and the new ship is launched here when she is ready. She comes without a crew.':'Die Schiffbauer nehmen deinen Auftrag an. Das neue Schiff läuft hier vom Stapel, sobald es fertig ist, noch ohne Mannschaft.',
    'On the slipway':'Auf der Helling', 'quick and nimble':'schnell und wendig', 'the workhorse of the Hanse':'das Arbeitspferd der Hanse',
    'slow, but holds nearly twice a cog':'langsam, fasst aber fast doppelt so viel wie eine Kogge',
    // tavern
    'Crew for':'Mannschaft für', 'None of your ships lies in port here. Sailors can only be hired onto a ship at the quay.':'Keines deiner Schiffe liegt hier im Hafen. Seeleute heuern nur auf einem Schiff am Kai an.',
    'No sailors are looking for work today. More turn up every day.':'Heute sucht kein Seemann Arbeit. Jeden Tag kommen neue.',
    'Hire 1':'1 anheuern', 'Hire 5':'5 anheuern', 'Fill the crew':'Mannschaft auffüllen', 'Let 1 go':'1 entlassen', 'Let 5 go':'5 entlassen',
    // end of season, hall of fame
    'The house is bankrupt':'Das Haus ist bankrott', 'Your seasons':'Deine Saisons', 'See the season leaderboard':'Rangliste der Saison ansehen',
    'Keep trading':'Weiterhandeln', 'Begin a new season':'Neue Saison beginnen',
    'You may close the season and begin again, or keep trading. Your result is already in the hall of fame, and it will improve if your fortune grows.':'Du kannst die Saison abschließen und neu beginnen oder weiterhandeln. Dein Ergebnis steht schon in der Ruhmeshalle und wird besser, wenn dein Vermögen wächst.',
    'Leaderboard':'Rangliste', 'Season':'Saison', 'Result':'Ergebnis', 'Alderman on day':'Aldermann am Tag', 'Fortune':'Vermögen', 'House':'Haus',
    'Alderman':'Aldermann', 'Bankrupt':'Bankrott', 'Retired':'Beendet',
    'Everyone in a season sails the same Baltic. The fastest aldermen lead, then the richest houses.':'In einer Saison segeln alle auf derselben Ostsee. Vorn stehen die schnellsten Aldermänner, dann die reichsten Häuser.',
    'Fetching the rolls from the Diet…':'Die Rollen werden vom Hansetag geholt…',
    'This season was played at a test pace, so it will not be ranked.':'Diese Saison lief im Testtempo und wird nicht gewertet.',
    'The rolls of the Diet cannot be reached right now. Your results are kept and sent when you are back online.':'Die Rollen des Hansetags sind gerade nicht erreichbar. Deine Ergebnisse bleiben erhalten und werden gesendet, sobald du wieder online bist.',
    'No season has ended yet. Finished seasons are kept here, even after you start again.':'Noch keine Saison ist beendet. Abgeschlossene Saisons bleiben hier, auch wenn du neu beginnst.',
    // settings
    'The Kontor':'Das Kontor', 'Game speed':'Spieltempo', 'Pause':'Pause', 'Normal speed':'Normales Tempo', 'Double speed':'Doppeltes Tempo', 'Four times speed':'Vierfaches Tempo',
    'At 1× a day passes in a little over a minute.':'Bei 1× vergeht ein Tag in gut einer Minute.', 'Paused: look around as you like; orders wait.':'Pausiert: Schau dich in Ruhe um, Befehle warten.',
    'Language':'Sprache', 'Menus and buttons. Letters and news follow in the next update.':'Menüs und Schaltflächen. Briefe und Nachrichten folgen mit dem nächsten Update.',
    'Music':'Musik', 'Harbour airs by day and night, the sea chart, winter and feast days.':'Hafenweisen bei Tag und Nacht, die Seekarte, Winter und Festtage.',
    'Sound effects':'Geräusche', 'Surf, gulls, rain and the noon bell.':'Brandung, Möwen, Regen und die Mittagsglocke.',
    'Keep the screen on':'Bildschirm anlassen', 'The screen does not dim or lock while the game is open.':'Der Bildschirm wird nicht dunkel und sperrt nicht, solange das Spiel offen ist.',
    'Notifications':'Benachrichtigungen', 'Sent by the app while the game is closed.':'Von der App gesendet, während das Spiel geschlossen ist.',
    'Sent by the Android app while the game is closed. Not available in the browser.':'Von der Android-App gesendet, während das Spiel geschlossen ist. Im Browser nicht verfügbar.',
    'Arrivals':'Ankünfte', 'Trade routes':'Handelsrouten', 'Money':'Geld', 'Tap to choose which news reaches you.':'Tippe an, welche Nachrichten dich erreichen.',
    'A ship you sent makes port':'Ein ausgesandtes Schiff erreicht den Hafen', 'A route completes a round, or pauses':'Eine Route schließt eine Runde ab oder hält an',
    'Festivals, hard winters, your standing':'Feste, harte Winter, dein Ansehen', 'Debt warnings and bankruptcy':'Schuldenwarnungen und Bankrott',
    'A new ship is launched':'Ein neues Schiff läuft vom Stapel',
    'Title screen':'Titelbild', 'Continue, new season, hall of fame.':'Weiter, neue Saison, Ruhmeshalle.', 'Back to the title':'Zum Titelbild',
    'The name shown on the leaderboard.':'Der Name in der Rangliste.', 'House name':'Name des Hauses',
    'You are alderman. Keep trading to raise your fortune.':'Du bist Aldermann. Handle weiter, um dein Vermögen zu mehren.',
    'End season':'Saison beenden', 'End the season':'Saison beenden', 'Keep playing':'Weiterspielen', 'End this season':'Diese Saison beenden',
    'Your result goes into the hall of fame, and a new season begins.':'Dein Ergebnis kommt in die Ruhmeshalle, und eine neue Saison beginnt.',
    'Delete everything?':'Alles löschen?', 'Your leaderboard entries, the cloud copy, your sign-in and the season on this device are removed for good.':'Deine Ranglisteneinträge, die Cloud-Kopie, deine Anmeldung und die Saison auf diesem Gerät werden endgültig entfernt.',
    'Delete it all':'Alles löschen', 'Keep it':'Behalten', 'Delete my data':'Meine Daten löschen',
    'Removes your leaderboard entries, cloud save and sign-in, and starts over.':'Entfernt deine Ranglisteneinträge, den Cloud-Spielstand und die Anmeldung und beginnt von vorn.',
    'Delete…':'Löschen…', 'Privacy':'Datenschutz',
    'Connecting to the cloud…':'Verbindung zur Cloud…',
    'Offline: saved on this device only. It will be copied to the cloud when you are back online.':'Offline: nur auf diesem Gerät gespeichert. Sobald du online bist, wird es in die Cloud kopiert.',
    'Copied to the cloud for this browser.':'Für diesen Browser in die Cloud kopiert.',
    'Link a Google account so a cleared browser or a new device cannot lose it.':'Verknüpfe ein Google-Konto, damit ein geleerter Browser oder ein neues Gerät nichts verliert.',
    'Another season is saved in the cloud':'In der Cloud ist eine andere Saison gespeichert', 'Loading it replaces the season on this device.':'Laden ersetzt die Saison auf diesem Gerät.',
    'Load the cloud season':'Cloud-Saison laden', 'Keep this one':'Diese behalten', 'Your season is safe':'Deine Saison ist sicher',
    'Link Google account':'Google-Konto verknüpfen', 'Save file':'Speicherdatei', 'Keep a copy of this season, or bring one from another device.':'Sichere eine Kopie dieser Saison oder hole eine von einem anderen Gerät.',
    'Download':'Herunterladen', 'Load file':'Datei laden',
    // naming the house
    'A new house':'Ein neues Haus', 'Name your trading house':'Benenne dein Handelshaus',
    'This is the name the Diet of the Hanse will know you by. Other houses see it on the leaderboard.':'Unter diesem Namen kennt dich der Hansetag. Andere Häuser sehen ihn in der Rangliste.',
    'Open the Kontor':'Kontor eröffnen', 'You can change it later in Settings.':'Du kannst ihn später in den Einstellungen ändern.',
    'A house needs a name of at least two letters.':'Ein Haus braucht einen Namen aus mindestens zwei Buchstaben.',
    'Keep the name to 32 letters or fewer.':'Höchstens 32 Buchstaben, bitte.', 'Use letters, numbers, spaces and simple punctuation only.':'Nur Buchstaben, Ziffern, Leerzeichen und einfache Satzzeichen.',
    'Web addresses are not allowed in house names.':'Webadressen sind in Hausnamen nicht erlaubt.', 'Please choose a different name.':'Bitte wähle einen anderen Namen.',
    'The Diet of the Hanse would not enrol that name. Please choose another.':'Diesen Namen würde der Hansetag nicht eintragen. Bitte wähle einen anderen.',
    // toasts
    'Time is paused. Tap the date, then choose a speed to give orders again.':'Die Zeit ruht. Tippe auf das Datum und wähle ein Tempo, um wieder Befehle zu geben.',
    'Paused. Look around as you like; orders wait until time moves again.':'Pausiert. Schau dich in Ruhe um; Befehle warten, bis die Zeit weiterläuft.',
    'Time moves again.':'Die Zeit läuft weiter.', 'A route has at most four stops.':'Eine Route hat höchstens vier Halte.',
    'Your season was loaded from the cloud.':'Deine Saison wurde aus der Cloud geladen.', 'Another season is saved in the cloud. See Settings.':'In der Cloud ist eine andere Saison gespeichert. Siehe Einstellungen.',
    'Signed in with your Google account.':'Mit deinem Google-Konto angemeldet.', 'Linked. Your season is now kept with your Google account.':'Verknüpft. Deine Saison liegt jetzt bei deinem Google-Konto.',
    'The Google account could not be linked. Try again later.':'Das Google-Konto konnte nicht verknüpft werden. Versuche es später noch einmal.',
    'The cloud season is loaded.':'Die Cloud-Saison ist geladen.', 'Season saved to a file.':'Saison in eine Datei gespeichert.',
    'This save is from a newer version of Alderman.':'Dieser Spielstand stammt aus einer neueren Version von Alderman.', 'That file is not an Alderman save.':'Diese Datei ist kein Alderman-Spielstand.',
    'That file could not be read.':'Die Datei konnte nicht gelesen werden.',
    'Your save comes from a newer version of Alderman. It is kept aside; reload the newest version to continue it.':'Dein Spielstand stammt aus einer neueren Version von Alderman. Er wird aufbewahrt; lade die neueste Version, um weiterzuspielen.',
  };
  Object.assign(DE, GOOD, SHIP, TIER, EVENT);

  /* ---------- patterns (whole trimmed text; first match wins) ---------- */
  const RX=[
    [/^Paused · (.+)$/, m=>`Pausiert · ${m[1]}`],
    [/^In debt · (\d+) days? left$/, m=>`Verschuldet · noch ${m[1]} ${pl(m[1],'Tag','Tage')}`],
    [/^Open the chronicle, (\d+) new$/, m=>`Chronik öffnen, ${m[1]} neu`],
    [/^New course: tap a port for the (.+)$/, m=>`Neuer Kurs: Tippe auf einen Hafen für die ${m[1]}`],
    [/^Tap a port for the (.+)$/, m=>`Tippe auf einen Hafen für die ${m[1]}`],
    [/^Season (\d+) · (.+) · (.+ mk) · (\d+) ships?$/, m=>`Saison ${m[1]} · ${m[2]} · ${m[3]} · ${m[4]} ${pl(m[4],'Schiff','Schiffe')}`],
    [/^Season (\d+) ended in bankruptcy\.$/, m=>`Saison ${m[1]} endete im Bankrott.`],
    [/^This ends season (\d+)\. Your result goes into the hall of fame\.$/, m=>`Damit endet Saison ${m[1]}. Dein Ergebnis kommt in die Ruhmeshalle.`],
    // market
    [/^(\d+) in town$/, m=>`${m[1]} in der Stadt`], [/^(\d+) aboard$/, m=>`${m[1]} an Bord`], [/^, paid (\d+)$/, m=>`, gekauft zu ${m[1]}`],
    [/^Buy (\d+)$/, m=>`Kauf ${m[1]}`], [/^Sell (\d+)$/, m=>`Verkauf ${m[1]}`],
    [/^(Buy|Sell) one (.+) for (\d+) mark$/, m=>`${m[1]==='Buy'?'Kaufe':'Verkaufe'} ein Fass ${g(m[2])} für ${m[3]} Mark`],
    [/^(Buy|Sell) (\d+) (.+) for (.+) mark in all, about (\d+) each$/, m=>`${m[1]==='Buy'?'Kaufe':'Verkaufe'} ${m[2]} Fass ${g(m[3])} für zusammen ${m[4]} Mark, etwa ${m[5]} je Fass`],
    [/^(Buy|Sell) (\S+)$/, m=>GOOD[m[2]]?`${m[1]==='Buy'?'Kaufe':'Verkaufe'} ${g(m[2])}`:null],
    [/^(.+)’s hold$/, m=>`Laderaum der ${m[1]}`],
    [/^(Bought|Sold) (\d+) (.+) for (.+) mk \(about (\d+) each\)\. The (asking|offered) price (rose|fell) from (\d+) to (\d+)\.$/,
      m=>`${m[2]} ${g(m[3])} ${m[1]==='Bought'?'gekauft':'verkauft'} für ${m[4]} mk (etwa ${m[5]} je Fass). Der ${m[6]==='asking'?'Kaufpreis':'Verkaufspreis'} ${m[7]==='rose'?'stieg':'fiel'} von ${m[8]} auf ${m[9]}.`],
    // ships and status
    [/^(\d+) barrels$/, m=>`${m[1]} Fässer`], [/^(\d+) \/ (\d+) barrels$/, m=>`${m[1]} / ${m[2]} Fässer`],
    [/^(\d+) ships$/, m=>`${m[1]} Schiffe`], [/^(\d+) ship$/, m=>`${m[1]} Schiff`], [/^(\d+) convoys?$/, m=>`${m[1]} ${pl(m[1],'Konvoi','Konvois')}`],
    [/^Convoy$/, ()=>'Konvoi'], [/^In the hold$/, ()=>'Im Laderaum'],
    [/^Crew (\d+) \/ (\d+)$/, m=>`Mannschaft ${m[1]} / ${m[2]}`], [/^speed (\d+)%$/, m=>`Tempo ${m[1]} %`],
    [/^needs (\d+) to sail$/, m=>`braucht ${m[1]} zum Auslaufen`], [/^wages (\d+) mk a day$/, m=>`Heuer ${m[1]} mk am Tag`],
    [/^(\d+) mk a day$/, m=>`${m[1]} mk am Tag`], [/^(\d+) standing orders?$/, m=>`${m[1]} ${pl(m[1],'Dauerauftrag','Daueraufträge')}`],
    [/^On its trade route \((.+)\)$/, m=>`Auf seiner Handelsroute (${m[1]})`],
    [/^Bound for (.+)$/, m=>`Unterwegs nach ${m[1]}`], [/^Arrives in$/, ()=>'Ankunft in'], [/^Moored at (.+)$/, m=>`Liegt in ${m[1]}`],
    [/^Enter (.+)$/, m=>`Nach ${m[1]}`], [/^Convoy with the Convoy of the (.+)$/, m=>`Konvoi mit dem Konvoi der ${m[1]}`], [/^Convoy with the (.+)$/, m=>`Konvoi mit der ${m[1]}`],
    [/^Convoy of the (.+)$/, m=>`Konvoi der ${m[1]}`],
    [/^The convoy sails at the pace of its slowest ship(?: \((\d+) leagues a day\))?, and trades as one hold$/, m=>`Der Konvoi segelt im Tempo seines langsamsten Schiffs${m[1]?` (${m[1]} Meilen am Tag)`:''} und handelt mit einem gemeinsamen Laderaum`],
    // town hall
    [/^The Rathaus of (.+)$/, m=>`Das Rathaus von ${m[1]}`], [/^until (.+)$/, m=>`bis ${m[1]}`], [/^from (.+)$/, m=>`ab ${m[1]}`], [/^From (.+)$/, m=>`Ab ${m[1]}`],
    [/^Towards the top$/, ()=>'Auf dem höchsten Stand'], [/^Towards (.+)$/, m=>`Nächste Stufe: ${tier(m[1])}`],
    [/^Elected on (.+)$/, m=>`Gewählt am ${m[1]}`],
    [/^Burgher in (\d+) towns$/, m=>`Bürger in ${m[1]} Städten`], [/^(\d+) of (\d+)$/, m=>`${m[1]} von ${m[2]}`],
    [/^A fortune of (.+) mk$/, m=>`Ein Vermögen von ${m[1]} mk`], [/^of (.+)$/, m=>`aus ${m[1]}`],
    [/^(.+): whereabouts unknown$/, m=>`${m[1]}: Verbleib unbekannt`],
    // route
    [/^Remove (.+)$/, m=>`${m[1]} entfernen`],
    [/^Routes run between your own warehouses\. You have one only in (.+); buy a warehouse in another town first\.$/, m=>`Routen verbinden deine eigenen Lagerhäuser. Du hast nur eines in ${m[1]==='no town'?'keiner Stadt':m[1]}; kaufe zuerst ein Lagerhaus in einer anderen Stadt.`],
    // chronicle
    [/^in (\d+) min$/, m=>`in ${m[1]} Min.`], [/^in ([\d.]+) h$/, m=>`in ${m[1].replace('.',',')} Std.`],
    // warehouse and manager
    [/^The guild sells only to a (.+) or better\.$/, m=>`Die Gilde verkauft nur an Kaufleute mit dem Ansehen „${tier(m[1])}“ oder höher.`],
    [/^A brick warehouse on the harbour street, with a hoist and room for (\d+) barrels\. Keep goods here until prices suit you\. Later, a trading manager will work from it\.$/, m=>`Ein Backsteinspeicher an der Hafenstraße, mit Winde und Platz für ${m[1]} Fässer. Lagere hier Waren, bis die Preise passen. Später kann ein Verwalter von hier aus handeln.`],
    [/^You need (.+) mk more\.$/, m=>`Dir fehlen noch ${m[1]} mk.`],
    [/^Warehouse (\d+)$/, m=>`Lagerhaus ${m[1]}`],
    [/^A manager buys and sells from this warehouse every day, following your orders\. (\d+) mk a day\.$/, m=>`Ein Verwalter kauft und verkauft jeden Tag aus diesem Lagerhaus, nach deinen Aufträgen. ${m[1]} mk am Tag.`],
    [/^Managers work only for a (.+) merchant\.$/, m=>`Verwalter arbeiten nur für Kaufleute mit dem Ansehen „${tier(m[1])}“.`],
    [/^Move goods between the (.+) and the warehouse\. To buy or sell from the warehouse, choose it in the market hall\.$/, m=>`Bewege Waren zwischen der ${m[1]} und dem Lagerhaus. Um aus dem Lagerhaus zu kaufen oder zu verkaufen, wähle es in der Markthalle.`],
    [/^In store (\d+)$/, m=>`Im Lager ${m[1]}`], [/^town buys at (\d+), sells at (\d+)$/, m=>`Stadt kauft zu ${m[1]}, verkauft zu ${m[2]}`],
    [/^(.+) order$/, m=>`Auftrag ${g(m[1])}`], [/^Orders for (.+)$/, m=>`Aufträge für ${m[1]}`], [/^Dismiss (.+)\?$/, m=>`${m[1]} entlassen?`],
    // shipyard
    [/^The (snaikka|cog|hulk) (.+)$/, m=>`${m[1]==='hulk'?'Der Holk':'Die '+sh(m[1])} ${m[2]}`],
    [/^(\d+) days to build$/, m=>`${m[1]} Tage Bauzeit`], [/^(\d+)–(\d+) sailors$/, m=>`${m[1]}–${m[2]} Seeleute`],
    [/^Order the (.+)$/, m=>`Die ${m[1]} bestellen`],
    [/^The shipwrights of (.+) build only for a (.+) or better\.$/, m=>`Die Schiffbauer von ${m[1]} bauen nur für Kaufleute mit dem Ansehen „${tier(m[2])}“ oder höher.`],
    // tavern
    [/^Fill the crew \((\d+)\)$/, m=>`Mannschaft auffüllen (${m[1]})`],
    [/^(\d+) sailors? (?:are|is) drinking here, looking for a berth\.$/, m=>`${m[1]} ${pl(m[1],'Seemann trinkt','Seeleute trinken')} hier und ${pl(m[1],'sucht','suchen')} eine Heuer.`],
    [/^At least (\d+) sailors to sail\. More sailors, a faster ship, up to (\d+)\. Wages are (\d+) mk per sailor per day, paid every day\.$/, m=>`Mindestens ${m[1]} Seeleute zum Auslaufen. Mehr Seeleute, schnelleres Schiff, bis zu ${m[2]}. Die Heuer beträgt ${m[3]} mk je Seemann und Tag, täglich gezahlt.`],
    [/^The (.+) needs at least (\d+) sailors\. Hire them at the tavern\.$/, m=>`${The(m[1])} braucht mindestens ${m[2]} Seeleute. Heuere sie in der Schenke an.`],
    // end, hall of fame
    [/^Season (\d+)$/, m=>`Saison ${m[1]}`], [/^Season (\d+) leaderboard$/, m=>`Rangliste Saison ${m[1]}`],
    [/^The Diet of the Hanse has elected you alderman, after (\d+) days of trading\. Your fortune stands at (.+) mk\.$/, m=>`Der Hansetag hat dich nach ${m[1]} Handelstagen zum Aldermann gewählt. Dein Vermögen beträgt ${m[2]} mk.`],
    [/^You stayed in debt for (\d+) days\. The bankers of Lübeck have seized your ships and warehouses to settle what you owed\.$/, m=>`Du warst ${m[1]} Tage verschuldet. Die Bankiers von Lübeck haben deine Schiffe und Lagerhäuser gepfändet, um deine Schulden zu begleichen.`],
    [/^No house has finished season (\d+) yet\. Be the first on the rolls\.$/, m=>`Noch kein Haus hat Saison ${m[1]} beendet. Sei das erste in den Rollen.`],
    [/^Your house appears here when season (\d+) ends or you become alderman\.$/, m=>`Dein Haus erscheint hier, wenn Saison ${m[1]} endet oder du Aldermann wirst.`],
    // settings, cloud, naming
    [/^Become alderman of the Hanse: Burgher in (\d+) towns and a fortune of (.+) mk\.$/, m=>`Werde Aldermann der Hanse: Bürger in ${m[1]} Städten und ein Vermögen von ${m[2]} mk.`],
    [/^End season (\d+) and begin a new one\?$/, m=>`Saison ${m[1]} beenden und eine neue beginnen?`],
    [/^Kept with your Google account(?: \((.+)\))?\.$/, m=>`Bei deinem Google-Konto gesichert${m[1]?` (${m[1]})`:''}.`],
    [/^Last copy (.+)\.$/, m=>`Letzte Kopie ${m[1]}.`],
    [/^Season (\d+), day (\d+), saved (.+)$/, m=>`Saison ${m[1]}, Tag ${m[2]}, gespeichert ${m[3]}`],
    [/^e\.g\. (.+)$/, m=>`z. B. ${m[1]}`], [/^Alderman (\d+\.\d+\.\d+.*)$/, m=>`Alderman ${m[1]}`],
    [/^Your house is now known as (.+)\.$/, m=>`Dein Haus heißt nun ${m[1]}.`],
    [/^Season (\d+) loaded from the file\.$/, m=>`Saison ${m[1]} aus der Datei geladen.`],
    // map toasts
    [/^The (.+) is already bound for (.+)\.$/, m=>`${The(m[1])} ist schon unterwegs nach ${m[2]}.`],
    [/^No clear water to (.+) from here\.$/, m=>`Von hier gibt es kein freies Fahrwasser nach ${m[1]}.`],
    [/^The (.+) is already in (.+)\.$/, m=>`${The(m[1])} liegt schon in ${m[2]}.`],
    [/^None of your ships lies in (.+)\.$/, m=>`Keines deiner Schiffe liegt in ${m[1]}.`],
    [/^The (.+) belongs to (.+) of (.+)\.$/, m=>`Die ${m[1]} gehört ${m[2]} aus ${m[3]}.`],
    [/^The (.+) changed course for (.+?)\.?$/, m=>`${The(m[1])} ändert den Kurs nach ${m[2]}.`],
    [/^The (.+) weighed anchor for (.+?)\.?$/, m=>`${The(m[1])} lichtet den Anker nach ${m[2]}.`],
    [/^The (.+) will stop its trade route (?:when it reaches (.+)|here)$/, m=>`${The(m[1])} beendet ihre Handelsroute ${m[2]?'in '+m[2]:'hier'}.`],
    [/^(.+) now manages your warehouse in (.+)$/, m=>`${m[1]} verwaltet jetzt dein Lagerhaus in ${m[2]}.`],
    [/^(.+) no longer manages your warehouse in (.+)$/, m=>`${m[1]} verwaltet dein Lagerhaus in ${m[2]} nicht mehr.`],
    [/^You bought a warehouse in (.+) for (.+) mk$/, m=>`Du hast ein Lagerhaus in ${m[1]} für ${m[2]} mk gekauft.`],
    [/^You ordered the (snaikka|cog|hulk) (.+) from the shipyard of (.+), to be launched on (.+)$/, m=>`Bestellt: ${m[1]==='hulk'?'der Holk':'die '+sh(m[1])} ${m[2]} bei der Werft von ${m[3]}, Stapellauf am ${m[4]}.`],
    [/^In (.+)$/, m=>`In ${m[1]}`],
    [/^· (.+)$/, m=>{ const r=phrase(m[1]); return r==null?null:'· '+r; }],
  ];

  const memo=new Map();
  function core(s){
    if(DE[s]!=null) return DE[s];
    for(const [re,f] of RX){ const m=s.match(re); if(m){ const r=f(m); if(r!=null&&r!==s) return r; } }
    return null;
  }
  // Whole phrase, else split into sentences, else into " · " parts; English stays where nothing matches.
  function phrase(s){
    let r=core(s); if(r!=null) return r;
    if(/\. /.test(s)){ const parts=s.split(/(?<=\.) /); if(parts.length>1){ const out=parts.map(p=>core(p)??core(p.replace(/\.$/,''))?.concat('.')??p); if(out.some((o,i)=>o!==parts[i])) return out.join(' '); } }
    if(s.includes(' · ')){ const parts=s.split(' · '), out=parts.map(p=>core(p)??p); if(out.some((o,i)=>o!==parts[i])) return out.join(' · '); }
    if(/\.$/.test(s)){ r=core(s.slice(0,-1)); if(r!=null) return r+'.'; }
    if(/ ·$/.test(s)){ r=phrase(s.slice(0,-2)); if(r!=null) return r+' ·'; }
    return null;
  }
  function tr(s){
    if(!DEde||!s||!/[A-Za-z]/.test(s)) return s;
    if(memo.has(s)) return memo.get(s);
    const m=s.match(/^(\s*)([\s\S]*?)(\s*)$/); const r=phrase(m[2]); const out=r==null?s:m[1]+r+m[3];
    if(memo.size>4000) memo.clear(); memo.set(s,out); return out;
  }

  /* ---------- the page ---------- */
  const ATTRS=['aria-label','placeholder','title'];
  const skip=el=>!el||!!(el.closest&&el.closest('[data-noi18n],script,style,textarea,#lBody'));
  function trText(n){ if(skip(n.parentElement)) return; const v=n.nodeValue, t=tr(v); if(t!==v) n.nodeValue=t; }
  function trAttrs(el){ for(const a of ATTRS){ const v=el.getAttribute&&el.getAttribute(a); if(v){ const t=tr(v); if(t!==v) el.setAttribute(a,t); } } }
  function apply(root){
    if(!DEde||!root) return;
    if(root.nodeType===3){ trText(root); return; }
    if(root.nodeType!==1||skip(root)) return;
    trAttrs(root);
    const w=document.createTreeWalker(root, NodeFilter.SHOW_TEXT|NodeFilter.SHOW_ELEMENT, { acceptNode:n=>n.nodeType===1&&skip(n)?NodeFilter.FILTER_REJECT:NodeFilter.FILTER_ACCEPT });
    let n; while((n=w.nextNode())){ if(n.nodeType===3) trText(n); else trAttrs(n); }
  }
  if(DEde){
    document.documentElement.lang='de';
    apply(document.body);
    new MutationObserver(muts=>{ for(const m of muts){
      if(m.type==='childList') m.addedNodes.forEach(apply);
      else if(m.type==='characterData') trText(m.target);
      else if(m.type==='attributes') trAttrs(m.target);
    } }).observe(document.body,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:ATTRS});
  }

  const MONTHS={ en:['January','February','March','April','May','June','July','August','September','October','November','December'],
    de:['Januar','Februar','März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember'] };
  window.I18N={ lang, langs:LANGS, locale:DEde?'de-DE':'en-GB', months:MONTHS[lang], t:tr, apply,
    dateStr:(d,m,y)=>DEde?`${d}. ${MONTHS.de[m]} ${y}`:`${d} ${MONTHS.en[m]} ${y}`,
    shortDate:(d,m)=>DEde?`${d}. ${MONTHS.de[m].slice(0,3)}`:`${d} ${MONTHS.en[m].slice(0,3)}` };
})();
