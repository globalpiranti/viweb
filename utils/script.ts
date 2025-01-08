import * as esbuild from "esbuild";

const findFile = async (path: string) => {
  const tsFile = path.replace(/\.js$/, ".ts");
  const tsxFile = path.replace(/\.js$/, ".tsx");
  if (await Bun.file(tsFile).exists()) {
    return tsFile;
  }

  if (await Bun.file(tsxFile).exists()) {
    return tsxFile;
  }

  return null;
};

export default async function script(path: string) {
  const file = await findFile(path);
  if (!file) return null;

  return esbuild
    .build({
      entryPoints: [path],
      bundle: true,
      format: "iife",
      target: ["es2017"],
      platform: "browser",
      write: false,
    })
    .then((data) => {
      return data.outputFiles[0].text;
    });
}
