import ora from "ora";
import { rmSync, cpSync } from "node:fs";
import { resolve, join } from "node:path";
import * as esbuild from "esbuild";
import fg from "fast-glob";
import inject from "./utils/inject";

const distPath = resolve("dist");
const sourcePath = resolve();

const removeDist = async () => {
  if (!(await Bun.file(distPath).exists)) return;

  const loader = ora("Clearing dist directory...").start();
  rmSync(distPath, {
    recursive: true,
  });
  loader.succeed("Output dist cleared");
};

const buildConfig = async () => {
  const loader = ora("Bundling config file...").start();

  try {
    const injection = inject(
      await esbuild
        .build({
          entryPoints: [join(sourcePath, "viweb.config.ts")],
          platform: "browser",
          format: "cjs",
          bundle: true,
          write: false,
          external: ["axios"],
        })
        .then((result) => result.outputFiles![0].text),
    )();
    injection.cleanup();
  } catch (e) {
    loader.fail("Viweb configuration invalid");
    throw e;
  }

  await esbuild.build({
    entryPoints: [join(sourcePath, "viweb.config.ts")],
    platform: "browser",
    format: "cjs",
    bundle: true,
    outfile: join(distPath, "config.js"),
    external: ["axios"],
  });

  loader.succeed("Bundle config done");
};

const buildScripts = async () => {
  const loader = ora("Bundling script files...").start();

  const files = await fg(
    join(sourcePath, "src", "scripts", "**", "*.{ts,tsx}"),
  );

  await esbuild.build({
    entryPoints: files,
    bundle: true,
    format: "iife",
    target: ["es2017"],
    platform: "browser",
    outdir: join(distPath, "scripts"),
  });

  loader.succeed("Build all script files done");
};

const copyEdges = async () => {
  const loader = ora("Copying edge.js files...").start();

  await cpSync(join(sourcePath, "src", "edges"), join(distPath, "edges"), {
    recursive: true,
  });

  loader.succeed("All edge.js files copied");
};

const copyPublic = async () => {
  const loader = ora("Copying public files...").start();

  await cpSync(join(sourcePath, "public"), join(distPath, "public"), {
    recursive: true,
  });

  loader.succeed("All public files copied");
};

(async () => {
  await removeDist();
  await buildConfig();
  await buildScripts();
  await copyEdges();
  await copyPublic();

  process.exit(0);
})();
