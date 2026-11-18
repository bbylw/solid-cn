import { Callout, CodeBlock } from "../components/Code";
import componentBasic from "./snippets/component-basic.tsx.txt?shiki";
import propsSnippet from "./snippets/props.tsx.txt?shiki";
import mergeOmit from "./snippets/comp-merge.tsx.txt?shiki";
import panel from "./snippets/panel.tsx.txt?shiki";
import eventsSnippet from "./snippets/comp-events.tsx.txt?shiki";
import input from "./snippets/input.tsx.txt?shiki";
import refsSnippet from "./snippets/refs.tsx.txt?shiki";
import directive from "./snippets/comp-directive.tsx.txt?shiki";

export default function Components() {
  return (
    <>
      <p>
        组件是 Solid 应用的基本单位，但它和“每次状态变化都重新执行的渲染函数”不是一回事。组件函数在每次挂载时执行一次，把结构搭好，之后的更新交给信号与编译后的细粒度绑定。
      </p>

      <h2 id="what-is-component">组件是什么</h2>
      <p>
        任何返回可渲染值的函数都是组件。首字母大写，才能在 JSX 里作为标签使用；小写标签会被当作原生元素。
      </p>
      <CodeBlock data={componentBasic} label="Welcome.tsx" />
      <p>
        组件可以返回元素、片段、字符串或数组，也可以返回另一个组件的调用结果，不需要显式声明{" "}
        <code>render</code>。函数的执行顺序也值得记住：<code>const [count, setCount] =
        createSignal(0)</code> 只在挂载时运行一次，不是每次更新都跑一遍。返回值类型用{" "}
        <code>Element</code>（来自 <code>solid-js</code>）；<code>JSX</code>{" "}
        命名空间已经归渲染器包，见<a href="/docs/getting-started">快速开始</a>。
      </p>
      <Callout tone="warn" title="组件体顶层不要读响应式值">
        <p>
          在函数体最外层读信号或 props（在参数里解构也算）只会取到一次快照，之后编译器再也看不到它的变化，开发构建会为此告警。把读取放进
          JSX 表达式、<code>createMemo</code>，或 effect 的 compute 段；确实要一次性快照时，用{" "}
          <code>untrack</code> 把意图写出来。
        </p>
      </Callout>

      <h2 id="props">props 与响应性</h2>
      <p>
        props 是父组件传给子组件的对象，属性访问本身就是读取入口。两条规则要配套使用：子组件不解构，父组件传值。
      </p>
      <CodeBlock data={propsSnippet} label="Button.tsx" />
      <p>
        需要默认值时，在读取处写 <code>props.tone ?? "solid"</code>，或者用 <code>merge</code>{" "}
        合并一份默认 props。
      </p>
      <Callout tone="warn" title="1.x 教程里的两种老写法">
        <p>
          传访问器：<code>{"<C value={count} />"}</code> 在 2.0 里把函数本身交给了子组件，要在
          JSX 边界上调用成值 <code>{"<C value={count()} />"}</code>。用老工具名：
          <code>mergeProps</code> 换成 <code>merge</code>，<code>splitProps</code> 换成{" "}
          <code>omit</code>。
        </p>
      </Callout>

      <h3 id="merge-omit">默认值与转发：merge 与 omit</h3>
      <CodeBlock data={mergeOmit} label="Chip.tsx" />
      <p>
        一个容易踩的细节：<code>merge</code> 把 <code>undefined</code> 当成真实值，显式传入{" "}
        <code>undefined</code> 会覆盖默认值，而不是“这一项跳过”。
      </p>

      <h2 id="children">children</h2>
      <p>
        组件标签之间的内容会作为 <code>props.children</code> 传入，它可能是已经创建好的节点，也可能是待解析的表达式。普通布局组件直接渲染它就够了。
      </p>
      <CodeBlock data={panel} label="Panel.tsx" />
      <p>
        要重复使用同一段 children，或者先在 JavaScript 里检查、遍历它，用 <code>children()</code>{" "}
        解析并缓存，再用 <code>.toArray()</code> 拿到数组。它仍然是访问器，读取要发生在响应式作用域里。
      </p>

      <h2 id="events">事件、class 与属性</h2>
      <p>
        JSX 事件名只认驼峰式：<code>on</code> 后面跟大写字母，例如 <code>onClick</code>、
        <code>onInput</code>、<code>onKeyDown</code>。常用事件仍然走委托，监听器装在渲染根上而不是每个元素上。内置属性按
        HTML 标准写成小写名，默认按属性处理。
      </p>
      <CodeBlock data={eventsSnippet} label="Toolbar.tsx" />
      <Callout tone="warn" title="小写 on* 不再是事件">
        <p>
          1.x 里 <code>{"<button onclick={fn} />"}</code> 会绑定点击；2.0{" "}
          里它只是在设置 <code>onclick</code> 这个属性，函数会被字符串化，开发构建遇到这种写法会告警。同理，
          <code>on:</code>、<code>oncapture:</code>、<code>attr:</code>、<code>bool:</code>、
          <code>use:</code> 和 <code>classList</code> 写在原生元素上都是编译错误，报错信息会直接给出替代写法。
        </p>
      </Callout>

      <h2 id="inputs">表单输入</h2>
      <p>
        2.0 的输入框不是严格受控的：<code>value={"{x()}"}</code>{" "}
        只在这个表达式重新运行时写回 DOM，打字本身不会改动信号；反过来，绑定一旦重新运行（比如同一个模板里别的动态属性变了），就会盖掉用户还没提交的文本。
      </p>
      <CodeBlock data={input} label="Search.tsx" />
      <p>
        所以进行中的输入放在 draft 信号里：<code>onInput</code> 负责写，<code>onChange</code>{" "}
        或提交时再交出去。如果处理函数过滤、截断了输入，还要把结果写回{" "}
        <code>event.currentTarget.value</code>——值没变的信号不会重新写 DOM，被拒绝的字符会留在框里。
      </p>
      <p>
        不需要响应式的输入就别绑 <code>value</code>：用 <code>defaultValue</code> /{" "}
        <code>defaultChecked</code> 给初值，提交时直接读元素。
      </p>

      <h2 id="refs">refs</h2>
      <p>
        需要碰到真实 DOM 时，声明一个变量交给 <code>ref</code>，编译后会在节点创建时把元素赋值进去。ref
        在元素插入页面之前就跑完了，所以量尺寸、读样式这类工作放到 <code>onSettled</code> 里（1.x 的{" "}
        <code>onMount</code> 由它取代，返回的函数就是清理逻辑）。
      </p>
      <CodeBlock data={refsSnippet} label="Canvas.tsx" />
      <p>
        回调 ref 在 2.0 里是 unowned 的：里面的 <code>getOwner()</code> 返回{" "}
        <code>null</code>，在它内部调用 <code>onCleanup</code> 不再生效。需要成对注册与清理时，把这段写在组件体的{" "}
        <code>onSettled</code> 里。
      </p>

      <h3 id="ref-directives">指令与数组 ref</h3>
      <p>
        <code>use:</code> 命名空间去掉了：指令现在就是一个返回回调的函数。推荐两阶段写法——函数体是
        owned 的 setup（建响应式原语、注册清理），返回的回调是 unowned 的 apply（只写 DOM）。
      </p>
      <CodeBlock data={directive} label="tooltip.ts" />
      <p>
        <code>ref</code> 接受数组来组合多个回调，数组还能嵌套。有个细节：放进数组的变量不会被赋值——那是编译期对单个{" "}
        <code>ref</code> 的改写，进不了数组——所以要用回调形式{" "}
        <code>{"ref={[(node) => (el = node), autofocus]}"}</code>。
      </p>

      <h2 id="composition">组合</h2>
      <p>
        组合有两条常见路子：内容作为 <code>children</code> 传入，或者把组件作为 prop{" "}
        传入（例如 <code>icon</code>、<code>fallback</code>）。前者适合布局容器，后者适合由子组件决定渲染位置的插槽。
      </p>
      <p>
        组件函数的执行顺序与普通函数一致：父组件先执行，返回的 JSX 中再创建子组件。不要依赖“子组件一定在父组件之后挂载”来做数据初始化；需要顺序时，把数据提到共同的上层，或者用{" "}
        <code>onSettled</code> 明确表达。
      </p>
      <p>
        如果某个组件只是转发 props，先考虑是否真的需要这层抽象。props 本身已经是响应式的，薄封装常常只增加阅读成本。
      </p>
      <p>
        相关阅读：<a href="/docs/control-flow">控制流</a>、<a href="/docs/reactivity">响应式模型</a>。
      </p>
    </>
  );
}
