import { useState } from "react";

import { deployProject } from "../api/deployment";

const useDeployProject = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [data, setData] = useState(null);

    const deploy = async (projectId) => {
        try {
            setLoading(true);
            setError(null);

            const response = await deployProject(projectId);

            setData(response);

            return response;

        } catch (err) {

            const message =
                err.response?.data?.message ||
                err.message ||
                "Failed to deploy project";

            setError(message);

            throw err;

        } finally {

            setLoading(false);
        }
    };

    return {
        deploy,
        loading,
        error,
        data,
    };
};

export default useDeployProject;