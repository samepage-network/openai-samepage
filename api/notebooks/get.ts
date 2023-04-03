import zod from "../../src/utils/zod";
import apiClient from "samepage/internal/apiClient";
import createAPIGatewayProxyHandler from "samepage/backend/createAPIGatewayProxyHandler";

const schema = zod.object({
  notebooks: zod
    .object({
      uuid: zod.string().openapi({ description: "The notebook's UUID" }),
      workspace: zod.string().openapi({
        description: "The name of the workspace this notebook represents.",
      }),
      appName: zod.string().openapi({
        description: "The name of the application this notebook is a part of.",
      }),
      email: zod.string().openapi({
        description: "The email address of the user who owns this notebook.",
      }),
    })
    .array()
    .openapi({ description: "Notebooks this account has access to." }),
});

export const responses = [
  {
    schema,
    description: "A list of notebooks this account has access to",
    status: 200,
  },
];

export const summary = "List all of the notebooks this user has access to on the SamePage Network";

type ZodResponse = zod.infer<typeof schema>;

export const request = zod.object({});

const logic = async ({
  authorization,
}: {
  authorization: string;
}): Promise<ZodResponse> => {
  return apiClient<ZodResponse>({
    method: "list-recent-notebooks",
    token: authorization.replace(/^Bearer /, ""),
    notebookUuid: "openai",
  });
};

export default createAPIGatewayProxyHandler(logic);
