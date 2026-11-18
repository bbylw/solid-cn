import { Callout, CodeBlock, DemoFrame } from "../components/Code";
import { ResourceLab } from "../components/demos/ResourceLab";
import asyncMemo from "./snippets/resource.tsx.txt?shiki";
import pendingSnippet from "./snippets/data-pending.tsx.txt?shiki";
import refreshSnippet from "./snippets/data-refresh.tsx.txt?shiki";
import optimisticSnippet from "./snippets/data-optimistic.tsx.txt?shiki";
import errorSnippet from "./snippets/data-error.tsx.txt?shiki";

export default function DataFetching() {
  return (
    <>
      <p>
        2.0 没有 <code>createResource</code>：<strong>异步只是计算的返回值</strong>。
        <code>createMemo</code> 可以返回 Promise，读取它和读取任何派生值一样；
        值还没就绪时，这次读取会走到最近的 <code>Loading</code> 边界。于是加载、失败、刷新、
        乐观更新各自有了通用的表达：<code>Loading</code> 与 <code>isPending</code> 管等待，{" "}
        <code>Errored</code> 管失败，<code>refresh</code> 管重新取数，<code>action</code> 与{" "}
        <code>createOptimistic</code> 管写入。
      </p>
      <Callout title="createResource 的每一项都换成了独立 API" tone="warn">
        <p>
          资源元组不再存在。<code>data.loading</code> → <code>Loading</code> /{" "}
          <code>isPending(() =&gt; data())</code>；<code>data.error</code> →{" "}
          <code>Errored</code>；<code>refetch()</code> → <code>refresh(data)</code>；
          <code>mutate()</code> → <code>createOptimistic</code> /{" "}
          <code>createOptimisticStore</code> 配合 <code>action</code>。
          左边这些字段和方法在 2.0 里都会被 TypeScript 直接拒绝。
        </p>
      </Callout>

      <h2 id="async-memo">异步计算</h2>
      <p>
        把 fetcher 写进 <code>createMemo</code>，源就是它读到的响应式值：<code>props.id</code>{" "}
        一变，memo 重新执行，旧结果自动作废，只认最新一次的响应。集合想按字段细分更新，
        就用函数式 <code>createStore(fn, seed)</code> 或 <code>createProjection</code>；
        需要“可以落后、但绝不超前”的视图，<code>createDeferred</code> 现在就是这样一个异步 memo。
      </p>
      <CodeBlock data={asyncMemo} label="user-fetch.tsx" />
      <p>
        类型也不再漏空洞：<code>user()</code> 的静态类型就是 <code>User</code>，
        “还没就绪”由结构（<code>Loading</code> 边界）表达，而不是靠每个组件判一次{" "}
        <code>undefined</code>。
      </p>

      <h2 id="loading">Loading 与 isPending</h2>
      <p>
        两者分工不同。<code>Loading</code> 是<strong>首次就绪</strong>的边界：子树读到未就绪的异步值时显示{" "}
        <code>fallback</code>。一旦渲染出内容，它在重新验证期间会像其他读者一样保留旧内容，
        不会把你踢回 <code>fallback</code>。要表达“有变化正在路上”，用{" "}
        <code>isPending(() =&gt; expr)</code>：当某个被跟踪的输入变了、新答案还没落地时为真。
      </p>
      <CodeBlock data={pendingSnippet} label="search.tsx" />
      <p>
        <code>isPending</code> 会真的执行一次传入的读取，所以它得待在应该拥有首屏{" "}
        <code>fallback</code> 的那条 <code>Loading</code> 边界里；只读上游状态、本身不可能未就绪的表达式
        才可以在边界外用。它也常用于禁用按钮：<code>{"<button disabled={isPending(user)}>"}</code>。
        反过来，<code>isPending(id)</code> 读的是上游那个信号自己——下层子树正在加载时，它依然是{" "}
        <code>false</code>。
      </p>

      <h3 id="loading-on">on：让边界重新落回 fallback</h3>
      <p>
        <code>on</code> 是一份依赖清单：被跟踪的表达式，值本身无关紧要，重要的是它读到了什么。
        它读的东西一变，边界就不再等待当前内容——如果下面还有未就绪的读取，就重新显示{" "}
        <code>fallback</code>；否则什么都不做。切换用户、翻页这类“换了一份数据”的动作靠它，
        而同一份数据的重新验证不该靠它。
      </p>
      <p>
        两种情况看不到 <code>fallback</code>：同一份数据在边界外也被读（整个画面会等它，dev 会报{" "}
        <code>LOADING_ON_OUTSIDE_HOLD</code>，把那个读取挪进边界即可），或者写入发生在一个还没结束的{" "}
        <code>action</code> 里。后者本该显示等待，用 <code>isPending</code> 或乐观值来表达。
      </p>

      <h2 id="refresh">refresh、affects 与 latest</h2>
      <p>
        <code>refresh(target)</code> 取代了 <code>refetch()</code>：它可以作用于任何派生读取，
        重新问一次同一个问题。因为问题没变，它是<strong>安静</strong>的——新值到点悄悄替换，
        <code>isPending</code> 保持 <code>false</code>。轮询、写入之后的确认刷新都该是安静的；
        想让这次重新加载被读成在途，先声明它：<code>affects(target)</code> 标记“进行中的工作会改变这份数据”，
        直到事务结束为止，它和它的派生值都读成 pending。<code>refresh</code> 还会返回目标下一次静默点的
        Promise，需要顺序时才 <code>await</code>；在 <code>action</code> 里则写成{" "}
        <code>yield refresh(target)</code>。
      </p>
      <CodeBlock data={refreshSnippet} label="refresh.tsx" />
      <p>
        <code>latest(target)</code> 在过渡期间窥看在途的值：屏幕上还是上一份，
        而 <code>latest</code> 已经读到换上的新 <code>id</code>。刷新粒度是派生函数的粒度，
        没有“只刷某一行”的接口——把派生 store 的根交给 <code>refresh</code>。
      </p>

      <h2 id="optimistic">action 与乐观更新</h2>
      <p>
        写入不是读取。<code>action(fn)</code> 包住一个生成器函数，把两次 <code>yield</code>{" "}
        之间的所有写入合成一个事务：先写乐观值，<code>yield</code> 服务端请求，再用{" "}
        <code>refresh</code> 对齐权威数据。乐观写入用 <code>createOptimistic</code>（信号）或{" "}
        <code>createOptimisticStore</code>（store），它们在过渡结束时一律回到源数据——
        成功时 <code>refresh</code> 已经把真值放进来，失败时抛出，覆盖层自动回滚，不需要手写恢复逻辑。
      </p>
      <CodeBlock data={optimisticSnippet} label="todo-actions.tsx" />
      <p>
        三者各有分工：乐观写入<strong>显示</strong>期望的值（它不会让自己读成 pending），{" "}
        <code>affects</code> <strong>标记</strong>你知道会变、但还拿不出来的数据，而“保存中”这类过程标记是
        一起写进事务的乐观布尔值，不是 <code>isPending</code>。如果确认不在这次请求的响应里，
        而是稍后从 socket、订阅到达，用 <code>until(predicate, {`{ timeout }`})</code> 押住过渡：
        谓词读的是权威视图，你自己的乐观写入喂不了它，真值一出现事务就提交。
      </p>
      <p>
        乐观写入发生在源数据<strong>首次落地之后</strong>：答案还没回来就往覆盖层里写，
        dev 会报 <code>OPTIMISTIC_WRITE_BEFORE_LOAD</code>。把提交入口画在 <code>Loading</code>{" "}
        边界里面，这个前提自然成立。
      </p>

      <h2 id="errors">失败只有一条路径</h2>
      <p>
        1.x 里 <code>resource.error</code> 提供了一条绕过错误边界的分支，它和{" "}
        <code>ErrorBoundary</code> 互不相通。2.0 只有一条路径：异步计算的 rejection 顺着依赖图传播，
        被最近的 <code>Errored</code> 接住，SSR 也据此知道这棵树失败了。
      </p>
      <CodeBlock data={errorSnippet} label="errored.tsx" />
      <p>
        边界是<strong>自动愈合</strong>的：子树重新渲染出内容，<code>fallback</code> 就退场，
        <code>resetErrorBoundaries</code> 已不存在；<code>fallback</code> 回调的第二个参数{" "}
        <code>reset</code> 用于重试渲染期抛出的错误，请求失败请重新 <code>refresh</code> 数据源。
        事件处理函数、定时器里抛出的异常仍然不会自动进边界，想在渲染之外处理就用{" "}
        <code>createEffect</code> 的 <code>error</code> 分支。
      </p>

      <h2 id="lab">交互演示</h2>
      <p>
        演示用 650 毫秒延迟模拟请求，全部代码就是 <code>createMemo(() =&gt; fetchProfile(userId()))</code>。
        切换用户会命中 <code>on</code>，边界重新落回 <code>fallback</code>；“模拟失败”是 memo{" "}
        <strong>跟踪</strong>的输入，切换它等于换了一次提问，失败顺着依赖图落进{" "}
        <code>Errored</code>，<code>refresh</code> 之后边界自己愈合。两个刷新按钮的差别值得一试：
        静默的 <code>refresh</code> 不点亮指示器，<code>affects + refresh</code> 会。
      </p>
      <DemoFrame
        label="data · async memo + Loading"
        note="只有第一个 await 之前的读取会被跟踪；演示里的失败开关就在 await 之前读取，所以它成了一份普通输入。"
      >
        <ResourceLab />
      </DemoFrame>

      <h2 id="ssr-data">服务端数据</h2>
      <p>
        异步既然活在普通计算里，SSR 与水合策略就成了原语上的选项。<code>ssrSource</code> 决定客户端怎么起步：
        默认 <code>"server"</code> 采纳服务端序列化的值、不重新执行计算（首屏不会重复请求）；{" "}
        <code>"hybrid"</code> 在此基础上继续消费异步迭代器；<code>"client"</code> 跳过服务端值，
        等水合后再算一次。
      </p>
      <p>
        <code>deferStream: true</code> 让一个较晚落地的来源按住文档的首次 flush，而不是把{" "}
        <code>fallback</code> 写进 HTML；它只在服务端有效。协议与序列化由框架负责，
        原语层面只需要关心计算本身，细节见 <a href="/docs/ssr">SSR 与水合</a>。
      </p>
      <p>
        相关阅读：<a href="/docs/control-flow">控制流</a>、<a href="/docs/stores">Store 状态</a>、
        <a href="/docs/api">API 速查</a>。
      </p>
    </>
  );
}
