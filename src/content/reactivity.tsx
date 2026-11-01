import { A } from "@solidjs/router";
import { Callout, CodeBlock, SnippetTabs } from "../components/Code";
import counterSource from "./snippets/counter.tsx.txt?shiki";
import counterCompiled from "./snippets/counter-compiled.js.txt?shiki";
import batchSnippet from "./snippets/batch.tsx.txt?shiki";

export default function Reactivity() {
  return (
    <>
      <p>
        Solid 的性能来自一个简单的前提：<strong>界面更新的单位不是组件，而是读取过某段状态的代码。</strong>{" "}
        信号保存值，也记录谁读过它；值变化时，运行时只通知这些订阅者。理解这张依赖图，后面所有 API
        的行为都会变得顺理成章。
      </p>

      <h2 id="where-updates-happen">更新发生在哪里</h2>
      <p>
        在虚拟 DOM 框架里，状态变化通常会标记组件为“脏”，再重新执行组件函数、生成一棵新树、与旧树比较，
        最后把差异写进真实 DOM。Solid 跳过了后面几步。编译器在构建期就知道哪些表达式是动态的，
        并给每个表达式生成独立的更新函数；运行时只需要在依赖变化时执行对应的那一个函数。
      </p>
      <p>
        看一个计数器。<code>count()</code> 出现在按钮文本里，<code>doubleCount()</code>{" "}
        出现在另一段文本里。点击按钮时，只有这两个文本节点会收到新值，按钮元素本身、组件的其他部分都不会被重建。
      </p>

      <SnippetTabs
        label="计数器：源码与编译产物"
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

      <p>
        编译产物里没有 diff，也没有组件级重渲染。{" "}
        <code>template()</code> 创建一次真实 DOM，<code>insert()</code>{" "}
        把信号绑定到具体的文本节点。状态更新时，绑定自己更新自己。
      </p>

      <h2 id="signals-and-subscribers">信号与订阅者</h2>
      <p>
        <code>createSignal</code> 返回一对函数：调用 getter 读取当前值，调用 setter
        写入新值。订阅发生在读取的那一刻——但只有当读取发生在<strong>跟踪作用域</strong>
        里，运行时才会把“这段代码”登记为订阅者。JSX 绑定、<code>createMemo</code> 和{" "}
        <code>createEffect</code> 的参数函数，都是天然的跟踪作用域。
      </p>
      <p>一次更新沿依赖图传播，大致是这个过程：</p>
      <ol>
        <li>setter 写入新值，与旧值不同才继续。</li>
        <li>运行时找出直接读取过这个信号的 computation，把它们标记为待更新。</li>
        <li>memo 重新计算，若结果没变，就不再通知它的下游。</li>
        <li>DOM 绑定与 effect 拿到新值，执行各自的工作。</li>
      </ol>
      <p>
        这张图是<strong>拉取与推送结合</strong>的：信号向下推送“可能变了”的标记，
        运行时再按依赖顺序更新受影响的计算；如果读取发生在更新之前，计算会先补齐最新值。
        派生值只在依赖变化时重算，不会因为无关信号而工作。
      </p>
      <Callout title="自动追踪，而不是依赖数组">
        <p>
          在跟踪作用域里读到什么，就订阅什么。条件分支里没读到的信号不会建立订阅；
          下次条件变化后读到了新的信号，订阅关系会自动更新。没有手写依赖数组，也就没有遗漏。
        </p>
      </Callout>

      <h2 id="run-once">组件只运行一次</h2>
      <p>
        Solid 组件是普通的 JavaScript 函数，职责是<strong>搭建一次视图</strong>。挂载时函数执行，
        创建 DOM、建立绑定、注册清理，然后返回节点。之后的交互不再进入这个函数体。
      </p>
      <p>
        这与“函数组件每次状态变化都重跑”的心智模型完全不同。你不需要把逻辑塞进{" "}
        <code>useEffect</code> 的依赖数组里，也不必担心闭包捕获了旧值——因为函数体根本没有重新执行，
        里头的每个读取都通过 getter 拿到当前值。
      </p>
      <p>
        需要动态结构时，Solid 用 <code>Show</code>、<code>For</code>、<code>Switch</code>{" "}
        这类控制流组件表达。它们各自管理自己的订阅与清理；某个分支切换时，只有该分支的节点会创建或销毁。
      </p>
      <Callout title="“一次”指每次挂载" tone="warn">
        <p>
          组件在同一个挂载周期内只执行一次；被卸载后再次挂载，则会重新执行。
          列表项的渲染函数、条件分支里的子组件也遵循同样的规则：进入界面时执行一次。
        </p>
      </Callout>

      <h2 id="sync-and-batch">同步更新与批处理</h2>
      <p>
        Solid 的写入是同步的：调用 setter 之后，依赖它的更新会在当前更新周期内完成，而不是等到下一帧。
        这让状态变化与 DOM 结果之间的关系非常直接，也方便在写入后立即读取 DOM。
      </p>
      <p>
        一次操作里连续写多个信号时，中间状态可能触发多余计算。用 <code>batch</code> 把写入包起来，
        依赖它们的代码只会在批处理结束后运行一次。
      </p>
      <CodeBlock data={batchSnippet} label="batch.ts" />
      <p>
        与批处理相关、但在路由或异步场景更常用的是 <code>startTransition</code>：
        它把更新标记为可中断的过渡，让紧急交互（输入、点击）不被大量渲染阻塞。
      </p>

      <h2 id="different-from-vdom">与虚拟 DOM 的差别</h2>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>维度</th>
              <th>虚拟 DOM 框架</th>
              <th>Solid</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>更新单位</td>
              <td>组件或子树重新渲染</td>
              <td>读取了该状态的 DOM 绑定</td>
            </tr>
            <tr>
              <td>运行时工作</td>
              <td>生成新树并与旧树比较</td>
              <td>沿依赖图通知订阅者</td>
            </tr>
            <tr>
              <td>组件函数</td>
              <td>状态变化时反复执行</td>
              <td>每次挂载只执行一次</td>
            </tr>
            <tr>
              <td>依赖声明</td>
              <td>手写依赖数组或编译器推断</td>
              <td>读取即订阅，自动追踪</td>
            </tr>
            <tr>
              <td>调试</td>
              <td>需要对应虚拟树与真实 DOM</td>
              <td>页面上就是最终 DOM，可直接检查</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p>
        这些差别不影响 JSX 的写法，却会改变你组织代码的方式。状态尽量放在“真正读取它的地方”附近，
        派生值写成函数或 memo，副作用留给 effect。组件树只负责结构。
      </p>

      <h2 id="next">继续阅读</h2>
      <p>
        下一章从最小的状态单元开始，把信号、setter 与派生值写一遍，并在交互演示里观察依赖如何更新。
      </p>
      <ul>
        <li>
          <A href="/docs/signals">信号与派生</A>：createSignal、createMemo 与函数式派生。
        </li>
        <li>
          <A href="/docs/effects">副作用与生命周期</A>：状态如何同步到外部世界。
        </li>
        <li>
          <A href="/docs/stores">Store 状态</A>：嵌套对象与数组的细粒度订阅。
        </li>
      </ul>
    </>
  );
}
