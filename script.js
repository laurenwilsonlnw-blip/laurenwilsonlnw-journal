(function () {
  /* Existing polaroid flip interaction */
  var p = document.getElementById('polaroid');
  if (p) {
    var btn = p.querySelector('.tape');
    var hint = p.querySelector('.hint');
    var front = p.querySelector('.front');
    var back = p.querySelector('.back');
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    var busy = false;

    p.classList.add('live');
    if (btn) btn.hidden = false;
    if (hint) hint.hidden = false;

    function apply(flipped) {
      p.classList.toggle('flipped', flipped);
      if (btn) {
        btn.setAttribute('aria-pressed', String(flipped));
        btn.setAttribute('aria-label', flipped
          ? 'Peel the tape to flip back to the photo'
          : 'Peel the tape to flip the photo over');
      }
      if (front) front.setAttribute('aria-hidden', String(flipped));
      if (back) back.setAttribute('aria-hidden', String(!flipped));
      if (hint) hint.hidden = true;
    }

    if (btn) {
      btn.addEventListener('click', function () {
        if (busy) return;
        var next = !p.classList.contains('flipped');
        if (reduce.matches) { apply(next); return; }
        busy = true;
        p.classList.add('peeling');
        setTimeout(function () { apply(next); }, 320);
        setTimeout(function () { p.classList.remove('peeling'); busy = false; }, 950);
      });
    }
  }

  /* Spiral notebook portfolio gallery */
  var gallery = document.getElementById('portfolioGallery');
  if (!gallery) return;

  var image = document.getElementById('galleryImage');
  var label = document.getElementById('galleryLabel');
  var note = document.getElementById('galleryNote');
  var dots = document.getElementById('galleryDots');
  var prev = document.querySelector('.gallery-arrow.prev');
  var next = document.querySelector('.gallery-arrow.next');
  var turn = gallery.querySelector('.page-turn');
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var current = 0;
  var images = [];
  var busy = false;

  function titleFromFile(name) {
    return name
      .replace(/\.[^.]+$/, '')
      .replace(/[-_]+/g, ' ')
      .replace(/\b\w/g, function (letter) { return letter.toUpperCase(); });
  }

  function show(index, animate) {
    if (!images.length) return;
    current = (index + images.length) % images.length;

    if (animate && !reduceMotion.matches) {
      turn.classList.remove('flipping');
      void turn.offsetWidth;
      turn.classList.add('flipping');
    }

    image.src = images[current].url;
    image.alt = images[current].alt || titleFromFile(images[current].name);
    label.textContent = images[current].title;
    note.textContent = images[current].note || 'A closer look at Lauren\'s work.';

    Array.prototype.forEach.call(dots.children, function (dot, i) {
      dot.setAttribute('aria-selected', String(i === current));
    });
  }

  function buildDots() {
    dots.innerHTML = '';
    images.forEach(function (item, i) {
      var dot = document.createElement('button');
      dot.className = 'gallery-dot';
      dot.type = 'button';
      dot.setAttribute('role', 'tab');
      dot.setAttribute('aria-label', 'Show ' + item.title);
      dot.setAttribute('aria-selected', String(i === 0));
      dot.addEventListener('click', function () { show(i, true); });
      dots.appendChild(dot);
    });
  }

  function fallback() {
    images = [{
      url: 'img/portfolio-01.jpg',
      name: 'portfolio image',
      title: 'Portfolio',
      note: 'Add your portfolio images to the img folder to fill the notebook.'
    }];
    buildDots();
    show(0, false);
    image.addEventListener('error', function () {
      image.removeAttribute('src');
      image.alt = 'Portfolio images will appear here';
      label.textContent = 'Your work goes here';
      note.textContent = 'Add image files to the img folder and they will appear in this notebook.';
    }, { once: true });
  }

  fetch('https://api.github.com/repos/laurenwilsonlnw-blip/laurenwilsonlnw-journal/contents/img')
    .then(function (response) {
      if (!response.ok) throw new Error('Image folder unavailable');
      return response.json();
    })
    .then(function (files) {
      images = files
        .filter(function (file) { return file.type === 'file' && /\.(jpe?g|png|gif|webp|avif|svg)$/i.test(file.name); })
        .map(function (file) {
          return {
            url: file.download_url,
            name: file.name,
            title: titleFromFile(file.name),
            note: 'A closer look at Lauren\'s work.'
          };
        });

      if (!images.length) {
        fallback();
        return;
      }

      buildDots();
      show(0, false);
    })
    .catch(fallback);

  function move(direction) {
    if (busy || !images.length) return;
    busy = true;
    show(current + direction, true);
    setTimeout(function () {
      busy = false;
      turn.classList.remove('flipping');
    }, reduceMotion.matches ? 0 : 850);
  }

  prev.addEventListener('click', function () { move(-1); });
  next.addEventListener('click', function () { move(1); });

  gallery.addEventListener('keydown', function (event) {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      move(-1);
    }
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      move(1);
    }
  });

  image.addEventListener('load', function () {
    image.style.opacity = '1';
  });

  image.style.opacity = '1';
})();