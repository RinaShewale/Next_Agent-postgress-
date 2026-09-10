import { create } from 'zustand';

const STORAGE_KEY = 'nexxagent_sandbox_v2';

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);

    if (!raw) return null;

    return JSON.parse(raw);
  } catch {}

  return null;
}

function saveToStorage(data) {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(data)
    );
  } catch {}
}

const useSandboxStore = create((set, get) => ({

  sandboxID: null,

  projectId: null, // ✅ ADD THIS

  previewUrl: null,

  agentUrl: null,

  status: 'idle',

  error: null,

  errorAt: null,

  previewKey: 0,

  triggerPreviewReload: () =>
    set((state) => ({
      previewKey: state.previewKey + 1
    })),

  viewState: 'landing',

  initialPrompt: '',

  elapsedTime: 0,

  generatedFiles: [
    { name: 'metadata.json', status: 'done' },
    { name: 'package.json', status: 'done' }
  ],

  setInitialPrompt: (prompt) =>
    set({
      initialPrompt: prompt
    }),

  setViewState: (viewState) =>
    set({
      viewState
    }),

  setElapsedTime: (time) =>
    set({
      elapsedTime: time
    }),

  setGeneratedFiles: (files) =>
    set({
      generatedFiles: files
    }),

  // ✅ Store project ID separately
  setProjectId: (projectId) => {

    saveToStorage({
      sandboxID: get().sandboxID,
      projectId,
      previewUrl: get().previewUrl,
      agentUrl: get().agentUrl,
      initialPrompt: get().initialPrompt
    });

    set({
      projectId
    });
  },

  setSandbox: ({
    sandboxID,
    projectId,
    previewUrl,
    agentUrl
  }) => {

    const nextState = {

      sandboxID,

      projectId, // ✅ ADD

      previewUrl,

      agentUrl,

      status: 'ready',

      error: null,

      errorAt: null,

      viewState: 'editor'
    };

    saveToStorage({
      sandboxID,
      projectId, // ✅ ADD
      previewUrl,
      agentUrl,
      initialPrompt: get().initialPrompt
    });

    set(nextState);
  },

  setStatus: (status) =>
    set({
      status
    }),

  setError: (error) =>
    set({
      error,
      errorAt: Date.now(),
      status: 'error',
      viewState: 'landing'
    }),

  reset: () => {

    localStorage.removeItem(STORAGE_KEY);

    set({

      sandboxID: null,

      projectId: null, // ✅ ADD

      previewUrl: null,

      agentUrl: null,

      status: 'idle',

      error: null,

      errorAt: null,

      viewState: 'landing',

      initialPrompt: '',

      elapsedTime: 0,

      generatedFiles: []

    });
  },

  restoreFromStorage: () => {

    const saved = loadFromStorage();

    if (saved && saved.sandboxID) {

      set({

        sandboxID: saved.sandboxID,

        projectId: saved.projectId || null, // ✅ ADD

        previewUrl: saved.previewUrl,

        agentUrl: saved.agentUrl,

        initialPrompt:
          saved.initialPrompt || '',

        status: 'ready',

        viewState: 'editor'

      });

      return true;
    }

    return false;
  }

}));

export default useSandboxStore;