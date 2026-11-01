// 探针脚本的共享浏览器加载器。
// 这些脚本是一次性开发工具，不在 CI 中运行；使用前需要：
//   1. playwright-core：安装到本项目（bun add -d playwright-core），
//      或设置环境变量 PLAYWRIGHT_CORE_PATH 指向已有的安装位置。
//   2. Chrome 可执行文件：设置环境变量 CHROME_EXECUTABLE，
//      例如 Windows 上通常位于
//      %LOCALAPPDATA%\ms-playwright\chromium-<rev>\chrome-win64\chrome.exe
"use strict";

function loadPlaywrightCore() {
  const candidates = ["playwright-core", process.env.PLAYWRIGHT_CORE_PATH].filter(
    Boolean
  );
  for (const candidate of candidates) {
    try {
      return require(candidate);
    } catch {
      // 尝试下一个来源
    }
  }
  throw new Error(
    "无法加载 playwright-core。请先安装（bun add -d playwright-core），" +
      "或设置环境变量 PLAYWRIGHT_CORE_PATH 指向已有的安装目录。"
  );
}

function chromeExecutable() {
  const value = process.env.CHROME_EXECUTABLE;
  if (!value) {
    throw new Error(
      "未设置 CHROME_EXECUTABLE。请把它指向 Chrome 可执行文件的完整路径。"
    );
  }
  return value;
}

module.exports = { ...loadPlaywrightCore(), chromeExecutable };
