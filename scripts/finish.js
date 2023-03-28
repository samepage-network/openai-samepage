const fs = require("fs");

const copyAndReplace = ({ file, dest }) => {
  const content = fs
    .readFileSync(file)
    .toString()
    .replace(/samepage\.network/g, "samepage.ngrok.io");
  if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
  fs.writeFileSync(`${dest}/${file}`, content);
};

// module.exports = () => {
copyAndReplace({
  file: "ai-plugin.json",
  dest: "../samepage.network/public/.well-known",
});
copyAndReplace({
  file: "openapi.yaml",
  dest: "../samepage.network/public/data/schemas",
});
// };
