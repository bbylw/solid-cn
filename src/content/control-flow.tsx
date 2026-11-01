import { A } from "@solidjs/router";
import { Callout, CodeBlock, DemoFrame } from "../components/Code";
import { ControlFlowLab } from "../components/demos/ControlFlowLab";
import controlFlow from "./snippets/control-flow.tsx.txt?shiki";
import showCallback from "./snippets/show-callback.tsx.txt?shiki";
import portalError from "./snippets/portal-error.tsx.txt?shiki";

export default function ControlFlow() {
  return (
    <>
      <p>
        条件与列表在 Solid 里由组件表达，而不是在 JSX 外用 <code>.map</code> 或三元表达式拼装。
        这些组件各自管理创建、更新与销毁，让每处分支只做必要的工作。
      </p>

      <h2 id="conditional">条件渲染</h2>
      <p>
        <code>Show</code> 在条件为真时渲染子节点，为假时渲染 <code>fallback</code>。
        条件从假变真会创建节点，从真变假会销毁节点并执行对应的清理。
      </p>
      <CodeBlock data={controlFlow} label="control-flow.tsx" />
      <p>
        直接把 <code>user()</code> 传给 <code>when</code> 时，子节点拿不到非空类型。
        使用回调形式，Solid 会把非空值作为 accessor 传入，JSX 里的类型就确定了：
      </p>
      <CodeBlock data={showCallback} label="Show 回调" />
      <p>
        默认情况下 <code>Show</code> 只在真假切换时重建内容；如果希望在值本身变化时重建，
        加上 <code>keyed</code>。需要把值当普通变量传给子组件、或希望重置子组件内部状态时，keyed
        很有用。
      </p>

      <h2 id="lists">列表与 key</h2>
      <p>
        <code>For</code> 按<strong>引用</strong>识别列表项。数组中的对象换了引用，就视为新项；
        同一个对象移动位置，则复用已有 DOM。渲染函数为每一项执行一次，返回的节点由 Solid
        负责插入、移动和移除。
      </p>
      <p>
        列表项通常来自 store 或不可变数组。若每次请求都得到全新对象，可以先用{" "}
        <code>reconcile</code> 对齐旧数据，避免整个列表被重建。索引只是读取位置，不要把它当作
        业务 key。
      </p>
      <p>
        渲染函数可能接收第二个参数——索引 accessor。它是响应式的，但列表增删后索引会变化，
        用它做依赖时要格外小心。
      </p>

      <h2 id="index">Index 与 For</h2>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>组件</th>
              <th>识别方式</th>
              <th>适合</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <code>For</code>
              </td>
              <td>按项引用</td>
              <td>对象列表、可增删排序、每项有稳定身份</td>
            </tr>
            <tr>
              <td>
                <code>Index</code>
              </td>
              <td>按位置</td>
              <td>长度固定的原始值列表、每一行原地编辑</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p>
        <code>Index</code> 把每一项作为 accessor 传入：位置不变时，值变化只更新该位置的内容，
        不会重建整行。对于一组输入框或固定列的数据表，这比 <code>For</code> 更合适。
      </p>

      <h2 id="switch">多分支</h2>
      <p>
        多个互斥条件用 <code>Switch</code> 与 <code>Match</code> 表达。运行时按顺序检查，
        只渲染第一个命中的分支；全都不命中时渲染 <code>fallback</code>。
      </p>
      <p>
        与一长串三元表达式相比，<code>Switch</code> 的分支是独立的节点，切换时旧分支被销毁、
        新分支被创建，状态与清理都跟着走。
      </p>

      <h2 id="portal-error">Portal 与 ErrorBoundary</h2>
      <p>
        <code>Portal</code> 把内容渲染到指定的挂载点，适合模态框、通知层、下拉菜单。
        组件逻辑仍留在原来的位置，DOM 却可以出现在 <code>body</code> 或其他容器里，
        避免被父级的 <code>overflow</code> 或层叠上下文裁切。
      </p>
      <p>
        <code>ErrorBoundary</code> 捕获子树渲染过程中抛出的错误，展示 <code>fallback</code>。
        fallback 会收到错误对象与 <code>reset</code> 函数，可以在用户点击“重试”后重新尝试渲染子树。
      </p>
      <CodeBlock data={portalError} label="overlay.tsx" />
      <Callout title="错误边界只接住渲染期错误" tone="warn">
        <p>
          事件处理函数、定时器回调里抛出的异常不会自动进入 <code>ErrorBoundary</code>；
          异步请求的失败应当先变成状态（例如 resource 的 error），再在界面上处理。
        </p>
      </Callout>

      <h2 id="lab">交互演示</h2>
      <p>
        演示同时包含 <code>Switch</code> 分支与 <code>For</code> 列表。切换状态只替换状态面板里的
        一个分支；增删任务只改动列表中的对应节点。
      </p>
      <DemoFrame
        label="control-flow · branch & list"
        note="把任务删空可以看到 Show 的 fallback；状态按钮切换的是四个互斥的 Match 分支。"
      >
        <ControlFlowLab />
      </DemoFrame>

      <p>
        下一章处理异步数据：<code>createResource</code> 如何把请求接入依赖图，
        以及加载、失败、空数据三种状态怎样落到界面上。
      </p>
      <p>
        相关阅读：<A href="/docs/components">组件与 JSX</A>、<A href="/docs/data-fetching">数据获取</A>。
      </p>
    </>
  );
}
