// Intersection Observer para animar elementos ao aparecer no ecrã
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, { threshold: 0.2 });

document.querySelectorAll('.fade-in, .slide-up, .design-img, .about-img').forEach(el => {
  observer.observe(el);
});

// Fallback for about image: if the external file is missing, replace with an inline SVG placeholder
document.querySelectorAll('.about-img').forEach(img => {
  img.addEventListener('error', () => {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="500" viewBox="0 0 800 500">
      <rect width="100%" height="100%" fill="#012147" />
      <text x="50%" y="50%" fill="#7aafff" font-family="Poppins, sans-serif" font-size="20" text-anchor="middle" dominant-baseline="middle">Imagem indisponível</text>
    </svg>`;
    img.src = 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
  });
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
