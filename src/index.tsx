import { render } from "solid-js/web";
import "@fontsource/ibm-plex-mono/400.css";
import "@fontsource/ibm-plex-mono/500.css";
import "@fontsource/ibm-plex-mono/600.css";
import "./styles/tokens.css";
import "./styles/base.css";
import "./styles/site.css";
import "./styles/pages.css";
import App from "./App";

const root = document.getElementById("root");
if (!root) throw new Error("找不到 #root 挂载点");

render(() => <App />, root);
