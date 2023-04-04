import fs from "fs";
import {
  OpenAPIRegistry,
  OpenAPIGenerator,
} from "@asteasolutions/zod-to-openapi";
import yaml from "yaml";
import readDir from "samepage/scripts/internal/readDir";

const copyAndReplace = ({
  file,
  dest,
  replacements,
}: {
  file: string;
  dest: string;
  replacements: { source: RegExp; target: string }[];
}) => {
  const content = replacements.reduce(
    (p, c) => p.replace(c.source, c.target),
    fs.readFileSync(file).toString()
  );
  if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
  fs.writeFileSync(`${dest}/${file}`, content);
};

const deploySchemas = async () => {
  const registry = new OpenAPIRegistry();
  const endpoints = readDir("api");
  await Promise.all(
    endpoints.map(async (f) => {
      const file = f.replace(/\.ts$/, "").replace(/^api\//, "");
      const endpoint = await import(`../api/${file}`);
      const fileParts = file.split("/");
      const method = fileParts.slice(-1)[0];
      if (method === "get" || method === "post" || method === "put") {
        registry.registerPath({
          operationId: fileParts.slice(0, -1).join("-"),
          method,
          path: `/extensions/openai/${fileParts.slice(0, -1).join("/")}`,
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
          request:
            method === "get"
              ? undefined
              : {
                  body: {
                    content: {
                      "application/json": {
                        schema: endpoint.request,
                      },
                    },
                  },
                },
        });
      }
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

  if (process.env.NODE_ENV !== "production") {
    copyAndReplace({
      file: "ai-plugin.json",
      dest: "../samepage.network/public/.well-known",
      replacements: [
        { source: /samepage\.network/g, target: "samepage.ngrok.io" },
        {
          source: /"name_for_human": "SamePage"/,
          target: `"name_for_human": "SamePage (DEV)"`,
        },
        {
          source: /"name_for_model": "samepage"/g,
          target: `"name_for_model": "samepage-dev"`,
        },
      ],
    });
    copyAndReplace({
      file: "openapi.yaml",
      dest: "../samepage.network/public/data/schemas",
      replacements: [
        { source: /samepage\.network/g, target: "samepage.ngrok.io" },
      ],
    });
  }
};

deploySchemas().then(() => console.log("Done!"));
