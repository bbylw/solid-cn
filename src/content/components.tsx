import { A } from "@solidjs/router";
import { Callout, CodeBlock } from "../components/Code";
import propsSnippet from "./snippets/props.tsx.txt?shiki";
import componentBasic from "./snippets/component-basic.tsx.txt?shiki";
import panel from "./snippets/panel.tsx.txt?shiki";
import input from "./snippets/input.tsx.txt?shiki";
import refsSnippet from "./snippets/refs.tsx.txt?shiki";

export default function Components() {
  return (
    <>
      <p>
        组件是 Solid 应用的基本单位，但它和“每次状态变化都重新执行的渲染函数”不是一回事。
        一个组件函数在每次挂载时执行一次，把结构搭好，然后把更新交给信号与编译后的绑定。
      </p>

      <h2 id="what-is-component">组件是什么</h2>
      <p>
        任何返回 <code>JSX.Element</code> 的函数都是组件。首字母大写，才能在 JSX
        里作为标签使用；小写标签会被当作原生元素。
      </p>
      <CodeBlock data={componentBasic} label="Welcome.tsx" />
      <p>
        组件可以返回元素、片段、字符串或数组，也可以返回另一个组件调用结果。它不需要显式声明{" "}
        <code>render</code>，返回值本身就是界面描述。Solid 的 JSX 编译器会把静态部分提取为模板，
        把动态表达式变成细粒度更新。
      </p>

      <h2 id="props">props 与响应性</h2>
      <p>
        props 是父组件传给子组件的对象。关键点是：<strong>props 的属性是 getter</strong>，
        读取时才取当前值。因此不要在参数列表里解构：
      </p>
      <CodeBlock data={propsSnippet} label="Button.tsx" />
      <p>
        解构发生在函数执行的那一刻，会把值固化成快照，后续父组件传入新值时子组件看不到变化。
        保留 <code>props.tone</code> 这样的属性访问，响应性才会保留。需要默认值时，用{" "}
        <code>props.tone ?? "solid"</code>，或用 <code>mergeProps</code> 合并默认值。
      </p>
      <Callout title="children 也是 getter">
        <p>
          <code>props.children</code> 是一个只读属性，背后可能是惰性创建的节点。不要在组件函数体里
          把它存进变量再到处使用；直接渲染，或在需要转换时用 <code>children()</code> 辅助函数。
        </p>
      </Callout>

      <h2 id="children">children</h2>
      <p>
        组件标签之间的内容会作为 <code>children</code> 传入。类型是{" "}
        <code>JSX.Element</code>，可以包含任意 JSX、文本或组件。
      </p>
      <CodeBlock data={panel} label="Panel.tsx" />
      <p>
        如果组件需要多次使用同一段 children，或需要在渲染前读取它，Solid 提供{" "}
        <code>children</code> 辅助函数来解析并缓存。对于只渲染一次的普通布局组件，直接使用{" "}
        <code>props.children</code> 就足够。
      </p>

      <h2 id="events">事件与属性</h2>
      <p>
        JSX 使用驼峰式事件名，例如 <code>onClick</code>、<code>onInput</code>、
        <code>onKeyDown</code>。Solid 会把常用事件委托到根节点，减少监听器数量；自定义事件可以直接
        绑定对应属性。
      </p>
      <CodeBlock data={input} label="input.tsx" />
      <p>
        常见属性写法：<code>class</code> 接受字符串，<code>classList</code> 接受布尔映射，{" "}
        <code>style</code> 接受对象。动态属性读取信号时会自动订阅，不需要额外的更新函数。
        受控输入用 <code>value</code> + <code>onInput</code>；只想设置初始值则用{" "}
        <code>value</code> 配合非受控写法，或直接使用 <code>defaultValue</code>。
      </p>

      <h2 id="refs">refs</h2>
      <p>
        需要访问真实 DOM 时，声明一个变量并交给 <code>ref</code>，编译后会在节点创建时赋值。
        在 <code>onMount</code> 或事件处理里，这个变量已经指向真实元素。
      </p>
      <CodeBlock data={refsSnippet} label="Canvas.tsx" />
      <p>
        也可以传回调函数做更复杂的初始化。回调 ref 在节点挂载和卸载时都会调用，适合需要成对注册、
        清理的第三方库。注意类型标注，例如 <code>HTMLCanvasElement</code>，避免使用{" "}
        <code>any</code>。
      </p>

      <h2 id="composition">组合</h2>
      <p>
        组合有两种常见方式：把内容作为 <code>children</code> 传入，或把组件作为 prop
        传入（例如 <code>icon</code>、<code>fallback</code>）。前者适合布局容器，后者适合需要
        决定渲染位置的插槽。
      </p>
      <p>
        组件函数的执行顺序与普通函数一致：父组件先执行，返回的 JSX 中再创建子组件。不要依赖
        “子组件一定在父组件之后挂载”来做数据初始化；需要顺序时，把数据提到共同的上层，或用{" "}
        <code>onMount</code> 与路由数据加载明确表达。
      </p>
      <p>
        如果某个组件只是转发 props，先考虑是否真的需要这层抽象。Solid 的 props
        本身已经是响应式的，薄封装有时只会增加阅读成本。
      </p>
      <p>
        下一章会把条件、列表、多分支和错误处理集中起来，看看 Solid 如何用组件表达控制流。
      </p>
      <p>
        相关阅读：<A href="/docs/control-flow">控制流</A>、<A href="/docs/reactivity">响应式模型</A>。
      </p>
    </>
  );
}
