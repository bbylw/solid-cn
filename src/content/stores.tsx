import { Callout, CodeBlock, DemoFrame } from "../components/Code";
import { StoreLab } from "../components/demos/StoreLab";
import storeBasic from "./snippets/store.tsx.txt?shiki";
import draftWrites from "./snippets/store-produce.tsx.txt?shiki";
import arrayUpdates from "./snippets/store-arrays.ts.txt?shiki";
import plainValues from "./snippets/store-snapshot.ts.txt?shiki";
import reconcileSnippet from "./snippets/store-reconcile.ts.txt?shiki";
import derivedSnippet from "./snippets/store-derived.ts.txt?shiki";

export default function Stores() {
  return (
    <>
      <p>
        信号适合保存单个值，store 适合保存带结构的对象与数组。store 把整棵数据变成一层代理：
        读取某个属性，就只订阅那个属性；写入某个键，就只通知读到它的代码。数据的形状不必为了性能而拆散。
      </p>
      <p>
        2.0 只保留一种写入形式：把改动写进 setter 交给你的草稿。1.x 的路径参数、
        <code>produce</code>、<code>createMutable</code> 都合并进了这一种写法。
      </p>

      <h2 id="why-store">为什么需要 store</h2>
      <p>
        如果用信号保存一个对象，更新必须替换整个引用。组件里只读取 <code>user.name</code>{" "}
        的文本，也会因为整个对象换了而收到通知；对象越大，这种“整棵替换”的浪费越明显。
      </p>
      <p>
        store 通过属性访问建立订阅。读取 <code>state.user.name</code> 的代码只关心{" "}
        <code>name</code>；修改 <code>state.visits</code> 不会打扰它。对嵌套对象和列表来说，
        这能省下大量无效更新，也让状态组织得更自然。
      </p>

      <h2 id="create-store">创建与读取</h2>
      <p>
        <code>createStore(initial)</code> 返回 <code>[state, setState]</code>。读取是普通属性访问，
        不调用函数；写入调用 <code>setState</code>，它接收一个函数，参数是一份可写的草稿。
      </p>
      <CodeBlock data={storeBasic} label="store.ts" />
      <Callout tone="warn" title="从 solid-js 导入">
        <p>
          1.x 的 <code>{"import { createStore } from \"solid-js/store\""}</code> 已经不存在。
          store 相关原语现在全部从 <code>solid-js</code> 导出：<code>createStore</code>、
          <code>reconcile</code>、<code>snapshot</code>、<code>deep</code>、
          <code>createProjection</code>。
        </p>
      </Callout>

      <h2 id="draft-setter">草稿式写入</h2>
      <p>
        草稿上怎么写都行：给属性赋值、自增、调数组方法、删键。一次回调里的所有改动合成一次提交。
      </p>
      <Callout tone="warn" title="路径写入与 produce 换成了草稿">
        <p>
          <code>{"setState(\"user\", \"name\", \"林岚\")"}</code> 和{" "}
          <code>{"setState(produce((s) => ...))"}</code> 这两种 1.x 写法都没有了。
          前者变成对同一条路径的草稿写入，后者是默认行为——草稿本来就是 produce 风格。
        </p>
      </Callout>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>意图</th>
              <th>写法</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>改一个叶子属性</td>
              <td>
                <code>{"setState((s) => { s.user.name = \"林岚\"; })"}</code>
              </td>
            </tr>
            <tr>
              <td>基于前值累加</td>
              <td>
                <code>{"setState((s) => { s.visits += 1; })"}</code>
              </td>
            </tr>
            <tr>
              <td>一次写多处</td>
              <td>同一段草稿里连续写</td>
            </tr>
            <tr>
              <td>删一个键</td>
              <td>
                <code>{"setState((s) => { delete s.nickname; })"}</code>
              </td>
            </tr>
            <tr>
              <td>换一份新数据</td>
              <td>
                <code>{"setState((s) => ({ ...s, items: next }))"}</code>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <p>
        最后一行是“返回一个值”：改写不方便时（最常见的是过滤出新数组）把结果返回给 setter，
        对象按顶层键做浅差异，数组按下标和长度替换。它不做按键对齐，keyed diff 要用{" "}
        <code>reconcile</code> 或派生 store。
      </p>
      <CodeBlock data={draftWrites} label="store-draft.ts" />

      <h2 id="arrays">数组与删除</h2>
      <p>
        数组同样是代理。按下标改一项，只通知读这一项的代码；增删直接用 <code>push</code>、{" "}
        <code>splice</code>、<code>pop</code>。1.x 用路径参数表达的区间写和条件写，现在就是普通循环。
      </p>
      <CodeBlock data={arrayUpdates} label="store-arrays.ts" />
      <p>
        在 <code>For</code> 里渲染时，Solid 按引用识别每一项：新增或删除才创建、移除节点，
        已有项的内容变化由绑定就地更新。服务端列表每次都是全新对象时，整体替换会让所有项看起来都变了——
        这正是 <code>reconcile</code> 要处理的。
      </p>

      <h2 id="why-setter">为什么写入要走 setter</h2>
      <p>读写分开不是形式问题，运行时靠它安排更新。</p>
      <ul>
        <li>
          <strong>一轮更新一次提交。</strong> 同一次回调里的写入在微任务末尾一起落地，在那之前读到的还是旧值；
          要立刻看到新值就先算好再写，或者调用 <code>flush()</code>。
        </li>
        <li>
          <strong>写入天然是一次 transition。</strong> 这一轮里若有写入启动了异步工作（导航、重新取数），
          其余写入跟着它一起落地，界面不会停在半新半旧的帧上。
        </li>
        <li>
          <strong>回退需要知道边界。</strong>{" "}
          <a href="/docs/data-fetching">createOptimisticStore 与 action</a>{" "}
          能在事务结束时撤掉猜测出来的写入，前提是每笔改动都是一次完整的 setter 调用。
        </li>
      </ul>
      <Callout tone="warn" title="直接改 state 会被忽略">
        <p>
          在 setter 之外写代理（<code>state.visits = 999</code>、
          <code>state.members.push(x)</code>）不报错，也不生效：dev 只提示一次{" "}
          <code>STORE_WRITE_OUTSIDE_SETTER</code>，值一个都没变。读取用 <code>state</code>、
          写入用 <code>setState</code> 这条边界保持一致，调试和持久化都会简单很多。
        </p>
      </Callout>

      <h2 id="plain-values">取出普通值：snapshot 与 deep</h2>
      <Callout tone="warn" title="unwrap 改名 snapshot">
        <p>
          <code>unwrap</code> 已经不存在，对应的位置用 <code>snapshot</code>。区别不只是名字：
          <code>snapshot</code> 会生成一份新的普通对象图（未变化的子树保留原引用），
          因为 2.0 的 store 内部依赖不可变结构。
        </p>
      </Callout>
      <p>
        <code>snapshot(state)</code> 返回普通值，不建立订阅，适合序列化和交给只认普通对象的库。
        需要“任何角落变了都要知道”时用 <code>deep(state)</code>：它订阅所有嵌套属性，
        并把普通快照交给 effect 的 apply 阶段。effect 回调运行在追踪之外，
        在那里直接读 <code>state.a.b</code> 只会取一次当前值，dev 会给出{" "}
        <code>STRICT_READ_UNTRACKED</code> 警告。
      </p>
      <CodeBlock data={plainValues} label="store-plain.ts" />

      <h2 id="reconcile">用 reconcile 合并服务端数据</h2>
      <p>
        <code>reconcile(value, key)</code> 把一份不可变的新数据合并回 store 的某一段，
        未变化的项保留原来的引用，只有差异被写进去。2.0 里它在 setter 回调内调用，
        作用对象就是草稿上那一段。
      </p>
      <CodeBlock data={reconcileSnippet} label="store-reconcile.ts" />
      <p>
        第二个参数决定身份：<code>"id"</code>（默认）按属性匹配，函数按算出的键匹配，
        <code>null</code> 按下标对齐，适合形状固定的轮询数据；1.x 的{" "}
        <code>{"reconcile(v, { key: null, merge: true })"}</code> 就是这里的{" "}
        <code>{"reconcile(v, null)"}</code>，2.0 始终合并。另一条要记住：对象交给 store
        之后就别再原地改它，store 认的是引用，下一次要传新数据（新的响应，或{" "}
        <code>{"{ ...next }"}</code> 这样的副本）。
      </p>

      <h2 id="derived-stores">派生 store：createStore(fn) 与 createProjection</h2>
      <p>
        派生值也能是 store，对应关系和信号一致：<code>createStore(fn, seed)</code>
        是可写的派生 store，<code>createProjection(fn, seed, options)</code>{" "}
        是只读版本。<code>fn</code> 在草稿上写，只有真正变了的键会通知读取方，
        所以 1.x 的 <code>createSelector</code>（选中项变化不必叫醒所有行）现在用投影表达。
      </p>
      <CodeBlock data={derivedSnippet} label="store-derived.ts" />
      <p>
        <code>fn</code> 有两种形态：不带草稿参数就返回完整数据，返回值按 <code>key</code>（默认{" "}
        <code>"id"</code>）对齐进结果；带草稿参数就直接改草稿。它也可以是 async 的、
        或返回 async 迭代器——结果落地前保持 pending，读取要放在{" "}
        <a href="/docs/control-flow">Loading 边界</a>里，细节见
        <a href="/docs/data-fetching">数据获取</a>。可写形式的本地写入保留到下一次源变化，
        那时由 <code>fn</code> 决定草稿里留什么。
      </p>

      <h2 id="lab">交互演示</h2>
      <p>
        演示里的成员列表是一个 store：切换在线状态遍历草稿改掉那一项的一个键，新增用{" "}
        <code>push</code>，移走末位用 <code>pop</code>；在线人数由 memo 从列表派生。
      </p>
      <DemoFrame
        label="stores · member board"
        note="底部显示最近一次写入的草稿操作。切换某个成员的在线状态只更新那一行，不会重建整个列表。"
      >
        <StoreLab />
      </DemoFrame>

      <h2 id="caveats">注意事项</h2>
      <ul>
        <li>
          <strong>不要解构。</strong> <code>{"const { visits } = state;"}</code>{" "}
          会把当前值固化，丢失后续订阅。保留属性访问，或者把整个 store 作为参数传下去。
        </li>
        <li>
          <strong>别在组件体、memo 或 effect 的 compute 阶段写入。</strong>
          纯计算阶段不许改状态，dev 会抛 <code>REACTIVE_WRITE_IN_OWNED_SCOPE</code>；
          写入放在事件处理器或 <code>onSettled</code> 里。
        </li>
        <li>
          <strong>遍历会建立较宽的订阅。</strong> 读 <code>state.items.length</code> 或整个数组
          就是在订阅结构本身；<code>For</code> 已按项处理，通常不需要额外展开。
          真的要观察全树，就明确用 <code>deep</code>。
        </li>
        <li>
          <strong>需要普通值时想清楚要不要订阅。</strong> 一次性取出去用 <code>snapshot</code>，
          持续观察用 <code>deep</code>；把 <code>snapshot</code> 的结果传给别人，
          对方拿到的是一份不会再变的副本。
        </li>
      </ul>
      <p>
        store 解决数据形状的问题，下一章的 Context 解决数据在组件树上怎么传递的问题。
        两者经常一起出现：Provider 持有一个 store 和一组动作，后代按需读取其中的字段。
      </p>
      <p>
        相关阅读：<a href="/docs/signals">信号与派生</a>、
        <a href="/docs/data-fetching">数据获取与乐观更新</a>、
        <a href="/docs/context">Context</a>、<a href="/docs/api">API 速查</a>。
      </p>
    </>
  );
}
