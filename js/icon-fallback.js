const iconPaths = {
  add: "M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z",
  add_circle: "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm5 11h-4v4h-2v-4H7v-2h4V7h2v4h4v2z",
  arrow_back: "M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z",
  arrow_forward: "M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z",
  arrow_right_alt: "M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z",
  auto_stories: "M21 4H3c-1.1 0-2 .9-2 2v13c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 15h-9V6h9v13zM3 6h7v13H3V6z",
  auto_awesome: "m19 9 1.25-2.75L23 5l-2.75-1.25L19 1l-1.25 2.75L15 5l2.75 1.25L19 9zM19 15l-1.25 2.75L15 19l2.75 1.25L19 23l1.25-2.75L23 19l-2.75-1.25L19 15zM11.5 9.5 9 4 6.5 9.5 1 12l5.5 2.5L9 20l2.5-5.5L17 12l-5.5-2.5z",
  book: "M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 4h5v7l-2.5-1.5L6 11V4z",
  bookmark: "M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z",
  bookmark_border: "M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5h-2v10.9l-5-2.14-5 2.14V5h10V3z",
  check_circle: "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm-2 15-5-5 1.4-1.4L10 14.2l5.6-5.6L17 10l-7 7z",
  chevron_left: "M15.41 7.41 14 6l-6 6 6 6 1.41-1.41L10.83 12z",
  chevron_right: "M10 6 8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z",
  close: "M18.3 5.71 16.89 4.3 12 9.17 7.11 4.3 5.7 5.71 10.59 10.59 5.7 15.47 7.11 16.89 12 12 16.89 16.89 18.3 15.47 13.41 10.59z",
  dark_mode: "M9.37 5.51A7 7 0 0 0 16.49 14a7 7 0 1 1-7.12-8.49z",
  light_mode: "M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6zm0-7h-1v3h2V2h-1zm0 17h-1v3h2v-3h-1zM4.22 5.64 3.17 4.59 1.76 6l1.05 1.05 1.41-1.41zM20.24 18l-1.05-1.05-1.41 1.41 1.05 1.05 1.41-1.41zM2 12H5v-2H2v2zm17 0h3v-2h-3v2zM4.22 18.36 2.81 19.77l1.05 1.05 1.41-1.41-1.05-1.05zM18.83 4.59l-1.05 1.05 1.41 1.41 1.05-1.05-1.41-1.41z",
  delete: "M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM8 9h8v10H8V9zm7.5-5-1-1h-5l-1 1H5v2h14V4z",
  description: "M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm1 7V3.5L18.5 9H15zM8 13h8v2H8v-2zm0 4h8v2H8v-2z",
  edit: "M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z",
  error: "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z",
  format_list_bulleted: "M4 10.5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5zM4 5.5C3.17 5.5 2.5 6.17 2.5 7S3.17 8.5 4 8.5 5.5 7.83 5.5 7 4.83 5.5 4 5.5zM4 15.5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5zM7 18h14v-2H7v2zm0-5h14v-2H7v2zm0-7v2h14V6H7z",
  grid_view: "M3 3h8v8H3V3zm10 0h8v8h-8V3zM3 13h8v8H3v-8zm10 0h8v8h-8v-8z",
  home: "M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z",
  category: "M12 2 2 7l10 5 8-4v7h2V7L12 2zM2 12v5l10 5 10-5v-5l-10 5-10-5z",
  edit_note: "M3 5h10V3H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h10v-2H3V5zm14 0h-2v9.59l-4.29 4.29 1.41 1.41L16 16.41V15h1V5zm4 0h-2v10h2V5z",
  expand_more: "m7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6z",
  format_quote: "M6 17h3l2-4V7H5v6h3l-2 4zm9 0h3l2-4V7h-6v6h3l-2 4z",
  graphic_eq: "M7 9h2v6H7V9zm4-4h2v14h-2V5zm4 7h2v7h-2v-7zM3 13h2v4H3v-4zm16-2h2v6h-2v-6z",
  groups: "M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5s-3 1.34-3 3 1.34 3 3 3zM8 11c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5C15 14.17 10.33 13 8 13zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.91 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z",
  inbox: "M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zM7 13h3v2h4v-2h3l-5-5-5 5z",
  info: "M11 17h2v-6h-2v6zm1-15a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm0 18a8 8 0 1 1 0-16 8 8 0 0 1 0 16zM11 9h2V7h-2v2z",
  login: "M11 7l-1.4 1.4 2.6 2.6H3v2h9.2l-2.6 2.6L11 17l5-5-5-5zm8-4H5v2h14v14H5v2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z",
  logout: "M10.09 15.59 11.5 17l5-5-5-5-1.41 1.41L12.67 11H3v2h9.67l-2.58 2.59zM19 3H5c-1.1 0-2 .9-2 2v4h2V5h14v14H5v-4H3v4c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z",
  menu: "M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z",
  menu_book: "M21 4H3c-1.1 0-2 .9-2 2v13c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 15h-9V6h9v13zM3 6h7v13H3V6z",
  mosque: "M12 3 8 7v2H6v2h12V9h-2V7l-4-4zm-7 9v8h14v-8H5zm4 2h2v4H9v-4zm4 0h2v4h-2v-4z",
  open_in_new: "M19 19H5V5h7V3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59L7.76 14.83l1.41 1.41L19 6.41V10h2V3h-7z",
  person: "M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z",
  person_book: "M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h10v-2H6.2c.75-1.18 3.49-2 5.8-2 2.31 0 5.05.82 5.8 2H16v2h4v-2c0-2.66-5.33-4-8-4z",
  person_search: "M10 11c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h10v-2H4.2c.75-1.18 3.49-2 5.8-2v-2zm10.6 5.2-2.6-2.6a4.5 4.5 0 1 0-1.4 1.4l2.6 2.6 1.4-1.4zM16 15a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z",
  podcasts: "M7.5 6.5a6.5 6.5 0 0 0 0 11M16.5 6.5a6.5 6.5 0 0 1 0 11M5 9a4 4 0 0 0 0 6M19 9a4 4 0 0 1 0 6M12 12a2 2 0 1 0 0 4 2 2 0 0 0 0-4z",
  playlist_add: "M14 10H3v2h11v-2zm0-4H3v2h11V6zM3 16h7v-2H3v2zm13-2v3h-3v2h3v3h2v-3h3v-2h-3v-3h-2z",
  publish: "M5 4v3h14V4H5zm0 5v11h14V9H5zm6 2h2v5h-2v-5z",
  lock: "M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9a2 2 0 1 1 0-4 2 2 0 0 1 0 4zM9 8V6a3 3 0 0 1 6 0v2H9z",
  queue_music: "M15 6v8.5a3.5 3.5 0 1 0 2 3.16V8h4V6h-6z",
  save: "M17 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16a3 3 0 1 1 0-6 3 3 0 0 1 0 6zM6 5h8v4H6V5z",
  music_note: "M12 3v10.55A4 4 0 1 0 14 17V7h4V3h-6z",
  history_edu: "M13 3H6c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-7-5zm1 7V4.5L18.5 10H14zM8 13h8v2H8v-2zm0 4h6v2H8v-2z",
  progress_activity: "M12 2a10 10 0 1 0 10 10h-2a8 8 0 1 1-8-8V2z",
  search: "M9.5 3a6.5 6.5 0 0 0 0 13c1.61 0 3.09-.59 4.23-1.57L19.49 20 21 18.49l-5.57-5.57A6.47 6.47 0 0 0 16 9.5 6.5 6.5 0 0 0 9.5 3zm0 2a4.5 4.5 0 1 1 0 9 4.5 4.5 0 0 1 0-9z",
  settings: "M19.43 12.98c.04-.32.07-.65.07-.98s-.02-.66-.07-.98l2.11-1.65-2-3.46-2.49 1c-.52-.4-1.08-.73-1.69-.98L15 3h-4l-.37 2.93c-.61.25-1.17.59-1.69.98l-2.49-1-2 3.46 2.11 1.65c-.04.32-.08.65-.08.98s.03.66.08.98l-2.11 1.65 2 3.46 2.49-1c.52.4 1.08.73 1.69.98L11 21h4l.37-2.93c.61-.25 1.17-.59 1.69-.98l2.49 1 2-3.46-2.12-1.65zM13 15.5A3.5 3.5 0 1 1 13 8a3.5 3.5 0 0 1 0 7.5z",
  translate: "M12.87 15.07l-2.54-2.51.03-.03A17.52 17.52 0 0 0 14.07 6H17V4h-7V2H8v2H1v2h11.17A15.33 15.33 0 0 1 8 12.14 15.27 15.27 0 0 1 5.63 9H3.62a17.5 17.5 0 0 0 3.2 4.43L1.56 18 3 19.44l5-5 3.11 3.11 1.76-2.48zM18.5 10h-2L12 22h2l1.13-3h4.74L21 22h2l-4.5-12zm-2.62 7 1.62-4.33L19.12 17h-3.24z",
  visibility: "M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17a5 5 0 1 1 0-10 5 5 0 0 1 0 10z",
  visibility_off: "M2.1 3.51 3.51 2.1l18.38 18.38-1.41 1.41-3.18-3.18A11.3 11.3 0 0 1 12 20c-5 0-9.27-3.11-11-8a11.8 11.8 0 0 1 4.03-5.31L2.1 3.51zM12 17a5 5 0 0 0 4.05-2.07l-6.98-6.98A5 5 0 0 0 12 17zm0-10c5 0 9.27 3.11 11 8a11.8 11.8 0 0 1-2.41 3.91l-1.43-1.43A9.8 9.8 0 0 0 20.86 15C19.2 11.82 15.9 9 12 9c-.35 0-.69.02-1.03.06L9.4 7.49A11.2 11.2 0 0 1 12 7z",
  warning: "M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"
};

const encodeSvg = (path) =>
  `url("data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="${path}"/></svg>`,
  )}")`;

const updateIcon = (element) => {
  if (!element.matches(".material-symbols-outlined") || element.dataset.iconFallback === "true") {
    return;
  }

  const name = element.textContent.trim();
  const path = iconPaths[name];
  if (!path) {
    return;
  }

  const size = getComputedStyle(element).fontSize;
  element.dataset.iconFallback = "true";
  element.dataset.iconName = name;
  element.style.setProperty("--icon-size", size);
  element.style.setProperty("--icon-svg", encodeSvg(path));
  element.textContent = "";
};

const updateIcons = (root = document) => {
  if (root.matches?.(".material-symbols-outlined")) {
    updateIcon(root);
  }
  root.querySelectorAll?.(".material-symbols-outlined").forEach(updateIcon);
};

updateIcons();

new MutationObserver((mutations) => {
  mutations.forEach(({ addedNodes, target, type }) => {
    addedNodes.forEach((node) => {
      if (node.nodeType === Node.ELEMENT_NODE) {
        updateIcons(node);
      }
    });
    if (type === "characterData" || (type === "childList" && target.matches?.(".material-symbols-outlined"))) {
      const icon = target.closest?.(".material-symbols-outlined");
      if (icon) {
        icon.dataset.iconFallback = "";
        updateIcon(icon);
      }
    }
  });
}).observe(document.documentElement, { childList: true, subtree: true, characterData: true });
