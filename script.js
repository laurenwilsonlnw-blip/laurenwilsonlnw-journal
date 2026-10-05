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

  /* Spiral binder portfolio gallery */
  var gallery = document.getElementById('portfolioGallery');
  if (!gallery) return;

  var leftImage = document.getElementById('leftImage');
  var rightImage = document.getElementById('rightImage');
  var leftLabel = document.getElementById('leftLabel');
  var rightLabel = document.getElementById('rightLabel');
  var flipSheet = document.getElementById('flipSheet');
  var flipFrontImage = document.getElementById('flipFrontImage');
  var flipBackImage = document.getElementById('flipBackImage');
  var flipFrontLabel = document.getElementById('flipFrontLabel');
  var flipBackLabel = document.getElementById('flipBackLabel');
  var dots = document.getElementById('galleryDots');
  var prev = document.querySelector('.gallery-arrow.prev');
  var next = document.querySelector('.gallery-arrow.next');
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  var modal = document.getElementById('imageModal');
  var modalImage = document.getElementById('modalImage');
  var modalTitle = document.getElementById('modalTitle');
  var modalClose = document.getElementById('modalClose');

  var images = [];
  var current = 0;
  var busy = false;
  var lastFocused = null;

  function mod(value, length) {
    return ((value % length) + length) % length;
  }

  function titleFromFile(name) {
    return name
      .replace(/\.[^.]+$/, '')
      .replace(/[-_]+/g, ' ')
      .replace(/\b\w/g, function (letter) { return letter.toUpperCase(); });
  }

  function imageItem(index) {
    if (!images.length) return null;
    return images[mod(index, images.length)];
  }

  function paintImage(img, item) {
    if (!item) return;
    img.src = item.url;
    img.alt = item.alt || item.title;
  }

  function renderSpread() {
    var left = imageItem(current);
    var right = imageItem(current + 1);

    paintImage(leftImage, left);
    paintImage(rightImage, right);

    leftLabel.textContent = left ? left.title : '';
    rightLabel.textContent = right ? right.title : '';

    Array.prototype.forEach.call(dots.children, function (dot, i) {
      dot.setAttribute('aria-selected', String(i === current));
    });
  }

  function setFlipPage(frontItem, backItem) {
    paintImage(flipFrontImage, frontItem);
    paintImage(flipBackImage, backItem);
    flipFrontLabel.textContent = frontItem ? frontItem.title : '';
    flipBackLabel.textContent = backItem ? backItem.title : '';
  }

  function buildDots() {
    dots.innerHTML = '';
    images.forEach(function (item, i) {
      var dot = document.createElement('button');
      dot.className = 'gallery-dot';
      dot.type = 'button';
      dot.setAttribute('role', 'tab');
      dot.setAttribute('aria-label', 'Open ' + item.title);
      dot.setAttribute('aria-selected', String(i === current));
      dot.addEventListener('click', function () {
        if (busy || i === current || !images.length) return;
        current = i;
        renderSpread();
      });
      dots.appendChild(dot);
    });
  }

  function move(direction) {
    if (busy || !images.length) return;

    if (images.length === 1) {
      openModal(images[0]);
      return;
    }

    var frontIndex;
    var backIndex;

    if (direction > 0) {
      frontIndex = current + 1;
      backIndex = current + 2;
      flipSheet.className = 'flip-sheet';
      setFlipPage(imageItem(frontIndex), imageItem(backIndex));
      void flipSheet.offsetWidth;
      flipSheet.classList.add('flip-next');
    } else {
      frontIndex = current;
      backIndex = current - 1;
      flipSheet.className = 'flip-sheet flip-prev';
      setFlipPage(imageItem(frontIndex), imageItem(backIndex));
      void flipSheet.offsetWidth;
      flipSheet.classList.add('flip-prev');
    }

    busy = true;

    var finish = function () {
      current = mod(current + direction, images.length);
      renderSpread();
      flipSheet.className = 'flip-sheet';
      busy = false;
    };

    if (reduceMotion.matches) {
      finish();
    } else {
      window.setTimeout(finish, 920);
    }
  }

  function openModal(item) {
    if (!item) return;

    lastFocused = document.activeElement;
    modalImage.src = item.url;
    modalImage.alt = item.alt || item.title;
    modalTitle.textContent = item.title;
    modal.hidden = false;
    document.body.style.overflow = 'hidden';
    modalClose.focus();
  }

  function closeModal() {
    modal.hidden = true;
    modalImage.removeAttribute('src');
    document.body.style.overflow = '';
    if (lastFocused && typeof lastFocused.focus === 'function') {
      lastFocused.focus();
    }
  }

  document.getElementById('leftImageButton').addEventListener('click', function () {
    openModal(imageItem(current));
  });

  document.getElementById('rightImageButton').addEventListener('click', function () {
    openModal(imageItem(current + 1));
  });

  modalClose.addEventListener('click', closeModal);
  modal.querySelector('[data-close-modal]').addEventListener('click', closeModal);

  document.addEventListener('keydown', function (event) {
    if (!modal.hidden && event.key === 'Escape') {
      event.preventDefault();
      closeModal();
      return;
    }

    if (!modal.hidden) return;

    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      move(-1);
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      move(1);
    }
  });

  function fallback() {
    images = [];
    dots.innerHTML = '';
    leftLabel.textContent = 'Add portfolio images';
    rightLabel.textContent = 'Add portfolio images';
    leftImage.removeAttribute('src');
    rightImage.removeAttribute('src');
    leftImage.alt = 'Add portfolio images to the img folder';
    rightImage.alt = 'Add portfolio images to the img folder';
    flipSheet.className = 'flip-sheet';
  }

  fetch('https://api.github.com/repos/laurenwilsonlnw-blip/laurenwilsonlnw-journal/contents/img')
    .then(function (response) {
      if (!response.ok) throw new Error('Image folder unavailable');
      return response.json();
    })
    .then(function (files) {
      images = files
        .filter(function (file) {
          return file.type === 'file' && /\.(jpe?g|png|gif|webp|avif|svg)$/i.test(file.name);
        })
        .map(function (file) {
          return {
            url: file.download_url,
            name: file.name,
            title: titleFromFile(file.name),
            alt: titleFromFile(file.name)
          };
        });

      if (!images.length) {
        fallback();
        return;
      }

      current = 0;
      buildDots();
      renderSpread();
    })
    .catch(fallback);

  prev.addEventListener('click', function () { move(-1); });
  next.addEventListener('click', function () { move(1); });

  /* Keep the visible page images crisp and uncropped. */
  [leftImage, rightImage, flipFrontImage, flipBackImage].forEach(function (img) {
    img.addEventListener('error', function () {
      img.alt = 'Portfolio image could not be loaded';
    });
  });
})();