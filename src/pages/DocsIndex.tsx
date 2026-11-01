import { A } from "@solidjs/router";
import { Title, Meta } from "@solidjs/meta";
import { For } from "solid-js";
import { docs, docGroups } from "../data/docs";

const readingPaths = [
  {
    title: "第一次接触 Solid",
    desc: "先看组件为什么只运行一次，再理解信号与派生值，最后进入 Store。",
    path: "01 / 02 / 03 / 04 / 05",
  },
  {
    title: "从 React 过来",
    desc: "跳过安装，直接从细粒度更新与组件模型读起，再对照控制流与 Context。",
    path: "02 / 03 / 07 / 06 / 08",
  },
  {
    title: "直接查用法",
    desc: "从 API 速查找到原语，再回到对应章节看完整解释和可运行示例。",
    path: "11 / 03 / 05 / 09",
  },
];

export default function DocsIndex() {
  return (
    <>
      <Title>文档总览 · Solid 中文</Title>
      <Meta
        name="description"
        content="Solid 文档：11 章覆盖快速开始、响应式模型、信号与派生、副作用、Store、Context、组件、控制流、数据获取、SSR 与 API 速查。"
      />

      <div class="shell">
        <div class="docs-index">
          <header class="docs-index-head">
            <span class="section-index">11 章</span>
            <h1>
              把 Solid 学成
              <br />
              一套模型。
            </h1>
            <p>
              这里不从 API 列表开始。先建立“更新发生在哪里”的心智模型，再把信号、派生值、Store
              和组件逐层接上去。每一章都有可以直接运行的示例，以及由 Solid
              本身驱动的交互演示。
            </p>
            <div class="docs-index-meta">
              <span class="mono">{String(docs.length).padStart(2, "0")} CHAPTERS</span>
              <span>4 个部分</span>
              <span>约 66 分钟</span>
              <span>基于 Solid 1.9</span>
            </div>
          </header>

          <section class="docs-index-section">
            <h2>章节</h2>
            <p>
              顺序阅读会得到一条完整的路径；也可以从任意一章进入，重要的前置概念会就近解释。
            </p>

            <For each={docGroups}>
              {(group) => (
                <div class="chapter-group">
                  <div class="chapter-group-head">
                    <span>{group.name}</span>
                    <span class="count">
                      {String(group.docs.length).padStart(2, "0")} 章
                    </span>
                  </div>
                  <For each={group.docs}>
                    {(doc) => (
                      <A href={`/docs/${doc.slug}`} class="chapter-row">
                        <span class="chapter-num">{doc.chapter}</span>
                        <span>
                          <span class="chapter-title">{doc.title}</span>
                          <span class="chapter-summary">{doc.summary}</span>
                        </span>
                        <span class="chapter-reading">
                          {doc.level} · {doc.reading}
                        </span>
                      </A>
                    )}
                  </For>
                </div>
              )}
            </For>
          </section>

          <section class="docs-index-section">
            <h2>三条阅读路径</h2>
            <p>根据你带着什么问题来，可以选择不同的入口。</p>
            <div class="reading-paths">
              <For each={readingPaths}>
                {(path) => (
                  <div class="reading-path">
                    <h3>{path.title}</h3>
                    <p>{path.desc}</p>
                    <span class="path">{path.path}</span>
                  </div>
                )}
              </For>
            </div>
          </section>

          <p class="doc-foot-note">
            内容依据 Solid 官方文档与 README 整理，示例默认使用 TypeScript。
            想核对原文时，可以随时打开
            <a href="https://docs.solidjs.com" target="_blank" rel="noreferrer">
              官方文档
            </a>
            。
          </p>
        </div>
      </div>
    </>
  );
}
