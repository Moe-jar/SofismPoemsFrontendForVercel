const fs = require("node:fs/promises");
const postcss = require("postcss");
const autoprefixer = require("autoprefixer");

const inputPath = "css/output.css";
const insetFallback = {
  postcssPlugin: "inset-fallback",
  Declaration(decl) {
    if (decl.prop !== "inset") return;
    const values = decl.value.trim().split(/\s+/);
    const top = values[0];
    const right = values[1] || top;
    const bottom = values[2] || top;
    const left = values[3] || right;
    decl.cloneBefore({ prop: "top", value: top });
    decl.cloneBefore({ prop: "right", value: right });
    decl.cloneBefore({ prop: "bottom", value: bottom });
    decl.cloneBefore({ prop: "left", value: left });
  },
};

async function main() {
  const css = await fs.readFile(inputPath, "utf8");
  const result = await postcss([insetFallback, autoprefixer()]).process(css, {
    from: inputPath,
    to: inputPath,
  });
  await fs.writeFile(inputPath, result.css);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
