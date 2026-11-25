// Full screen pixel density (iPhones are 3x). Capped at 3 to keep canvas size sane.
export const DPR = Math.min(window.devicePixelRatio || 1, 3);

export const THEMES = {
  dos: {
    name: 'dos', bg: '#030a05', font: 'VT323', body: 'VT323',
    ink: '#3dff7a', dim: '#2fd35f', accent: '#3dff7a',
    panel: '#030a05', panelStroke: '#3dff7a', btnFill: '#3dff7a', btnInk: '#030a05',
    chipOn: { fill: '#3dff7a', ink: '#030a05' }, party: ['#3dff7a', '#b6ffcc', '#1f8a45'], year: '1981',
  },
  y2k: {
    name: 'y2k', bg: '#2a7f86', font: 'Silkscreen', body: 'Verdana, Tahoma, sans-serif',
    ink: '#111111', dim: '#2b2b2b', accent: '#1036a8',
    panel: '#c9c6bd', panelStroke: '#ffffff', btnFill: '#c9c6bd', btnInk: '#111111',
    chipOn: { fill: '#1036a8', ink: '#ffffff', pressed: true }, party: ['#ffd23f', '#1036a8', '#e5383b', '#31c45a'], year: '2003',
  },
  cloud: {
    name: 'cloud', bg: '#e9edf2', font: 'Figtree', body: 'Figtree',
    ink: '#1b2330', dim: '#4a5668', accent: '#2f6fed',
    panel: '#ffffff', panelStroke: '#d5dbe4', btnFill: '#2f6fed', btnInk: '#ffffff',
    chipOn: { fill: '#2f6fed', ink: '#ffffff' }, party: ['#2f6fed', '#ff5a5f', '#ffc145', '#31c45a'], year: '2015',
  },
  ai: {
    name: 'ai', bg: '#060d2b', font: 'Unbounded', body: 'Manrope',
    ink: '#f2f6ff', dim: '#b7c4e8', accent: '#00c7fd',
    panel: '#0c1846', panelStroke: '#00c7fd', btnFill: '#00c7fd', btnInk: '#04102e',
    chipOn: { fill: '#00c7fd', ink: '#04102e' }, party: ['#00c7fd', '#ffc145', '#ff5fa2', '#2ef2c8'], year: '2026',
  },
};

export const ENGINE_COLORS = { CPU: '#ffc145', GPU: '#ff5fa2', NPU: '#2ef2c8' };

export const hex = (s) => parseInt(s.slice(1), 16);
