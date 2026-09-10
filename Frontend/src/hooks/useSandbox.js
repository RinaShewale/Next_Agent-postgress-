import { useEffect } from 'react';
import { startSandbox } from '../api/sandbox';
import useSandboxStore from '../store/sandboxStore';

export function useSandbox() {

  const {
    status,
    setSandbox,
    setStatus,
    setError,
    restoreFromStorage,
    setViewState
  } = useSandboxStore();


  useEffect(() => {

    restoreFromStorage();

  }, []);


  const triggerStartSandbox = async (prompt) => {

    setStatus('loading');

    setViewState('generating');

    try {

      const data =
        await startSandbox(prompt);


      if (!data || !data.sandboxID) {

        throw new Error(
          'Sandbox service did not return a valid sandbox session.'
        );

      }


      setSandbox({

        sandboxID:
          data.sandboxID,

        previewUrl:
          data.previewUrl,

        agentUrl:
          data.agentUrl,

        projectId:
          data.projectId,

      });

      setStatus('ready');

      setViewState('editor');


      return data;


    } catch (err) {

      console.error(
        '[useSandbox] error:',
        err
      );


      const message =
        err?.message ||
        'Failed to start sandbox';


      setError(message);

      setStatus('error');

      setViewState('generating');


      return null;

    }

  };


  return {

    status,

    triggerStartSandbox,

  };

}