window.Rafael = window.Rafael || {};
window.Rafael.animations = {
  init: function () {
    document.querySelectorAll('[data-reveal]').forEach((el) => {
      el.classList.add('is-visible');
    });
  }
};
window.addEventListener('DOMContentLoaded', function () {
  if (window.Rafael && window.Rafael.animations) {
    window.Rafael.animations.init();
  }
});
