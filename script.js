(function () {
  var p = document.getElementById('polaroid');
  if (!p) return;
  var btn = p.querySelector('.tape');
  var hint = p.querySelector('.hint');
  var front = p.querySelector('.front');
  var back = p.querySelector('.back');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  var busy = false;

  p.classList.add('live');
  btn.hidden = false;
  hint.hidden = false;

  function apply(flipped) {
    p.classList.toggle('flipped', flipped);
    btn.setAttribute('aria-pressed', String(flipped));
    btn.setAttribute('aria-label', flipped
      ? 'Peel the tape to flip back to the photo'
      : 'Peel the tape to flip the photo over');
    front.setAttribute('aria-hidden', String(flipped));
    back.setAttribute('aria-hidden', String(!flipped));
    hint.hidden = true;
  }

  btn.addEventListener('click', function () {
    if (busy) return;
    var next = !p.classList.contains('flipped');
    if (reduce.matches) { apply(next); return; }
    busy = true;
    p.classList.add('peeling');
    setTimeout(function () { apply(next); }, 320);
    setTimeout(function () { p.classList.remove('peeling'); busy = false; }, 950);
  });
})();
