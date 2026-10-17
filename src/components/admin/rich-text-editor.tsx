"use client";

import dynamic from "next/dynamic";

export type ArticleEditorProps = {
  value: string;
  onChange: (markdown: string) => void;
  placeholder?: string;
  editorKey: string;
};

// The editor module, including all browser-only plugins, is excluded from SSR.
const ClientEditor = dynamic(() => import("./article-editor-client"), {
  ssr: false,
  loading: () => <div className="h-[300px] rounded-xl border border-border bg-background animate-pulse" />,
});

export function RichTextEditor(props: ArticleEditorProps) {
  return <ClientEditor key={props.editorKey} {...props} />;
}
