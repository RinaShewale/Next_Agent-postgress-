import { useEffect, useRef, useState, useCallback } from 'react';
import { io } from 'socket.io-client';

export function useTerminal(agentUrl, { onOutput } = {}) {
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);
  const [reconnectTrigger, setReconnectTrigger] = useState(0);

  const onOutputRef = useRef(onOutput);

  const reconnect = useCallback(() => {
    setReconnectTrigger((prev) => prev + 1);
  }, []);
  useEffect(() => {
    onOutputRef.current = onOutput;
  }, [onOutput]);

  useEffect(() => {
    if (!agentUrl) return;

    let socket;
    let fallbackAttempted = false;
    const match = agentUrl.match(/http:\/\/(.*?)\.agent/);

    if (match && match[1]) {
      const sandboxID = match[1];
      socket = io(window.location.origin, {
        path: `/agent-proxy/${sandboxID}/socket.io`,
        // prefer websocket first to avoid failing on polling when proxy doesn't
        // support long-polling correctly
        transports: ['websocket', 'polling'],
        reconnectionAttempts: 10,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        timeout: 20000,
        autoConnect: true,
      });
    } else {
      socket = io(agentUrl, {
        transports: ['websocket', 'polling'],
        reconnectionAttempts: 10,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        timeout: 20000,
        autoConnect: true,
      });
    }

    socketRef.current = socket;

    socket.on('connect', () => {
      setConnected(true);
      onOutputRef.current?.('\r\n\x1b[32m[Connected to terminal console]\x1b[0m\r\n');
    });

    socket.on('disconnect', () => {
      setConnected(false);
      onOutputRef.current?.('\r\n\x1b[31m[Disconnected from terminal]\x1b[0m\r\n');
    });

    socket.on('terminal-output', (data) => {
      const text = typeof data === 'string' ? data : String(data);
      onOutputRef.current?.(text);
    });

    socket.on('connect_error', (err) => {
      setConnected(false);
      try {
        const msg = err?.message || String(err);
        onOutputRef.current?.(`\r\n\x1b[31m[Connection error: ${msg}]\x1b[0m\r\n`);
        onOutputRef.current?.(`\r\n\x1b[31m[Connection error details: ${JSON.stringify(err)}]\x1b[0m\r\n`);
      } catch (e) {
        onOutputRef.current?.(`\r\n\x1b[31m[Connection error]\x1b[0m\r\n`);
      }
      // eslint-disable-next-line no-console
      console.error('Socket connect_error', err);

      // If we originally tried the proxied path, attempt a direct connection to the agent host as a fallback.
      // This does not change or rewrite the sandbox/auth URLs — it simply tries connecting to the
      // agent host directly when the dev proxy fails to upgrade websockets.
      if (match && match[1] && !fallbackAttempted) {
        fallbackAttempted = true;
        // try connecting directly to agentUrl
        try {
          // clean up previous socket first
          try { socket.removeAllListeners(); socket.disconnect(); } catch (e) {}
          socket = io(agentUrl, {
            transports: ['websocket', 'polling'],
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
            timeout: 20000,
            autoConnect: true,
          });
          socketRef.current = socket;
          socket.on('connect', () => {
            setConnected(true);
            onOutputRef.current?.('\r\n\x1b[32m[Connected to terminal console via direct agent host]\x1b[0m\r\n');
          });
          socket.on('terminal-output', (data) => {
            const text = typeof data === 'string' ? data : String(data);
            onOutputRef.current?.(text);
          });
          socket.on('connect_error', (e2) => {
            // log secondary error
            onOutputRef.current?.(`\r\n\x1b[31m[Direct connect error: ${e2?.message || String(e2)}]\x1b[0m\r\n`);
            // eslint-disable-next-line no-console
            console.error('Direct socket connect_error', e2);
          });
        } catch (e) {
          // eslint-disable-next-line no-console
          console.error('Fallback direct connection failed', e);
        }
      }
    });

    // If websocket transport fails repeatedly, try a polling-only fallback to accommodate proxies
    // that do not support websocket upgrades.
    let pollingFallbackAttempted = false;
    socket.on('error', (err) => {
      // socket.io sometimes emits 'error' with transport details
      // eslint-disable-next-line no-console
      console.debug('Socket error event', err);
    });

    socket.on('connect_failed', (err) => {
      // legacy event, just log
      // eslint-disable-next-line no-console
      console.debug('Socket connect_failed', err);
    });

    socket.on('reconnect_failed', () => {
      if (!pollingFallbackAttempted) {
        pollingFallbackAttempted = true;
        try {
          // try polling-only transport
          try { socket.removeAllListeners(); socket.disconnect(); } catch (e) {}
          socket = io(agentUrl || window.location.origin, {
            transports: ['polling'],
            reconnectionAttempts: 3,
            reconnectionDelay: 1000,
            timeout: 20000,
            autoConnect: true,
          });
          socketRef.current = socket;
          socket.on('connect', () => {
            setConnected(true);
            onOutputRef.current?.('\r\n\x1b[32m[Connected to terminal console via polling fallback]\x1b[0m\r\n');
          });
          socket.on('terminal-output', (data) => {
            const text = typeof data === 'string' ? data : String(data);
            onOutputRef.current?.(text);
          });
          socket.on('connect_error', (e2) => {
            onOutputRef.current?.(`\r\n\x1b[31m[Polling direct connect error: ${e2?.message || String(e2)}]\x1b[0m\r\n`);
            // eslint-disable-next-line no-console
            console.error('Polling direct socket connect_error', e2);
          });
        } catch (e) {
          // eslint-disable-next-line no-console
          console.error('Polling fallback failed', e);
        }
      }
    });

    return () => {
      try {
        socket.removeAllListeners();
      } catch (e) {}
      try {
        socket.disconnect();
      } catch (e) {}
      socketRef.current = null;
    };
  }, [agentUrl, reconnectTrigger]);

  const sendCommand = useCallback((data) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('terminal-input', data);
    }
  }, []);

  return { connected, sendCommand, reconnect };
}

