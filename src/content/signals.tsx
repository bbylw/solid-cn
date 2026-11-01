import { A } from "@solidjs/router";
import { Callout, CodeBlock, DemoFrame } from "../components/Code";
import { CounterLab } from "../components/demos/CounterLab";
import signalBasic from "./snippets/signal-basic.tsx.txt?shiki";
import derived from "./snippets/derived.tsx.txt?shiki";

export default function Signals() {
  return (
    <>
      <p>
        信号是 Solid 最小的状态单元。它保存一个值，并知道哪些代码读过它。
        <code>createMemo</code> 则把一段派生计算缓存成一个只读信号。掌握这两个原语，
        就能写出大部分界面状态。
      </p>

      <h2 id="create-signal">创建信号</h2>
      <p>
        <code>createSignal</code> 接收初始值，返回 <code>[读取函数, 写入函数]</code>{" "}
        二元组。读取函数通常叫 getter，写入函数叫 setter。命名习惯是{" "}
        <code>count / setCount</code>，也可以叫 <code>value / setValue</code>。
      </p>
      <CodeBlock data={signalBasic} label="signals.ts" />
      <p>
        初始值就是信号保存的值，<code>createSignal</code> 不会调用它。
        因此需要先计算再传入；昂贵的数据准备交给资源或挂载后的流程，不要指望初始值被惰性求值。
      </p>

      <h2 id="read-write">读取与写入</h2>
      <p>
        读取就是调用 getter：<code>count()</code>。写入有三种常见形式：
      </p>
      <ul>
        <li>
          <strong>直接写入</strong>：<code>setCount(3)</code>。
        </li>
        <li>
          <strong>函数式更新</strong>：<code>setCount((prev) =&gt; prev + 1)</code>，
          基于上一次的值计算，连续调用也不会丢更新。
        </li>
        <li>
          <strong>传入函数值</strong>：如果新值本身是函数，需要写成{" "}
          <code>setHandler(() =&gt; nextHandler)</code>，避免被当成更新函数执行。
        </li>
      </ul>
      <p>
        setter 使用 <code>===</code> 比较新旧值。写入相同的原始值不会触发更新；
        对象和数组则必须替换引用，原处修改属性不会通知任何人。
      </p>
      <Callout title="读取位置决定订阅">
        <p>
          只有在跟踪作用域（JSX 表达式、<code>createMemo</code>、<code>createEffect</code>、
          <code>on</code> 等）里读取信号，才会建立订阅。在普通函数或事件处理器里读取，
          只是拿到当前值，不会让那段代码在下次更新时重新执行。
        </p>
      </Callout>

      <h2 id="derived">派生值</h2>
      <p>
        派生值不需要单独的状态。把表达式包进函数，Solid
        会在读取时自动追踪依赖；包进 <code>createMemo</code>，还会缓存上一次的结果。
      </p>
      <CodeBlock data={derived} label="derived.ts" />
      <p>
        memo 在创建时立即计算一次并记下依赖，之后只有依赖变化才重新计算。
        如果重新计算得到相同的值（仍然用 <code>===</code> 比较），下游不会收到通知。
        这让“总价没变就不更新运费提示”这类逻辑自然成立。
      </p>

      <h2 id="lab">交互演示</h2>
      <p>
        下面的计数器同时维护 <code>count</code> 和步长 <code>step</code>，两个派生
        memo 分别计算双倍值与奇偶性。改变步长不会重新计算派生值，因为 memo
        只订阅了 <code>count</code>。
      </p>
      <DemoFrame
        label="signals · counter lab"
        note="写入记录展示每次 setCount 的调用形式；派生值只在 count 变化时更新。"
      >
        <CounterLab />
      </DemoFrame>

      <h2 id="memo-or-function">memo 还是普通函数</h2>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>写法</th>
              <th>何时使用</th>
              <th>行为</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <code>const double = () =&gt; count() * 2</code>
              </td>
              <td>计算便宜，只在少数地方读取</td>
              <td>每次读取都重新计算，自动追踪依赖</td>
            </tr>
            <tr>
              <td>
                <code>const double = createMemo(...)</code>
              </td>
              <td>计算昂贵、被多处读取，或需要稳定引用</td>
              <td>缓存结果，依赖变化才重算</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p>
        一个实用判断：先写普通函数，确认它成为性能热点或多处共用的派生来源，再升级为 memo。
        把每个表达式都包成 memo 只会增加调度开销，也让依赖关系更难读。
      </p>
      <p>
        memo 也适合作为 effect 的依赖来源。把一个对象派生为 memo，可以保证对象引用只在内容变化时更新，
        避免 effect 因为每次都是新对象而重复运行。
      </p>

      <h2 id="caveats">注意事项</h2>
      <ul>
        <li>
          <strong>别忘了调用。</strong> <code>count</code> 是函数，<code>count()</code> 才是值。
          在 JSX 里写 <code>{"{count}"}</code> 不会报错，但显示的是函数源码。
        </li>
        <li>
          <strong>派生值保持纯函数。</strong> memo 与派生函数里只读取状态、计算返回值；
          写入状态请放到事件处理或 effect 中，否则容易形成循环依赖。
        </li>
        <li>
          <strong>集合更新要换引用。</strong> 数组用展开或 <code>map</code> 生成新数组；
          深层对象可以改用 <A href="/docs/stores">Store</A>，它支持路径更新。
        </li>
        <li>
          <strong>组件外创建要学会清理。</strong> 在组件树之外建立响应式系统时，用{" "}
          <code>createRoot</code> 包一层，确保 memo 与 effect 有所有者并在结束时释放。
        </li>
      </ul>
      <p>
        下一章会把状态同步到 DOM 之外的系统：网络请求、定时器、订阅与第三方库，这些都属于 effect 的工作。
      </p>
    </>
  );
}
