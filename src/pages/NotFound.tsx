import { A } from "@solidjs/router";
import { Title } from "@solidjs/meta";

export default function NotFound() {
  return (
    <>
      <Title>页面不存在 · Solid 中文</Title>
      <section class="not-found">
        <div class="shell">
          <p class="section-index">404 / 没有这个节点</p>
          <h1>
            这页信号<span class="nowrap">没有订阅者。</span>
          </h1>
          <p>
            地址可能写错了，或者这一章已经调整。回到文档总览，从现有章节继续读。
          </p>
          <div class="not-found-actions">
            <A href="/docs" class="btn btn-primary">
              打开文档总览
            </A>
            <A href="/" class="btn btn-ghost">
              返回首页
            </A>
          </div>
        </div>
      </section>
    </>
  );
}
