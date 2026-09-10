const EXT_MAP = {
  // Web
  js: { icon: '󰌞', color: '#f0db4f' },
  jsx: { icon: '󰜈', color: '#61dafb' },
  ts: { icon: '󰛦', color: '#3178c6' },
  tsx: { icon: '󰜈', color: '#3178c6' },
  html: { icon: '󰌝', color: '#e44d26' },
  css: { icon: '󰌜', color: '#264de4' },
  json: { icon: '󰘦', color: '#cbcb41' },
  md: { icon: '󰍔', color: '#519aba' },
  svg: { icon: '󰜡', color: '#ffb13b' },
  png: { icon: '󰋩', color: '#a074c4' },
  jpg: { icon: '󰋩', color: '#a074c4' },
  jpeg: { icon: '󰋩', color: '#a074c4' },
  gif: { icon: '󰋩', color: '#a074c4' },
  // Config
  env: { icon: '󰙪', color: '#ecc94b' },
  yaml: { icon: '󰙩', color: '#cb171e' },
  yml: { icon: '󰙩', color: '#cb171e' },
  toml: { icon: '󰙩', color: '#9c4221' },
  lock: { icon: '󰌾', color: '#6b7280' },
  // Misc
  dockerfile: { icon: '󰡨', color: '#0db7ed' },
  sh: { icon: '󰆍', color: '#89e051' },
  txt: { icon: '󰈙', color: '#9ca3af' },
};

const FILENAME_MAP = {
  dockerfile: { icon: '󰡨', color: '#0db7ed' },
  '.dockerignore': { icon: '󰡨', color: '#0db7ed' },
  '.gitignore': { icon: '󰊢', color: '#f14e32' },
  'package.json': { icon: '󰎙', color: '#cb3837' },
  'vite.config.js': { icon: '󱐋', color: '#bd34fe' },
  'tailwind.config.js': { icon: '󱏿', color: '#38bdf8' },
};

export function getFileIcon(name) {
  const lower = name.toLowerCase();
  if (FILENAME_MAP[lower]) return FILENAME_MAP[lower];
  const ext = lower.split('.').pop();
  return EXT_MAP[ext] ?? { icon: '󰈙', color: '#9ca3af' };
}

export function getLanguage(filename) {
  const ext = filename.split('.').pop()?.toLowerCase();
  const langMap = {
    js: 'javascript',
    jsx: 'jsx',
    ts: 'typescript',
    tsx: 'tsx',
    html: 'html',
    css: 'css',
    json: 'json',
    md: 'markdown',
    sh: 'bash',
    yaml: 'yaml',
    yml: 'yaml',
    toml: 'toml',
    py: 'python',
  };
  return langMap[ext] ?? 'plaintext';
}
