import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],

  server: {
    proxy: {
      "/api": {
        target: "http://localhost",
        changeOrigin: true,
        secure: false,
      },

      "/agent-proxy": {
        target: "http://localhost",
        changeOrigin: false,
        secure: false,
        ws: true,
        rewrite: (path) => {
          const r = path.replace(/^\/agent-proxy\/[^/]+/, "");
          return r === "" ? "/" : r;
        },

        configure: (proxy) => {
          proxy.on("proxyReq", (proxyReq, req) => {
            const match = (req.originalUrl || req.url).match(
              /^\/agent-proxy\/([^/]+)/
            );

            if (match) {
              proxyReq.setHeader("host", `${match[1]}.agent.localhost`);
              proxyReq.setHeader("Host", `${match[1]}.agent.localhost`);
            }
          });

          proxy.on("proxyReqWs", (proxyReq, req, socket, options, head) => {
            const match = (req.originalUrl || req.url).match(
              /^\/agent-proxy\/([^/]+)/
            );

            if (match) {
              proxyReq.setHeader("host", `${match[1]}.agent.localhost`);
              proxyReq.setHeader("Host", `${match[1]}.agent.localhost`);
            }
          });

          proxy.on("error", (err) => {
            if (err.code !== "ECONNABORTED" && err.code !== "ECONNRESET") {
              console.error("Agent Proxy Error:", err.message);
            }
          });

          proxy.on("proxySocketError", (err) => {
            if (err.code !== "ECONNABORTED" && err.code !== "ECONNRESET") {
              console.error("Agent Proxy Socket Error:", err.message);
            }
          });
        },
      },

      "/preview-proxy": {
        target: "http://127.0.0.1:3000",
        changeOrigin: false,
        secure: false,
        ws: true,
        rewrite: (path) => {
          const r = path.replace(/^\/preview-proxy\/[^/]+/, "");
          return r === "" ? "/" : r;
        },

        configure: (proxy) => {
          proxy.on("proxyReq", (proxyReq, req) => {
            const match = (req.originalUrl || req.url).match(
              /^\/preview-proxy\/([^/]+)/
            );

            if (match) {
              proxyReq.setHeader("host", `${match[1]}.preview.localhost`);
              proxyReq.setHeader("Host", `${match[1]}.preview.localhost`);
            }
          });

          proxy.on("proxyReqWs", (proxyReq, req, socket, options, head) => {
            const match = (req.originalUrl || req.url).match(
              /^\/preview-proxy\/([^/]+)/
            );

            if (match) {
              proxyReq.setHeader("host", `${match[1]}.preview.localhost`);
              proxyReq.setHeader("Host", `${match[1]}.preview.localhost`);
            }
          });

          proxy.on("error", (err) => {
            if (err.code !== "ECONNABORTED" && err.code !== "ECONNRESET") {
              console.error("Preview Proxy Error:", err.message);
            }
          });

          proxy.on("proxySocketError", (err) => {
            if (err.code !== "ECONNABORTED" && err.code !== "ECONNRESET") {
              console.error("Preview Proxy Socket Error:", err.message);
            }
          });
        },
      },
    },
  },
});