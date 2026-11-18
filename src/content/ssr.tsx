import { Callout, CodeBlock, SnippetTabs } from "../components/Code";
import serverSnippet from "./snippets/ssr-server.tsx.txt?shiki";
import clientSnippet from "./snippets/ssr-client.tsx.txt?shiki";
import streamSnippet from "./snippets/ssr-stream.tsx.txt?shiki";
import clientOnlySnippet from "./snippets/ssr-client-only.tsx.txt?shiki";
import httpSnippet from "./snippets/ssr-http.tsx.txt?shiki";

export default function Ssr() {
  return (
    <>
      <p>
        SSR 让服务器先产出可读的 HTML，浏览器不必等脚本下载完就能看到内容；脚本到达后客户端再接管这份
        DOM，这一步叫水合（hydration）。两端跑的是同一份组件，区别只在渲染目标：
        <code>renderToString</code> / <code>renderToStream</code> 面向字符串和流，
        <code>render</code> / <code>hydrate</code> 面向真实 DOM。这四个函数都在{" "}
        <code>@solidjs/web</code> 里，<code>solid-js/web</code> 已不存在。
      </p>
      <p>
        本站部署在 GitHub Pages 上，是纯客户端渲染的静态站点，所以这一章按“自己接服务器”的写法来讲。
        想用现成的路由、数据加载和部署适配，请直接看{" "}
        <a href="https://github.com/solidjs/solid-start" target="_blank" rel="noreferrer">
          SolidStart
        </a>
        ；核心库侧的完整设计见上游{" "}
        <a
          href="https://github.com/solidjs/solid/blob/next/documentation/solid-2.0/12-ssr-http.md"
          target="_blank"
          rel="noreferrer"
        >
          RFC 12
        </a>
        。
      </p>

      <h2 id="why">为什么需要 SSR</h2>
      <ul>
        <li>
          <strong>更早的首屏。</strong> 内容以 HTML 到达，弱网和低端设备上差距尤其明显。
        </li>
        <li>
          <strong>可被爬虫读取。</strong> 搜索引擎与分享预览拿到的是完整标记，而不是空壳。
        </li>
        <li>
          <strong>边传边渲染。</strong> 流式输出让外壳先到浏览器，慢的内容随后补上。
        </li>
      </ul>
      <p>
        Solid 的水合不是“再渲染一遍”。服务端把异步读取的答案一并序列化进 HTML，客户端直接采纳这些结果，
        因此既不会重复创建 DOM，也不会在加载时重放一遍请求。
      </p>

      <h2 id="render">两个渲染入口</h2>
      <p>
        <code>renderToString(fn, options?)</code> 同步返回字符串：异步内容还没就绪时，它渲染所在{" "}
        <code>Loading</code> 边界的 <code>fallback</code>。<code>renderToStream(fn, options?)</code>{" "}
        先冲刷外壳，再按就绪顺序逐块补发边界内容，并带上把占位换成真实 DOM 的脚本。
      </p>
      <SnippetTabs
        label="服务端入口"
        tabs={[
          { id: "string", label: "字符串", fileLabel: "entry-server.tsx", data: serverSnippet },
          { id: "stream", label: "流式", fileLabel: "entry-server.tsx", data: streamSnippet },
        ]}
      />
      <p>
        文档里必须包含水合脚本：<code>&lt;HydrationScript /&gt;</code>（或 <code>generateHydrationScript()</code>{" "}
        返回的字符串）要出现在应用标记之前，入口脚本用 <code>defer</code>（模块脚本本身也是延后的），
        不要用 <code>async</code>——它可能在水合记录写入之前就执行，于是对着空文档水合。
      </p>

      <h2 id="stream">消费流：readable / pipe / pipeTo</h2>
      <p>
        <code>renderToStream</code> 返回三个消费面，<strong>一次渲染只能用其中一个</strong>：
        <code>readable</code> 是 <code>Response</code> body 就绪的 <code>
          ReadableStream&lt;Uint8Array&gt;
        </code>{" "}
        （worker、Deno、fetch 风格的 Node 框架直接 <code>new Response(stream.readable)</code>，不必再手搓{" "}
        <code>TransformStream</code>）；<code>pipe(writable)</code> 对接 Node 风格可写流；{" "}
        <code>pipeTo(writable)</code> 对接 Web 可写流并返回写入完成的 Promise。
      </p>
      <p>
        也可以直接 <code>await renderToStream(fn)</code>：它等整棵树稳定后返回完整 HTML 字符串，
        这就是 1.x 里 <code>renderToStringAsync</code> 的位置。传 <code>signal</code> 可以让请求取消时干净收尾；{" "}
        <code>Reveal</code> 的 <code>order="together"</code> 与 <code>collapsed</code> 只在流式渲染下可用。
      </p>
      <p>
        流式的收益全在等待时间上：用户先看到导航、标题和骨架，而不是空白页。部署时确认代理与压缩中间件没有把响应缓冲到最后一个字节，
        否则外壳不会提前冲刷。
      </p>

      <h2 id="hydrate">水合模型</h2>
      <p>
        客户端把同一棵组件树交给 <code>hydrate</code> 而不是 <code>render</code>：它认领服务端已有的 DOM，
        补上事件监听与响应式绑定。
      </p>
      <CodeBlock data={clientSnippet} label="entry-client.tsx" />
      <p>
        水合<strong>采纳服务端的回答</strong>：服务端已经得到的值或错误，客户端不再重新请求。不过被采纳的计算仍会执行一次来记录依赖，
        这个同步窗口里全局 <code>Promise</code> 和 <code>fetch</code> 被换成永不落地的假对象——它们不发请求，await 它们也永远不会恢复。
        于是有两条硬规则：不要把计算里创建的 promise 或 <code>import()</code>{" "}
        结果存进活过这个窗口的缓存（缓存已解析的值，或者把加载挪到计算之外），也不要在发请求之前先 <code>await</code>{" "}
        一个真 promise（那会让后续代码在窗口结束后重新发起请求）。
      </p>
      <p>
        每个原语自己决定水合策略，用 <code>ssrSource</code> 选项：<code>"server"</code>（默认，采纳服务端序列化的值）、
        <code>"hybrid"</code>（先采纳，再由客户端接着消费异步可迭代来源）、<code>"client"</code>（跳过服务端值，
        水合后才计算；服务端要么留下一个由 <code>Loading</code> 兜住的空洞，要么渲染声明的 <code>loadingValue</code>）。
        配套的 <code>deferStream: true</code> 让本次渲染的冲刷等到该原语的第一个值就绪，
        适合“宁可晚一点也不要先塞骨架屏”的数据。这些选项只在服务端有意义，客户端会忽略。
      </p>
      <Callout title="服务端没有浏览器 API" tone="warn">
        <p>
          <code>window</code>、<code>document</code>、<code>localStorage</code> 在服务端不存在。
          要读它们就放到 <code>onSettled</code> 里，或者用 <code>isServer</code>（构建期常量，可死代码消除）{" "}
          和 <code>isHydrating()</code> 把差异隔离开；纯浏览器组件用下一节的 <code>clientOnly</code>。
          <code>Portal</code> 在服务端渲染会直接抛错。
        </p>
      </Callout>

      <h2 id="client-only">只给浏览器的部分</h2>
      <p>
        <code>clientOnly</code> 包住一个动态导入的组件：服务端完全不参与，连 import 都不启动，
        只渲染 <code>props.fallback</code>；客户端加载并挂载后才换成真实组件。
      </p>
      <CodeBlock data={clientOnlySnippet} label="browser-only.tsx" />
      <p>
        它不参与水合资源清单，也自带挂载门控，因此不会造成标记不一致；需要“只在浏览器有值”的状态时，
        还可以用 <code>ssrSource: "client"</code> 或 <code>isHydrating()</code> 配合 <code>onSettled</code>。
      </p>

      <h2 id="http">声明响应状态与头</h2>
      <p>
        <code>httpStatus(code, text?)</code> 与 <code>httpHeader(name, value, options?)</code>（同属{" "}
        <code>@solidjs/web</code>）让你在渲染树里决定 HTTP 响应：它们是与作用域绑定的<strong>声明</strong>，
        不是改写——在组件体里直接调用即可（写在 <code>if</code> 分支里也行），作用域销毁时自动撤回，
        因此 404 页里某个边界恢复后不会顺手覆盖掉别人声明的状态。请求事件由 <code>getRequestEvent()</code> 读取，
        响应头一旦提交（流式的外壳冲刷，或字符串渲染完成）后续声明即为空操作，客户端也永远是空操作。
      </p>
      <CodeBlock data={httpSnippet} label="response-head.tsx" />

      <h2 id="caveats">注意事项</h2>
      <ul>
        <li>
          <strong>两端首屏要一致。</strong> 随机数、当前时间、只在客户端存在的开关都会让标记对不上；
          这类值放到 <code>onSettled</code> 之后读，或由服务端传入。
        </li>
        <li>
          <strong>边界划在真正的数据依赖上。</strong> 整页只有一个 <code>Loading</code> 等于退回“全部就绪再显示”，
          每个小图标都划边界又让标记碎片化。
        </li>
        <li>
          <strong>边界外的读取会拖住整帧。</strong> 同一份数据在 <code>Loading</code> 外面也被读取时，
          那一帧会等它，fallback 永远看不见（开发期报 <code>LOADING_ON_OUTSIDE_HOLD</code>）；
          想显示“更新中”用 <code>isPending(() =&gt; x())</code>。
        </li>
        <li>
          <strong>初始状态要可序列化。</strong> 服务端取到的数据会写进 HTML 再在客户端恢复，
          不可序列化的对象别塞进初始值；用户内容一律交给框架转义，不要手拼 HTML 字符串。
        </li>
        <li>
          <strong>路由、server functions、服务端组件属于上一层。</strong> 核心只提供交换层的机制，
          框架层的选择请看 SolidStart 与上游 RFC。
        </li>
      </ul>
      <p>
        相关阅读：<a href="/docs/data-fetching">数据获取</a>（异步计算与 <code>Loading</code>）、{" "}
        <a href="/docs/api">API 速查</a>。
      </p>
    </>
  );
}
