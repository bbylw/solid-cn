import type { Component } from "solid-js";

export type DocHeading = {
  id: string;
  text: string;
  depth: 2 | 3;
};

export type DocEntry = {
  slug: string;
  chapter: string;
  group: DocGroup;
  title: string;
  navTitle: string;
  summary: string;
  reading: string;
  level: "基础" | "进阶" | "参考";
  headings: DocHeading[];
  keywords: string[];
  load: () => Promise<{ default: Component }>;
};

export type DocGroup = "开始" | "核心" | "视图" | "进阶";

export const groupOrder: DocGroup[] = ["开始", "核心", "视图", "进阶"];

export const docs: DocEntry[] = [
  {
    slug: "getting-started",
    chapter: "01",
    group: "开始",
    title: "快速开始",
    navTitle: "快速开始",
    summary: "用 solid-v2 模板创建项目，或手动装上 solid-js 与 @solidjs/web，配好 Vite 插件和 jsxImportSource，几行 render 就能起跑。",
    reading: "4 分钟",
    level: "基础",
    headings: [
      { id: "before-you-start", text: "开始之前", depth: 2 },
      { id: "create-project", text: "用模板创建项目", depth: 2 },
      { id: "manual-install", text: "手动安装", depth: 2 },
      { id: "jsx-typescript", text: "配置 JSX 与 TypeScript", depth: 2 },
      { id: "entry", text: "应用入口", depth: 2 },
      { id: "upgrade-from-v1", text: "从 1.x 升级？", depth: 2 },
      { id: "next", text: "下一步", depth: 2 },
    ],
    keywords: ["安装", "Vite", "degit", "@solidjs/web", "@solidjs/vite-plugin", "tsconfig", "render", "jsxImportSource", "solid-v2 模板", "1.x 迁移"],
    load: () => import("../content/getting-started"),
  },
  {
    slug: "reactivity",
    chapter: "02",
    group: "核心",
    title: "响应式模型",
    navTitle: "响应式模型",
    summary: "Solid 2.0 仍然不重新执行组件：写入排队、在微任务结束时统一提交（flush() 可提前），只有读过状态的 JSX 表达式、memo 与 effect 会更新。",
    reading: "7 分钟",
    level: "基础",
    headings: [
      { id: "where-updates-happen", text: "更新发生在哪里", depth: 2 },
      { id: "signals-and-subscribers", text: "信号与订阅者", depth: 2 },
      { id: "run-once", text: "组件只运行一次", depth: 2 },
      { id: "batching-and-flush", text: "微任务批处理与 flush", depth: 2 },
      { id: "reads-lag-writes", text: "读取滞后于写入", depth: 3 },
      { id: "different-from-vdom", text: "与虚拟 DOM 的差别", depth: 2 },
      { id: "next", text: "继续阅读", depth: 2 },
    ],
    keywords: ["依赖图", "tracking scope", "microtask", "flush", "batch 已移除", "读取滞后于写入", "template", "insert", "delegateEvents", "@solidjs/web", "STRICT_READ_UNTRACKED", "REACTIVE_WRITE_IN_OWNED_SCOPE", "compute", "apply", "虚拟 DOM", "组件只运行一次"],
    load: () => import("../content/reactivity"),
  },
  {
    slug: "signals",
    chapter: "03",
    group: "核心",
    title: "信号与派生",
    navTitle: "信号与派生",
    summary: "createSignal 保存状态、createMemo 缓存派生值（第二个参数已是 options：equals / lazy），函数形式的 createSignal 是可写派生信号；读取要落在跟踪作用域里，生命周期跟着所有者走。",
    reading: "8 分钟",
    level: "基础",
    headings: [
      { id: "create-signal", text: "创建信号", depth: 2 },
      { id: "read-write", text: "读取与写入", depth: 2 },
      { id: "derived", text: "派生值", depth: 2 },
      { id: "memo-or-function", text: "memo 还是普通函数", depth: 3 },
      { id: "writable-derived", text: "可写派生信号", depth: 2 },
      { id: "ownership", text: "所有者与销毁", depth: 2 },
      { id: "lab", text: "交互演示", depth: 2 },
      { id: "caveats", text: "注意事项", depth: 2 },
    ],
    keywords: ["createSignal", "createMemo", "equals", "lazy", "unobserved", "可写派生信号", "untrack", "getter", "setter", "flush", "读取滞后于写入", "createRoot", "runWithOwner", "所有权", "ownedWrite"],
    load: () => import("../content/signals"),
  },
  {
    slug: "effects",
    chapter: "04",
    group: "核心",
    title: "副作用与生命周期",
    navTitle: "副作用与生命周期",
    summary: "createEffect 拆成 compute（跟踪）与 apply（副作用、返回清理）两段，on 由 compute 取代、onMount 由 onSettled 取代；effect 从不比较值，去重要靠 memo 闸门。",
    reading: "8 分钟",
    level: "进阶",
    headings: [
      { id: "create-effect", text: "拆成两段的 createEffect", depth: 2 },
      { id: "where-writes", text: "写入发生在哪里", depth: 3 },
      { id: "explicit-deps", text: "显式依赖：compute 就是声明", depth: 2 },
      { id: "never-compare", text: "effect 不比较值", depth: 2 },
      { id: "lifecycle", text: "onSettled 与清理", depth: 2 },
      { id: "errors", text: "错误处理", depth: 2 },
      { id: "pitfalls", text: "常见误区", depth: 2 },
    ],
    keywords: ["createEffect", "compute", "apply", "defer", "untrack", "onSettled", "onMount 已移除", "on 已移除", "onCleanup", "onFlush", "flush", "microtask", "equals", "EffectBundle", "Errored", "REACTIVE_WRITE_IN_OWNED_SCOPE", "ownedWrite"],
    load: () => import("../content/effects"),
  },
  {
    slug: "stores",
    chapter: "05",
    group: "核心",
    title: "Store 状态",
    navTitle: "Store 状态",
    summary: "store 用代理保存带结构的对象与数组、按属性订阅，2.0 的写入统一走 setter 给的草稿，再配 snapshot、reconcile 与派生 store 接住服务端数据和派生状态。",
    reading: "8 分钟",
    level: "进阶",
    headings: [
      { id: "why-store", text: "为什么需要 store", depth: 2 },
      { id: "create-store", text: "创建与读取", depth: 2 },
      { id: "draft-setter", text: "草稿式写入", depth: 2 },
      { id: "arrays", text: "数组与删除", depth: 2 },
      { id: "why-setter", text: "为什么写入要走 setter", depth: 2 },
      { id: "plain-values", text: "取出普通值：snapshot 与 deep", depth: 2 },
      { id: "reconcile", text: "用 reconcile 合并服务端数据", depth: 2 },
      { id: "derived-stores", text: "派生 store：createStore(fn) 与 createProjection", depth: 2 },
      { id: "lab", text: "交互演示", depth: 2 },
      { id: "caveats", text: "注意事项", depth: 2 },
    ],
    keywords: ["createStore", "setState", "draft", "草稿写入", "嵌套状态", "snapshot", "deep", "reconcile", "createProjection", "派生 store"],
    load: () => import("../content/stores"),
  },
  {
    slug: "context",
    chapter: "06",
    group: "核心",
    title: "Context",
    navTitle: "Context",
    summary: "2.0 里 context 对象自己就是 Provider（<Ctx value={...}>），无默认值的 createContext<T>() 让 useContext 直接返回 T，没有 Provider 时抛 ContextNotFoundError，包装钩子可以删掉。",
    reading: "6 分钟",
    level: "进阶",
    headings: [
      { id: "define-context", text: "定义 context", depth: 2 },
      { id: "provider-consumer", text: "提供与读取", depth: 2 },
      { id: "missing-provider", text: "没有 Provider 会怎样", depth: 2 },
      { id: "reactive-value", text: "让值保持响应式", depth: 2 },
      { id: "state-or-default", text: "状态用无默认值，回退用默认值", depth: 2 },
      { id: "caveats", text: "注意事项", depth: 2 },
    ],
    keywords: ["createContext", "useContext", "Provider", "value", "ContextNotFoundError", "默认值", "null", "跨层级", "store + actions"],
    load: () => import("../content/context"),
  },
  {
    slug: "components",
    chapter: "07",
    group: "视图",
    title: "组件与 JSX",
    navTitle: "组件与 JSX",
    summary: "组件函数只在挂载时运行一次；props 不解构、调用处传值，事件用驼峰、class 支持对象与数组，ref 与指令工厂负责真实 DOM。",
    reading: "6 分钟",
    level: "基础",
    headings: [
      { id: "what-is-component", text: "组件是什么", depth: 2 },
      { id: "props", text: "props 与响应性", depth: 2 },
      { id: "merge-omit", text: "默认值与转发：merge 与 omit", depth: 3 },
      { id: "children", text: "children", depth: 2 },
      { id: "events", text: "事件、class 与属性", depth: 2 },
      { id: "inputs", text: "表单输入", depth: 2 },
      { id: "refs", text: "refs", depth: 2 },
      { id: "ref-directives", text: "指令与数组 ref", depth: 3 },
      { id: "composition", text: "组合", depth: 2 },
    ],
    keywords: ["组件", "JSX", "props", "children", "onClick", "class 对象与数组", "ref", "指令工厂", "onSettled", "merge", "omit", "draft 输入"],
    load: () => import("../content/components"),
  },
  {
    slug: "control-flow",
    chapter: "08",
    group: "视图",
    title: "控制流",
    navTitle: "控制流",
    summary: "2.0 用 Show、For（三种 keyed 模式）、Repeat、Switch 表达分支与列表，用 Loading、Errored、Reveal 承担异步与错误边界，Portal 与 dynamic 工厂来自 @solidjs/web。",
    reading: "7 分钟",
    level: "基础",
    headings: [
      { id: "conditional", text: "条件渲染", depth: 2 },
      { id: "show-keyed", text: "函数子节点与 keyed", depth: 3 },
      { id: "lists", text: "列表渲染：For", depth: 2 },
      { id: "keyed-modes", text: "三种 keyed 模式", depth: 3 },
      { id: "repeat", text: "按位置渲染：Repeat", depth: 2 },
      { id: "switch", text: "多分支", depth: 2 },
      { id: "boundaries", text: "异步与错误边界", depth: 2 },
      { id: "portal-dynamic", text: "Portal 与 dynamic", depth: 2 },
      { id: "lab", text: "交互演示", depth: 2 },
    ],
    keywords: ["Show", "For", "keyed", "Repeat", "Switch", "Match", "Loading", "Errored", "Reveal", "Portal", "dynamic", "列表"],
    load: () => import("../content/control-flow"),
  },
  {
    slug: "data-fetching",
    chapter: "09",
    group: "进阶",
    title: "数据获取",
    navTitle: "数据获取",
    summary: "createResource 已被移除：异步就是 createMemo / 函数式 store 的返回值，Loading 与 isPending 表达等待，Errored 接住失败，refresh / affects 重新取数，action 与 createOptimistic 负责乐观更新与回滚。",
    reading: "8 分钟",
    level: "进阶",
    headings: [
      { id: "async-memo", text: "异步计算", depth: 2 },
      { id: "loading", text: "Loading 与 isPending", depth: 2 },
      { id: "loading-on", text: "on：让边界重新落回 fallback", depth: 3 },
      { id: "refresh", text: "refresh、affects 与 latest", depth: 2 },
      { id: "optimistic", text: "action 与乐观更新", depth: 2 },
      { id: "errors", text: "失败只有一条路径", depth: 2 },
      { id: "lab", text: "交互演示", depth: 2 },
      { id: "ssr-data", text: "服务端数据", depth: 2 },
    ],
    keywords: ["createMemo", "Loading", "isPending", "Errored", "Reveal", "refresh", "affects", "latest", "action", "createOptimistic", "createOptimisticStore", "until", "ssrSource", "异步"],
    load: () => import("../content/data-fetching"),
  },
  {
    slug: "ssr",
    chapter: "10",
    group: "进阶",
    title: "SSR 与水合",
    navTitle: "SSR 与水合",
    summary: "用 @solidjs/web 的 renderToString 与 renderToStream 在服务端产出 HTML，客户端 hydrate 直接采纳服务端答案，流式渲染让首屏更早出现。",
    reading: "8 分钟",
    level: "进阶",
    headings: [
      { id: "why", text: "为什么需要 SSR", depth: 2 },
      { id: "render", text: "两个渲染入口", depth: 2 },
      { id: "stream", text: "消费流：readable / pipe / pipeTo", depth: 2 },
      { id: "hydrate", text: "水合模型", depth: 2 },
      { id: "client-only", text: "只给浏览器的部分", depth: 2 },
      { id: "http", text: "声明响应状态与头", depth: 2 },
      { id: "caveats", text: "注意事项", depth: 2 },
    ],
    keywords: ["SSR", "renderToString", "renderToStream", "readable", "pipeTo", "hydrate", "水合", "流式", "ssrSource", "deferStream", "clientOnly", "httpStatus", "httpHeader", "@solidjs/web"],
    load: () => import("../content/ssr"),
  },
  {
    slug: "api",
    chapter: "11",
    group: "进阶",
    title: "API 速查",
    navTitle: "API 速查",
    summary: "Solid 2.0 常用原语、Store、异步与控制流组件的一页速查，含 @solidjs/web 渲染 API 与 1.x 迁移对照。",
    reading: "10 分钟",
    level: "参考",
    headings: [
      { id: "reactivity", text: "响应式原语", depth: 2 },
      { id: "create-signal", text: "createSignal", depth: 3 },
      { id: "create-memo", text: "createMemo", depth: 3 },
      { id: "create-effect", text: "createEffect", depth: 3 },
      { id: "on-settled", text: "onSettled / onCleanup", depth: 3 },
      { id: "flush-on-flush", text: "flush / onFlush", depth: 3 },
      { id: "ownership", text: "createRoot / getOwner / runWithOwner / untrack", depth: 3 },
      { id: "props-helpers", text: "merge / omit / children / lazy / createUniqueId", depth: 3 },
      { id: "stores", text: "Store", depth: 2 },
      { id: "create-store", text: "createStore", depth: 3 },
      { id: "reconcile-snapshot-deep", text: "reconcile / snapshot / deep", depth: 3 },
      { id: "create-projection", text: "createProjection", depth: 3 },
      { id: "create-optimistic", text: "createOptimistic / createOptimisticStore", depth: 3 },
      { id: "async", text: "异步与过渡", depth: 2 },
      { id: "action", text: "action", depth: 3 },
      { id: "is-pending-latest", text: "isPending / latest", depth: 3 },
      { id: "refresh-affects", text: "refresh / affects", depth: 3 },
      { id: "resolve-until", text: "resolve / until", depth: 3 },
      { id: "create-deferred", text: "createDeferred", depth: 3 },
      { id: "from", text: "from", depth: 3 },
      { id: "control-flow", text: "控制流组件", depth: 2 },
      { id: "show-switch-match", text: "Show / Switch / Match", depth: 3 },
      { id: "for-repeat", text: "For / Repeat", depth: 3 },
      { id: "loading-errored-reveal", text: "Loading / Errored / Reveal", depth: 3 },
      { id: "web", text: "@solidjs/web：渲染与挂载", depth: 2 },
      { id: "render-hydrate", text: "render / hydrate", depth: 3 },
      { id: "server-render", text: "renderToString / renderToStream", depth: 3 },
      { id: "portal-dynamic-client-only", text: "Portal / dynamic / clientOnly", depth: 3 },
      { id: "http-status-header", text: "httpStatus / httpHeader", depth: 3 },
      { id: "context", text: "上下文", depth: 2 },
      { id: "migration-map", text: "1.x → 2.0 对照", depth: 2 },
      { id: "reference", text: "官方参考", depth: 2 },
    ],
    keywords: ["API", "速查", "createSignal", "createMemo", "createEffect", "createStore", "createProjection", "action", "Loading", "Errored", "reconcile", "from", "render", "hydrate", "renderToStream", "2.0", "迁移"],
    load: () => import("../content/api"),
  },
];

export const docGroups = groupOrder.map((name) => ({
  name,
  docs: docs.filter((doc) => doc.group === name),
}));

export function getDoc(slug: string | undefined) {
  return docs.find((doc) => doc.slug === slug);
}

export function getAdjacent(slug: string) {
  const index = docs.findIndex((doc) => doc.slug === slug);
  return {
    previous: index > 0 ? docs[index - 1] : undefined,
    next: index >= 0 && index < docs.length - 1 ? docs[index + 1] : undefined,
  };
}

export const README_URL = "https://github.com/solidjs/solid";
export const DOCS_URL = "https://docs.solidjs.com";
export const PLAYGROUND_URL = "https://playground.solidjs.com";
export const DISCORD_URL = "https://discord.com/invite/solidjs";
export const REDDIT_URL = "https://www.reddit.com/r/solidjs/";
export const GITHUB_URL = "https://github.com/solidjs/solid";
export const OPEN_COLLECTIVE_URL = "https://opencollective.com/solid";
