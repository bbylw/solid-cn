import { Callout, CodeBlock, SnippetTabs } from "../components/Code";
import bunCommands from "./snippets/quick-start-bun.sh.txt?shiki";
import npmCommands from "./snippets/quick-start-npm.sh.txt?shiki";
import pnpmCommands from "./snippets/quick-start-pnpm.sh.txt?shiki";
import installCommands from "./snippets/install.sh.txt?shiki";
import viteConfig from "./snippets/gs-vite-config.ts.txt?shiki";
import babelConfig from "./snippets/babel.json.txt?shiki";
import babelConfigNote from "./snippets/babel-json-note.txt?shiki";
import tsconfig from "./snippets/tsconfig.json.txt?shiki";
import jsxTypes from "./snippets/gs-jsx-types.ts.txt?shiki";
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
        。要完整地写一个项目，下面的步骤会创建一个由 Vite 驱动的 Solid 2.0 + TypeScript
        应用。
      </p>

      <h2 id="before-you-start">开始之前</h2>
      <p>
        需要准备三样东西：一个能运行命令的终端、Node.js 22.12 或更高（用 Bun、pnpm
        也可以），以及一个支持 TypeScript 的编辑器。构建侧目前支持 Vite 8 与 9。Solid
        本身可以在浏览器与 Node LTS 上运行，模板则使用 Vite 的开发服务器与构建流程。
      </p>
      <p>
        如果你还没有写过 JSX，建议先了解“在 JavaScript 里直接写标签”这件事。第 7 章
        <a href="/docs/components">组件与 JSX</a> 会从头解释，不需要提前掌握 React。
      </p>

      <h2 id="create-project">用模板创建项目</h2>
      <p>
        官方模板仓库{" "}
        <a href="https://github.com/solidjs/templates" target="_blank" rel="noreferrer">
          solidjs/templates
        </a>{" "}
        里的 <code>solid-v2</code> 目录是 2.0 的入口。用 <code>degit</code> 取一份{" "}
        <code>basic</code> 模板，安装依赖并启动开发服务器：
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
        <code>src/App.tsx</code>，页面会热更新。想要更小的起点用 <code>solid-v2/bare</code>
        ，需要流式 SSR、中间件与服务端函数则用 <code>solid-v2/fullstack</code>。
      </p>

      <Callout tone="warn" title="模板路径变了">
        <p>
          1.x 教程里常见的 <code>degit solidjs/templates/ts</code>{" "}
          拉的是 1.x 模板，和 2.0 的包名配不上。2.0 请从{" "}
          <code>solidjs/templates/solid-v2/basic</code> 开始。
        </p>
      </Callout>

      <h2 id="manual-install">手动安装</h2>
      <p>
        Solid 2.0 把运行时拆成两个包：<code>solid-js</code> 是渲染器无关的核心，信号、memo、
        effect、store 与控制流组件都从它导出（不再有 <code>solid-js/store</code>）；{" "}
        <code>@solidjs/web</code> 是 Web 渲染器，负责 <code>render</code>、<code>hydrate</code>、
        <code>Portal</code> 这些 DOM 侧的 API。
      </p>
      <CodeBlock data={installCommands} label="终端" />
      <p>
        然后在 Vite 配置里挂上插件。插件默认走原生编译器 <code>@solidjs/compiler</code>
        ，JSX 转换、热更新都不需要额外配置：
      </p>
      <CodeBlock data={viteConfig} label="vite.config.ts" />
      <Callout tone="warn" title="vite-plugin-solid 已改名">
        <p>
          1.x 用的 <code>vite-plugin-solid</code> 现在叫 <code>@solidjs/vite-plugin</code>
          ，导入换成 <code>import solid from "@solidjs/vite-plugin"</code>。原先的{" "}
          <code>solid: {"{"} moduleName: "solid-js/web" {"}"}</code> 这类配置可以直接删掉：两个
          编译器都默认指向 <code>@solidjs/web</code>。插件还要求 Vite 8/9 与 Node.js 22.12+。
        </p>
      </Callout>
      <p>
        只有不走 Vite 的构建链才需要自己配 Babel。1.x 的 <code>babel-preset-solid</code>{" "}
        换成了一个插件：
      </p>
      <CodeBlock data={babelConfig} label="babel.config.json" />
      <CodeBlock data={babelConfigNote} label="babel.config.json（带选项）" />
      <p>
        Solid 的 JSX 不是 React 的 JSX。它会被编译成真实 DOM 创建与更新调用，因此不要同时套用
        React 的 preset；手动安装时，请确认构建链里只有一份 Solid 的 JSX 转换。
      </p>

      <h2 id="jsx-typescript">配置 JSX 与 TypeScript</h2>
      <p>
        TypeScript 需要知道由谁来处理 JSX。设置 <code>jsx: "preserve"</code> 把 JSX
        交给构建器，再用 <code>jsxImportSource</code> 指向 Web 渲染器：
      </p>
      <CodeBlock data={tsconfig} label="tsconfig.json" />
      <Callout tone="warn" title="JSX 类型搬到 @solidjs/web">
        <p>
          2.0 里 <code>solid-js</code> 不再导出 <code>JSX</code> 命名空间，
          <code>solid-js/jsx-runtime</code> 也取消了。<code>jsxImportSource</code> 还写成{" "}
          <code>"solid-js"</code> 时，编辑器会报“找不到 <code>JSX.IntrinsicElements</code>”。
        </p>
      </Callout>
      <CodeBlock data={jsxTypes} label="类型从哪里导入" />
      <p>
        简单记：<code>solid-js</code> 提供组件与渲染器无关的类型（<code>Component</code>、
        <code>Element</code>），渲染器包提供 DOM 相关的类型（<code>JSX</code>、
        <code>ComponentProps&lt;"button"&gt;</code>）。<code>@solidjs/vite-plugin</code>{" "}
        读取同一份 TypeScript 配置，<code>.tsx</code> 里就能拿到元素、事件与组件的类型推断。
      </p>

      <h2 id="entry">应用入口</h2>
      <p>
        Solid 客户端应用的入口通常只有几行：找到挂载节点，用 <code>@solidjs/web</code> 的{" "}
        <code>render</code> 启动根组件。
      </p>
      <CodeBlock data={entry} label="src/index.tsx" />
      <p>
        记得在 <code>index.html</code> 里放一个同名的挂载点，并用 <code>type="module"</code>{" "}
        引入入口文件：
      </p>
      <CodeBlock data={indexHtml} label="index.html" />
      <p>
        <code>render</code> 负责创建 DOM 并接管响应式更新；事件委托也装在这个渲染根上，不再是
        document 全局，返回的 <code>dispose</code> 可以把整棵树拆掉。若要做服务端渲染，入口会换成{" "}
        <code>hydrate</code>，<a href="/docs/ssr">SSR 与水合</a> 一章会展开讲。
      </p>

      <h2 id="upgrade-from-v1">从 1.x 升级？</h2>
      <p>
        如果你手上的代码是 1.x 的，先读{" "}
        <a
          href="https://github.com/solidjs/solid/blob/main/documentation/solid-2.0/MIGRATION.md"
          target="_blank"
          rel="noreferrer"
        >
          迁移指南
        </a>
        。多数变化是换个位置和写法，行为上最值得先记住三件事：写入按微任务批量生效，读到的新值会
        滞后（测试里用 <code>flush()</code> 立刻结算）；<code>createEffect</code> 拆成 compute 与
        apply 两段；<code>onMount</code> 由 <code>onSettled</code> 取代。
      </p>
      <Callout tone="warn" title="1.x 仍在维护">
        <p>
          1.x 的代码继续留在{" "}
          <a href="https://github.com/solidjs/solid/tree/1.x" target="_blank" rel="noreferrer">
            1.x 分支
          </a>
          上维护，可用 <code>npm i solid-js@v1-latest</code> 安装，文档在{" "}
          <a href="https://v1.solidjs.com" target="_blank" rel="noreferrer">
            v1.solidjs.com
          </a>
          。本站各章都按 2.0 写，读到 1.x 示例时请对照{" "}
          <a href="/docs/components">组件与 JSX</a> 与{" "}
          <a href="/docs/effects">副作用与生命周期</a> 里的新旧对照说明。
        </p>
      </Callout>

      <h2 id="next">下一步</h2>
      <p>
        项目跑起来之后，先不要急着翻 API。下一章解释 Solid 的更新到底发生在哪里，这会决定你后面
        读所有示例的方式。
      </p>
      <ul>
        <li>
          <a href="/docs/reactivity">响应式模型</a>：理解依赖图与“组件只运行一次”。
        </li>
        <li>
          <a href="/docs/components">组件与 JSX</a>：props、children、事件与 ref 的 2.0 写法。
        </li>
        <li>
          <a href="/docs/api">API 速查</a>：需要时直接查函数签名。
        </li>
      </ul>
    </>
  );
}
