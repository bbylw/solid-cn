import { Callout, CodeBlock } from "../components/Code";
import signalSnippet from "./snippets/api-signal.ts.txt?shiki";
import effectSnippet from "./snippets/api-effect.ts.txt?shiki";
import storeSnippet from "./snippets/api-store.ts.txt?shiki";
import asyncSnippet from "./snippets/api-async.ts.txt?shiki";
import controlSnippet from "./snippets/api-control.tsx.txt?shiki";
import webSnippet from "./snippets/api-web.tsx.txt?shiki";
import contextSnippet from "./snippets/api-context.tsx.txt?shiki";

export default function Api() {
  return (
    <>
      <p>
        本页按主题列出 Solid 2.0 常用 API：签名、一句话说明、最小示例。未标注包名的都在{" "}
        <code>solid-js</code>；标注 <strong>@solidjs/web</strong>
        的属于 Web 渲染器包（<code>solid-js/web</code> 已不存在）。Store API 已从{" "}
        <code>solid-js/store</code> 并入核心。语义细节见各章节，末尾有{" "}
        <a href="#migration-map">1.x → 2.0 对照</a>。
      </p>

      <Callout title="三条最容易踩的规则">
        <ul>
          <li>
            props 读属性、不要解构；传值不传访问器：<code>{"<Counter value={count()} />"}</code>。
          </li>
          <li>
            <code>createEffect(compute, apply)</code> 两个函数缺一不可，单参数写法在 2.0 会报错。
          </li>
          <li>
            Store 通过草稿写入：<code>setStore((s) =&gt; {'{'} s.user.name = "B"; {'}'})</code>。
          </li>
        </ul>
      </Callout>

      <h2 id="reactivity">响应式原语</h2>
      <p>
        信号是写入的地方，memo 是派生的地方，effect 是把值送出去的地方。写入不会立刻反映到读取：
        更新按微任务合并，<code>flush()</code> 强制现在就生效。
      </p>
      <CodeBlock data={signalSnippet} label="signal.ts" />

      <h3 id="create-signal">createSignal</h3>
      <p>
        <code>const [count, setCount] = createSignal(0)</code>
        <br />
        读用调用 <code>count()</code>，写用 <code>setCount(v)</code> 或{" "}
        <code>setCount((c) =&gt; c + 1)</code>。传入函数得到<strong>可写派生值</strong>：{" "}
        <code>const [size, setSize] = createSignal(() =&gt; props.initial)</code>。
      </p>
      <p>
        选项：<code>equals</code>（默认引用相等，<code>false</code> 表示每次都通知）、
        <code>name</code>、<code>ownedWrite</code>（允许在自有作用域内写）、
        <code>unobserved</code>（订阅清零时回调）、<code>ssrSource</code> 与{" "}
        <code>deferStream</code>（仅服务端生效）。
      </p>

      <h3 id="create-memo">createMemo</h3>
      <p>
        <code>const doubled = createMemo(() =&gt; count() * 2)</code>
        <br />
        只读派生值，依赖变化才重算。compute 返回 Promise{" "}
        时读取在未就绪前挂起，交给 <code>Loading</code> 边界处理——2.0 没有单独的资源 API。
      </p>
      <p>
        选项：<code>equals</code>、<code>lazy</code>（首次读取才计算，失去订阅后自动销毁）、{" "}
        <code>name</code>、<code>unobserved</code>、<code>loadingValue</code>（未就绪期间先渲染的值）、{" "}
        <code>ssrSource</code>、<code>deferStream</code>。
      </p>

      <h3 id="create-effect">createEffect</h3>
      <p>
        <code>createEffect(() =&gt; count(), (v, prev) =&gt; {'{'} …; return cleanup; {'}'})</code>
        <br />
        compute 负责追踪依赖，apply 负责副作用（内部不追踪），返回的函数用于清理。apply{" "}
        <strong>不做比较</strong>：compute 每重跑一次 apply 就执行一次，想跳过相同值就在 compute 里读一个带{" "}
        <code>equals</code> 的 memo。
      </p>
      <p>
        第二个参数也可以是错误打包对象 <code>{'{ effect, error }'}</code>
        ，计算阶段出错时走 <code>error(err, cleanup)</code>。选项：<code>defer</code>
        （跳过首次执行）、<code>name</code>、<code>ssrSource</code>、<code>deferStream</code>。
      </p>
      <CodeBlock data={effectSnippet} label="effect.ts" />

      <h3 id="on-settled">onSettled / onCleanup</h3>
      <p>
        <code>onSettled(() =&gt; {'{'} const id = setInterval(tick, 1000); return () =&gt; clearInterval(id); {'}'})</code>
        <br />
        当前活动稳定后执行一次，是组件级“挂载 + 卸载”的规范写法（替代 1.x 的 <code>onMount</code>）；
        在事件处理函数里同样可用，会等本次过渡结束。
      </p>
      <p>
        <code>onCleanup(fn)</code> 服务于计算内部：下一次 compute 之前或销毁时运行。库作者用它清理与某次运行绑定的资源，
        应用代码优先 <code>onSettled</code>。ref 回调已不属于任何所有者，在里面注册 <code>onCleanup</code> 无效。
      </p>

      <h3 id="flush-on-flush">flush / onFlush</h3>
      <p>
        <code>flush()</code> 同步冲刷排队更新（测试里断言前几乎都要一次）；{" "}
        <code>onFlush(() =&gt; setOpen(false))</code>
        让一次写入紧跟本次冲刷落地，不被同时启动的异步（导航、重取）拖住。
      </p>

      <h3 id="ownership">createRoot / getOwner / runWithOwner / untrack</h3>
      <p>
        <code>createRoot((dispose) =&gt; {'{'} … {'}'})</code> 建立一个可销毁作用域，默认仍随父所有者销毁；
        要脱离用 <code>runWithOwner(null, fn)</code>。在测试和非 <code>render</code>{" "}
        入口创建原语都得包一层，否则泄漏。
      </p>
      <p>
        <code>getOwner()</code> 取当前所有者，<code>runWithOwner(owner, fn)</code>{" "}
        在异步回调里恢复它。<code>untrack(fn)</code> 只关闭追踪，不改变所有者，也不豁免写入守卫。
      </p>

      <h3 id="props-helpers">merge / omit / children / lazy / createUniqueId</h3>
      <p>
        <code>merge(defaults, props, overrides)</code> 取代 <code>mergeProps</code>；{" "}
        <code>omit(props, "class", "style")</code> 取代 <code>splitProps</code>——留不下需要的键就删掉它。{" "}
        <code>undefined</code> 在 <code>merge</code> 里是真实值，会覆盖而不是跳过。
      </p>
      <p>
        <code>const list = children(() =&gt; props.children); list.toArray()</code>{" "}
        一次性解析子节点；<code>const Heavy = lazy(() =&gt; import("./Heavy"))</code> 是异步组件；{" "}
        <code>createUniqueId()</code> 给出两端一致的稳定 id。
      </p>

      <h2 id="stores">Store</h2>
      <p>
        Store 是嵌套状态的代理，读取按属性细粒度追踪，写入通过草稿。要交给非响应式的世界时用{" "}
        <code>snapshot</code>。
      </p>
      <CodeBlock data={storeSnippet} label="store.ts" />

      <h3 id="create-store">createStore</h3>
      <p>
        <code>{'const [store, setStore] = createStore({ user: { name: "A" } })'}</code>
        <br />
        规范写法是草稿：<code>setStore((s) =&gt; {'{'} s.user.name = "B"; {'}'})</code>。返回新值也可以，但语义很浅：
        数组按下标替换并截断长度，对象只在顶层比较，常用于过滤/删除。1.x 的路径写法{" "}
        <code>setStore("user", "name", "B")</code> 与 <code>produce</code> 已移除（草稿就是默认行为）。
      </p>
      <p>
        选项 <code>name</code>、<code>shallow</code>（单层 store：根键响应，值按引用替换）。函数形式{" "}
        <code>createStore(fn, seed, options?)</code> 得到可写派生 store，只读版本用{" "}
        <code>createProjection</code>。
      </p>

      <h3 id="reconcile-snapshot-deep">reconcile / snapshot / deep</h3>
      <p>
        <code>setStore((s) =&gt; {'{'} reconcile(serverTodos, "id")(s.todos); {'}'})</code>
        <br />
        把外部数据按 key 合并进子树，保留未变化项的身份。<code>key</code> 传字符串或取值函数，传{" "}
        <code>null</code> 则按位置合并。
      </p>
      <p>
        <code>snapshot(store)</code> 替代 <code>unwrap</code>，给出深拷贝的普通对象（序列化、断言用）；{" "}
        <code>deep(store)</code> 只在需要对任意嵌套变化都响应时放进 compute。
      </p>

      <h3 id="create-projection">createProjection</h3>
      <p>
        <code>{'const items = createProjection(async () => api.list(), [], { key: "id" })'}</code>
        <br />
        只读派生 store：来源可以是 Promise 或异步可迭代对象，首屏交给 <code>Loading</code>；
        每次重算按 <code>key</code> 协调。选项另有{" "}
        <code>seedLoadingValue</code>、<code>ssrSource</code>、<code>deferStream</code>。
      </p>

      <h3 id="create-optimistic">createOptimistic / createOptimisticStore</h3>
      <p>
        <code>const [todos, setTodos] = createOptimisticStore(() =&gt; api.list(), [])</code>
        <br />
        乐观写入立刻显示，所在过渡（通常是某个 <code>action</code>
        ）结束时回滚，再用真实数据对齐。信号版本 <code>createOptimistic(value)</code>{" "}
        同理；“保存中…”这类过程提示该用共同写入的乐观标志，而不是 <code>isPending</code>。
      </p>

      <h2 id="async">异步与过渡</h2>
      <p>
        2.0 没有资源对象：异步就是返回 Promise 或异步可迭代对象的计算，等待状态由{" "}
        <code>Loading</code> 与 <code>isPending</code> 表达，写入由 <code>action</code> 组织成一次过渡。
      </p>
      <CodeBlock data={asyncSnippet} label="async.ts" />

      <h3 id="action">action</h3>
      <p>
        <code>{'const save = action(function* (text) { setDraft(text); yield api.put(text); refresh(user); })'}</code>
        <br />
        generator 里同步写入与 <code>yield</code> 异步工作混排，整次执行算一个过渡；乐观写入写在内部，
        完成后用 <code>refresh</code> 与数据源对齐。它取代 1.x 的 <code>startTransition</code> 用法。
      </p>

      <h3 id="is-pending-latest">isPending / latest</h3>
      <p>
        <code>isPending(() =&gt; user())</code>
        <br />
        为真的条件是“<strong>变更</strong>在路上”：输入变了，或被 <code>affects()</code> 声明过。
        单纯重问同一个问题（裸 <code>refresh()</code>、轮询）是安静的。
      </p>
      <p>
        <code>latest(id)</code> 读到在途的新值，适合“正在加载 /user/42”的文案——此时 <code>id()</code>{" "}
        仍是已提交的旧值。
      </p>

      <h3 id="refresh-affects">refresh / affects</h3>
      <p>
        <code>refresh(user)</code> 在服务器写入后重新求值某个派生读取（store 也可以）。
        <br />
        先 <code>affects(user)</code> 或 <code>affects(todo, "updatedAt")</code>{" "}
        声明影响范围，这次重取才会被 <code>isPending</code> 与 <code>Loading</code>{" "}
        当作等待中的变更；不声明就静默换新。
      </p>

      <h3 id="resolve-until">resolve / until</h3>
      <p>
        <code>await resolve(() =&gt; user())</code> 等一个响应式表达式就绪（脚本、测试用）；{" "}
        <code>{'const ok = await until(() => paid(), { timeout: 5000 })'}</code>
        等条件第一次为真，可在 <code>action</code> 里 <code>yield</code>。
      </p>

      <h3 id="create-deferred">createDeferred</h3>
      <p>
        <code>const rows = createDeferred(() =&gt; fetchRows(period()))</code>
        <br />
        可能落后、但绝不抢跑的派生值：拿到首个结果后，重取期间继续显示上一个值，用{" "}
        <code>isPending(() =&gt; rows())</code> 表示重取中。与 1.x 同名 API
        的空闲延后、<code>timeoutMs</code> 已移除。
      </p>

      <h3 id="from">from</h3>
      <p>
        <code>const price = createMemo(() =&gt; from(ticker(symbol())))</code>
        <br />
        <code>from</code> 接受订阅函数、Observable 或异步可迭代对象，返回异步可迭代值供计算消费；
        计算重跑或所有者销毁时立刻关闭来源。向外推送改用 <code>createEffect</code>（
        <code>observable</code> 已移除）。
      </p>

      <h2 id="control-flow">控制流组件</h2>
      <p>
        控制流组件是<strong>所有者</strong>而不是追踪作用域：回调里拿到的访问器要在 JSX、memo 或 effect 中读，
        在函数体顶部读会被冻结在初始值。
      </p>
      <CodeBlock data={controlSnippet} label="control-flow.tsx" />

      <h3 id="show-switch-match">Show / Switch / Match</h3>
      <p>
        <code>{'<Show when={user()} fallback={<Login />}>{(u) => <Profile user={u()} />}</Show>'}</code>
        <br />
        函数子节点拿到收窄后的访问器；<code>keyed</code> 时拿到原值并随值重建。
        <code>Switch</code> 渲染第一个命中的 <code>Match</code>：<code>Match</code> 只有{" "}
        <code>when</code> 与子节点，<code>fallback</code> 属于 <code>Show</code> 和{" "}
        <code>Switch</code>。
      </p>

      <h3 id="for-repeat">For / Repeat</h3>
      <p>
        <code>{'<For each={todos()}>{(todo, i) => <Row todo={todo} index={i()} />}</For>'}</code>
        <br />
        默认按身份 keying：<code>item</code> 是原值、<code>i</code> 是访问器。
        <code>keyed={'{'}false{'}'}</code>（替代 1.x 的 <code>Index</code>）反过来：<code>item()</code> +
        数字下标。<code>{'keyed={(t) => t.id}'}</code> 自定义 key。
      </p>
      <p>
        <code>{'<Repeat count={store.rows.length}>{(i) => …}</Repeat>'}</code>{" "}
        按下标生成、不做 diff，回调参数是普通数字；另有 <code>from</code> 起点与 <code>fallback</code>。
      </p>

      <h3 id="loading-errored-reveal">Loading / Errored / Reveal</h3>
      <p>
        <code>&lt;Loading fallback={'{'}&lt;Spinner /&gt;{'}'} on={'{'}id(){'}'}&gt;</code>
        <br />
        异步边界（替代 <code>Suspense</code>）。<code>on</code> 是依赖列表而不是 key：它读的值一变，边界就重新武装；{" "}
        <code>fallback</code> 跟随引发它的那次更新一起落地。同一份数据在边界外也被读取时永远看不到 fallback，
        开发期会报 <code>LOADING_ON_OUTSIDE_HOLD</code>，需要“变更中”提示请用 <code>isPending</code>。
      </p>
      <p>
        <code>{'<Errored fallback={(err, reset) => <button onClick={reset}>…</button>}'}</code>{" "}
        捕获边界内的错误（替代 <code>ErrorBoundary</code>）；<code>err</code> 是访问器，
        <code>reset</code> 重试，边界自动愈合。<code>Reveal</code> 协调兄弟边界顺序：
        <code>order</code> 取 <code>"sequential"</code>（默认）、<code>"together"</code>、
        <code>"natural"</code>，另有 <code>collapsed</code>。
      </p>

      <h2 id="web">@solidjs/web：渲染与挂载</h2>
      <p>
        Web 渲染器独占 DOM 相关 API，JSX 类型也由它提供（<code>jsxImportSource: "@solidjs/web"</code>）。
      </p>
      <CodeBlock data={webSnippet} label="web.tsx" />

      <h3 id="render-hydrate">render / hydrate</h3>
      <p>
        <code>const dispose = render(() =&gt; &lt;App /&gt;, node)</code> 从零构建并挂载，返回销毁函数。
      </p>
      <p>
        <code>hydrate(() =&gt; &lt;App /&gt;, node)</code> 认领服务端产出的 DOM，补上事件与响应式绑定。
        水合会采纳服务端已经得到的答案而不重新请求，但被采纳的计算仍会跑一次来记录依赖——期间全局{" "}
        <code>Promise</code> 与 <code>fetch</code> 是永不落地的假对象，所以不要把计算里创建的 promise 或{" "}
        <code>import()</code> 存进活得更久的缓存。选项：<code>renderId</code> 等。
      </p>

      <h3 id="server-render">renderToString / renderToStream</h3>
      <p>
        <code>renderToString(() =&gt; &lt;App /&gt;)</code> 同步返回 HTML 字符串，异步边界渲染{" "}
        <code>fallback</code>；<code>renderToStream(...)</code> 先冲刷外壳，再逐块补发边界内容。
      </p>
      <p>
        流结果提供 <code>readable</code>（<code>Response</code> body 就绪的{" "}
        <code>ReadableStream&lt;Uint8Array&gt;</code>）、<code>pipe(writable)</code>（Node 风格）与{" "}
        <code>pipeTo(writable)</code>；一次渲染只能用其中一种。<code>await renderToStream(...)</code>{" "}
        等全部稳定后返回完整字符串（取代 1.x 的 <code>renderToStringAsync</code>）。
        <code>Reveal</code> 的 <code>order="together"</code> 与 <code>collapsed</code> 需要流式渲染。
      </p>

      <h3 id="portal-dynamic-client-only">Portal / dynamic / clientOnly</h3>
      <p>
        <code>&lt;Portal mount={'{'}document.body{'}'}&gt;</code>
        把内容渲染到别处，服务端渲染时抛错。
      </p>
      <p>
        <code>const Active = dynamic(() =&gt; (isEditing() ? Editor : Viewer))</code> 得到身份稳定的组件，
        可与 <code>lazy()</code> 组合；<code>&lt;Dynamic component={'{'}…{'}'} /&gt;</code> 仍可用但已弃用。
      </p>
      <p>
        <code>const Heavy = clientOnly(() =&gt; import("./Heavy"))</code> 的组件服务端完全不参与，连 import
        都不发起，只渲染 <code>props.fallback</code>，水合后再挂载；<code>{'{ lazy: true }'}</code>{" "}
        把加载推迟到首次渲染。它不参与水合资源清单，因此不会有标记不一致。
      </p>

      <h3 id="http-status-header">httpStatus / httpHeader</h3>
      <p>
        <code>httpStatus(404)</code>、<code>{'httpHeader("cache-control", "no-store", { append: true })'}</code>{" "}
        在 SSR 期间为<strong>当前响应式作用域</strong>声明响应状态与头，作用域销毁即撤回；它是声明而不是改写，
        直接写在组件体里即可。响应头一旦提交（外壳冲刷或渲染完成）就变成空操作，客户端永远是空操作。详见{" "}
        <a href="/docs/ssr">SSR 与水合</a>。
      </p>

      <h2 id="context">上下文</h2>
      <p>
        <code>const Ctx = createContext&lt;T&gt;()</code> → <code>Context&lt;T&gt;</code>；
        <code>useContext(Ctx)</code> → <code>T</code>
      </p>
      <p>
        上下文本身就是 Provider：<code>&lt;TodosContext value={'{'}createTodos(){'}'}&gt;</code>，
        1.x 的 <code>Context.Provider</code> 没有了。默认值形式只适合主题、语言这类原始兜底；无默认值时缺
        Provider 会抛 <code>ContextNotFoundError</code>，所以不必再写一层 <code>useTodos</code> 包装。
        <code>value</code> 传 <code>undefined</code> 视为“未提供”，可选上下文请用 <code>null</code>。
      </p>
      <p>
        上下文值在组件里创建，每个请求各一份并由 Provider 负责销毁；模块作用域被同一进程的所有请求共享，
        只放常量（以及 <code>createContext</code> 调用本身）。
      </p>
      <CodeBlock data={contextSnippet} label="context.tsx" />

      <h2 id="migration-map">1.x → 2.0 对照</h2>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>1.x</th>
              <th>2.0</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <code>solid-js/web</code>
              </td>
              <td>
                <code>@solidjs/web</code>（<code>jsxImportSource</code> 同步改掉；
                <code>solid-js/jsx-runtime</code> 已不存在）
              </td>
            </tr>
            <tr>
              <td>
                <code>solid-js/store</code>
              </td>
              <td>
                <code>solid-js</code>（Store API 进核心；<code>solid-js/h</code>、
                <code>html</code>、<code>universal</code> 分别改为 <code>@solidjs/*</code>）
              </td>
            </tr>
            <tr>
              <td>
                <code>Suspense</code> / <code>SuspenseList</code> / <code>ErrorBoundary</code>
              </td>
              <td>
                <code>Loading</code> / <code>Reveal</code> / <code>Errored</code>
              </td>
            </tr>
            <tr>
              <td>
                <code>createResource</code> 与 <code>resource.loading</code> / <code>error</code>
              </td>
              <td>
                返回 Promise 的计算 + <code>Loading</code> / <code>isPending</code> /{" "}
                <code>Errored</code>
              </td>
            </tr>
            <tr>
              <td>
                <code>refetch()</code>
              </td>
              <td>
                <code>refresh(x)</code>；要显示等待先 <code>affects(x)</code>
              </td>
            </tr>
            <tr>
              <td>
                <code>onMount</code> / <code>on</code> / <code>onError</code> /{" "}
                <code>catchError</code>
              </td>
              <td>
                <code>onSettled</code>；两段式 <code>createEffect</code>；
                <code>Errored</code> 或 effect 的 <code>error</code> 选项
              </td>
            </tr>
            <tr>
              <td>
                <code>createEffect(fn)</code>（单参数）
              </td>
              <td>
                <code>createEffect(compute, apply)</code>，单参数写法是错误
              </td>
            </tr>
            <tr>
              <td>
                <code>createComputed</code> / <code>batch</code>
              </td>
              <td>
                <code>createMemo</code> / 拆分后的 <code>createEffect</code> / 函数形式{" "}
                <code>createSignal</code>；默认按微任务合并，需要同步用 <code>flush()</code>
              </td>
            </tr>
            <tr>
              <td>
                <code>startTransition</code> / <code>useTransition</code>
              </td>
              <td>
                内建过渡：<code>action</code>、<code>isPending</code>、<code>Loading</code>、乐观 API
              </td>
            </tr>
            <tr>
              <td>
                <code>mergeProps</code> / <code>splitProps</code> / <code>unwrap</code>
              </td>
              <td>
                <code>merge</code> / <code>omit</code> / <code>snapshot</code>
              </td>
            </tr>
            <tr>
              <td>
                <code>produce</code> / <code>createMutable</code> / <code>modifyMutable</code>
              </td>
              <td>
                <code>createStore</code> 的草稿写入（默认行为）
              </td>
            </tr>
            <tr>
              <td>
                <code>createSelector</code>
              </td>
              <td>
                <code>createProjection</code>（或 <code>createStore(fn)</code>）
              </td>
            </tr>
            <tr>
              <td>
                <code>createDeferred</code>
              </td>
              <td>
                同名新语义：落后但不抢跑的派生值；空闲延后与 <code>timeoutMs</code> 已移除
              </td>
            </tr>
            <tr>
              <td>
                <code>observable</code>
              </td>
              <td>
                向内 <code>createMemo(() =&gt; from(source))</code>；向外用{" "}
                <code>createEffect</code> 推送
              </td>
            </tr>
            <tr>
              <td>
                <code>Index</code> / <code>indexArray</code>
              </td>
              <td>
                <code>&lt;For keyed={'{'}false{'}'}&gt;</code> / <code>mapArray</code>
              </td>
            </tr>
            <tr>
              <td>
                <code>Context.Provider</code>
              </td>
              <td>
                <code>&lt;Context value={'{'}…{'}'}&gt;</code>
              </td>
            </tr>
            <tr>
              <td>
                <code>classList</code>
              </td>
              <td>
                <code>{'class={{ active: x() }}'}</code> 或数组形式
              </td>
            </tr>
            <tr>
              <td>
                <code>use:dir</code>、<code>attr:</code>、<code>bool:</code>、
                <code>on:</code>、<code>oncapture:</code>
              </td>
              <td>
                <code>ref={'{'}dir(x){'}'}</code>（数组可组合）、普通属性、
                <code>onClick</code>；原生监听选项用 ref 回调
              </td>
            </tr>
            <tr>
              <td>
                <code>tabIndex</code> 等驼峰属性
              </td>
              <td>
                小写 HTML 属性名（<code>tabindex</code>）；事件处理器仍驼峰
              </td>
            </tr>
            <tr>
              <td>
                <code>resetErrorBoundaries</code> / ref 对象 / <code>equalFn</code> /{" "}
                <code>getListener</code>
              </td>
              <td>
                边界自动愈合；ref 是回调；<code>isEqual</code>；<code>getObserver</code>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <Callout title="写法提醒">
        <ul>
          <li>
            组件体顶部不要做响应式读取：放到 JSX、memo 或 <code>untrack</code> 里。
          </li>
          <li>
            memo、effect compute、组件体里不要写入；写放到事件处理函数、<code>onSettled</code> 或{" "}
            <code>action</code>。
          </li>
          <li>
            事件绑定表达式不是响应式的：<code>onClick={'{'}cond() ? a : b{'}'}</code> 只决定一次，
            把判断放进稳定的处理函数。
          </li>
        </ul>
      </Callout>

      <h2 id="reference">官方参考</h2>
      <ul>
        <li>
          <a href="https://docs.solidjs.com" target="_blank" rel="noreferrer">
            Solid 2.0 文档
          </a>
          ：原语、组件与渲染函数的权威签名。
        </li>
        <li>
          <a
            href="https://github.com/solidjs/solid/blob/next/documentation/solid-2.0/MIGRATION.md"
            target="_blank"
            rel="noreferrer"
          >
            2.0 迁移指南
          </a>
          ：逐项重命名与移除清单。
        </li>
        <li>
          <a href="https://playground.solidjs.com" target="_blank" rel="noreferrer">
            Playground
          </a>
          ：在浏览器里直接试验本页的任意 API。
        </li>
      </ul>
      <p>
        主题详解：<a href="/docs/reactivity">响应式模型</a>、{" "}
        <a href="/docs/signals">信号与派生</a>、<a href="/docs/effects">副作用与生命周期</a>、
        <a href="/docs/stores">Store</a>、<a href="/docs/control-flow">控制流</a>、{" "}
        <a href="/docs/ssr">SSR 与水合</a>；也可以回到 <a href="/docs">文档总览</a>。
      </p>
    </>
  );
}
