/* 
Einfaches Drag & Drop für Elemente mit der Klasse ".tasse".
- Nur JavaScript (kein HTML / kein CSS hier).
- Das Script macht das Element beweglich per Maus und Touch (Pointer Events).
- Falls das Element keine position-Eigenschaft hat, setzt das Script position: absolute,
  damit es frei auf der Seite verschoben werden kann.
- Keine Gestaltung, nur Funktionalität.
*/

(function () {
  // Unterstütze mehrere .tasse-Elemente
  const elements = document.querySelectorAll('.tasse');
  if (!elements.length) return;

  elements.forEach(makeDraggable);

  function makeDraggable(el) {
    // Sicherstellen, dass das Element positionierbar ist
    const computed = window.getComputedStyle(el);
    if (computed.position === 'static' || !computed.position) {
      el.style.position = 'absolute';
      // Wenn das Element noch keine left/top hat, setzen wir aktuelle Position
      const rect = el.getBoundingClientRect();
      el.style.left = (rect.left + window.scrollX) + 'px';
      el.style.top  = (rect.top  + window.scrollY) + 'px';
    }

    // Verhindere Textauswahl beim Ziehen
    el.style.touchAction = el.style.touchAction || 'none';
    el.style.userSelect  = el.style.userSelect  || 'none';

    let dragging = false;
    let startX = 0, startY = 0;      // Start des Pointers (Dokument-Koordinaten)
    let origLeft = 0, origTop = 0;  // Ursprungs-Left/Top in px (Dokument-Koordinaten)

    // Pointer-Down (Maus- oder Touch-Start)
    function onPointerDown(e) {
      // Nur Haupttaste bei Maus
      if (e.pointerType === 'mouse' && e.button !== 0) return;

      dragging = true;
      el.setPointerCapture && el.setPointerCapture(e.pointerId);

      startX = e.pageX;
      startY = e.pageY;

      // parseInt fallback, falls "auto" o.ä.
      origLeft = parseFloat(el.style.left)  || el.getBoundingClientRect().left + window.scrollX;
      origTop  = parseFloat(el.style.top)   || el.getBoundingClientRect().top  + window.scrollY;

      // optional: bring element to front while dragging
      el.style.zIndex = (parseInt(el.style.zIndex) || 0) + 1000;

      // verhindern, dass Seite während Drag scrollt (bei Touchgeräten)
      e.preventDefault();
    }

    function onPointerMove(e) {
      if (!dragging) return;
      const dx = e.pageX - startX;
      const dy = e.pageY - startY;

      el.style.left = (origLeft + dx) + 'px';
      el.style.top  = (origTop  + dy) + 'px';
    }

    function onPointerUp(e) {
      if (!dragging) return;
      dragging = false;
      el.releasePointerCapture && el.releasePointerCapture(e.pointerId);
      // zIndex wieder zurücksetzen (klein)
      el.style.zIndex = '';
    }

    // Event-Listener (pointer events decken Maus, Touch und Stift ab)
    el.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointercancel', onPointerUp);
  }
})();



/* 
Ergänzendes Script zu Drag & Drop:
- Prüft während des Bewegens und beim Loslassen, ob sich das Element mit der Klasse ".tasse"
  (auch nur teilweise) innerhalb eines Elements mit der Klasse ".drop-ziel" befindet.
- Wenn ja, erhält dieses .drop-ziel-Element die Klasse ".hat-Tasse".
- Befindet sich die .tasse anschließend nicht mehr darin, wird die Klasse wieder entfernt.
- Elemente (.drop-ziel) können überall auf der Seite sein (auch via bottom / right positioniert).
- Einfacher Code, keine Gestaltung.
*/
(function () {
  const tasse = document.querySelector('.tasse');
  const zielElemente = document.querySelectorAll('.drop-ziel');
  if (!tasse || !zielElemente.length) return;

  tasse.addEventListener('pointermove', checkPosition);
  tasse.addEventListener('pointerup', checkPosition);

  function checkPosition() {
    const tRect = tasse.getBoundingClientRect();

    zielElemente.forEach(z => {
      const zRect = z.getBoundingClientRect();
      const überlappt = !(
        tRect.right < zRect.left ||
        tRect.left > zRect.right ||
        tRect.bottom < zRect.top ||
        tRect.top > zRect.bottom
      );

      if (überlappt) {
        if (!z.classList.contains('hat-tasse')) {
          z.classList.add('hat-tasse');

          // Audio suchen und abspielen
          const audio = z.querySelector('audio');
          if (audio) {
            audio.currentTime = 0; // optional: von Anfang starten
            audio.play().catch(err => console.warn('Audio konnte nicht abgespielt werden:', err));
          }
        }
      } else {
        z.classList.remove('hat-tasse');
      }
    });
  }
})();
