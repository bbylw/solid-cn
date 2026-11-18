<p>
  <img src="https://assets.solidjs.com/banner?project=Library&type=core&version=2.0" alt="SolidJS" />
</p>

[![Build Status](https://img.shields.io/github/actions/workflow/status/solidjs/solid/main-ci.yml?branch=main&logo=github&style=for-the-badge)](https://github.com/solidjs/solid/actions/workflows/main-ci.yml)
[![Coverage Status](https://img.shields.io/coveralls/github/solidjs/solid.svg?style=for-the-badge)](https://coveralls.io/github/solidjs/solid?branch=main)

[![NPM Version](https://img.shields.io/npm/v/solid-js.svg?style=for-the-badge)](https://www.npmjs.com/package/solid-js)
[![](https://img.shields.io/npm/dm/solid-js.svg?style=for-the-badge)](https://www.npmjs.com/package/solid-js)
[![Discord](https://img.shields.io/discord/722131463138705510?style=for-the-badge)](https://discord.com/invite/solidjs)
[![Subreddit subscribers](https://img.shields.io/reddit/subreddit-subscribers/solidjs?style=for-the-badge)](https://www.reddit.com/r/solidjs/)

**[官网](https://www.solidjs.com/) • [文档](https://docs.solidjs.com/) • [教程](https://docs.solidjs.com/tutorial) • [在线演练场](https://playground.solidjs.com/) • [Discord](https://discord.com/invite/solidjs)**

Solid 是一个用于构建用户界面的声明式 JavaScript 库。它不使用虚拟 DOM，而是将模板编译为真实的 DOM 节点，并通过细粒度的响应式更新来驱动界面。你只需声明状态并在整个应用中使用它——当某段状态发生变化时，只有依赖它的代码会被重新执行。

## 一览

```tsx
import { createSignal } from "solid-js";
import { render } from "@solidjs/web";

function Counter() {
  const [count, setCount] = createSignal(0);
  const doubled = () => count() * 2;

  // 组件函数体只运行一次。count 变化时，只有 {doubled()} 会更新。
  return <button onClick={() => setCount(c => c + 1)}>{doubled()}</button>;
}

render(() => <Counter />, document.getElementById("app")!);
```

在我们的[演练场](https://playground.solidjs.com/)中试试这段代码！

<details>
<summary>这是怎么做到的！</summary>

Solid 在构建期就把你的 JSX 编译成真实的 DOM 操作。组件函数在挂载时只运行一次；响应式精确到每个表达式，而不是每次渲染。`{doubled()}` 这个表达式会被编译成一个受追踪的更新——当 `count()` 变化时，它只触碰那一处 DOM 位置。

```js
import { template, delegateEvents, insert } from "@solidjs/web";
import { createSignal } from "solid-js";

const _tmpl$ = /*#__PURE__*/ template(`<button>`);

function Counter() {
  const [count, setCount] = createSignal(0);
  const doubled = () => count() * 2;

  return (() => {
    const _el$ = _tmpl$();
    _el$._$$click = () => setCount(c => c + 1);
    insert(_el$, doubled);
    return _el$;
  })();
}
delegateEvents(["click"]);
```

读取会在下一个 microtask 拿到更新后的值（也可以调用 `flush()` 立即同步应用）。Effect 拆分为负责追踪的 `compute` 阶段和负责副作用的 `apply` 阶段——完整模型见[文档](https://docs.solidjs.com)。

</details>

## 核心特性

- 对真实 DOM 进行细粒度更新——没有虚拟 DOM diff。
- 声明式响应式原语（`createSignal`、`createMemo`、`createStore`）。
- 只渲染一次的组件——组件函数就是只运行一次的普通 JavaScript。
- 自动依赖追踪——读取响应式状态即自动订阅它。
- 按 microtask 批量应用更新，`flush()` 提供同步互操作。
- 一等异步：任何计算都可以返回 `Promise`/`AsyncIterable`；`<Loading>` 是异步边界。
- 乐观更新原语（`createOptimistic`、`createOptimisticStore`）与结构化的 `action(...)` 变更。
- 流式 SSR 与渐进式水合。
- TypeScript 优先、JSX 优先、对 Web Component 友好。
- 通用：通过 [`@solidjs/universal`](https://github.com/solidjs/solid/tree/main/packages/universal) 编写自定义渲染器，面向非 DOM 平台。

## 快速开始

从[官方模板](https://github.com/solidjs/templates)起步：

```sh
npx degit solidjs/templates/solid-v2/basic my-app
cd my-app
npm install
npm run dev
```

或者把 Solid 装进现有的 Vite 项目：

```sh
npm i solid-js @solidjs/web
npm i -D vite @solidjs/vite-plugin
```

```js
// vite.config.ts
import { defineConfig } from "vite";
import solid from "@solidjs/vite-plugin";

export default defineConfig({
  plugins: [solid()]
});
```

再让 TypeScript 指向 web 渲染器的 JSX 类型：

```json
{
  "compilerOptions": {
    "jsx": "preserve",
    "jsxImportSource": "@solidjs/web"
  }
}
```

`solid-js` 持有与渲染器无关的组件类型，而 `@solidjs/web`、`@solidjs/h` 等渲染器包各自持有自己的 JSX 命名空间与 `jsx-runtime` 类型入口。

### 从 Solid 1.x 升级？

请阅读[迁移指南](https://github.com/solidjs/solid/blob/main/documentation/solid-2.0/MIGRATION.md)。Solid 1.x 在 [`1.x` 分支](https://github.com/solidjs/solid/tree/1.x)上继续维护，安装方式为 `npm i solid-js@v1-latest`，其文档在 [v1.solidjs.com](https://v1.solidjs.com)。

## 面向 LLM / AI 助手

2.0 的公开 API 与任何早于 2.0 的 Solid 示例都不同。在生成 Solid 2.0 代码之前，请先阅读：

- [`packages/solid/skills/solid-2.0/SKILL.md`](https://github.com/solidjs/solid/blob/main/packages/solid/skills/solid-2.0/SKILL.md) —— 入门读本：最重要的三条规则、1.x → 2.0 的纠正对照、以及该优先使用的原语，全文不到 8 KB。
- [`packages/solid/CHEATSHEET.md`](https://github.com/solidjs/solid/blob/main/packages/solid/CHEATSHEET.md) —— 单页参考；末尾列出了相对 1.x 发生变化的模式。
- [`documentation/solid-2.0/MIGRATION.md`](https://github.com/solidjs/solid/blob/main/documentation/solid-2.0/MIGRATION.md) —— 完整迁移指南。
- [docs.solidjs.com](https://docs.solidjs.com) —— 官方文档，提供 `/llms.txt` 与 `/llms-full.txt`。

入门读本与速查表随 `solid-js` npm 包一起发布（`node_modules/solid-js/skills/solid-2.0/SKILL.md`、`node_modules/solid-js/CHEATSHEET.md`；构建还会把速查表输出为 `solid-2.0-cheatsheet` skill）。这些包带有 `tanstack-intent` 关键字，扫描 `node_modules` 的 skill 注册表可以发现它们。

## 仓库结构

这是一个 PNPM workspaces monorepo。核心运行时（`solid-js`、`@solidjs/signals`、`@solidjs/web`、`@solidjs/universal`、`@solidjs/diagnostics`）始终共享同一个版本号。两个编译器在同步发布时共享版本号，`@solidjs/h`、`@solidjs/html` 与 `@solidjs/element` 则各自独立演进版本。

| 包                      | 路径                    | 用途                                                        |
| ----------------------- | ----------------------- | ----------------------------------------------------------- |
| `solid-js`              | `packages/solid`        | 核心运行时——组件、控制流、Context、水合。                   |
| `@solidjs/signals`      | `packages/signals`      | 响应式原语——signal、memo、effect、store。                   |
| `@solidjs/web`          | `packages/web`          | Web 平台运行时——`render`、`hydrate`、SSR、`Portal`、`dynamic`。 |
| `@solidjs/h`            | `packages/h`            | Hyperscript / JSX 工厂。                                    |
| `@solidjs/html`         | `packages/html`         | 免构建的标签模板字面量。                                    |
| `@solidjs/universal`    | `packages/universal`    | 面向自定义渲染器的通用运行时。                              |
| `@solidjs/element`      | `packages/element`      | Web Components 封装。                                       |
| `@solidjs/compiler`     | `packages/compiler`     | 原生 Oxc JSX 编译器。                                       |
| `@solidjs/babel-plugin` | `packages/babel-plugin` | 用于 JSX 编译的 Babel 插件。                                |
| `@solidjs/diagnostics`  | `packages/diagnostics`  | 仅限开发环境的诊断与归因工具，服务于测试和 agent。          |

运行时 DOM 操作位于 `@solidjs/web`（以及 `@solidjs/universal` / `@solidjs/h` / `@solidjs/html`）。JSX 编译器与 DOM 运行时都在本仓库中，因此相关 issue 请提到这里，而不是 [DOM Expressions](https://github.com/ryansolid/dom-expressions)。单页 API 参考见 [`packages/solid/CHEATSHEET.md`](https://github.com/solidjs/solid/blob/main/packages/solid/CHEATSHEET.md)，设计笔记在 [`documentation/solid-2.0/`](https://github.com/solidjs/solid/tree/main/documentation/solid-2.0) 目录下。

## 为什么选择 Solid？

### 高性能

为性能而精心打磨，背后有多年的研究积累——在 [JS Framework Benchmark](https://krausest.github.io/js-framework-benchmark/current.html) 上，Solid 的运行时开销几乎与优化后的原生 JavaScript 无异。体积小、完全支持 Tree Shaking，在服务器端同样飞快。（[阅读库作者关于 Solid 性能的更多介绍](https://dev.to/ryansolid/thinking-granular-how-is-solidjs-so-performant-4g37)。）

### 功能强大

内置高性能的状态管理（Context、Store、Projection）。异步是计算的一等能力，配有 `<Loading>` / `<Errored>` 边界与用于再验证指示的 `isPending`。当你准备迁移到服务端时，Solid 提供完整的 SSR、流式传输与渐进式水合。

### 务实

组件就是普通函数。渲染完全由你如何使用状态来决定——没有需要学习的渲染系统。Solid 提倡读写分离，但并不强制。

### 高效

Solid 建立在 JSX 与 TypeScript 之上，并与 Vite 生态深度整合。贴近底层的抽象让你能直接访问 DOM。生态持续成长，包括[自定义原语](https://github.com/solidjs-community/solid-primitives)、[组件库](https://kobalte.dev)以及各类构建期工具。

## 更多

- [文档](https://docs.solidjs.com)
- [教程](https://docs.solidjs.com/tutorial)
- [示例](https://github.com/solidjs/solid/tree/main/examples)
- [在线演练场](https://playground.solidjs.com/)

## 浏览器支持

SolidJS Core 承诺支持近两年来发布的主流浏览器，包括 Firefox、Safari、Chrome 和 Edge（桌面端与移动端）。我们不支持 IE 及类似的已停止维护的浏览器。在服务器端，我们支持 Node LTS，以及最新版本的 Deno 与 Cloudflare Worker 运行时。

## 社区

来 [Discord](https://discord.com/invite/solidjs) 和我们聊聊吧！Solid 的维护者们都很活跃，我们也一直欢迎各种贡献。

### 贡献者

<a href="https://github.com/solidjs/solid/graphs/contributors"><img src="https://contrib.rocks/image?repo=solidjs/solid" style="max-width:100%;"></a>

### Open Collective

用一笔捐赠支持我们，帮助我们持续开展各项活动。[[参与贡献](https://opencollective.com/solid)]

<a href="https://opencollective.com/solid/backer/0/website" target="_blank"><img src="https://opencollective.com/solid/backer/0/avatar.svg"></a>
<a href="https://opencollective.com/solid/backer/1/website" target="_blank"><img src="https://opencollective.com/solid/backer/1/avatar.svg"></a>
<a href="https://opencollective.com/solid/backer/2/website" target="_blank"><img src="https://opencollective.com/solid/backer/2/avatar.svg"></a>
<a href="https://opencollective.com/solid/backer/3/website" target="_blank"><img src="https://opencollective.com/solid/backer/3/avatar.svg"></a>
<a href="https://opencollective.com/solid/backer/4/website" target="_blank"><img src="https://opencollective.com/solid/backer/4/avatar.svg"></a>
<a href="https://opencollective.com/solid/backer/5/website" target="_blank"><img src="https://opencollective.com/solid/backer/5/avatar.svg"></a>
<a href="https://opencollective.com/solid/backer/6/website" target="_blank"><img src="https://opencollective.com/solid/backer/6/avatar.svg"></a>
<a href="https://opencollective.com/solid/backer/7/website" target="_blank"><img src="https://opencollective.com/solid/backer/7/avatar.svg"></a>
<a href="https://opencollective.com/solid/backer/8/website" target="_blank"><img src="https://opencollective.com/solid/backer/8/avatar.svg"></a>
<a href="https://opencollective.com/solid/backer/9/website" target="_blank"><img src="https://opencollective.com/solid/backer/9/avatar.svg"></a>
<a href="https://opencollective.com/solid/backer/10/website" target="_blank"><img src="https://opencollective.com/solid/backer/10/avatar.svg"></a>

### 赞助商

成为赞助商，把你的 Logo 展示在我们的 GitHub README 上，并附上指向你网站的链接。[[成为赞助商](https://opencollective.com/solid#sponsor)]

<a href="https://opencollective.com/solid/sponsor/0/website" target="_blank"><img src="https://opencollective.com/solid/sponsor/0/avatar.svg"></a>
<a href="https://opencollective.com/solid/sponsor/1/website" target="_blank"><img src="https://opencollective.com/solid/sponsor/1/avatar.svg"></a>
<a href="https://opencollective.com/solid/sponsor/2/website" target="_blank"><img src="https://opencollective.com/solid/sponsor/2/avatar.svg"></a>
<a href="https://opencollective.com/solid/sponsor/3/website" target="_blank"><img src="https://opencollective.com/solid/sponsor/3/avatar.svg"></a>
<a href="https://opencollective.com/solid/sponsor/4/website" target="_blank"><img src="https://opencollective.com/solid/sponsor/4/avatar.svg"></a>
<a href="https://opencollective.com/solid/sponsor/5/website" target="_blank"><img src="https://opencollective.com/solid/sponsor/5/avatar.svg"></a>
<a href="https://opencollective.com/solid/sponsor/6/website" target="_blank"><img src="https://opencollective.com/solid/sponsor/6/avatar.svg"></a>
<a href="https://opencollective.com/solid/sponsor/7/website" target="_blank"><img src="https://opencollective.com/solid/sponsor/7/avatar.svg"></a>
<a href="https://opencollective.com/solid/sponsor/8/website" target="_blank"><img src="https://opencollective.com/solid/sponsor/8/avatar.svg"></a>
<a href="https://opencollective.com/solid/sponsor/9/website" target="_blank"><img src="https://opencollective.com/solid/sponsor/9/avatar.svg"></a>
<a href="https://opencollective.com/solid/sponsor/10/website" target="_blank"><img src="https://opencollective.com/solid/sponsor/10/avatar.svg"></a>
<a href="https://opencollective.com/solid/sponsor/11/website" target="_blank"><img src="https://opencollective.com/solid/sponsor/11/avatar.svg"></a>
<a href="https://opencollective.com/solid/sponsor/12/website" target="_blank"><img src="https://opencollective.com/solid/sponsor/12/avatar.svg"></a>