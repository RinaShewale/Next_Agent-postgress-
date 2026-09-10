/**
 * Converts a flat file path list into a nested tree structure.
 *
 * Input:  ["src/App.jsx", "src/index.css", "public/favicon.svg"]
 * Output: [
 *   { name: "src", path: "src", type: "folder", children: [...] },
 *   { name: "public", path: "public", type: "folder", children: [...] }
 * ]
 */
export function buildFileTree(paths) {
  const root = {};

  for (const filePath of paths) {
    const parts = filePath.split('/');
    let current = root;

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const isLast = i === parts.length - 1;

      if (!current[part]) {
        current[part] = isLast
          ? { __type: 'file', __path: filePath }
          : { __type: 'folder', __path: parts.slice(0, i + 1).join('/'), __children: {} };
      }

      if (!isLast) {
        current = current[part].__children;
      }
    }
  }

  function toArray(node, prefix = '') {
    return Object.entries(node).map(([name, value]) => {
      if (value.__type === 'file') {
        return { name, path: value.__path, type: 'file' };
      } else {
        return {
          name,
          path: value.__path,
          type: 'folder',
          children: toArray(value.__children, value.__path),
        };
      }
    }).sort((a, b) => {
      // Folders first, then files, both alphabetically
      if (a.type !== b.type) return a.type === 'folder' ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
  }

  return toArray(root);
}
