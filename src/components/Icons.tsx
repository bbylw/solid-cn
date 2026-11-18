import type { JSX } from "@solidjs/web";

/**
 * lucide-solid 的替代品：五个图标全部内联 SVG，路径数据取自 lucide。
 * 尺寸由 size 控制（默认 24），class 透传给 <svg>，默认 aria-hidden。
 */
export type IconProps = {
  size?: number;
  class?: string;
  "aria-hidden"?: "true" | "false";
};

type BaseProps = IconProps & {
  children: JSX.Element;
};

function Svg(props: BaseProps) {
  const size = () => props.size ?? 24;
  return (
    <svg
      width={size()}
      height={size()}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      class={props.class}
      aria-hidden={props["aria-hidden"] ?? "true"}
    >
      {props.children}
    </svg>
  );
}

export function Search(props: IconProps) {
  return (
    <Svg size={props.size} class={props.class} aria-hidden={props["aria-hidden"]}>
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </Svg>
  );
}

export function Menu(props: IconProps) {
  return (
    <Svg size={props.size} class={props.class} aria-hidden={props["aria-hidden"]}>
      <path d="M4 6h16" />
      <path d="M4 12h16" />
      <path d="M4 18h16" />
    </Svg>
  );
}

export function Moon(props: IconProps) {
  return (
    <Svg size={props.size} class={props.class} aria-hidden={props["aria-hidden"]}>
      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
    </Svg>
  );
}

export function Sun(props: IconProps) {
  return (
    <Svg size={props.size} class={props.class} aria-hidden={props["aria-hidden"]}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2" />
      <path d="M12 20v2" />
      <path d="m4.93 4.93 1.41 1.41" />
      <path d="m17.66 17.66 1.41 1.41" />
      <path d="M2 12h2" />
      <path d="M20 12h2" />
      <path d="m6.34 17.66-1.41 1.41" />
      <path d="m19.07 4.93-1.41 1.41" />
    </Svg>
  );
}

export function X(props: IconProps) {
  return (
    <Svg size={props.size} class={props.class} aria-hidden={props["aria-hidden"]}>
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </Svg>
  );
}
