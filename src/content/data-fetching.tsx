import { A } from "@solidjs/router";
import { Callout, CodeBlock, DemoFrame } from "../components/Code";
import { ResourceLab } from "../components/demos/ResourceLab";
import resource from "./snippets/resource.tsx.txt?shiki";

export default function DataFetching() {
  return (
    <>
      <p>
        <code>createResource</code> 把一次异步请求变成一个信号：来源变化时自动重新请求，
        读取结果时自动订阅。加载、成功、失败不再是三组手写状态，而是资源对象自带的字段。
      </p>

      <h2 id="resource">createResource</h2>
      <p>
        传入一个来源（通常是 signal 或 accessor）和一个 fetcher。来源为假值时不会请求；
        来源变化时，旧请求的结果会被忽略，只保留最新一次的响应。
      </p>
      <CodeBlock data={resource} label="user-resource.tsx" />
      <p>
        也可以省略来源，只传 fetcher，适合初始化时请求一次的资源。fetcher
        的第二个参数包含上一次的值以及是否正在刷新，可以用来做增量请求或占位展示。
      </p>
      <ul>
        <li>
          <code>data()</code> 读取当前值，未完成时为 <code>undefined</code>。
        </li>
        <li>
          <code>data.loading</code> 表示请求进行中，包括刷新。
        </li>
        <li>
          <code>data.error</code> 保存失败原因，成功时为 <code>undefined</code>。
        </li>
        <li>
          <code>data.latest</code> 在刷新期间保留上一次成功的值。
        </li>
      </ul>

      <h2 id="states">读取状态</h2>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>
                <code>data.state</code>
              </th>
              <th>加载中</th>
              <th>说明</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <code>unresolved</code>
              </td>
              <td>否</td>
              <td>还没有开始请求，来源为假值或尚未读取</td>
            </tr>
            <tr>
              <td>
                <code>pending</code>
              </td>
              <td>是</td>
              <td>首次请求进行中，没有可展示的数据</td>
            </tr>
            <tr>
              <td>
                <code>ready</code>
              </td>
              <td>否</td>
              <td>请求成功，<code>data()</code> 返回结果</td>
            </tr>
            <tr>
              <td>
                <code>refreshing</code>
              </td>
              <td>是</td>
              <td>已有旧数据，正在请求新数据</td>
            </tr>
            <tr>
              <td>
                <code>errored</code>
              </td>
              <td>否</td>
              <td>请求失败，错误在 <code>data.error</code>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <p>
        渲染时先判断 <code>loading</code> 与 <code>error</code>，再读取{" "}
        <code>data()</code>。在错误状态下直接调用资源会抛出异常；把它交给 ErrorBoundary
        处理也可以，但大多数界面更适合就地展示重试入口。
      </p>
      <Callout title="来源为假值时不发请求">
        <p>
          用 <code>createResource(userId, fetchUser)</code> 时，如果 <code>userId()</code>{" "}
          为 <code>undefined</code>、<code>null</code> 或 <code>false</code>，fetcher
          不会被调用。这正是“先选用户再加载详情”场景需要的默认行为。
        </p>
      </Callout>

      <h2 id="suspense">Suspense 与 ErrorBoundary</h2>
      <p>
        如果希望由上层统一处理加载状态，把读取资源的组件放进 <code>Suspense</code>。
        边界内任意资源处于 pending 时，先显示 <code>fallback</code>；资源就绪后，
        再渲染完整内容。
      </p>
      <p>
        <code>Suspense</code> 与局部 <code>Show</code> 是两种粒度：局部方案让每个区块
        自己显示骨架屏，适合页面里多个独立请求；<code>Suspense</code> 让整块内容一起等待，
        适合数据彼此依赖的页面。两者可以嵌套。
      </p>
      <p>
        错误处理遵循同样的分工：<code>ErrorBoundary</code> 接住渲染期抛出的异常，
        局部状态则在组件内展示。异步错误只有在被渲染路径读取时才会抛给边界；
        事件处理里的失败需要显式转换成状态。
      </p>

      <h2 id="refetch">刷新与本地变更</h2>
      <p>
        资源返回的第二个值包含操作函数。<code>refetch()</code> 不改变来源，重新执行 fetcher；
        <code>mutate(value)</code> 直接覆盖当前值，不发起请求。
      </p>
      <ul>
        <li>来源变化：自动请求新数据，旧结果被丢弃。</li>
        <li>
          <code>refetch()</code>：手动重试，适合错误恢复或“刷新”按钮。
        </li>
        <li>
          <code>mutate()</code>：提交成功后直接写入新值，避免多发一次 GET；之后再按需刷新。
        </li>
      </ul>
      <p>
        需要乐观更新时，先 <code>mutate</code> 写入预期结果，请求失败后再恢复旧值或调用{" "}
        <code>refetch</code>。资源的 <code>latest</code> 可以在请求期间保留旧界面，避免闪烁。
      </p>

      <h2 id="lab">交互演示</h2>
      <p>
        演示用 650 毫秒的延迟模拟请求。<code>userId</code> 是资源来源，切换用户会自动请求；
        “模拟失败”让下一次请求抛错，“重新请求”调用 <code>refetch</code>。
      </p>
      <DemoFrame
        label="resource · user profile"
        note="加载、错误、空数据三种分支都由资源状态驱动；请求次数会随来源变化累加。"
      >
        <ResourceLab />
      </DemoFrame>

      <h2 id="ssr-data">服务端数据</h2>
      <p>
        在 SSR 环境里，<code>createResource</code> 同样可以在服务端执行。
        <code>renderToStringAsync</code> 会等待资源完成再输出 HTML；<code>renderToStream</code>{" "}
        则在等待期间先发送已有的内容。客户端水合时，SolidStart 一类框架会把服务端数据序列化并恢复，
        避免首屏重复请求。
      </p>
      <p>
        如果资源只是可选的次要内容，可以用 <code>deferStream</code> 让它不阻塞首屏；
        关键数据则应尽早开始请求，或由路由的加载阶段提前准备。具体的数据序列化协议由框架负责，
        原语层面只需要关心来源与 fetcher。
      </p>
      <p>
        下一章从客户端走向服务端：同一套组件如何产出 HTML、如何水合，以及流式渲染改变了什么。
      </p>
      <p>
        相关阅读：<A href="/docs/control-flow">控制流</A>、<A href="/docs/ssr">SSR 与水合</A>、
        <A href="/docs/api">API 速查</A>。
      </p>
    </>
  );
}
