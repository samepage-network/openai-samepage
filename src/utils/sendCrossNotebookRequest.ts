import setupSamePageClient from "samepage/protocols/setupSamePageClient";
import WebSocket from "ws";
// @ts-ignore
global.WebSocket = WebSocket;

const sendCrossNotebookRequest = async <T>({
  authorization,
  label,
  targets,
  request,
}: {
  authorization: string;
  label: string;
  targets: string[];
  request: Record<string, unknown>;
}) => {
  const settings = {
    token: authorization.replace(/^Bearer /, ""),
    uuid: "openai",
  };
  const { sendNotebookRequest, unload } = setupSamePageClient({
    getSetting: (s) => settings[s],
  });
  const responseData = await new Promise<Record<string, T>>((resolve) => {
    let responses = 0;
    let noResponseTimeout = setTimeout(() => {
      resolve({});
    }, 3000);
    sendNotebookRequest({
      label,
      targets,
      request,
      onResponse: (data) => {
        const responseData = data as Record<string, T>;
        if (responses === 0) {
          clearTimeout(noResponseTimeout);
          if (
            Object.values(responseData).some(
              (r) => (r as T | "rejected") !== "rejected"
            )
          ) {
            noResponseTimeout = setTimeout(() => {
              resolve(responseData);
            }, 2500);
          } else {
            resolve(responseData);
          }
        } else if (responses === 1) {
          clearTimeout(noResponseTimeout);
          resolve(responseData);
        }
        responses++;
      },
    });
  });
  unload();
  return responseData;
};

export default sendCrossNotebookRequest;
