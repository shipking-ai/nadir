// SPDX-License-Identifier: GPL-3.0-or-later
// Minimal stroke icon set (original, 24-grid). Static markup only — never interpolate page-supplied text here.
(function () {
  const P = {
    back: 'M15 5l-7 7 7 7',
    forward: 'M9 5l7 7-7 7',
    reload: 'M20 11a8 8 0 1 0-2.3 5.7M20 4v7h-7',
    stop: 'M6 6l12 12M18 6L6 18',
    plus: 'M12 5v14M5 12h14',
    close: 'M6 6l12 12M18 6L6 18',
    star: 'M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1 5.9L12 17l-5.2 2.7 1-5.9L3.5 9.7l5.9-.8z',
    shield: 'M12 3l7 3v5c0 4.5-3 8.2-7 10-4-1.8-7-5.5-7-10V6z',
    split: 'M4 5h16v14H4zM12 5v14',
    search: 'M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zM20 20l-4-4',
    lock: 'M7 11V8a5 5 0 0 1 10 0v3M6 11h12v9H6z',
    unlock: 'M7 11V8a5 5 0 0 1 9.5-2M6 11h12v9H6z',
    warn: 'M12 4l9 16H3zM12 10v4M12 17.5v.1',
    page: 'M7 3h7l4 4v14H7zM14 3v4h4',
    history: 'M4 12a8 8 0 1 0 2.3-5.7M4 5v5h5M12 8v4l3 2',
    download: 'M12 4v11M7 11l5 5 5-5M5 20h14',
    settings: 'M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6zM19 12l2-1.5-2-3.5-2.4.8-1.6-1L14.5 4h-4L10 6.8l-1.6 1L6 7l-2 3.5L6 12l-.1 1.5L4 15l2 3.5 2.4-.8 1.6 1 .5 2.3h4l.5-2.3 1.6-1 2.4.8 2-3.5-2-1.5z',
    sidebar: 'M4 5h16v14H4zM9 5v14',
    audio: 'M4 10v4h4l5 4V6L8 10zM16 9a4 4 0 0 1 0 6',
    moon: 'M20 14.5A8 8 0 1 1 9.5 4 6.5 6.5 0 0 0 20 14.5z',
    command: 'M9 6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3z',
    bookmark: 'M7 4h10v16l-5-4-5 4z',
    pin: 'M9 4h6l-1 6 3 3H7l3-3zM12 13v7',
    trash: 'M5 7h14M10 7V4h4v3M7 7l1 13h8l1-13',
    folder: 'M3 6h6l2 2h10v11H3z',
    external: 'M14 4h6v6M20 4l-9 9M18 14v6H4V6h6',
    check: 'M5 12.5l4.5 4.5L19 7.5',
    chevron: 'M9 6l6 6-6 6',
    globe: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18',
    user: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 20c1-4 4-6 8-6s7 2 8 6',
    eye: 'M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12zM12 9.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5z',
    command2: 'M5 12h14M12 5l7 7-7 7',
  };
  window.Icons = {
    svg(name, cls) {
      const d = P[name] || P.page;
      return '<svg class="i' + (cls ? ' ' + cls : '') + '" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="' + d + '"/></svg>';
    },
    /** Replace the contents of `el` with an icon (safe: icon names come from our code). */
    set(el, name, cls) { el.innerHTML = this.svg(name, cls); return el; },
    has: (n) => Object.prototype.hasOwnProperty.call(P, n),
  };
})();
