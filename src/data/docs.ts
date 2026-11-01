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
    summary: "用官方模板创建一个由 Vite 驱动的 Solid 应用，或把 Solid 装进现有项目。",
    reading: "4 分钟",
    level: "基础",
    headings: [
      { id: "before-you-start", text: "开始之前", depth: 2 },
      { id: "create-project", text: "用模板创建项目", depth: 2 },
      { id: "manual-install", text: "手动安装", depth: 2 },
      { id: "jsx-typescript", text: "配置 JSX 与 TypeScript", depth: 2 },
      { id: "entry", text: "应用入口", depth: 2 },
      { id: "next", text: "下一步", depth: 2 },
    ],
    keywords: ["安装", "Vite", "degit", "babel-preset-solid", "tsconfig", "render"],
    load: () => import("../content/getting-started"),
  },
  {
    slug: "reactivity",
    chapter: "02",
    group: "核心",
    title: "响应式模型",
    navTitle: "响应式模型",
    summary: "Solid 不会重新执行组件。它维护一张细粒度的依赖图，只更新真正变化的那一小块。",
    reading: "6 分钟",
    level: "基础",
    headings: [
      { id: "where-updates-happen", text: "更新发生在哪里", depth: 2 },
      { id: "signals-and-subscribers", text: "信号与订阅者", depth: 2 },
      { id: "run-once", text: "组件只运行一次", depth: 2 },
      { id: "sync-and-batch", text: "同步更新与批处理", depth: 2 },
      { id: "different-from-vdom", text: "与虚拟 DOM 的差别", depth: 2 },
      { id: "next", text: "继续阅读", depth: 2 },
    ],
    keywords: ["响应式", "依赖图", "订阅", "tracking scope", "虚拟 DOM", "createRoot"],
    load: () => import("../content/reactivity"),
  },
  {
    slug: "signals",
    chapter: "03",
    group: "核心",
    title: "信号与派生",
    navTitle: "信号与派生",
    summary: "createSignal 保存可变状态，createMemo 缓存派生值。两者构成 Solid 应用最常用的状态单元。",
    reading: "7 分钟",
    level: "基础",
    headings: [
      { id: "create-signal", text: "创建信号", depth: 2 },
      { id: "read-write", text: "读取与写入", depth: 2 },
      { id: "derived", text: "派生值", depth: 2 },
      { id: "lab", text: "交互演示", depth: 2 },
      { id: "memo-or-function", text: "memo 还是普通函数", depth: 2 },
      { id: "caveats", text: "注意事项", depth: 2 },
    ],
    keywords: ["createSignal", "createMemo", "getter", "setter", "派生", "双倍"],
    load: () => import("../content/signals"),
  },
  {
    slug: "effects",
    chapter: "04",
    group: "核心",
    title: "副作用与生命周期",
    navTitle: "副作用与生命周期",
    summary: "createEffect 负责把状态同步到外部世界，onMount 与 onCleanup 管好事情的开始和结束。",
    reading: "6 分钟",
    level: "进阶",
    headings: [
      { id: "create-effect", text: "创建 effect", depth: 2 },
      { id: "auto-tracking", text: "依赖自动追踪", depth: 2 },
      { id: "lifecycle", text: "onMount", depth: 2 },
      { id: "cleanup", text: "onCleanup", depth: 2 },
      { id: "pitfalls", text: "常见误区", depth: 2 },
    ],
    keywords: ["createEffect", "onMount", "onCleanup", "副作用", "清理", "定时器"],
    load: () => import("../content/effects"),
  },
  {
    slug: "stores",
    chapter: "05",
    group: "核心",
    title: "Store 状态",
    navTitle: "Store 状态",
    summary: "当状态有嵌套结构时，store 的代理让每个属性都能独立订阅，避免整棵对象一起更新。",
    reading: "7 分钟",
    level: "进阶",
    headings: [
      { id: "why-store", text: "为什么需要 store", depth: 2 },
      { id: "create-store", text: "创建与读取", depth: 2 },
      { id: "path-updates", text: "路径更新", depth: 2 },
      { id: "arrays", text: "数组操作", depth: 2 },
      { id: "produce-reconcile", text: "produce 与 reconcile", depth: 2 },
      { id: "lab", text: "交互演示", depth: 2 },
      { id: "caveats", text: "注意事项", depth: 2 },
    ],
    keywords: ["createStore", "setStore", "produce", "reconcile", "路径", "嵌套状态"],
    load: () => import("../content/stores"),
  },
  {
    slug: "context",
    chapter: "06",
    group: "核心",
    title: "Context",
    navTitle: "Context",
    summary: "把主题、语言、当前用户这类跨层级数据放到树上，任何后代都能直接取用。",
    reading: "5 分钟",
    level: "进阶",
    headings: [
      { id: "define-context", text: "定义 context", depth: 2 },
      { id: "provider-consumer", text: "Provider 与 useContext", depth: 2 },
      { id: "reactive-value", text: "让值保持响应式", depth: 2 },
      { id: "custom-hook", text: "封装自定义 hook", depth: 2 },
      { id: "caveats", text: "注意事项", depth: 2 },
    ],
    keywords: ["createContext", "useContext", "Provider", "跨层级", "主题", "自定义 hook"],
    load: () => import("../content/context"),
  },
  {
    slug: "components",
    chapter: "07",
    group: "视图",
    title: "组件与 JSX",
    navTitle: "组件与 JSX",
    summary: "Solid 组件只是返回 DOM 的函数，运行一次就完成搭建。props、children 和事件都靠编译器保持细粒度。",
    reading: "6 分钟",
    level: "基础",
    headings: [
      { id: "what-is-component", text: "组件是什么", depth: 2 },
      { id: "props", text: "props 与响应性", depth: 2 },
      { id: "children", text: "children", depth: 2 },
      { id: "events", text: "事件与属性", depth: 2 },
      { id: "refs", text: "refs", depth: 2 },
      { id: "composition", text: "组合", depth: 2 },
    ],
    keywords: ["组件", "JSX", "props", "children", "onClick", "ref", "classList"],
    load: () => import("../content/components"),
  },
  {
    slug: "control-flow",
    chapter: "08",
    group: "视图",
    title: "控制流",
    navTitle: "控制流",
    summary: "Show、For、Switch、Portal 和 ErrorBoundary 用组件表达分支与列表，让每处更新都保持最小。",
    reading: "6 分钟",
    level: "基础",
    headings: [
      { id: "conditional", text: "条件渲染", depth: 2 },
      { id: "lists", text: "列表与 key", depth: 2 },
      { id: "index", text: "Index 与 For", depth: 2 },
      { id: "switch", text: "多分支", depth: 2 },
      { id: "portal-error", text: "Portal 与 ErrorBoundary", depth: 2 },
      { id: "lab", text: "交互演示", depth: 2 },
    ],
    keywords: ["Show", "For", "Index", "Switch", "Match", "Portal", "ErrorBoundary", "列表"],
    load: () => import("../content/control-flow"),
  },
  {
    slug: "data-fetching",
    chapter: "09",
    group: "进阶",
    title: "数据获取",
    navTitle: "数据获取",
    summary: "createResource 把异步请求接入响应式系统，Suspense 和 ErrorBoundary 负责加载与失败状态。",
    reading: "7 分钟",
    level: "进阶",
    headings: [
      { id: "resource", text: "createResource", depth: 2 },
      { id: "states", text: "读取状态", depth: 2 },
      { id: "suspense", text: "Suspense 与 ErrorBoundary", depth: 2 },
      { id: "refetch", text: "刷新与本地变更", depth: 2 },
      { id: "lab", text: "交互演示", depth: 2 },
      { id: "ssr-data", text: "服务端数据", depth: 2 },
    ],
    keywords: ["createResource", "Suspense", "异步", "数据获取", "loading", "error", "refetch"],
    load: () => import("../content/data-fetching"),
  },
  {
    slug: "ssr",
    chapter: "10",
    group: "进阶",
    title: "SSR 与水合",
    navTitle: "SSR 与水合",
    summary: "服务端先产出可读 HTML，客户端再接管事件与响应式状态。流式传输让首屏更早出现。",
    reading: "7 分钟",
    level: "进阶",
    headings: [
      { id: "why", text: "为什么需要 SSR", depth: 2 },
      { id: "render", text: "在服务端渲染", depth: 2 },
      { id: "hydrate", text: "水合", depth: 2 },
      { id: "stream", text: "流式渲染", depth: 2 },
      { id: "progressive", text: "渐进式水合", depth: 2 },
      { id: "caveats", text: "注意事项", depth: 2 },
    ],
    keywords: ["SSR", "renderToString", "renderToStream", "hydrate", "水合", "流式", "isServer"],
    load: () => import("../content/ssr"),
  },
  {
    slug: "api",
    chapter: "11",
    group: "进阶",
    title: "API 速查",
    navTitle: "API 速查",
    summary: "把最常用的原语、组件和渲染 API 放在一页，写代码时随手查阅。",
    reading: "5 分钟",
    level: "参考",
    headings: [
      { id: "reactivity", text: "响应式原语", depth: 2 },
      { id: "stores", text: "Store", depth: 2 },
      { id: "control-flow", text: "控制流组件", depth: 2 },
      { id: "lifecycle", text: "生命周期", depth: 2 },
      { id: "data", text: "数据与过渡", depth: 2 },
      { id: "rendering", text: "渲染", depth: 2 },
      { id: "reference", text: "官方参考", depth: 2 },
    ],
    keywords: ["API", "速查", "createSignal", "createStore", "createResource", "render", "hydrate"],
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
