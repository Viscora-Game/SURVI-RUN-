// ─── Centralized SVG Icon System ───────────────────────────────────
// Clean, minimal inline SVG icons – no emojis, no AI look.
// Usage:  icon('timer')  →  '<svg class="gi" ...>...</svg>'
//         icon('timer', 18)  →  sized variant

const ICONS: Record<string, string> = {
  // ── HUD & Navigation ──
  timer:      '<path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm0 3v7l4.5 2.7-.7 1.2L11 13V5z"/>',
  skull:      '<path d="M12 2C7 2 3 6.5 3 11c0 2.8 1.5 5.2 3.7 6.6L7 22h4v-2h2v2h4l.3-4.4C19.5 16.2 21 13.8 21 11c0-4.5-4-9-9-9zm-3 12a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm6 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z"/>',
  coin:       '<circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2" fill="none"/><path d="M12 7v2m0 6v2M9.5 9.5h3c1.1 0 2 .7 2 1.5s-.9 1.5-2 1.5H10c-1.1 0-2 .7-2 1.5s.9 1.5 2 1.5h3"/>',
  globe:      '<circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2" fill="none"/><path d="M3 12h18M12 3c-2.8 3-4 6-4 9s1.2 6 4 9c2.8-3 4-6 4-9s-1.2-6-4-9" stroke="currentColor" stroke-width="2" fill="none"/>',
  'vol-on':   '<path d="M3 9v6h4l5 5V4L7 9zm13.5 3A4.5 4.5 0 0 0 14 8.5v7a4.5 4.5 0 0 0 2.5-3.5zM14 3.2v2.1a7 7 0 0 1 0 13.4v2.1A9 9 0 0 0 14 3.2z"/>',
  'vol-off':  '<path d="M3 9v6h4l5 5V4L7 9zm13 3l4 4m0-4l-4 4"/>',
  pause:      '<path d="M6 4h4v16H6zm8 0h4v16h-4z"/>',
  play:       '<path d="M8 5v14l11-7z"/>',

  // ── Menu & Actions ──
  rocket:     '<path d="M4.5 16.5c-1.5 1.3-2 4.3-2 4.3s3-0.5 4.3-2C7.9 17.8 8 16.3 7 15.5 6.2 14.6 4.7 14.7 4.5 16.5z"/><path d="M12 15l-2 2-3-3 2-2C11 9 14 5 21 3c-2 7-6 10-9 12z"/><path d="M9.5 7.5L5 10l4 4 2.5-4.5"/>',
  dna:        '<path d="M6 3c0 6 12 6 12 12M18 3c0 6-12 6-12 12M6 21c0-3 3-5 6-6m6 6c0-3-3-5-6-6M7 5h10M7 19h10"/>',
  trophy:     '<path d="M6 9H3a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h3m12 5h3a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1h-3M6 4h12v6a6 6 0 0 1-12 0zm2 16h8m-4 0v-4"/>',
  gear:       '<circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2" fill="none"/><path d="M12 1v3m0 16v3M4.2 4.2l2.1 2.1m11.4 11.4l2.1 2.1M1 12h3m16 0h3M4.2 19.8l2.1-2.1m11.4-11.4l2.1-2.1" stroke="currentColor" stroke-width="2"/>',
  home:       '<path d="M3 12l9-9 9 9M5 10v10h5v-6h4v6h5V10"/>',
  refresh:    '<path d="M1 4v6h6M23 20v-6h-6" stroke="currentColor" stroke-width="2" fill="none"/><path d="M20.5 9A9 9 0 0 0 5.6 5.6L1 10m22 4l-4.6 4.4A9 9 0 0 1 3.5 15" stroke="currentColor" stroke-width="2" fill="none"/>',
  close:      '<path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>',
  check:      '<path d="M20 6L9 17l-5-5" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" fill="none"/>',

  // ── Combat & Weapons ──
  sword:      '<path d="M14.5 17.5L3 6V3h3l11.5 11.5M13 19l6-6 3 3-6 6zm.5-6.5l4-4"/>',
  shield:     '<path d="M12 22s-8-4.5-8-11.8V4l8-2 8 2v6.2C20 17.5 12 22 12 22z"/>',
  heart:      '<path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54z"/>',
  bolt:       '<path d="M13 2L4 14h7l-2 8 9-12h-7z"/>',
  crosshair:  '<circle cx="12" cy="12" r="7" stroke="currentColor" stroke-width="2" fill="none"/><path d="M12 2v4m0 12v4M2 12h4m12 0h4" stroke="currentColor" stroke-width="2"/>',
  fire:       '<path d="M12 22c-4.97 0-9-3.58-9-8 0-4 3.5-7.5 4-10.5.36 2.15 2.97 3.5 4 3 .83-.41 1.5-2 1-4.5 2 3 5 5.5 5 9 0 .5-.04.99-.12 1.46A3.5 3.5 0 0 0 15 9c0 2.5-2 3.5-2.5 5.5-.25 1 0 2 1.5 3.5-1 0-2 1-2 4z"/>',
  zap:        '<path d="M13 2L4 14h7l-2 8 9-12h-7z"/>',

  // ── Economy & Items ──
  gem:        '<path d="M6 3h12l4 6-10 12L2 9z"/><path d="M2 9h20M12 21L8 9l4-6 4 6z" stroke="currentColor" stroke-width="1" fill="none"/>',
  dice:       '<rect x="3" y="3" width="18" height="18" rx="3" stroke="currentColor" stroke-width="2" fill="none"/><circle cx="8" cy="8" r="1.2"/><circle cx="16" cy="8" r="1.2"/><circle cx="12" cy="12" r="1.2"/><circle cx="8" cy="16" r="1.2"/><circle cx="16" cy="16" r="1.2"/>',
  magnet:     '<path d="M6 2v8a6 6 0 0 0 12 0V2M6 2H2v5h4M18 2h4v5h-4"/>',
  gift:       '<rect x="3" y="10" width="18" height="11" rx="1" stroke="currentColor" stroke-width="2" fill="none"/><path d="M12 10v11M3 14h18" stroke="currentColor" stroke-width="2"/><path d="M12 10c-1-4-5-5-6-3s3 3 6 3c3 0 7-1 6-3s-5-1-6 3"/>',
  lock:       '<rect x="5" y="11" width="14" height="10" rx="2" stroke="currentColor" stroke-width="2" fill="none"/><path d="M8 11V7a4 4 0 0 1 8 0v4" stroke="currentColor" stroke-width="2" fill="none"/>',
  unlock:     '<rect x="5" y="11" width="14" height="10" rx="2" stroke="currentColor" stroke-width="2" fill="none"/><path d="M8 11V7a4 4 0 0 1 8 0" stroke="currentColor" stroke-width="2" fill="none"/>',
  package:    '<path d="M16.5 9.4l-9-5.2M21 16V8l-9 5.2M3 8v8l9 5.2L21 16M3 8l9 5.2L21 8M3 8l9-5.2L21 8M12 13.2V21.2"/>',
  sparkle:    '<path d="M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8z"/>',

  // ── Status & Warnings ──
  warning:    '<path d="M12 2L1 21h22zm0 7v5m0 3v1"/>',
  ban:        '<circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2" fill="none"/><path d="M5.7 5.7l12.6 12.6" stroke="currentColor" stroke-width="2"/>',
  child:      '<circle cx="12" cy="7" r="4" stroke="currentColor" stroke-width="2" fill="none"/><path d="M5.5 21a6.5 6.5 0 0 1 13 0" stroke="currentColor" stroke-width="2" fill="none"/>',
  trash:      '<path d="M3 6h18M8 6V4h8v2m-7 3v8m4-8v8M5 6l1 14h12l1-14"/>',

  // ── Settings & Policy ──
  'shield-check': '<path d="M12 22s-8-4.5-8-11.8V4l8-2 8 2v6.2C20 17.5 12 22 12 22z"/><path d="M9 12l2 2 4-4" stroke="#000" stroke-width="2" fill="none"/>',
  scroll:     '<path d="M8 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M8 13h8M8 17h5"/>',
  'lock-alt': '<rect x="5" y="11" width="14" height="10" rx="2" stroke="currentColor" stroke-width="2" fill="none"/><circle cx="12" cy="16" r="1.5"/><path d="M8 11V7a4 4 0 0 1 8 0v4" stroke="currentColor" stroke-width="2" fill="none"/>',

  // ── Skill Tree Categories ──
  warfare:    '<path d="M14.5 17.5L3 6V3h3l11.5 11.5M13 19l6-6 3 3-6 6zm.5-6.5l4-4"/>',
  defense:    '<path d="M12 22s-8-4.5-8-11.8V4l8-2 8 2v6.2C20 17.5 12 22 12 22z"/>',
  mobility:   '<path d="M13 2L4 14h7l-2 8 9-12h-7z"/>',
  economy:    '<path d="M6 3h12l4 6-10 12L2 9z"/><path d="M2 9h20M12 21L8 9l4-6 4 6z" stroke="currentColor" stroke-width="1" fill="none"/>',
  nexus:      '<circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2" fill="none"/><circle cx="12" cy="12" r="8" stroke="currentColor" stroke-width="1.5" fill="none" stroke-dasharray="4 3"/>',

  // ── Misc Game ──
  crown:      '<path d="M2 20h20L19 9l-4 4-3-6-3 6-4-4z"/>',
  star:       '<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z"/>',
  mouse:      '<rect x="7" y="3" width="10" height="18" rx="5" stroke="currentColor" stroke-width="2" fill="none"/><path d="M12 3v5" stroke="currentColor" stroke-width="2"/>',
  search:     '<circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="2" fill="none"/><path d="M21 21l-4.35-4.35" stroke="currentColor" stroke-width="2"/>',
  chart:      '<path d="M3 20h18M7 16V9m5 7V5m5 11v-4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
  target:     '<circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2" fill="none"/><circle cx="12" cy="12" r="5" stroke="currentColor" stroke-width="2" fill="none"/><circle cx="12" cy="12" r="1.5"/>',
  link:       '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" stroke="currentColor" stroke-width="2" fill="none"/>',
  layers:     '<path d="M12 2L2 7l10 5 10-5zm0 0" fill="none" stroke="currentColor" stroke-width="2"/><path d="M2 17l10 5 10-5M2 12l10 5 10-5" fill="none" stroke="currentColor" stroke-width="2"/>',
  infinity:   '<path d="M8 12c-2-2-4-2-5 0s1 4 3 2l6-4c2-2 4-2 5 0s-1 4-3 2z" stroke="currentColor" stroke-width="2" fill="none"/>',
  hammer:     '<path d="M15 12l-8.5 8.5c-.8.8-2.1.8-2.8 0l-.7-.7c-.8-.8-.8-2.1 0-2.8L11.5 8.5"/><path d="M15 12l5-5a3.5 3.5 0 0 0-5-5l-4 4"/>',
  cards:      '<rect x="2" y="4" width="12" height="16" rx="2" stroke="currentColor" stroke-width="2" fill="none"/><path d="M16 8h3a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H9"/>',
  atom:       '<ellipse cx="12" cy="12" rx="10" ry="4" stroke="currentColor" stroke-width="1.5" fill="none" transform="rotate(-30 12 12)"/><ellipse cx="12" cy="12" rx="10" ry="4" stroke="currentColor" stroke-width="1.5" fill="none" transform="rotate(30 12 12)"/><circle cx="12" cy="12" r="2"/>',
  'arrow-up': '<path d="M12 19V5m-7 7l7-7 7 7" stroke="currentColor" stroke-width="2" fill="none"/>',
  compass:    '<circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2" fill="none"/><path d="M16.24 7.76l-2.12 6.36-6.36 2.12 2.12-6.36z"/>',
  brain:      '<path d="M12 2a5 5 0 0 0-4.6 3A4 4 0 0 0 4 9a4 4 0 0 0 1 7.9A5 5 0 0 0 12 22a5 5 0 0 0 7-5.1A4 4 0 0 0 20 9a4 4 0 0 0-3.4-4A5 5 0 0 0 12 2zm0 0v20" stroke="currentColor" stroke-width="1.5" fill="none"/>',
};

/**
 * Returns an inline SVG icon markup string.
 * @param name  Key from the ICONS map
 * @param size  Pixel size (default 16)
 * @param cls   Extra CSS class(es) to add
 */
export function icon(name: string, size = 16, cls = ''): string {
  const path = ICONS[name];
  if (!path) return '';
  const classes = `gi${cls ? ' ' + cls : ''}`;
  return `<svg class="${classes}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">${path}</svg>`;
}

/**
 * Returns an icon string for use in outline/stroke-only contexts.
 */
export function iconOutline(name: string, size = 16, cls = ''): string {
  const path = ICONS[name];
  if (!path) return '';
  const classes = `gi gi-outline${cls ? ' ' + cls : ''}`;
  return `<svg class="${classes}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${path}</svg>`;
}
