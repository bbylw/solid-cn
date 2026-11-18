import { Callout, CodeBlock } from "../components/Code";
import contextBasic from "./snippets/context.tsx.txt?shiki";
import contextUsage from "./snippets/context-usage.tsx.txt?shiki";
import contextSnapshot from "./snippets/context-snapshot.tsx.txt?shiki";
import contextTyped from "./snippets/context-hook.ts.txt?shiki";
import contextDefault from "./snippets/ctx-default.ts.txt?shiki";

export default function Context() {
  return (
    <>
      <p>
        Context 解决“隔了很多层还要传值”的问题。主题、语言、当前用户、路由信息都适合放在
        context 上：Provider 在树上提供值，任何后代都能直接取用，不必逐层透传 props。
      </p>
      <p>
        2.0 里两件事变简单了：context 对象本身就是 Provider，无默认值的 context
        直接把类型收窄成载荷本身。
      </p>

      <h2 id="define-context">定义 context</h2>
      <p>
        <code>createContext&lt;T&gt;()</code> 的 <code>T</code> 就是“提供的值是什么”，
        没有值可供推断时必须写出来。想传下去的是读取方式，就把 <code>T</code> 写成{" "}
        <code>Accessor&lt;Theme&gt;</code>：
      </p>
      <CodeBlock data={contextBasic} label="theme-context.tsx" />
      <p>
        这里不给默认值，于是 Provider 成为必需：忘了包就当场报错，而不是静悄悄地读到空值。
        默认值形式留给后面说的场景。
      </p>

      <h2 id="provider-consumer">提供与读取</h2>
      <Callout tone="warn" title="Provider 这一层没有了">
        <p>
          1.x 的 <code>{"<ThemeContext.Provider value={theme}>"}</code> 换成{" "}
          <code>{"<ThemeContext value={theme}>"}</code>。context 自己就是那个组件，
          只有一个 <code>value</code> prop。
        </p>
      </Callout>
      <p>
        Provider 可以嵌套，最近的生效。消费方可以是任意深度的组件，只要它位于 Provider
        子树内。改 context 的值不会“整棵树重渲染”：只有读到该值的具体代码会更新，
        这一点和信号一致。
      </p>
      <p>
        真正需要共享的往往是一组状态和改它的方式。把它们放进一个元组，类型一次说清；
        消费方解构出来直接用：<code>useContext</code> 返回的就是 <code>TodosCtx</code>。
      </p>
      <CodeBlock data={contextUsage} label="todos-context.tsx" />

      <h2 id="missing-provider">没有 Provider 会怎样</h2>
      <p>
        无默认值的 context，<code>useContext</code> 直接返回 <code>T</code>：
        类型里没有 <code>undefined</code>，运行时找不到 Provider 就抛{" "}
        <code>ContextNotFoundError</code>。dev 的消息会说清命中哪种情况；创建时传一个 name（
        <code>{"createContext<T>(undefined, { name: \"Session\" })"}</code>），
        消息还会点名是哪个 context。
      </p>
      <Callout tone="warn" title="包装钩子可以删了">
        <p>
          1.x 常见的 <code>useSession</code> 那种“判空再抛”的包装钩子，只是为了把{" "}
          <code>T | undefined</code> 收窄成 <code>T</code>。2.0 的类型已经收窄，
          异常也已经由运行时抛出，这类包装只是多余的样板。
        </p>
      </Callout>
      <CodeBlock data={contextTyped} label="session-context.ts" />
      <p>
        还有一条规则要记住：<code>undefined</code> 永远不是 context 的值，它表示“没提供”。
        <code>{"createContext<T | undefined>(undefined)"}</code> 仍是无默认值形式，
        Provider 传 <code>{"value={undefined}"}</code> 也等于没传，两者都会抛{" "}
        <code>ContextNotFoundError</code>。可缺省的 context 用 <code>null</code>{" "}
        当空值：<code>{"createContext<T | null>(null)"}</code> 在 Provider 之外返回{" "}
        <code>null</code>，Provider 也可以显式提供 <code>null</code>。
      </p>

      <h2 id="reactive-value">让值保持响应式</h2>
      <p>
        Solid 组件只运行一次，传给 <code>value</code> 的表达式也只求值一次。直接把{" "}
        <code>theme()</code> 的结果传进去，context 里就是一份固定快照，之后不会变。
      </p>
      <CodeBlock data={contextSnapshot} label="provider.tsx" />
      <p>正确做法是传“读取方式”，而不是“当前值”：</p>
      <ul>
        <li>
          <strong>单一值</strong>：把 signal 的 getter 传进去，消费方调用{" "}
          <code>theme()</code>。
        </li>
        <li>
          <strong>一组值</strong>：传一个对象，把字段写成 getter（<code>get theme()</code>），
          读取字段时仍然追踪底层的 signal。
        </li>
        <li>
          <strong>复杂状态</strong>：直接传 store，消费方按属性读取，天然保持细粒度订阅——
          这就是上一章<a href="/docs/stores">草稿写入</a>与 context 的接合点。
        </li>
      </ul>
      <Callout tone="warn" title="Context 不是状态容器">
        <p>
          Context 只负责传递，不负责存储。状态仍然放在信号或 store 里，再把读写方式放进
          Provider；把两者混在一起，容易误以为 context 自带响应性。
        </p>
      </Callout>

      <h2 id="state-or-default">状态用无默认值，回退用默认值</h2>
      <p>
        <code>{"createContext<T>(defaultValue)"}</code> 这个形式在 2.0 里没变，
        <code>useContext</code> 在任何 Provider 之外返回默认值。它只适合“静态回退”：
        主题、语言、一份冻结的配置。
      </p>
      <CodeBlock data={contextDefault} label="locale-context.ts" />
      <p>
        带响应式状态的载荷不要给默认值：一个所有人都回退到的空 store，
        会把“忘了放 Provider”变成一次静默的错误。另外，状态要在组件里创建而不是模块顶层——
        SSR 下模块作用域在同一进程里被所有请求共享，只有常量和{" "}
        <code>createContext</code> 这一行适合放在那里；在组件里创建的值由 Provider
        拥有并随它销毁。
      </p>

      <h2 id="caveats">注意事项</h2>
      <ul>
        <li>
          <strong>Provider 要包住消费方。</strong> context 的值只向下传递；兄弟节点或上层
          组件拿不到。
        </li>
        <li>
          <strong>不要用 context 代替所有 props。</strong> 一层之隔的组件直接传 props
          更明确；context 适合真正跨越多层、或由组合根统一注入的依赖。
        </li>
        <li>
          <strong>值保持稳定。</strong> 组件只运行一次，所以载荷对象也就创建一次；
          把它当“每次渲染重建的对象”来设计是错的。优先传 signal、store，或字段是 getter
          的稳定对象。
        </li>
        <li>
          <strong>缺失时先修组合，不要先修类型。</strong> 抛{" "}
          <code>ContextNotFoundError</code> 说明应用树的某一层没接上：把 Provider
          补到共同祖先上，比在消费方加判空更贴近真相。
        </li>
      </ul>
      <p>
        下一章转向视图本身：组件如何返回 DOM、props 为什么不能用解构、children 和 ref
        分别适合什么场景。
      </p>
      <p>
        相关阅读：<a href="/docs/stores">Store 状态</a>、
        <a href="/docs/components">组件与 JSX</a>、<a href="/docs/api">API 速查</a>。
      </p>
    </>
  );
}
