import { A } from "@solidjs/router";
import { Callout, CodeBlock } from "../components/Code";
import effectSnippet from "./snippets/effect.tsx.txt?shiki";
import onSnippet from "./snippets/effect-on.ts.txt?shiki";
import lifecycle from "./snippets/lifecycle.tsx.txt?shiki";
import cleanup from "./snippets/cleanup.tsx.txt?shiki";

export default function Effects() {
  return (
    <>
      <p>
        effect 用来把响应式状态同步到 DOM 之外的世界：发请求、开定时器、绑定事件、操作第三方库。
        它不是“任何需要响应变化的地方”，更不是派生值的替代品。
      </p>

      <h2 id="create-effect">创建 effect</h2>
      <p>
        <code>createEffect</code> 接收一个函数，在首次渲染完成后运行，之后每当函数体读取过的信号变化，
        就重新运行。
      </p>
      <CodeBlock data={effectSnippet} label="effect.ts" />
      <p>
        effect 的执行发生在当前更新周期的末尾：DOM 绑定先拿到新值，effect 随后看到更新后的界面。
        它不会等待下一帧，也不会像 React 的 <code>useEffect</code> 那样按依赖数组决定是否跳过。
      </p>
      <Callout title="先问一句：这是副作用吗？">
        <p>
          如果目标只是从现有状态算出一个新值，用普通函数或 <code>createMemo</code>。
          只有当事情发生在响应式系统之外（网络、计时器、DOM API、订阅），才需要 effect。
          把派生逻辑塞进 effect 会多一次更新，也更容易写出循环。
        </p>
      </Callout>

      <h2 id="auto-tracking">依赖自动追踪</h2>
      <p>
        effect 在运行时读取了什么，就订阅什么。没有依赖数组，也不需要在来源变化时手动重跑。
        如果读取发生在条件分支里，订阅也会随分支变化而更新。
      </p>
      <p>
        有时你希望“只关心某一个来源”，或者需要在 effect 里读取其他信号却不订阅它们。这两种需求分别由{" "}
        <code>on</code> 与 <code>untrack</code> 处理。
      </p>
      <CodeBlock data={onSnippet} label="effect-on.ts" />
      <ul>
        <li>
          <code>on(userId, fn)</code> 把依赖显式收窄到 <code>userId</code>，默认在创建时先执行一次；
          传 <code>{"{ defer: true }"}</code> 可以跳过首次执行。
        </li>
        <li>
          <code>untrack(fn)</code> 在函数内读取信号但不建立订阅，适合读取“当时的值”作为快照。
        </li>
      </ul>
      <p>
        多来源依赖仍建议直接读取。自动追踪比手写数组更可靠，尤其是在分支和循环里。
      </p>

      <h2 id="lifecycle">onMount</h2>
      <p>
        <code>onMount</code> 是只在客户端首次挂载后执行一次的便捷函数。它不追踪任何依赖，
        适合获取 DOM 引用、初始化第三方控件、注册只需一次的事件监听。
      </p>
      <CodeBlock data={lifecycle} label="lifecycle.tsx" />
      <p>
        组件在服务端渲染时不会执行 <code>onMount</code>，因为服务端没有真实 DOM。
        首次渲染期间就能确定的事情，直接放在组件函数体里即可；需要 DOM 或浏览器 API 的，
        放到 <code>onMount</code>。
      </p>

      <h2 id="cleanup">onCleanup</h2>
      <p>
        注册清理函数是 effect 生命周期的一半。清理会在两种时机执行：effect
        因依赖变化即将重新运行之前，以及拥有它的组件被卸载时。
      </p>
      <CodeBlock data={cleanup} label="cleanup.tsx" />
      <p>
        每轮 effect 都创建自己的 <code>AbortController</code> 并在清理时取消请求，因此输入新查询词时，
        旧请求会被中止，不会出现后到的旧结果覆盖新结果。定时器、事件监听、WebSocket
        连接都可以用同样的模式收尾。
      </p>
      <Callout title="清理函数是同步的" tone="warn">
        <p>
          <code>onCleanup</code> 不会等待 Promise。需要异步收尾时，在清理函数里启动任务即可，
          例如发出“离开房间”的通知；不要指望运行时等待它完成。
        </p>
      </Callout>

      <h2 id="pitfalls">常见误区</h2>
      <ul>
        <li>
          <strong>在 effect 里无条件写状态。</strong> effect 读取的值变化后会再次运行，如果每次都写入
          一个它自己读取的信号，就会形成循环。写入前加条件，或改用派生值。
        </li>
        <li>
          <strong>用 effect 同步派生状态。</strong>{" "}
          <code>fullName</code> 这类值应当直接由 <code>firstName</code> 与{" "}
          <code>lastName</code> 计算，而不是用 effect 写入另一个信号。
        </li>
        <li>
          <strong>忘记清理。</strong> 定时器与监听器不会因为组件卸载自动消失。每个外部资源都要有对应的{" "}
          <code>onCleanup</code>。
        </li>
        <li>
          <strong>在 effect 外读取还期待响应。</strong> effect 本身是跟踪作用域；事件处理函数不是。
          需要拿到“当时值”时读取即可，需要响应变化时把逻辑放进 effect 或 memo。
        </li>
      </ul>
      <p>
        effect 管的是“变化之后做什么”。下一章的 Store 则解决“状态本身很复杂时，怎样仍然只更新被改动的那一处”。
        两者可以组合使用：用 store 管理数据，用 effect 同步持久化。
      </p>
      <p>
        相关阅读：<A href="/docs/signals">信号与派生</A>、<A href="/docs/stores">Store 状态</A>、
        <A href="/docs/api">API 速查</A>。
      </p>
    </>
  );
}
