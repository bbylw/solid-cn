import { Callout, CodeBlock } from "../components/Code";
import effectSnippet from "./snippets/effect.tsx.txt?shiki";
import onSnippet from "./snippets/effect-on.ts.txt?shiki";
import gateSnippet from "./snippets/eff-memo-gate.ts.txt?shiki";
import lifecycle from "./snippets/lifecycle.tsx.txt?shiki";
import cleanup from "./snippets/cleanup.tsx.txt?shiki";
import flushWrite from "./snippets/eff-onflush.ts.txt?shiki";
import errorBundle from "./snippets/eff-error.ts.txt?shiki";

export default function Effects() {
  return (
    <>
      <p>
        effect 负责把响应式状态同步到 DOM 之外的世界：发请求、开定时器、绑定事件、操作第三方库。
        它不是“任何需要响应变化的地方”，更不是派生值的替代品。2.0 把它拆成两段，
        顺便把“谁在什么时候可以写状态”这件事说死了。
      </p>

      <h2 id="create-effect">拆成两段的 createEffect</h2>
      <p>
        <code>createEffect</code> 现在只有一种形式：<strong>两个函数</strong>。
        前半 <code>compute</code> 是跟踪作用域，只做读取并登记依赖；后半{" "}
        <code>apply</code> 是命令式作用域，做真正的副作用，并可以返回一个清理函数。
      </p>
      <CodeBlock data={effectSnippet} label="effect.ts" />
      <ul>
        <li>
          一轮更新里，<strong>所有 effect 的 compute 先跑完，apply 才统一开始</strong>
          ，依赖关系在副作用发生前就已经确定。
        </li>
        <li>
          apply 里的读取<strong>不再建立订阅</strong>。需要某个值，就在 compute 里读出来交给它；
          直接把 store 代理传给 apply 再读属性，会触发 <code>STRICT_READ_UNTRACKED</code>，
          正确做法是在 compute 里取出需要的字段、返回普通值。
        </li>
        <li>
          apply 返回的函数就是清理：下一轮 apply 之前、或 effect 销毁时执行，不再需要往里塞{" "}
          <code>onCleanup</code>。
        </li>
      </ul>
      <Callout title="1.x → 2.0：单参数 effect 已不存在" tone="warn">
        <p>
          <code>createEffect(() =&gt; {"{ el.title = name(); }"})</code>{" "}
          这种写法要拆成 <code>createEffect(() =&gt; name(), v =&gt; {"{ ... }"})</code>。
          只写一个参数不会被 TS 放过，也别指望它悄悄兼容。
        </p>
      </Callout>

      <h3 id="where-writes">写入发生在哪里</h3>
      <p>
        在 owned scope 里写状态是 2.0 的硬错误：<strong>memo、effect 的 compute、组件函数体</strong>
        里调用 setter，dev 直接抛 <code>REACTIVE_WRITE_IN_OWNED_SCOPE</code>，
        用 <code>untrack</code> 包一层也躲不掉（它只关订阅，不关所有权）。合法的写入位置是：
        事件处理器、effect 的 apply、<code>onSettled</code>，以及 <code>action</code>{" "}
        这样的变更流程。确实要在作用域内维护的内部标记，建信号时传 <code>{"{ ownedWrite: true }"}</code>{" "}
        显式放行。
      </p>
      <p>
        另一个时间问题：同一帧里的写入默认一起生效，如果其中有谁启动了异步工作（路由跳转、重新取数），
        其余写入会被它一起按住。想让某一次写入自己先落地，用 <code>onFlush</code>：
      </p>
      <CodeBlock data={flushWrite} label="onflush.tsx" />
      <p>
        <code>onFlush(fn)</code> 在待提交的 flush 之后、浏览器绘制之前跑一次，它的写入就成了独立的一帧。
        它只在事件处理器和 apply 里调用；写在组件体或计算里会告警{" "}
        <code>ON_FLUSH_IN_OWNED_SCOPE</code>，那种场合该用 <code>onSettled</code>。
      </p>

      <h2 id="explicit-deps">显式依赖：compute 就是声明</h2>
      <p>
        1.x 用 <code>on(dep, fn)</code> 把依赖收窄到指定来源。<code>on</code> 在 2.0{" "}
        已经删除——拆段之后的 compute <strong>本身就是那份依赖声明</strong>：读什么就订阅什么，
        没读的就不订阅。
      </p>
      <CodeBlock data={onSnippet} label="effect-deps.ts" />
      <ul>
        <li>
          <strong>单来源</strong>：compute 里只调那一个 getter，其余想用的值在 apply 里读，或包进{" "}
          <code>untrack</code> 明确“只要快照”。
        </li>
        <li>
          <strong>多来源</strong>：compute 返回数组或对象，把需要的字段一次凑齐。
        </li>
        <li>
          <strong>跳过首次执行</strong>：第三个参数传 <code>{"{ defer: true }"}</code>
          ，不再挂在 <code>on</code> 的选项里。
        </li>
        <li>
          <strong>要上一次的对比值</strong>：compute 的第一个参数与 apply 的第二个参数都是上一轮的结果，
          首次为 <code>undefined</code>，需要起点就用参数默认值。
        </li>
      </ul>

      <h2 id="never-compare">effect 不比较值</h2>
      <p>
        这是最容易踩的一条：<strong>effect 从不比较结果</strong>。只要 compute 重新运行——
        哪怕返回的值和上次一模一样——apply 和上一轮的清理都会照跑一遍。定时器、订阅这类“挂上去就别动”的资源，
        直接判断布尔值会被反复拆除重建。
      </p>
      <CodeBlock data={gateSnippet} label="memo-gate.ts" />
      <p>
        要“只在真的变了时才动”，就在前面加一层 <code>createMemo</code> 当闸门：
        memo 会比较结果（默认 <code>===</code>，可用 <code>equals</code> 换成内容比较），
        判定相同就不通知下游，effect 连 compute 都不会重跑。
        1.x 里靠 <code>createComputed</code> 回写、或给 <code>createMemo</code> 传{" "}
        <code>equals</code> 做的去重，在 2.0 就是这个闸门写法。
      </p>

      <h2 id="lifecycle">onSettled 与清理</h2>
      <p>
        <code>onMount</code> 在 2.0 由 <code>onSettled</code> 取代：它在当前活动稳定之后跑一次，
        返回值就是销毁时的清理，一个调用同时管头尾。
      </p>
      <CodeBlock data={lifecycle} label="lifecycle.tsx" />
      <p>
        <code>onSettled</code> 既能写在组件体里（挂载稳定后执行，也能在事件处理器里推迟到过渡结束），
        也是组件内做初始化写入的标准位置。服务端渲染不会执行它——那里没有 DOM；
        首次渲染就能确定的事情，直接留在组件体里即可。
      </p>
      <p>
        <code>onCleanup</code> 仍然存在，但定位收窄成“计算内部的响应式清理”。组件级的收尾请交给{" "}
        <code>onSettled</code> 的返回值，effect 级的清理请交给 apply 的返回值。副作用资源的标准写法：
      </p>
      <CodeBlock data={cleanup} label="cleanup.tsx" />
      <p>
        每轮 apply 都创建自己的 <code>AbortController</code>，返回的清理在下一轮之前把它中止，
        于是新查询词总能压掉旧请求。定时器、事件监听、WebSocket 连接都是同一个形状。
      </p>
      <Callout title="清理函数是同步的" tone="warn">
        <p>
          清理不会等待 Promise。需要异步收尾时，在清理函数里把任务发出去就行，
          别指望运行时等你完成。
        </p>
      </Callout>

      <h2 id="errors">错误处理</h2>
      <p>
        compute 抛出的错误（以及上游异步来源送进来的拒绝）不是你当下一刻能 <code>try/catch</code>{" "}
        的东西，它由第二个参数的 <strong>bundle 形式</strong>接收：把 apply 写成{" "}
        <code>{"{ effect, error }"}</code>。
      </p>
      <CodeBlock data={errorBundle} label="effect-error.ts" />
      <p>
        <code>error</code> 与 <code>effect</code> 同一个队列、同样是可写作用域，
        所以在这里写错误状态是合法的；它只处理 compute 阶段的错误，
        apply 里自己代码抛出的错误仍然按普通命令式代码处理，该 <code>try/catch</code> 就{" "}
        <code>try/catch</code>。要在界面上兜底，用 <a href="/docs/control-flow">
          <code>Errored</code>
        </a>{" "}
        包住这段子树；1.x 的 <code>onError</code> / <code>catchError</code> 都已删除。
      </p>

      <h2 id="pitfalls">常见误区</h2>
      <ul>
        <li>
          <strong>用 effect 同步派生状态。</strong> <code>fullName</code> 这类值应当直接由{" "}
          <code>firstName</code> 与 <code>lastName</code> 算出来（函数或 memo），
          而不是在 apply 里回写另一个信号。
        </li>
        <li>
          <strong>指望 apply 里的读取会重跑。</strong> apply 是 untracked 的，
          需要订阅的来源一律回到 compute。
        </li>
        <li>
          <strong>没做去重闸门。</strong> 见上一节：effect 不比较值，去重靠 memo。
        </li>
        <li>
          <strong>写完立刻读。</strong> 同一帧里的读取还是旧值，需要立即生效就 <code>flush()</code>，
          否则先把目标值算进局部变量。
        </li>
        <li>
          <strong>忘记清理。</strong> 定时器与监听器不会因为组件卸载自动消失，
          每个外部资源都要有对应的返回函数。
        </li>
      </ul>
      <p>
        相关阅读：<a href="/docs/signals">信号与派生</a>、
        <a href="/docs/stores">Store 状态</a>、<a href="/docs/api">API 速查</a>。
      </p>
    </>
  );
}
