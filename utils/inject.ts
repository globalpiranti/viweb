import { parse } from "acorn";
import * as walk from "acorn-walk";
import { Script, createContext } from "vm";
import type { ViwebConfig } from "../types/viweb";

function createPartialFrozenObject<T extends object>(
  target: T,
  immutableKeys: (keyof T)[],
) {
  const immutableSet = new Set<keyof T>(immutableKeys as (keyof T)[]);

  return new Proxy(target, {
    set(obj, prop, value) {
      if (!immutableSet.has(prop as keyof T)) {
        obj[prop as keyof T] = value;
      }
      return true;
    },
    deleteProperty(obj, prop) {
      if (!immutableSet.has(prop as keyof T)) {
        delete obj[prop as keyof T];
      }
      return true;
    },
  });
}

export default function inject(
  userCode: string,
): () => (() => ViwebConfig) & { cleanup: () => void } {
  const currentGlobal = global;

  const dangerousNodeApis = [
    "fs",
    "child_process",
    "net",
    "http",
    "https",
    "dns",
    "os",
    "process",
    "vm",
    "repl",
    "cluster",
    "buffer",
    "path",
    "crypto",
    "timers",
  ];

  const ast = parse(userCode, {
    sourceType: "module",
    ecmaVersion: "latest",
    locations: true,
  });

  walk.simple(ast, {
    ImportDeclaration(node) {
      if (dangerousNodeApis.includes(node.source.value as string)) {
        throw new Error(`Importing "${node.source.value}" is not allowed.`);
      }
    },
    CallExpression(node) {
      if (
        node.callee.type === "Identifier" &&
        node.callee.name === "require" &&
        node.arguments.length > 0 &&
        node.arguments[0].type === "Literal" &&
        dangerousNodeApis.includes(node.arguments[0].value as string)
      ) {
        throw new Error(
          `Requiring "${node.arguments[0].value}" is not allowed.`,
        );
      }
    },
  });

  return (): (() => ViwebConfig) & { cleanup: () => void } => {
    let sandboxes: any = {};

    const immutableKeys: string[] = [];
    for (const key of Reflect.ownKeys(global)) {
      sandboxes[key] = currentGlobal[key as keyof typeof globalThis];
      immutableKeys.push(key as string);
    }

    sandboxes.require = undefined;
    sandboxes.exports = {};
    sandboxes.module = { exports: {} };
    sandboxes.process = {};
    sandboxes.console = {};

    for (const key in console) {
      if (typeof console[key as keyof typeof console] === "function") {
        sandboxes.console[key] = () => {};
      } else {
        sandboxes.console[key] = console[key as keyof typeof console];
      }
    }

    let script: Script | null = new Script(userCode);
    let frozenSandbox: { [key: string]: any } | null =
      createPartialFrozenObject(sandboxes, immutableKeys);
    script.runInContext(createContext(frozenSandbox!));

    return Object.assign(() => frozenSandbox!.module.exports.default, {
      cleanup: () => {
        frozenSandbox = null;
        sandboxes = null;
        script = null;
      },
    });
  };
}
