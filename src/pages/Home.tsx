import { A } from "@solidjs/router";
import { Title, Meta } from "@solidjs/meta";
import { createSignal, For } from "solid-js";
import {
  DISCORD_URL,
  DOCS_URL,
  GITHUB_URL,
  OPEN_COLLECTIVE_URL,
  PLAYGROUND_URL,
  REDDIT_URL,
  docGroups,
} from "../data/docs";
import { CopyButton, SnippetTabs } from "../components/Code";
import { SignalGraph } from "../components/demos/SignalGraph";
import { InlineCounter } from "../components/demos/InlineCounter";
import counterSource from "../content/snippets/counter.tsx.txt?shiki";
import counterCompiled from "../content/snippets/counter-compiled.js.txt?shiki";
import bunCommands from "../content/snippets/quick-start-bun.sh.txt?shiki";
import npmCommands from "../content/snippets/quick-start-npm.sh.txt?shiki";
import pnpmCommands from "../content/snippets/quick-start-pnpm.sh.txt?shiki";

const terminalTabs = [
  { id: "bun", label: "Bun", data: bunCommands },
  { id: "npm", label: "npm", data: npmCommands },
  { id: "pnpm", label: "pnpm", data: pnpmCommands },
];

const features = [
  {
    title: "对真实 DOM 做细粒度更新",
    desc: "编译后的代码直接绑定到具体的文本节点与属性，更新不会从组件根部重新扩散。",
  },
  {
    title: "声明式的数据模型",
    desc: "信号、memo 与 effect 构成一张可推理的依赖图，状态变化沿着订阅关系流动。",
  },
  {
    title: "组件只运行一次",
    desc: "组件是普通的 JavaScript 函数，只负责搭建视图，不需要每次渲染都重新执行。",
  },
  {
    title: "自动依赖追踪",
    desc: "在跟踪作用域里读取信号就会自动订阅，不需要手写依赖数组，也不会遗漏。",
  },
  {
    title: "现代框架能力齐备",
    desc: "JSX、Fragment、Context、Portal、Suspense、流式 SSR、渐进式水合与错误边界。",
  },
  {
    title: "调试贴近浏览器",
    desc: "页面上是真实的 div，没有虚拟 DOM 这层映射，开发者工具里看到的就是最终结构。",
  },
  {
    title: "同构渲染",
    desc: "同一套组件既能在浏览器里渲染，也能在服务端产出 HTML，再在客户端水合。",
  },
  {
    title: "面向 Web Component",
    desc: "可以把 Solid 组件包装成自定义元素，也能编写自己的渲染器，把库带到别的平台。",
  },
];

const ecosystem = [
  {
    name: "Solid Start",
    tag: "meta-framework",
    href: "https://start.solidjs.com",
    desc: "官方全栈框架：路由、SSR、数据加载与部署约定。",
  },
  {
    name: "solid-primitives",
    tag: "primitives",
    href: "https://github.com/solidjs-community/solid-primitives",
    desc: "社区维护的原语工具箱，覆盖定时器、媒体查询、事件与存储。",
  },
  {
    name: "Kobalte",
    tag: "components",
    href: "https://kobalte.dev",
    desc: "重视可访问性的无样式组件库，适合用来搭建自己的设计系统。",
  },
  {
    name: "Solid Labels",
    tag: "build-time",
    href: "https://github.com/LXSMNSYC/solid-labels",
    desc: "用编译期标签改写 JSX 的构建工具，探索另一种编写 Solid 的方式。",
  },
];

export default function Home() {
  const [terminal, setTerminal] = createSignal(terminalTabs[0]);
  const currentTerminal = () => terminal() ?? terminalTabs[0];

  return (
    <>
      <Title>Solid 中文 · 细粒度响应式 JavaScript UI 库</Title>
      <Meta
        name="description"
        content="Solid 中文学习站：从信号、派生值到 Store、SSR，用中文理解细粒度响应式，并在交互演示里直接看到依赖图如何工作。"
      />

      <section class="hero">
        <div class="shell hero-grid">
          <div class="hero-copy">
            <p class="hero-kicker">
              <span class="marker" aria-hidden="true" />
              <span class="mono">SOLID 1.9</span>
              <span class="sep" aria-hidden="true" />
              <span>用于构建用户界面的声明式 JavaScript 库</span>
            </p>
            <h1 class="hero-title">
              把界面更新，
              <span class="hero-em">精确到信号</span>。
            </h1>
            <p class="hero-lede">
              Solid 不使用虚拟 DOM。JSX 被编译成真实的 DOM
              节点，状态通过细粒度的依赖图传播。某段状态发生变化时，只有读取过它的代码会重新执行。
            </p>
            <div class="hero-actions">
              <A href="/docs/getting-started" class="btn btn-primary">
                从快速开始读起
              </A>
              <a
                href={PLAYGROUND_URL}
                target="_blank"
                rel="noreferrer"
                class="btn btn-ghost"
              >
                打开 Playground
              </a>
            </div>
            <div class="hero-facts">
              <div class="hero-fact">
                <span class="hero-fact-label mono">UPDATE UNIT</span>
                <span class="hero-fact-value">单个 DOM 节点</span>
                <span class="hero-fact-note">不重跑组件，只更新绑定</span>
              </div>
              <div class="hero-fact">
                <span class="hero-fact-label mono">RENDERING</span>
                <span class="hero-fact-value">真实 DOM</span>
                <span class="hero-fact-note">编译后直接创建节点</span>
              </div>
              <div class="hero-fact">
                <span class="hero-fact-label mono">COMPONENT</span>
                <span class="hero-fact-value">函数只运行一次</span>
                <span class="hero-fact-note">后续更新交给信号</span>
              </div>
            </div>
          </div>
          <div class="hero-visual">
            <SignalGraph />
          </div>
        </div>
      </section>

      <section class="section">
        <div class="shell">
          <div class="section-head">
            <div class="section-head-copy">
              <span class="section-index">01 / 只运行一次</span>
              <h2 class="section-title">
                组件是搭建视图的函数，<span class="nowrap">不是</span>每帧重跑的渲染器。
              </h2>
            </div>
            <p class="section-lede">
              调用一次 <code>Counter()</code>，Solid 就完成了 DOM
              的创建。之后点击按钮改变的是信号，依赖它的文本节点会各自更新，函数体不会再执行第二遍。
            </p>
          </div>

          <div class="runonce-grid">
            <div class="runonce-copy">
              <h3>把“渲染”从组件函数里拿出去</h3>
              <p>
                在 Solid 里，组件负责返回一次结构；持续的更新由响应式运行时接管。这也是为什么不需要{" "}
                <code>useEffect</code> 依赖数组，也不用担心闭包里的旧值。
              </p>
              <ul class="check-list">
                <li>函数体只在挂载时执行一次，打印日志也只出现一次。</li>
                <li>点击按钮只会通知读取了 <code>count</code> 的绑定。</li>
                <li>派生值写成函数，读取时才订阅，组合起来像普通表达式。</li>
              </ul>
            </div>
            <InlineCounter />
          </div>

          <div class="runonce-code">
            <SnippetTabs
              label="Counter 源码与编译产物"
              tabs={[
                {
                  id: "source",
                  label: "源码",
                  fileLabel: "Counter.tsx",
                  data: counterSource,
                },
                {
                  id: "compiled",
                  label: "编译产物",
                  fileLabel: "counter.js",
                  data: counterCompiled,
                },
              ]}
            />
          </div>
        </div>
      </section>

      <section class="night-section">
        <div class="shell night-section-shell">
          <div class="section-head">
            <div class="section-head-copy">
              <span class="section-index">02 / 编译产物</span>
              <h2 class="section-title">
                静态结构留在编译期，更新精确到节点。
              </h2>
            </div>
            <p class="section-lede">
              Solid 的编译器会提取模板、委托事件，并把动态表达式变成独立的更新函数。运行时不再需要对比两棵树。
            </p>
          </div>

          <div class="compiler-grid">
            <div class="compiler-copy">
              <h3>一次模板创建，之后只做局部赋值</h3>
              <p>
                <code>template()</code> 返回真实的元素；<code>insert()</code>{" "}
                把信号接到具体的文本节点。按钮上的两段动态文本各管各的，不会牵连整棵子树。
              </p>
              <div class="compiler-list">
                <div class="compiler-item">
                  <span class="idx">01</span>
                  <p>JSX 中的静态结构在构建期被提取成模板字符串。</p>
                </div>
                <div class="compiler-item">
                  <span class="idx">02</span>
                  <p>事件通过委托统一挂载，避免为每个按钮创建监听器。</p>
                </div>
                <div class="compiler-item">
                  <span class="idx">03</span>
                  <p>每个动态表达式生成自己的更新闭包，依赖变化时独立触发。</p>
                </div>
              </div>
              <div class="compiler-facts">
                <div class="compiler-fact">
                  <strong>0</strong>
                  <span>运行时树对比</span>
                </div>
                <div class="compiler-fact">
                  <strong>1</strong>
                  <span>模板创建次数</span>
                </div>
                <div class="compiler-fact">
                  <strong>2</strong>
                  <span>独立文本更新</span>
                </div>
              </div>
            </div>
            <div>
              <SnippetTabs
                label="编译产物"
                tabs={[
                  {
                    id: "compiled",
                    label: "编译产物",
                    fileLabel: "counter.js",
                    data: counterCompiled,
                  },
                  {
                    id: "source",
                    label: "对照源码",
                    fileLabel: "Counter.tsx",
                    data: counterSource,
                  },
                ]}
                tone="light"
              />
            </div>
          </div>
        </div>
      </section>

      <section class="section">
        <div class="shell features-layout">
          <aside class="features-aside">
            <span class="section-index">03 / 设计取向</span>
            <h2>
              为运行时做减法，<span class="nowrap">为组合</span>做加法。
            </h2>
            <p class="pullquote">
              组件就是函数，渲染完全由你如何使用状态决定。Solid
              提倡声明式代码与读写分离，但不会用一套新的渲染规则挡住你。
            </p>
            <A href="/docs/reactivity" class="inline-link">
              读响应式模型
            </A>
          </aside>

          <div class="ledger">
            <For each={features}>
              {(feature, index) => (
                <div class="ledger-row">
                  <span class="ledger-index">
                    {String(index() + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h3 class="ledger-title">{feature.title}</h3>
                    <p class="ledger-desc">{feature.desc}</p>
                  </div>
                </div>
              )}
            </For>
          </div>
        </div>
      </section>

      <section class="section home-docs">
        <div class="shell home-docs-grid">
          <div class="home-docs-intro">
            <span class="section-index">04 / 阅读路径</span>
            <h2 class="section-title">
              11 章，从第一次渲染到{" "}
              <span class="nowrap">流式 SSR</span>。
            </h2>
            <p class="section-lede" style={{ "margin-top": "16px" }}>
              按顺序读，会得到一套完整的响应式心智模型；也可以从任意一章进入，章节之间保留了必要的回链。
            </p>
            <A href="/docs" class="btn btn-ghost btn-sm">
              打开文档总览
            </A>
          </div>

          <div class="chapter-columns">
            <For each={docGroups}>
              {(group) => (
                <div class="chapter-column">
                  <h3>{group.name}</h3>
                  <For each={group.docs}>
                    {(item) => (
                      <A href={`/docs/${item.slug}`}>
                        <span class="num">{item.chapter}</span>
                        <span>{item.navTitle}</span>
                      </A>
                    )}
                  </For>
                </div>
              )}
            </For>
          </div>
        </div>
      </section>

      <section class="start-band">
        <div class="shell start-grid">
          <div class="start-copy">
            <span class="section-index">05 / 上手</span>
            <h2 class="start-title">
              几条命令，得到一个<span class="nowrap">完整的</span> Solid 工程。
            </h2>
            <p>
              官方模板默认使用 Vite，自带 TypeScript、热更新与生产构建。下面的命令任选一种包管理器，创建后即可开始写第一个信号。
            </p>
            <div class="start-links">
              <A href="/docs/getting-started" class="btn btn-on-cobalt">
                查看快速开始
              </A>
              <a
                href="https://www.solidjs.com/tutorial/introduction_basics"
                target="_blank"
                rel="noreferrer"
                class="start-link"
              >
                先逛交互式教程
              </a>
            </div>
          </div>

          <div class="terminal">
            <div class="terminal-bar">
              <span>terminal · my-app</span>
              <span>TypeScript</span>
            </div>
            <div class="terminal-tabs" role="tablist" aria-label="包管理器">
              <For each={terminalTabs}>
                {(tab) => (
                  <button
                    type="button"
                    role="tab"
                    class="tab"
                    aria-selected={currentTerminal().id === tab.id}
                    onClick={() => setTerminal(tab)}
                  >
                    {tab.label}
                  </button>
                )}
              </For>
            </div>
            <div class="terminal-code">
              <div innerHTML={currentTerminal().data.html} />
              <CopyButton code={currentTerminal().data.code} />
            </div>
            <div class="terminal-foot">
              <span>Vite + TypeScript 模板</span>
              <span>Solid 1.9</span>
            </div>
          </div>
        </div>
      </section>

      <section class="section">
        <div class="shell">
          <div class="section-head">
            <div class="section-head-copy">
              <span class="section-index">06 / 社区</span>
              <h2 class="section-title">代码之外，还有一群人。</h2>
            </div>
            <p class="section-lede">
              Solid 的创建者与核心团队活跃在 Discord。无论是第一次创建项目，还是准备给内核提
              PR，都可以直接来聊。生态里的工具与组件库也大多开源维护。
            </p>
          </div>

          <div class="community-grid">
            <div class="community-copy">
              <p>
                Solid 支持近两年发布的主流浏览器（Firefox、Safari、Chrome、Edge，桌面与移动端），不支持
                IE 及已停止维护的浏览器。服务端支持 Node LTS、Deno 与 Cloudflare Workers。
              </p>
              <div class="community-links">
                <a href={DISCORD_URL} target="_blank" rel="noreferrer">
                  Discord
                </a>
                <a href={GITHUB_URL} target="_blank" rel="noreferrer">
                  GitHub
                </a>
                <a href={REDDIT_URL} target="_blank" rel="noreferrer">
                  Reddit
                </a>
                <a href={OPEN_COLLECTIVE_URL} target="_blank" rel="noreferrer">
                  Open Collective
                </a>
                <a href={DOCS_URL} target="_blank" rel="noreferrer">
                  官方文档
                </a>
              </div>
              <p class="community-note">
                贡献方式不只有写代码：补一段示例、修一处文档、在 Discord
                回答问题，都算。捐赠通过 Open Collective 进入项目账户。
              </p>
            </div>

            <div class="eco-list">
              <For each={ecosystem}>
                {(item) => (
                  <a
                    class="eco-item"
                    href={item.href}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <span class="eco-name">
                      {item.name}
                      <span class="mono">{item.tag}</span>
                    </span>
                    <p>{item.desc}</p>
                  </a>
                )}
              </For>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
