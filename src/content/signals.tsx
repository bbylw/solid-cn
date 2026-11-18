import { Callout, CodeBlock, DemoFrame } from "../components/Code";
import { CounterLab } from "../components/demos/CounterLab";
import signalBasic from "./snippets/signal-basic.tsx.txt?shiki";
import derived from "./snippets/derived.tsx.txt?shiki";
import writable from "./snippets/sig-writable.ts.txt?shiki";
import ownership from "./snippets/sig-ownership.ts.txt?shiki";

export default function Signals() {
  return (
    <>
      <p>
        信号是 Solid 最小的状态单元。它保存一个值，并知道哪些代码读过它。
        <code>createMemo</code> 把一段派生计算缓存成只读值，函数形式的{" "}
        <code>createSignal</code> 则给出“可写的派生值”。掌握这三样，就能写出大部分界面状态。
      </p>

      <h2 id="create-signal">创建信号</h2>
      <p>
        <code>createSignal</code> 接收初始值，返回 <code>[读取函数, 写入函数]</code>{" "}
        二元组，习惯上命名为 <code>count / setCount</code>。
      </p>
      <CodeBlock data={signalBasic} label="signal.ts" />
      <p>
        初始值就是信号保存的值，<code>createSignal</code> 不会去调用它。因此需要先算好再传进来；
        昂贵的准备交给挂载后的流程，不要指望初始值被惰性求值。
      </p>
      <p>
        唯一的例外是<strong>传函数</strong>：那不是“值恰好是个函数”，而是另一种原语——可写派生信号，
        见下文<a href="#writable-derived">可写派生信号</a>。
      </p>

      <h2 id="read-write">读取与写入</h2>
      <p>读取就是调用 getter：<code>count()</code>。写入有两条常规形式：</p>
      <ul>
        <li>
          <strong>直接写入</strong>：<code>setCount(3)</code>。
        </li>
        <li>
          <strong>函数式更新</strong>：<code>setCount((prev) =&gt; prev + 1)</code>，
          基于当前值计算，连续调用也不会丢更新。
        </li>
      </ul>
      <p>
        setter 默认用 <code>===</code> 比较新旧值，写入相同的原始值不会通知任何人；
        对象和数组必须整体替换，原处改属性谁也不会收到。需要每次都通知，可以建信号时传{" "}
        <code>{"{ equals: false }"}</code>。
      </p>
      <Callout title="1.x → 2.0：读取滞后于写入" tone="warn">
        <p>
          <code>setCount(1); count()</code> 现在返回的是<strong>旧值</strong>。
          写入只负责排队，微任务结束（或你调用 <code>flush()</code>）时才提交。
          需要同一个值再算一遍，就把它存进局部变量，别回读信号。
        </p>
      </Callout>
      <Callout title="读取的位置决定订阅">
        <p>
          只有在跟踪作用域（JSX 表达式、<code>createMemo</code>、effect 的 compute）里读取才建立订阅；
          事件处理器里读取只是拿当下一刻的值。反过来，2.0 在组件函数体顶层读取会 dev{" "}
          告警：那种读取既不会更新，也不该发生。要么放进 JSX 表达式，要么包进 memo，
          确实只想要一次性快照时用 <code>untrack(() =&gt; count())</code> 明说。
        </p>
      </Callout>

      <h2 id="derived">派生值</h2>
      <p>
        派生值不需要单独的状态。把表达式包进函数，读取时自动追踪依赖；包进{" "}
        <code>createMemo</code>，还会缓存结果，只在依赖变化时重算。
      </p>
      <CodeBlock data={derived} label="derived.ts" />
      <p>
        两个 2.0 的签名变化要留意：<code>createMemo</code> 的第二个参数现在是{" "}
        <strong>options</strong>，1.x 放在那个位置 <code>initialValue</code>{" "}
        已经没有了；compute 的第一个参数是上一轮的结果，首次为 <code>undefined</code>，
        需要起点就用参数默认值。
      </p>
      <p>
        options 里最常用的是 <code>equals</code> 与 <code>lazy</code>。memo 默认用{" "}
        <code>===</code> 比较结果，返回对象或数组时几乎总是“不相等”，下游于是每轮都跑一次空更新——
        给一个按内容比较的 <code>equals</code> 就够了。<code>lazy: true</code>{" "}
        把第一次计算推迟到首次读取，并且让 memo 在没有订阅者时自动销毁，适合放在未必会渲染的分支里。
      </p>

      <h3 id="memo-or-function">memo 还是普通函数</h3>
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
              <td>每个读取处各自重算，依赖照常自动追踪</td>
            </tr>
            <tr>
              <td>
                <code>const double = createMemo(...)</code>
              </td>
              <td>计算昂贵、被多处读取，或需要稳定引用</td>
              <td>只算一次并缓存，依赖变化才重算</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p>
        实用判断：先写普通函数，等它确认成为热点、或者要喂给多处共用，再升级成 memo。
        把每个表达式都包成 memo 只会增加调度开销，也让依赖关系更难读。
      </p>

      <h2 id="writable-derived">可写派生信号</h2>
      <p>
        <code>createSignal(fn)</code> 创建的是<strong>可写派生信号</strong>：值由 <code>fn</code>{" "}
        算出，同时保留一个正常可用的 setter。它取代了 1.x 里 <code>createComputed</code>{" "}
        回写信号的写法——那个原语在 2.0 已经不存在。
      </p>
      <CodeBlock data={writable} label="writable-derived.ts" />
      <p>
        语义要点：写入照常排队生效，但<strong>写入不会重跑那个函数</strong>；只有在它的来源变化时函数才重新运行，
        并把你的写入作为 <code>prev</code> 传进来，由它决定保留什么。想在来源变化后守住本地改动，
        就把“是否守住”记在数据里（例如一个 <code>pinned</code> 标记），由函数自己判断，
        而不是再挂一个 effect 往回写。
      </p>

      <h2 id="ownership">所有者与销毁</h2>
      <p>
        每个响应式计算都有一个<strong>所有者</strong>，决定它活多久。组件创建的 memo 与 effect
        跟着组件一起销毁；在组件之外建的图需要有人收尾，否则就是泄漏。
      </p>
      <CodeBlock data={ownership} label="ownership.ts" />
      <p>
        2.0 改了默认值：<strong>嵌套的 <code>createRoot</code> 归外层所有者所有</strong>，
        外层销毁时它也销毁（拿到的 <code>dispose</code> 仍然可以提前拆）。想要 1.x
        那种“活到我亲手销毁”的全局单例，必须显式脱钩：<code>runWithOwner(null, () =&gt; ...)</code>。
        另外，信号和 memo 都接受 <code>{"{ unobserved: fn }"}</code>，
        最后一个订阅者离开时触发，适合关掉只为“有人监听”而存在的连接或订阅。
      </p>

      <h2 id="lab">交互演示</h2>
      <p>
        下面的计数器同时维护 <code>count</code> 和步长 <code>step</code>，两个 memo 分别计算双倍值与奇偶性，
        还有一段拆成两分的 effect：compute 只读 <code>count()</code>，apply 在提交后把值转写进另一个信号。
        改变步长不会重算派生值，因为 memo 只订阅了 <code>count</code>。
      </p>
      <DemoFrame
        label="signals · counter lab"
        note="写入记录里的数字是事件处理器当场算出的下一帧值——此刻回读 count() 只会拿到旧值。"
      >
        <CounterLab />
      </DemoFrame>

      <h2 id="caveats">注意事项</h2>
      <ul>
        <li>
          <strong>别忘了调用。</strong> <code>count</code> 是函数，<code>count()</code> 才是值；
          在 JSX 里写 <code>{"{count}"}</code> 显示的是函数本身。
        </li>
        <li>
          <strong>派生里不要写状态。</strong> memo、effect 的 compute、组件函数体里写入信号，
          dev 会直接抛 <code>REACTIVE_WRITE_IN_OWNED_SCOPE</code>；
          用 <code>untrack</code> 包一层也躲不掉，它只关订阅、不关所有权。写入留给事件处理器或 apply。
        </li>
        <li>
          <strong>集合更新要换引用。</strong> 数组用展开或 <code>map</code> 生成新数组；
          深层对象改用 <a href="/docs/stores">Store</a>，它按路径通知。
        </li>
        <li>
          <strong>组件之外创建的图要能销毁。</strong> 用 <code>createRoot</code>{" "}
          包一层，或在确实要长期存活时用 <code>runWithOwner(null, ...)</code> 明说。
        </li>
      </ul>
      <p>
        下一章把这些状态同步到 DOM 之外的世界：网络、定时器、订阅与第三方库——也就是 effect 的工作。
      </p>
    </>
  );
}
