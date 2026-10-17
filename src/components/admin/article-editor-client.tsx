"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  MDXEditor, type MDXEditorMethods,
  headingsPlugin, listsPlugin, quotePlugin, linkPlugin, linkDialogPlugin,
  imagePlugin, toolbarPlugin, UndoRedo, Separator, BoldItalicUnderlineToggles,
  BlockTypeSelect, ListsToggle, CreateLink, InsertImage,
} from "@mdxeditor/editor";
import "@mdxeditor/editor/style.css";
import type { ArticleEditorProps } from "./rich-text-editor";

const EditorStyles = () => (
  <style jsx global>{`
    .rich-text-editor-wrapper .mdxeditor {
      border: none !important;
      border-radius: 0.75rem !important;
    }
    .rich-text-editor-wrapper .mdxeditor [contenteditable] {
      min-height: 300px;
      padding: 1rem 1.25rem;
      font-family: "Yekan Bakh", system-ui, sans-serif !important;
      font-size: 0.9375rem;
      line-height: 1.8;
      outline: none;
    }
    .rich-text-editor-wrapper .mdxeditor [contenteditable] h1 {
      font-size: 1.75rem; font-weight: 800; margin: 1rem 0 0.5rem;
      color: hsl(var(--foreground));
    }
    .rich-text-editor-wrapper .mdxeditor [contenteditable] h2 {
      font-size: 1.5rem; font-weight: 800; margin: 0.875rem 0 0.5rem;
      color: hsl(var(--foreground));
    }
    .rich-text-editor-wrapper .mdxeditor [contenteditable] h3 {
      font-size: 1.25rem; font-weight: 700; margin: 0.75rem 0 0.5rem;
      color: hsl(var(--foreground));
    }
    .rich-text-editor-wrapper .mdxeditor [contenteditable] h4 {
      font-size: 1.125rem; font-weight: 700; margin: 0.625rem 0 0.5rem;
      color: hsl(var(--foreground));
    }
    .rich-text-editor-wrapper .mdxeditor [contenteditable] ul,
    .rich-text-editor-wrapper .mdxeditor [contenteditable] ol {
      padding-right: 1.5rem; margin: 0.5rem 0;
    }
    .rich-text-editor-wrapper .mdxeditor [contenteditable] ul { list-style: disc; }
    .rich-text-editor-wrapper .mdxeditor [contenteditable] ol { list-style: decimal; }
    .rich-text-editor-wrapper .mdxeditor [contenteditable] blockquote {
      border-right: 3px solid hsl(var(--primary));
      padding-right: 1rem; margin: 0.75rem 0;
      color: hsl(var(--muted-foreground)); font-style: italic;
    }
    .rich-text-editor-wrapper .mdxeditor [contenteditable] img {
      max-width: 100%; border-radius: 0.5rem; margin: 0.75rem 0;
    }
    .rich-text-editor-wrapper .mdxeditor [contenteditable] a {
      color: hsl(var(--primary)); text-decoration: underline;
    }
    .rich-text-editor-wrapper [role="toolbar"] {
      display: flex !important; flex-wrap: wrap; gap: 4px;
      padding: 8px 12px; background: hsl(var(--muted) / 0.4);
      border-bottom: 1px solid hsl(var(--border)); direction: ltr;
    }
    .rich-text-editor-wrapper [role="toolbar"] button {
      font-family: "Yekan Bakh", system-ui, sans-serif !important;
      border-radius: 6px; padding: 4px 8px; font-size: 0.8125rem;
      transition: all 0.15s;
    }
    .rich-text-editor-wrapper [role="toolbar"] button:hover {
      background: hsl(var(--primary) / 0.1);
    }
  `}</style>
);


export default function ArticleEditorClient({ value, onChange, placeholder }: ArticleEditorProps) {
  const editorRef = useRef<MDXEditorMethods>(null);
  const lastEmitted = useRef(value);
  const [initialMarkdown] = useState(value || "");

  const imageUploadHandler = useCallback(async (file: File): Promise<string> => {
    const body = new FormData();
    body.append("file", file);
    const response = await fetch("/api/admin/upload", { method: "POST", body });
    const result = await response.json();
    if (!response.ok || !result.ok || !result.data?.url) {
      throw new Error(result.error || "خطا در بارگذاری تصویر");
    }
    return result.data.url;
  }, []);

  const plugins = useMemo(() => [
    toolbarPlugin({ toolbarContents: () => <>
      <UndoRedo /><Separator /><BoldItalicUnderlineToggles /><Separator />
      <BlockTypeSelect /><Separator /><ListsToggle /><Separator />
      <CreateLink /><InsertImage />
    </> }),
    headingsPlugin(), listsPlugin(), quotePlugin(), linkPlugin(),
    linkDialogPlugin(), imagePlugin({ imageUploadHandler }),
  ], [imageUploadHandler]);

  useEffect(() => {
    if (value === lastEmitted.current || !editorRef.current) return;
    editorRef.current.setMarkdown(value || "");
    lastEmitted.current = value;
  }, [value]);

  const handleChange = useCallback((markdown: string) => {
    lastEmitted.current = markdown;
    onChange(markdown);
  }, [onChange]);

  return <div className="rich-text-editor-wrapper">
    <MDXEditor ref={editorRef} markdown={initialMarkdown}
      onChange={handleChange} plugins={plugins}
      placeholder={placeholder || "متن مقاله را بنویسید..."}
      contentEditableClassName="prose-editor"
      className="border border-border rounded-xl overflow-hidden bg-background" />
    <EditorStyles />
  </div>;
}
