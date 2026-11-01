import { A } from "@solidjs/router";
import { Callout, CodeBlock } from "../components/Code";
import serverEntry from "./snippets/ssr-server.tsx.txt?shiki";
import clientEntry from "./snippets/ssr-client.tsx.txt?shiki";
import streamEntry from "./snippets/ssr-stream.tsx.txt?shiki";

export default function Ssr() {
  return (
    <>
      <p>
        服务端渲染（SSR）先让服务器产出 HTML，浏览器不等 JavaScript 下载完就能看到内容；
        脚本到达后，客户端再接管这份 HTML，这个过程叫水合（hydration）。Solid
        的组件在两端执行的是同一份代码，差别只在渲染目标。
      </p>

      <h2 id="why">为什么需要 SSR</h2>
      <ul>
        <li>
          <strong>更早的首屏。</strong> 内容以 HTML 形式到达，弱网与低端设备上尤其明显。
        </li>
        <li>
          <strong>可被爬虫读取。</strong> 搜索引擎与预览卡片拿到的是完整标记，而不是空壳。
        </li>
        <li>
          <strong>更快的可交互时间。</strong> 浏览器可以边解析 HTML 边下载脚本，不必等整页渲染完。
        </li>
      </ul>
      <p>
        Solid 的 SSR 不是把组件渲染成字符串再丢掉。服务端会一并输出资源数据与边界标记，
        客户端据此恢复同一棵树，避免重复创建 DOM，也避免首屏请求风暴。
      </p>

      <h2 id="render">在服务端渲染</h2>
      <p>
        服务端入口用 <code>renderToString</code> 得到 HTML 字符串。它同步执行，
        不会等待异步资源；需要等待时使用 <code>renderToStringAsync</code>，或者改用流式渲染。
      </p>
      <CodeBlock data={serverEntry} label="entry-server.tsx" />
      <p>
        渲染函数同样可以接收路由上下文、请求信息等参数，把它们通过 props 或 context
        传进应用。服务端与客户端必须使用同一份 <code>App</code> 与同一组初始状态，否则水合会对不上。
      </p>
      <Callout title="服务端没有浏览器 API" tone="warn">
        <p>
          <code>window</code>、<code>document</code>、<code>localStorage</code> 在服务端不存在。
          组件渲染期间不要直接访问它们；把这类逻辑放进 <code>onMount</code>，
          或用 <code>isServer</code> 判断当前环境。
        </p>
      </Callout>

      <h2 id="hydrate">水合</h2>
      <p>
        客户端入口把同一棵组件树交给 <code>hydrate</code>，而不是 <code>render</code>。
        水合会复用服务端产出的 DOM，补上事件监听与响应式绑定，不会从头创建节点。
      </p>
      <CodeBlock data={clientEntry} label="entry-client.tsx" />
      <p>
        水合要求两端的首次输出一致。随机数、当前时间、仅客户端可见的开关都会让标记不同；
        需要这类值时，应在挂载后再读取，或由服务端显式传入。
      </p>
      <p>
        事件处理函数不会出现在 HTML 里，它们是水合阶段挂上去的。水合完成之前，页面可读但不可交互；
        这也是为什么首屏脚本要尽量小。
      </p>

      <h2 id="stream">流式渲染</h2>
      <p>
        <code>renderToStream</code> 让 HTML 分块发送：已经就绪的外壳先到浏览器，Suspense
        边界内的异步内容完成后再补发，并用脚本把占位替换成真实内容。
      </p>
      <CodeBlock data={streamEntry} label="entry-server.tsx" />
      <p>
        流式渲染的价值在等待时间上：用户更早看到导航、标题和骨架屏，而不是盯着空白页。
        对数据较慢但结构稳定的页面，这通常比“等全部完成再返回”体验更好。
      </p>
      <p>
        资源可以通过 <code>deferStream</code> 选择不阻塞外壳；关键数据仍应尽早开始请求。
        流式输出对代理与压缩中间件有要求，部署时需要确认响应没有被缓冲到最后一个字节。
      </p>

      <h2 id="progressive">渐进式水合</h2>
      <p>
        流式渲染把页面拆成外壳与若干边界：外壳先到，内容按资源完成的顺序补上。客户端脚本到达后，
        应用开始水合，Suspense 边界内的占位会随数据就绪逐步替换成可交互内容。
      </p>
      <p>
        要让这种渐进过程有效，边界要划在真正独立的内容上。把整个页面包进一个 Suspense，
        等于退回“全部就绪再显示”；把每个小图标都划成边界，又会让脚本与标记变得碎片化。
        按数据依赖划分区块，是这里最重要的设计决策。
      </p>
      <p>
        SolidStart 一类元框架会在这层之上处理路由、数据序列化与部署适配；如果使用纯{" "}
        <code>solid-js/web</code>，这些部分需要自己在服务端入口里组织。
      </p>

      <h2 id="caveats">注意事项</h2>
      <ul>
        <li>
          <strong>首次输出必须可预测。</strong> 两端渲染结果不一致会导致水合错误或内容闪烁。
          把浏览器专属逻辑推迟到挂载之后。
        </li>
        <li>
          <strong>区分三种渲染入口。</strong> <code>renderToString</code> 同步、{" "}
          <code>renderToStringAsync</code> 等待资源、<code>renderToStream</code> 分块输出；
          按页面需求选择。
        </li>
        <li>
          <strong>资源要能被序列化。</strong> 服务端取到的数据需要安全地写进 HTML
          并能在客户端恢复；不要把不可序列化的对象直接塞进初始状态。
        </li>
        <li>
          <strong>注意注入风险。</strong> 任何来自用户的内容都要转义；需要插入 HTML 时使用
          框架提供的安全边界，而不是随意拼接字符串。
        </li>
      </ul>
      <p>
        最后一章把常用 API 按主题整理成一页，方便在写代码时快速查阅签名与返回结构。
      </p>
      <p>
        相关阅读：<A href="/docs/data-fetching">数据获取</A>、<A href="/docs/api">API 速查</A>。
      </p>
    </>
  );
}
