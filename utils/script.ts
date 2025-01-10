import * as esbuild from "esbuild";
import ws from "./ws";

function script() {
  const scripts: Map<string, string> = new Map();

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

  const build = (path: string) => {
    return new Promise<void>(async (resolve) => {
      const file = await findFile(path);
      if (!file) return null;

      const ctx = await esbuild.context({
        entryPoints: [path],
        bundle: true,
        format: "iife",
        target: ["es2017"],
        platform: "browser",
        write: false,
        plugins: [
          {
            name: "rebuild-notify",
            setup(build) {
              build.onEnd((result) => {
                if (!result.errors.length && result.outputFiles?.length) {
                  scripts.set(path, result.outputFiles[0].text);
                } else {
                  scripts.delete(path);
                }

                ws.reload();
                resolve();
              });
            },
          },
        ],
      });

      await ctx.watch();
    });
  };

  const get = async (path: string) => {
    if (!scripts.has(path)) await build(path);

    return scripts.get(path);
  };

  return get;
}

export default script();
