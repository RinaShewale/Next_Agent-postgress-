import { useState, useCallback } from 'react';
import { listFiles } from '../api/agentFiles';
import { buildFileTree } from '../utils/buildFileTree';

export function useFileTree(agentUrl) {
  const [tree, setTree] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    if (!agentUrl) return;
    setLoading(true);
    setError(null);
    try {
      const paths = await listFiles(agentUrl);
      setTree(buildFileTree(paths));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [agentUrl]);

  return { tree, loading, error, refresh };
}
