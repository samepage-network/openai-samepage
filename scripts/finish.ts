import fs from "fs";
import {
  OpenAPIRegistry,
  OpenAPIGenerator,
} from "@asteasolutions/zod-to-openapi";
import yaml from "yaml";

const copyAndReplace = ({ file, dest }: { file: string; dest: string }) => {
  const content = fs
    .readFileSync(file)
    .toString()
    .replace(/samepage\.network/g, "samepage.ngrok.io");
  if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
  fs.writeFileSync(`${dest}/${file}`, content);
};

const deploySchemas = async () => {
  const registry = new OpenAPIRegistry();
  const endpoints = fs.readdirSync("src/functions");
  await Promise.all(
    endpoints.map(async (f) => {
      const file = f.replace(/\.ts$/, "");
      const endpoint = await import(`../src/functions/${file}`);
      registry.registerPath({
        method: "post",
        path: `/extensions/openai/${file}`,
        summary: endpoint.summary,
        responses: Object.fromEntries(
          (
            endpoint.responses as {
              status: number;
              description: string;
              schema: any;
            }[]
          ).map((r) => [
            r.status,
            {
              description: r.description,
              content: {
                "application/json": {
                  schema: registry.register(`${file}Response`, r.schema),
                },
              },
            },
          ])
        ),
        request: {
          body: {
            content: {
              "application/json": {
                schema: endpoint.request,
              },
            },
          },
        },
      });
    })
  );
  const generator = new OpenAPIGenerator(registry.definitions, "3.0.1");
  const openApiObject = generator.generateDocument({
    info: {
      title: "SamePage",
      description:
        "A protocol enabling cross-application collaboration through syncing, querying, and more.",
      version: "v1",
    },
    servers: [{ url: "https://api.samepage.network" }],
  });
  fs.writeFileSync("openapi.yaml", yaml.stringify(openApiObject));

  copyAndReplace({
    file: "ai-plugin.json",
    dest: "../samepage.network/public/.well-known",
  });
  copyAndReplace({
    file: "openapi.yaml",
    dest: "../samepage.network/public/data/schemas",
  });
};

deploySchemas().then(() => console.log("Done!"));
