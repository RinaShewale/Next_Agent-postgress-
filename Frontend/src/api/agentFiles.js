import axios from 'axios';

export function getAgentBaseUrl(agentUrl) {
  if (!agentUrl) return '';
  const match = agentUrl.match(/http:\/\/(.*?)\.agent/);
  if (match && match[1]) {
    return `/agent-proxy/${match[1]}`;
  }
  return agentUrl;
}

export const listFiles = async (agentUrl) => {
  const baseUrl = getAgentBaseUrl(agentUrl);
  const res = await axios.get(`${baseUrl}/list-files`);
  return res.data?.files || [];
};

export const readFile = async (agentUrl, filePath) => {
  const baseUrl = getAgentBaseUrl(agentUrl);
  const res = await axios.get(`${baseUrl}/read-file?files=${encodeURIComponent(filePath)}`);
  const files = res.data?.files;
  if (!files || files.length === 0) return '';
  const first = files[0];
  if (typeof first === 'string') return first;
  if (typeof first === 'object' && first !== null) {
    if (first[filePath] !== undefined) return first[filePath];
    const leadingSlash = filePath.startsWith('/') ? filePath : `/${filePath}`;
    if (first[leadingSlash] !== undefined) return first[leadingSlash];
    const noLeadingSlash = filePath.startsWith('/') ? filePath.slice(1) : filePath;
    if (first[noLeadingSlash] !== undefined) return first[noLeadingSlash];
    return Object.values(first)[0] ?? '';
  }
  return '';
};

export const updateFiles = async (agentUrl, updates) => {
  const baseUrl = getAgentBaseUrl(agentUrl);
  const res = await axios.patch(`${baseUrl}/update-files`, { updates });
  return res.data;
};

export const updateFile = async (agentUrl, filePath, content) => {
  return updateFiles(agentUrl, [{ file: filePath, content }]);
};