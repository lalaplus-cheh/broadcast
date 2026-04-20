import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import api from './api';
import RichEditor from './RichEditor';
import PHelp from './HelpContent';

/* ── Inline SVG icons（單色，繼承 currentColor）──────────────────── */
const IC={
  schedule:({s=16})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><line x1="8" y1="14" x2="8" y2="14" strokeWidth="2.5"/><line x1="12" y1="14" x2="12" y2="14" strokeWidth="2.5"/><line x1="16" y1="14" x2="16" y2="14" strokeWidth="2.5"/><line x1="8" y1="18" x2="8" y2="18" strokeWidth="2.5"/><line x1="12" y1="18" x2="12" y2="18" strokeWidth="2.5"/></svg>,
  broadcast:({s=16})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8a6 6 0 0 1 0 8"/><path d="M6 8a6 6 0 0 0 0 8"/><path d="M14 10.5a2 2 0 0 1 0 3"/><path d="M10 10.5a2 2 0 0 0 0 3"/><circle cx="12" cy="12" r="1" fill="currentColor" stroke="none"/><line x1="12" y1="13" x2="12" y2="20"/><line x1="9" y1="20" x2="15" y2="20"/></svg>,
  stats:({s=16})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/><line x1="3" y1="20" x2="21" y2="20"/></svg>,
  room:({s=16})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21h18"/><path d="M5 21V7l7-4 7 4v14"/><path d="M9 21V11h6v10"/></svg>,
  model:({s=16})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="13" rx="2"/><path d="M16 3l-4 4-4-4"/><line x1="8" y1="13" x2="8" y2="13" strokeWidth="2.5"/><line x1="16" y1="13" x2="16" y2="13" strokeWidth="2.5"/><line x1="12" y1="16" x2="12" y2="16" strokeWidth="2.5"/></svg>,
  sender:({s=16})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/><circle cx="19" cy="8" r="2.5" fill="currentColor" stroke="none"/><path d="M19 5.5 C20.2 5.5 21.5 6.5 21.5 8 C21.5 9.5 20.2 10.5 19 10.5" strokeWidth="1.5"/></svg>,
  classOfficers:({s=16})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  logs:({s=16})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="13" y2="17"/></svg>,
  config:({s=16})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
  profile:({s=16})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  help:({s=16})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17" strokeWidth="2.5"/></svg>,
  radio:({s=16})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4.9 19.1C1 15.2 1 8.8 4.9 4.9"/><path d="M7.8 16.2a5.96 5.96 0 0 1 0-8.4"/><path d="M16.2 7.8a5.96 5.96 0 0 1 0 8.4"/><path d="M19.1 4.9C23 8.8 23 15.1 19.1 19"/><circle cx="12" cy="12" r="2"/></svg>,
  sun:({s=15})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>,
  moon:({s=15})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>,
  /* ── 補充 icons ── */
  warn:({s=14})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17" strokeWidth="2.5"/></svg>,
  check:({s=14})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
  x:({s=14})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  music:({s=14})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>,
  edit:({s=14})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  zap:({s=14})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
  text:({s=14})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="18" x2="14" y2="18"/></svg>,
  video:({s=14})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>,
  image:({s=14})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>,
  trash:({s=14})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>,
  folder:({s=14})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>,
  folderOpen:({s=14})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/><polyline points="2 10 12 10 22 10"/></svg>,
  copy:({s=14})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>,
  link:({s=14})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>,
  search:({s=14})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  dot_red:({s=10})=><svg width={s} height={s} viewBox="0 0 10 10"><circle cx="5" cy="5" r="4.5" fill="currentColor"/></svg>,
  live:({s=14})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" fill="currentColor" stroke="none"/><path d="M18 6a8 8 0 0 1 0 12"/><path d="M6 6a8 8 0 0 0 0 12"/></svg>,
  calendar:({s=14})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  repeat:({s=14})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>,
  clock:({s=14})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  lock:({s=14})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
  bulb:({s=14})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21h6"/><path d="M12 3a6 6 0 0 1 6 6c0 2.5-1.3 4.7-3.3 6L14 17H10l-.7-2C7.3 13.7 6 11.5 6 9a6 6 0 0 1 6-6z"/></svg>,
  file:({s=14})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>,
  shield:({s=14})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  school:({s=14})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21h18"/><path d="M9 21V9"/><path d="M15 21V9"/><path d="M3 9l9-6 9 6"/><rect x="9" y="13" width="6" height="8"/></svg>,
  tv:({s=14})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="15" rx="2"/><polyline points="17 2 12 7 7 2"/></svg>,
  mic:({s=14})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>,
  plug:({s=14})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18"/><path d="M7 6v4a5 5 0 0 0 10 0V6"/><line x1="9" y1="3" x2="9" y2="6"/><line x1="15" y1="3" x2="15" y2="6"/><path d="M10 18l-1 3"/><path d="M14 18l1 3"/></svg>,
  monitor:({s=14})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>,
  stop:({s=14})=><svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="3" width="18" height="18" rx="2"/></svg>,
  refresh:({s=14})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>,
  camera:({s=14})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>,
  ban:({s=28})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>,
  alert:({s=14})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16" strokeWidth="2.5"/></svg>,
  globe:({s=14})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>,
  trophy:({s=14})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 22V18"/><path d="M14 22V18"/><path d="M8 18h8"/><path d="M6 4h12v8a6 6 0 0 1-6 6v0a6 6 0 0 1-6-6V4z"/></svg>,
  trend:({s=14})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>,
  badge:({s=14})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>,
  pin:({s=10})=><svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>,
  menu:({s=14})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>,
  paperclip:({s=14})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>,
  success:({s=42})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="9 12 11 14 15 10"/></svg>,
  error:({s=42})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>,
  hourglass:({s=14})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M5 22h14"/><path d="M5 2h14"/><path d="M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22"/><path d="M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2"/></svg>,
};

const EMPTY_CFG={tcpPort:4001,loopDelay:500,standbyImg:"standby.png",adminIps:[],logRetentionDays:180,defaultTxtColor:"#FFFFFF",defaultBgColor:"#1a1e2a",defaultFontSize:48,defaultTxtDur:60,defaultLineHeight:1.7,standbyTitle:"廣播系統",standbyTitleColor:"rgba(255,255,255,.15)",standbyTitleSize:77,standbyClockColor:"rgba(255,255,255,.9)",standbyDateColor:"rgba(255,255,255,.5)",standbyShowClock:true,standbyShowDate:true,bannerTimeColor:"#fbbf24",bannerTimeFormat:"24h",showAvatar:true,schoolStages:["國中","高中"]};
// 8 built-in teacher-style avatars users can pick from in settings
// 設計原則：端莊、簡潔、適合教育場景；配色用沉穩色系，有衣領輪廓模擬制服
const DEFAULT_AVATARS=[
{id:"t1",gender:"男",label:"短髮",svg:"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 128 128'><rect width='128' height='128' fill='%23475569'/><path d='M30 128 Q30 86 64 86 Q98 86 98 128 Z' fill='%23e2e8f0'/><path d='M48 88 L48 96 Q48 102 56 102 Q64 103 72 102 Q80 102 80 96 L80 88 Z' fill='%231e293b'/><circle cx='64' cy='58' r='22' fill='%23f3d5b5'/><path d='M44 58 Q44 36 64 34 Q84 36 84 58 L84 50 Q84 42 74 40 L54 40 Q44 42 44 50 Z' fill='%233f3f46'/></svg>"},
{id:"t2",gender:"男",label:"眼鏡",svg:"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 128 128'><rect width='128' height='128' fill='%23334155'/><path d='M30 128 Q30 86 64 86 Q98 86 98 128 Z' fill='%23cbd5e1'/><path d='M48 88 L48 96 Q48 102 56 102 Q64 103 72 102 Q80 102 80 96 L80 88 Z' fill='%231e293b'/><circle cx='64' cy='58' r='22' fill='%23f3d5b5'/><path d='M44 58 Q44 36 64 34 Q84 36 84 58 L84 50 Q84 42 74 40 L54 40 Q44 42 44 50 Z' fill='%232a2f36'/><circle cx='55' cy='60' r='6' fill='none' stroke='%231a1a1a' stroke-width='1.8'/><circle cx='73' cy='60' r='6' fill='none' stroke='%231a1a1a' stroke-width='1.8'/><line x1='61' y1='60' x2='67' y2='60' stroke='%231a1a1a' stroke-width='1.8'/></svg>"},
{id:"t3",gender:"男",label:"資深",svg:"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 128 128'><rect width='128' height='128' fill='%2352525b'/><path d='M30 128 Q30 86 64 86 Q98 86 98 128 Z' fill='%23d4d4d8'/><path d='M48 88 L48 96 Q48 102 56 102 Q64 103 72 102 Q80 102 80 96 L80 88 Z' fill='%232e2e36'/><circle cx='64' cy='58' r='22' fill='%23f3d5b5'/><path d='M44 58 Q44 36 64 34 Q84 36 84 58 L84 50 Q84 42 74 40 L54 40 Q44 42 44 50 Z' fill='%23a1a1aa'/></svg>"},
{id:"t4",gender:"男",label:"偏分",svg:"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 128 128'><rect width='128' height='128' fill='%231e3a5f'/><path d='M30 128 Q30 86 64 86 Q98 86 98 128 Z' fill='%23bfdbfe'/><path d='M48 88 L48 96 Q48 102 56 102 Q64 103 72 102 Q80 102 80 96 L80 88 Z' fill='%231e293b'/><circle cx='64' cy='58' r='22' fill='%23f3d5b5'/><path d='M44 58 Q44 36 64 34 Q84 36 84 58 L84 50 Q84 44 80 42 Q70 46 58 44 Q48 42 44 50 Z' fill='%232d2a26'/><path d='M60 40 Q70 42 80 40 Q82 48 74 52 Q64 46 60 40 Z' fill='%231a1815'/></svg>"},
{id:"t5",gender:"女",label:"直髮",svg:"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 128 128'><rect width='128' height='128' fill='%23451a03'/><path d='M30 128 Q30 86 64 86 Q98 86 98 128 Z' fill='%23fde68a'/><path d='M50 88 L50 94 Q50 100 58 100 Q64 101 70 100 Q78 100 78 94 L78 88 Z' fill='%23422006'/><path d='M40 68 Q40 32 64 30 Q88 32 88 68 L88 82 L80 82 Q82 46 64 44 Q46 46 48 82 L40 82 Z' fill='%234c2309'/><circle cx='64' cy='58' r='20' fill='%23f3d5b5'/></svg>"},
{id:"t6",gender:"女",label:"包頭",svg:"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 128 128'><rect width='128' height='128' fill='%23374151'/><path d='M30 128 Q30 86 64 86 Q98 86 98 128 Z' fill='%23e5e7eb'/><path d='M50 88 L50 94 Q50 100 58 100 Q64 101 70 100 Q78 100 78 94 L78 88 Z' fill='%231f2937'/><ellipse cx='64' cy='28' rx='12' ry='9' fill='%23292524'/><circle cx='64' cy='58' r='22' fill='%23f3d5b5'/><path d='M44 58 Q44 34 64 34 Q84 34 84 58 L84 50 Q84 40 64 40 Q44 40 44 50 Z' fill='%23292524'/></svg>"},
{id:"t7",gender:"女",label:"鮑伯",svg:"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 128 128'><rect width='128' height='128' fill='%231c1917'/><path d='M30 128 Q30 86 64 86 Q98 86 98 128 Z' fill='%23a8a29e'/><path d='M50 88 L50 94 Q50 100 58 100 Q64 101 70 100 Q78 100 78 94 L78 88 Z' fill='%23292524'/><path d='M42 56 Q42 28 64 26 Q86 28 86 56 L86 72 L80 72 Q82 44 64 42 Q46 44 48 72 L42 72 Z' fill='%231c1917'/><circle cx='64' cy='58' r='20' fill='%23f3d5b5'/></svg>"},
{id:"t8",gender:"女",label:"馬尾",svg:"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 128 128'><rect width='128' height='128' fill='%23713f12'/><path d='M30 128 Q30 86 64 86 Q98 86 98 128 Z' fill='%23fed7aa'/><path d='M50 88 L50 94 Q50 100 58 100 Q64 101 70 100 Q78 100 78 94 L78 88 Z' fill='%23451a03'/><circle cx='64' cy='58' r='22' fill='%23f3d5b5'/><path d='M44 56 Q44 32 64 30 Q84 32 84 56 L84 48 Q84 38 64 38 Q44 38 44 48 Z' fill='%23451a03'/><path d='M82 42 Q96 50 94 70 Q90 74 86 64 Q86 52 82 46 Z' fill='%23451a03'/></svg>"}
];
const p2=n=>String(n).padStart(2,"0");
const fixEmptyP=html=>html?html.replace(/<p><\/p>/g,'<p>&nbsp;</p>').replace(/<p>\s*<br\s*\/?>\s*<\/p>/g,'<p>&nbsp;</p>'):"";
const isHtml=s=>/<[a-z][\s\S]*>/i.test(s);
const renderTxt=raw=>{if(!raw)return"";if(isHtml(raw))return fixEmptyP(raw);return raw.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/ {2}/g,' &nbsp;').replace(/\n/g,'<br>');};
// Apply highlight styles (color + font-size scale) to officer/sender names found in HTML text.
// Walks only text nodes so existing markup is preserved.
const applyHighlights=(html,officers)=>{
  if(!html||!officers||!officers.length)return html||"";
  if(typeof window==="undefined"||!window.DOMParser)return html;
  const sorted=[...officers].sort((a,b)=>b.name.length-a.name.length);
  try{
    const doc=new DOMParser().parseFromString(`<div>${html}</div>`,"text/html");
    const root=doc.body.firstChild;
    if(!root)return html;
    const walk=node=>{
      if(node.nodeType===3){ // text node
        const text=node.nodeValue;
        if(!text)return;
        // Scan text for matches
        const frags=[];let i=0;
        while(i<text.length){
          let hit=null;
          for(const o of sorted){if(o.name&&text.substr(i,o.name.length)===o.name){hit=o;break;}}
          if(hit){
            frags.push({t:"hit",text:hit.name,color:hit.color,scale:hit.scale||1});
            i+=hit.name.length;
          }else{
            if(frags.length&&frags[frags.length-1].t==="txt")frags[frags.length-1].text+=text[i];
            else frags.push({t:"txt",text:text[i]});
            i++;
          }
        }
        // If no hits, nothing to do
        if(!frags.some(f=>f.t==="hit"))return;
        // Replace text node with a sequence of nodes
        const parent=node.parentNode;
        frags.forEach(f=>{
          if(f.t==="txt"){parent.insertBefore(doc.createTextNode(f.text),node);}
          else{
            const span=doc.createElement("span");
            span.setAttribute("style",`color:${f.color};font-size:${f.scale*100}%;font-weight:700;`);
            span.textContent=f.text;
            parent.insertBefore(span,node);
          }
        });
        parent.removeChild(node);
      }else if(node.nodeType===1&&node.childNodes){
        // Element node — recurse (copy children list because we may mutate)
        Array.from(node.childNodes).forEach(walk);
      }
    };
    walk(root);
    return root.innerHTML;
  }catch(e){return html;}
};const fmtD=d=>`${d.getFullYear()}-${p2(d.getMonth()+1)}-${p2(d.getDate())}`;
const fmtDT=d=>{const x=new Date(d);return`${fmtD(x)} ${p2(x.getHours())}:${p2(x.getMinutes())}:${p2(x.getSeconds())}`;};
const timeToSec=t=>{const p=t.split(':').map(Number);return p[0]*3600+(p[1]||0)*60+(p[2]||0);};
const fmtDur=s=>{if(!s)return"";const h=Math.floor(s/3600),m=Math.floor(s%3600/60),r=s%60;if(h>0)return`${h}時${m>0?m+"分":""}${r>0?r+"秒":""}`;if(m>0)return`${m}分${r>0?r+"秒":""}`;return`${r}秒`;};

// Return userPref identities[] — with auto-migration from legacy fields
function getUserIdentities(userPref){
  if(!userPref)return[];
  if(Array.isArray(userPref.identities)&&userPref.identities.length)return userPref.identities;
  if(userPref.senderId)return[{id:"legacy",senderId:+userPref.senderId}];
  if(userPref.customName)return[{id:"legacy",customName:userPref.customName,customColor:userPref.customColor||"#3b82f6"}];
  return[];
}
// Resolve identity → {name, color, senderId, avatar?}
function resolveIdentity(ident,senders){
  if(!ident)return null;
  if(ident.senderId){const s=senders.find(x=>x.id===+ident.senderId);if(!s)return null;return{name:s.name,color:s.color,senderId:s.id,isCustom:false};}
  if(ident.customName)return{name:ident.customName,color:ident.customColor||"#3b82f6",senderId:null,isCustom:true};
  return null;
}

// Compute active dept names from cfg.schoolStages (直接就是 dept 名稱，例：["國中","高中"])
function getStageDepts(cfg){
  const stages=Array.isArray(cfg?.schoolStages)&&cfg.schoolStages.length?cfg.schoolStages:["國中","高中"];
  return [...stages];
}

// Consistent dept tint color (for badges, list rows)
function getDeptColor(dept,th){
  if(dept==="國小")return th.pink||"#ec4899";
  if(dept==="國中")return th.acc;
  if(dept==="高中")return th.grn;
  return th.txD;
}
// Format HH:MM time string (or Date) as 12h (上午/下午) or 24h based on format param
const fmtBannerTime=(hhmm,format)=>{
  if(!hhmm)return"--:--";
  let h,m;
  if(typeof hhmm==="string"){const p=hhmm.split(":").map(Number);h=p[0];m=p[1]||0;}
  else if(hhmm instanceof Date){h=hhmm.getHours();m=hhmm.getMinutes();}
  else return"--:--";
  const mm=String(m).padStart(2,"0");
  if(format==="12h"){const ampm=h<12?"上午":"下午";const h12=h===0?12:(h>12?h-12:h);return`${ampm} ${String(h12).padStart(2,"0")}:${mm}`;}
  return`${String(h).padStart(2,"0")}:${mm}`;
};
// Convert hex color to rgba with alpha
const hexToRgba=(color,alpha)=>{
  if(!color)return`rgba(251,191,36,${alpha})`;
  if(color.startsWith("rgba"))return color;
  if(color.startsWith("rgb("))return color.replace("rgb(","rgba(").replace(")",`,${alpha})`);
  if(color.startsWith("#")){let hex=color.slice(1);if(hex.length===3)hex=hex.split("").map(c=>c+c).join("");const r=parseInt(hex.slice(0,2),16),g=parseInt(hex.slice(2,4),16),b=parseInt(hex.slice(4,6),16);return`rgba(${r},${g},${b},${alpha})`;}
  return color;
};
// Banner time badge with optional progress-fill background (流逝效果).
// `fillPct`: 0~100. undefined = no fill shown. 100 = full (preview state).
// `loop`: true = fill loops from 100%→0% and resets (for edit/preview); false = static at fillPct
// `loopDur`: seconds for one loop cycle (default 6s). Preview uses 18s for relaxed feel.
// `fontSize`: defaults 38 (player/large preview). Use 16 for compact previews.
// Padding and radius scale with fontSize to stay visually consistent with player's 38px/radius-10 ratio (26%).
const BannerTimeBadge=({timeText,color,fillPct,loop,loopDur,fontSize,extraStyle})=>{
  const clr=color||"#fbbf24";
  const fs=fontSize||38;
  // Scale padding/radius relative to fontSize, matching player's 38px→5/29/10 ratio
  const padV=Math.max(2,Math.round(fs*5/38));
  const padH=Math.max(8,Math.round(fs*29/38));
  const radius=Math.max(4,Math.round(fs*10/38));
  const showFill=loop||(fillPct!==undefined&&fillPct>=0);
  const dur=loopDur||6;
  const animStyle=loop?{
    animation:`bannerTimeShrink ${dur}s linear infinite`,
    width:"100%",
  }:{
    width:(fillPct||0)+"%",
    transition:"width 200ms linear",
  };
  return <>
    {loop&&<style>{`@keyframes bannerTimeShrink{0%{width:100%}100%{width:0%}}`}</style>}
    <span style={{position:"relative",overflow:"hidden",padding:`${padV}px ${padH}px`,borderRadius:radius,background:hexToRgba(clr,.12),color:clr,fontWeight:700,fontSize:fs,border:`1px solid ${hexToRgba(clr,.25)}`,textShadow:"-1px -1px 0 rgba(0,0,0,.6),1px -1px 0 rgba(0,0,0,.6),-1px 1px 0 rgba(0,0,0,.6),1px 1px 0 rgba(0,0,0,.6),0 1px 4px rgba(0,0,0,.4)",fontFamily:"inherit",display:"inline-block",lineHeight:1.3,...extraStyle}}>
      {showFill&&<span style={{position:"absolute",top:0,left:0,bottom:0,background:hexToRgba(clr,.35),pointerEvents:"none",zIndex:0,...animStyle}}/>}
      <span style={{position:"relative",zIndex:1}}>{timeText}</span>
    </span>
  </>;
};
function calcRepeatDates(startDate,mode,weekDays,weeks){
  const w=weeks?+weeks:520; // 空=永久，10年
  const dates=[];const start=new Date(startDate);const end=new Date(start);end.setDate(end.getDate()+w*7);
  for(let d=new Date(start);d<end;d.setDate(d.getDate()+1)){
    if(mode==="daily"||(mode==="weekly"&&weekDays.includes(d.getDay()))){
      dates.push(new Date(d));
    }
  }
  return dates;
}
const same=(a,b)=>a&&b&&a.getFullYear()===b.getFullYear()&&a.getMonth()===b.getMonth()&&a.getDate()===b.getDate();
const addS=(t,s)=>{const p=t.split(":").map(Number);const base=p[0]*3600+(p[1]||0)*60+(p[2]||0);const x=base+s;return`${p2(Math.floor(x/3600)%24)}:${p2(Math.floor((x%3600)/60))}:${p2(x%60)}`;};
const subS=(t,s)=>{const p=t.split(":").map(Number);const base=p[0]*3600+(p[1]||0)*60+(p[2]||0);const x=Math.max(0,base-s);return`${p2(Math.floor(x/3600)%24)}:${p2(Math.floor((x%3600)/60))}:${p2(x%60)}`;};
const toMin=t=>{const p=t.split(":").map(Number);return p[0]*60+(p[1]||0);};
const toSec=t=>{const p=t.split(":").map(Number);return p[0]*3600+(p[1]||0)*60+(p[2]||0);};
function calDays(y,m){const f=new Date(y,m,1).getDay(),d=new Date(y,m+1,0).getDate(),a=[];for(let i=0;i<f;i++)a.push(null);for(let i=1;i<=d;i++)a.push(new Date(y,m,i));return a;}
function gradeMapMulti(rooms,depts){const g={};depts.forEach(dept=>{const rs=rooms.filter(r=>r.dept===dept);const grades={};rs.forEach(r=>{const m=r.name.match(/^(\d+)年/);if(m){if(!grades[m[1]])grades[m[1]]=[];grades[m[1]].push(r);}});Object.entries(grades).sort().forEach(([grade,cls])=>{const label=depts.length>1?dept+" "+grade+"年級":grade+"年級";g[label]=cls;});});return g;}
// Given selected room ids + all rooms, produce a compact human-readable label
// Tries to detect: 全校 / 整個國中 / 整個高中 / 某年級全部 / 班級範圍合併
function smartRoomsLabel(selectedRooms,allRooms){
  if(!selectedRooms.length)return{parts:[],total:0};
  const total=selectedRooms.length;
  const byDept={};
  selectedRooms.forEach(r=>{if(!byDept[r.dept])byDept[r.dept]=[];byDept[r.dept].push(r);});
  // Check entire school
  const allDeptsInSystem=[...new Set(allRooms.map(r=>r.dept))];
  const coveredDepts=Object.keys(byDept);
  const isSingleStageSystem=allDeptsInSystem.length<=1;
  const fullSchool=allDeptsInSystem.length===coveredDepts.length&&coveredDepts.every(d=>byDept[d].length===allRooms.filter(r=>r.dept===d).length);
  if(fullSchool)return{parts:[{type:"all-school",label:isSingleStageSystem?"全部班級":"全校",count:total,meta:`共 ${total} 班`}],total};
  // Per-dept analysis
  const parts=[];
  Object.entries(byDept).forEach(([dept,rs])=>{
    const allInDept=allRooms.filter(r=>r.dept===dept);
    if(rs.length===allInDept.length){parts.push({type:"full-dept",label:dept,count:rs.length,dept,meta:`全部 · 共 ${rs.length} 班`});return;}
    // Group by grade
    const byGrade={};
    rs.forEach(r=>{const m=r.name.match(/^(\d+)年/);if(m){if(!byGrade[m[1]])byGrade[m[1]]=[];byGrade[m[1]].push(r);}else{if(!byGrade.__other)byGrade.__other=[];byGrade.__other.push(r);}});
    Object.entries(byGrade).sort().forEach(([g,grs])=>{
      if(g==="__other"){grs.forEach(r=>parts.push({type:"class",label:r.name,count:1,dept}));return;}
      const allInGrade=allInDept.filter(r=>r.name.startsWith(g+"年"));
      if(grs.length===allInGrade.length&&allInGrade.length>1){
        parts.push({type:"full-grade",label:`${g}年級 全部`,count:grs.length,dept});return;
      }
      // Compact consecutive class numbers
      const nums=grs.map(r=>{const m=r.name.match(/^(\d+)年(\d+)班$/);return m?+m[2]:null;}).filter(n=>n!==null).sort((a,b)=>a-b);
      let i=0;
      while(i<nums.length){
        let j=i;while(j+1<nums.length&&nums[j+1]===nums[j]+1)j++;
        if(j-i>=2)parts.push({type:"class-range",label:`${g}年${nums[i]}~${nums[j]}班`,count:j-i+1,dept});
        else for(let k=i;k<=j;k++)parts.push({type:"class",label:`${g}年${nums[k]}班`,count:1,dept});
        i=j+1;
      }
    });
  });
  return{parts,total};
}

/* ═══ THEMES ═══ */
const dark={bg:"#09090b",bg2:"#111113",sf:"#18181b",sf2:"#1f1f23",sf3:"#27272a",bd:"#27272a",bd2:"#3f3f46",tx:"#fafafa",txD:"#a1a1aa",txM:"#52525b",acc:"#3b82f6",accL:"#60a5fa",grn:"#22c55e",red:"#ef4444",amb:"#f59e0b",pink:"#ec4899",cyan:"#06b6d4",expired:"#1a1a1e"};
const light={bg:"#f8f9fb",bg2:"#ffffff",sf:"#ffffff",sf2:"#f4f4f5",sf3:"#e4e4e7",bd:"#e4e4e7",bd2:"#d4d4d8",tx:"#09090b",txD:"#3f3f46",txM:"#a1a1aa",acc:"#2563eb",accL:"#2563eb",grn:"#16a34a",red:"#dc2626",amb:"#d97706",pink:"#db2777",cyan:"#0891b2",expired:"#f0f0f2"};
const font="'Inter','Noto Sans TC',system-ui,-apple-system,sans-serif";
const mono="'JetBrains Mono','SF Mono','Fira Code',Consolas,monospace";

/* ═══ UI KIT ═══ */
function Card({children,style,t:th}){return <div style={{background:th.sf,border:`1px solid ${th.bd}`,borderRadius:12,padding:20,boxShadow:"0 1px 3px rgba(0,0,0,.04)",...style}}>{children}</div>;}
function Badge({children,color,t:th}){const cl=color||th.acc;return <span style={{display:"inline-flex",alignItems:"center",padding:"2px 8px",borderRadius:6,fontSize:11,fontWeight:600,background:cl+"18",color:cl,border:`1px solid ${cl}30`,whiteSpace:"nowrap",letterSpacing:.2}}>{children}</span>;}
function Btn({children,onClick,disabled,primary,danger,small,ghost,t:th,style}){
  return <button onClick={onClick} disabled={disabled} style={{display:"inline-flex",alignItems:"center",justifyContent:"center",gap:6,padding:small?"5px 12px":"8px 16px",borderRadius:8,border:primary||danger?"none":`1px solid ${th.bd}`,fontSize:small?12:13,fontWeight:600,cursor:"pointer",fontFamily:font,background:danger?th.red:primary?th.acc:ghost?"transparent":th.sf2,color:danger||primary?"#fff":th.tx,opacity:disabled?.4:1,pointerEvents:disabled?"none":"auto",transition:"all .15s ease",boxShadow:primary||danger?"0 1px 2px rgba(0,0,0,.12)":"none",...style}}>{children}</button>;
}
function Inp({value,onChange,placeholder,type="text",t:th,style,...r}){
  return <input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} style={{width:"100%",padding:"8px 12px",borderRadius:8,background:th.bg2,border:`1px solid ${th.bd}`,color:th.tx,fontSize:13,fontFamily:font,outline:"none",transition:"border-color .15s",...style}} {...r}/>;
}
function Sel({value,onChange,children,t:th,style}){
  return <select value={value} onChange={e=>onChange(e.target.value)} style={{width:"100%",padding:"8px 12px",borderRadius:8,background:th.bg2,border:`1px solid ${th.bd}`,color:th.tx,fontSize:13,fontFamily:font,outline:"none",cursor:"pointer",transition:"border-color .15s",...style}}>{children}</select>;
}
function Field({label,children,t:th}){return <div style={{marginBottom:14}}><label style={{display:"block",fontSize:11,color:th?.txM||"#a1a1aa",fontWeight:600,marginBottom:5,letterSpacing:.3,textTransform:"uppercase"}}>{label}</label>{children}</div>;}
function Chip({on,children,onClick,color,t:th,style}){
  return <button onClick={onClick} style={{display:"inline-flex",alignItems:"center",justifyContent:"center",padding:"6px 14px",borderRadius:8,fontSize:13,fontWeight:500,border:`1.5px solid ${on?(color||th.acc):th.bd}`,background:on?`${color||th.acc}12`:"transparent",color:on?(color||th.accL):th.txD,cursor:"pointer",fontFamily:font,transition:"all .15s ease",...style}}>{children}</button>;
}

// 身份選擇器 — 視 identities 數量智慧切換：
//   - 0 個：顯示警告提示
//   - 1 個：顯示單一 badge（無法切換，自動選為該身份）
//   - 多個：顯示當前 badge + ▾，點擊彈出身份清單
// props: identities (陣列), senders, currentIdent (目前選中的 identity object), onSelect(ident), t (theme)
function IdentityPicker({identities,senders,currentIdent,onSelect,t:th,disabled}){
  const [open,setOpen]=useState(false);
  const popRef=useRef(null);
  useEffect(()=>{if(!open)return;const close=e=>{if(popRef.current&&!popRef.current.contains(e.target))setOpen(false);};document.addEventListener("mousedown",close);return()=>document.removeEventListener("mousedown",close);},[open]);

  const resolve=(ident)=>{
    if(!ident)return null;
    if(ident.senderId){const s=senders.find(x=>x.id===ident.senderId);return s?{label:s.name,color:s.color,deptLabel:s.pid?senders.find(x=>x.id===s.pid)?.name:"處室"}:null;}
    return {label:ident.customName,color:ident.customColor||"#3b82f6",deptLabel:"自訂"};
  };

  if(identities.length===0){
    return <div style={{padding:"10px 12px",borderRadius:8,background:th.amb+"12",border:`1px solid ${th.amb}33`,fontSize:12,color:th.amb,lineHeight:1.6}}>
      <span style={{display:"inline-flex",alignItems:"center",gap:5}}><IC.warn s={13}/> 尚未設定任何發話身份，請先到「個人設定」頁新增身份</span>
    </div>;
  }

  const curInfo=resolve(currentIdent);
  const isSingle=identities.length===1;

  // 共用 badge 樣式 — 與播放端 banner sender 相同
  const badgeStyle={display:"inline-flex",alignItems:"center",padding:"8px 18px",borderRadius:8,fontWeight:700,fontSize:14,fontFamily:"'Noto Sans TC',sans-serif"};

  if(isSingle){
    // 單一身份 — 靜態 badge
    const info=curInfo||resolve(identities[0]);
    if(!info)return null;
    return <div style={{...badgeStyle,background:info.color+"33",color:info.color,borderLeft:`3px solid ${info.color}`,width:"fit-content"}}>
      <span>{info.label}</span>
      <span style={{fontSize:10,opacity:.6,marginLeft:8,fontWeight:400}}>· {info.deptLabel}</span>
    </div>;
  }

  // 多身份 — 可點擊展開 popover
  return <div style={{position:"relative",display:"inline-block"}} ref={popRef}>
    <button onClick={()=>!disabled&&setOpen(!open)} disabled={disabled} style={{...badgeStyle,background:(curInfo?.color||th.txM)+"33",color:curInfo?.color||th.txD,borderLeft:`3px solid ${curInfo?.color||th.bd}`,border:"none",borderLeftWidth:3,borderLeftStyle:"solid",borderLeftColor:curInfo?.color||th.bd,cursor:disabled?"not-allowed":"pointer",opacity:disabled?.6:1,gap:10}}>
      <span>{curInfo?.label||"— 請選擇 —"}</span>
      {curInfo&&<span style={{fontSize:10,opacity:.6,fontWeight:400}}>· {curInfo.deptLabel}</span>}
      <span style={{fontSize:11,opacity:.7,marginLeft:"auto"}}>▾</span>
    </button>
    {open&&<div style={{position:"absolute",top:"calc(100% + 6px)",left:0,minWidth:"100%",zIndex:50,background:th.sf,border:`1px solid ${th.bd}`,borderRadius:10,padding:5,boxShadow:"0 8px 24px rgba(0,0,0,.25)",display:"flex",flexDirection:"column",gap:3}}>
      {identities.map(ident=>{
        const info=resolve(ident);if(!info)return null;
        const on=currentIdent?.id===ident.id;
        return <button key={ident.id} onClick={()=>{onSelect(ident);setOpen(false);}} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 12px",borderRadius:7,border:"none",cursor:"pointer",background:on?info.color+"22":"transparent",textAlign:"left",fontFamily:"inherit",whiteSpace:"nowrap"}} onMouseEnter={e=>{if(!on)e.currentTarget.style.background=th.sf2;}} onMouseLeave={e=>{if(!on)e.currentTarget.style.background="transparent";}}>
          <span style={{padding:"3px 10px",borderRadius:5,background:info.color+"33",color:info.color,fontWeight:700,fontSize:12,borderLeft:`2px solid ${info.color}`}}>{info.label}</span>
          <span style={{fontSize:10,color:th.txM}}>{info.deptLabel}</span>
          {on&&<span style={{marginLeft:"auto",color:info.color,fontSize:11,fontWeight:700}}>✓</span>}
        </button>;
      })}
    </div>}
  </div>;
}

function Title({children,sub,action,t:th}){
  return <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20}}><div><h2 style={{margin:0,fontSize:20,fontWeight:700,color:th.tx,letterSpacing:-.3}}>{children}</h2>{sub&&<div style={{fontSize:12,color:th.txM,marginTop:3}}>{sub}</div>}</div>{action}</div>;
}
function Modal({title,onClose,children,width=540,t:th,resizable,titleExtra}){
  const [w,setW]=useState(width);const [h,setH]=useState(null);
  const onResizeStart=useCallback((e)=>{
    e.preventDefault();const startX=e.clientX;const startY=e.clientY;const startW=w;const startH=h||e.target.closest('[data-modal]').offsetHeight;
    const onMove=ev=>{setW(Math.max(400,startW+(ev.clientX-startX)*2));setH(Math.max(300,startH+(ev.clientY-startY)*2));};
    const onUp=()=>{window.removeEventListener('mousemove',onMove);window.removeEventListener('mouseup',onUp);};
    window.addEventListener('mousemove',onMove);window.addEventListener('mouseup',onUp);
  },[w,h]);
  return <div><div onClick={onClose} style={{position:"fixed",inset:0,zIndex:100,background:"rgba(0,0,0,.5)",backdropFilter:"blur(4px)"}}/>
    <div data-modal="1" style={{position:"fixed",top:"50%",left:"50%",transform:"translate(-50%,-50%)",zIndex:101,background:th.sf,borderRadius:14,border:`1px solid ${th.bd}`,width:w,maxWidth:"94vw",maxHeight:h||"88vh",height:h||undefined,overflow:"hidden",boxShadow:"0 16px 70px rgba(0,0,0,.25),0 0 0 1px rgba(0,0,0,.08)",display:"flex",flexDirection:"column"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"14px 22px",borderBottom:`1px solid ${th.bd}`,position:"sticky",top:0,background:th.sf,zIndex:1,borderRadius:"14px 14px 0 0",flexShrink:0,gap:12}}>
        <span style={{fontSize:15,fontWeight:600,color:th.tx,letterSpacing:-.2}}>{title}</span>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          {titleExtra}
          <button onClick={onClose} style={{background:th.sf2,border:`1px solid ${th.bd}`,borderRadius:6,color:th.txD,cursor:"pointer",padding:"4px 12px",fontSize:12,fontFamily:"inherit",fontWeight:600,boxSizing:"border-box",transition:"all .15s"}}>✕</button>
        </div>
      </div>
      <div style={{padding:22,flex:1,overflow:"auto"}}>{children}</div>
      {resizable&&<div onMouseDown={onResizeStart} style={{position:"absolute",bottom:0,right:0,width:20,height:20,cursor:"nwse-resize",opacity:.3}} title="拖曳調整大小">
        <svg width="20" height="20" viewBox="0 0 20 20"><path d="M14 20L20 14M10 20L20 10M6 20L20 6" stroke={th.txM} strokeWidth="1.5" fill="none"/></svg>
      </div>}
      <style>{`[data-modal] *::-webkit-scrollbar{width:5px;height:5px}[data-modal] *::-webkit-scrollbar-track{background:transparent}[data-modal] *::-webkit-scrollbar-thumb{background:${th.bd};border-radius:3px}[data-modal] *::-webkit-scrollbar-thumb:hover{background:${th.txM}}`}</style>
    </div>
  </div>;
}

function Timeline({scheds,date,onSelect,onChain,senders,height,t:th,cfg,previewSt,previewDur,previewLabel,previewColor}){
  const cfgTS=cfg?.timelineStart??7, cfgTE=cfg?.timelineEnd??18;
  const ref=useRef(null);
  const [hoverX,setHoverX]=useState(null);
  const [hoverTime,setHoverTime]=useState("");
  const [chainPop,setChainPop]=useState(null);
  const [zoom,setZoom]=useState(1); // 1 = full view, max zoom shows 10min intervals
  const [panOffset,setPanOffset]=useState(0); // in minutes from start
  const [dragging,setDragging]=useState(null);

  // 若為今天，自動將視圖起始點捲到「當前時刻前 30 分鐘」，避免浪費版面在已過去的早晨時段
  // 使用 date 當 dependency，切換日期會重算；使用者手動 pan/zoom/reset 後不會覆蓋
  const autoScrolledRef=useRef(null);
  useEffect(()=>{
    const n=new Date();
    const isTodayNow=same(date,n);
    const dateKey=fmtD(date);
    // 已經自動捲過此日期就不再重複；使用者手動操作後也不回彈（靠 dateKey 比對）
    if(autoScrolledRef.current===dateKey)return;
    autoScrolledRef.current=dateKey;
    if(!isTodayNow){
      // 非今天：回到完整視圖從頭開始
      setPanOffset(0);setZoom(1);
      return;
    }
    const nowMinNow=n.getHours()*60+n.getMinutes();
    const tsMin=(cfg?.timelineStart??7)*60;
    const teMin=(cfg?.timelineEnd??18)*60;
    const total=teMin-tsMin;
    // 「現在 - 30 分鐘」為目標起點，但至少不早於 cfg 起始
    const targetStart=Math.max(tsMin,nowMinNow-30);
    // 若現在已超過 cfg 結束時間，不自動捲（代表今天的時段結束，顯示完整時間軸）
    if(nowMinNow>=teMin){setPanOffset(0);setZoom(1);return;}
    // 如果 target 距離 cfg 結束不到 90 分鐘，拉開一些避免右側太空
    const visibleMin=Math.max(90,teMin-targetStart);
    const newZoom=Math.max(1,Math.min(total/10,total/visibleMin));
    const newVisible=total/newZoom;
    const newMaxPan=Math.max(0,total-newVisible);
    const newPan=Math.max(0,Math.min(newMaxPan,targetStart-tsMin));
    setZoom(newZoom);setPanOffset(newPan);
  },[date,cfg?.timelineStart,cfg?.timelineEnd]);

  const ds=scheds.filter(s=>s.date===fmtD(date));
  const totalRange=(cfgTE-cfgTS)*60; // total minutes in config range
  const visibleRange=totalRange/zoom; // visible minutes at current zoom
  const maxPan=Math.max(0,totalRange-visibleRange);
  const clampPan=v=>Math.max(0,Math.min(maxPan,v));
  const viewStart=cfgTS*60+clampPan(panOffset); // visible start in minutes
  const viewEnd=viewStart+visibleRange;

  // Position: convert time string to percentage within visible window
  const pos=ts=>{const m=toMin(ts);return Math.max(0,Math.min(100,((m-viewStart)/visibleRange)*100));};
  // Percentage to time (snaps to 1min at high zoom, 5min at low zoom)
  const pctToTime=pct=>{
    const snap=zoom>=3?1:5;
    const mins=Math.round((viewStart+pct*visibleRange)/snap)*snap;
    return{h:Math.floor(mins/60),m:mins%60};
  };

  const getRelPct=e=>{if(!ref.current)return null;const r=ref.current.getBoundingClientRect();const x=e.clientX-r.left;const w=r.width;if(x<0||x>w)return null;return x/w;};

  const now=new Date();
  const isToday=same(date,now);
  const dateIsPast=new Date(date.getFullYear(),date.getMonth(),date.getDate())<new Date(now.getFullYear(),now.getMonth(),now.getDate());
  const nowMin=now.getHours()*60+now.getMinutes();
  const nowPct=isToday?Math.max(0,Math.min(100,((nowMin-viewStart)/visibleRange)*100)):0;

  const click=e=>{setChainPop(null);if(!onSelect||dateIsPast)return;const pct=getRelPct(e);if(pct===null)return;const{h,m}=pctToTime(pct);
    if(isToday){const clickMin=h*60+m;if(clickMin<=nowMin)return;}
    const ct2=`${p2(h)}:${p2(m)}`;if(!ds.some(s=>ct2>=s.st&&ct2<s.et)&&h>=0&&h<24)onSelect(h,m);};

  const onMove=e=>{
    if(!ref.current)return;
    // Handle drag pan
    if(dragging!==null){
      const dx=e.clientX-dragging.startX;
      const r=ref.current.getBoundingClientRect();
      const w=r.width-PAD*2;
      const minsPx=visibleRange/w;
      setPanOffset(clampPan(dragging.startPan-dx*minsPx));
      return;
    }
    const r=ref.current.getBoundingClientRect();const rawX=e.clientX-r.left;setHoverX(rawX);
    const pct=getRelPct(e);
    if(pct!==null&&pct>=0&&pct<=1){
      const snap=zoom>=3?1:5;
      const mins=Math.round((viewStart+pct*visibleRange)/snap)*snap;
      setHoverTime(`${p2(Math.floor(mins/60))}:${p2(mins%60)}`);
    }else{setHoverTime("");}
  };

  // Scroll zoom — 需要 preventDefault 阻止頁面捲動，所以必須用 non-passive native listener
  // （React 的 onWheel 是 passive listener，preventDefault 會被瀏覽器忽略並跳警告）
  // 用 ref 包裝最新 handler，避免 effect 每次 state 變都 re-bind
  const wheelHandlerRef=useRef(null);
  wheelHandlerRef.current=e=>{
    e.preventDefault();
    const maxZoom=totalRange/10;
    const newZoom=Math.max(1,Math.min(maxZoom,zoom*(e.deltaY<0?1.3:1/1.3)));
    const newVisible=totalRange/newZoom;
    const newMaxPan=Math.max(0,totalRange-newVisible);
    // Zoom toward mouse position
    const pct=getRelPct(e);
    if(pct!==null){
      const mouseMin=viewStart+pct*visibleRange;
      const newPan=mouseMin-pct*newVisible-cfgTS*60;
      setPanOffset(Math.max(0,Math.min(newMaxPan,newPan)));
    } else {
      // Fallback: zoom from center
      const centerMin=viewStart+visibleRange/2;
      const newPan=centerMin-newVisible/2-cfgTS*60;
      setPanOffset(Math.max(0,Math.min(newMaxPan,newPan)));
    }
    setZoom(newZoom);
  };
  useEffect(()=>{
    const el=ref.current;
    if(!el)return;
    const listener=e=>wheelHandlerRef.current&&wheelHandlerRef.current(e);
    el.addEventListener('wheel',listener,{passive:false});
    return ()=>el.removeEventListener('wheel',listener);
  },[]);

  // Middle mouse or shift+drag for panning
  const onMouseDown=e=>{
    if(e.button===1||(e.button===0&&e.shiftKey)){
      e.preventDefault();
      setDragging({startX:e.clientX,startPan:panOffset});
      const onUp=()=>{setDragging(null);window.removeEventListener('mouseup',onUp);};
      window.addEventListener('mouseup',onUp);
    }
  };

  // Generate tick marks based on zoom level
  const ticks=[];
  const tickInterval=zoom>=6?10:zoom>=3?15:zoom>=1.5?30:60; // minutes
  const subTick=zoom>=6?5:zoom>=3?10:zoom>=1.5?15:30;
  for(let m=Math.ceil(viewStart/tickInterval)*tickInterval;m<=viewEnd;m+=tickInterval){
    const pct=((m-viewStart)/visibleRange)*100;
    if(pct>=0&&pct<=100) ticks.push({m,pct,major:true});
  }
  // Sub-ticks
  for(let m=Math.ceil(viewStart/subTick)*subTick;m<=viewEnd;m+=subTick){
    const pct=((m-viewStart)/visibleRange)*100;
    if(pct>=0&&pct<=100&&!ticks.find(t=>t.m===m)) ticks.push({m,pct,major:false});
  }

  const H=height||50;
  const vsM=Math.floor(viewStart);const veM=Math.floor(viewEnd);
  const rangeLabel=`${p2(Math.floor(vsM/60))}:${p2(vsM%60)}–${p2(Math.floor(veM/60))}:${p2(veM%60)}`;

  return <div style={{marginBottom:14}}>
    <div style={{display:"flex",justifyContent:"space-between",marginBottom:6,alignItems:"center"}}>
      <span style={{fontSize:11,color:th.txM,fontWeight:600}}>日行程 {rangeLabel}</span>
      <div style={{display:"flex",gap:6,alignItems:"center"}}>
        {(()=>{
          const canShowNow=isToday&&nowMin>=cfgTS*60&&nowMin<cfgTE*60;
          const hasZoom=zoom>1||panOffset>0;
          // 已縮放 → 顯示「重置」；未縮放且今日營業時間內 → 顯示「現在」
          if(hasZoom){
            return <button onClick={()=>{setZoom(1);setPanOffset(0);autoScrolledRef.current=null;}} style={{fontSize:10,color:th.txM,background:th.sf2,border:`1px solid ${th.bd}`,borderRadius:4,padding:"1px 6px",cursor:"pointer",fontFamily:"inherit"}} title="顯示完整日間時間軸"><span style={{display:"inline-flex",alignItems:"center",gap:4}}><IC.refresh s={12}/> 重置</span></button>;
          }
          if(canShowNow){
            return <button onClick={()=>{
              const tsMin=cfgTS*60,teMin=cfgTE*60,total=teMin-tsMin;
              const targetStart=Math.max(tsMin,nowMin-30);
              const visibleMin=Math.max(90,teMin-targetStart);
              const newZoom=Math.max(1,Math.min(total/10,total/visibleMin));
              const newVisible=total/newZoom;
              const newMaxPan=Math.max(0,total-newVisible);
              setZoom(newZoom);setPanOffset(Math.max(0,Math.min(newMaxPan,targetStart-tsMin)));
            }} style={{fontSize:10,color:th.accL,background:th.acc+"15",border:`1px solid ${th.acc}44`,borderRadius:4,padding:"1px 6px",cursor:"pointer",fontFamily:"inherit",fontWeight:600}} title="視圖捲到當前時間"><IC.pin s={10}/> 現在</button>;
          }
          return null;
        })()}
        {onSelect&&!dateIsPast&&<span style={{fontSize:10,color:th.txM}}>滾輪縮放 · 點擊選取</span>}
      </div>
    </div>
    <div ref={ref} onClick={dateIsPast?undefined:click} onMouseMove={onMove} onMouseLeave={()=>{setHoverX(null);setHoverTime("");}} onMouseDown={onMouseDown}
      style={{position:"relative",height:H,background:th.bg2,borderRadius:10,border:`1px solid ${th.bd}`,cursor:dragging?"grabbing":onSelect&&!dateIsPast?"crosshair":"default",overflow:"visible",userSelect:"none"}}>
      <div style={{position:"relative",width:"100%",height:"100%"}}>
        {/* Tick marks (inside bar) — skip labels too close to edges where range labels live */}
        {ticks.map(({m,pct,major})=><div key={m}>
          <div style={{position:"absolute",left:`${pct}%`,top:0,bottom:0,width:1,background:th.bd,opacity:major?.5:.2}}/>
          {major&&pct>6&&pct<94&&<span style={{position:"absolute",left:`${pct}%`,bottom:-16,transform:"translateX(-50%)",fontSize:9,color:th.txM,fontWeight:500,pointerEvents:"none",userSelect:"none",whiteSpace:"nowrap"}}>{p2(Math.floor(m/60))}:{p2(m%60)}</span>}
        </div>)}
        {/* Edge time labels (below bar, at edges) — bold and stand out from tick labels */}
        <span style={{position:"absolute",left:0,bottom:-16,fontSize:10,color:th.txD,fontWeight:700,pointerEvents:"none",userSelect:"none"}}>{p2(Math.floor(vsM/60))}:{p2(vsM%60)}</span>
        <span style={{position:"absolute",right:0,bottom:-16,fontSize:10,color:th.txD,fontWeight:700,pointerEvents:"none",userSelect:"none"}}>{p2(Math.floor(veM/60))}:{p2(veM%60)}</span>
        {/* Past time overlay */}
        {isToday&&nowPct>0&&<div style={{position:"absolute",left:0,top:0,bottom:0,width:`${Math.min(100,nowPct)}%`,background:th.tx,opacity:.06,borderRadius:"8px 0 0 8px",zIndex:1,pointerEvents:"none"}}/>}
        {isToday&&nowPct>0&&nowPct<100&&<div style={{position:"absolute",left:`${nowPct}%`,top:0,bottom:0,width:2,background:th.red,opacity:.6,zIndex:11,pointerEvents:"none"}}><div style={{position:"absolute",top:-3,left:-3,width:8,height:8,borderRadius:4,background:th.red}}/></div>}
        {dateIsPast&&<div style={{position:"absolute",inset:0,background:th.tx,opacity:.06,borderRadius:8,zIndex:1,pointerEvents:"none"}}/>}
        {/* Preview block for currently selected time */}
        {previewSt&&previewDur>0&&(()=>{
          const stMin=toMin(previewSt);
          const etMin=stMin+previewDur/60;
          const l=((stMin-viewStart)/visibleRange)*100;
          const r=((etMin-viewStart)/visibleRange)*100;
          const w=r-l;
          if(w<=0||l>100||r<0)return null;
          const clippedL=Math.max(0,l);
          const clippedW=Math.min(w,100-clippedL);
          const pc=previewColor||th.acc;
          const lbl=previewLabel||"預覽";
          return <div style={{position:"absolute",left:`${clippedL}%`,width:`${Math.max(clippedW,.5)}%`,top:2,bottom:2,borderRadius:6,background:`${pc}33`,border:`2px dashed ${pc}`,zIndex:5,pointerEvents:"none",display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden"}}>
            <span style={{fontSize:w>4?10:0,fontWeight:700,color:pc,whiteSpace:"nowrap",textShadow:"0 1px 2px rgba(0,0,0,.3)",maxWidth:"90%",overflow:"hidden",textOverflow:"ellipsis",padding:"0 4px"}}>{lbl}</span>
          </div>;
        })()}
        {/* Schedule blocks */}
        {ds.map(s=>{const l=pos(s.st),r2=pos(s.et),w=r2-l;if(w<=0||l>100||r2<0)return null;const sc=senders?.find(x=>x.name===s.sender);const clr=sc?.color||s.color||th.acc;const exp=isExpired(s);
          return <div key={s.id} title={`${s.st}–${s.et} ${s.sender||""}`}
            onClick={e=>{if(!onChain||exp||dateIsPast)return;e.stopPropagation();setChainPop(chainPop?.schedId===s.id?null:{schedId:s.id,left:l+w/2});}}
            style={{position:"absolute",left:`${Math.max(0,l)}%`,width:`${Math.max(Math.min(w,100-Math.max(0,l)),.5)}%`,top:4,bottom:4,borderRadius:6,background:clr+(dateIsPast?"22":"44"),border:`1px solid ${clr}${dateIsPast?"44":"88"}`,display:"flex",alignItems:"center",justifyContent:"center",overflow:"visible",zIndex:chainPop?.schedId===s.id?20:2,opacity:dateIsPast?.5:1,cursor:onChain&&!exp&&!dateIsPast?"pointer":"default"}}>
            <span style={{fontSize:w>3?9:0,fontWeight:700,color:clr,whiteSpace:"nowrap",pointerEvents:"none"}}>{s.sender||""}</span>
            {chainPop?.schedId===s.id&&<div style={{position:"absolute",top:-36,left:"50%",transform:"translateX(-50%)",display:"flex",gap:4,zIndex:30}} onClick={e=>e.stopPropagation()}>
              <button onClick={()=>{onChain(s,"before");setChainPop(null);}} style={{padding:"4px 10px",fontSize:11,fontWeight:700,borderRadius:5,border:`1px solid ${th.bd}`,background:th.sf2||th.bg2,color:th.tx,cursor:"pointer",whiteSpace:"nowrap",boxShadow:"0 2px 8px rgba(0,0,0,.25)"}}>+前</button>
              <button onClick={()=>{onChain(s,"after");setChainPop(null);}} style={{padding:"4px 10px",fontSize:11,fontWeight:700,borderRadius:5,border:`1px solid ${th.bd}`,background:th.sf2||th.bg2,color:th.tx,cursor:"pointer",whiteSpace:"nowrap",boxShadow:"0 2px 8px rgba(0,0,0,.25)"}}>+後</button>
            </div>}
          </div>;
        })}
        {/* Hover line */}
        {hoverX!==null&&hoverTime&&!dragging&&<div style={{position:"absolute",left:hoverX,top:0,bottom:0,width:1,background:th.acc,opacity:.7,zIndex:10,pointerEvents:"none"}}>
          <div style={{position:"absolute",top:-22,left:"50%",transform:"translateX(-50%)",background:th.sf3||th.sf2,border:`1px solid ${th.bd2||th.bd}`,borderRadius:5,padding:"2px 8px",fontSize:11,fontWeight:700,color:th.accL,whiteSpace:"nowrap",pointerEvents:"none",boxShadow:"0 2px 8px rgba(0,0,0,.3)"}}>{hoverTime}</div>
        </div>}
      </div>
    </div>
    <div style={{height:16}}/>
  </div>;
}

/* Helper: check if a schedule is expired */
function isExpired(s){
  const now=new Date();const todayStr=fmtD(now);const nowMin=now.getHours()*60+now.getMinutes();
  if(s.date<todayStr) return true;
  if(s.date===todayStr && toMin(s.et)<=nowMin) return true;
  return false;
}

/* Helper: select-all label — 動態依實際 rooms 的 dept 判斷 */
function selectLabel(rids,rooms){
  const allDepts=[...new Set(rooms.map(r=>r.dept).filter(Boolean))];
  const fullyCovered=allDepts.filter(d=>{
    const deptRooms=rooms.filter(r=>r.dept===d);
    return deptRooms.length>0&&deptRooms.every(r=>rids.includes(r.id));
  });
  if(fullyCovered.length===0)return rids.length>0?`已選 ${rids.length} 間教室`:null;
  if(fullyCovered.length===allDepts.length)return allDepts.length===1?`✓ 已全選 ${allDepts[0]}`:"✓ 已選擇全校廣播";
  return `✓ 已全選 ${fullyCovered.join("、")}`;
}

/* ═══ APP ═══ */
export default function App(){
  const [tab,setTab]=useState("schedule");
  const [models,setModels]=useState([]);const [rooms,setRooms]=useState([]);const [senders,setSenders]=useState([]);const [classOfficers,setClassOfficers]=useState([]);
  const [scheds,setScheds]=useState([]);const [logs,setLogs]=useState([]);
  const [cfg,setCfg]=useState(EMPTY_CFG);const [myIp,setMyIp]=useState("...");const [loading,setLoading]=useState(true);
  const [isDark,setIsDark]=useState(()=>{try{const v=localStorage.getItem('theme');return v?v==='dark':true;}catch(e){return true;}});
  const th=isDark?dark:light;
  useEffect(()=>{try{localStorage.setItem('theme',isDark?'dark':'light');}catch(e){}},[isDark]);

  // 個人偏好設定（存在 localStorage）
  const [userPref,setUserPref]=useState(()=>{try{const v=localStorage.getItem('userPref');return v?JSON.parse(v):{};}catch(e){return {};}});
  const saveUserPref=p=>{setUserPref(p);try{localStorage.setItem('userPref',JSON.stringify(p));}catch(e){}};

  // Calendar state lives here so sidebar can show it
  const [yr,setYr]=useState(new Date().getFullYear());const [mo,setMo]=useState(new Date().getMonth());
  const [selDate,setSelDate]=useState(new Date());

  // 午夜自動跳回當日
  useEffect(()=>{
    const schedMidnight=()=>{
      const now=new Date();
      const tomorrow=new Date(now.getFullYear(),now.getMonth(),now.getDate()+1,0,0,1);
      const ms=tomorrow-now;
      return setTimeout(()=>{
        const today=new Date();
        setSelDate(today);setYr(today.getFullYear());setMo(today.getMonth());
        // 設定下一個午夜
        midnightTimer=schedMidnight();
      },ms);
    };
    let midnightTimer=schedMidnight();
    return()=>clearTimeout(midnightTimer);
  },[]);

  useEffect(()=>{
    Promise.all([api.me(),api.getConfig(),api.getModels(),api.getRooms(),api.getSenders(),api.getSchedules(),api.getLogs(),api.getClassOfficers()])
    .then(([me,config,mods,rms,snds,schs,lgs,stf])=>{setMyIp(me.ip);setCfg(config);setModels(mods);setRooms(rms);setSenders(snds);setScheds(schs);setLogs(lgs);setClassOfficers(stf);setLoading(false);})
    .catch(err=>{console.error("API:",err);setLoading(false);});
  },[]);

  const isAdmin=cfg.adminIps?.includes(myIp);
  const reload=useCallback(async(w)=>{try{
    if(w==="models")setModels(await api.getModels());if(w==="rooms")setRooms(await api.getRooms());
    if(w==="senders")setSenders(await api.getSenders());if(w==="schedules")setScheds(await api.getSchedules());
    if(w==="logs")setLogs(await api.getLogs());if(w==="config")setCfg(await api.getConfig());
    if(w==="classOfficers")setClassOfficers(await api.getClassOfficers());
  }catch(e){console.error(e);}},[]);

  const adminNavs=["stats","room","model","sender","classOfficers","logs","config"];
  const navs=[{id:"schedule",icon:IC.schedule,label:"排程管理"},{id:"broadcast",icon:IC.broadcast,label:"手動插播"},{id:"stats",icon:IC.stats,label:"廣播統計"},{id:"room",icon:IC.room,label:"班級管理"},{id:"model",icon:IC.model,label:"設備型號"},{id:"sender",icon:IC.sender,label:"發話單位"},{id:"classOfficers",icon:IC.classOfficers,label:"班級幹部"},{id:"logs",icon:IC.logs,label:"操作日誌"},{id:"config",icon:IC.config,label:"系統設定"},{id:"profile",icon:IC.profile,label:"個人設定"},{id:"help",icon:IC.help,label:"操作手冊"}].filter(n=>!adminNavs.includes(n.id)||isAdmin);

  const now=new Date();
  const days=useMemo(()=>calDays(yr,mo),[yr,mo]);
  const MO=["1月","2月","3月","4月","5月","6月","7月","8月","9月","10月","11月","12月"];
  const pastDay=d=>new Date(d.getFullYear(),d.getMonth(),d.getDate())<new Date(now.getFullYear(),now.getMonth(),now.getDate());
  const dayS=d=>d?scheds.filter(s=>s.date===fmtD(d)).sort((a,b)=>a.st.localeCompare(b.st)):[];

  if(loading) return <div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"100vh",background:th.bg,color:th.txD,fontFamily:font,fontSize:16}}>載入中...</div>;

  return <div style={{display:"flex",height:"100vh",overflow:"hidden",background:th.bg,color:th.tx,fontFamily:font,fontSize:13}}>
    {/* ── Sidebar ── */}
    <nav style={{width:220,flexShrink:0,background:th.sf,borderRight:`1px solid ${th.bd}`,display:"flex",flexDirection:"column",overflow:"hidden"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"14px 14px 10px",borderBottom:`1px solid ${th.bd}`}}>
        <div style={{fontSize:14,fontWeight:700,letterSpacing:-.2,color:th.tx,display:"flex",alignItems:"center",gap:7}}><IC.radio s={16}/> 廣播排程</div>
        <button onClick={()=>setIsDark(!isDark)} title={isDark?"切換明亮模式":"切換深色模式"} style={{background:th.sf2,border:`1px solid ${th.bd}`,borderRadius:6,padding:"3px 7px",cursor:"pointer",fontSize:13,color:th.txD,transition:"all .15s"}}>{isDark?<IC.sun s={14}/>:<IC.moon s={14}/>}</button>
      </div>

      {/* Nav */}
      <div style={{padding:"6px 6px 2px"}}>
        {navs.map(n=>{const on=tab===n.id;const Ico=n.icon;return <button key={n.id} onClick={()=>setTab(n.id)} style={{
          display:"flex",alignItems:"center",gap:8,width:"100%",padding:"7px 10px",marginBottom:1,borderRadius:7,border:"none",
          background:on?th.acc+"14":"transparent",color:on?th.accL:th.txD,fontSize:13,fontWeight:on?600:400,cursor:"pointer",textAlign:"left",fontFamily:font,transition:"all .12s ease",letterSpacing:-.1,
        }}><span style={{flexShrink:0,opacity:on?1:.7,display:"flex"}}><Ico s={15}/></span>{n.label}{on&&<span style={{marginLeft:"auto",width:5,height:5,borderRadius:3,background:th.acc}}/>}</button>;})}
      </div>

      {/* Calendar in sidebar */}
      <div style={{borderTop:`1px solid ${th.bd}`,padding:"12px 12px 8px",flex:1,overflowY:"auto"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
          <button onClick={()=>{if(mo===0){setMo(11);setYr(yr-1)}else setMo(mo-1);}} style={{background:"none",border:"none",color:th.txD,cursor:"pointer",padding:3,fontSize:14}}>◀</button>
          <span style={{fontWeight:700,fontSize:13,color:th.tx}}>{yr}年 {MO[mo]}</span>
          <button onClick={()=>{if(mo===11){setMo(0);setYr(yr+1)}else setMo(mo+1);}} style={{background:"none",border:"none",color:th.txD,cursor:"pointer",padding:3,fontSize:14}}>▶</button>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:2,textAlign:"center"}}>
          {["日","一","二","三","四","五","六"].map(d=><div key={d} style={{padding:"4px 0",fontSize:10,color:th.txM,fontWeight:700}}>{d}</div>)}
          {days.map((d,i)=>{if(!d)return <div key={"e"+i}/>;
            const ip=pastDay(d),it=same(d,now),is=same(d,selDate),cnt=dayS(d).length;
            return <button key={i} onClick={()=>{setSelDate(d);if(tab!=="schedule")setTab("schedule");}} style={{position:"relative",padding:"7px 0",borderRadius:6,border:"none",background:is?th.acc:it?th.acc+"1a":"transparent",color:ip?th.txM:is?"#fff":it?th.accL:th.tx,fontWeight:it||is?700:400,fontSize:12,cursor:"pointer",opacity:ip?.4:1,fontFamily:font}}>
              {d.getDate()}
              {cnt>0&&<div style={{position:"absolute",bottom:0,left:"50%",transform:"translateX(-50%)",width:4,height:4,borderRadius:2,background:is?"#fff":th.acc}}/>}
            </button>;})}
        </div>
        {selDate&&!same(selDate,now)&&<button onClick={()=>setSelDate(new Date())} style={{display:"block",width:"100%",marginTop:8,padding:"6px 0",borderRadius:6,border:`1px solid ${th.bd}`,background:"transparent",color:th.txD,fontSize:11,cursor:"pointer",fontFamily:font}}>⏎ 今天</button>}
      </div>

      {/* IP */}
      <div style={{padding:"10px 14px",borderTop:`1px solid ${th.bd}`,background:th.bg2}}>
        <div style={{fontSize:11,fontWeight:600,color:isAdmin?th.acc:th.txD}}>{isAdmin?"管理員":"一般使用者"}</div>
        <div style={{fontSize:10,fontFamily:mono,color:th.cyan,marginTop:2}}>{myIp}</div>
      </div>
    </nav>

    {/* ── Main ── */}
    <main style={{flex:1,overflow:"auto",padding:"22px 26px 36px"}}>
      {tab==="schedule"&&<PSchedule {...{rooms,models,senders,scheds,setScheds,cfg,isAdmin,myIp,reload,selDate,userPref,th,classOfficers}}/>}
      {tab==="broadcast"&&<PBroadcast {...{cfg,senders,userPref,myIp,th,classOfficers}}/>}
      {tab==="stats"&&<PStats scheds={scheds} senders={senders} th={th}/>}
      {tab==="room"&&<PRoom {...{rooms,setRooms,models,cfg,reload,th}}/>}
      {tab==="model"&&<PModel {...{models,setModels,rooms,reload,th}}/>}
      {tab==="sender"&&<PSender {...{senders,setSenders,reload,th}}/>}
      {tab==="classOfficers"&&<PClassOfficers {...{classOfficers,reload,th}}/>}
      {tab==="logs"&&<PLogs logs={logs} reload={reload} th={th}/>}
      {tab==="config"&&<PConfig {...{cfg,setCfg,senders,userPref,reload,th}}/>}
      {tab==="profile"&&<PProfile {...{senders,userPref,saveUserPref,myIp,cfg,th}}/>}
      {tab==="help"&&<PHelp th={th} Title={Title}/>}
    </main>
  </div>;
}

/* ═══ SCHEDULE ═══ */
function PSchedule({rooms,models,senders,scheds,setScheds,cfg,isAdmin,myIp,reload,selDate,userPref,th,classOfficers}){
  const [showNew,setShowNew]=useState(false);const [chainState,setChainState]=useState(null);const [editData,setEditData]=useState(null);const [copyData,setCopyData]=useState(null);
  const [newSchedTime,setNewSchedTime]=useState(null);
  const [forceStopActive,setForceStopActive]=useState(false); // kept for legacy nowPlaying banner
  // 每分鐘 tick 一次 + 視窗切回時強制更新，讓 isExpired() 相關顯示自動刷新
  const [,setTick]=useState(0);
  useEffect(()=>{
    const tick=()=>setTick(t=>t+1);
    const id=setInterval(tick,60000); // 每 60 秒
    const onVis=()=>{if(document.visibilityState==="visible")tick();};
    document.addEventListener("visibilitychange",onVis);
    window.addEventListener("focus",tick);
    return()=>{clearInterval(id);document.removeEventListener("visibilitychange",onVis);window.removeEventListener("focus",tick);};
  },[]);

  // Helper: next 5-min aligned time from now
  const nextAligned=()=>{const n=new Date();const m=n.getMinutes();const next5=Math.ceil((m+1)/5)*5;return{h:next5>=60?(n.getHours()+1)%24:n.getHours(),m:next5%60};};
  const copySchedule=s=>{const t=nextAligned();setCopyData({...s,_copyHr:String(t.h),_copyMn:String(t.m)});};
  const sel=selDate;
  const now=new Date();const todayStr=fmtD(now);
  const dayS=d=>d?scheds.filter(s=>s.date===fmtD(d)).sort((a,b)=>a.st.localeCompare(b.st)):[];
  const selS=dayS(sel);
  const preCalc=ids=>{let mx=0;rooms.filter(r=>ids.includes(r.id)).forEach(r=>{const m=models.find(x=>x.id===r.model);if(m&&m.bootTime>mx)mx=m.bootTime;});return Math.ceil(mx+ids.length*(cfg.loopDelay/1000));};
  const dateIsPast=sel&&fmtD(sel)<todayStr;

  // Combined highlight list: class officers + senders (with dept scale inheritance)
  // Used to render inline highlights (color + font-size) on schedule card text previews.
  const highlightList=useMemo(()=>{
    const list=[...(classOfficers||[])];
    const deptMap=new Map();
    (senders||[]).forEach(s=>{if(s.pid===null)deptMap.set(s.id,s);});
    (senders||[]).forEach(s=>{
      const scale=s.pid===null?(s.scale??1):(deptMap.get(s.pid)?.scale??1);
      if(scale>1.01)list.push({name:s.name,color:s.color,scale});
    });
    return list;
  },[classOfficers,senders]);

  const addSched=async(s)=>{try{
    const sc=senders.find(x=>x.name===s.sender);const color=sc?.color||userPref?.customColor||"#3b82f6";
    if(s._repeat){
      const dates=calcRepeatDates(s._repeat.startDate,s._repeat.mode,s._repeat.days,s._repeat.weeks);
      const rg=Date.now();
      const base={...s,color,rg};delete base._repeat;
      for(const d of dates) await api.addSchedule({...base,date:fmtD(d),_silent:true});
      const modeLabel=s._repeat.mode==="daily"?"每日":"每週";
      const first=fmtD(dates[0]),last=fmtD(dates[dates.length-1]);
      await api.addLog({action:"create",summary:`批次新增${modeLabel}循環排程 ${dates.length} 筆（${first} ~ ${last}）${base.st}-${base.et} ${base.dept}`,sender:base.sender});
    }else{
      await api.addSchedule({...s,color});
    }
    await reload("schedules");await reload("logs");
  }catch(e){alert("建立失敗: "+e.message);}};
  const editSched=async(id,s)=>{try{const sc=senders.find(x=>x.name===s.sender);await api.updateSchedule(id,{...s,color:sc?.color||"#3b82f6"});await reload("schedules");await reload("logs");}catch(e){alert(e.message);}};
  const addChainS=async(s,tid)=>{try{await api.chainSchedule(tid,s);await reload("schedules");await reload("logs");}catch(e){alert("串接失敗: "+e.message);}};
  const delSched=async(s)=>{try{
    if(!confirm(`確定要刪除此排程？\n${s.st}→${s.et} · ${s.sender||""}`)) return;
    if(s.rg){
      const rgAll=scheds.filter(x=>x.rg===s.rg);
      const rgFuture=rgAll.filter(x=>x.date>=s.date);
      if(rgFuture.length>1){
        const delAll=confirm(`此排程屬於循環排程（此筆之後還有 ${rgFuture.length-1} 筆）\n\n確定 → 刪除此筆及之後所有循環排程\n取消 → 只刪除這一筆`);
        if(delAll){
          for(const d of rgFuture) await api.deleteSchedule(d.id);
          await api.addLog({action:"delete",summary:`批次刪除循環排程 ${rgFuture.length} 筆（${rgFuture[0].date} ~ ${rgFuture[rgFuture.length-1].date}）${s.st}-${s.et} ${s.dept}`,sender:s.sender});
        }else{
          await api.deleteSchedule(s.id);
        }
      }else{
        await api.deleteSchedule(s.id);
      }
    }else{
      await api.deleteSchedule(s.id);
    }
    await reload("schedules");await reload("logs");
  }catch(e){alert(e.message);}};
  const canEdit=s=>s.creatorIp===myIp||isAdmin;

  const grouped=useMemo(()=>{const g=[],done=new Set();selS.forEach(s=>{if(done.has(s.id))return;if(s.cg){const ch=selS.filter(x=>x.cg===s.cg||x.id===s.cg).sort((a,b)=>a.st.localeCompare(b.st));ch.forEach(x=>done.add(x.id));g.push({ch:true,items:ch});}else{done.add(s.id);g.push({ch:false,items:[s]});}});return g.sort((a,b)=>a.items[0].st.localeCompare(b.items[0].st));},[selS]);
  const totalDur=selS.reduce((a,s)=>a+s.dur,0);

  return <div>
    <Title sub="選擇左側日曆日期查看排程" action={sel&&!dateIsPast&&<Btn primary small onClick={()=>setShowNew(true)} t={th}>＋ 新增排程</Btn>} t={th}>排程管理</Title>
    {sel?<div>
      {/* Header bar */}
      <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:16,padding:"12px 18px",background:th.sf2,borderRadius:10,border:`1px solid ${th.bd}`}}>
        <span style={{fontWeight:700,fontSize:16,color:th.tx}}>{fmtD(sel)}</span>
        {dateIsPast&&<Badge color={th.red} t={th}>已過期</Badge>}
        <Badge t={th}>{selS.length} 筆</Badge>
        {totalDur>0&&<Badge color={th.grn} t={th}>{Math.floor(totalDur/60)}分{totalDur%60}秒</Badge>}
      </div>
      {/* Full-width timeline */}
      <Timeline scheds={scheds} date={sel} senders={senders} height={56} t={th} cfg={cfg}
        onSelect={(h,m)=>{setNewSchedTime({h,m});setShowNew(true);}}
        onChain={(s,pos)=>{
          if(pos==="before"&&!confirm(`確定要插在「${s.sender||""}」的排程（${s.st}–${s.et}）前面嗎？\n\n提醒：插入排程前方可能會影響原排程的預啟動時間，建議事先與原發話單位溝通確認。`))return;
          setChainState({tgt:s,pos});
        }}/>
      {/* Schedule cards */}
      {grouped.length===0?<div style={{textAlign:"center",padding:"60px 20px",color:th.txM}}>
        <div style={{fontSize:36,marginBottom:12,opacity:.3}}><IC.calendar s={34}/></div>
        <div style={{fontSize:14,fontWeight:500}}>此日尚無排程</div>
      </div>
      :grouped.map((g,gi)=><div key={gi} style={{marginBottom:18}}>
        {g.ch&&<div style={{display:"flex",alignItems:"center",gap:6,marginBottom:10,padding:"6px 12px",background:th.acc+"0c",borderRadius:8,width:"fit-content"}}><span style={{fontSize:11,fontWeight:700,color:th.accL}}><span style={{display:"inline-flex",alignItems:"center",gap:4}}><IC.link s={11}/> 連續排程群組</span></span></div>}
        {g.items.map((s,si)=>{
          const cls=rooms.filter(r=>(s.rids||[]).includes(r.id));
          const mine=canEdit(s);const sc=senders.find(x=>x.name===s.sender);const clr=sc?.color||s.color||th.acc;
          const deptNames=(s.dept||"").split("、").filter(Boolean);
          const deptColor=deptNames.length?senders.find(x=>x.pid===null&&deptNames.includes(x.name))?.color||clr:clr;
          const exp=isExpired(s);
          const roomsInfo=smartRoomsLabel(cls,rooms);
          const hasTxt=s.txt&&s.txt!=="<p></p>"&&s.txt.replace(/<[^>]*>/g,'').trim().length>0&&(s.txtDur||0)>0;
          const hasMedia=(s.mediaList||[]).length>0;
          // Senders visual: find the department this sender belongs to (or the sender itself if it's a dept)
          const senderDept=sc?(sc.pid===null?sc:senders.find(x=>x.id===sc.pid)):null;
          const senderBgClr=clr;
          return <div key={s.id} style={{position:"relative",background:exp?th.expired:th.sf,borderLeft:`3px solid ${exp?th.bd2:deptColor}`,border:`1px solid ${th.bd}`,borderRadius:10,padding:"14px 16px",marginBottom:8,opacity:exp?.5:1}}>
            {/* Action buttons — 右上角橫向排列 */}
            <div style={{position:"absolute",top:10,right:12,display:"flex",flexDirection:"row",gap:4,flexShrink:0,zIndex:1}}>
              {!exp&&<Btn small onClick={()=>setChainState({tgt:s,pos:"before"})} t={th}>+前</Btn>}
              {!exp&&<Btn small onClick={()=>setChainState({tgt:s,pos:"after"})} t={th}>+後</Btn>}
              <Btn small onClick={()=>copySchedule(s)} t={th}><IC.copy s={13}/></Btn>
              {!exp&&mine&&<Btn small onClick={()=>setEditData(s)} t={th}><IC.edit s={13}/></Btn>}
              {!exp&&mine&&<Btn small onClick={()=>delSched(s)} t={th} style={{color:th.txM,border:`1px solid ${th.bd}`}}><IC.trash s={13}/></Btn>}
            </div>

            {/* Structured fields grid: 時間 / 對象 / 類型 */}
            <div style={{display:"grid",gridTemplateColumns:"46px 1fr",columnGap:14,rowGap:7,marginBottom:10,paddingRight:160}}>

              {/* 時間 */}
              <div style={{fontSize:10,color:th.txM,fontWeight:700,letterSpacing:.5,textTransform:"uppercase",paddingTop:4}}>時間</div>
              <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
                <span style={{fontSize:15,fontWeight:700,fontFamily:mono,color:th.tx,letterSpacing:-.3}}>{s.st.substring(0,5)} – {s.et.substring(0,5)}</span>
                {exp&&<span style={{padding:"2px 7px",borderRadius:5,background:th.sf3,color:th.txM,fontSize:11,fontWeight:600,border:`1px solid ${th.bd}`}}>已過期</span>}
                {!exp&&s.dur&&s.etMode!=="time"&&<span style={{fontSize:11,color:th.txM,fontFamily:mono,padding:"1px 7px",borderRadius:4,background:th.bg2,border:`1px solid ${th.bd}`}}>{fmtDur(s.dur)}</span>}
                {s.etMode==="time"&&<span style={{fontSize:11,color:th.txM,fontStyle:"italic"}}>(指定結束時間)</span>}
                {s.live&&<span style={{padding:"2px 7px",borderRadius:5,background:th.red+"22",color:th.red,display:"inline-flex",alignItems:"center",gap:3,fontSize:10,fontWeight:700,border:`1px solid ${th.red}55`}}><IC.zap s={11}/> 即時</span>}
                {s.rg&&<span style={{padding:"2px 7px",borderRadius:5,background:th.acc+"18",color:th.accL,fontSize:10,fontWeight:700,border:`1px solid ${th.acc}44`}}><IC.repeat s={11}/> 循環</span>}
              </div>

              {/* 對象 */}
              <div style={{fontSize:10,color:th.txM,fontWeight:700,letterSpacing:.5,textTransform:"uppercase",paddingTop:4}}>對象</div>
              <div style={{display:"flex",alignItems:"center",gap:6,flexWrap:"wrap"}}>
                {roomsInfo.parts.map((p,idx)=>{
                  // Find the color for this part's dept (for dept-specific parts)
                  const partDept=p.dept?senders.find(x=>x.pid===null&&x.name===p.dept):null;
                  const partClr=p.type==="all-school"?th.amb:(partDept?.color||th.txD);
                  return <span key={idx} style={{display:"inline-flex",alignItems:"center",gap:6,flexWrap:"nowrap"}}>
                    <span style={{padding:"2px 9px",borderRadius:5,background:partClr+"18",color:partClr,fontSize:12,fontWeight:600,border:`1px solid ${partClr}44`,whiteSpace:"nowrap"}}>{p.label}</span>
                    {p.meta&&<span style={{fontSize:11,color:th.txM,whiteSpace:"nowrap"}}>{p.meta}</span>}
                  </span>;
                })}
                {/* 全校時沒有每個 dept 的 meta，顯示總計 */}
                {roomsInfo.parts.length>0&&!roomsInfo.parts.some(p=>p.meta)&&<span style={{fontSize:11,color:th.txM,fontFamily:mono}}>· 共 {roomsInfo.total} 間</span>}
              </div>

              {/* 類型 — 只有在有任一類型時才顯示這行 */}
              {(hasTxt||hasMedia||(s.bgm&&s.bgm.path))&&<>
                <div style={{fontSize:10,color:th.txM,fontWeight:700,letterSpacing:.5,textTransform:"uppercase",paddingTop:4}}>類型</div>
                <div style={{display:"flex",alignItems:"center",gap:6,flexWrap:"wrap"}}>
                  {hasTxt&&<>
                    <span style={{padding:"2px 7px",borderRadius:5,background:th.sf3,color:th.txD,fontSize:11,fontWeight:600,border:`1px solid ${th.bd}`}}><span style={{display:"inline-flex",alignItems:"center",gap:3}}><IC.text s={11}/> 文字</span></span>
                    <span style={{fontSize:11,color:th.txM,fontFamily:mono,padding:"1px 7px",borderRadius:4,background:th.bg2,border:`1px solid ${th.bd}`}}>{fmtDur(s.txtDur)}</span>
                  </>}
                  {hasMedia&&<>
                    <span style={{padding:"2px 7px",borderRadius:5,background:th.sf3,color:th.txD,fontSize:11,fontWeight:600,border:`1px solid ${th.bd}`}}><IC.video s={11}/> 媒體</span>
                    <span style={{fontSize:11,color:th.txM,fontFamily:mono,padding:"1px 7px",borderRadius:4,background:th.bg2,border:`1px solid ${th.bd}`}}>{s.mediaList.length} 個</span>
                  </>}
                  {s.bgm&&s.bgm.path&&<span style={{padding:"2px 7px",borderRadius:5,background:th.sf3,color:th.txD,fontSize:11,fontWeight:600,border:`1px solid ${th.bd}`}}><IC.music s={11}/> BGM</span>}
                </div>
              </>}
            </div>

            {/* 發話單位列 — 跟 player banner 同款：方形圓角 avatar + 處室色 sender badge */}
            {s.sender&&<div style={{display:"flex",alignItems:"center",gap:10,paddingTop:10,borderTop:`1px solid ${th.bd}`}}>
              {cfg.showAvatar!==false&&(s.avatar?<img src={s.avatar} alt="" style={{width:36,height:36,borderRadius:8,objectFit:"cover",flexShrink:0,border:`1px solid ${th.bd}`}}/>
              :<div style={{width:36,height:36,borderRadius:8,background:senderBgClr+"22",border:`1px solid ${senderBgClr}55`,display:"flex",alignItems:"center",justifyContent:"center",color:senderBgClr,fontSize:16,fontWeight:700,flexShrink:0}}>{s.sender.substring(0,1)}</div>)}
              <span style={{padding:"4px 12px",borderRadius:6,background:senderBgClr+"20",color:senderBgClr,fontSize:13,fontWeight:700,borderLeft:`2px solid ${senderBgClr}`}}>{s.sender}</span>
              {senderDept&&senderDept.name!==s.sender&&<span style={{fontSize:11,color:th.txM}}>· {senderDept.name}</span>}
              {!mine&&<span style={{fontSize:10,color:th.txM,fontStyle:"italic",marginLeft:"auto"}}>IP {s.creatorIp} 建立</span>}
            </div>}

            {/* 訊息內容預覽 */}
            {hasTxt&&(()=>{
              const basePx=cfg.defaultFontSize||48;const uiPx=13;const scale=uiPx/basePx;
              return <div style={{marginTop:10,padding:"10px 12px",borderRadius:8,background:th.bg2+"88",border:`1px solid ${th.bd}`,lineHeight:1.6,overflow:"hidden",color:th.txD}}>
                <div style={{zoom:scale,fontSize:basePx,lineHeight:cfg.defaultLineHeight||1.7}} dangerouslySetInnerHTML={{__html:applyHighlights(renderTxt(s.txt),highlightList)}}/>
              </div>;
            })()}

            {/* 媒體縮圖 */}
            {hasMedia&&<div style={{marginTop:8,display:"flex",flexWrap:"wrap",gap:6}}>{(s.mediaList||[]).map((m,mi)=><div key={mi} style={{display:"flex",alignItems:"center",gap:6,padding:"4px 8px",borderRadius:6,background:th.bg2,border:`1px solid ${th.bd}`,fontSize:11,color:th.txD}}>
              {m.mt==="video"?<img src={`http://${window.location.hostname}:3001/api/thumbnail?path=${encodeURIComponent(m.path)}`} onError={e=>{e.target.style.display="none";e.target.nextSibling.style.display="inline";}} style={{width:64,height:42,objectFit:"cover",borderRadius:4,flexShrink:0}} alt=""/> :null}
              {m.mt==="audio"?<img src={`http://${window.location.hostname}:3001/api/thumbnail?path=${encodeURIComponent(m.path)}`} onError={e=>{e.target.style.display="none";e.target.nextSibling.style.display="inline";}} style={{width:42,height:42,objectFit:"cover",borderRadius:4,flexShrink:0}} alt=""/>:null}
              {m.mt==="image"?<img src={`http://${window.location.hostname}:3001/media/${encodeURIComponent(m.path)}`} onError={e=>{e.target.style.display="none";e.target.nextSibling.style.display="inline";}} style={{width:64,height:42,objectFit:"cover",borderRadius:4,flexShrink:0}} alt=""/>:null}
              <span style={{display:m.mt==="video"||m.mt==="audio"||m.mt==="image"?"none":"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0}}><IC.image s={15}/></span>
              <span style={{overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",flex:1}}>{m.name}</span>
            </div>)}</div>}
          </div>;})}
      </div>)}
    </div>
    :<div style={{textAlign:"center",padding:"80px 20px",color:th.txM}}>
      <div style={{fontSize:48,marginBottom:16,opacity:.2}}><IC.calendar s={34}/></div>
      <div style={{fontSize:15,fontWeight:600}}>請在左側日曆選擇日期</div>
    </div>}

    {showNew&&sel&&<SchedModal date={sel} rooms={rooms} senders={senders} cfg={cfg} scheds={scheds} preCalc={preCalc} initTime={newSchedTime} userPref={userPref} classOfficers={classOfficers} onSave={s=>{addSched(s);setShowNew(false);setNewSchedTime(null);}} onClose={()=>{setShowNew(false);setNewSchedTime(null);}} th={th}/>}
    {editData&&<SchedModal date={sel} rooms={rooms} senders={senders} cfg={cfg} scheds={scheds} preCalc={preCalc} editData={editData} classOfficers={classOfficers} userPref={userPref} onSave={s=>{editSched(editData.id,s);setEditData(null);}} onClose={()=>setEditData(null)} th={th}/>}
    {copyData&&<SchedModal date={sel||new Date()} rooms={rooms} senders={senders} cfg={cfg} scheds={scheds} preCalc={preCalc} editData={{...copyData,id:undefined,rg:undefined,cg:undefined,creatorIp:undefined,createTime:undefined,live:undefined,_isCopy:true}} classOfficers={classOfficers} userPref={userPref} onSave={s=>{addSched(s);setCopyData(null);}} onClose={()=>setCopyData(null)} th={th}/>}
    {chainState&&(()=>{
      // 「+前／+後」改為開啟完整 SchedModal（非舊的簡化版 ChainModal）
      // 依 chainPos 預填：時間自動對齊目標排程前/後、班級與類別繼承
      const tgt=chainState.tgt;
      const initTime=chainState.pos==="after"
        ?{h:parseInt(tgt.et),m:parseInt(tgt.et.split(":")[1])||0}
        :{h:parseInt(tgt.st),m:Math.max(0,(parseInt(tgt.st.split(":")[1])||0)-5)}; // +前先暫填往前 5 分，使用者可再調
      return <SchedModal date={sel} rooms={rooms} senders={senders} cfg={cfg} scheds={scheds} preCalc={preCalc} initTime={initTime} userPref={userPref} classOfficers={classOfficers} chainTarget={tgt} chainPos={chainState.pos} onSave={s=>{addChainS(s,tgt.id);setChainState(null);}} onClose={()=>setChainState(null)} th={th}/>;
    })()}
  </div>;
}

/* ═══ SCHEDULE MODAL (New + Edit) — Hybrid: text + multi-media ═══ */
function SchedModal({date:initDate,rooms,senders,cfg,scheds,preCalc,onSave,onClose,th,editData,initTime,userPref,classOfficers,chainTarget,chainPos}){
  const isEdit=!!editData;
  const isCopy=isEdit&&editData._isCopy;
  const isChain=!!chainTarget;
  const [modalDate,setModalDate]=useState(initDate);
  const date=modalDate;
  // 若為「串接模式」，預填 target 的部門與班級（使用者不必重選）
  const initDepts=isEdit?(editData.dept||"").split("、").filter(Boolean):(isChain?(chainTarget.dept||"").split("、").filter(Boolean):[]);
  const initRids=isEdit?(editData.rids||[]):(isChain?(chainTarget.rids||[]):[]);
  const initSender=isEdit?senders.find(x=>x.name===editData.sender):null;

  // 個人偏好：新增時自動帶入預設身份（優先 identities[active]，fallback 舊格式）
  const activeIdentity=(()=>{
    if(isEdit)return null;
    const arr=getUserIdentities(userPref);
    if(arr.length===0)return null;
    const actId=userPref?.activeIdentityId;
    return arr.find(x=>x.id===actId)||arr[0];
  })();
  const prefSender=!isEdit?(activeIdentity?.senderId?senders.find(x=>x.id===activeIdentity.senderId):(userPref?.senderId?senders.find(x=>x.id===+userPref.senderId):null)):null;
  const prefCustom=!isEdit&&!prefSender?(activeIdentity?.customName||userPref?.customName||""):"";

  // 新增時預設填入時間：優先用 initTime（時間軸點選），否則用最接近的 5 分鐘整點
  const _initTime=(()=>{if(isEdit)return null;if(initTime)return initTime;const n=new Date();const m=n.getMinutes();const next5=Math.ceil((m+1)/5)*5;return{h:next5>=60?(n.getHours()+1)%24:n.getHours(),m:next5%60};})();
  const [depts,setDepts]=useState(initDepts);const [rids,setRids]=useState(initRids);
  const [hr,setHr]=useState(isCopy&&editData._copyHr!==undefined?editData._copyHr:(isEdit?String(parseInt(editData.st)):(_initTime?String(_initTime.h):"")));
  const [mn,setMn]=useState(isCopy&&editData._copyMn!==undefined?editData._copyMn:(isEdit?String(parseInt(editData.st.split(":")[1])):(_initTime?String(_initTime.m):"")));
  const [sc,setSc]=useState(isEdit&&editData.st.split(":").length>2?String(parseInt(editData.st.split(":")[2])):"0");
  const [lockedSched,setLockedSched]=useState(null); // 點了時間軸上的排程，鎖定時間
  const [isLive,setIsLive]=useState(false); // 即時模式
  const [etMode,setEtMode]=useState(isCopy?"dur":(isEdit&&editData.etMode?editData.etMode:"dur")); // dur | time | bgm
  const [etHr,setEtHr]=useState(isCopy?"":(isEdit&&editData.etMode==="time"?String(parseInt(editData.et)):""));
  const [etMn,setEtMn]=useState(isCopy?"":(isEdit&&editData.etMode==="time"?String(parseInt(editData.et.split(":")[1])):""));
  const [etSc,setEtSc]=useState(isCopy?"0":(isEdit&&editData.etMode==="time"&&editData.et.split(":").length>2?String(parseInt(editData.et.split(":")[2])):"0"));
  const [txt,setTxt]=useState(isEdit?(editData.txt||""):"");
  const [txtDur,setTxtDur]=useState(()=>{
    if(!isEdit)return cfg.defaultTxtDur||60;
    const raw=editData.txtDur||0;
    // Copy mode: if source txtDur is 0 but has text content, fallback to default
    // (original may have been in time/bgm mode where txtDur=0)
    if(isCopy&&raw===0&&editData.txt&&editData.txt.replace(/<[^>]*>/g,'').trim().length>0){
      return cfg.defaultTxtDur||60;
    }
    return raw;
  });
  const [bgColor,setBgColor]=useState(isEdit?(editData.bgColor||cfg.defaultBgColor):cfg.defaultBgColor);
  const [mediaList,setMediaList]=useState(isEdit?(editData.mediaList||[]):[]);
  const [showFileBrowser,setShowFileBrowser]=useState(false);
  const [showMediaSection,setShowMediaSection]=useState(isEdit&&(editData.mediaList||[]).length>0);
  // BGM (背景音樂)
  const [bgm,setBgm]=useState(isEdit&&editData.bgm?editData.bgm:null);
  const [bgmVol,setBgmVol]=useState(isEdit&&editData.bgm?(editData.bgm.volume??80):80);
  const [showBgmBrowser,setShowBgmBrowser]=useState(false);
  const bgmChipIntentRef=useRef(false);
  const [sid,setSid]=useState(isEdit&&initSender?String(initSender.id):(prefSender?String(prefSender.id):""));
  const [customS,setCustomS]=useState(isEdit&&!initSender?(editData.sender||""):prefCustom);
  const [useCustom,setUseCustom]=useState((isEdit&&!initSender&&!!editData.sender)||(!isEdit&&!!prefCustom));
  const [customColor,setCustomColor]=useState(isEdit?(editData.color||"#3b82f6"):(userPref?.customColor||"#3b82f6"));
  const [repeatMode,setRepeatMode]=useState("none"); // none | daily | weekly
  const [repeatDays,setRepeatDays]=useState([1,2,3,4,5]); // 0=日 1=一 ... 6=六
  const [repeatWeeks,setRepeatWeeks]=useState(""); // 空=永久
  const [quickMode,setQuickMode]=useState(()=>{try{return localStorage.getItem("schedQuickMode")!=="false";}catch{return true;}});
  useEffect(()=>{try{localStorage.setItem("schedQuickMode",String(quickMode));}catch{}},[quickMode]);
  // quickMode 純粹是 UI 過濾器（隱藏進階欄位），不改動任何既有的 state 資料。
  // 使用者從進階切到快速再切回來，所有設定（media、BGM、repeat、etMode）都會保留。
  const modalTitle=isCopy?"複製排程 "+fmtD(date):(isChain?`串接排程 ${chainPos==="after"?"＋後":"＋前"}　`:(isEdit?"編輯排程 ":"新增廣播排程 "))+fmtD(date);

  // RichEditor 工具列展開狀態（控制傳入 RichEditor，按鈕放在文字區標題列）
  const [toolbarExpanded,setToolbarExpanded]=useState(false);

  // Combined highlight list: class officers + senders (with dept scale inheritance)
  const highlightList=useMemo(()=>{
    const list=[...(classOfficers||[])];
    const deptMap=new Map();
    (senders||[]).forEach(s=>{if(s.pid===null)deptMap.set(s.id,s);});
    (senders||[]).forEach(s=>{
      const scale=s.pid===null?(s.scale??1):(deptMap.get(s.pid)?.scale??1);
      if(scale>1.01)list.push({name:s.name,color:s.color,scale});
    });
    return list;
  },[classOfficers,senders]);

  // Effective avatar — 依目前 sender 身份決定：
  //   - Edit 模式：保留原建立者當時的 avatar
  //   - 選自己的任一 identity → 使用 userPref.avatar
  //   - 切換到其他處室/職務 → 使用該 sender 名稱決定的預設頭像（hash）
  const effectiveAvatar=useMemo(()=>{
    if(isEdit&&!isCopy)return editData.avatar||undefined;
    const myIdents=getUserIdentities(userPref);
    // 檢查當前 sender 是否匹配 identities 中任一個
    const isSelf=myIdents.some(ident=>{
      if(useCustom)return ident.customName&&ident.customName===customS;
      return ident.senderId&&+ident.senderId===+sid;
    });
    if(isSelf&&userPref?.avatar)return userPref.avatar;
    // 非自己 → 依 sender 名稱做 hash 挑一個預設頭像
    const name=useCustom?customS:(senders.find(x=>x.id===+sid)?.name||"");
    if(!name)return undefined;
    let h=0;for(let i=0;i<name.length;i++)h=(h*31+name.charCodeAt(i))&0xffff;
    return DEFAULT_AVATARS[h%DEFAULT_AVATARS.length]?.svg;
  },[isEdit,isCopy,editData,sid,useCustom,customS,userPref,senders]);

  const gm=depts.length?gradeMapMulti(rooms,depts):{};const pre=rids.length?preCalc(rids):0;
  const ts=hr!==""&&mn!==""?`${p2(hr)}:${p2(mn)}:${p2(sc||0)}`:"";
  const sender=useCustom?customS:(senders.find(x=>x.id===+sid)?.name||"");
  // deptLabel 從實際選取的班級反推（不依賴 chip 展開狀態），避免展開/收合影響儲存內容
  const deptLabel=(()=>{
    const ds=new Set();
    rids.forEach(id=>{const r=rooms.find(x=>x.id===id);if(r)ds.add(r.dept);});
    return Array.from(ds).join("、");
  })();

  const txtHas=txt&&txt.replace(/<[^>]*>/g,'').trim().length>0;
  const hasTxt=txtHas&&txtDur>0;
  const hasMedia=mediaList.length>0;
  const mediaDur=mediaList.reduce((a,m)=>a+(m.dur||0),0);
  const totalDur=(hasTxt?txtDur:0)+mediaDur;
  const hasVideoAudio=mediaList.some(m=>m.mt==="video"||m.mt==="audio");
  const mediaDurEstimate=mediaList.reduce((a,m)=>a+Math.max(m.dur||0,300),0);

  // In bgm mode: txtDur = bgm.duration - sum(image durations)
  // Images share the bgm timeline with text; text fills the remainder
  useEffect(()=>{
    if(etMode!=="bgm"||!bgm?.duration)return;
    const imgDur=mediaList.filter(m=>m.mt==="image").reduce((a,m)=>a+(+m.dur||0),0);
    const remain=Math.max(0,bgm.duration-imgDur);
    setTxtDur(remain);
  },[etMode,bgm?.duration,mediaList]);

  // 單一階段系統：自動展開該唯一 dept，使用者不用手動點
  useEffect(()=>{
    const stageDepts=getStageDepts(cfg);
    if(stageDepts.length===1&&!depts.includes(stageDepts[0])){
      setDepts([stageDepts[0]]);
    }
  },[cfg]);

  // 切到快速模式 / 即時 / 串接時，若 etMode 當前不允許，自動回退為 "dur"
  useEffect(()=>{
    if(etMode==="time"&&(quickMode||isLive||isChain))setEtMode("dur");
    if(etMode==="bgm"&&quickMode)setEtMode("dur");
  },[quickMode,isLive,isChain]);

  // End time / duration depends on mode
  const customEt=etMode==="time"&&etHr!==""&&etMn!==""?`${p2(etHr)}:${p2(etMn)}:${p2(etSc||0)}`:"";
  const customEtDur=customEt&&ts?timeToSec(customEt)-timeToSec(ts):0;
  const effectiveDur=etMode==="time"?(customEtDur>0?customEtDur:0):(etMode==="bgm"?(bgm?.duration||0):(totalDur>0?totalDur:(hasVideoAudio?mediaDurEstimate:0)));
  const te=etMode==="time"?customEt:(ts&&effectiveDur>0?addS(ts,effectiveDur):"");

  // 串接「＋前」模式：開始時間 = 目標排程的開始時間 - 播放長度，隨 duration 變化自動更新
  useEffect(()=>{
    if(!isChain||chainPos!=="before"||!chainTarget||effectiveDur<=0)return;
    const startSec=timeToSec(chainTarget.st)-effectiveDur;
    if(startSec<0)return; // 避免跨日
    const h=Math.floor(startSec/3600),m=Math.floor((startSec%3600)/60),s=startSec%60;
    setHr(String(h));setMn(String(m));setSc(String(s));
  },[isChain,chainPos,chainTarget,effectiveDur]);

  const now=new Date();
  const datePast=!isLive&&date&&new Date(date.getFullYear(),date.getMonth(),date.getDate())<new Date(now.getFullYear(),now.getMonth(),now.getDate());
  const tp=datePast||(!isLive&&ts&&same(date,now)&&(+hr<now.getHours()||(+hr===now.getHours()&&+mn<=now.getMinutes())));
  const livePre=pre; // Live mode still needs preboot time — start time is delayed by pre seconds
  const ok=!!(rids.length&&ts&&!tp&&sender&&(hasTxt||hasMedia)&&(etMode==="time"?customEtDur>0:(totalDur>0||hasVideoAudio)));

  const togDept=d=>{setDepts(p=>p.includes(d)?p.filter(x=>x!==d):[...p,d]);};
  const tog=id=>setRids(p=>p.includes(id)?p.filter(x=>x!==id):[...p,id]);
  const togG=g=>{const ids=gm[g].map(x=>x.id);setRids(p=>ids.every(i=>p.includes(i))?p.filter(x=>!ids.includes(x)):[...new Set([...p,...ids])]);};
  const togAll=()=>{
    const a=Object.values(gm).flat().map(x=>x.id);
    setRids(p=>{
      const allChosen=a.every(i=>p.includes(i));
      if(allChosen){
        // 已全選 → 只移除當前展開部門的 ids，其他部門保留
        return p.filter(x=>!a.includes(x));
      }else{
        // 合併：其他部門保留 + 當前展開部門全選
        return [...new Set([...p,...a])];
      }
    });
  };

  const addMedia=f=>{setMediaList(p=>[...p,{name:f.name,path:f.path,mt:f.mt,dur:f.duration||( f.mt==="image"?10:0)}]);};
  const removeMedia=i=>setMediaList(p=>p.filter((_,j)=>j!==i));
  const moveMedia=(i,dir)=>{setMediaList(p=>{const n=[...p];const j=i+dir;if(j<0||j>=n.length)return n;[n[i],n[j]]=[n[j],n[i]];return n;});};
  const setMediaDur=(i,v)=>setMediaList(p=>p.map((m,j)=>j===i?{...m,dur:v===""?"":(+v||0)}:m));

  const filteredRooms=rooms.filter(r=>depts.includes(r.dept));
  const selLabel=selectLabel(rids,filteredRooms);
  const senderDepts=senders.filter(s=>s.pid===null);
  const selSender=senders.find(x=>x.id===+sid);
  const parentId=selSender?selSender.pid||selSender.id:null;
  const activeSenderDept=senderDepts.find(d=>d.id===parentId);
  const senderMembers=activeSenderDept?senders.filter(s=>s.pid===activeSenderDept.id):[];
  const fmtSec=s=>{if(!s)return"";const m=Math.floor(s/60),r=s%60;return m>0?`${m}分${r}秒`:`${r}秒`;};
  const mtIcon={image:<IC.image s={13}/>,video:<IC.video s={13}/>,audio:<IC.music s={13}/>};

  return <Modal title={modalTitle} onClose={onClose} width={820} t={th} resizable titleExtra={<div style={{display:"flex",background:th.sf2,border:`1px solid ${th.bd}`,borderRadius:6,overflow:"hidden"}}>
    <button onClick={()=>{setQuickMode(true);if(!same(date,new Date()))setModalDate(new Date());}} style={{background:quickMode?th.acc:"transparent",color:quickMode?"#fff":th.txD,border:"none",cursor:"pointer",padding:"4px 12px",fontSize:12,fontFamily:"inherit",fontWeight:600}}><span style={{display:"inline-flex",alignItems:"center",gap:4}}><IC.zap s={13}/> 快速</span></button>
    <button onClick={()=>setQuickMode(false)} style={{background:!quickMode?th.acc:"transparent",color:!quickMode?"#fff":th.txD,border:"none",cursor:"pointer",padding:"4px 12px",fontSize:12,fontFamily:"inherit",fontWeight:600}}><span style={{display:"inline-flex",alignItems:"center",gap:4}}><IC.config s={13}/> 進階</span></button>
  </div>}>
    {/* Row 1: Classes + Sender */}
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:24}}>
      <div>
        {(()=>{
          const stageDepts=getStageDepts(cfg);
          const isSingleStage=stageDepts.length===1;
          // 單一階段：依 useEffect 自動展開 dept，這裡純粹不顯示區域 chip
          if(isSingleStage)return null;
          return <Field label="班級" t={th}>
            <div style={{display:"flex",gap:12,flexWrap:"wrap",alignItems:"flex-start"}}>
              {stageDepts.map(d=>{
                const deptRooms=rooms.filter(r=>r.dept===d);
                const selectedCount=deptRooms.filter(r=>rids.includes(r.id)).length;
                const total=deptRooms.length;
                const isExpanded=depts.includes(d);
                const deptClr=getDeptColor(d,th);
                const ratio=total>0?selectedCount/total:0;
                // 收合時用依比例填滿的客製按鈕；展開時用原本 Chip 樣式
                return <div key={d} style={{display:"inline-flex",flexDirection:"column",alignItems:"center",gap:3}}>
                  {isExpanded?(
                    <Chip on={true} color={deptClr} onClick={()=>togDept(d)} style={{padding:"6px 18px",fontSize:13,fontWeight:600}} t={th}>{d}</Chip>
                  ):(
                    <button onClick={()=>togDept(d)} style={{
                      position:"relative",overflow:"hidden",
                      display:"inline-flex",alignItems:"center",justifyContent:"center",
                      padding:"6px 18px",borderRadius:8,fontSize:13,fontWeight:600,
                      border:`1.5px solid ${ratio>0?deptClr:th.bd}`,
                      background:"transparent",
                      color:ratio>0?deptClr:th.txD,
                      cursor:"pointer",fontFamily:font,transition:"all .15s ease",
                    }}>
                      {/* Fill layer — 依選取比例從左填滿，顏色帶 30% alpha 保持柔和 */}
                      {ratio>0&&<span style={{position:"absolute",left:0,top:0,bottom:0,zIndex:0,width:(ratio*100)+"%",background:deptClr+"4D",transition:"width .25s ease"}}/>}
                      <span style={{position:"relative",zIndex:1}}>{d}</span>
                    </button>
                  )}
                  <span style={{fontSize:10,color:selectedCount===0?th.txM:selectedCount===total?th.tx:th.txD,fontWeight:selectedCount===total?700:600,height:14,lineHeight:"14px"}}>
                    {selectedCount===0?"　":selectedCount===total?"全選":`${selectedCount} 班`}
                  </span>
                </div>;
              })}
            </div>
          </Field>;
        })()}
        {depts.length>0&&<Field label={<span style={{display:"inline-flex",alignItems:"center",gap:8}}>選擇班級 {rids.length>0&&<>{selLabel&&<span style={{fontSize:10,color:selLabel.includes("全校")?th.grn:selLabel.includes("全選")?th.accL:th.txD,fontWeight:600,textTransform:"none",letterSpacing:0}}>· {selLabel}</span>}<span style={{fontSize:10,color:th.txM,textTransform:"none",letterSpacing:0}}>· 預啟 {pre}s</span></>}</span>} t={th}>
          <div style={{marginBottom:8}}>
            <Btn small onClick={togAll} t={th} style={{padding:"4px 12px",fontSize:11}}>✓ 全選</Btn>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:6}}>
            {Object.entries(gm).sort().map(([g,cls])=>{const on=cls.every(x=>rids.includes(x.id));
              return <div key={g} style={{display:"flex",alignItems:"center",gap:6,flexWrap:"nowrap",overflowX:"auto",paddingBottom:2}}>
                <button onClick={()=>togG(g)} style={{display:"inline-flex",alignItems:"center",gap:5,background:"none",border:"none",cursor:"pointer",color:on?th.accL:th.txD,fontWeight:600,fontSize:12,fontFamily:font,flexShrink:0,padding:"2px 0",minWidth:65}}>
                  <span style={{display:"inline-flex",alignItems:"center",justifyContent:"center",width:17,height:17,borderRadius:4,border:`2px solid ${on?th.acc:th.bd2}`,background:on?th.acc:"transparent",color:"#fff",flexShrink:0,fontSize:9}}>{on?"✓":""}</span>{g}
                </button>
                {cls.map(x=><Chip key={x.id} on={rids.includes(x.id)} onClick={()=>tog(x.id)} style={{padding:"4px 12px",fontSize:12,flexShrink:0,whiteSpace:"nowrap"}} t={th}>{x.name}</Chip>)}
              </div>;})}
          </div>
        </Field>}
      </div>
      <div>
        <Field label="發話" t={th}>
          {(()=>{
            const myIdentities=getUserIdentities(userPref);
            // 目前選中的 identity object
            const currentIdent=(()=>{
              if(!useCustom){return myIdentities.find(i=>i.senderId===+sid)||null;}
              return myIdentities.find(i=>i.customName===customS)||null;
            })();
            const handleSelect=(ident)=>{
              if(ident.senderId){setSid(String(ident.senderId));setUseCustom(false);setCustomS("");}
              else{setUseCustom(true);setCustomS(ident.customName);setCustomColor(ident.customColor||"#3b82f6");setSid("");}
            };
            return <IdentityPicker identities={myIdentities} senders={senders} currentIdent={currentIdent} onSelect={handleSelect} t={th}/>;
          })()}
        </Field>
      </div>
    </div>

    {/* Row 2: Time */}
    <div style={{borderTop:`1px solid ${th.bd}`,marginTop:8,paddingTop:16}}>
      <Field label="選擇時間" t={th}>
        <Timeline scheds={scheds} date={date} senders={senders} onSelect={(h,m)=>{setLockedSched(null);setHr(String(h));setMn(String(m));setSc("0");}} onChain={(s,pos)=>{
          if(pos==="before"&&!confirm(`確定要插在「${s.sender||""}」的排程（${s.st}–${s.et}）前面嗎？\n\n提醒：插入排程前方可能會影響原排程的預啟動時間，建議事先與原發話單位溝通確認。`))return;
          if(pos==="after"){const p=s.et.split(":").map(Number);setHr(String(p[0]));setMn(String(p[1]||0));setSc(String(p[2]||0));}
          else{const p=s.st.split(":").map(Number);setHr(String(p[0]));setMn(String(p[1]||0));setSc(String(p[2]||0));}
          setLockedSched({id:s.id,pos,label:`${pos==="after"?"接在":"插在"} ${s.st}–${s.et} ${s.sender||""} ${pos==="after"?"後面":"前面"}`});
        }} height={44} t={th} cfg={cfg} previewSt={ts} previewDur={effectiveDur||(+txtDur||0)} previewLabel={sender||undefined} previewColor={useCustom?(userPref?.customColor||"#3b82f6"):(senders.find(x=>x.id===+sid)?.color||th.acc)}/>
        {/* 串接模式提示條 — 放在時間區塊內，跟時間設定語意一致 */}
        {isChain&&<div style={{padding:"10px 14px",borderRadius:8,background:th.acc+"12",border:`1px solid ${th.acc}33`,fontSize:12,color:th.txD,marginBottom:10,marginTop:6,lineHeight:1.6}}>
          <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
            <span style={{padding:"2px 7px",borderRadius:4,background:th.acc,color:"#fff",fontSize:10,fontWeight:700}}><IC.link s={11}/> 串接</span>
            <span>串接在 <b style={{color:th.tx,fontFamily:mono}}>{chainPos==="after"?chainTarget.et:chainTarget.st}</b> 之{chainPos==="after"?"後":"前"}</span>
          </div>
        </div>}
        {!isChain&&<div style={{display:"flex",gap:6,alignItems:"center",flexWrap:"wrap"}}>
          <Btn small onClick={()=>{if(isLive){setIsLive(false);}else{const n=new Date();setHr(String(n.getHours()));setMn(String(n.getMinutes()));setSc(String(n.getSeconds()));setModalDate(n);setIsLive(true);setLockedSched(null);if(etMode==="time")setEtMode("dur");}}} t={th} style={{fontSize:13,padding:"7px 14px",width:140,flexShrink:0,display:"inline-flex",justifyContent:"flex-start",background:isLive?th.red+"18":th.sf2,color:isLive?th.red:th.txD,border:`1px solid ${isLive?th.red:th.bd}`,fontWeight:600}}>{isLive?<span style={{display:"inline-flex",alignItems:"center",gap:4}}><IC.zap s={12}/> 即時</span>:<span style={{display:"inline-flex",alignItems:"center",gap:4}}><IC.clock s={12}/> 指定時間</span>}</Btn>
          {!isLive&&<>
            {!quickMode&&<input type="date" value={fmtD(date)} min={fmtD(new Date())} onChange={e=>{const d=new Date(e.target.value+"T00:00:00");if(!isNaN(d))setModalDate(d);}} style={{padding:"7px 10px",borderRadius:8,border:`1px solid ${th.bd}`,background:th.bg2,color:th.tx,fontSize:13,fontFamily:font,outline:"none",cursor:"pointer",width:140}}/>}
            <Sel value={hr} onChange={v=>setHr(v)} disabled={!!lockedSched} style={{width:68,opacity:lockedSched?.5:1}} t={th}><option value="">時</option>{Array.from({length:24},(_,i)=><option key={i} value={i}>{p2(i)}</option>)}</Sel>
            <span style={{color:th.txM,fontSize:14,fontWeight:700}}>:</span>
            <Sel value={mn} onChange={v=>setMn(v)} disabled={!!lockedSched} style={{width:68,opacity:lockedSched?.5:1}} t={th}><option value="">分</option>{Array.from({length:60},(_,i)=><option key={i} value={i}>{p2(i)}</option>)}</Sel>
            <span style={{color:th.txM,fontSize:14,fontWeight:700}}>:</span>
            <Sel value={sc} onChange={v=>setSc(v)} disabled={!!lockedSched} style={{width:68,opacity:lockedSched?.5:1}} t={th}><option value="">秒</option>{Array.from({length:60},(_,i)=><option key={i} value={i}>{p2(i)}</option>)}</Sel>
          </>}
          {isLive&&<span style={{fontSize:12,color:th.red,fontWeight:600,display:"inline-flex",alignItems:"center",gap:4}}><IC.zap s={12}/> 即時模式 — 預啟動 {pre}s 後立即播放</span>}
          {lockedSched&&<span style={{fontSize:11,color:th.acc,fontWeight:600}}><span style={{display:"inline-flex",alignItems:"center",gap:4}}><IC.link s={11}/> {lockedSched.label}</span></span>}
          {lockedSched&&<Btn small ghost onClick={()=>setLockedSched(null)} t={th} style={{fontSize:10,padding:"2px 6px"}}>✕ 解鎖</Btn>}
          {tp&&!lockedSched&&!isLive&&<span style={{fontSize:11,color:th.red,display:"inline-flex",alignItems:"center",gap:4}}><IC.warn s={12}/> {datePast?"日期已過期，無法建立排程":"時間已過去"}</span>}
        </div>}
        {/* End time mode */}
        {(ts||isLive||isChain)&&<div style={{display:"flex",gap:6,alignItems:"center",flexWrap:"nowrap",marginTop:8}}>
          {(()=>{
            // 動態產生可用的 etMode 選項
            const opts=[
              {v:"dur",  icon:<IC.hourglass s={13}/>, label:"播放長度"},
            ];
            if(!quickMode&&!isLive&&!isChain)opts.push({v:"time", icon:<IC.clock s={13}/>, label:"結束時間"});
            if(!quickMode)opts.push({v:"bgm",  icon:<IC.music s={13}/>, label:"跟隨音樂"});
            // 快速模式：單按鈕，不 highlight，寬度與「指定時間」一致
            // 進階模式：多按鈕組，右側對齊上方日期欄
            if(quickMode){
              // 快速模式只有 dur，顯示為單一無 highlight 按鈕
              return <button style={{display:"inline-flex",alignItems:"center",gap:6,width:140,padding:"7px 14px",borderRadius:8,border:`1px solid ${th.bd}`,background:th.sf2,color:th.txD,fontSize:13,fontWeight:600,cursor:"default",fontFamily:font,flexShrink:0}}>
                <IC.hourglass s={13}/> 播放長度
              </button>;
            }
            return <div style={{display:"flex",gap:2,flexShrink:0,background:th.sf2,borderRadius:8,padding:2,border:`1px solid ${th.bd}`,width:286}}>
              {opts.map(o=>{
                const on=etMode===o.v;
                return <button key={o.v} onClick={()=>{
                  if(o.v==="bgm"&&!bgm){bgmChipIntentRef.current=true;setShowBgmBrowser(true);return;}
                  setEtMode(o.v);
                }} style={{display:"inline-flex",alignItems:"center",gap:5,padding:"5px 10px",borderRadius:6,border:"none",background:on?th.acc:"transparent",color:on?"#fff":th.txD,fontSize:12,fontWeight:on?600:400,cursor:"pointer",fontFamily:font,transition:"all .15s",whiteSpace:"nowrap"}}>
                  {o.icon}{o.label}
                </button>;
              })}
            </div>;
          })()}
          {etMode==="dur"&&<>
            {quickMode?<>
              <Sel value={Math.floor((+txtDur||0)/60)} onChange={v=>setTxtDur(((+v||0)*60)+((+txtDur||0)%60))} style={{width:68,marginLeft:6}} t={th}>{Array.from({length:10},(_,i)=>i+1).map(i=><option key={i} value={i}>{i}</option>)}</Sel>
              <span style={{color:th.txM,fontSize:14,fontWeight:700}}>:</span>
              <Sel value={Math.round(((+txtDur||0)%60)/10)*10} onChange={v=>setTxtDur((Math.floor((+txtDur||0)/60)*60)+(+v||0))} style={{width:68}} t={th}>{[0,10,20,30,40,50].map(i=><option key={i} value={i}>{i}</option>)}</Sel>
            </>:<>
              <Inp value={String(Math.floor((+txtDur||0)/60))} onChange={v=>setTxtDur(((+v||0)*60)+((+txtDur||0)%60))} type="number" min={0} style={{width:68,padding:"7px 10px",fontSize:13,marginLeft:6}} t={th}/>
              <span style={{color:th.txM,fontSize:14,fontWeight:700}}>:</span>
              <Inp value={String((+txtDur||0)%60)} onChange={v=>setTxtDur((Math.floor((+txtDur||0)/60)*60)+(+v||0))} type="number" min={0} max={59} style={{width:68,padding:"7px 10px",fontSize:13}} t={th}/>
            </>}
            {!isLive&&te&&<span style={{fontSize:11,color:th.txM}}>播放至 {te}</span>}
          </>}
          {etMode==="time"&&!isLive&&<>
            <span style={{fontSize:12,color:th.txM,marginLeft:6}}>結束</span>
            <Sel value={etHr} onChange={setEtHr} style={{width:68}} t={th}><option value="">時</option>{Array.from({length:24},(_,i)=><option key={i} value={i}>{p2(i)}</option>)}</Sel>
            <span style={{color:th.txM,fontSize:14,fontWeight:700}}>:</span>
            <Sel value={etMn} onChange={setEtMn} style={{width:68}} t={th}><option value="">分</option>{Array.from({length:60},(_,i)=><option key={i} value={i}>{p2(i)}</option>)}</Sel>
            <span style={{color:th.txM,fontSize:14,fontWeight:700}}>:</span>
            <Sel value={etSc} onChange={setEtSc} style={{width:68}} t={th}><option value="">秒</option>{Array.from({length:60},(_,i)=><option key={i} value={i}>{p2(i)}</option>)}</Sel>
            {customEtDur>0&&<span style={{fontSize:11,color:th.grn}}>= {fmtSec(customEtDur)}</span>}
            {customEt&&customEtDur<=0&&<span style={{fontSize:11,color:th.red,display:"inline-flex",alignItems:"center",gap:5}}><IC.warn s={12}/> 結束時間須在開始之後</span>}
          </>}
          {etMode==="bgm"&&bgm&&<div style={{display:"flex",flexDirection:"column",gap:3,marginLeft:6,minWidth:0,flex:1}}>
            <div style={{display:"flex",gap:8,alignItems:"center",fontSize:12,color:th.txM}}>
              <span style={{overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:360}}><span style={{display:"inline-flex",alignItems:"center",gap:4}}><IC.music s={12}/> {bgm.name}</span></span>
              {bgm.duration>0&&<span style={{color:th.grn,flexShrink:0}}>= {fmtSec(bgm.duration)}</span>}
              {(!bgm.duration||bgm.duration<=0)&&<span style={{color:th.amb,flexShrink:0,display:"inline-flex",alignItems:"center",gap:4}}><IC.warn s={12}/> 無法取得音樂長度</span>}
            </div>
            {bgm.duration>0&&(()=>{
              const imgDur=mediaList.filter(m=>m.mt==="image").reduce((a,m)=>a+(+m.dur||0),0);
              if(imgDur>=bgm.duration)return <div style={{fontSize:11,color:th.red,display:"inline-flex",alignItems:"center",gap:4}}><IC.warn s={12}/> 圖片總時間（{fmtSec(imgDur)}）已等於/超過曲目長度，文字將不顯示</div>;
              return <div style={{fontSize:11,color:th.txM}}><IC.text s={12}/> 文字 {fmtSec(txtDur)}{imgDur>0&&` + 圖片 ${fmtSec(imgDur)}`}</div>;
            })()}
          </div>}
        </div>}
      </Field>
    </div>

    {/* Row 2.5: Repeat (only for new, not edit/copy, and not in quick mode) */}
    {!isEdit&&!quickMode&&<div style={{borderTop:`1px solid ${th.bd}`,marginTop:4,paddingTop:12}}>
      <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
        <span style={{fontSize:12,color:th.txM,fontWeight:700,flexShrink:0}}><span style={{display:"inline-flex",alignItems:"center",gap:3}}><IC.repeat s={11}/> 重複</span></span>
        {["none","daily","weekly"].map(m=><Chip key={m} on={repeatMode===m} onClick={()=>setRepeatMode(m)} style={{padding:"4px 12px",fontSize:11}} t={th}>{m==="none"?"單次":m==="daily"?"每日":"每週"}</Chip>)}
        {repeatMode!=="none"&&<>
          <span style={{fontSize:11,color:th.txM}}>持續</span>
          <Inp value={repeatWeeks} onChange={v=>setRepeatWeeks(v)} type="number" min={1} placeholder="永久" style={{width:56,padding:"4px 6px",fontSize:11}} t={th}/>
          <span style={{fontSize:11,color:th.txM}}>週</span>
          {repeatWeeks&&+repeatWeeks>0&&(()=>{
            const dates=calcRepeatDates(date,repeatMode,repeatDays,repeatWeeks);
            const last=dates[dates.length-1];
            return last?<span style={{fontSize:11,color:th.txD}}>→ {fmtD(last)}</span>:null;
          })()}
          {!repeatWeeks&&<span style={{fontSize:11,color:th.amb}}>永久</span>}
        </>}
      </div>
      {repeatMode==="weekly"&&<div style={{display:"flex",gap:6,marginTop:8}}>
        {["日","一","二","三","四","五","六"].map((d,i)=><Chip key={i} on={repeatDays.includes(i)} onClick={()=>setRepeatDays(p=>p.includes(i)?p.filter(x=>x!==i):[...p,i])} style={{padding:"4px 10px",fontSize:12,minWidth:32,justifyContent:"center"}} t={th}>{d}</Chip>)}
      </div>}
      {repeatMode!=="none"&&(()=>{
        const count=calcRepeatDates(date,repeatMode,repeatDays,repeatWeeks).length;
        return <div style={{fontSize:11,color:th.txM,marginTop:6}}>將建立 {count} 筆排程（含今天）</div>;
      })()}
    </div>}

    {/* Row 3: Text (WYSIWYG 16:9 preview) */}
    <div style={{borderTop:`1px solid ${th.bd}`,marginTop:4,paddingTop:16}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
        <span style={{display:"inline-flex",alignItems:"center",gap:8}}>
          <span style={{fontSize:12,color:th.txM,fontWeight:700,display:"inline-flex",alignItems:"center",gap:5}}><IC.text s={13}/> 文字內容（選填）</span>{hasTxt&&` · ${fmtSec(txtDur)}`}
          <button onClick={()=>setToolbarExpanded(e=>!e)} title={toolbarExpanded?"收合格式工具列":"展開格式工具列（粗體、字級、顏色）"} style={{marginLeft:10,display:"inline-flex",alignItems:"center",justifyContent:"center",width:24,height:22,borderRadius:5,border:`1px solid ${th.bd}`,background:toolbarExpanded?th.acc+"22":"transparent",color:toolbarExpanded?th.accL:th.txD,cursor:"pointer",verticalAlign:"middle",padding:0}}>
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M2 4h12M4 8h8M6 12h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </span>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          {!cfg.textBgImg&&<><span style={{fontSize:11,color:th.txM}}>底色</span>
          <input type="color" value={bgColor} onChange={e=>setBgColor(e.target.value)} style={{width:24,height:20,border:"none",cursor:"pointer"}}/></>}
        </div>
      </div>
      {/* 16:9 WYSIWYG Container */}
      {(()=>{
        const sc=senders.find(x=>x.id===+sid);
        const sClr=useCustom?(userPref?.customColor||"#3b82f6"):(sc?.color||th.acc);
        const sName=sender||"發話單位";
        const hasBgImg=!!cfg.textBgImg;
        const bannerJsx=<div style={{position:"relative",display:"flex",alignItems:"center",gap:29,padding:"22px 77px",background:"rgba(0,0,0,.35)",backdropFilter:"blur(8px)",WebkitBackdropFilter:"blur(8px)",borderBottom:"1px solid rgba(255,255,255,.1)"}}>
          {cfg.showAvatar!==false&&effectiveAvatar&&<img src={effectiveAvatar} style={{height:64,width:64,borderRadius:12,objectFit:"cover",flexShrink:0}} alt=""/>}
          <span style={{padding:"5px 29px",borderRadius:10,background:sClr+"33",color:sClr,fontWeight:700,fontSize:38,borderLeft:`2px solid ${sClr}`,textShadow:"-1px -1px 0 rgba(0,0,0,.6),1px -1px 0 rgba(0,0,0,.6),-1px 1px 0 rgba(0,0,0,.6),1px 1px 0 rgba(0,0,0,.6),0 1px 4px rgba(0,0,0,.4)",fontFamily:"inherit"}}>{sName}</span>
          <BannerTimeBadge timeText={fmtBannerTime(ts,cfg.bannerTimeFormat)} color={cfg.bannerTimeColor} loop={true} loopDur={18} extraStyle={{position:"absolute",top:22,right:77}}/>
        </div>;
        const bgStyle={backgroundColor:hasBgImg?"#000":(bgColor||cfg.defaultBgColor||"#1a1e2a"),backgroundImage:hasBgImg?`url(http://${window.location.hostname}:3001/api/text-bg-image)`:undefined,backgroundSize:"cover",backgroundPosition:"center",backgroundRepeat:"no-repeat"};
        return <div>
          <RichEditor classOfficers={highlightList} value={txt} onChange={setTxt} theme={th} minHeight={0} bgColor="transparent" textColor={cfg.defaultTxtColor||"#fff"} defaultFontSize={cfg.defaultFontSize} defaultLineHeight={cfg.defaultLineHeight} wysiwygMode={true} wysiwygBanner={bannerJsx} wysiwygBg={bgStyle} wysiwygBgBlur={cfg.textBgBlur||0} toolbarExpanded={toolbarExpanded} onToolbarExpandedChange={setToolbarExpanded} renderWysiwyg={(toolbar,content)=><>{toolbar}{content}</>}/>
        </div>;
      })()}
      <div style={{fontSize:10,color:th.txM,marginTop:4,textAlign:"right"}}><span style={{opacity:.7}}>✦ 使用所見即所得技術呈現</span></div>
    </div>

    {/* Row 4: Media — 快速模式下可見但不能編輯 */}
    {(!quickMode||hasMedia)&&<div style={{borderTop:`1px solid ${th.bd}`,marginTop:12,paddingTop:12}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10,gap:8}}>
        <span style={{fontSize:12,color:th.txM,fontWeight:700}}><span style={{display:"inline-flex",alignItems:"center",gap:5}}><IC.video s={13}/> 媒體檔案（選填）</span>{hasMedia&&` · ${mediaList.length}個${mediaDur>0?` · ${fmtSec(mediaDur)}`:""}`}</span>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          {quickMode?<span style={{fontSize:11,color:th.txM,fontStyle:"italic"}}><span style={{display:"inline-flex",alignItems:"center",gap:4}}><IC.lock s={12}/> 唯讀 · 切換</span>至「進階」可編輯</span>
          :<><span style={{fontSize:11,color:th.txM,fontStyle:"italic"}}><span style={{display:"inline-flex",alignItems:"center",gap:4}}><IC.bulb s={12}/> 會在文字訊息播放完畢後依序播出</span></span>
          <Btn small onClick={()=>setShowFileBrowser(true)} t={th}><span style={{display:"inline-flex",alignItems:"center",gap:5}}><IC.folderOpen s={13}/> 新增檔案</span></Btn></>}
        </div>
      </div>
      {mediaList.length>0?<div style={{display:"flex",flexDirection:"column",gap:6}}>
        {mediaList.map((m,i)=><div key={i} style={{display:"flex",alignItems:"center",gap:8,padding:"8px 12px",borderRadius:8,background:th.bg2,border:`1px solid ${th.bd}`,opacity:quickMode?.85:1}}>
          <span style={{fontSize:12,color:th.txM,fontWeight:700,width:20,textAlign:"center"}}>{i+1}</span>
          {(m.mt==="video"||m.mt==="audio")?<img src={`http://${window.location.hostname}:3001/api/thumbnail?path=${encodeURIComponent(m.path)}`} onError={e=>{e.target.style.display="none";e.target.nextSibling.style.display="flex";}} style={{width:48,height:32,objectFit:"cover",borderRadius:4,flexShrink:0}} alt=""/>:null}
          {m.mt==="image"?<img src={`http://${window.location.hostname}:3001/media/${encodeURIComponent(m.path)}`} onError={e=>{e.target.style.display="none";e.target.nextSibling.style.display="flex";}} style={{width:48,height:32,objectFit:"cover",borderRadius:4,flexShrink:0}} alt=""/>:null}
          <span style={{fontSize:16,display:m.mt==="image"||m.mt==="video"||m.mt==="audio"?"none":"flex",width:48,height:32,alignItems:"center",justifyContent:"center",borderRadius:4,background:th.sf,flexShrink:0}}>{mtIcon[m.mt]||<IC.file s={15}/>}</span>
          <span style={{flex:1,fontSize:13,color:th.tx,fontWeight:500,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{m.name}</span>
          <Badge color={m.mt==="video"?th.pink:m.mt==="audio"?th.cyan:th.amb} t={th}>{m.mt}</Badge>
          <div style={{display:"flex",alignItems:"center",gap:4}}>
            <input type="number" value={m.dur===""?"":m.dur} onChange={e=>setMediaDur(i,e.target.value)} disabled={quickMode} style={{width:55,padding:"3px 6px",borderRadius:4,background:th.sf,border:`1px solid ${th.bd}`,color:th.tx,fontSize:12,textAlign:"center",cursor:quickMode?"not-allowed":"text"}} min={0} placeholder="秒"/>
            <span style={{fontSize:10,color:th.txM}}>秒</span>
            {!m.dur&&m.mt!=="image"&&<span style={{fontSize:10,color:th.txM}}>(0=依實際)</span>}
          </div>
          <button onClick={()=>moveMedia(i,-1)} disabled={i===0||quickMode} style={{background:"none",border:"none",cursor:(i===0||quickMode)?"not-allowed":"pointer",color:(i===0||quickMode)?th.txM:th.txD,fontSize:14,padding:2}}>▲</button>
          <button onClick={()=>moveMedia(i,1)} disabled={i===mediaList.length-1||quickMode} style={{background:"none",border:"none",cursor:(i===mediaList.length-1||quickMode)?"not-allowed":"pointer",color:(i===mediaList.length-1||quickMode)?th.txM:th.txD,fontSize:14,padding:2}}>▼</button>
          <button onClick={()=>removeMedia(i)} disabled={quickMode} style={{background:"none",border:"none",cursor:quickMode?"not-allowed":"pointer",color:quickMode?th.txM:th.red,fontSize:14,padding:2}}>✕</button>
        </div>)}
      </div>:null}
    </div>}

    {/* BGM — 快速模式下可見但不能編輯 */}
    {(!quickMode||bgm)&&<div style={{borderTop:`1px solid ${th.bd}`,marginTop:12,paddingTop:12}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:bgm?10:0,gap:8}}>
        <span style={{fontSize:12,color:th.txM,fontWeight:700}}><span style={{display:"inline-flex",alignItems:"center",gap:5}}><IC.music s={13}/> 背景音樂（選填）</span></span>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          {quickMode?<span style={{fontSize:11,color:th.txM,fontStyle:"italic"}}><span style={{display:"inline-flex",alignItems:"center",gap:4}}><IC.lock s={12}/> 唯讀 · 切換</span>至「進階」可編輯</span>
          :<><span style={{fontSize:11,color:th.txM,fontStyle:"italic"}}>僅在播放文字訊息或圖片時作用，自動 loop</span>
          {!bgm&&<Btn small onClick={()=>setShowBgmBrowser(true)} t={th}><span style={{display:"inline-flex",alignItems:"center",gap:4}}><IC.music s={13}/> 選擇音樂</span></Btn>}</>}
        </div>
      </div>
      {bgm&&<div style={{display:"flex",alignItems:"center",gap:10,padding:"10px 12px",borderRadius:8,background:th.bg2,border:`1px solid ${th.bd}`,opacity:quickMode?.85:1}}>
        <span style={{fontSize:18}}><IC.music s={16}/></span>
        <span style={{flex:1,fontSize:13,color:th.tx,fontWeight:500,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{bgm.name}</span>
        <div style={{display:"flex",alignItems:"center",gap:6,minWidth:160}}>
          <span style={{fontSize:11,color:th.txM}}>音量</span>
          <input type="range" min={0} max={100} step={5} value={bgmVol} onChange={e=>setBgmVol(+e.target.value)} disabled={quickMode} style={{flex:1,accentColor:th.acc,cursor:quickMode?"not-allowed":"pointer"}}/>
          <span style={{fontSize:12,color:th.txD,fontWeight:600,minWidth:32,textAlign:"center"}}>{bgmVol}%</span>
        </div>
        <button onClick={()=>{setBgm(null);if(etMode==="bgm")setEtMode("dur");}} disabled={quickMode} style={{background:"none",border:"none",cursor:quickMode?"not-allowed":"pointer",color:quickMode?th.txM:th.red,fontSize:14,padding:2}}>✕</button>
      </div>}
    </div>}

    {/* Conflict detection */}
    {(()=>{
      if(!ts||!te||!rids.length) return null;
      const d=fmtD(date);
      const conflicts=scheds.filter(s=>{
        if(s.date!==d) return false;
        if(isEdit&&!isCopy&&s.id===editData.id) return false;
        if(!s.rids||!s.rids.some(r=>rids.includes(r))) return false;
        const sSt=timeToSec(s.st),sEt=timeToSec(s.et),nSt=timeToSec(ts),nEt=timeToSec(te);
        return nSt<sEt && nEt>sSt; // overlap
      });
      if(!conflicts.length) return null;
      const covers=conflicts.filter(s=>{const nSt=timeToSec(ts),nEt=timeToSec(te);return nSt<=timeToSec(s.st)&&nEt>=timeToSec(s.et);});
      return <div style={{marginTop:12,padding:"12px 16px",borderRadius:10,background:th.red+"12",border:`1px solid ${th.red}33`}}>
        <div style={{fontSize:13,fontWeight:700,color:th.red,marginBottom:6,display:"inline-flex",alignItems:"center",gap:5}}><IC.warn s={13}/> 時間衝突偵測到 {conflicts.length} 筆重疊排程</div>
        {conflicts.map(s=><div key={s.id} style={{fontSize:12,color:th.txD,lineHeight:1.8}}>
          #{s.id} {s.st}→{s.et} · {s.dept} · {s.sender}
          {covers.includes(s)&&<span style={{color:th.red,fontWeight:600}}> — 將被完全覆蓋！</span>}
        </div>)}
        <div style={{fontSize:11,color:th.txM,marginTop:4}}>重疊的排程在播放端會互相搶佔，建議調整時間避免衝突</div>
      </div>;
    })()}

    {/* Summary */}
    {ok&&<div style={{marginTop:12,padding:"14px 18px",borderRadius:10,background:th.acc+"0c",border:`1px solid ${th.acc}22`}}>
      <div style={{fontSize:13,color:th.txD,lineHeight:1.8}}>
        <strong style={{color:th.tx}}>排程摘要</strong> — {fmtD(date)} · {ts}→{te}（{fmtSec(totalDur)}）· {deptLabel} · {rids.length}間 · 預啟{pre}s · {sender}
        {hasTxt&&<span> · <IC.text s={11}/> {fmtSec(txtDur)}</span>}
        {hasMedia&&<span> · <IC.video s={11}/> {mediaList.length}個{mediaDur>0?fmtSec(mediaDur):""}</span>}
      </div>
    </div>}
    <div style={{display:"flex",justifyContent:"flex-end",gap:8,marginTop:20,paddingTop:16,borderTop:`1px solid ${th.bd}`}}>
      <Btn onClick={onClose} t={th}>取消</Btn>
      <Btn primary disabled={!ok} onClick={()=>{
        let saveTs=ts,saveTe=te,saveDur=effectiveDur,saveEtMode=etMode,saveTxtDur=hasTxt?txtDur:0;
        if(isLive){const n=new Date();const nowSec=`${p2(n.getHours())}:${p2(n.getMinutes())}:${p2(n.getSeconds())}`;saveTs=addS(nowSec,pre);saveTe=addS(saveTs,effectiveDur);if(saveEtMode==="time")saveEtMode="dur";}
        if(saveEtMode==="time"){saveDur=0;} // time mode: dur=0, et is the stop point
        if(saveEtMode==="bgm"&&bgm?.duration){
          // In bgm mode, txtDur is already auto-calculated (bgm.duration - imageDur)
          saveTxtDur=hasTxt?txtDur:0;
        }
        const normalizedMedia=mediaList.map(m=>({...m,dur:+m.dur||0}));
        const base={date:fmtD(date),st:saveTs,et:saveTe,dept:deptLabel,rids,txt:txtHas?txt:"",txtDur:saveTxtDur,bgColor,mediaList:hasMedia?normalizedMedia:[],bgm:bgm?{...bgm,volume:bgmVol}:null,dur:saveDur,pre:livePre,sender,avatar:effectiveAvatar,live:isLive||undefined,etMode:saveEtMode};
        if(!isEdit&&repeatMode!=="none"){
          base._repeat={mode:repeatMode,days:repeatDays,weeks:repeatWeeks,startDate:date};
        }
        onSave(base);
      }} t={th}>{isLive?"立即播放":isCopy?"確認複製排程":isEdit?"儲存修改":repeatMode!=="none"?`確認建立 ${calcRepeatDates(date,repeatMode,repeatDays,repeatWeeks).length} 筆排程`:"確認建立排程"}</Btn>
    </div>
    {showFileBrowser&&<FileBrowser th={th} onSelect={f=>{addMedia(f);setShowFileBrowser(false);}} onClose={()=>setShowFileBrowser(false)}/>}
    {showBgmBrowser&&<FileBrowser th={th} onSelect={f=>{
      if(f.mt!=="audio"&&f.mt!=="video"){alert("背景音樂只能選擇音訊或影片檔（影片將僅播放音軌）");return;}
      const fromChip=bgmChipIntentRef.current;
      bgmChipIntentRef.current=false;
      const audio=new Audio(`http://${window.location.hostname}:3001/media/${encodeURIComponent(f.path)}`);
      audio.addEventListener("loadedmetadata",()=>{
        setBgm({path:f.path,name:f.name,duration:Math.round(audio.duration||0)});
        if(fromChip)setEtMode("bgm");
        setShowBgmBrowser(false);
      });
      audio.addEventListener("error",()=>{
        setBgm({path:f.path,name:f.name,duration:0});
        if(fromChip)setEtMode("bgm");
        setShowBgmBrowser(false);
      });
    }} onClose={()=>{bgmChipIntentRef.current=false;setShowBgmBrowser(false);}}/>}
  </Modal>;
}


/* ═══ FILE BROWSER ═══ */
function FileBrowser({th,onSelect,onClose}){
  const [files,setFiles]=useState([]);const [curPath,setCurPath]=useState("");const [dir,setDir]=useState("");const [loading,setLoading]=useState(true);
  const [closing,setClosing]=useState(false);
  const [panelW,setPanelW]=useState(480);
  const [viewMode,setViewMode]=useState(()=>{try{return localStorage.getItem("fileBrowserView")||"list";}catch{return "list";}});
  useEffect(()=>{try{localStorage.setItem("fileBrowserView",viewMode);}catch{}},[viewMode]);
  const load=async(p="")=>{setLoading(true);try{const res=await api.getMedia(p);setFiles(res.files||[]);setDir(res.dir||"");setCurPath(p);}catch(e){console.error(e);}setLoading(false);};
  useEffect(()=>{load();},[]);
  const mtIcon={image:<IC.image s={13}/>,video:<IC.video s={13}/>,audio:<IC.music s={13}/>,folder:<IC.folder s={13}/>,unknown:<IC.file s={13}/>};
  const fmtSize=b=>{if(b>1048576)return(b/1048576).toFixed(1)+"MB";if(b>1024)return(b/1024).toFixed(0)+"KB";return b+"B";};
  const goUp=()=>{const parts=curPath.split("/").filter(Boolean);parts.pop();load(parts.join("/"));};
  const fmtDur=s=>{if(!s)return"";const m=Math.floor(s/60),r=s%60;return m>0?`${m}:${String(r).padStart(2,'0')}`:`0:${String(r).padStart(2,'0')}`;};
  const slideClose=(cb)=>{setClosing(true);setTimeout(cb,200);};
  const onDragLeft=useCallback((e)=>{
    e.preventDefault();const startX=e.clientX;const startW=panelW;
    const onMove=ev=>{setPanelW(Math.max(320,Math.min(window.innerWidth*0.8,startW-(ev.clientX-startX))));};
    const onUp=()=>{window.removeEventListener('mousemove',onMove);window.removeEventListener('mouseup',onUp);};
    window.addEventListener('mousemove',onMove);window.addEventListener('mouseup',onUp);
  },[panelW]);

  const visibleFiles=files.filter(f=>f.type==="folder"||f.mt==="image"||f.mt==="video"||f.mt==="audio");

  return <div style={{position:"fixed",inset:0,zIndex:200,display:"flex",justifyContent:"flex-end"}}>
    <div onClick={()=>slideClose(onClose)} style={{position:"absolute",inset:0,background:"rgba(0,0,0,.35)",opacity:closing?0:1,transition:"opacity .2s"}}/>
    <div style={{position:"relative",zIndex:1,background:th.sf,borderLeft:`1px solid ${th.bd}`,width:panelW,height:"100%",display:"flex",flexDirection:"column",boxShadow:"-8px 0 30px rgba(0,0,0,.3)",animation:`${closing?"slideOut":"slideIn"} .2s ease-out`,animationFillMode:"forwards"}}>
      {/* Drag handle on left edge */}
      <div onMouseDown={onDragLeft} style={{position:"absolute",left:0,top:0,bottom:0,width:6,cursor:"ew-resize",zIndex:2}} title="拖曳調整寬度"/>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"14px 20px",borderBottom:`1px solid ${th.bd}`,flexShrink:0}}>
        <span style={{fontSize:15,fontWeight:700,color:th.tx}}><span style={{display:"inline-flex",alignItems:"center",gap:6}}><IC.folder s={15}/> 選擇媒體檔案</span></span>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <div style={{display:"flex",background:th.sf2,border:`1px solid ${th.bd}`,borderRadius:6,overflow:"hidden"}}>
            <button onClick={()=>setViewMode("list")} title="清單" style={{background:viewMode==="list"?th.acc:"transparent",color:viewMode==="list"?"#fff":th.txD,border:"none",cursor:"pointer",padding:"4px 10px",fontSize:13,fontFamily:"inherit",display:"inline-flex",alignItems:"center"}}><IC.menu s={14}/></button>
            <button onClick={()=>setViewMode("grid")} title="縮圖" style={{background:viewMode==="grid"?th.acc:"transparent",color:viewMode==="grid"?"#fff":th.txD,border:"none",cursor:"pointer",padding:"4px 10px",fontSize:13,fontFamily:"inherit"}}>▦</button>
          </div>
          <button onClick={()=>slideClose(onClose)} style={{background:"none",border:"none",color:th.txM,cursor:"pointer",fontSize:18}}>✕</button>
        </div>
      </div>
      <div style={{padding:"8px 20px",borderBottom:`1px solid ${th.bd}`,fontSize:11,color:th.txM,display:"flex",alignItems:"center",gap:8,flexShrink:0}}>
        <span style={{fontFamily:mono,flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{dir}{curPath?"/"+curPath:""}</span>
        {curPath&&<Btn small ghost onClick={goUp} t={th} style={{padding:"2px 8px",fontSize:11,flexShrink:0}}>⬆ 上一層</Btn>}
      </div>
      <div style={{flex:1,overflowY:"auto",padding:viewMode==="grid"?"12px":"4px 0"}}>
        {loading?<div style={{padding:40,textAlign:"center",color:th.txM}}>載入中...</div>
        :visibleFiles.length===0?<div style={{padding:40,textAlign:"center",color:th.txM}}>此資料夾無檔案</div>
        :viewMode==="list"?visibleFiles.map((f,i)=><button key={i} onClick={()=>{if(f.type==="folder"){load(f.path);}else{slideClose(()=>onSelect(f));}}} style={{display:"flex",alignItems:"center",gap:8,width:"100%",padding:"9px 20px",border:"none",borderBottom:`1px solid ${th.bd}22`,background:"transparent",cursor:"pointer",textAlign:"left",fontFamily:font,color:th.tx,fontSize:13}} onMouseEnter={e=>e.currentTarget.style.background=th.sf2} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
          <span style={{fontSize:16,flexShrink:0,width:22,textAlign:"center"}}>{mtIcon[f.type==="folder"?"folder":f.mt]||mtIcon.unknown}</span>
          <span style={{flex:1,fontWeight:f.type==="folder"?600:400,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{f.name}</span>
          <span style={{fontSize:11,color:th.accL,fontFamily:mono,fontWeight:600,width:44,textAlign:"right",flexShrink:0}}>{f.duration>0?fmtDur(f.duration):""}</span>
          <span style={{fontSize:10,color:th.txM,width:48,textAlign:"right",flexShrink:0}}>{f.type==="file"?fmtSize(f.size):""}</span>
          <span style={{width:44,flexShrink:0,textAlign:"center"}}>{f.type==="file"&&f.mt!=="unknown"?<Badge color={f.mt==="video"?th.pink:f.mt==="audio"?th.cyan:th.amb} t={th}>{f.mt}</Badge>:f.type==="folder"?<span style={{fontSize:12,color:th.txM}}>▶</span>:null}</span>
        </button>):<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(130px,1fr))",gap:10}}>
          {visibleFiles.map((f,i)=><button key={i} onClick={()=>{if(f.type==="folder"){load(f.path);}else{slideClose(()=>onSelect(f));}}} style={{display:"flex",flexDirection:"column",alignItems:"stretch",gap:6,padding:8,border:`1px solid ${th.bd}`,borderRadius:8,background:th.sf2,cursor:"pointer",fontFamily:font,color:th.tx}} onMouseEnter={e=>{e.currentTarget.style.borderColor=th.acc;e.currentTarget.style.background=th.sf3||th.sf2;}} onMouseLeave={e=>{e.currentTarget.style.borderColor=th.bd;e.currentTarget.style.background=th.sf2;}}>
            <div style={{width:"100%",aspectRatio:"16/10",borderRadius:6,background:th.bg2,display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden",position:"relative"}}>
              {f.type==="folder"?<span style={{fontSize:40,opacity:.7,display:"flex",alignItems:"center",justifyContent:"center"}}><IC.folder s={36}/></span>
              :f.mt==="image"?<img src={`http://${window.location.hostname}:3001/media/${encodeURIComponent(f.path)}`} onError={e=>{e.target.style.display="none";e.target.nextSibling.style.display="flex";}} style={{width:"100%",height:"100%",objectFit:"cover"}} alt=""/>
              :(f.mt==="video"||f.mt==="audio")?<img src={`http://${window.location.hostname}:3001/api/thumbnail?path=${encodeURIComponent(f.path)}`} onError={e=>{e.target.style.display="none";e.target.nextSibling.style.display="flex";}} style={{width:"100%",height:"100%",objectFit:"cover"}} alt=""/>
              :null}
              <span style={{display:"none",fontSize:32,alignItems:"center",justifyContent:"center",width:"100%",height:"100%",position:"absolute",inset:0}}>{mtIcon[f.type==="folder"?"folder":f.mt]||mtIcon.unknown}</span>
              {f.type==="file"&&f.duration>0&&<span style={{position:"absolute",right:4,bottom:4,fontSize:10,color:"#fff",background:"rgba(0,0,0,.7)",padding:"1px 5px",borderRadius:3,fontFamily:mono,fontWeight:600}}>{fmtDur(f.duration)}</span>}
              {f.type==="file"&&f.mt&&f.mt!=="unknown"&&<span style={{position:"absolute",left:4,top:4,fontSize:9,color:"#fff",background:f.mt==="video"?th.pink:f.mt==="audio"?th.cyan:th.amb,padding:"1px 5px",borderRadius:3,fontWeight:700,textTransform:"uppercase"}}>{f.mt}</span>}
            </div>
            <div style={{fontSize:11,fontWeight:f.type==="folder"?600:500,color:th.tx,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",textAlign:"left"}}>{f.name}</div>
            {f.type==="file"&&<div style={{fontSize:9,color:th.txM,textAlign:"left"}}>{fmtSize(f.size)}</div>}
          </button>)}
        </div>}
      </div>
    </div>
    <style>{`@keyframes slideIn{from{transform:translateX(100%)}to{transform:translateX(0)}}@keyframes slideOut{from{transform:translateX(0)}to{transform:translateX(100%)}}`}</style>
  </div>;
}

/* ═══ ROOM ═══ */
function PRoom({rooms,setRooms,models,cfg,reload,th}){
  const [show,setShow]=useState(false);const [ed,setEd]=useState(null);const [filter,setFilter]=useState("");
  const [tcpTest,setTcpTest]=useState(null);// {roomId, status, result}
  const [showDupCheck,setShowDupCheck]=useState(false);
  // 重複偵測：回傳 {nameDups: Map<key, [room,...]>, ipDups: Map<ip, [room,...]>, dupIds: Set<id>}
  //   key = dept + "|" + name，避免國中 vs 高中的同名班級（例：「一年一班」）被誤判為重複
  const dupInfo=useMemo(()=>{
    const byName=new Map(),byIp=new Map();
    rooms.forEach(r=>{
      const nk=(r.name||"").trim();
      if(nk){const key=`${r.dept||""}|${nk}`;if(!byName.has(key))byName.set(key,[]);byName.get(key).push(r);}
      const ik=(r.ip||"").trim();if(ik){if(!byIp.has(ik))byIp.set(ik,[]);byIp.get(ik).push(r);}
    });
    const nameDups=new Map(),ipDups=new Map(),dupIds=new Set();
    byName.forEach((arr,k)=>{if(arr.length>1){nameDups.set(k,arr);arr.forEach(r=>dupIds.add(r.id));}});
    byIp.forEach((arr,k)=>{if(arr.length>1){ipDups.set(k,arr);arr.forEach(r=>dupIds.add(r.id));}});
    return {nameDups,ipDups,dupIds};
  },[rooms]);
  const dupCount=dupInfo.nameDups.size+dupInfo.ipDups.size;
  const save=async(d)=>{try{if(ed)await api.updateRoom(ed.id,d);else await api.addRoom(d);await reload("rooms");await reload("logs");}catch(e){alert(e.message);}setShow(false);setEd(null);};
  const del=async(id)=>{
    const r=rooms.find(x=>x.id===id);
    if(!r)return;
    if(!confirm(`確定刪除此班級？\n\n${r.dept} · ${r.name}\nIP: ${r.ip}\n\n⚠ 刪除後將無法透過此介面還原`))return;
    try{await api.deleteRoom(id);await reload("rooms");await reload("logs");}catch(e){alert(e.message);}
  };
  const tcpSend=async(roomId,action)=>{
    setTcpTest({roomId,action,status:"sending",result:null});
    try{
      const data=await api.tcpSend(action,[roomId]);
      if(data.error){setTcpTest({roomId,action,status:"error",result:data.error});setTimeout(()=>setTcpTest(null),3000);return;}
      const r=data.results?.find(x=>x.roomId===roomId);
      const ok=r?r.status==="ok":true;
      if(!ok){setTcpTest({roomId,action,status:"error",result:r?.error||"未知錯誤"});setTimeout(()=>setTcpTest(null),3000);return;}
      // 發送成功，先進入「等待回應」狀態（按鈕繼續填滿藍色動畫）
      setTcpTest({roomId,action,status:"sending",result:"已送出，等待回應..."});
      const maxTime=Math.min(cfg.tcpTimeout||3000,3000);const startT=Date.now();
      const checkResponse=async()=>{
        try{
          const sr=await api.tcpStatus();
          const tr=sr.results?.find(x=>x.roomId===roomId);
          if(tr?.response){
            setTcpTest({roomId,action,status:"ok",result:"回應: "+tr.response});
            setTimeout(()=>setTcpTest(null),3000);
            return;
          }
        }catch(e){}
        if(Date.now()-startT<maxTime)setTimeout(checkResponse,200);
        else{setTcpTest({roomId,action,status:"ok",result:"已送出（無回應）"});setTimeout(()=>setTcpTest(null),3000);}
      };
      setTimeout(checkResponse,200);
    }catch(e){setTcpTest({roomId,action,status:"error",result:e.message});setTimeout(()=>setTcpTest(null),3000);}
  };
  // 排序：先部門（國小→國中→高中→其他），再依班級名稱（年級數字＋班號）
  const deptOrder={"國小":1,"國中":2,"高中":3};
  const parseClassName=(name)=>{
    const m=(name||"").match(/^(\d+)年(\d+)班$/);
    return m?[+m[1],+m[2]]:[999,0];
  };
  const filtered=rooms.filter(r=>!filter||r.dept===filter).slice().sort((a,b)=>{
    const da=deptOrder[a.dept]||99,db=deptOrder[b.dept]||99;
    if(da!==db)return da-db;
    const [ag,ac]=parseClassName(a.name),[bg,bc]=parseClassName(b.name);
    if(ag!==bg)return ag-bg;
    if(ac!==bc)return ac-bc;
    return (a.name||"").localeCompare(b.name||"");
  });
  return <div>
    <Title sub={"共 "+rooms.length+" 間教室"} action={<div style={{display:"flex",gap:8}}>
      <Btn small onClick={()=>setShowDupCheck(true)} t={th} style={dupCount>0?{borderColor:th.red,color:th.red}:{}}>{dupCount>0?`檢查重複（${dupCount}）`:"檢查重複"}</Btn>
      <Btn primary small onClick={()=>{setEd(null);setShow(true);}} t={th}>＋ 新增班級</Btn>
    </div>} t={th}>班級管理</Title>
    <style>{`@keyframes tcpFill{from{width:0%}to{width:100%}}`}</style>
    {(()=>{
      const stageDepts=getStageDepts(cfg);
      // 單階段時不顯示部門 filter（沒意義）
      if(stageDepts.length<=1)return null;
      return <div style={{display:"flex",gap:6,marginBottom:14}}>{["",...stageDepts].map(f=><Chip key={f} on={filter===f} onClick={()=>setFilter(f)} style={{padding:"5px 14px",fontSize:12}} t={th}>{f||"全部"}</Chip>)}</div>;
    })()}
    <Card style={{padding:0,overflowX:"auto"}} t={th}>
      <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
        <thead><tr style={{background:th.bg2}}>{["班級","部門","IP 位址","電視型號","訊號源","預啟動","TCP 測試","操作"].map(h=><th key={h} style={{padding:"11px 16px",textAlign:"left",fontWeight:600,color:th.txM,fontSize:11,borderBottom:`1px solid ${th.bd}`}}>{h}</th>)}</tr></thead>
        <tbody>{filtered.map(r=>{const m=models.find(x=>x.id===r.model);const preSec=m?Math.ceil((m.bootTime||0)+(cfg.loopDelay||0)/1000):0;const isDup=dupInfo.dupIds.has(r.id);const dupName=dupInfo.nameDups.has((r.name||"").trim());const dupIp=dupInfo.ipDups.has((r.ip||"").trim());
          // 是否此 row 有動作在執行（任一按鈕）
          const rowActive=tcpTest?.roomId===r.id;
          const rowSending=rowActive&&tcpTest.status==="sending";
          // 填滿動畫時間（秒）= 最多 tcpTimeout
          const fillDur=Math.min(cfg.tcpTimeout||3000,3000)/1000;
          const tcpTitle=rowActive?(tcpTest.status==="sending"?"⏳ "+(tcpTest.result||"發送中..."):(tcpTest.status==="ok"?"✅ ":"❌ ")+(tcpTest.result||"")):"";
          // 單一按鈕 render：action 名稱 / label / 是否顯示填滿動畫
          const renderBtn=(action,label)=>{
            const isSelf=rowActive&&tcpTest.action===action;
            const isOther=rowActive&&!isSelf;
            // 填滿色：藍/綠/紅帶 30% 透明度，文字保持原色可辨識
            const fillBase=isSelf?(tcpTest.status==="sending"?th.acc:tcpTest.status==="ok"?th.grn:th.red):null;
            const fillColor=fillBase?fillBase+"4D":null; // 4D = 30% alpha
            const borderColor=fillBase||th.bd;
            const disabled=rowActive;
            return <button key={action} disabled={disabled} onClick={()=>tcpSend(r.id,action)} style={{
              position:"relative",overflow:"hidden",
              fontSize:11,padding:"3px 10px",borderRadius:6,fontFamily:"inherit",
              border:`1px solid ${isSelf?borderColor:th.bd}`,
              background:isOther?th.bg2:"transparent",
              color:isOther?th.txM:(isSelf?fillBase:th.txD),
              cursor:disabled?"not-allowed":"pointer",
              opacity:isOther?.5:1,
              transition:"border-color .15s",
            }}>
              {/* Fill layer — 半透明 */}
              {isSelf&&<span style={{
                position:"absolute",left:0,top:0,bottom:0,zIndex:0,
                background:fillColor,
                width:tcpTest.status==="sending"?"0%":"100%",
                animation:tcpTest.status==="sending"?`tcpFill ${fillDur}s linear forwards`:"none",
              }}/>}
              <span style={{position:"relative",zIndex:1,fontWeight:isSelf?700:500}}>{label}</span>
            </button>;
          };
          return <tr key={r.id} style={{borderBottom:`1px solid ${th.bd}`,background:isDup?(th.red+"0f"):""}}>
          <td style={{padding:"11px 16px",fontWeight:600,color:dupName?th.red:th.tx,whiteSpace:"nowrap"}} title={dupName?"班級名稱重複":""}>{dupName&&"⚠ "}{r.name}</td>
          <td style={{padding:"11px 16px",whiteSpace:"nowrap"}}><Badge color={getDeptColor(r.dept,th)} t={th}>{r.dept}</Badge></td>
          <td style={{padding:"11px 16px",fontFamily:mono,fontSize:12,color:dupIp?th.red:th.cyan,whiteSpace:"nowrap"}} title={dupIp?"IP 位址重複":""}>{dupIp&&"⚠ "}{r.ip}</td>
          <td style={{padding:"11px 16px",color:th.txD,whiteSpace:"nowrap"}}>{m?.name||"—"}</td>
          <td style={{padding:"11px 16px",color:th.txD,fontSize:12,whiteSpace:"nowrap"}}>{(r.input||"hdmi1").toUpperCase()}</td>
          <td style={{padding:"11px 16px",whiteSpace:"nowrap",color:m?th.amb:th.txM,fontSize:12,fontFamily:mono}}>{m?`${preSec}s`:"—"}</td>
          <td style={{padding:"8px 12px",whiteSpace:"nowrap",width:1}}>
            <div style={{display:"inline-flex",gap:4}} title={tcpTitle}>
              {renderBtn("powerOn","開機")}
              {renderBtn("powerOff","關機")}
              {renderBtn("switchInput","訊號")}
            </div>
          </td>
          <td style={{padding:"11px 16px",whiteSpace:"nowrap"}}><Btn small ghost onClick={()=>{setEd(r);setShow(true);}} t={th}><IC.edit s={13}/></Btn> <Btn small ghost style={{color:th.red}} onClick={()=>del(r.id)} t={th}><IC.trash s={13}/></Btn></td>
        </tr>;})}</tbody>
      </table>
    </Card>
    {show&&<RoomForm init={ed} models={models} rooms={rooms} cfg={cfg} onSave={save} onClose={()=>{setShow(false);setEd(null);}} th={th}/>}
    {showDupCheck&&<DupCheckModal dupInfo={dupInfo} onClose={()=>setShowDupCheck(false)} onEdit={(r)=>{setShowDupCheck(false);setEd(r);setShow(true);}} th={th}/>}
  </div>;
}
function DupCheckModal({dupInfo,onClose,onEdit,th}){
  const {nameDups,ipDups}=dupInfo;
  const total=nameDups.size+ipDups.size;
  return <Modal title={<span style={{display:"inline-flex",alignItems:"center",gap:6}}><IC.search s={15}/>班級重複檢查</span>} onClose={onClose} width={560} t={th}>
    {total===0?<div style={{padding:"28px 8px",textAlign:"center"}}>
      <div style={{fontSize:42,marginBottom:10}}><IC.success s={42} style={{color:"#34d399"}}/></div>
      <div style={{fontSize:15,fontWeight:600,color:th.grn,marginBottom:4}}>未發現重複</div>
      <div style={{fontSize:12,color:th.txM}}>所有班級名稱與 IP 位址皆為唯一</div>
    </div>:<div>
      <div style={{fontSize:12,color:th.red,marginBottom:14,padding:"8px 12px",background:th.red+"11",borderRadius:4,borderLeft:`3px solid ${th.red}`}}>共偵測到 {total} 組重複項目，建議立即修正以免影響廣播運作</div>
      {nameDups.size>0&&<div style={{marginBottom:18}}>
        <div style={{fontSize:12,fontWeight:700,color:th.txD,marginBottom:8,display:"inline-flex",alignItems:"center",gap:5}}><IC.badge s={13}/> 班級名稱重複（{nameDups.size} 組）</div>
        {[...nameDups.entries()].map(([key,rms])=>{
          const [keyDept,keyName]=key.split("|");
          return <div key={"n"+key} style={{marginBottom:10,padding:10,background:th.bg2,borderRadius:4,border:`1px solid ${th.bd}`}}>
            <div style={{fontSize:13,fontWeight:600,color:th.red,marginBottom:6}}>{keyDept&&<Badge color={getDeptColor(keyDept,th)} t={th}>{keyDept}</Badge>} <span style={{marginLeft:6}}>「{keyName}」× {rms.length}</span></div>
            {rms.map(r=><div key={r.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",fontSize:12,padding:"4px 0",color:th.txD}}>
              <span><span style={{fontFamily:mono,color:th.cyan}}>{r.ip}</span></span>
              <Btn small ghost onClick={()=>onEdit(r)} t={th} style={{fontSize:11,padding:"2px 8px"}}>編輯</Btn>
            </div>)}
          </div>;
        })}
      </div>}
      {ipDups.size>0&&<div>
        <div style={{fontSize:12,fontWeight:700,color:th.txD,marginBottom:8}}><span style={{display:"inline-flex",alignItems:"center",gap:5}}><IC.globe s={13}/> IP 位址重複（</span>{ipDups.size} 組）</div>
        {[...ipDups.entries()].map(([ip,rms])=><div key={"i"+ip} style={{marginBottom:10,padding:10,background:th.bg2,borderRadius:4,border:`1px solid ${th.bd}`}}>
          <div style={{fontSize:13,fontWeight:600,color:th.red,marginBottom:6,fontFamily:mono}}>{ip} × {rms.length}</div>
          {rms.map(r=><div key={r.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",fontSize:12,padding:"4px 0",color:th.txD}}>
            <span><Badge color={getDeptColor(r.dept,th)} t={th}>{r.dept}</Badge> <span style={{marginLeft:8,fontWeight:600}}>{r.name}</span></span>
            <Btn small ghost onClick={()=>onEdit(r)} t={th} style={{fontSize:11,padding:"2px 8px"}}>編輯</Btn>
          </div>)}
        </div>)}
      </div>}
    </div>}
    <div style={{display:"flex",justifyContent:"flex-end",marginTop:12}}><Btn onClick={onClose} t={th}>關閉</Btn></div>
  </Modal>;
}
function RoomForm({init,models,rooms,cfg,onSave,onClose,th}){
  const stageDepts=getStageDepts(cfg);
  const isSingleStage=stageDepts.length===1;
  const [name,setName]=useState(init?.name||"");
  const [dept,setDept]=useState(init?.dept||(isSingleStage?stageDepts[0]:""));
  const [ip,setIp]=useState(init?.ip||"");const [model,setModel]=useState(init?.model?String(init.model):"");const [input,setInput]=useState(init?.input||"hdmi1");
  const selModel=models.find(m=>m.id===+model);const inputKeys=selModel?Object.keys(selModel).filter(k=>k.startsWith("hdmi")||k.startsWith("vga")||k.startsWith("dp")):[];
  // 即時檢查是否與其他班級重複（排除自己）— 用 dept+name 複合 key，避免「國中 1年1班」被誤判跟「高中 1年1班」衝突
  const nameClash=name.trim()&&dept&&(rooms||[]).some(r=>r.id!==init?.id&&(r.name||"").trim()===name.trim()&&(r.dept||"")===dept);
  const ipClash=ip.trim()&&(rooms||[]).some(r=>r.id!==init?.id&&(r.ip||"").trim()===ip.trim());
  return <Modal title={init?"編輯班級":"新增班級"} onClose={onClose} width={460} t={th}>
    <Field label="班級名稱" t={th}><Inp value={name} onChange={setName} placeholder="1年1班" t={th}/>{nameClash&&<div style={{fontSize:11,color:th.red,marginTop:4,display:"inline-flex",alignItems:"center",gap:4}}><IC.warn s={12}/> 此班級名稱已存在於相同部門</div>}</Field>
    {!isSingleStage&&<Field label="部門" t={th}><div style={{display:"flex",gap:8}}>{stageDepts.map(d=><Chip key={d} on={dept===d} onClick={()=>setDept(d)} style={{flex:1,fontWeight:600}} t={th}>{d}</Chip>)}</div></Field>}
    <Field label="IP 位址" t={th}><Inp value={ip} onChange={setIp} placeholder="192.168.1.xxx" t={th}/>{ipClash&&<div style={{fontSize:11,color:th.red,marginTop:4,display:"inline-flex",alignItems:"center",gap:4}}><IC.warn s={12}/> 此 IP 位址已被其他班級使用</div>}</Field>
    <Field label="電視型號" t={th}><Sel value={model} onChange={setModel} t={th}><option value="">選擇型號</option>{models.map(m=><option key={m.id} value={m.id}>{m.name}</option>)}</Sel></Field>
    {inputKeys.length>0&&<Field label="訊號源" t={th}><Sel value={input} onChange={setInput} t={th}>{inputKeys.map(k=><option key={k} value={k}>{k.toUpperCase()}</option>)}</Sel></Field>}
    <div style={{display:"flex",justifyContent:"flex-end",gap:8,marginTop:12}}><Btn onClick={onClose} t={th}>取消</Btn><Btn primary disabled={!name||!dept||!ip||!model||nameClash||ipClash} onClick={()=>onSave({name,dept,ip,model:+model,input})} t={th}>{init?"儲存":"新增"}</Btn></div>
  </Modal>;
}

/* ═══ MODEL ═══ */
function PModel({models,setModels,rooms,reload,th}){
  const [show,setShow]=useState(false);const [ed,setEd]=useState(null);
  const save=async(d)=>{try{if(ed)await api.updateModel(ed.id,d);else await api.addModel(d);await reload("models");await reload("logs");}catch(e){alert(e.message);}setShow(false);setEd(null);};
  // 計算每個 model 被幾個 room 引用
  const roomCount=(modelId)=>(rooms||[]).filter(r=>r.model===modelId).length;
  // 鮑率色彩：慢→暖色（紅/橘），快→冷色（藍/紫），中間→綠/青
  const baudColor=(baud)=>{
    const map={2400:th.red,4800:th.amb,9600:th.grn,19200:th.cyan,38400:th.acc,57600:"#8b5cf6",115200:"#ec4899"};
    return map[baud]||th.txM;
  };
  const fmtBaud=(baud)=>(+baud).toLocaleString("en-US");
  const del=async(id)=>{
    const m=models.find(x=>x.id===id);if(!m)return;
    const linked=roomCount(id);
    const warning=linked>0?`\n\n⚠ 目前有 ${linked} 個班級使用此型號，刪除後這些班級會失去設備型號設定`:"";
    if(!confirm(`確定刪除此設備型號？\n\n${m.name}${warning}`))return;
    try{await api.deleteModel(id);await reload("models");await reload("logs");}catch(e){alert(e.message);}
  };
  return <div>
    <Title sub={"共 "+models.length+" 種型號"} action={<Btn primary small onClick={()=>{setEd(null);setShow(true);}} t={th}>＋ 新增型號</Btn>} t={th}>設備型號管理</Title>
    <Card style={{padding:0,overflowX:"auto"}} t={th}>
      <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
        <thead><tr style={{background:th.bg2}}>{["型號","鮑率","開機碼","關機碼","開機秒數","關聯班級數","操作"].map(h=><th key={h} style={{padding:"11px 14px",textAlign:"left",fontWeight:600,color:th.txM,fontSize:11,borderBottom:`1px solid ${th.bd}`}}>{h}</th>)}</tr></thead>
        <tbody>{models.map(m=>{
          const linked=roomCount(m.id);
          return <tr key={m.id} style={{borderBottom:`1px solid ${th.bd}`}}>
            <td style={{padding:"11px 14px",fontWeight:600,color:th.tx,whiteSpace:"nowrap"}}>{m.name}</td>
            <td style={{padding:"11px 14px",whiteSpace:"nowrap"}}><Badge color={baudColor(m.baudRate)} t={th}>{fmtBaud(m.baudRate)}</Badge></td>
            <td style={{padding:"11px 14px",fontFamily:mono,fontSize:11,color:th.txD,whiteSpace:"nowrap"}}>{m.powerOn}</td>
            <td style={{padding:"11px 14px",fontFamily:mono,fontSize:11,color:th.txD,whiteSpace:"nowrap"}}>{m.powerOff}</td>
            <td style={{padding:"11px 14px",whiteSpace:"nowrap",color:th.amb,fontSize:12,fontFamily:mono}}>{m.bootTime} 秒</td>
            <td style={{padding:"11px 14px",whiteSpace:"nowrap",color:linked>0?th.accL:th.txM,fontSize:12,fontWeight:linked>0?700:400}}>{linked>0?`${linked} 班`:"—"}</td>
            <td style={{padding:"11px 14px",whiteSpace:"nowrap"}}><Btn small ghost onClick={()=>{setEd(m);setShow(true);}} t={th}><IC.edit s={13}/></Btn> <Btn small ghost style={{color:th.red}} onClick={()=>del(m.id)} t={th}><IC.trash s={13}/></Btn></td>
          </tr>;
        })}</tbody>
      </table>
    </Card>
    {show&&<ModelForm init={ed} onSave={save} onClose={()=>{setShow(false);setEd(null);}} th={th}/>}
  </div>;
}
function ModelForm({init,onSave,onClose,th}){
  const [name,setName]=useState(init?.name||"");const [baud,setBaud]=useState(init?.baudRate?String(init.baudRate):"9600");
  const [pOn,setPOn]=useState(init?.powerOn||"");const [pOff,setPOff]=useState(init?.powerOff||"");
  const [h1,setH1]=useState(init?.hdmi1||"");const [h2,setH2]=useState(init?.hdmi2||"");const [boot,setBoot]=useState(init?.bootTime?String(init.bootTime):"15");
  return <Modal title={init?"編輯型號":"新增型號"} onClose={onClose} width={520} t={th}>
    <Field label="型號名稱" t={th}><Inp value={name} onChange={setName} placeholder="SONY KD-65X80K" t={th}/></Field>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
      <Field label="鮑率" t={th}><Sel value={baud} onChange={setBaud} t={th}>{["2400","4800","9600","19200","38400","57600","115200"].map(x=><option key={x} value={x}>{x}</option>)}</Sel></Field>
      <Field label="開機秒數" t={th}><Inp value={boot} onChange={setBoot} type="number" min={1} t={th}/></Field>
      <Field label="開機碼" t={th}><Inp value={pOn} onChange={setPOn} t={th}/></Field>
      <Field label="關機碼" t={th}><Inp value={pOff} onChange={setPOff} t={th}/></Field>
      <Field label="HDMI 1" t={th}><Inp value={h1} onChange={setH1} placeholder="選填" t={th}/></Field>
      <Field label="HDMI 2" t={th}><Inp value={h2} onChange={setH2} placeholder="選填" t={th}/></Field>
    </div>
    <div style={{display:"flex",justifyContent:"flex-end",gap:8,marginTop:12}}><Btn onClick={onClose} t={th}>取消</Btn><Btn primary disabled={!name||!pOn||!pOff||!boot} onClick={()=>onSave({name,baudRate:+baud,powerOn:pOn,powerOff:pOff,hdmi1:h1,hdmi2:h2,bootTime:+boot})} t={th}>{init?"儲存":"新增"}</Btn></div>
  </Modal>;
}

/* ═══ SENDER ═══ */
function PSender({senders,setSenders,reload,th}){
  const [show,setShow]=useState(false);const [ed,setEd]=useState(null);
  const save=async(d)=>{try{if(ed?.id)await api.updateSender(ed.id,d);else await api.addSender(d);await reload("senders");await reload("logs");}catch(e){alert(e.message);}setShow(false);setEd(null);};
  const del=async(id)=>{
    const s=senders.find(x=>x.id===id);if(!s)return;
    const children=senders.filter(x=>x.pid===id);
    const extra=children.length>0?`\n\n⚠ 此處室下還有 ${children.length} 個成員，一併刪除：\n${children.map(c=>"　• "+c.name).join("\n")}`:"";
    if(!confirm(`確定刪除此發話單位？\n\n${s.name}${s.pid?"":"（處室）"}${extra}`))return;
    try{await api.deleteSender(id);await reload("senders");await reload("logs");}catch(e){alert(e.message);}
  };
  const deptsList=senders.filter(s=>s.pid===null);
  return <div>
    <Title sub={deptsList.length+" 個處室 · "+senders.length+" 個單位"} action={<div style={{display:"flex",gap:6}}><Btn primary small onClick={()=>{setEd({_type:"dept"});setShow(true);}} t={th}>＋ 新增處室</Btn><Btn small onClick={()=>{setEd({_type:"member"});setShow(true);}} t={th}>＋ 新增成員</Btn></div>} t={th}>發話單位管理</Title>
    {(()=>{
      const allMembers=senders.filter(s=>s.pid!==null);
      const globalMaxLen=allMembers.reduce((mx,m)=>Math.max(mx,m.name.length),0);
      const colW=Math.max(120,globalMaxLen*15+70);
      return deptsList.map(dept=>{const members=senders.filter(s=>s.pid===dept.id);
      return <Card key={dept.id} style={{marginBottom:12,padding:0,overflow:"hidden"}} t={th}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"14px 18px",background:dept.color+"0c",borderBottom:members.length?`1px solid ${th.bd}`:"none"}}>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <div style={{width:28,height:28,borderRadius:8,background:dept.color,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,color:"#fff",fontWeight:700}}>{dept.name[0]}</div>
            <div><div style={{fontWeight:700,fontSize:15,color:th.tx}}>{dept.name}</div><div style={{fontSize:11,color:th.txM,marginTop:1}}>{members.length} 位成員</div></div>
          </div>
          <div style={{display:"flex",gap:4}}><Btn small ghost onClick={()=>{setEd({...dept,_type:"dept"});setShow(true);}} t={th}><IC.edit s={13}/></Btn><Btn small ghost style={{color:th.red}} onClick={()=>del(dept.id)} t={th}><IC.trash s={13}/></Btn></div>
        </div>
        {members.length>0&&<div style={{padding:"10px 18px 14px"}}><div style={{display:"grid",gridTemplateColumns:`repeat(auto-fill, ${colW}px)`,gap:8}}>
          {members.map(m=><div key={m.id} style={{display:"flex",alignItems:"center",gap:8,padding:"6px 12px",borderRadius:8,background:th.sf2,border:`1px solid ${th.bd}`,whiteSpace:"nowrap"}}>
            <div style={{width:10,height:10,borderRadius:4,background:m.color,flexShrink:0}}/><span style={{fontSize:13,fontWeight:500,color:th.tx,flex:1}}>{m.name}</span>
            <button onClick={()=>{setEd({...m,_type:"member"});setShow(true);}} style={{background:"none",border:"none",color:th.txD,cursor:"pointer",fontSize:12,padding:2}}><IC.edit s={13}/></button>
            <button onClick={()=>del(m.id)} style={{background:"none",border:"none",color:th.red,cursor:"pointer",fontSize:12,padding:2}}>✕</button>
          </div>)}
        </div></div>}
      </Card>;
    });})()}
    {show&&<SenderForm init={ed} senders={senders} onSave={save} onClose={()=>{setShow(false);setEd(null);}} th={th}/>}
  </div>;
}
function SenderForm({init,senders,onSave,onClose,th}){
  const isDept=init?._type==="dept";const isNew=!init?.id;
  const [name,setName]=useState(init?.name||"");
  const [color,setColor]=useState(init?.color||"#3b82f6");
  const [pid,setPid]=useState(init?.pid?String(init.pid):"");
  const [scale,setScale]=useState(String(init?.scale??1.2));
  const deptsList=senders.filter(s=>s.pid===null);
  // For members, the effective scale is inherited from the parent dept
  const selectedDept=deptsList.find(d=>d.id===+pid);
  const effectiveScale=isDept?(+scale||1):(selectedDept?.scale??1);
  return <Modal title={isNew?(isDept?"新增處室":"新增成員"):(isDept?"編輯處室":"編輯成員")} onClose={onClose} width={460} t={th}>
    <Field label="名稱" t={th}><Inp value={name} onChange={setName} t={th}/></Field>
    {!isDept&&<Field label="所屬處室" t={th}><Sel value={pid} onChange={v=>{setPid(v);if(isNew&&v){const d=deptsList.find(x=>x.id===+v);if(d)setColor(d.color);}}} t={th}><option value="">選擇處室</option>{deptsList.map(d=><option key={d.id} value={d.id}>{d.name}</option>)}</Sel></Field>}
    <Field label="代表色" t={th}><div style={{display:"flex",alignItems:"center",gap:12}}><input type="color" value={color} onChange={e=>setColor(e.target.value)} style={{width:44,height:36,border:"none",cursor:"pointer"}}/><Inp value={color} onChange={setColor} style={{width:120,fontFamily:mono}} t={th}/><div style={{width:36,height:36,borderRadius:8,background:color}}/></div></Field>
    {isDept&&<Field label="字體放大比例（處室與成員共用）" t={th}><div style={{display:"flex",alignItems:"center",gap:12}}><input type="range" min={1} max={3} step={0.1} value={scale} onChange={e=>setScale(e.target.value)} style={{flex:1,accentColor:th.acc}}/><span style={{fontSize:14,fontWeight:700,color:th.tx,minWidth:48,textAlign:"center"}}>{(+scale).toFixed(1)}×</span></div></Field>}
    {!isDept&&pid&&<div style={{fontSize:11,color:th.txM,marginBottom:10,marginTop:-4}}><span style={{display:"inline-flex",alignItems:"center",gap:4}}><IC.paperclip s={12}/> 放大比例：</span>繼承自處室（{(effectiveScale).toFixed(1)}×）</div>}
    {/* Preview — bottom aligned, text scales up from baseline */}
    <div style={{padding:"14px 16px",borderRadius:8,background:th.bg2,border:`1px solid ${th.bd}`,marginTop:8,height:90,display:"flex",alignItems:"flex-end"}}>
      <div style={{width:"100%"}}>
        <div style={{fontSize:10,color:th.txM,marginBottom:6,letterSpacing:.3,textTransform:"uppercase",fontWeight:600}}>預覽</div>
        <div style={{fontSize:18,color:th.tx,lineHeight:1,display:"flex",alignItems:"flex-end",gap:2,flexWrap:"wrap"}}>
          <span>請到</span>
          <span style={{color,fontSize:18*(effectiveScale||1),fontWeight:700,lineHeight:1}}>{name||(isDept?"處室":"單位")}</span>
          <span>集合</span>
        </div>
      </div>
    </div>
    <div style={{display:"flex",justifyContent:"flex-end",gap:8,marginTop:12}}><Btn onClick={onClose} t={th}>取消</Btn><Btn primary disabled={!name||(!isDept&&!pid)} onClick={()=>onSave(isDept?{name,color,pid:null,scale:+scale}:{name,color,pid:+pid})} t={th}>{isNew?"新增":"儲存"}</Btn></div>
  </Modal>;
}

function PClassOfficers({classOfficers,reload,th}){
  const [show,setShow]=useState(false);const [ed,setEd]=useState(null);
  const save=async(d)=>{try{if(ed?.id)await api.updateClassOfficer(ed.id,d);else await api.addClassOfficer(d);await reload("classOfficers");await reload("logs");}catch(e){alert(e.message);}setShow(false);setEd(null);};
  const del=async(id)=>{if(!confirm("確定刪除此幹部？"))return;try{await api.deleteClassOfficer(id);await reload("classOfficers");await reload("logs");}catch(e){alert(e.message);}};
  return <div>
    <Title sub={`共 ${classOfficers.length} 位幹部 · 訊息中出現對應名稱時自動套用樣式`} action={<Btn primary small onClick={()=>{setEd({});setShow(true);}} t={th}>＋ 新增幹部</Btn>} t={th}>班級幹部管理</Title>
    <Card t={th}>
      {classOfficers.length===0?<div style={{padding:"32px 0",textAlign:"center",color:th.txM,fontSize:13}}>尚無幹部資料，點右上角新增</div>:
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))",gap:10}}>
        {classOfficers.map(s=><div key={s.id} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 14px",borderRadius:10,background:th.sf2,border:`1px solid ${th.bd}`}}>
          <div style={{width:36,height:36,borderRadius:8,background:s.color,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,color:"#fff",fontSize:14,flexShrink:0}}>{s.name[0]}</div>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontSize:14,fontWeight:600,color:th.tx,lineHeight:1.3}}>{s.name}</div>
            <div style={{fontSize:11,color:th.txM,fontFamily:mono,marginTop:2}}>{s.color} · {s.scale}× 放大</div>
          </div>
          <button onClick={()=>{setEd(s);setShow(true);}} style={{background:"none",border:`1px solid ${th.bd}`,color:th.txD,cursor:"pointer",fontSize:12,padding:"4px 8px",borderRadius:6}}><IC.edit s={13}/></button>
          <button onClick={()=>del(s.id)} style={{background:"none",border:`1px solid ${th.bd}`,color:th.txM,cursor:"pointer",fontSize:12,padding:"4px 8px",borderRadius:6}}><IC.trash s={13}/></button>
        </div>)}
      </div>}
      <div style={{marginTop:14,padding:"10px 14px",borderRadius:8,background:th.bg2,fontSize:11,color:th.txM,lineHeight:1.7}}>
        <span style={{display:"inline-flex",alignItems:"baseline",gap:5}}><IC.bulb s={13}/> <strong style={{color:th.txD}}>使用方式：</strong>當廣播訊息文字中出現學生幹部「名稱」時，播放端會自動將該名稱用設定的顏色和放大比例顯示，讓被點名的幹部更容易注意到廣播。例如設定「班長」=紅色 1.4×，訊息「請各班班長到學務處集合」中的「班長」會自動變紅色放大文字。</span>
      </div>
    </Card>
    {show&&<ClassOfficerForm init={ed} onSave={save} onClose={()=>{setShow(false);setEd(null);}} th={th}/>}
  </div>;
}
function ClassOfficerForm({init,onSave,onClose,th}){
  const isNew=!init?.id;
  const [name,setName]=useState(init?.name||"");
  const [color,setColor]=useState(init?.color||"#EF4444");
  const [scale,setScale]=useState(String(init?.scale??1.2));
  return <Modal title={isNew?"新增班級幹部":"編輯班級幹部"} onClose={onClose} width={420} t={th}>
    <Field label="名稱" t={th}><Inp value={name} onChange={setName} placeholder="例如：班長、副班長、學藝股長" t={th}/></Field>
    <Field label="代表色" t={th}><div style={{display:"flex",alignItems:"center",gap:12}}><input type="color" value={color} onChange={e=>setColor(e.target.value)} style={{width:44,height:36,border:"none",cursor:"pointer"}}/><Inp value={color} onChange={setColor} style={{width:120,fontFamily:mono}} t={th}/><div style={{width:36,height:36,borderRadius:8,background:color}}/></div></Field>
    <Field label="字體放大比例" t={th}><div style={{display:"flex",alignItems:"center",gap:12}}><input type="range" min={1} max={3} step={0.1} value={scale} onChange={e=>setScale(e.target.value)} style={{flex:1,accentColor:th.acc}}/><span style={{fontSize:14,fontWeight:700,color:th.tx,minWidth:48,textAlign:"center"}}>{(+scale).toFixed(1)}×</span></div></Field>
    {/* Preview — bottom aligned, text scales up from baseline */}
    <div style={{padding:"14px 16px",borderRadius:8,background:th.bg2,border:`1px solid ${th.bd}`,marginTop:8,height:90,display:"flex",alignItems:"flex-end"}}>
      <div style={{width:"100%"}}>
        <div style={{fontSize:10,color:th.txM,marginBottom:6,letterSpacing:.3,textTransform:"uppercase",fontWeight:600}}>預覽</div>
        <div style={{fontSize:18,color:th.tx,lineHeight:1,display:"flex",alignItems:"flex-end",gap:2,flexWrap:"wrap"}}>
          <span>請各班</span>
          <span style={{color,fontSize:18*(+scale||1),fontWeight:700,lineHeight:1}}>{name||"幹部"}</span>
          <span>到學務處集合</span>
        </div>
      </div>
    </div>
    <div style={{display:"flex",justifyContent:"flex-end",gap:8,marginTop:12}}><Btn onClick={onClose} t={th}>取消</Btn><Btn primary disabled={!name} onClick={()=>onSave({name,color,scale:+scale})} t={th}>{isNew?"新增":"儲存"}</Btn></div>
  </Modal>;
}

/* ═══ LOGS ═══ */
/* ═══ STATS ═══ */
function PStats({scheds,senders,th}){
  const [range,setRange]=useState(30);
  const now=new Date();
  const cutoff=new Date(now);cutoff.setDate(cutoff.getDate()-range);
  const cutoffStr=fmtD(cutoff);
  const inRange=scheds.filter(s=>s.date>=cutoffStr);

  // Top 10 senders by count
  const senderMap={};
  inRange.forEach(s=>{const k=s.sender||"未指定";senderMap[k]=(senderMap[k]||0)+1;});
  const topSenders=Object.entries(senderMap).sort((a,b)=>b[1]-a[1]).slice(0,10);

  // Top 10 departments
  const deptMap={};
  inRange.forEach(s=>{const k=s.dept||"未指定";deptMap[k]=(deptMap[k]||0)+1;});
  const topDepts=Object.entries(deptMap).sort((a,b)=>b[1]-a[1]).slice(0,10);

  // Daily count for bar chart (last N days)
  const dailyMap={};
  for(let d=new Date(cutoff);d<=now;d.setDate(d.getDate()+1)){dailyMap[fmtD(d)]=0;}
  inRange.forEach(s=>{if(dailyMap[s.date]!==undefined)dailyMap[s.date]++;});
  const dailyData=Object.entries(dailyMap);

  // Total duration
  const totalDur=inRange.reduce((a,s)=>a+(s.dur||0),0);
  const totalMin=Math.round(totalDur/60);

  // Colors for charts
  const colors=['#3b82f6','#8B8FA3','#A1A1AA','#6B7280','#2563eb','#71717A','#52525B','#9CA3AF','#78716C','#64748B'];

  const maxSender=topSenders.length?topSenders[0][1]:1;
  const maxDept=topDepts.length?topDepts[0][1]:1;
  const maxDaily=dailyData.length?Math.max(...dailyData.map(d=>d[1]),1):1;

  return <div>
    <Title sub={`${cutoffStr} ~ ${fmtD(now)} · ${inRange.length} 筆排程`} t={th}>廣播統計</Title>

    {/* Range selector */}
    <div style={{display:"flex",gap:6,marginBottom:16}}>
      {[7,14,30,60,90].map(d=><Chip key={d} on={range===d} onClick={()=>setRange(d)} style={{padding:"5px 14px",fontSize:12}} t={th}>{d} 天</Chip>)}
    </div>

    {/* Summary cards */}
    <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:20}}>
      <Card t={th} style={{padding:16,textAlign:"center"}}>
        <div style={{fontSize:11,color:th.txM}}>排程總數</div>
        <div style={{fontSize:28,fontWeight:700,color:th.tx}}>{inRange.length}</div>
      </Card>
      <Card t={th} style={{padding:16,textAlign:"center"}}>
        <div style={{fontSize:11,color:th.txM}}>發話單位數</div>
        <div style={{fontSize:28,fontWeight:700,color:th.acc}}>{Object.keys(senderMap).length}</div>
      </Card>
      <Card t={th} style={{padding:16,textAlign:"center"}}>
        <div style={{fontSize:11,color:th.txM}}>總播放時長</div>
        <div style={{fontSize:28,fontWeight:700,color:th.grn}}>{totalMin<60?totalMin+"分":Math.floor(totalMin/60)+"時"+totalMin%60+"分"}</div>
      </Card>
      <Card t={th} style={{padding:16,textAlign:"center"}}>
        <div style={{fontSize:11,color:th.txM}}>日均排程</div>
        <div style={{fontSize:28,fontWeight:700,color:th.amb}}>{(inRange.length/range).toFixed(1)}</div>
      </Card>
    </div>

    {/* Charts row */}
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:20}}>
      {/* Top senders */}
      <Card t={th}>
        <h3 style={{margin:"0 0 14px",fontSize:14,fontWeight:700,color:th.txD,display:"inline-flex",alignItems:"center",gap:5}}><IC.trophy s={14}/> 發話單位排行 Top 10</h3>
        {topSenders.length===0?<div style={{padding:20,textAlign:"center",color:th.txM}}>無資料</div>
        :topSenders.map(([name,count],i)=>{
          const pct=Math.round(count/maxSender*100);
          const sc=senders.find(s=>s.name===name);
          const clr=sc?.color||colors[i%colors.length];
          return <div key={name} style={{marginBottom:8}}>
            <div style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:3}}>
              <span style={{color:th.tx,fontWeight:500}}><span style={{display:"inline-block",width:8,height:8,borderRadius:3,background:clr,marginRight:6}}/>{name}</span>
              <span style={{color:th.txM,fontWeight:600}}>{count} 筆</span>
            </div>
            <div style={{height:6,borderRadius:3,background:th.bg2,overflow:"hidden"}}>
              <div style={{height:"100%",width:pct+"%",borderRadius:3,background:clr,transition:"width .3s"}}/>
            </div>
          </div>;
        })}
      </Card>

      {/* Top departments */}
      <Card t={th}>
        <h3 style={{margin:"0 0 14px",fontSize:14,fontWeight:700,color:th.txD,display:"inline-flex",alignItems:"center",gap:5}}><IC.school s={14}/> 處室排行 Top 10</h3>
        {topDepts.length===0?<div style={{padding:20,textAlign:"center",color:th.txM}}>無資料</div>
        :topDepts.map(([name,count],i)=>{
          const pct=Math.round(count/maxDept*100);
          const dept=senders.find(s=>s.name===name&&s.pid===null);
          const clr=dept?.color||colors[i%colors.length];
          return <div key={name} style={{marginBottom:8}}>
            <div style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:3}}>
              <span style={{color:th.tx,fontWeight:500}}><span style={{display:"inline-block",width:8,height:8,borderRadius:3,background:clr,marginRight:6}}/>{name}</span>
              <span style={{color:th.txM,fontWeight:600}}>{count} 筆</span>
            </div>
            <div style={{height:6,borderRadius:3,background:th.bg2,overflow:"hidden"}}>
              <div style={{height:"100%",width:pct+"%",borderRadius:3,background:clr,transition:"width .3s"}}/>
            </div>
          </div>;
        })}
      </Card>
    </div>

    {/* Daily chart */}
    <Card t={th}>
      <h3 style={{margin:"0 0 14px",fontSize:14,fontWeight:700,color:th.txD}}><span style={{display:"inline-flex",alignItems:"center",gap:5}}><IC.trend s={14}/> 每日排程數量</span></h3>
      <div style={{position:"relative"}}>
        <div style={{display:"flex",alignItems:"flex-end",gap:1,height:140,padding:"0 4px"}}>
          {dailyData.map(([date,count],i)=>{
            const h=count>0?Math.max(8,Math.round(count/maxDaily*120)):0;
            const isToday=date===fmtD(now);
            const d=new Date(date);const day=d.getDate();
            return <div key={date} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"flex-end",height:"100%",position:"relative",cursor:"default"}} className="chart-bar">
              {count>0&&<div style={{fontSize:9,color:th.txD,fontWeight:600,marginBottom:2,opacity:0,transition:"opacity .15s"}} className="bar-label">{count}</div>}
              <div style={{width:"100%",maxWidth:24,height:h,borderRadius:"3px 3px 0 0",background:isToday?th.acc:count>0?th.acc+"66":th.bg2,transition:"height .3s"}}/>
            </div>;
          })}
        </div>
        {/* X axis labels */}
        <div style={{display:"flex",gap:1,marginTop:4,padding:"0 4px"}}>
          {dailyData.map(([date],i)=>{
            const d=new Date(date);const day=d.getDate();
            const showLabel=day===1||day===15||(range<=14)||(range<=30&&day%5===0)||(i===0||i===dailyData.length-1);
            return <div key={date} style={{flex:1,textAlign:"center",fontSize:9,color:th.txM,overflow:"hidden",whiteSpace:"nowrap"}}>
              {showLabel?`${d.getMonth()+1}/${day}`:""}
            </div>;
          })}
        </div>
      </div>
      <style>{`.chart-bar:hover .bar-label { opacity: 1 !important; }`}</style>
    </Card>
  </div>;
}

function PLogs({logs,reload,th}){
  const [fa,setFa]=useState("");const [fs,setFs]=useState("");
  const [timeFrom,setTimeFrom]=useState("");const [timeTo,setTimeTo]=useState("");
  const filtered=logs.filter(l=>{
    if(fa&&l.action!==fa) return false;
    if(fs&&!((l.sender&&l.sender.includes(fs))||(l.ip&&l.ip.includes(fs))||(l.summary&&l.summary.includes(fs)))) return false;
    if(timeFrom||timeTo){
      const t=l.ts?l.ts.split("T")[1]?.substring(0,5)||"":"";
      if(timeFrom&&t<timeFrom) return false;
      if(timeTo&&t>timeTo) return false;
    }
    return true;
  });
  const ac={create:th.acc,chain:th.acc,delete:th.red,denied:th.txM,update:th.txD,test_broadcast:th.acc,force_stop:th.red,force_resume:th.acc};
  const al={create:"新增",chain:"串接",delete:"刪除",denied:"拒絕",update:"修改",test_broadcast:"插播",force_stop:"強制清除",force_resume:"恢復播放"};
  return <div>
    <Title sub={"共 "+logs.length+" 筆紀錄"} t={th}>操作日誌</Title>
    <Card style={{marginBottom:14,padding:14}} t={th}>
      <div style={{display:"flex",gap:12,alignItems:"center",flexWrap:"wrap"}}>
        <span style={{fontSize:12,color:th.txM}}><span style={{display:"inline-flex",alignItems:"center",gap:4}}><IC.search s={12}/> 篩選</span></span>
        <Sel value={fa} onChange={setFa} style={{width:130}} t={th}><option value="">全部動作</option>{Object.entries(al).map(([k,l])=><option key={k} value={k}>{l}</option>)}</Sel>
        <Inp value={fs} onChange={setFs} placeholder="搜尋登記人 / IP / 內容…" style={{width:220}} t={th}/>
        <span style={{fontSize:11,color:th.txM}}>⏰</span>
        <input type="time" value={timeFrom} onChange={e=>setTimeFrom(e.target.value)} style={{padding:"4px 8px",borderRadius:6,border:`1px solid ${th.bd}`,background:th.sf,color:th.tx,fontSize:12,fontFamily:"inherit"}}/>
        <span style={{fontSize:11,color:th.txM}}>~</span>
        <input type="time" value={timeTo} onChange={e=>setTimeTo(e.target.value)} style={{padding:"4px 8px",borderRadius:6,border:`1px solid ${th.bd}`,background:th.sf,color:th.tx,fontSize:12,fontFamily:"inherit"}}/>
        {(timeFrom||timeTo)&&<button onClick={()=>{setTimeFrom("");setTimeTo("");}} style={{background:"none",border:"none",cursor:"pointer",color:th.txM,fontSize:11}}>✕ 清除時間</button>}
        <Badge t={th}>{filtered.length} 筆</Badge>
      </div>
    </Card>
    <Card style={{padding:0,overflowX:"auto"}} t={th}>
      <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
        <thead><tr style={{background:th.bg2}}>{["時間","登記人","動作","操作摘要","IP"].map(h=><th key={h} style={{padding:"11px 14px",textAlign:"left",fontWeight:600,color:th.txM,fontSize:11,borderBottom:`1px solid ${th.bd}`}}>{h}</th>)}</tr></thead>
        <tbody>{filtered.length===0?<tr><td colSpan={5} style={{padding:48,textAlign:"center",color:th.txM}}>尚無日誌</td></tr>
          :filtered.map(l=><tr key={l.id} style={{borderBottom:`1px solid ${th.bd}`}}>
            <td style={{padding:"10px 14px",whiteSpace:"nowrap",fontSize:12,fontFamily:mono,color:th.txD}}>{fmtDT(l.ts)}</td>
            <td style={{padding:"10px 14px",fontSize:12,color:th.tx,fontWeight:l.sender?600:400}}>{l.sender||<span style={{color:th.txM}}>—</span>}</td>
            <td style={{padding:"10px 14px"}}><Badge color={ac[l.action]||th.txD} t={th}>{al[l.action]||l.action}</Badge></td>
            <td style={{padding:"10px 14px",fontSize:12,color:th.txD,maxWidth:400,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{l.summary}</td>
            <td style={{padding:"10px 14px",fontFamily:mono,fontSize:11,color:th.txM}}>{l.ip}</td>
          </tr>)}</tbody>
      </table>
    </Card>
  </div>;
}

/* ═══ MEDIA SCAN ═══ */
function MediaScan({th}){
  const [info,setInfo]=useState(null);const [err,setErr]=useState("");
  const scan=async()=>{
    setErr("");setInfo(null);
    try{
      const res=await api.getMedia("");
      if(res.error){setErr(res.error);return;}
      const files=(res.files||[]).filter(f=>f.type==="file");
      const folders=(res.files||[]).filter(f=>f.type==="folder");
      const imgs=files.filter(f=>f.mt==="image").length;
      const vids=files.filter(f=>f.mt==="video").length;
      const auds=files.filter(f=>f.mt==="audio").length;
      setInfo({dir:res.dir,total:files.length,folders:folders.length,imgs,vids,auds});
    }catch(e){setErr("無法連線 API："+e.message);}
  };
  useEffect(()=>{scan();},[]);
  return <div>
    <Btn small onClick={scan} t={th} style={{marginBottom:8,fontSize:11}}><span style={{display:"inline-flex",alignItems:"center",gap:4}}><IC.search s={13}/> 掃描媒體庫</span></Btn>
    {err&&<div style={{fontSize:11,color:th.red,marginBottom:4}}><span style={{display:"inline-flex",alignItems:"center",gap:4}}><IC.x s={13}/> {err}</span></div>}
    {info&&<div style={{padding:"8px 12px",borderRadius:8,background:th.bg2,fontSize:12,lineHeight:1.8}}>
      <div style={{color:th.txD,display:"inline-flex",alignItems:"center",gap:4}}><IC.folder s={12}/> {info.dir||"（預設 uploads/）"}</div>
      <div style={{display:"flex",gap:10,marginTop:4,flexWrap:"wrap"}}>
        <span style={{color:th.tx,fontWeight:600}}>共 {info.total} 個檔案</span>
        {info.folders>0&&<span style={{color:th.txM,display:"inline-flex",alignItems:"center",gap:4}}><IC.folder s={12}/> {info.folders} 資料夾</span>}
        {info.imgs>0&&<Badge color={th.amb} t={th}><span style={{display:"inline-flex",alignItems:"center",gap:3}}><IC.image s={11}/> {info.imgs} 圖片</span></Badge>}
        {info.vids>0&&<Badge color={th.pink} t={th}><span style={{display:"inline-flex",alignItems:"center",gap:3}}><IC.video s={11}/> {info.vids} 影片</span></Badge>}
        {info.auds>0&&<Badge color={th.cyan} t={th}><span style={{display:"inline-flex",alignItems:"center",gap:3}}><IC.music s={11}/> {info.auds} 音訊</span></Badge>}
        {info.total===0&&<span style={{color:th.txM}}>資料夾為空或路徑不正確</span>}
      </div>
    </div>}
  </div>;
}

/* ═══ CONFIG ═══ */
/* ═══ STANDBY BROWSE (image only file browser) ═══ */
function StandbyBrowse({th,onSelect}){
  const [show,setShow]=useState(false);
  return <>
    <Btn small onClick={()=>setShow(true)} t={th} style={{flexShrink:0}}><span style={{display:"inline-flex",alignItems:"center",gap:4}}><IC.folder s={13}/> 瀏覽</span></Btn>
    {show&&<FileBrowser th={th} onSelect={f=>{if(f.mt==="image"){onSelect(f);setShow(false);}else{alert("請選擇圖片檔案");}}} onClose={()=>setShow(false)}/>}
  </>;
}

/* ═══ EMERGENCY BROADCAST ═══ */
function EmergencyBroadcast({cfg,senders,userPref,liveTextBgBlur,th}){
  const [txt,setTxt]=useState("");
  const [sid,setSid]=useState("");
  const [sending,setSending]=useState(false);
  const [active,setActive]=useState(false);

  // Mount 時檢查 server 上是否有 active 的手動插播
  useEffect(()=>{
    fetch(`http://${window.location.hostname}:3001/api/test-broadcast`).then(r=>r.json()).then(d=>{
      if(d.txt){setActive(true);setTxt(d.txt);}
    }).catch(()=>{});
  },[]);

  const selSender=senders.find(x=>x.id===+sid);
  const senderName=selSender?.name||"緊急插播";
  const senderColor=selSender?.color||"#EF4444";
  const depts=senders.filter(s=>s.pid===null);
  const hasBgImg=!!cfg.textBgImg;

  const send=async()=>{
    if(!txt.replace(/<[^>]*>/g,'').trim())return alert("請輸入廣播文字");
    setSending(true);
    try{
      await api.testBroadcast({txt,bgColor:cfg.defaultBgColor,txtColor:cfg.defaultTxtColor,sender:senderName,senderColor,avatar:userPref?.avatar||undefined});
      setActive(true);
    }catch(e){alert("發送失敗: "+e.message);}
    setSending(false);
  };
  const stop=async()=>{
    try{await api.stopTestBroadcast();setActive(false);}catch(e){alert("停止失敗: "+e.message);}
  };

  return <div>
    <div style={{display:"flex",gap:10,alignItems:"center",marginBottom:10}}>
      <span style={{fontSize:12,color:th.txM,fontWeight:600,flexShrink:0}}>發話單位</span>
      <select value={sid} onChange={e=>setSid(e.target.value)} style={{padding:"6px 10px",borderRadius:6,border:`1px solid ${th.bd}`,background:th.bg2,color:th.tx,fontSize:13,fontFamily:"inherit",flex:1,maxWidth:240}}>
        <option value="">緊急插播</option>
        {depts.map(d=>{
          const members=senders.filter(s=>s.pid===d.id);
          return [
            <option key={d.id} value={d.id} style={{fontWeight:700}}>{d.name}</option>,
            ...members.map(m=><option key={m.id} value={m.id}>&nbsp;&nbsp;{m.name}</option>)
          ];
        }).flat()}
      </select>
      {selSender&&<span style={{display:"inline-block",width:12,height:12,borderRadius:3,background:senderColor,flexShrink:0}}/>}
      {selSender&&<span style={{fontSize:12,color:senderColor,fontWeight:600}}>{senderName}</span>}
    </div>
    {/* WYSIWYG 16:9 */}
    {(()=>{
      const ebBanner=<div style={{position:"relative",display:"flex",alignItems:"center",gap:29,padding:"22px 77px",background:"rgba(0,0,0,.35)",backdropFilter:"blur(8px)",WebkitBackdropFilter:"blur(8px)",borderBottom:"1px solid rgba(255,255,255,.1)"}}>
        {cfg.showAvatar!==false&&userPref?.avatar&&<img src={userPref.avatar} style={{height:64,width:64,borderRadius:12,objectFit:"cover",flexShrink:0}} alt=""/>}
        <span style={{padding:"5px 29px",borderRadius:10,background:senderColor+"33",color:senderColor,fontWeight:700,fontSize:38,borderLeft:`2px solid ${senderColor}`,textShadow:"-1px -1px 0 rgba(0,0,0,.6),1px -1px 0 rgba(0,0,0,.6),-1px 1px 0 rgba(0,0,0,.6),1px 1px 0 rgba(0,0,0,.6),0 1px 4px rgba(0,0,0,.4)",fontFamily:"inherit"}}>{senderName}</span>
        <BannerTimeBadge timeText={fmtBannerTime(null,cfg.bannerTimeFormat)} color={cfg.bannerTimeColor} loop={true} loopDur={18} extraStyle={{position:"absolute",top:22,right:77}}/>
      </div>;
      const ebBg={backgroundColor:hasBgImg?"#000":(cfg.defaultBgColor||"#1a1e2a"),backgroundImage:hasBgImg?`url(http://${window.location.hostname}:3001/api/text-bg-image)`:undefined,backgroundSize:"cover",backgroundPosition:"center",backgroundRepeat:"no-repeat"};
      return <RichEditor classOfficers={highlightList} value={txt} onChange={setTxt} theme={th} minHeight={0} bgColor="transparent" textColor={cfg.defaultTxtColor||"#fff"} defaultFontSize={cfg.defaultFontSize} defaultLineHeight={cfg.defaultLineHeight} wysiwygMode={true} wysiwygBanner={ebBanner} wysiwygBg={ebBg} wysiwygBgBlur={liveTextBgBlur!==undefined?liveTextBgBlur:(cfg.textBgBlur||0)} renderWysiwyg={(toolbar,content)=><div style={{marginBottom:10}}>{toolbar}{content}</div>}/>;
    })()}
    <div style={{display:"flex",gap:8,alignItems:"center"}}>
      {!active?<Btn primary onClick={send} disabled={sending} t={th} style={{padding:"8px 24px"}}>{sending?"發送中...":"發送手動插播"}</Btn>
      :<><Btn danger onClick={stop} t={th} style={{padding:"8px 24px"}}><span style={{display:"inline-flex",alignItems:"center",gap:5}}><IC.stop s={12}/> 停止廣播</span></Btn><Btn primary onClick={send} disabled={sending} t={th} style={{padding:"8px 24px"}}>{sending?"更新中...":"更新內容"}</Btn></>}
      {active&&<span style={{fontSize:12,color:th.grn,fontWeight:600}}><span style={{display:"inline-flex",alignItems:"center",gap:4}}><IC.dot_red s={9} style={{color:"#ef4444"}}/> LIVE — 播放端正在顯示</span></span>}
    </div>
  </div>;
}

/* ═══ BROADCAST PAGE ═══ */
function PBroadcast({cfg,senders,userPref,myIp,th,classOfficers}){
  const [txt,setTxt]=useState("");
  const highlightList=useMemo(()=>{
    const list=[...(classOfficers||[])];
    const deptMap=new Map();
    (senders||[]).forEach(s=>{if(s.pid===null)deptMap.set(s.id,s);});
    (senders||[]).forEach(s=>{
      const scale=s.pid===null?(s.scale??1):(deptMap.get(s.pid)?.scale??1);
      if(scale>1.01)list.push({name:s.name,color:s.color,scale});
    });
    return list;
  },[classOfficers,senders]);
  const [sid,setSid]=useState(userPref?.senderId?String(userPref.senderId):"");
  const [customS,setCustomS]=useState(userPref?.customName||"");
  const [useCustom,setUseCustom]=useState(!!userPref?.customName&&!userPref?.senderId);
  const [sending,setSending]=useState(false);
  const [active,setActive]=useState(false);
  const [otherActive,setOtherActive]=useState(null);
  const [nowPlaying,setNowPlaying]=useState(null); // current schedule playing

  // Poll broadcast + schedule status every 2 seconds
  useEffect(()=>{
    const check=()=>{
      fetch(`http://${window.location.hostname}:3001/api/test-broadcast`).then(r=>r.json()).then(d=>{
        if(d.txt){
          if(d.ip===myIp){setActive(true);setOtherActive(null);if(!txt)setTxt(d.txt);}
          else{setActive(false);setOtherActive({sender:d.sender,ip:d.ip,txt:d.txt,senderColor:d.senderColor});}
        }else{setActive(false);setOtherActive(null);}
      }).catch(()=>{});
      // Check current schedule
      fetch(`http://${window.location.hostname}:3001/api/schedules`).then(r=>r.json()).then(all=>{
        const now=new Date();const today=`${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
        const nowSec=now.getHours()*3600+now.getMinutes()*60+now.getSeconds();
        const playing=all.find(s=>{
          if(s.date!==today)return false;
          const st=s.st.split(':').map(Number),et=s.et.split(':').map(Number);
          const stSec=st[0]*3600+(st[1]||0)*60+(st[2]||0),etSec=et[0]*3600+(et[1]||0)*60+(et[2]||0);
          return nowSec>=stSec&&nowSec<etSec;
        });
        setNowPlaying(playing||null);
      }).catch(()=>{});
    };
    check();
    const t=setInterval(check,2000);
    return ()=>clearInterval(t);
  },[myIp]);

  const selSender=senders.find(x=>x.id===+sid);
  const senderName=useCustom?customS:(selSender?.name||"緊急插播");
  const senderColor=useCustom?(userPref?.customColor||"#EF4444"):(selSender?.color||"#EF4444");
  const depts=senders.filter(s=>s.pid===null);
  const hasBgImg=!!cfg.textBgImg;

  const send=async()=>{
    if(!txt.replace(/<[^>]*>/g,'').trim())return alert("請輸入廣播文字");
    setSending(true);
    try{
      await api.testBroadcast({txt,bgColor:cfg.defaultBgColor,txtColor:cfg.defaultTxtColor,sender:senderName,senderColor,avatar:userPref?.avatar||undefined});
      setActive(true);setOtherActive(null);
    }catch(e){alert("發送失敗: "+e.message);}
    setSending(false);
  };
  const stop=async()=>{
    try{await api.stopTestBroadcast();setActive(false);}catch(e){alert("停止失敗: "+e.message);}
  };

  return <div>
    <Title sub="即時發送文字訊息到播放端" t={th}>手動插播</Title>

    {/* 播放狀態面板 */}
    <Card style={{marginBottom:16,padding:"12px 16px"}} t={th}>
      <div style={{fontSize:12,fontWeight:700,color:th.txM,marginBottom:8}}><span style={{display:"inline-flex",alignItems:"center",gap:5}}><IC.radio s={13}/> 目前播放狀態</span></div>
      <div style={{display:"flex",gap:16,flexWrap:"wrap"}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <span style={{width:8,height:8,borderRadius:4,background:nowPlaying?th.grn:th.txM,boxShadow:nowPlaying?`0 0 6px ${th.grn}`:undefined}}/>
          <span style={{fontSize:12,color:nowPlaying?th.tx:th.txM}}>
            {nowPlaying?<><span style={{display:"inline-flex",alignItems:"center",gap:4}}><IC.calendar s={12}/> 排程播放中</span>：{nowPlaying.st}→{nowPlaying.et} · <span style={{fontWeight:600}}>{nowPlaying.sender||nowPlaying.dept}</span>{nowPlaying.txt&&<span style={{color:th.txM}}> · 「{nowPlaying.txt.replace(/<[^>]*>/g,'').substring(0,40)}」</span>}</>:"— 排程：無"}
          </span>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <span style={{width:8,height:8,borderRadius:4,background:active||otherActive?"#dc2626":th.txM,boxShadow:active||otherActive?"0 0 6px #dc2626":undefined}}/>
          <span style={{fontSize:12,color:active||otherActive?th.tx:th.txM}}>
            {active?<><span style={{display:"inline-flex",alignItems:"center",gap:5}}><IC.live s={13}/> 你正在插播中</span> <span style={{color:th.grn,fontWeight:600}}>LIVE</span></>
            :otherActive?<><IC.live s={13}/> <span style={{fontWeight:600,color:otherActive.senderColor}}>{otherActive.sender}</span> 正在插播</>
            :"— 插播：無"}
          </span>
        </div>
      </div>
    </Card>

    {/* 其他人正在插播的提示 */}
    {otherActive&&<div style={{padding:"14px 20px",borderRadius:10,background:th.red+"15",border:`1px solid ${th.red}33`,marginBottom:16,display:"flex",alignItems:"center",gap:12}}>
      <span style={{fontSize:24,display:"flex",alignItems:"center",justifyContent:"center"}}><IC.dot_red s={20} style={{color:"#ef4444"}}/></span>
      <div>
        <div style={{fontSize:14,fontWeight:700,color:th.red}}>目前有人正在插播中</div>
        <div style={{fontSize:12,color:th.txD,marginTop:2}}>
          <span style={{padding:"2px 8px",borderRadius:4,background:otherActive.senderColor+"33",color:otherActive.senderColor,fontWeight:600,fontSize:11}}>{otherActive.sender}</span>
          <span style={{marginLeft:8,color:th.txM,fontSize:11}}>IP: {otherActive.ip}</span>
        </div>
        <div style={{fontSize:11,color:th.txM,marginTop:4}}>「{otherActive.txt.replace(/<[^>]*>/g,'').substring(0,60)}」</div>
      </div>
    </div>}

    <div style={{display:"flex",gap:10,alignItems:"center",marginBottom:10,flexWrap:"wrap"}}>
      <span style={{fontSize:12,color:th.txM,fontWeight:600,flexShrink:0}}>發話身份</span>
      {(()=>{
        // 改為：緊急插播 → 使用者的身份清單 → 臨時自訂
        // getUserIdentities 包含 legacy 欄位 fallback，舊使用者也能看到自己原本的設定
        const myIdentities=getUserIdentities(userPref);
        // 回推 currentValue：useCustom + customS 是否對應某 identity
        let currentValue="";
        if(useCustom){
          const matched=myIdentities.find(i=>i.customName===customS);
          currentValue=matched?`ident:${matched.id}`:"__custom";
        }else if(sid){
          const matched=myIdentities.find(i=>i.senderId===+sid);
          currentValue=matched?`ident:${matched.id}`:"";
        }
        const onSelChange=(v)=>{
          if(v===""){setSid("");setUseCustom(false);setCustomS("");return;}
          if(v.startsWith("ident:")){
            const id=v.slice(6);
            const ident=myIdentities.find(i=>i.id===id);
            if(!ident)return;
            if(ident.senderId){setSid(String(ident.senderId));setUseCustom(false);setCustomS("");}
            else{setUseCustom(true);setCustomS(ident.customName);setSid("");}
          }
        };
        // Select 本身套用當前 sender 的色彩，視覺統一，不再另外加 badge
        const isEmergency=currentValue==="";
        const bg=isEmergency?th.red+"15":senderColor+"22";
        const fg=isEmergency?th.red:senderColor;
        const bd=isEmergency?th.red+"55":senderColor+"55";
        return <select value={currentValue} onChange={e=>onSelChange(e.target.value)} style={{padding:"7px 14px",borderRadius:8,border:`1px solid ${bd}`,borderLeft:`3px solid ${fg}`,background:bg,color:fg,fontSize:13,fontFamily:"inherit",fontWeight:700,flex:1,maxWidth:320,minWidth:200,cursor:otherActive?"not-allowed":"pointer"}} disabled={!!otherActive}>
          <option value="" style={{fontWeight:700}}>緊急插播</option>
          {myIdentities.length>0&&<optgroup label="我的身份">
            {myIdentities.map(ident=>{
              const label=ident.senderId?(senders.find(x=>x.id===ident.senderId)?.name||"(已刪除)"):ident.customName;
              const sub=ident.senderId?"職務":"自訂";
              return <option key={ident.id} value={`ident:${ident.id}`}>⭐ {label}（{sub}）</option>;
            })}
          </optgroup>}
        </select>;
      })()}
    </div>

    {/* WYSIWYG 16:9 */}
    {(()=>{
      const ebBanner=<div style={{position:"relative",display:"flex",alignItems:"center",gap:29,padding:"22px 77px",background:"rgba(0,0,0,.35)",backdropFilter:"blur(8px)",WebkitBackdropFilter:"blur(8px)",borderBottom:"1px solid rgba(255,255,255,.1)"}}>
        {cfg.showAvatar!==false&&userPref?.avatar&&<img src={userPref.avatar} style={{height:64,width:64,borderRadius:12,objectFit:"cover",flexShrink:0}} alt=""/>}
        <span style={{padding:"5px 29px",borderRadius:10,background:senderColor+"33",color:senderColor,fontWeight:700,fontSize:38,borderLeft:`2px solid ${senderColor}`,textShadow:"-1px -1px 0 rgba(0,0,0,.6),1px -1px 0 rgba(0,0,0,.6),-1px 1px 0 rgba(0,0,0,.6),1px 1px 0 rgba(0,0,0,.6),0 1px 4px rgba(0,0,0,.4)",fontFamily:"inherit"}}>{senderName}</span>
        <BannerTimeBadge timeText={fmtBannerTime(null,cfg.bannerTimeFormat)} color={cfg.bannerTimeColor} loop={true} loopDur={18} extraStyle={{position:"absolute",top:22,right:77}}/>
      </div>;
      const ebBg={backgroundColor:hasBgImg?"#000":(cfg.defaultBgColor||"#1a1e2a"),backgroundImage:hasBgImg?`url(http://${window.location.hostname}:3001/api/text-bg-image)`:undefined,backgroundSize:"cover",backgroundPosition:"center",backgroundRepeat:"no-repeat"};
      return <RichEditor classOfficers={highlightList} value={txt} onChange={setTxt} theme={th} minHeight={0} bgColor="transparent" textColor={cfg.defaultTxtColor||"#fff"} defaultFontSize={cfg.defaultFontSize} defaultLineHeight={cfg.defaultLineHeight} wysiwygMode={true} wysiwygBanner={ebBanner} wysiwygBg={ebBg} wysiwygBgBlur={cfg.textBgBlur||0} renderWysiwyg={(toolbar,content)=><div style={{marginBottom:10}}>{toolbar}{content}</div>}/>;
    })()}

    <div style={{display:"flex",gap:8,alignItems:"center"}}>
      {!active&&!otherActive&&<Btn primary onClick={send} disabled={sending} t={th} style={{padding:"8px 24px"}}>{sending?"發送中...":"發送手動插播"}</Btn>}
      {active&&<><Btn danger onClick={stop} t={th} style={{padding:"8px 24px"}}><span style={{display:"inline-flex",alignItems:"center",gap:5}}><IC.stop s={12}/> 停止廣播</span></Btn><Btn primary onClick={send} disabled={sending} t={th} style={{padding:"8px 24px"}}>{sending?"更新中...":"更新內容"}</Btn></>}
      {otherActive&&<Btn disabled t={th} style={{padding:"8px 24px",opacity:.5}}><span style={{display:"inline-flex",alignItems:"center",gap:5}}><IC.live s={13}/> 其他人正在插播中</span></Btn>}
      {active&&<span style={{fontSize:12,color:th.grn,fontWeight:600}}><span style={{display:"inline-flex",alignItems:"center",gap:4}}><IC.dot_red s={9} style={{color:"#ef4444"}}/> LIVE — 播放端正在顯示</span></span>}
    </div>
    <div style={{fontSize:10,color:th.txM,marginTop:4,textAlign:"right"}}><span style={{opacity:.7}}>✦ 使用所見即所得技術呈現</span></div>
  </div>;
}

function PConfig({cfg,setCfg,senders,userPref,reload,th}){
  const [port,setPort]=useState(String(cfg.tcpPort));const [delay,setDelay]=useState(String(cfg.loopDelay));
  const [img,setImg]=useState(cfg.standbyImg);const [textBgImg,setTextBgImg]=useState(cfg.textBgImg||"");const [ips,setIps]=useState((cfg.adminIps||[]).join("\n"));
  const [ret,setRet]=useState(String(cfg.logRetentionDays));const [defTxt,setDefTxt]=useState(cfg.defaultTxtColor);const [defBg,setDefBg]=useState(cfg.defaultBgColor);const [defSize,setDefSize]=useState(String(cfg.defaultFontSize));
  const [defTxtDur,setDefTxtDur]=useState(String(cfg.defaultTxtDur||60));
  const [defLineHeight,setDefLineHeight]=useState(String(cfg.defaultLineHeight||1.7));
  // Banner 時間顯示
  const [bnrTmColor,setBnrTmColor]=useState(cfg.bannerTimeColor||"#fbbf24");
  const [bnrTmFmt,setBnrTmFmt]=useState(cfg.bannerTimeFormat||"24h");
  const [showAv,setShowAv]=useState(cfg.showAvatar!==false);
  const [mediaDir,setMediaDir]=useState(cfg.mediaDir||"");
  const [saved,setSaved]=useState(false);
  const [tcpTimeout,setTcpTimeout]=useState(String(cfg.tcpTimeout||3000));
  // 待機畫面自訂
  const [sbTitle,setSbTitle]=useState(cfg.standbyTitle||"廣播系統");
  const [sbTitleColor,setSbTitleColor]=useState(cfg.standbyTitleColor||"#ffffff");
  const [sbTitleSize,setSbTitleSize]=useState(String(cfg.standbyTitleSize||77));
  const [sbClockColor,setSbClockColor]=useState(cfg.standbyClockColor||"#ffffff");
  const [sbDateColor,setSbDateColor]=useState(cfg.standbyDateColor||"#999999");
  const [sbShowClock,setSbShowClock]=useState(cfg.standbyShowClock!==false);
  const [sbShowDate,setSbShowDate]=useState(cfg.standbyShowDate!==false);
  const [sbBgBlur,setSbBgBlur]=useState(String(cfg.standbyBgBlur||0));
  const [textBgBlur,setTextBgBlur]=useState(String(cfg.textBgBlur||0));
  // 文字區域位置
  const [taX,setTaX]=useState(cfg.textAreaX??96);
  const [taY,setTaY]=useState(cfg.textAreaY??135);
  const [taW,setTaW]=useState(cfg.textAreaW??1728);
  const [taH,setTaH]=useState(cfg.textAreaH??900);
  const dragRef=useRef(null); // drag state
  // 文字廣播底圖預覽用 — 動態計算 zoom ratio 讓 1920×1080 內容剛好填滿 wrap（避免時間 badge 跑出邊界）
  const textBgWrapRef=useRef(null);
  const [textBgPreviewScale,setTextBgPreviewScale]=useState(0.22);
  useEffect(()=>{
    const el=textBgWrapRef.current;if(!el)return;
    const update=()=>{const w=el.clientWidth;if(w>0)setTextBgPreviewScale(w/1920);};
    update();
    const ro=new ResizeObserver(update);ro.observe(el);
    return()=>ro.disconnect();
  },[]);
  // 時間軸設定
  const [tlStart,setTlStart]=useState(String(cfg.timelineStart??7));
  const [tlEnd,setTlEnd]=useState(String(cfg.timelineEnd??18));
  // 跟隨廣播：下一筆排程（扣預啟動）淨間隔若 ≤ 此秒數則不關機
  const [followGap,setFollowGap]=useState(String(cfg.followGapSec??0));
  // 適用階段
  const [schoolStages,setSchoolStages]=useState(Array.isArray(cfg.schoolStages)&&cfg.schoolStages.length?cfg.schoolStages:["國中","高中"]);
  const toggleStage=(s)=>{
    setSchoolStages(p=>{
      const next=p.includes(s)?p.filter(x=>x!==s):[...p,s];
      if(next.length===0)return p; // 至少保留一個
      return next;
    });
  };

  const pushLiveStyle=(data)=>{fetch(`http://${window.location.hostname}:3001/api/live-style`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(data)}).catch(()=>{});};
  const onDefSizeChange=v=>{setDefSize(v);pushLiveStyle({defaultFontSize:+v,defaultLineHeight:+defLineHeight});};
  const onDefLineHeightChange=v=>{setDefLineHeight(v);pushLiveStyle({defaultFontSize:+defSize,defaultLineHeight:+v});};
  const onTextBgBlurChange=v=>{setTextBgBlur(v);pushLiveStyle({textBgBlur:+v});};
  const onSbBgBlurChange=v=>{setSbBgBlur(v);pushLiveStyle({standbyBgBlur:+v});};
  const save=async()=>{const n={tcpPort:+port,loopDelay:+delay,tcpTimeout:+tcpTimeout,standbyImg:img,textBgImg,textBgBlur:+textBgBlur,adminIps:ips.split("\n").map(s=>s.trim()).filter(Boolean),logRetentionDays:+ret,defaultTxtColor:defTxt,defaultBgColor:defBg,defaultFontSize:+defSize,defaultTxtDur:+defTxtDur,defaultLineHeight:+defLineHeight,mediaDir,standbyTitle:sbTitle,standbyTitleColor:sbTitleColor,standbyTitleSize:+sbTitleSize,standbyClockColor:sbClockColor,standbyDateColor:sbDateColor,standbyShowClock:sbShowClock,standbyShowDate:sbShowDate,standbyBgBlur:+sbBgBlur,textAreaX:taX,textAreaY:taY,textAreaW:taW,textAreaH:taH,timelineStart:+tlStart,timelineEnd:+tlEnd,followGapSec:+followGap,bannerTimeColor:bnrTmColor,bannerTimeFormat:bnrTmFmt,showAvatar:showAv,schoolStages};try{await api.saveConfig(n);setCfg(n);setSaved(true);setTimeout(()=>setSaved(false),2500);}catch(e){alert("儲存失敗: "+e.message);}};

  return <div>
    <Title sub="訊息設定、底圖、TCP 連線、管理員權限" t={th}>系統設定</Title>

    {/* 適用階段 — 決定全站 UI 呈現方式 */}
    <Card t={th} style={{marginBottom:16}}>
      <h3 style={{margin:"0 0 10px",fontSize:14,fontWeight:700,color:th.txD}}><span style={{display:"inline-flex",alignItems:"center",gap:5}}><IC.school s={14}/> 學校適用階段</span></h3>
      <div style={{fontSize:12,color:th.txM,marginBottom:12,lineHeight:1.6}}>
        勾選本系統服務的教育階段（至少一項）。只有單一階段時，系統會隱藏「國中 / 高中」選擇器，排程卡片直接顯示班級名稱，介面更精簡。
      </div>
      <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
        {["國小","國中","高中"].map(s=>{
          const on=schoolStages.includes(s);
          return <Chip key={s} on={on} onClick={()=>toggleStage(s)} style={{padding:"7px 18px",fontSize:13,fontWeight:600}} t={th}>{s}</Chip>;
        })}
        <span style={{fontSize:11,color:th.txM,marginLeft:8,alignSelf:"center"}}>{schoolStages.length===1?`單一階段模式 — ${schoolStages[0]}`:`多階段模式 — ${schoolStages.join("、")}`}</span>
      </div>
    </Card>

    {/* Row 1: 訊息設定 + 媒體設定 */}
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
      <Card t={th}><h3 style={{margin:"0 0 14px",fontSize:14,fontWeight:700,color:th.txD}}><span style={{display:"inline-flex",alignItems:"center",gap:5}}><IC.text s={14}/> 訊息設定</span></h3>
        <div style={{display:"flex",gap:10,alignItems:"center",marginBottom:10}}>
          <span style={{fontSize:11,color:th.txM}}>文字顏色</span><input type="color" value={defTxt} onChange={e=>setDefTxt(e.target.value)} style={{width:28,height:24,border:"none",cursor:"pointer"}}/>
          <span style={{fontSize:11,color:th.txM}}>背景色</span><input type="color" value={defBg} onChange={e=>setDefBg(e.target.value)} style={{width:28,height:24,border:"none",cursor:"pointer"}}/>
        </div>
        <div style={{display:"flex",gap:10,alignItems:"center",marginBottom:10}}>
          <span style={{fontSize:11,color:th.txM}}>文字大小</span><Inp value={defSize} onChange={onDefSizeChange} type="number" style={{width:56,padding:"5px 8px"}} min={12} t={th}/><span style={{fontSize:10,color:th.txM}}>px</span>
          <span style={{fontSize:11,color:th.txM,marginLeft:6}}>行高</span><Inp value={defLineHeight} onChange={onDefLineHeightChange} type="number" style={{width:56,padding:"5px 8px"}} step={0.1} t={th}/>
        </div>
        <div style={{display:"flex",gap:10,alignItems:"center",marginBottom:10}}>
          <span style={{fontSize:11,color:th.txM}}>預設播放秒數</span><Inp value={defTxtDur} onChange={setDefTxtDur} type="number" style={{width:70,padding:"5px 8px"}} min={1} t={th}/><span style={{fontSize:10,color:th.txM}}>秒</span>
        </div>
        <div style={{display:"flex",gap:10,alignItems:"center",marginBottom:10,paddingTop:10,borderTop:`1px dashed ${th.bd}`}}>
          <span style={{fontSize:11,color:th.txM}}>Banner 時間色</span>
          <input type="color" value={bnrTmColor} onChange={e=>setBnrTmColor(e.target.value)} style={{width:28,height:24,border:"none",cursor:"pointer"}}/>
          <Inp value={bnrTmColor} onChange={setBnrTmColor} style={{width:84,fontFamily:mono,padding:"5px 8px"}} t={th}/>
          <span style={{fontSize:11,color:th.txM,marginLeft:10}}>時制</span>
          <Sel value={bnrTmFmt} onChange={setBnrTmFmt} style={{width:100}} t={th}>
            <option value="24h">24 小時制</option>
            <option value="12h">12 小時制（上午/下午）</option>
          </Sel>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:10,padding:"8px 12px",borderRadius:8,background:"#0a0a0a",marginBottom:8}}>
          <BannerTimeBadge timeText={fmtBannerTime(new Date(),bnrTmFmt)} color={bnrTmColor} loop={true} loopDur={18} fontSize={16}/>
          <span style={{fontSize:10,color:"#666"}}>← banner 實際顯示效果預覽（含剩餘時間流逝動畫）</span>
        </div>
        <div style={{display:"flex",gap:10,alignItems:"center",marginBottom:10,paddingTop:10,borderTop:`1px dashed ${th.bd}`}}>
          <span style={{fontSize:11,color:th.txM}}>顯示發話者頭像</span>
          <label style={{display:"inline-flex",alignItems:"center",gap:6,cursor:"pointer"}}>
            <input type="checkbox" checked={showAv} onChange={e=>setShowAv(e.target.checked)} style={{cursor:"pointer",accentColor:th.acc}}/>
            <span style={{fontSize:12,color:showAv?th.grn:th.txM,fontWeight:600}}>{showAv?"啟用":"關閉"}</span>
          </label>
          <span style={{fontSize:10,color:th.txM,marginLeft:8,fontStyle:"italic"}}>關閉後，所有 banner、預覽、播放端皆不顯示頭像</span>
        </div>
        <div style={{padding:"10px 14px",borderRadius:8,background:defBg,color:defTxt,fontSize:Math.min(+defSize/3,20),fontWeight:600,lineHeight:+defLineHeight||1.7,marginBottom:8}}>預覽文字</div>
        <div style={{fontSize:10,color:th.txM}}>※ 若已設定文字廣播底圖，播放時將使用底圖，不套用背景色</div>
      </Card>
      <Card t={th}><h3 style={{margin:"0 0 14px",fontSize:14,fontWeight:700,color:th.txD}}><span style={{display:"inline-flex",alignItems:"center",gap:5}}><IC.folder s={14}/> 媒體設定</span></h3>
        <Field label="媒體檔案資料夾路徑" t={th}><Inp value={mediaDir} onChange={setMediaDir} placeholder="留空則使用專案 uploads/" t={th}/></Field>
        <div style={{fontSize:10,color:th.txM,marginBottom:8}}>播放主機上的媒體檔案路徑</div>
        <MediaScan th={th}/>
      </Card>
    </div>

    {/* Row 2: 底圖設定（統一格式） */}
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginTop:16}}>
      <Card t={th}><h3 style={{margin:"0 0 14px",fontSize:14,fontWeight:700,color:th.txD}}><span style={{display:"inline-flex",alignItems:"center",gap:5}}><IC.monitor s={14}/> 待機底圖</span></h3>
        <Field label="路徑或媒體資料夾內的檔名" t={th}>
          <Inp value={img} onChange={setImg} placeholder="留空不使用底圖" t={th}/>
        </Field>
        <div style={{fontSize:10,color:th.txM,marginBottom:8}}>開機等待及播放結束後顯示。留空則不載入底圖</div>
        {img&&img!=="standby.png"&&<div style={{display:"flex",gap:10,alignItems:"center",marginBottom:8}}>
          <span style={{fontSize:11,color:th.txM}}>背景模糊</span>
          <input type="range" min={0} max={30} step={1} defaultValue={sbBgBlur}
            onInput={e=>{
              const v=+e.target.value;
              const wrap=e.target.closest('div')?.parentElement;
              const bg=wrap?.querySelector('[data-sb-blurlayer]');
              const lbl=e.target.parentElement?.querySelector('[data-sb-blurlabel]');
              if(bg){bg.style.filter=v>0?`blur(${v}px)`:'none';bg.style.inset=v>0?`-${v*2}px`:'0';}
              if(lbl)lbl.textContent=v+'px';
              pushLiveStyle({standbyBgBlur:v});
            }}
            onMouseUp={e=>setSbBgBlur(e.target.value)}
            onTouchEnd={e=>setSbBgBlur(e.target.value)}
            style={{flex:1,maxWidth:160,accentColor:th.acc}}/>
          <span data-sb-blurlabel style={{fontSize:12,color:th.txD,fontWeight:600,minWidth:32,textAlign:"center"}}>{sbBgBlur}px</span>
        </div>}
        {/* 16:9 Preview */}
        {(()=>{
          const previewScale = 0.22;
          const blurVal = +sbBgBlur || 0;
          return <div style={{position:"relative",width:"100%",paddingTop:"56.25%",borderRadius:8,overflow:"hidden",border:`1px solid ${th.bd}`,marginBottom:12}}>
            {/* Blur background layer */}
            <div data-sb-blurlayer style={{position:"absolute",inset:blurVal>0?`-${blurVal*2}px`:"0",backgroundColor:"#0b0d12",
              backgroundImage:img&&img!=="standby.png"?`url(http://${window.location.hostname}:3001/api/standby-image)`:undefined,
              backgroundSize:"cover",backgroundPosition:"center",backgroundRepeat:"no-repeat",
              filter:img&&blurVal>0?`blur(${blurVal}px)`:"none"
            }}/>
            {/* Content overlay */}
            <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden"}}>
              <div style={{zoom:previewScale,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",width:1920,height:1080}}>
                {sbTitle&&<div style={{fontSize:(+sbTitleSize||77)+"px",fontWeight:900,color:sbTitleColor,letterSpacing:8,textAlign:"center",textShadow:"-1px -1px 0 rgba(0,0,0,.6),1px -1px 0 rgba(0,0,0,.6),-1px 1px 0 rgba(0,0,0,.6),1px 1px 0 rgba(0,0,0,.6),0 2px 12px rgba(0,0,0,.5)"}}>{sbTitle}</div>}
                {sbShowClock&&<div style={{fontSize:"230px",fontWeight:700,color:sbClockColor,fontFamily:"'SF Mono','Fira Code',monospace",marginTop:22,letterSpacing:4,textShadow:"-2px -2px 0 rgba(0,0,0,.7),2px -2px 0 rgba(0,0,0,.7),-2px 2px 0 rgba(0,0,0,.7),2px 2px 0 rgba(0,0,0,.7),0 4px 20px rgba(0,0,0,.5)"}}>12:34:56</div>}
                {sbShowDate&&<div style={{fontSize:"48px",color:sbDateColor,marginTop:22,fontWeight:500,textShadow:"-1px -1px 0 rgba(0,0,0,.6),1px -1px 0 rgba(0,0,0,.6),-1px 1px 0 rgba(0,0,0,.6),1px 1px 0 rgba(0,0,0,.6),0 2px 8px rgba(0,0,0,.5)"}}>2025/03/16 星期日</div>}
              </div>
            </div>
          </div>;
        })()}
        {/* 待機文字設定 */}
        <div style={{display:"flex",gap:10,alignItems:"center",marginBottom:8}}>
          <span style={{fontSize:11,color:th.txM}}>標題</span>
          <Inp value={sbTitle} onChange={setSbTitle} placeholder="廣播系統" style={{flex:1}} t={th}/>
          <span style={{fontSize:11,color:th.txM}}>色</span><input type="color" value={sbTitleColor.startsWith("rgba")?"#ffffff":sbTitleColor} onChange={e=>setSbTitleColor(e.target.value)} style={{width:24,height:20,border:"none",cursor:"pointer"}}/>
          <span style={{fontSize:11,color:th.txM}}>字級</span><Inp value={sbTitleSize} onChange={setSbTitleSize} type="number" style={{width:50,padding:"4px 6px"}} t={th}/>
        </div>
        <div style={{display:"flex",gap:10,alignItems:"center",marginBottom:6}}>
          <span style={{fontSize:11,color:th.txM}}>時鐘色</span><input type="color" value={sbClockColor.startsWith("rgba")?"#ffffff":sbClockColor} onChange={e=>setSbClockColor(e.target.value)} style={{width:24,height:20,border:"none",cursor:"pointer"}}/>
          <span style={{fontSize:11,color:th.txM}}>日期色</span><input type="color" value={sbDateColor.startsWith("rgba")?"#999999":sbDateColor} onChange={e=>setSbDateColor(e.target.value)} style={{width:24,height:20,border:"none",cursor:"pointer"}}/>
          <label style={{fontSize:11,color:th.txM,display:"flex",alignItems:"center",gap:3,cursor:"pointer",marginLeft:4}}><input type="checkbox" checked={sbShowClock} onChange={e=>setSbShowClock(e.target.checked)}/> 時鐘</label>
          <label style={{fontSize:11,color:th.txM,display:"flex",alignItems:"center",gap:3,cursor:"pointer"}}><input type="checkbox" checked={sbShowDate} onChange={e=>setSbShowDate(e.target.checked)}/> 日期</label>
        </div>
      </Card>
      <Card t={th}><h3 style={{margin:"0 0 14px",fontSize:14,fontWeight:700,color:th.txD}}><span style={{display:"inline-flex",alignItems:"center",gap:5}}><IC.text s={14}/> 文字廣播底圖</span></h3>
        <Field label="路徑或媒體資料夾內的檔名" t={th}>
          <Inp value={textBgImg} onChange={setTextBgImg} placeholder="留空則使用純色背景" t={th}/>
        </Field>
        <div style={{fontSize:10,color:th.txM,marginBottom:8}}>播放文字訊息時的背景圖。留空則使用排程的純色底色</div>
        {textBgImg&&<div style={{display:"flex",gap:10,alignItems:"center",marginBottom:8}}>
          <span style={{fontSize:11,color:th.txM}}>背景模糊</span>
          <input type="range" min={0} max={30} step={1} defaultValue={textBgBlur}
            ref={el=>{if(el)el._blurSlider=true;}}
            onInput={e=>{
              const v=+e.target.value;
              const wrap=e.target.closest('.cfg-preview-wrap')||document.querySelector('.cfg-preview-wrap');
              const bg=wrap?.querySelector('[data-blurlayer]');
              const lbl=e.target.parentElement?.querySelector('[data-blurlabel]');
              if(bg){bg.style.filter=v>0?`blur(${v}px)`:'none';bg.style.inset=v>0?`-${v*2}px`:'0';}
              if(lbl)lbl.textContent=v+'px';
              pushLiveStyle({textBgBlur:v});
            }}
            onMouseUp={e=>setTextBgBlur(e.target.value)}
            onTouchEnd={e=>setTextBgBlur(e.target.value)}
            style={{flex:1,maxWidth:160,accentColor:th.acc}}/>
          <span data-blurlabel style={{fontSize:12,color:th.txD,fontWeight:600,minWidth:32,textAlign:"center"}}>{textBgBlur}px</span>
        </div>}
        <div ref={textBgWrapRef} className="cfg-preview-wrap" style={{position:"relative",width:"100%",paddingTop:"56.25%",borderRadius:8,overflow:"hidden",border:`1px solid ${th.bd}`}}>
          {/* Blur background layer */}
          <div data-blurlayer style={{position:"absolute",inset:+textBgBlur>0?`-${+textBgBlur*2}px`:"0",backgroundColor:cfg.defaultBgColor||"#1a1e2a",
            backgroundImage:textBgImg?`url(http://${window.location.hostname}:3001/api/text-bg-image)`:undefined,
            backgroundSize:"cover",backgroundPosition:"center",backgroundRepeat:"no-repeat",
            filter:textBgImg&&+textBgBlur>0?`blur(${textBgBlur}px)`:"none"
          }}/>
          {/* Content overlay with banner + draggable text area */}
          <div style={{position:"absolute",inset:0,overflow:"hidden"}}>
            {(()=>{
              const ps=textBgPreviewScale;
              const prefSender=userPref?.senderId?senders.find(x=>x.id===+userPref.senderId):null;
              const pName=userPref?.customName||prefSender?.name||"發話單位";
              const pColor=userPref?.customColor||prefSender?.color||"#3b82f6";
              const onDragStart=(e,mode,corner)=>{
                e.preventDefault();e.stopPropagation();
                const box=e.currentTarget.closest('[data-dragbox]');
                const label=box?.querySelector('[data-label]');
                dragRef.current={mode,corner,startX:e.clientX,startY:e.clientY,origX:taX,origY:taY,origW:taW,origH:taH,scale:ps,box,label};
                const onMove=ev=>{
                  const d=dragRef.current;if(!d||!d.box)return;
                  const dx=(ev.clientX-d.startX)/d.scale;const dy=(ev.clientY-d.startY)/d.scale;
                  let nx=d.origX,ny=d.origY,nw=d.origW,nh=d.origH;
                  if(d.mode==="move"){
                    nx=Math.max(0,Math.min(1920-d.origW,Math.round(d.origX+dx)));
                    ny=Math.max(0,Math.min(1080-d.origH,Math.round(d.origY+dy)));
                  }else{
                    if(d.corner.includes("r")){nw=Math.max(100,Math.round(d.origW+dx));}
                    if(d.corner.includes("l")){const dw=Math.min(Math.round(dx),d.origW-100);nx=d.origX+dw;nw=d.origW-dw;}
                    if(d.corner.includes("b")){nh=Math.max(60,Math.round(d.origH+dy));}
                    if(d.corner.includes("t")){const dh=Math.min(Math.round(dy),d.origH-60);ny=d.origY+dh;nh=d.origH-dh;}
                    nx=Math.max(0,nx);ny=Math.max(0,ny);
                    nw=Math.min(1920-nx,nw);nh=Math.min(1080-ny,nh);
                  }
                  // Direct DOM update (no React re-render)
                  d.box.style.left=nx+"px";d.box.style.top=ny+"px";d.box.style.width=nw+"px";d.box.style.height=nh+"px";
                  if(d.label)d.label.textContent=`${nx},${ny} · ${nw}×${nh}`;
                  d._last={nx,ny,nw,nh};
                };
                const onUp=()=>{
                  const d=dragRef.current;
                  if(d&&d._last){setTaX(d._last.nx);setTaY(d._last.ny);setTaW(d._last.nw);setTaH(d._last.nh);}
                  dragRef.current=null;
                  window.removeEventListener("mousemove",onMove);window.removeEventListener("mouseup",onUp);
                };
                window.addEventListener("mousemove",onMove);window.addEventListener("mouseup",onUp);
              };
              const handleStyle=(cursor)=>({position:"absolute",width:8,height:8,background:th.acc,borderRadius:2,cursor,zIndex:5});
              return <div data-preview style={{zoom:ps,width:1920,height:1080,position:"relative"}}>
                {/* Banner */}
                <div style={{position:"relative",display:"flex",alignItems:"center",gap:29,padding:"22px 77px",background:"rgba(0,0,0,.35)",backdropFilter:"blur(8px)",WebkitBackdropFilter:"blur(8px)",borderBottom:"1px solid rgba(255,255,255,.1)"}}>
                  {showAv&&userPref?.avatar&&<img src={userPref.avatar} style={{height:64,width:64,borderRadius:12,objectFit:"cover",flexShrink:0}} alt=""/>}
                  <span style={{padding:"5px 29px",borderRadius:10,background:pColor+"33",color:pColor,fontWeight:700,fontSize:38,borderLeft:`2px solid ${pColor}`,textShadow:"-1px -1px 0 rgba(0,0,0,.6),1px -1px 0 rgba(0,0,0,.6),-1px 1px 0 rgba(0,0,0,.6),1px 1px 0 rgba(0,0,0,.6),0 1px 4px rgba(0,0,0,.4)"}}>{pName}</span>
                  <BannerTimeBadge timeText={fmtBannerTime("10:30",cfg.bannerTimeFormat)} color={cfg.bannerTimeColor} loop={true} loopDur={18} extraStyle={{position:"absolute",top:22,right:77}}/>
                </div>
                {/* Draggable text area */}
                <div data-dragbox style={{position:"absolute",left:taX,top:taY,width:taW,height:taH,border:`3px dashed ${th.acc}88`,background:th.acc+"10",cursor:"move",userSelect:"none"}}
                  onMouseDown={e=>onDragStart(e,"move")}>
                  <div style={{padding:16,color:cfg.defaultTxtColor||"#fff",fontSize:(cfg.defaultFontSize||48)+"px",fontWeight:600,lineHeight:cfg.defaultLineHeight||1.7,textShadow:"-1px -1px 0 rgba(0,0,0,.7),1px -1px 0 rgba(0,0,0,.7),-1px 1px 0 rgba(0,0,0,.7),1px 1px 0 rgba(0,0,0,.7),0 2px 6px rgba(0,0,0,.5)",overflow:"hidden",height:"100%"}}>
                    廣播內容預覽文字
                  </div>
                  {/* 8 resize handles */}
                  <div onMouseDown={e=>onDragStart(e,"resize","tl")} style={{...handleStyle("nw-resize"),top:-4,left:-4}}/>
                  <div onMouseDown={e=>onDragStart(e,"resize","tr")} style={{...handleStyle("ne-resize"),top:-4,right:-4}}/>
                  <div onMouseDown={e=>onDragStart(e,"resize","bl")} style={{...handleStyle("sw-resize"),bottom:-4,left:-4}}/>
                  <div onMouseDown={e=>onDragStart(e,"resize","br")} style={{...handleStyle("se-resize"),bottom:-4,right:-4}}/>
                  <div onMouseDown={e=>onDragStart(e,"resize","t")} style={{...handleStyle("n-resize"),top:-4,left:"50%",marginLeft:-4}}/>
                  <div onMouseDown={e=>onDragStart(e,"resize","b")} style={{...handleStyle("s-resize"),bottom:-4,left:"50%",marginLeft:-4}}/>
                  <div onMouseDown={e=>onDragStart(e,"resize","l")} style={{...handleStyle("w-resize"),top:"50%",left:-4,marginTop:-4}}/>
                  <div onMouseDown={e=>onDragStart(e,"resize","r")} style={{...handleStyle("e-resize"),top:"50%",right:-4,marginTop:-4}}/>
                  {/* Position label */}
                  <div data-label style={{position:"absolute",bottom:8,right:10,fontSize:20,color:th.acc,fontWeight:700,opacity:.8,pointerEvents:"none"}}>
                    {taX},{taY} · {taW}×{taH}
                  </div>
                </div>
              </div>;
            })()}
          </div>
        </div>
      </Card>
    </div>

    {/* Row 3: TCP + 白名單 + 日誌 */}
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:16,marginTop:16}}>
      <Card t={th}><h3 style={{margin:"0 0 14px",fontSize:14,fontWeight:700,color:th.txD,display:"inline-flex",alignItems:"center",gap:5}}><IC.plug s={14}/> TCP 連線</h3>
        <Field label="TCP Port" t={th}><Inp value={port} onChange={setPort} type="number" t={th}/></Field>
        <div style={{display:"flex",gap:10,alignItems:"center",marginBottom:10}}>
          <div style={{flex:1}}><Field label="迴圈等待（ms）" t={th}><Inp value={delay} onChange={setDelay} type="number" t={th}/></Field></div>
          <div style={{flex:1}}><Field label="連線逾時（ms）" t={th}><Inp value={tcpTimeout} onChange={setTcpTimeout} type="number" t={th}/></Field></div>
        </div>
        <div style={{padding:"10px 14px",borderRadius:8,background:th.bg2,marginTop:4}}>
          <div style={{fontFamily:mono,fontSize:11,lineHeight:2,color:th.txD}}>
            <div><span style={{color:th.accL}}>預啟動</span> = max(開機時間) + 班級數 × {delay}ms</div>
            <div style={{color:th.amb,fontFamily:font,marginTop:2,fontSize:10}}>※ 排程間距 ≤ max開機×2 → 不關機等待</div>
          </div>
        </div>
      </Card>
      <Card t={th}><h3 style={{margin:"0 0 14px",fontSize:14,fontWeight:700,color:th.txD}}><span style={{display:"inline-flex",alignItems:"center",gap:5}}><IC.shield s={14}/> 管理員 IP 白名單</span></h3>
        <textarea value={ips} onChange={e=>setIps(e.target.value)} style={{width:"100%",minHeight:120,background:th.bg2,border:`1px solid ${th.bd}`,borderRadius:8,padding:"10px 12px",color:th.tx,fontSize:13,fontFamily:mono,resize:"vertical",outline:"none",boxSizing:"border-box",lineHeight:1.8}} placeholder="每行一個 IP"/>
        <div style={{fontSize:10,color:th.txM,marginTop:4}}>白名單內 IP 可存取管理功能</div>
      </Card>
      <Card t={th}><h3 style={{margin:"0 0 14px",fontSize:14,fontWeight:700,color:th.txD}}><span style={{display:"inline-flex",alignItems:"center",gap:5}}><IC.logs s={14}/> 日誌 & 時間軸</span></h3>
        <Field label="日誌保留天數" t={th}><Inp value={ret} onChange={setRet} type="number" style={{width:100}} t={th}/></Field>
        <div style={{fontSize:10,color:th.txM,marginBottom:10}}>操作日誌與 TCP 日誌超過天數自動清除</div>
        <div style={{display:"flex",gap:10,alignItems:"center"}}>
          <div style={{flex:1}}><Field label="時間軸起始（時）" t={th}><Inp value={tlStart} onChange={setTlStart} type="number" min={0} max={23} style={{width:60}} t={th}/></Field></div>
          <div style={{flex:1}}><Field label="時間軸結束（時）" t={th}><Inp value={tlEnd} onChange={setTlEnd} type="number" min={1} max={24} style={{width:60}} t={th}/></Field></div>
        </div>
        <div style={{fontSize:10,color:th.txM,marginBottom:10}}>排程主頁和編輯頁面的日程表顯示範圍</div>
        <Field label={<span style={{display:"inline-flex",alignItems:"center",gap:4}}><IC.link s={12}/>跟隨廣播閾值（秒）</span>} t={th}><Inp value={followGap} onChange={setFollowGap} type="number" min={0} style={{width:100}} t={th}/></Field>
        <div style={{fontSize:10,color:th.txM}}>下一筆排程扣除預啟動後的淨間隔若 ≤ 此秒數，則不發送關機指令、直接維持電視開啟等待下一筆。預設 0 = 僅當下一筆已「必須立刻預啟動」才跟隨。</div>
      </Card>
    </div>

    {/* Row 4: Emergency */}
    <Card style={{marginTop:16,border:`1px solid ${th.red}33`}} t={th}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div>
          <h3 style={{margin:"0 0 4px",fontSize:14,fontWeight:700,color:th.red}}><span style={{display:"inline-flex",alignItems:"center",gap:5,color:th.red}}><IC.warn s={15}/> 緊急控制</span></h3>
          <div style={{fontSize:12,color:th.txM}}>取消目前正在播放的廣播排程，從資料庫移除，播放端立即回到待機畫面</div>
        </div>
        <div style={{display:"flex",gap:8}}>
          <Btn danger onClick={async()=>{if(!confirm("確定要取消目前正在播放的廣播？\n該筆排程會被刪除，播放端會立即回到待機畫面。"))return;try{const r=await api.forceStop();if(r.removed)alert(`已取消並刪除廣播：${r.removed.st}-${r.removed.et}`);else alert("目前沒有正在播放的廣播");}catch(e){alert(e.message);}}} t={th} style={{padding:"8px 20px"}}><span style={{display:"inline-flex",alignItems:"center",gap:5}}><IC.stop s={12}/> 取消當前廣播</span></Btn>
        </div>
      </div>
    </Card>

    {/* Save */}
    <div style={{marginTop:20,display:"flex",alignItems:"center",gap:12}}>
      <Btn primary onClick={save} style={{padding:"10px 28px"}} t={th}>{saved?"✓ 設定已儲存":"儲存所有設定"}</Btn>
      {saved&&<span style={{fontSize:12,color:th.grn,fontWeight:500}}>✓ 儲存成功</span>}
    </div>
  </div>;
}

/* ═══ AVATAR CROPPER ═══ */
function AvatarCropper({src,onDone,onClose,th}){
  const imgRef=useRef(null);
  const containerRef=useRef(null);
  const [imgSize,setImgSize]=useState(null); // {w,h,dispW,dispH}
  const [crop,setCrop]=useState(null); // {x,y,size} in display coords
  const [dragging,setDragging]=useState(null); // 'move' | 'resize' | null

  const onImgLoad=()=>{
    const img=imgRef.current;if(!img)return;
    const w=img.naturalWidth,h=img.naturalHeight;
    const maxW=500,maxH=400;
    const scale=Math.min(maxW/w,maxH/h,1);
    const dispW=Math.round(w*scale),dispH=Math.round(h*scale);
    setImgSize({w,h,dispW,dispH,scale});
    const s=Math.min(dispW,dispH)*0.7;
    setCrop({x:(dispW-s)/2,y:(dispH-s)/2,size:s});
  };

  const onMouseDown=(e,type)=>{
    e.preventDefault();e.stopPropagation();
    const rect=containerRef.current.getBoundingClientRect();
    const startX=e.clientX,startY=e.clientY;
    const startCrop={...crop};

    const onMove=ev=>{
      const dx=ev.clientX-startX,dy=ev.clientY-startY;
      if(type==='move'){
        const x=Math.max(0,Math.min(imgSize.dispW-startCrop.size,startCrop.x+dx));
        const y=Math.max(0,Math.min(imgSize.dispH-startCrop.size,startCrop.y+dy));
        setCrop({...startCrop,x,y});
      }else{
        const delta=Math.max(dx,dy);
        const newSize=Math.max(40,Math.min(
          imgSize.dispW-startCrop.x,
          imgSize.dispH-startCrop.y,
          startCrop.size+delta
        ));
        setCrop({...startCrop,size:newSize});
      }
    };
    const onUp=()=>{window.removeEventListener('mousemove',onMove);window.removeEventListener('mouseup',onUp);setDragging(null);};
    setDragging(type);
    window.addEventListener('mousemove',onMove);
    window.addEventListener('mouseup',onUp);
  };

  const confirm=()=>{
    if(!imgSize||!crop)return;
    const img=imgRef.current;
    const ratio=1/imgSize.scale;
    const sx=crop.x*ratio,sy=crop.y*ratio,ss=crop.size*ratio;
    const canvas=document.createElement('canvas');
    canvas.width=128;canvas.height=128;
    const ctx=canvas.getContext('2d');
    ctx.drawImage(img,sx,sy,ss,ss,0,0,128,128);
    onDone(canvas.toDataURL('image/jpeg',0.85));
  };

  return <div style={{position:"fixed",inset:0,zIndex:300,display:"flex",alignItems:"center",justifyContent:"center"}}>
    <div onClick={onClose} style={{position:"absolute",inset:0,background:"rgba(0,0,0,.6)"}}/>
    <div style={{position:"relative",zIndex:1,background:th.sf,borderRadius:16,border:`1px solid ${th.bd}`,padding:24,boxShadow:"0 24px 80px rgba(0,0,0,.4)",maxWidth:"90vw"}}>
      <div style={{fontSize:16,fontWeight:700,color:th.tx,marginBottom:16}}>裁切頭像</div>
      <div style={{fontSize:12,color:th.txM,marginBottom:12}}>拖曳方框選取要顯示的區域，拖曳右下角可調整大小</div>

      <div ref={containerRef} style={{position:"relative",display:"inline-block",userSelect:"none",lineHeight:0}}>
        <img ref={imgRef} src={src} onLoad={onImgLoad} style={{display:"block",width:imgSize?.dispW,height:imgSize?.dispH,borderRadius:8}} alt="" draggable={false}/>

        {crop&&imgSize&&<>
          {/* Dark overlay with crop hole */}
          <svg style={{position:"absolute",top:0,left:0,width:imgSize.dispW,height:imgSize.dispH,pointerEvents:"none"}}>
            <defs><mask id="cropMask">
              <rect x="0" y="0" width="100%" height="100%" fill="white"/>
              <rect x={crop.x} y={crop.y} width={crop.size} height={crop.size} fill="black" rx="8"/>
            </mask></defs>
            <rect x="0" y="0" width="100%" height="100%" fill="rgba(0,0,0,.55)" mask="url(#cropMask)"/>
          </svg>

          {/* Crop border (draggable) */}
          <div onMouseDown={e=>onMouseDown(e,'move')} style={{
            position:"absolute",left:crop.x,top:crop.y,width:crop.size,height:crop.size,
            border:"2px solid #fff",borderRadius:8,cursor:"move",boxSizing:"border-box",
            boxShadow:"0 0 0 1px rgba(0,0,0,.3),inset 0 0 0 1px rgba(0,0,0,.1)"
          }}>
            {/* Grid lines */}
            <div style={{position:"absolute",top:"33.3%",left:0,right:0,height:1,background:"rgba(255,255,255,.3)"}}/>
            <div style={{position:"absolute",top:"66.6%",left:0,right:0,height:1,background:"rgba(255,255,255,.3)"}}/>
            <div style={{position:"absolute",left:"33.3%",top:0,bottom:0,width:1,background:"rgba(255,255,255,.3)"}}/>
            <div style={{position:"absolute",left:"66.6%",top:0,bottom:0,width:1,background:"rgba(255,255,255,.3)"}}/>

            {/* Resize handle (bottom-right) */}
            <div onMouseDown={e=>onMouseDown(e,'resize')} style={{
              position:"absolute",right:-6,bottom:-6,width:14,height:14,borderRadius:7,
              background:"#fff",border:"2px solid #666",cursor:"nwse-resize",
              boxShadow:"0 2px 6px rgba(0,0,0,.3)"
            }}/>
          </div>
        </>}
      </div>

      {/* Preview */}
      {crop&&imgSize&&<div style={{display:"flex",alignItems:"center",gap:16,marginTop:16}}>
        <div>
          <div style={{fontSize:10,color:th.txM,marginBottom:4}}>預覽 128×128</div>
          <canvas ref={el=>{
            if(!el||!imgRef.current||!crop||!imgSize)return;
            const ctx=el.getContext('2d');
            const ratio=1/imgSize.scale;
            ctx.clearRect(0,0,128,128);
            ctx.drawImage(imgRef.current,crop.x*ratio,crop.y*ratio,crop.size*ratio,crop.size*ratio,0,0,128,128);
          }} width={128} height={128} style={{width:64,height:64,borderRadius:8,border:`1px solid ${th.bd}`}}/>
        </div>
        <div style={{display:"flex",gap:8}}>
          <Btn primary onClick={confirm} t={th} style={{padding:"8px 20px"}}>✓ 確認裁切</Btn>
          <Btn onClick={onClose} t={th}>取消</Btn>
        </div>
      </div>}
    </div>
  </div>;
}

/* ═══ PROFILE (個人設定) ═══ */
function PProfile({senders,userPref,saveUserPref,myIp,cfg,th}){
  // 遷移：若舊資料只有 senderId/customName，自動轉成 identities[0]
  const migrateIdentities=()=>{
    if(Array.isArray(userPref.identities)&&userPref.identities.length)return userPref.identities;
    if(userPref.senderId){return [{id:"legacy",senderId:+userPref.senderId}];}
    if(userPref.customName){return [{id:"legacy",customName:userPref.customName,customColor:userPref.customColor||"#3b82f6"}];}
    return [];
  };
  const [identities,setIdentities]=useState(migrateIdentities);
  const [activeId,setActiveId]=useState(userPref.activeIdentityId||userPref.identities?.[0]?.id||"legacy");
  const [avatar,setAvatar]=useState(userPref.avatar||"");
  const [saved,setSaved]=useState(false);

  // 新增身份表單
  const [newType,setNewType]=useState("sender"); // 'sender' | 'custom'
  const [newSid,setNewSid]=useState("");
  const [newCustomName,setNewCustomName]=useState("");
  const [newCustomColor,setNewCustomColor]=useState("#3b82f6");

  const depts=senders.filter(s=>s.pid===null);
  const [cropSrc,setCropSrc]=useState(null);

  const handleAvatarFile=e=>{
    const file=e.target.files[0];if(!file)return;
    const reader=new FileReader();
    reader.onload=ev=>setCropSrc(ev.target.result);
    reader.readAsDataURL(file);
    e.target.value="";
  };
  const onCropDone=base64=>{setAvatar(base64);setCropSrc(null);};

  const addIdentity=()=>{
    const id=String(Date.now());
    let entry=null;
    if(newType==="sender"){
      if(!newSid)return alert("請從清單選擇一個職務");
      if(identities.some(i=>i.senderId===+newSid))return alert("此職務已存在你的身份清單");
      entry={id,senderId:+newSid};
    }else{
      if(!newCustomName.trim())return alert("請輸入自訂名稱");
      entry={id,customName:newCustomName.trim(),customColor:newCustomColor};
    }
    const next=[...identities,entry];
    setIdentities(next);
    // 第一個自動 active
    if(next.length===1)setActiveId(id);
    // 清空表單
    setNewSid("");setNewCustomName("");
  };

  const removeIdentity=(id)=>{
    if(!confirm("確定移除此身份？"))return;
    const next=identities.filter(x=>x.id!==id);
    setIdentities(next);
    if(activeId===id)setActiveId(next[0]?.id||"");
  };

  const save=()=>{
    const p={avatar,identities,activeIdentityId:activeId};
    // 保留第一個身份的 legacy 欄位供舊程式 fallback 使用
    const active=identities.find(x=>x.id===activeId)||identities[0];
    if(active){
      if(active.senderId)p.senderId=active.senderId;
      if(active.customName){p.customName=active.customName;p.customColor=active.customColor;}
    }
    saveUserPref(p);
    setSaved(true);setTimeout(()=>setSaved(false),2500);
  };

  const clearAll=()=>{
    if(!confirm("確定清除所有個人設定？"))return;
    saveUserPref({});setIdentities([]);setActiveId("");setAvatar("");setSaved(false);
  };

  // Helper: 身份名稱/色顯示
  const getLabel=(ident)=>{
    if(ident.senderId){const s=senders.find(x=>x.id===ident.senderId);return {name:s?.name||"(已刪除)",color:s?.color||th.txM,sub:s?.pid?senders.find(x=>x.id===s.pid)?.name:"處室"};}
    return {name:ident.customName,color:ident.customColor||"#3b82f6",sub:"自訂"};
  };

  // 16:9 預覽 banner 用的 name/color — 取目前選中的 active identity
  const activeIdent=identities.find(x=>x.id===activeId)||identities[0];
  const previewInfo=activeIdent?getLabel(activeIdent):{name:"發話單位",color:th.acc};
  const previewName=previewInfo.name;
  const previewColor=previewInfo.color;

  return <div>
    <Title sub="設定您的發話身份清單，新增排程時從清單選取" t={th}>個人設定</Title>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
      <Card t={th}>
        <h3 style={{margin:"0 0 14px",fontSize:14,fontWeight:700,color:th.txD}}><span style={{display:"inline-flex",alignItems:"center",gap:5}}><IC.mic s={14}/> 我的身份清單</span></h3>
        <div style={{fontSize:12,color:th.txM,marginBottom:14,lineHeight:1.6}}>若您身兼多個職務（例：老師兼組長），可新增多組身份。登記訊息時從此清單選取對應身份。</div>

        {/* Identity list */}
        {identities.length===0&&<div style={{padding:"20px 16px",borderRadius:8,background:th.bg2,border:`1px dashed ${th.bd}`,textAlign:"center",fontSize:12,color:th.txM}}>尚未新增任何身份 · 可從下方新增</div>}

        {identities.length>0&&<div style={{display:"flex",flexDirection:"column",gap:6,marginBottom:14}}>
          {identities.map(ident=>{
            const info=getLabel(ident);const isActive=ident.id===activeId;
            return <div key={ident.id} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 12px",borderRadius:8,background:isActive?info.color+"14":th.bg2,border:`1px solid ${isActive?info.color+"55":th.bd}`}}>
              <input type="radio" checked={isActive} onChange={()=>setActiveId(ident.id)} style={{accentColor:info.color,cursor:"pointer"}} title="設為預設身份"/>
              <span style={{padding:"3px 10px",borderRadius:5,background:info.color+"33",color:info.color,fontWeight:700,fontSize:13,borderLeft:`2px solid ${info.color}`}}>{info.name}</span>
              <span style={{fontSize:11,color:th.txM}}>{info.sub}</span>
              {isActive&&<span style={{marginLeft:"auto",fontSize:10,color:info.color,fontWeight:700,letterSpacing:.3,textTransform:"uppercase"}}>預設</span>}
              <button onClick={()=>removeIdentity(ident.id)} style={{background:"none",border:"none",cursor:"pointer",color:th.red,fontSize:14,padding:2,marginLeft:isActive?0:"auto"}} title="移除此身份">✕</button>
            </div>;
          })}
        </div>}

        {/* Add form */}
        <div style={{padding:12,borderRadius:8,background:th.bg2,border:`1px solid ${th.bd}`}}>
          <div style={{fontSize:11,color:th.txM,fontWeight:600,marginBottom:8,letterSpacing:.3,textTransform:"uppercase"}}>新增身份</div>
          <div style={{display:"flex",gap:8,marginBottom:10}}>
            <Btn small onClick={()=>setNewType("sender")} t={th} style={{background:newType==="sender"?th.acc+"22":"transparent",color:newType==="sender"?th.accL:th.txD,border:`1px solid ${newType==="sender"?th.acc:th.bd}`,fontSize:12}}>從系統選</Btn>
            <Btn small onClick={()=>setNewType("custom")} t={th} style={{background:newType==="custom"?th.acc+"22":"transparent",color:newType==="custom"?th.accL:th.txD,border:`1px solid ${newType==="custom"?th.acc:th.bd}`,fontSize:12}}>自訂名稱</Btn>
          </div>
          {newType==="sender"&&<div style={{display:"flex",gap:8,alignItems:"center"}}>
            <select value={newSid} onChange={e=>setNewSid(e.target.value)} style={{flex:1,padding:"8px 12px",borderRadius:8,border:`1px solid ${th.bd}`,background:th.sf,color:th.tx,fontSize:13,fontFamily:"inherit"}}>
              <option value="">選擇處室或職務…</option>
              {depts.map(d=>{
                const members=senders.filter(s=>s.pid===d.id);
                return [
                  <option key={d.id} value={d.id} style={{fontWeight:700}}>{d.name}（處室）</option>,
                  ...members.map(m=><option key={m.id} value={m.id}>　{m.name}</option>)
                ];
              }).flat()}
            </select>
            <Btn small primary onClick={addIdentity} t={th} style={{fontSize:12,padding:"6px 14px"}}>＋ 新增</Btn>
          </div>}
          {newType==="custom"&&<div style={{display:"flex",flexDirection:"column",gap:8}}>
            <Inp value={newCustomName} onChange={setNewCustomName} placeholder="例：陳老師、資訊組長" t={th} style={{fontSize:13}}/>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <span style={{fontSize:11,color:th.txM}}>標籤顏色</span>
              <input type="color" value={newCustomColor} onChange={e=>setNewCustomColor(e.target.value)} style={{width:28,height:24,border:"none",cursor:"pointer"}}/>
              <span style={{flex:1,padding:"3px 12px",borderRadius:6,background:newCustomColor+"33",color:newCustomColor,fontWeight:700,fontSize:13,borderLeft:`2px solid ${newCustomColor}`}}>{newCustomName||"預覽"}</span>
              <Btn small primary onClick={addIdentity} t={th} style={{fontSize:12,padding:"6px 14px"}}>＋ 新增</Btn>
            </div>
          </div>}
        </div>
      </Card>

      <Card t={th}>
        <h3 style={{margin:"0 0 14px",fontSize:14,fontWeight:700,color:th.txD}}><span style={{display:"inline-flex",alignItems:"center",gap:5}}><IC.image s={14}/> 個人頭像</span></h3>
        {cfg.showAvatar===false&&<div style={{padding:"10px 12px",borderRadius:8,background:th.amb+"14",border:`1px solid ${th.amb}44`,color:th.amb,fontSize:12,marginBottom:14,display:"flex",alignItems:"center",gap:8}}>
          <span style={{fontSize:14}}><IC.warn s={14}/></span>
          <span>系統目前已關閉 avatar 功能（系統設定 → 訊息設定），設定頭像但不會顯示在播放端與任何預覽。</span>
        </div>}
        <div style={{fontSize:12,color:th.txM,marginBottom:14}}>可從預設頭像選擇，或上傳自訂圖片。播放端的 banner 會顯示您的頭像。</div>

        {/* 預設頭像選擇器 */}
        <div style={{marginBottom:16}}>
          <div style={{fontSize:11,color:th.txM,fontWeight:600,letterSpacing:.3,marginBottom:8,textTransform:"uppercase"}}>預設頭像</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
            {DEFAULT_AVATARS.map(a=>{
              const selected=avatar===a.svg;
              return <button key={a.id} onClick={()=>setAvatar(a.svg)} title={`${a.gender} · ${a.label}`} style={{padding:3,borderRadius:10,background:selected?th.acc+"22":"transparent",border:`2px solid ${selected?th.acc:th.bd}`,cursor:"pointer",transition:"all .15s",position:"relative",lineHeight:0}}>
                <img src={a.svg} alt={a.label} style={{width:56,height:56,borderRadius:7,display:"block"}}/>
                {selected&&<span style={{position:"absolute",top:-6,right:-6,width:18,height:18,borderRadius:"50%",background:th.acc,color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,border:`2px solid ${th.sf}`}}>✓</span>}
              </button>;
            })}
          </div>
        </div>

        <div style={{fontSize:11,color:th.txM,fontWeight:600,letterSpacing:.3,marginBottom:8,textTransform:"uppercase"}}>或上傳自訂圖片</div>
        <div style={{display:"flex",alignItems:"center",gap:16}}>
          <div style={{width:80,height:80,borderRadius:12,background:th.bg2,border:`2px dashed ${th.bd}`,display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden",flexShrink:0}}>
            {avatar?<img src={avatar} style={{width:80,height:80,objectFit:"cover",borderRadius:10}} alt="avatar"/>
            :<span style={{fontSize:28,opacity:.3,display:"flex"}}><IC.profile s={28}/></span>}
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:6}}>
            <label style={{display:"inline-flex",alignItems:"center",gap:6,padding:"6px 14px",borderRadius:6,background:th.acc+"18",color:th.accL,fontSize:12,fontWeight:600,cursor:"pointer",border:`1px solid ${th.acc}33`}}>
              選擇圖片
              <input type="file" accept="image/*" onChange={handleAvatarFile} style={{display:"none"}}/>
            </label>
            {avatar&&<button onClick={()=>setAvatar("")} style={{background:"none",border:"none",color:th.red,fontSize:11,cursor:"pointer",padding:0,textAlign:"left"}}>✕ 移除頭像</button>}
            <span style={{fontSize:10,color:th.txM}}>支援 JPG、PNG，自動壓縮至 128×128</span>
          </div>
        </div>

        {/* Realistic Player Preview */}
        <div style={{marginTop:16}}>
          <div style={{fontSize:11,color:th.txM,marginBottom:6}}>播放端預覽</div>
          <div style={{position:"relative",width:"100%",paddingTop:"56.25%",borderRadius:10,overflow:"hidden",border:`1px solid ${th.bd}`}}>
            {/* Blur background layer */}
            <div style={{position:"absolute",inset:cfg.textBgBlur>0?`-${cfg.textBgBlur*2}px`:"0",
              backgroundColor:cfg.textBgImg?"#000":(cfg.defaultBgColor||"#1a1e2a"),
              backgroundImage:cfg.textBgImg?`url(http://${window.location.hostname}:3001/api/text-bg-image)`:undefined,
              backgroundSize:"cover",backgroundPosition:"center",backgroundRepeat:"no-repeat",
              filter:cfg.textBgImg&&cfg.textBgBlur>0?`blur(${cfg.textBgBlur}px)`:"none"
            }}/>
            {/* Content overlay */}
            <div style={{position:"absolute",inset:0}}>
              {/* Banner bar — 三元素對齊：avatar / sender / time 高度一致 */}
              {/* 以 container 寬度做基準：avatar 64px/1920 = 3.33%；padding 22px/1920 = 1.15%；fontSize 38px/1920 = 1.98% */}
              <div style={{position:"relative",display:"flex",alignItems:"center",gap:"1.5%",padding:"1.15% 4%",background:"rgba(0,0,0,.35)",backdropFilter:"blur(8px)",WebkitBackdropFilter:"blur(8px)",borderBottom:"1px solid rgba(255,255,255,.1)"}}>
                {cfg.showAvatar!==false&&avatar&&<img src={avatar} style={{width:"3.33%",aspectRatio:"1",borderRadius:"clamp(3px,.62%,12px)",objectFit:"cover",flexShrink:0}} alt=""/>}
                <span style={{padding:"clamp(1px,.26%,5px) clamp(6px,1.5%,29px)",borderRadius:"clamp(3px,.52%,10px)",background:previewColor+"33",color:previewColor,fontWeight:700,fontSize:"clamp(9px,1.98%,38px)",borderLeft:`2px solid ${previewColor}`,textShadow:"-1px -1px 0 rgba(0,0,0,.6),1px -1px 0 rgba(0,0,0,.6),-1px 1px 0 rgba(0,0,0,.6),1px 1px 0 rgba(0,0,0,.6),0 1px 4px rgba(0,0,0,.4)",fontFamily:"'Noto Sans TC',sans-serif",lineHeight:1.3,display:"inline-flex",alignItems:"center"}}>{previewName||"發話單位"}</span>
                {/* Time 用 marginLeft auto 推到右側，自動被 align-items:center 垂直置中，與職務同高 */}
                <style>{`@keyframes bannerTimeShrinkProfile{0%{width:100%}100%{width:0%}}`}</style>
                <span style={{marginLeft:"auto",padding:"clamp(1px,.26%,5px) clamp(6px,1.5%,29px)",borderRadius:"clamp(3px,.52%,10px)",background:hexToRgba(cfg.bannerTimeColor||"#fbbf24",.12),color:cfg.bannerTimeColor||"#fbbf24",fontWeight:700,fontSize:"clamp(9px,1.98%,38px)",border:`1px solid ${hexToRgba(cfg.bannerTimeColor||"#fbbf24",.25)}`,textShadow:"-1px -1px 0 rgba(0,0,0,.6),1px -1px 0 rgba(0,0,0,.6),-1px 1px 0 rgba(0,0,0,.6),1px 1px 0 rgba(0,0,0,.6),0 1px 4px rgba(0,0,0,.4)",fontFamily:"'Noto Sans TC',sans-serif",overflow:"hidden",position:"relative",display:"inline-flex",alignItems:"center",lineHeight:1.3,flexShrink:0}}>
                  <span style={{position:"absolute",top:0,left:0,bottom:0,background:hexToRgba(cfg.bannerTimeColor||"#fbbf24",.35),animation:"bannerTimeShrinkProfile 18s linear infinite",pointerEvents:"none",zIndex:0}}/>
                  <span style={{position:"relative",zIndex:1}}>{fmtBannerTime("10:30",cfg.bannerTimeFormat)}</span>
                </span>
              </div>
              {/* Sample text */}
              <div style={{padding:"3% 5%",color:cfg.defaultTxtColor||"#fff",fontSize:"clamp(11px,2.5vw,18px)",fontWeight:600,lineHeight:cfg.defaultLineHeight||1.7,textShadow:"-1px -1px 0 rgba(0,0,0,.7),1px -1px 0 rgba(0,0,0,.7),-1px 1px 0 rgba(0,0,0,.7),1px 1px 0 rgba(0,0,0,.7),0 2px 6px rgba(0,0,0,.5)"}}>
                廣播內容預覽文字
              </div>
            </div>{/* content overlay */}
            {/* Disabled overlay — 系統關閉 avatar 時 */}
            {cfg.showAvatar===false&&<div style={{position:"absolute",inset:0,background:"rgba(0,0,0,.72)",backdropFilter:"blur(2px)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:8,zIndex:10,cursor:"default"}}>
              <div style={{fontSize:28,opacity:.8}}><IC.ban s={28}/></div>
              <div style={{fontSize:13,fontWeight:700,color:"#fff",textAlign:"center",padding:"0 20px"}}>系統目前已停用 avatar 顯示</div>
              <div style={{fontSize:11,color:"rgba(255,255,255,.7)",textAlign:"center",padding:"0 20px",lineHeight:1.5}}>此預覽僅供您保留個人頭像紀錄<br/>實際播放端、排程預覽皆不會顯示</div>
              <div style={{fontSize:10,color:"rgba(255,255,255,.5)",marginTop:4,fontStyle:"italic"}}>如需啟用，請洽管理員開啟「系統設定 → 訊息設定 → 顯示發話者頭像」</div>
            </div>}
          </div>{/* 16:9 container */}
        </div>
      </Card>
    </div>

    <div style={{marginTop:16,display:"flex",alignItems:"center",gap:12}}>
      <Btn primary onClick={save} t={th} style={{padding:"8px 24px"}}>{saved?"✓ 已儲存":"儲存設定"}</Btn>
      {saved&&<span style={{fontSize:12,color:th.grn,fontWeight:500}}>✓ 設定已儲存到此裝置</span>}
      {(identities.length>0||avatar)&&<Btn small onClick={clearAll} t={th} style={{color:th.red}}>清除所有設定</Btn>}
    </div>
    <div style={{marginTop:12,padding:"10px 14px",borderRadius:8,background:th.bg2,fontSize:11,color:th.txM,lineHeight:1.8}}>
      <span style={{display:"inline-flex",alignItems:"center",gap:5}}><IC.bulb s={13}/> 所有設定儲存在您的瀏覽器中（localStorage），不同裝置或瀏覽器需要分別設定。</span><br/>
      <span style={{display:"inline-flex",alignItems:"center",gap:5}}><IC.radio s={13}/> 您的 IP：</span><span style={{fontFamily:"monospace",color:th.cyan}}>{myIp}</span>
    </div>
    {cropSrc&&<AvatarCropper src={cropSrc} onDone={onCropDone} onClose={()=>setCropSrc(null)} th={th}/>}
  </div>;
}
