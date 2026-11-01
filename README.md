<p>
  <img src="https://assets.solidjs.com/banner?project=Library&type=core" alt="SolidJS" />
</p>

[![Build Status](https://img.shields.io/github/actions/workflow/status/solidjs/solid/main-ci.yml?branch=main&logo=github&style=for-the-badge)](https://github.com/solidjs/solid/actions/workflows/main-ci.yml)
[![Coverage Status](https://img.shields.io/coveralls/github/solidjs/solid.svg?style=for-the-badge)](https://coveralls.io/github/solidjs/solid?branch=main)

[![NPM Version](https://img.shields.io/npm/v/solid-js.svg?style=for-the-badge)](https://www.npmjs.com/package/solid-js)
[![](https://img.shields.io/npm/dm/solid-js.svg?style=for-the-badge)](https://www.npmjs.com/package/solid-js)
[![Discord](https://img.shields.io/discord/722131463138705510?style=for-the-badge)](https://discord.com/invite/solidjs)
[![Subreddit subscribers](https://img.shields.io/reddit/subreddit-subscribers/solidjs?style=for-the-badge)](https://www.reddit.com/r/solidjs/)

**[官网](https://www.solidjs.com/) • [API 文档](https://docs.solidjs.com/) • [特性教程](https://www.solidjs.com/tutorial/introduction_basics) • [在线演练场](https://playground.solidjs.com/?version=1.3.13#NobwRAdghgtgpmAXGGUCWEwBowBcCeADgsrgM4Ae2YZA9gK4BOAxiWGjIbY7gAQi9GcCABM4jXgF9eAM0a0YvADo1aAGzQiAtACsyAegDucAEYqA3EogcuPfr2ZCouOAGU0Ac2hqps+YpU6DW09CysrGXoIZlw0WgheAGEGCBdGAAoASn4rXgd4sj5gZhTcLF4yOFxkqNwAXV4AXgcnF3cvKDV0gAZMywT8iELeDEc4eFSm3iymgD4KqprU9JLamYBqXgBGPvCBoVwmBPTcvN4AHhN6XFx43gJiRpUrm-iVXnjEjWYAa0aQUZCCa4SSzU5nfirZaZSTgi76F63CBgga7CCwiBWISicTpGaNebnJZpXj6WblES0Zj0YEAOg8VQAompxsJcAAhfAASREJzAUEIhBUmTRYEkdSAA) • [Discord](https://discord.com/invite/solidjs)**

Solid 是一个用于构建用户界面的声明式 JavaScript 库。它不使用虚拟 DOM，而是将模板编译为真实的 DOM 节点，并通过细粒度的响应式更新来驱动界面。你只需声明状态并在整个应用中使用它——当某段状态发生变化时，只有依赖它的代码会被重新执行。

## 一览

```tsx
import { createSignal } from "solid-js";
import { render } from "solid-js/web";

function Counter() {
  const [count, setCount] = createSignal(0);
  const doubleCount = () => count() * 2;
  
  console.log("函数体只运行一次……");

  return (
    <>
      <button onClick={() => setCount(c => c + 1)}>
        {doubleCount()}
      </button>
    </>
  );
}

render(Counter, document.getElementById("app")!);
```

在我们的[演练场](https://playground.solidjs.com/anonymous/0c88df54-91b0-4c88-bd20-e962bde49725)中试试这段代码！

<details>
<summary>这是怎么做到的！</summary>

```tsx
import { createSignal } from "solid-js";
import { render } from "solid-js/web";

// 组件就是一个返回 DOM 节点的函数
function Counter() {
  // 创建一段响应式状态，得到一个读取函数 count() 和一个设置函数 setCount()
  const [count, setCount] = createSignal(0);
  
  // 创建派生状态，只需把一个表达式包进函数里
  const doubleCount = () => count() * 2;
  
  console.log("函数体只运行一次……");

  // JSX 让你可以在 JavaScript 函数内书写 HTML，并使用 { } 语法嵌入动态表达式
  // 这里面唯一会重新渲染的，只有 doubleCount() 这段文本
  return (
    <>
      <button onClick={() => setCount(c => c + 1)}>
        Increment: {doubleCount()}
      </button>
    </>
  );
}

// render 函数把一个组件挂载到你的页面上
render(Counter, document.getElementById("app")!);
```

Solid 会把你的 JSX 编译成高效的真实 DOM 更新。它在运行时使用同样的响应式原语（`createSignal`），同时尽可能减少重新渲染。下面就是这个例子编译后的样子：

```js
import { template as _$template } from "solid-js/web";
import { delegateEvents as _$delegateEvents } from "solid-js/web";
import { insert as _$insert } from "solid-js/web";
// 编译器会把所有静态 HTML 提取出来
const _tmpl$ = /*#__PURE__*/_$template(`<button>Increment: `);

import { createSignal, createEffect } from "solid-js";
import { render } from "solid-js/web";

function Counter() {
  const [count, setCount] = createSignal(0);
  
  const doubleCount = () => count() * 2;
  
  console.log("函数体只运行一次……");
  
  return (() => {
    // _el$ 是一个真实的 DOM 节点！
    const _el$ = _tmpl$();
    _el$.$$click = () => setCount(c => c + 1);
     // 这里把 count 作为按钮的子节点插入，使得 count 更新时无需重新渲染整个按钮
    _$insert(_el$, doubleCount);
    return _el$;
  })();
}
render(Counter, document.getElementById("app"));
_$delegateEvents(["click"]);
```

</details>

## 核心特性

- 对真实 DOM 进行细粒度更新
- 声明式数据：用响应式原语把状态建模成一个系统
- 只渲染一次的心智模型：组件就是普通的 JavaScript 函数，只运行一次来完成视图搭建
- 自动依赖追踪：访问响应式状态即自动订阅它
- [体积小](https://dev.to/this-is-learning/javascript-framework-todomvc-size-comparison-504f)且[运行快](https://krausest.github.io/js-framework-benchmark/current.html)
- 简单：只需学习少数几个强大的概念，即可复用、组合并层层构建
- 提供现代框架特性，如 JSX、片段（Fragment）、Context、Portal、Suspense、流式 SSR、渐进式水合、错误边界与并发渲染
- 天然易于调试：`<div>` 就是真实的 div，因此你可以直接用浏览器的开发者工具检查渲染结果
- [对 Web Component 友好](https://github.com/solidjs/solid/tree/main/packages/solid-element#readme)，可以编写自定义元素
- 同构：在客户端和服务器端都能渲染你的组件
- 通用：编写[自定义渲染器](https://github.com/solidjs/solid/releases/tag/v1.2.0)，让 Solid 无处不在
- 社区与生态持续成长，并有核心团队积极支持

<details>
 
<summary>快速开始</summary>

在终端中运行以下命令，即可用最简单的应用起步：

```sh
> npx degit solidjs/templates/js my-app
> cd my-app
> npm i # 或 yarn 或 pnpm
> npm run dev # 或 yarn 或 pnpm
```

或者使用 TypeScript：

```sh
> npx degit solidjs/templates/ts my-app
> cd my-app
> npm i # 或 yarn 或 pnpm
> npm run dev # 或 yarn 或 pnpm
```

这会创建一个由 [Vite](https://vitejs.dev/) 驱动的最小化、客户端渲染应用。

你也可以在自己的项目中手动安装依赖。若要在 JSX 中使用 Solid（_推荐_），请运行：

```sh
> npm i -D babel-preset-solid
> npm i solid-js
```

最简单的配置方式，是把 `babel-preset-solid` 加入你的 `.babelrc`、webpack 的 babel 配置，或 rollup 配置中：

```js
"presets": ["solid"]
```

要让 TypeScript 正常工作，记得在 `.tsconfig` 中设置 Solid 的 JSX 处理项：

```js
"compilerOptions": {
  "jsx": "preserve",
  "jsxImportSource": "solid-js",
}
```

</details>

## 为什么选择 Solid？

### 高性能

经过精心打磨，背后有长达五年的研究积累，Solid 的性能几乎与优化后的原生 JavaScript 无异（参见 [JS Framework Benchmark](https://krausest.github.io/js-framework-benchmark/current.html) 上 Solid 的表现）。Solid [体积小](https://bundlephobia.com/package/solid-js@1.3.15)，完全支持 Tree Shaking，在服务器端渲染时同样[飞快](https://levelup.gitconnected.com/how-we-wrote-the-fastest-javascript-ui-framework-again-db097ddd99b6)。无论你写的是纯客户端渲染的 SPA，还是服务端渲染的应用，用户都能以前所未有的速度看到界面。（[阅读库作者关于 Solid 性能的更多介绍](https://dev.to/ryansolid/thinking-granular-how-is-solidjs-so-performant-4g37)。）

### 功能强大

Solid 功能完备，拥有现代框架该有的一切。借助 Context 和 Store，内置了高性能的状态管理：你不必为了管理全局状态而去引入第三方库（如果你不想的话）。有了 Resource，你可以像使用任何其他状态一样使用从服务器加载的数据，并通过 Suspense 和并发渲染构建响应式的界面。当你准备迁移到服务端时，Solid 提供完整的 SSR 与 Serverless 支持，配合流式传输与渐进式水合，让你的应用尽快进入可交互状态。（查看我们完整的[交互式特性导览](https://www.solidjs.com/tutorial/introduction_basics)。）

### 务实

少即是多：使用简单、可组合的原语，没有隐藏的规则和陷阱。在 Solid 中，组件就是函数——渲染完全由你如何使用状态来决定——因此你可以自由地按自己喜欢的方式组织代码，而不必去学习一套新的渲染系统。Solid 提倡诸如声明式代码、读写分离等模式，它们有助于保持项目的可维护性，却又不会强势到挡你的路。

### 高效

Solid 建立在 JSX、TypeScript 等成熟工具之上，并与 Vite 生态深度整合。Solid 贴近底层、极简的抽象让你能直接访问 DOM，从而轻松使用 D3 等你喜欢的原生 JavaScript 库。Solid 的生态系统也在飞速成长，包括[自定义原语](https://github.com/solidjs-community/solid-primitives)、[组件库](https://kobalte.dev)，以及能让你[以全新方式编写 Solid 代码](https://github.com/LXSMNSYC/solid-labels)的构建期工具。

## 更多

查阅我们的官方[文档](https://docs.solidjs.com)，或浏览一些[示例](https://github.com/solidjs/solid/blob/main/documentation/resources/examples.md)。

## 浏览器支持

SolidJS Core 承诺支持近两年来发布的主流浏览器，包括 Firefox、Safari、Chrome 和 Edge（桌面端与移动端）。我们不支持 IE 及类似的已停止维护的浏览器。在服务器端，我们支持 Node LTS，以及最新版本的 Deno 与 Cloudflare Worker 运行时。

<img src="https://saucelabs.github.io/images/opensauce/powered-by-saucelabs-badge-gray.svg?sanitize=true" alt="测试由 SauceLabs 提供支持" width="300"/>

## 社区

来 [Discord](https://discord.com/invite/solidjs) 和我们聊聊吧！Solid 的创建者与其余核心团队成员都很活跃，我们也一直欢迎各种贡献。

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
