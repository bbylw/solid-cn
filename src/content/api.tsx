import { A } from "@solidjs/router";
import { Callout } from "../components/Code";

export default function Api() {
  return (
    <>
      <p>
        这一页把最常用的 API 按主题放在一起，便于写代码时快速查阅。签名以 Solid 1.9
        为准，完整细节与新增能力请对照{" "}
        <a href="https://docs.solidjs.com/reference" target="_blank" rel="noreferrer">
          官方参考
        </a>
        。
      </p>

      <h2 id="reactivity">响应式原语</h2>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>API</th>
              <th>返回</th>
              <th>用途</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <code>createSignal(value, options?)</code>
              </td>
              <td>
                <code>[Accessor, Setter]</code>
              </td>
              <td>可变状态的最小单元</td>
            </tr>
            <tr>
              <td>
                <code>createMemo(fn, value?, options?)</code>
              </td>
              <td>
                <code>Accessor</code>
              </td>
              <td>缓存派生计算，依赖变化才重算</td>
            </tr>
            <tr>
              <td>
                <code>createEffect(fn, value?)</code>
              </td>
              <td>
                <code>void</code>
              </td>
              <td>渲染后执行副作用，自动追踪依赖</td>
            </tr>
            <tr>
              <td>
                <code>createRenderEffect(fn)</code>
              </td>
              <td>
                <code>void</code>
              </td>
              <td>渲染阶段运行，供底层或自定义渲染器使用</td>
            </tr>
            <tr>
              <td>
                <code>createComputed(fn)</code>
              </td>
              <td>
                <code>void</code>
              </td>
              <td>立即运行的计算，常用于同步派生</td>
            </tr>
            <tr>
              <td>
                <code>batch(fn)</code>
              </td>
              <td>
                <code>T</code>
              </td>
              <td>合并多次写入，只触发一轮更新</td>
            </tr>
            <tr>
              <td>
                <code>untrack(fn)</code>
              </td>
              <td>
                <code>T</code>
              </td>
              <td>读取信号但不建立订阅</td>
            </tr>
            <tr>
              <td>
                <code>on(deps, fn, options?)</code>
              </td>
              <td>effect 函数</td>
              <td>显式声明依赖，可跳过首次执行</td>
            </tr>
            <tr>
              <td>
                <code>createRoot(fn)</code>
              </td>
              <td>
                <code>T</code>
              </td>
              <td>在组件树之外建立响应式所有者</td>
            </tr>
            <tr>
              <td>
                <code>startTransition(fn)</code>
              </td>
              <td>
                <code>void</code>
              </td>
              <td>把更新标记为可中断的过渡</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p>
        更完整的用法见 <A href="/docs/signals">信号与派生</A> 与{" "}
        <A href="/docs/effects">副作用与生命周期</A>。
      </p>

      <h2 id="stores">Store</h2>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>API</th>
              <th>返回 / 形式</th>
              <th>用途</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <code>createStore(state)</code>
              </td>
              <td>
                <code>[state, setState]</code>
              </td>
              <td>深度代理的嵌套状态</td>
            </tr>
            <tr>
              <td>
                <code>setState(path..., value)</code>
              </td>
              <td>写入函数</td>
              <td>按路径更新，最后一段可传更新函数</td>
            </tr>
            <tr>
              <td>
                <code>produce(fn)</code>
              </td>
              <td>更新函数</td>
              <td>在草稿上连续修改，合并为一次更新</td>
            </tr>
            <tr>
              <td>
                <code>reconcile(value, options?)</code>
              </td>
              <td>更新函数</td>
              <td>按 key 合并新数据，保留未变化项的引用</td>
            </tr>
            <tr>
              <td>
                <code>unwrap(state)</code>
              </td>
              <td>原始对象</td>
              <td>去掉代理，传给不识别 store 的库</td>
            </tr>
            <tr>
              <td>
                <code>createMutable(state)</code>
              </td>
              <td>可写代理</td>
              <td>允许直接赋值，适合迁移旧代码或简单配置</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p>
        注意区分：<code>createStore</code> 通过 setter 写入，细粒度更新更可控；
        <code>createMutable</code> 允许直接修改，代价是更新来源不易追踪。
        详见 <A href="/docs/stores">Store 状态</A>。
      </p>

      <h2 id="control-flow">控制流组件</h2>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>组件</th>
              <th>主要 props</th>
              <th>行为</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <code>Show</code>
              </td>
              <td>
                <code>when</code>、<code>fallback</code>、<code>keyed</code>
              </td>
              <td>条件渲染，真假切换时创建或销毁子节点</td>
            </tr>
            <tr>
              <td>
                <code>For</code>
              </td>
              <td>
                <code>each</code>、<code>fallback</code>
              </td>
              <td>按引用识别列表项，复用稳定身份</td>
            </tr>
            <tr>
              <td>
                <code>Index</code>
              </td>
              <td>
                <code>each</code>、<code>fallback</code>
              </td>
              <td>按位置识别，适合固定长度的原始值列表</td>
            </tr>
            <tr>
              <td>
                <code>Switch</code> / <code>Match</code>
              </td>
              <td>
                <code>when</code>（Match）、<code>fallback</code>
              </td>
              <td>渲染第一个命中的分支</td>
            </tr>
            <tr>
              <td>
                <code>Dynamic</code>
              </td>
              <td>
                <code>component</code>
              </td>
              <td>按变量选择组件或原生标签</td>
            </tr>
            <tr>
              <td>
                <code>Portal</code>
              </td>
              <td>
                <code>mount</code>、<code>useShadow</code>、<code>isSVG</code>
              </td>
              <td>把内容渲染到指定挂载点</td>
            </tr>
            <tr>
              <td>
                <code>ErrorBoundary</code>
              </td>
              <td>
                <code>fallback(error, reset)</code>
              </td>
              <td>捕获渲染期异常并提供重置</td>
            </tr>
            <tr>
              <td>
                <code>Suspense</code>
              </td>
              <td>
                <code>fallback</code>
              </td>
              <td>统一处理边界内异步内容的等待状态</td>
            </tr>
            <tr>
              <td>
                <code>SuspenseList</code>
              </td>
              <td>
                <code>revealOrder</code>、<code>tail</code>
              </td>
              <td>协调多个 Suspense 边界的显示顺序</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p>
        分支写法与列表策略见 <A href="/docs/control-flow">控制流</A>。
      </p>

      <h2 id="lifecycle">生命周期</h2>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>API</th>
              <th>触发时机</th>
              <th>常见用途</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <code>onMount(fn)</code>
              </td>
              <td>客户端首次挂载后一次</td>
              <td>获取 DOM、初始化第三方库</td>
            </tr>
            <tr>
              <td>
                <code>onCleanup(fn)</code>
              </td>
              <td>重新运行前或卸载时</td>
              <td>清除定时器、取消请求、解绑监听</td>
            </tr>
            <tr>
              <td>
                <code>onError(fn)</code>
              </td>
              <td>后代计算抛出错误时</td>
              <td>上报错误、补充日志</td>
            </tr>
            <tr>
              <td>
                <code>createEffect(fn)</code>
              </td>
              <td>渲染后，依赖变化时</td>
              <td>同步状态到外部系统</td>
            </tr>
            <tr>
              <td>
                <code>getOwner()</code>
              </td>
              <td>当前所有者上下文</td>
              <td>跨异步边界保存所有者</td>
            </tr>
            <tr>
              <td>
                <code>runWithOwner(owner, fn)</code>
              </td>
              <td>指定所有者执行</td>
              <td>在异步回调里创建可清理的计算</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p>
        副作用的组织方式与清理模式见 <A href="/docs/effects">副作用与生命周期</A>。
      </p>

      <h2 id="data">数据与过渡</h2>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>API</th>
              <th>说明</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <code>createResource(source?, fetcher, options?)</code>
              </td>
              <td>
                返回 <code>[resource, {"{ mutate, refetch }"}]</code>；来源变化自动请求
              </td>
            </tr>
            <tr>
              <td>
                <code>resource.state</code>
              </td>
              <td>
                <code>unresolved</code> / <code>pending</code> / <code>ready</code> /{" "}
                <code>refreshing</code> / <code>errored</code>
              </td>
            </tr>
            <tr>
              <td>
                <code>resource.loading</code>
              </td>
              <td>是否处于 pending 或 refreshing</td>
            </tr>
            <tr>
              <td>
                <code>resource.error</code>
              </td>
              <td>失败原因，成功时为 undefined</td>
            </tr>
            <tr>
              <td>
                <code>resource.latest</code>
              </td>
              <td>刷新期间保留的上一次成功值</td>
            </tr>
            <tr>
              <td>
                <code>createDeferred(source, options?)</code>
              </td>
              <td>延迟更新的派生值，适合降低高频输入压力</td>
            </tr>
            <tr>
              <td>
                <code>useTransition()</code>
              </td>
              <td>
                返回 <code>[pending, start]</code>，用于手动控制过渡状态
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <p>
        加载、错误与刷新的界面写法见 <A href="/docs/data-fetching">数据获取</A>。
      </p>

      <h2 id="rendering">渲染</h2>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>API</th>
              <th>环境</th>
              <th>说明</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <code>render(fn, node)</code>
              </td>
              <td>浏览器</td>
              <td>创建并挂载，返回销毁函数</td>
            </tr>
            <tr>
              <td>
                <code>hydrate(fn, node, options?)</code>
              </td>
              <td>浏览器</td>
              <td>接管服务端 HTML，补上事件与响应式绑定</td>
            </tr>
            <tr>
              <td>
                <code>renderToString(fn)</code>
              </td>
              <td>服务端</td>
              <td>同步输出 HTML，不等待异步资源</td>
            </tr>
            <tr>
              <td>
                <code>renderToStringAsync(fn)</code>
              </td>
              <td>服务端</td>
              <td>等待资源完成后输出，返回 Promise</td>
            </tr>
            <tr>
              <td>
                <code>renderToStream(fn)</code>
              </td>
              <td>服务端</td>
              <td>
                返回 <code>{"{ pipe, pipeTo }"}</code>，分块发送 HTML
              </td>
            </tr>
            <tr>
              <td>
                <code>isServer</code>
              </td>
              <td>两端</td>
              <td>当前是否为服务端环境</td>
            </tr>
            <tr>
              <td>
                <code>mergeProps(...sources)</code>
              </td>
              <td>两端</td>
              <td>合并 props 并保留 getter 响应性</td>
            </tr>
            <tr>
              <td>
                <code>splitProps(props, ...keys)</code>
              </td>
              <td>两端</td>
              <td>拆分 props 而不丢失响应性</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p>
        渲染流程与流式输出见 <A href="/docs/ssr">SSR 与水合</A>。
      </p>

      <Callout title="查阅顺序">
        <p>
          先用本页确认 API 名称与返回结构，再回到对应章节看完整示例。遇到框架层的问题（路由、数据加载、
          部署），优先查阅 SolidStart 文档；本页只覆盖核心库。
        </p>
      </Callout>

      <h2 id="reference">官方参考</h2>
      <ul>
        <li>
          <a href="https://docs.solidjs.com/reference" target="_blank" rel="noreferrer">
            API Reference
          </a>
          ：所有原语、组件与渲染函数的完整签名。
        </li>
        <li>
          <a href="https://docs.solidjs.com/concepts" target="_blank" rel="noreferrer">
            Concepts
          </a>
          ：响应式、组件、事件与渲染的概念说明。
        </li>
        <li>
          <a href="https://docs.solidjs.com/guides" target="_blank" rel="noreferrer">
            Guides
          </a>
          ：从项目搭建到部署的实践指南。
        </li>
        <li>
          <a href="https://playground.solidjs.com" target="_blank" rel="noreferrer">
            Playground
          </a>
          ：在浏览器里直接试验本页的任意 API。
        </li>
      </ul>
      <p>
        也可以回到 <A href="/docs">文档总览</A>，按主题重新开始阅读。
      </p>
    </>
  );
}
