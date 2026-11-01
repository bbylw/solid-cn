import { A } from "@solidjs/router";
import { CodeBlock, Callout, SnippetTabs } from "../components/Code";
import bunCommands from "./snippets/quick-start-bun.sh.txt?shiki";
import npmCommands from "./snippets/quick-start-npm.sh.txt?shiki";
import pnpmCommands from "./snippets/quick-start-pnpm.sh.txt?shiki";
import installCommands from "./snippets/install.sh.txt?shiki";
import babelConfig from "./snippets/babel.json.txt?shiki";
import tsconfig from "./snippets/tsconfig.json.txt?shiki";
import entry from "./snippets/entry.tsx.txt?shiki";
import indexHtml from "./snippets/index-html.html.txt?shiki";

export default function GettingStarted() {
  return (
    <>
      <p>
        想先在浏览器里试试？可以直接打开{" "}
        <a href="https://playground.solidjs.com" target="_blank" rel="noreferrer">
          Playground
        </a>
        。要完整地写一个项目，下面的步骤会创建一个由 Vite 驱动的 Solid +
        TypeScript 应用。
      </p>

      <h2 id="before-you-start">开始之前</h2>
      <p>
        需要准备三样东西：一个能运行命令的终端、较新的 Node.js（或 Bun、Deno）运行时，以及一个支持
        TypeScript 的编辑器。Solid 本身可以在浏览器与 Node LTS 上运行，模板则会使用
        Vite 的开发服务器与构建流程。
      </p>
      <p>
        如果你还没有写过 JSX，建议先了解“在 JavaScript 里直接写标签”这件事。第 7 章
        <A href="/docs/components">组件与 JSX</A> 会从头解释，不需要提前掌握 React。
      </p>

      <h2 id="create-project">用模板创建项目</h2>
      <p>
        官方仓库提供 TypeScript 与 JavaScript 两套最小模板。用 <code>degit</code>{" "}
        取一份模板，安装依赖并启动开发服务器：
      </p>

      <SnippetTabs
        label="degit 模板命令"
        tabs={[
          { id: "bun", label: "Bun", fileLabel: "终端", data: bunCommands },
          { id: "npm", label: "npm", fileLabel: "终端", data: npmCommands },
          { id: "pnpm", label: "pnpm", fileLabel: "终端", data: pnpmCommands },
        ]}
      />

      <p>
        模板里已经包含入口文件、TypeScript 配置与一个可以运行的计数器示例。启动后打开终端提示的地址，修改{" "}
        <code>src/App.tsx</code>，页面会热更新。
      </p>

      <Callout title="两种脚手架入口">
        <p>
          README 里使用的是 <code>degit</code> 模板，路径最短；官方文档现在也提供{" "}
          <code>npm create solid</code>，会交互式询问项目名、是否使用 SolidStart
          以及模板类型。两种方式得到的客户端项目都基于 Vite，按你顺手的选择即可。
        </p>
      </Callout>

      <h2 id="manual-install">手动安装</h2>
      <p>
        如果要在已有工程里接入 Solid，需要 <code>solid-js</code> 运行时与 JSX
        编译支持。使用 Babel 时的最小组合是：
      </p>
      <CodeBlock data={installCommands} label="终端" />
      <p>
        然后在 Babel 配置里启用 preset。Babel 只负责把 JSX
        转成运行时调用，状态与更新逻辑仍然来自 <code>solid-js</code>。
      </p>
      <CodeBlock data={babelConfig} label=".babelrc" />
      <Callout title="在 Vite 里更省事">
        <p>
          如果项目已经使用 Vite，安装 <code>vite-plugin-solid</code>{" "}
          即可，它会同时处理 JSX 转换、热更新与 SSR
          入口，不需要再单独配置 Babel preset。官方模板与本书的示例工程都走这条路径。
        </p>
      </Callout>
      <p>
        Solid 的 JSX 不是 React 的 JSX。它会被编译成真实 DOM
        创建与更新调用，因此不要同时套用 React 的 Babel preset。手动安装时，请确认构建链只使用
        Solid 的 JSX 转换。
      </p>

      <h2 id="jsx-typescript">配置 JSX 与 TypeScript</h2>
      <p>
        TypeScript 需要知道由谁来处理 JSX。设置 <code>jsx: "preserve"</code>{" "}
        保留 JSX 交给构建器，再用 <code>jsxImportSource</code> 指向{" "}
        <code>solid-js</code>：
      </p>
      <CodeBlock data={tsconfig} label="tsconfig.json" />
      <p>
        官方模板已经包含这份配置。若使用 <code>vite-plugin-solid</code>，它会读取同一份
        TypeScript 设置；在 <code>.tsx</code> 文件里就能获得元素、事件与组件的类型推断。
      </p>

      <h2 id="entry">应用入口</h2>
      <p>
        Solid 客户端应用的入口通常只有几行：找到挂载节点，用 <code>render</code>{" "}
        启动根组件。
      </p>
      <CodeBlock data={entry} label="src/index.tsx" />
      <p>
        记得在 <code>index.html</code> 里放一个同名的挂载点，并用{" "}
        <code>type="module"</code> 引入入口文件：
      </p>
      <CodeBlock data={indexHtml} label="index.html" />
      <p>
        <code>render</code> 负责创建 DOM 并接管响应式更新。若要做服务端渲染，入口会换成{" "}
        <code>hydrate</code>，第 10 章会展开讲。
      </p>

      <h2 id="next">下一步</h2>
      <p>
        项目跑起来之后，先不要急着翻 API。下一章会解释 Solid
        的更新到底发生在哪里，这会决定你后面读所有示例的方式。
      </p>
      <ul>
        <li>
          <A href="/docs/reactivity">响应式模型</A>：理解依赖图与“组件只运行一次”。
        </li>
        <li>
          <A href="/docs/signals">信号与派生</A>：最常用的状态原语与交互演示。
        </li>
        <li>
          <A href="/docs/api">API 速查</A>：需要时直接查函数签名。
        </li>
      </ul>
    </>
  );
}
