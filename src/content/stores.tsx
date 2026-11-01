import { A } from "@solidjs/router";
import { Callout, CodeBlock, DemoFrame } from "../components/Code";
import { StoreLab } from "../components/demos/StoreLab";
import storeBasic from "./snippets/store.tsx.txt?shiki";
import produce from "./snippets/store-produce.tsx.txt?shiki";
import reconcile from "./snippets/store-reconcile.ts.txt?shiki";
import arrayUpdates from "./snippets/store-arrays.ts.txt?shiki";

export default function Stores() {
  return (
    <>
      <p>
        信号适合保存单个值，store 适合保存带结构的对象与数组。store
        把整棵对象变成一层代理：读取某个属性，就只订阅那个属性；写入某个路径，就只更新那条路径。
        数据的形状不必为了性能而拆散。
      </p>

      <h2 id="why-store">为什么需要 store</h2>
      <p>
        如果用信号保存一个对象，更新必须替换整个引用。组件里只读取 <code>user.name</code>{" "}
        的文本，也会因为整个对象换了而收到通知；对象越大，这种“整棵替换”的浪费越明显。
      </p>
      <p>
        store 通过属性访问建立订阅。读取 <code>state.user.name</code> 的代码只关心{" "}
        <code>name</code>；修改 <code>state.user.age</code> 不会打扰它。对嵌套对象和列表来说，
        这能省下大量无效更新，也让状态组织得更自然。
      </p>

      <h2 id="create-store">创建与读取</h2>
      <p>
        <code>createStore</code> 返回 <code>[state, setState]</code>。读取时用普通的属性访问，
        不要调用函数：
      </p>
      <CodeBlock data={storeBasic} label="store.ts" />
      <p>
        <code>state</code> 是只读代理：在 JSX 里写 <code>{"{state.userCount}"}</code>{" "}
        就会订阅该属性。修改必须通过 <code>setState</code>，且路径是一系列参数。
      </p>
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
              <td>改单个叶属性</td>
              <td>
                <code>setState("user", "name", "林岚")</code>
              </td>
            </tr>
            <tr>
              <td>基于前值更新</td>
              <td>
                <code>setState("userCount", (n) =&gt; n + 1)</code>
              </td>
            </tr>
            <tr>
              <td>改数组中的一项</td>
              <td>
                <code>setState("users", 0, "online", false)</code>
              </td>
            </tr>
            <tr>
              <td>整体替换数组</td>
              <td>
                <code>setState("users", nextList)</code>
              </td>
            </tr>
            <tr>
              <td>一次写多处</td>
              <td>
                <code>setState(produce((s) =&gt; ...))</code>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2 id="path-updates">路径更新</h2>
      <p>
        路径更新是 store 的核心。每个路径参数定位一层，最后一段可以是值或更新函数。
        运行时知道具体是哪条路径发生变化，只会通知订阅了这个路径的代码。
      </p>
      <Callout title="不要直接改 state">
        <p>
          <code>state.user.name = "x"</code> 绕过了 setter，不应当作为更新方式。
          读取用 <code>state</code>，写入用 <code>setState</code>，这条边界保持一致，
          调试和持久化都会简单很多。
        </p>
      </Callout>

      <h2 id="arrays">数组操作</h2>
      <p>
        数组同样是代理。按下标定位可以只更新一项；新增、删除、排序则通常生成新数组再整体传入。
        在 <code>For</code> 里渲染时，Solid 会按引用识别每一项：新增或删除才创建、移除节点，
        已有项的内容变化由细粒度绑定就地更新。
      </p>
      <CodeBlock data={arrayUpdates} label="store-arrays.ts" />
      <p>
        如果列表项来自服务端、每次都是全新对象，整体替换会让所有项看起来都变了。
        这时用 <code>reconcile</code> 按 key 对齐新旧数据，尽量保留原有引用。
      </p>

      <h2 id="produce-reconcile">produce 与 reconcile</h2>
      <p>
        需要在一轮更新里连续写多处时，<code>produce</code> 提供一个可以自由改写的草稿对象。
        所有修改在结束时合并为一次更新。
      </p>
      <CodeBlock data={produce} label="produce.ts" />
      <p>
        <code>reconcile</code> 处理相反的方向：把一份不可变的新数据合并回现有 store。
        它按键匹配新旧项，保留未变化的对象引用，同时把差异写进去。
      </p>
      <CodeBlock data={reconcile} label="reconcile.ts" />
      <p>
        两者都不改变“读取用 state、写入用 setState”的规则。<code>produce</code>{" "}
        让你写得更像普通可变代码；<code>reconcile</code> 让服务端数据与本地细粒度订阅衔接起来。
      </p>

      <h2 id="lab">交互演示</h2>
      <p>
        演示里的成员列表是一个 store。切换在线状态走路径更新，新增成员替换数组；
        在线人数由 memo 从 <code>state.members</code> 派生。
      </p>
      <DemoFrame
        label="stores · member board"
        note="底部显示最近一次调用的 setState 路径。切换成员只更新该行，不会重建整个列表。"
      >
        <StoreLab />
      </DemoFrame>

      <h2 id="caveats">注意事项</h2>
      <ul>
        <li>
          <strong>不要解构。</strong> <code>const {"{ userCount }"} = state</code>{" "}
          会把当前值固化，丢失后续订阅。保留属性访问，或把整个对象作为参数传递。
        </li>
        <li>
          <strong>顶层字段替换要具体。</strong> 想替换整个对象时，逐个字段更新或用{" "}
          <code>produce</code>；不要依赖直接赋值。
        </li>
        <li>
          <strong>遍历会建立较宽的订阅。</strong> 对 <code>Object.keys(state)</code>{" "}
          这类操作要留意；<code>For</code> 已经按项处理，通常不需要额外展开。
        </li>
        <li>
          <strong>需要原始对象时用 unwrap。</strong>{" "}
          <code>unwrap(state)</code> 返回非代理对象，适合传给只读的第三方库；但如果希望对方响应更新，
          就继续传 store 本身。
        </li>
      </ul>
      <p>
        store 解决数据形状的问题，下一章的 Context 解决数据在组件树上的传递问题。
        两者经常一起出现：Provider 持有一个 store，后代按需读取其中的字段。
      </p>
      <p>
        相关阅读：<A href="/docs/signals">信号与派生</A>、<A href="/docs/context">Context</A>、
        <A href="/docs/api">API 速查</A>。
      </p>
    </>
  );
}
