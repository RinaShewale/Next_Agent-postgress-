const BASE_URL = "http://localhost/api";

/**
 * POST http://localhost/api/sandbox/start
 * Returns { sandboxID, previewUrl, agentUrl }
 */
export async function startSandbox(prompt, retries = 6, delayMs = 2500) {
  const url = `${BASE_URL}/sandbox/start`;
  let lastError;

  for (let attempt = 1; attempt <= retries; attempt++) {
    const controller = new AbortController();

    // IMPORTANT: must exceed the backend's waitForPodReady() worst-case
    // duration (60 retries * 3000ms = 180s = 3 min) with a safety margin,
    // otherwise the frontend aborts the request right as the backend is
    // about to succeed, producing a false "timed out" error.
    const TIMEOUT_MS = 4 * 60 * 1000; // 4 minutes
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
      console.log('[Sandbox] Request URL:', url);
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        signal: controller.signal,
        body: JSON.stringify({ prompt }),
      });

      if (!res.ok) {
        const errorText = await res.text().catch(() => '');
        const status = res.status;

        if ([502, 503, 504].includes(status) && attempt < retries) {
          console.warn(
            `[Sandbox] Attempt ${attempt}/${retries} returned ${status}. Backend may still be warming up. Retrying in ${delayMs * attempt}ms...`
          );
          await new Promise((resolve) => setTimeout(resolve, delayMs * attempt));
          continue;
        }

        const friendlyMessage = status === 502
          ? `Sandbox backend returned 502 Bad Gateway at ${url}. The backend may be unavailable or still starting.`
          : status === 503 || status === 504
          ? `Sandbox backend returned ${status}. The backend may be under load or warming up.`
          : `Failed to start sandbox (${status}): ${errorText || 'Server error'}`;

        throw new Error(friendlyMessage);
      }

      const data = await res.json();
      console.log('[Sandbox] Started successfully:', data.sandboxID);
      return data;
    } catch (err) {
      if (err.name === 'AbortError') {
        throw new Error('Sandbox creation timed out. The backend is still provisioning; please wait a moment and refresh.');
      }

      lastError = err;
      const networkError = err instanceof TypeError || /Failed to fetch|NetworkError|ECONNREFUSED|ECONNRESET|CORS/i.test(err.message);
      const retryable = networkError || /502|503|504/.test(err.message);

      if (attempt < retries && retryable) {
        console.warn(`[Sandbox] Attempt ${attempt}/${retries} failed: ${err.message}. Retrying in ${delayMs * attempt}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delayMs * attempt));
        continue;
      }

      if (networkError) {
        throw new Error(
          `Unable to reach sandbox backend at ${url}. Confirm the sandbox router/backend is running and ${BASE_URL === '/api' ? 'that your dev proxy targets http://localhost:3000' : 'that your VITE_SANDBOX_API_URL is correct'}.`
        );
      }

      throw err;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  throw lastError || new Error('Failed to start sandbox after retries.');
}

/**
 * GET http://localhost/api/sandbox/projects
 * Returns { success, projects: [{ _id, user, title, createdAt, updatedAt }] }
 */
export async function getProjects() {
  const res = await fetch(`${BASE_URL}/sandbox/projects`, {
    method: 'GET',
    credentials: 'include',
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Failed to fetch projects (${res.status}): ${text}`);
  }
  return res.json();
}

/**
 * Checks if the agent is responsive.
 * Note: agentUrl usually points to a different subdomain.
 */
export async function checkSandboxAlive(agentUrl) {
  if (!agentUrl) return false;
  try {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), 3000);

    const res = await fetch(`${agentUrl}/list-files`, { signal: controller.signal });
    clearTimeout(id);
    return res.ok;
  } catch (err) {
    console.warn('[Sandbox] Agent not reachable yet...');
    return false;
  }
}