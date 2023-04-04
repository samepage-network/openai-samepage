const { S3 } = require("@aws-sdk/client-s3");
const fs = require("fs");

module.exports = async () => {
  const s3 = new S3({});
  await s3.putObject({
    Bucket: "samepage.network",
    Key: ".well-known/ai-plugin.json",
    Body: fs.createReadStream("ai-plugin.json"),
    ContentType: "application/json",
  });
  console.log("Uploaded ai-plugin.json to SamePage");
  await s3.putObject({
    Bucket: "samepage.network",
    Key: "data/schemas/openapi.yaml",
    Body: fs.createReadStream("openapi.yaml"),
    ContentType: "application/yaml",
  });
  console.log("Uploaded openapi.yaml to SamePage");
};
