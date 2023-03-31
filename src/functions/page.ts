import createAPIGatewayProxyHandler from "samepage/backend/createAPIGatewayProxyHandler";
import { zInitialSchema } from "samepage/internal/types";
import zod from "../utils/zod";
import requestStatuses from "../utils/requestStatuses";
import sendCrossNotebookRequest from "src/utils/sendCrossNotebookRequest";

const zResponseData = zInitialSchema.or(requestStatuses);

const response = zod.object({
  data: zResponseData,
});

export const responses = [
  {
    schema: response,
    description: "Page data in the SamePage AtJson format",
    status: 200,
  },
];

export const summary = "Get the content from a single page";

export const request = zod
  .object({
    notebookUuid: zod.string().openapi({
      description: "The application to request. Must be in UUID format.",
    }),
    notebookPageId: zod
      .string()
      .openapi({ description: "The page from the application to request" }),
  })
  .openapi({
    description: "The application and the page from the application to request",
  });

const logic = async (
  data: zod.infer<typeof request> & { authorization: string }
): Promise<zod.infer<typeof response>> => {
  const { notebookUuid, notebookPageId } = data;
  const responseData = await sendCrossNotebookRequest<
    zod.infer<typeof zResponseData>
  >({
    authorization: data.authorization,
    label: notebookPageId,
    targets: [notebookUuid],
    request: { notebookPageId },
  });
  return {
    data: responseData[notebookUuid],
  };
};

export default createAPIGatewayProxyHandler({ logic, bodySchema: request });
