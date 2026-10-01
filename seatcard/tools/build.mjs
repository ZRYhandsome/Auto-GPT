// 打包成一个可以双击打开的 HTML 文件：dist/座次桌签.html
// 浏览器不允许 file:// 页面加载 ES 模块，所以把各模块包成函数、按依赖顺序内联，样式和图标也内联。
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const IMPORT = /^import\s*\{([^}]+)\}\s*from\s*'\.\/(\w+)\.js';\s*$/gm;

// 从 app.js 出发按 import 关系排好顺序：被依赖的模块在前
function moduleOrder(entry) {
  const order = [];
  const state = new Map();
  const visit = (name, chain) => {
    if (state.get(name) === 'done') return;
    if (state.get(name) === 'visiting') throw new Error(`模块循环依赖：${[...chain, name].join(' → ')}`);
    state.set(name, 'visiting');
    const code = readFileSync(path.join(root, 'src', `${name}.js`), 'utf8');
    for (const m of code.matchAll(IMPORT)) visit(m[2], [...chain, name]);
    state.set(name, 'done');
    order.push(name);
  };
  visit(entry, []);
  return order;
}
const order = moduleOrder('app');

function bundleModule(name) {
  let code = readFileSync(path.join(root, 'src', `${name}.js`), 'utf8');
  const exported = [];
  code = code.replace(IMPORT, (_, names, mod) => `const {${names}} = __mod_${mod};`);
  code = code.replace(/^export\s+(async\s+function|function|const|let|class)\s+([\w$]+)/gm, (_, kind, id) => {
    exported.push(id);
    return `${kind} ${id}`;
  });
  if (/^\s*(import|export)\b/m.test(code)) throw new Error(`${name}.js 里有打包脚本不认识的 import/export 写法`);
  return `const __mod_${name} = (() => {\n${code}\nreturn { ${exported.join(', ')} };\n})();`;
}

const js = order.map(bundleModule).join('\n\n');
const css = readFileSync(path.join(root, 'styles.css'), 'utf8');
const icon = readFileSync(path.join(root, 'icon.svg'), 'utf8');
let html = readFileSync(path.join(root, 'index.html'), 'utf8');
const swap = (from, to) => {
  if (!html.includes(from)) throw new Error(`index.html 里找不到：${from}`);
  html = html.replace(from, () => to);
};
swap('<link rel="stylesheet" href="styles.css">', `<style>\n${css}\n</style>`);
swap('<link rel="icon" href="icon.svg" type="image/svg+xml">', `<link rel="icon" href="data:image/svg+xml,${encodeURIComponent(icon.trim())}">`);
swap('<script type="module" src="src/app.js"></script>', `<script>\n"use strict";\n${js}\n</script>`);
mkdirSync(path.join(root, 'dist'), { recursive: true });
const out = path.join(root, 'dist', '座次桌签.html');
writeFileSync(out, html);
console.log(`已生成 ${path.relative(root, out)}（${(html.length / 1024).toFixed(0)} KB，${order.length} 个模块：${order.join(' ')}）`);
