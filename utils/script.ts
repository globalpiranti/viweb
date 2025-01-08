import * as esbuild from "esbuild";

export default async function script(path: string) {
  const file = Bun.file(path);
  if (!(await file.exists())) return null;

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
