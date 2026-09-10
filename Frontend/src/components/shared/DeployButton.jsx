import { Zap } from "lucide-react";

import useDeployProject from "../../hooks/useDeployProject";

const DeployButton = ({ projectId }) => {
    const {
        deploy,
        loading,
    } = useDeployProject();

    const handleDeploy = async () => {
        if (!projectId) {
            console.error("Project ID is missing");
            return;
        }

        try {
            await deploy(projectId);

            console.log("🚀 Deployment started successfully");

        } catch (error) {
            console.error(
                "❌ Deployment failed:",
                error
            );
        }
    };

    return (
        <button
            onClick={handleDeploy}
            disabled={loading}
            className="
                flex
                items-center
                gap-2
                px-5
                py-2.5
                bg-[#34170A]
                hover:bg-[#A35100]
                disabled:opacity-60
                disabled:cursor-not-allowed
                text-[#FDF3E4]
                rounded-xl
                text-[10px]
                font-bold
                uppercase
                tracking-[0.15em]
                transition-all
                active:scale-95
                shadow-md
                shrink-0
            "
        >
            <Zap
                size={14}
                fill="currentColor"
            />

            <span>
                {loading
                    ? "Deploying..."
                    : "Deploy Vision"}
            </span>
        </button>
    );
};

export default DeployButton;