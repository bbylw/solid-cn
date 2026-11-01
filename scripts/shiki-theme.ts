import type { ThemeRegistrationRaw } from "@shikijs/types";

export const COMMENT_COLOR = "#647d8d";

export const solidInk: ThemeRegistrationRaw = {
  name: "solid-ink",
  type: "dark",
  colors: {
    "editor.background": "#0d1923",
    "editor.foreground": "#dbe4ea",
    "editorLineNumber.foreground": "#3f5563",
    "editorLineNumber.activeForeground": "#7fb7e8",
    "editor.selectionBackground": "#21455f",
    "editorCursor.foreground": "#7fb7e8",
  },
  settings: [
    {
      scope: ["comment", "punctuation.definition.comment"],
      settings: { foreground: COMMENT_COLOR, fontStyle: "italic" },
    },
    {
      scope: ["string", "string.quoted", "string.template", "punctuation.definition.string"],
      settings: { foreground: "#d9b179" },
    },
    {
      scope: ["constant.numeric", "constant.language", "constant.character", "support.constant"],
      settings: { foreground: "#e0b987" },
    },
    {
      scope: [
        "keyword",
        "keyword.control",
        "keyword.operator.new",
        "storage.type",
        "storage.modifier",
        "keyword.operator.expression",
      ],
      settings: { foreground: "#8fc7f4" },
    },
    {
      scope: ["entity.name.function", "support.function", "meta.function-call", "variable.function"],
      settings: { foreground: "#c6dff2" },
    },
    {
      scope: ["entity.name.type", "support.type", "support.class", "entity.name.class"],
      settings: { foreground: "#a9cbe8" },
    },
    {
      scope: ["entity.name.tag", "punctuation.definition.tag"],
      settings: { foreground: "#8fc7f4" },
    },
    {
      scope: ["entity.other.attribute-name", "support.type.property-name"],
      settings: { foreground: "#d9b179" },
    },
    {
      scope: ["variable", "meta.object-literal.key", "variable.other.property"],
      settings: { foreground: "#dbe4ea" },
    },
    {
      scope: ["variable.parameter"],
      settings: { foreground: "#e3d3b8" },
    },
    {
      scope: ["punctuation", "meta.brace", "keyword.operator"],
      settings: { foreground: "#8ea3b3" },
    },
    {
      scope: ["markup.heading", "markup.bold"],
      settings: { foreground: "#f0eadc", fontStyle: "bold" },
    },
    {
      scope: ["markup.italic"],
      settings: { foreground: "#e3d3b8", fontStyle: "italic" },
    },
    {
      scope: ["invalid", "invalid.illegal"],
      settings: { foreground: "#ff8a75" },
    },
  ],
};
