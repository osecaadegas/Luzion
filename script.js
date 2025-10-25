// Intersection Observer para animar elementos ao aparecer no ecrã
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, { threshold: 0.2 });

document.querySelectorAll('.fade-in, .slide-up, .design-img, .about-img, .industry-img').forEach(el => {
  observer.observe(el);
});

// Generic inline SVG fallback generator
function svgFallback(text, w = 800, h = 500) {
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
      <rect width="100%" height="100%" fill="#012147" />
      <text x="50%" y="50%" fill="#7aafff" font-family="Poppins, sans-serif" font-size="20" text-anchor="middle" dominant-baseline="middle">${text}</text>
    </svg>
  `);
}

// Fallback handlers for images that may be missing
document.querySelectorAll('.about-img, .industry-img, .design-img, .vantagens-img').forEach(img => {
  img.addEventListener('error', () => {
    img.src = svgFallback('Imagem indisponível');
    // ensure animation still triggers
    img.classList.add('visible');
  });
  // in case image is already cached as missing, trigger error handler manually
  if (img.complete && img.naturalWidth === 0) {
    img.dispatchEvent(new Event('error'));
  }
});

// Smooth scroll para links do menu
document.querySelectorAll('.nav-links a').forEach(link => {
  link.addEventListener('click', e => {
    if (link.hash === '#contact') {
      e.preventDefault();
      document.getElementById('contact-popup').classList.add('active');
    } else if (link.hash) {
      e.preventDefault();
      document.querySelector(link.hash).scrollIntoView({ behavior: 'smooth' });
    }
  });
});

// Contact popup functionality
const popup = document.getElementById('contact-popup');
const closeButton = document.querySelector('.close-popup');

// Close popup when clicking the close button
closeButton.addEventListener('click', () => {
  popup.classList.remove('active');
});

// Close popup when clicking outside
popup.addEventListener('click', (e) => {
  if (e.target === popup) {
    popup.classList.remove('active');
  }
});

// Close popup with Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && popup.classList.contains('active')) {
    popup.classList.remove('active');
  }
});
