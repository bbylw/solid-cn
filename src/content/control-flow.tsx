import { Callout, CodeBlock, DemoFrame, SnippetTabs } from "../components/Code";
import { ControlFlowLab } from "../components/demos/ControlFlowLab";
import controlFlow from "./snippets/control-flow.tsx.txt?shiki";
import showCallback from "./snippets/show-callback.tsx.txt?shiki";
import forKeyedIdentity from "./snippets/cf-for-identity.tsx.txt?shiki";
import forKeyedIndex from "./snippets/cf-for-index.tsx.txt?shiki";
import forKeyedCustom from "./snippets/cf-for-custom.tsx.txt?shiki";
import repeatSnippet from "./snippets/cf-repeat.tsx.txt?shiki";
import boundarySnippet from "./snippets/cf-async-boundary.tsx.txt?shiki";
import portalError from "./snippets/portal-error.tsx.txt?shiki";
import dynamicSnippet from "./snippets/cf-dynamic.tsx.txt?shiki";

export default function ControlFlow() {
  return (
    <>
      <p>
        条件与列表在 Solid 里由组件表达，而不是在 JSX 外用 <code>.map</code> 或三元表达式拼装。
        这些组件各自管理创建、更新与销毁，让每处分支只做必要的工作。2.0 把两组 API 合成了一套：
        <code>Index</code> 并入 <code>For</code>，<code>For</code> 用 <code>keyed</code>
        表达全部识别方式；异步与错误边界改名成 <code>Loading</code>、<code>Reveal</code>、
        <code>Errored</code>；<code>Portal</code> 与 <code>dynamic</code> 来自{" "}
        <code>@solidjs/web</code>。
      </p>
      <Callout title="1.x 的这几个名字在 2.0 里不存在" tone="warn">
        <p>
          <code>Suspense</code> → <code>Loading</code>、<code>SuspenseList</code> →{" "}
          <code>Reveal</code>、<code>ErrorBoundary</code> → <code>Errored</code>、
          <code>Index</code> → <code>For keyed={false}</code>。改名不只是换标签：
          <code>Errored</code> 的 fallback 收到的是错误 <em>accessor</em>，
          <code>For</code> 的回调参数形状由 <code>keyed</code> 决定。
        </p>
      </Callout>

      <h2 id="conditional">条件渲染</h2>
      <p>
        <code>Show</code> 在 <code>when</code> 为真时渲染子节点，为假时渲染{" "}
        <code>fallback</code>。条件从真变假会销毁节点并执行对应清理，从假变真会重新创建。
      </p>
      <CodeBlock data={controlFlow} label="control-flow.tsx" />

      <h3 id="show-keyed">函数子节点与 keyed</h3>
      <p>
        把 <code>user()</code> 直接传给 <code>when</code>，子节点里还得再判一次空。
        函数子节点替你窄化掉空值，但参数形状取决于 <code>keyed</code>：默认收到{" "}
        <strong>accessor</strong>，真值之间复用同一批节点；加上 <code>keyed</code> 后收到{" "}
        <strong>原始值</strong>，值换身份时整段内容重建——需要把值当普通变量往下传、
        或希望重置子组件内部状态时，这更合适。
      </p>
      <CodeBlock data={showCallback} label="show-callback.tsx" />
      <Callout title="回调是 owner，不是跟踪作用域" tone="warn">
        <p>
          <code>Show</code>、<code>For</code>、<code>Match</code> 的回调只负责创建内容，
          本身不跟踪读取。在回调第一行写 <code>const name = u().name</code> 会永远停在初始值
          （dev 报 <code>STRICT_READ_UNTRACKED</code>）；把 accessor 留在 JSX 里读，
          或者放进 memo、effect。
        </p>
      </Callout>

      <h2 id="lists">列表渲染：For</h2>
      <p>
        <code>For</code> 默认按<strong>引用</strong>识别列表项：数组里的对象换了引用就视为新项，
        同一个对象移动位置则复用已有 DOM。渲染函数为每一项执行一次，返回的节点由 Solid
        负责插入、移动和移除。列表项通常来自 store 或不可变数组；如果每次请求都得到全新对象，
        可以先用 <code>reconcile</code> 把新数据对齐进旧 store，见{" "}
        <a href="/docs/stores">Store 状态</a>。
      </p>

      <h3 id="keyed-modes">三种 keyed 模式</h3>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>keyed</th>
              <th>第一个参数</th>
              <th>第二个参数</th>
              <th>适合</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                默认 / <code>{"{true}"}</code>
              </td>
              <td>原始项</td>
              <td>索引 accessor</td>
              <td>对象列表、可增删排序、行会移动</td>
            </tr>
            <tr>
              <td>
                <code>{"{false}"}</code>
              </td>
              <td>项 accessor</td>
              <td>稳定的数字索引</td>
              <td>原 <code>Index</code> 的场景：一组输入框、固定列的表格</td>
            </tr>
            <tr>
              <td>
                <code>{"{(item) => key}"}</code>
              </td>
              <td>项 accessor</td>
              <td>索引 accessor</td>
              <td>有稳定业务 key，又不想先归一化数组</td>
            </tr>
          </tbody>
        </table>
      </div>
      <SnippetTabs
        label="For 的三种 keyed 模式"
        tabs={[
          {
            id: "identity",
            label: "按引用",
            fileLabel: "cf-for-identity.tsx",
            data: forKeyedIdentity,
          },
          {
            id: "index",
            label: "按位置",
            fileLabel: "cf-for-index.tsx",
            data: forKeyedIndex,
          },
          {
            id: "custom",
            label: "自定义 key",
            fileLabel: "cf-for-custom.tsx",
            data: forKeyedCustom,
          },
        ]}
      />
      <p>
        <code>keyed</code> 尽量写成字面量：<code>keyed={"{cond()}"}</code> 会让回调参数形状变得不确定，
        两个 accessor 与“值 + accessor”两种签名没法同时成立。索引只是读取位置，不要把它当业务 key。
      </p>

      <h2 id="repeat">按位置渲染：Repeat</h2>
      <p>
        还有一类列表根本不需要比较：<code>Repeat</code> 按 <code>count</code>（可选{" "}
        <code>from</code> 起始偏移）产出固定槽位，回调收到的是<strong>普通数字</strong>。
        骨架屏、窗口化列表，以及“数据在 store 里、索引只是下标”的表格都适合它——
        更新来自回调里对 store 的读取，而不是索引变化。
      </p>
      <CodeBlock data={repeatSnippet} label="cf-repeat.tsx" />

      <h2 id="switch">多分支</h2>
      <p>
        多个互斥条件用 <code>Switch</code> 与 <code>Match</code> 表达。运行时按顺序检查，
        只渲染第一个命中的分支；全都不命中时渲染 <code>fallback</code>。与一长串三元表达式相比，
        <code>Switch</code> 的分支是独立的节点，切换时旧分支被销毁、新分支被创建，状态与清理都跟着走。
        <code>Match</code> 的函数子节点与 <code>Show</code> 同形：默认拿 accessor，<code>keyed</code>{" "}
        拿原始值。
      </p>

      <h2 id="boundaries">异步与错误边界</h2>
      <p>
        <code>Loading</code> 取代了 <code>Suspense</code>：子树里读到尚未就绪的异步值时显示{" "}
        <code>fallback</code>，就绪后渲染内容。它管的是<strong>分支就绪</strong>——内容出现过之后，
        重新取数默认保留旧内容，不会把你踢回 <code>fallback</code>；那种“有变化在途”的状态用{" "}
        <code>isPending</code> 表达。<code>on</code> 属性是一份依赖清单，它读的东西一变，
        边界就重新落回 <code>fallback</code>。
      </p>
      <p>
        <code>Errored</code> 取代了 <code>ErrorBoundary</code>：<code>fallback</code>{" "}
        可以是元素，也可以是回调，回调收到错误 accessor 与 <code>reset</code>。
        异步计算的 rejection 会顺着依赖图落到这里；边界一旦重新渲染出内容就自动愈合，
        <code>reset</code> 是用来重试渲染期抛错的。<code>Reveal</code> 取代{" "}
        <code>SuspenseList</code>，协调同级 <code>Loading</code> 的出场顺序：<code>order</code>{" "}
        取 <code>"sequential"</code>（默认）、<code>"together"</code> 或{" "}
        <code>"natural"</code>，<code>collapsed</code> 只在 <code>sequential</code> 下生效。
      </p>
      <CodeBlock data={boundarySnippet} label="boundaries.tsx" />
      <p>
        边界怎么和异步数据配合、<code>createResource</code> 换成了什么写法，见{" "}
        <a href="/docs/data-fetching">数据获取</a>。
      </p>

      <h2 id="portal-dynamic">Portal 与 dynamic</h2>
      <p>
        <code>Portal</code> 把内容渲染到指定挂载点，适合模态框、通知层、下拉菜单：组件逻辑留在原来的位置，
        DOM 却出现在 <code>body</code> 或别的容器里，不会被父级的 <code>overflow</code>{" "}
        或层叠上下文裁切。它是客户端孤岛——服务端不为它渲染任何内容，水合后这段子树重新创建，
        因此里面的异步读取要自带一层 <code>Loading</code>。
      </p>
      <p>
        要在运行时决定渲染哪个组件，用 <code>dynamic</code> 工厂：它接一个源函数，返回一个稳定的组件引用，
        children、ref 和响应式 props 都走普通 JSX 路径。1.x 的 <code>{"<Dynamic component>"}</code>{" "}
        在 2.0 里仍然可用，但已经废弃——标签混在元素自己的 props 里，每个实例都要先 <code>merge</code>{" "}
        再 <code>omit</code>，而工厂只要多写一行。
      </p>
      <CodeBlock data={portalError} label="overlay.tsx" />
      <CodeBlock data={dynamicSnippet} label="dynamic.tsx" />

      <h2 id="lab">交互演示</h2>
      <p>
        演示里同一个 store 被两种列表读：上半部分是 <code>For</code>（按引用），
        下半部分是 <code>Repeat</code>（按位置）。点“命中 +1”只更新读到那个字段的两处文本；
        把任务删空可以看到 <code>Show</code> 与 <code>Repeat</code> 各自的{" "}
        <code>fallback</code>；状态按钮切换的是四个互斥的 <code>Match</code> 分支。
      </p>
      <DemoFrame
        label="control-flow · branch & list"
        note="写操作全部放在事件处理函数里——2.0 不允许在 memo、effect 计算段或组件体里写入状态。"
      >
        <ControlFlowLab />
      </DemoFrame>

      <p>
        相关阅读：<a href="/docs/components">组件与 JSX</a>、
        <a href="/docs/data-fetching">数据获取</a>、<a href="/docs/stores">Store 状态</a>。
      </p>
    </>
  );
}
