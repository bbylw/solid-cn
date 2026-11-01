/// <reference types="vite/client" />

declare module "*?shiki" {
  const data: { html: string; code: string; lang: string };
  export default data;
}
