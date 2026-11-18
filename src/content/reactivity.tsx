import { Callout, CodeBlock, SnippetTabs } from "../components/Code";
import counterSource from "./snippets/counter.tsx.txt?shiki";
import counterCompiled from "./snippets/counter-compiled.js.txt?shiki";
import flushSnippet from "./snippets/batch.tsx.txt?shiki";

export default function Reactivity() {
  return (
    <>
      <p>
        Solid 的性能来自一个简单的前提：<strong>界面更新的单位不是组件，而是读过某段状态的代码。</strong>{" "}
        信号保存值，也记得谁读过它；值提交时，运行时只通知这些订阅者。2.0
        把这条线拉得更硬——写入排队、effect 拆成两段、组件顶层不许随手读取——它们都出自同一张依赖图。
      </p>

      <h2 id="where-updates-happen">更新发生在哪里</h2>
      <p>
        虚拟 DOM 框架在状态变化时重新执行组件函数，生成一棵新树、与旧树比较，最后把差异写进真实
        DOM。Solid 跳过了后半段：编译器在构建期就知道哪些表达式是动态的，
        给每个动态表达式生成独立的更新绑定；运行时只在依赖变化时执行对应的那一个绑定。
      </p>
      <p>
        看一个计数器。<code>count()</code> 出现在按钮文本里，<code>doubleCount()</code>{" "}
        出现在另一段文本里。点击按钮时，只有这两个文本节点会收到新值，按钮元素本身和组件的其他部分都不会被重建。
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

      <p>编译产物里没有 diff，也没有组件级重渲染，每一行都能对上号：</p>
      <ul>
        <li>
          <code>template()</code> 把静态部分提成一段模板，元素按需克隆，不再重新解析 HTML。
          注意它来自 <code>@solidjs/web</code>——2.0 起 DOM 运行时独立成包，
          <code>solid-js/web</code> 这个入口已经没有了。
        </li>
        <li>
          <code>insert(el, fn)</code> 给每个动态表达式建一个绑定，更新只写到它自己那一个位置：
          状态更新时，绑定自己更新自己。
        </li>
        <li>
          事件在编译期展开成元素上的 <code>_$$click</code> 字段，配合{" "}
          <code>delegateEvents(["click"])</code> 在文档根上做一次代理。
        </li>
      </ul>

      <h2 id="signals-and-subscribers">信号与订阅者</h2>
      <p>
        <code>createSignal</code> 返回一对函数：调用 getter 读取当前值，调用 setter
        写入新值。订阅发生在读取的那一刻——但只有当读取发生在<strong>跟踪作用域</strong>
        里，运行时才会把“这段代码”登记为订阅者。JSX 表达式、<code>createMemo</code>{" "}
        和 <code>createEffect</code> 的 compute 半边，就是这三处天然的跟踪作用域。
      </p>
      <p>一次更新沿依赖图传播，大致是这个过程：</p>
      <ol>
        <li>调用 setter：新值进入待提交状态，此刻的读取仍然看到旧值。</li>
        <li>
          当前微任务结束（或你主动调用 <code>flush()</code>）时开始提交，
          运行时按依赖顺序找出直接读过这个信号的 computation。
        </li>
        <li>
          memo 重新计算，结果与上一次相同（默认 <code>===</code>，可用{" "}
          <code>equals</code> 改）就不再通知它的下游。
        </li>
        <li>
          DOM 绑定写入新值；effect 先跑完所有 compute，再统一执行 apply，上一轮的清理排在前面。
        </li>
      </ol>
      <Callout title="自动追踪，而不是依赖数组">
        <p>
          在跟踪作用域里读到什么，就订阅什么。条件分支里没读到的信号不会建立订阅；
          下次分支变化后读到了新的信号，订阅关系会自动更新。没有手写依赖数组，也就没有遗漏。
        </p>
      </Callout>

      <h2 id="run-once">组件只运行一次</h2>
      <p>
        Solid 组件是普通的 JavaScript 函数，职责是<strong>搭建一次视图</strong>。挂载时函数执行，
        创建 DOM、建立绑定、注册清理，然后返回节点。之后的交互不再进入这个函数体。
      </p>
      <p>
        想让一段逻辑跟着状态走，它就必须出现在三处之一：JSX 表达式、memo、effect。
        由此推出 2.0 的两条硬规矩：组件函数体顶层的响应式读取会在 dev{" "}
        <strong>告警</strong>（<code>STRICT_READ_UNTRACKED</code>），因为它读到的只是当下一刻的值，
        永远不会重来；组件体里写状态会直接<strong>抛错</strong>
        （<code>REACTIVE_WRITE_IN_OWNED_SCOPE</code>），写入属于事件处理器或 effect 的 apply 半边。
      </p>
      <p>
        需要动态结构时，用 <code>Show</code>、<code>For</code>、<code>Switch</code>{" "}
        这类控制流组件表达。它们是<strong>所有者</strong>而不是跟踪作用域：分支切换时只创建或销毁该分支的节点，
        而写在回调函数体第一行的读取同样不会更新，要放进 JSX 表达式里。
      </p>
      <Callout title="“一次”指每次挂载" tone="warn">
        <p>
          组件在同一个挂载周期内只执行一次；被卸载后再次挂载，则会重新执行。
          列表项的渲染函数、条件分支里的子组件也遵循同样的规则：进入界面时执行一次。
        </p>
      </Callout>

      <h2 id="batching-and-flush">微任务批处理与 flush</h2>
      <p>
        2.0 的更新以微任务为单位自动成批：一次操作里连续写多少个信号，都只在这一帧结束时一起生效，
        中间的临时值不会被任何人看到。所以 <code>batch</code>{" "}
        这个函数消失了——没有需要包裹的东西。要提前落地，用 <code>flush()</code>。
      </p>
      <CodeBlock data={flushSnippet} label="flush.ts" />
      <Callout title="1.x → 2.0：batch 换成自动微任务批处理" tone="warn">
        <p>
          <code>batch(() =&gt; {"{ ... }"})</code> 在 2.0 里已经不存在。把包裹去掉即可；
          真正需要“现在就同步生效”的地方（写完立刻读 DOM、测试里断言之前）改成调用{" "}
          <code>flush()</code>，或者用 <code>flush(fn)</code> 让回调里的写入在返回前 drain 干净。
        </p>
      </Callout>

      <h3 id="reads-lag-writes">读取滞后于写入</h3>
      <p>
        最需要重新建立习惯的一点：<strong>setter 不会立刻改变读取的结果</strong>。
        <code>setCount(1)</code> 之后马上 <code>count()</code>，拿到的还是提交前的旧值，
        直到微任务结束或你调用 <code>flush()</code>。
      </p>
      <ul>
        <li>
          要在写入后读 DOM（比如聚焦新增的那一行），先 <code>flush()</code> 再读。
        </li>
        <li>
          要在同一帧里用新值做别的事，<strong>先把下一帧的值算进局部变量</strong>，
          别去回读信号。
        </li>
        <li>
          想让某一次写入不被同一帧里的异步工作（导航、重新取数）按住，
          用 <code>onFlush(() =&gt; setX(v))</code> 让它单独成帧，见
          <a href="/docs/effects">副作用与生命周期</a>。
        </li>
      </ul>

      <h2 id="different-from-vdom">与虚拟 DOM 的差别</h2>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>维度</th>
              <th>虚拟 DOM 框架</th>
              <th>Solid 2.0</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>更新单位</td>
              <td>组件或子树重新渲染</td>
              <td>读过该状态的表达式绑定</td>
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
              <td>更新时机</td>
              <td>渲染完成后 / commit 阶段</td>
              <td>下一个微任务统一提交，<code>flush()</code> 可提前</td>
            </tr>
            <tr>
              <td>依赖声明</td>
              <td>手写依赖数组或编译器推断</td>
              <td>读取即订阅；effect 的 compute 半边就是声明</td>
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
        这些差别不改变 JSX 的写法，却会改变你组织代码的方式：状态尽量放在真正读取它的地方附近，
        派生值写成函数或 memo，副作用交给拆好两段的 effect，组件树只负责结构。
      </p>

      <h2 id="next">继续阅读</h2>
      <p>
        下一章从最小的状态单元开始，把信号、memo、可写派生值与所有者写一遍，并在交互演示里观察
        “写入排队、读取滞后”到底是什么手感。
      </p>
      <ul>
        <li>
          <a href="/docs/signals">信号与派生</a>：createSignal、createMemo 与函数形式的派生信号。
        </li>
        <li>
          <a href="/docs/effects">副作用与生命周期</a>：compute / apply 两段式与 onSettled。
        </li>
        <li>
          <a href="/docs/stores">Store 状态</a>：嵌套对象与数组的细粒度订阅。
        </li>
      </ul>
    </>
  );
}
