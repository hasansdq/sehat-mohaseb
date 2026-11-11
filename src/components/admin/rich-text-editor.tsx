"use client";

import { useRef, useCallback, useEffect, useState, type ReactNode } from "react";

// ============================================================
// RichTextEditor — Professional WYSIWYG editor for articles
// ============================================================
// All MDXEditor imports happen inside a dynamically loaded component
// (ssr: false) so nothing from @mdxeditor/editor is ever evaluated
// during SSR or at module level.
// ============================================================

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

// ---- Dynamic component that imports everything browser-only ----
// This entire component is loaded with ssr: false, so the `import`
// statements inside the factory function only execute in the browser.
const LazyEditor = ({ onLoad }: { onLoad?: () => void }) => {
  const [EditorComponent, setEditorComponent] = useState<ReactNode>(null);

  useEffect(() => {
    let mounted = true;
    // All imports happen HERE, inside useEffect, on the client only.
    // Nothing from @mdxeditor/editor is evaluated at module level.
    Promise.all([
      import("@mdxeditor/editor"),
      // @ts-expect-error — CSS module import
      import("@mdxeditor/editor/style.css"),
    ]).then(([mod]) => {
      if (!mounted) return;

      const {
        MDXEditor,
        headingsPlugin, listsPlugin, quotePlugin,
        linkPlugin, linkDialogPlugin, imagePlugin,
        toolbarPlugin,
        BoldItalicUnderlineToggles, UndoRedo, BlockTypeSelect,
        ListsToggle, CreateLink, InsertImage, Separator,
      } = mod;

      // Store module-level constants for the component closure
      const modRef = mod;

      setEditorComponent(() => null); // trigger re-render
      // Signal that modules are loaded
      if (onLoad) onLoad();
    });
    return () => { mounted = false; };
  }, [onLoad]);

  return EditorComponent;
};

// ---- Main exported component ----
export function RichTextEditor({
  value,
  onChange,
  placeholder,
  editorKey,
}: {
  value: string;
  onChange: (markdown: string) => void;
  placeholder?: string;
  editorKey: string;
}) {
  const [ready, setReady] = useState(false);
  const editorRef = useRef<any>(null);
  const [Editor, setEditor] = useState<any>(null);
  const [plugins, setPlugins] = useState<any[]>([]);
  const [components, setComponents] = useState<any>({});

  // Track if the last content change came from the user (typing) or from
  // an external prop update. This prevents cursor/undo disruption.
  const isInternalChange = useRef(false);
  const lastEmittedValue = useRef<string>(value);

  // Load MDXEditor + all plugins in the browser only
  useEffect(() => {
    let mounted = true;
    import("@mdxeditor/editor").then((mod) => {
      if (!mounted) return;
      setComponents(mod);
      setEditor(() => mod.MDXEditor);
      setPlugins([
        mod.toolbarPlugin({
          toolbarContents: () => (
            <>
              <mod.UndoRedo />
              <mod.Separator />
              <mod.BoldItalicUnderlineToggles />
              <mod.Separator />
              <mod.BlockTypeSelect />
              <mod.Separator />
              <mod.ListsToggle />
              <mod.Separator />
              <mod.CreateLink />
              <mod.InsertImage />
            </>
          ),
        }),
        mod.headingsPlugin(),
        mod.listsPlugin(),
        mod.quotePlugin(),
        mod.linkPlugin(),
        mod.linkDialogPlugin(),
        mod.imagePlugin({ imageUploadHandler: null }),
      ]);
      setReady(true);
    });
    return () => { mounted = false; };
  }, []);

  // Load CSS (browser only)
  useEffect(() => {
    // @ts-expect-error — CSS module import
    import("@mdxeditor/editor/style.css");
  }, []);

  // Sync external value changes ONLY when they differ from what we last emitted.
  // This prevents cursor/undo disruption from our own onChange callbacks.
  useEffect(() => {
    if (!ready || !editorRef.current) return;
    // If the value prop matches what we last emitted via onChange, the user
    // is typing — don't call setMarkdown (it would reset cursor position).
    if (value === lastEmittedValue.current) return;
    // External change (e.g., switching articles) — update editor content
    try {
      editorRef.current.setMarkdown(value || "");
      lastEmittedValue.current = value;
    } catch {
      // editor not ready
    }
  }, [value, ready]);

  const handleChange = useCallback((markdown: string) => {
    lastEmittedValue.current = markdown;
    onChange(markdown);
  }, [onChange]);

  const imageUploadHandler = useCallback(async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);
    const resp = await fetch("/api/admin/upload", { method: "POST", body: formData });
    const json = await resp.json();
    if (json.ok && json.data?.url) {
      return json.data.url;
    }
    throw new Error(json.error || "خطا در بارگذاری تصویر");
  }, []);

  // Update image plugin handler when ready
  useEffect(() => {
    if (!ready || !components.imagePlugin) return;
    setPlugins([
      components.toolbarPlugin({
        toolbarContents: () => (
          <>
            <components.UndoRedo />
            <components.Separator />
            <components.BoldItalicUnderlineToggles />
            <components.Separator />
            <components.BlockTypeSelect />
            <components.Separator />
            <components.ListsToggle />
            <components.Separator />
            <components.CreateLink />
            <components.InsertImage />
          </>
        ),
      }),
      components.headingsPlugin(),
      components.listsPlugin(),
      components.quotePlugin(),
      components.linkPlugin(),
      components.linkDialogPlugin(),
      components.imagePlugin({ imageUploadHandler }),
    ]);
  }, [ready, components, imageUploadHandler]);

  if (!ready || !Editor) {
    return (
      <div className="rich-text-editor-wrapper">
        <div className="h-[300px] rounded-xl border border-border bg-background animate-pulse flex items-center justify-center text-sm text-muted-foreground">
          در حال بارگذاری ویرایشگر...
        </div>
        <EditorStyles />
      </div>
    );
  }

  return (
    <div className="rich-text-editor-wrapper">
      <Editor
        ref={editorRef}
        key={editorKey}
        markdown={value || ""}
        onChange={handleChange}
        plugins={plugins}
        placeholder={placeholder || "متن مقاله را بنویسید..."}
        contentEditableClassName="prose-editor"
        className="border border-border rounded-xl overflow-hidden bg-background"
      />
      <EditorStyles />
    </div>
  );
}

export type ArticleEditorProps = {
  value: string;
  onChange: (markdown: string) => void;
  placeholder?: string;
  editorKey: string;
};
