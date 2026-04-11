/**
 * RestaurantOS — shared UI helpers (toast, loading, mobile sidebar)
 */
(function () {
  function ensureLucide() {
    if (typeof lucide !== 'undefined' && lucide.createIcons) {
      lucide.createIcons();
    }
  }

  window.showToast = function (message, type) {
    type = type || 'success';
    const toast = document.createElement('div');
    toast.className =
      'ros-toast ros-toast--' +
      type +
      ' fixed top-4 right-4 z-[10000] max-w-sm flex items-center gap-3 px-4 py-3 rounded-2xl shadow-lg border border-gray-100 bg-white text-gray-900 text-sm font-medium animate-ros-toast-in';
    toast.setAttribute('role', 'status');

    const colors = {
      success: { border: '#10b981', icon: 'check-circle', iconClass: 'text-emerald-500' },
      error: { border: '#ef4444', icon: 'alert-circle', iconClass: 'text-red-500' },
      info: { border: '#4f46e5', icon: 'info', iconClass: 'text-indigo-500' },
    };
    const cfg = colors[type] || colors.info;

    toast.style.boxShadow = '0 10px 40px -10px rgba(15, 23, 42, 0.12)';
    toast.style.borderLeft = '4px solid ' + cfg.border;

    toast.innerHTML =
      '<i data-lucide="' +
      cfg.icon +
      '" class="w-5 h-5 shrink-0 ' +
      cfg.iconClass +
      '"></i><span class="leading-snug">' +
      escapeHtml(message) +
      '</span>';

    document.body.appendChild(toast);
    ensureLucide();

    requestAnimationFrame(function () {
      toast.classList.add('ros-toast--visible');
    });

    setTimeout(function () {
      toast.classList.remove('ros-toast--visible');
      toast.classList.add('ros-toast--out');
      setTimeout(function () {
        toast.remove();
      }, 280);
    }, 3200);
  };

  function escapeHtml(s) {
    const d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML;
  }

  window.setBtnLoading = function (btn, text) {
    if (!btn) return;
    text = text || 'Please wait…';
    btn.disabled = true;
    btn.dataset.rosOriginalHtml = btn.innerHTML;
    btn.innerHTML =
      '<span class="inline-flex items-center justify-center gap-2">' +
      '<svg class="animate-spin h-5 w-5 shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">' +
      '<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>' +
      '<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>' +
      '</svg><span>' +
      escapeHtml(text) +
      '</span></span>';
  };

  window.resetBtnLoading = function (btn) {
    if (!btn || !btn.dataset.rosOriginalHtml) return;
    btn.disabled = false;
    btn.innerHTML = btn.dataset.rosOriginalHtml;
    delete btn.dataset.rosOriginalHtml;
    ensureLucide();
  };

  window.initMobileSidebar = function () {
    const sidebar = document.querySelector('.sidebar');
    const toggle = document.querySelector('[data-sidebar-toggle]');
    const backdrop = document.querySelector('[data-sidebar-backdrop]');
    if (!sidebar || !toggle) return;

    function close() {
      sidebar.classList.remove('sidebar--open');
      if (backdrop) backdrop.classList.remove('sidebar-backdrop--visible');
      document.body.classList.remove('sidebar-open-body');
      toggle.setAttribute('aria-expanded', 'false');
    }

    function open() {
      sidebar.classList.add('sidebar--open');
      if (backdrop) backdrop.classList.add('sidebar-backdrop--visible');
      document.body.classList.add('sidebar-open-body');
      toggle.setAttribute('aria-expanded', 'true');
    }

    toggle.addEventListener('click', function () {
      if (sidebar.classList.contains('sidebar--open')) close();
      else open();
    });

    if (backdrop) {
      backdrop.addEventListener('click', close);
    }

    window.addEventListener(
      'resize',
      function () {
        if (window.innerWidth >= 1024) close();
      },
      { passive: true }
    );
  };

  document.addEventListener('DOMContentLoaded', function () {
    ensureLucide();
    initMobileSidebar();
  });
})();
