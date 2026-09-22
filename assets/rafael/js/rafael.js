window.Rafael = window.Rafael || {};

window.Rafael.init = function () {
  document.documentElement.classList.add('is-ready');
};

window.addEventListener('DOMContentLoaded', window.Rafael.init);
