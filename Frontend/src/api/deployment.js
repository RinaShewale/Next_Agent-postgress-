import api from "./api";

export const deployProject = async (projectId) => {
    const response = await api.post(
        `/api/deployment/${projectId}`
    );

    return response.data;
};