import { A } from "@solidjs/router";
import { Callout, CodeBlock } from "../components/Code";
import contextSnippet from "./snippets/context.tsx.txt?shiki";
import contextUsage from "./snippets/context-usage.tsx.txt?shiki";
import contextSnapshot from "./snippets/context-snapshot.tsx.txt?shiki";
import contextHook from "./snippets/context-hook.ts.txt?shiki";

export default function Context() {
  return (
    <>
      <p>
        Context 解决“隔了很多层还要传值”的问题。主题、语言、当前用户、路由信息都适合放在 context
        上：Provider 在树上提供值，任何后代都能直接取用，不必逐层透传 props。
      </p>

      <h2 id="define-context">定义 context</h2>
      <p>
        用 <code>createContext</code> 创建一个带类型的 context 对象。类型参数描述“提供的值是什么”，
        返回值可能为 <code>undefined</code>，因此消费时要处理未提供的情况。
      </p>
      <CodeBlock data={contextSnippet} label="theme-context.tsx" />
      <p>
        这里把默认值留空，让类型系统提醒消费方：如果没有 Provider，取到的就是{" "}
        <code>undefined</code>。也可以在创建时传入一个默认值，但默认值应当是真正可用的回退，
        而不是为了绕过类型检查。
      </p>

      <h2 id="provider-consumer">Provider 与 useContext</h2>
      <p>
        Provider 是一个组件，用 <code>value</code> 提供数据；后代用 <code>useContext</code>{" "}
        读取。Provider 可以嵌套，最近的 Provider 生效。
      </p>
      <CodeBlock data={contextUsage} label="provider.tsx" />
      <p>
        消费方可以是任意深度的组件，只要它位于 Provider 子树内。修改 context
        值不会导致“整棵树重渲染”；只有读到该值的具体代码会更新，这一点和信号一致。
      </p>
      <Callout title="Context 不是状态容器">
        <p>
          Context 只负责传递，不负责存储。状态仍然放在信号或 store 里，再把读写方式放进 Provider。
          把两者混在一起，容易以为 context 自带响应性。
        </p>
      </Callout>

      <h2 id="reactive-value">让值保持响应式</h2>
      <p>
        Solid 组件只运行一次，因此传给 <code>value</code> 的表达式也只会求值一次。如果直接把{" "}
        <code>theme()</code> 的结果传进去，context 里就是一个固定快照，之后不会变。
      </p>
      <p>正确做法是传“读取方式”，而不是“当前值”：</p>
      <ul>
        <li>
          <strong>单一值</strong>：把 signal 的 getter 传进去，消费方调用 <code>theme()</code>。
        </li>
        <li>
          <strong>一组值</strong>：传一个对象，把主题写成 getter（<code>get theme()</code>），
          这样读取字段时仍然会追踪底层的 signal。
        </li>
        <li>
          <strong>复杂状态</strong>：直接传 store，消费方按属性读取，天然保持细粒度订阅。
        </li>
      </ul>
      <p>
        下面这种写法看起来方便，但只会在初始化时读取一次，主题切换后消费方不会更新：
      </p>
      <CodeBlock data={contextSnapshot} label="provider.tsx" />

      <h2 id="custom-hook">封装自定义 hook</h2>
      <p>
        把 <code>useContext</code> 包进一个函数，统一处理“未提供”的错误，并给消费方一个稳定的 API。
        这样组件不需要知道 context 对象本身，替换实现时也只改一处。
      </p>
      <CodeBlock data={contextHook} label="use-theme.ts" />
      <p>
        返回值可以是一个 getter，也可以是一个带访问器的对象。保持返回结构稳定，比在多个组件里直接{" "}
        <code>useContext</code> 更容易维护。
      </p>

      <h2 id="caveats">注意事项</h2>
      <ul>
        <li>
          <strong>先检查再使用。</strong> 没有 Provider 时读到的是 <code>undefined</code>。
          在 hook 里抛出清晰错误，比在深层组件里出现“Cannot read properties of undefined”更好排查。
        </li>
        <li>
          <strong>Provider 要包住消费方。</strong> context 的值只向下传递；兄弟节点或上层组件拿不到。
        </li>
        <li>
          <strong>不要用 context 代替所有 props。</strong> 一层之隔的组件直接传 props
          更明确；context 适合真正跨越多层、或由组合根统一注入的依赖。
        </li>
        <li>
          <strong>值保持稳定。</strong> 每次创建新对象并不会自动触发更新（组件只运行一次），
          但会让“读取方式”变得混乱。优先传 signal、store，或属性为 getter 的稳定对象。
        </li>
      </ul>
      <p>
        下一章转向视图本身：组件如何返回 DOM、props 为什么不能用解构、children 和 ref
        分别适合什么场景。
      </p>
      <p>
        相关阅读：<A href="/docs/stores">Store 状态</A>、<A href="/docs/components">组件与 JSX</A>。
      </p>
    </>
  );
}
