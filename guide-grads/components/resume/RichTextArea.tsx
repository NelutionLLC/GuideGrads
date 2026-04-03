"use client";

import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useCallback, useEffect } from "react";

type Props = {
  label?: string;
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
};

function ToolbarBtn({
  active,
  onClick,
  title,
  children,
}: {
  active?: boolean;
  onClick: () => void;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      onMouseDown={(e) => {
        e.preventDefault();
        onClick();
      }}
      className={[
        "flex h-8 w-8 items-center justify-center rounded-lg text-sm font-medium transition-colors",
        active
          ? "bg-indigo-500 text-white"
          : "text-white/60 hover:bg-white/10 hover:text-white",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <div className="mx-1 h-5 w-px bg-white/20" />;
}

export default function RichTextArea({ label, value, onChange, placeholder }: Props) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ heading: false, code: false, codeBlock: false }),
      Underline,
      Link.configure({ openOnClick: false }),
      TextAlign.configure({ types: ["paragraph"] }),
    ],
    content: value || "",
    onUpdate({ editor }) {
      const html = editor.getHTML();
      onChange(html === "<p></p>" ? "" : html);
    },
    editorProps: {
      attributes: {
        class: "rta-editor min-h-[100px] px-3 py-2 text-sm text-white outline-none",
      },
    },
  });

  useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    const incoming = value || "";
    if (current !== incoming && incoming !== "<p></p>") {
      editor.commands.setContent(incoming, {
  parseOptions: { preserveWhitespace: true },
});
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const setLink = useCallback(() => {
    if (!editor) return;
    const prev = editor.getAttributes("link").href ?? "";
    const url = window.prompt("URL", prev);
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().unsetLink().run();
    } else {
      editor.chain().focus().setLink({ href: url }).run();
    }
  }, [editor]);

  if (!editor) return null;

  return (
    <div>
      <style>{`
        .rta-editor ul { list-style: none; padding-left: 0.6em; margin: 0; }
        .rta-editor ol { list-style: none; padding-left: 0.6em; margin: 0; }
        .rta-editor li { padding-left: 0.9em; text-indent: -0.9em; margin: 2px 0; }
        .rta-editor li::before { content: "• "; }
        .rta-editor li p { display: inline; margin: 0; }
        .rta-editor a { text-decoration: underline; opacity: 0.8; }
        .rta-editor p { margin: 0; }
      `}</style>

      {label && <div className="mb-1 text-xs text-white/70">{label}</div>}

      <div className="overflow-hidden rounded-xl bg-white/10">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-0.5 border-b border-white/10 px-2 py-1.5">
          <ToolbarBtn active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()} title="Bold">
            <span className="font-bold">B</span>
          </ToolbarBtn>
          <ToolbarBtn active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()} title="Italic">
            <span className="italic">I</span>
          </ToolbarBtn>
          <ToolbarBtn active={editor.isActive("underline")} onClick={() => editor.chain().focus().toggleUnderline().run()} title="Underline">
            <span className="underline">U</span>
          </ToolbarBtn>

          <Divider />

          <ToolbarBtn active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()} title="Bullet list">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="9" y1="6" x2="20" y2="6" />
              <line x1="9" y1="12" x2="20" y2="12" />
              <line x1="9" y1="18" x2="20" y2="18" />
              <circle cx="4" cy="6" r="1.5" fill="currentColor" stroke="none" />
              <circle cx="4" cy="12" r="1.5" fill="currentColor" stroke="none" />
              <circle cx="4" cy="18" r="1.5" fill="currentColor" stroke="none" />
            </svg>
          </ToolbarBtn>
          <ToolbarBtn active={editor.isActive("link")} onClick={setLink} title="Link">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
            </svg>
          </ToolbarBtn>

          <Divider />

          <ToolbarBtn active={editor.isActive({ textAlign: "left" })} onClick={() => editor.chain().focus().setTextAlign("left").run()} title="Align left">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="15" y2="12" /><line x1="3" y1="18" x2="18" y2="18" />
            </svg>
          </ToolbarBtn>
          <ToolbarBtn active={editor.isActive({ textAlign: "center" })} onClick={() => editor.chain().focus().setTextAlign("center").run()} title="Align center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="3" y1="6" x2="21" y2="6" /><line x1="6" y1="12" x2="18" y2="12" /><line x1="4" y1="18" x2="20" y2="18" />
            </svg>
          </ToolbarBtn>
          <ToolbarBtn active={editor.isActive({ textAlign: "right" })} onClick={() => editor.chain().focus().setTextAlign("right").run()} title="Align right">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="3" y1="6" x2="21" y2="6" /><line x1="9" y1="12" x2="21" y2="12" /><line x1="6" y1="18" x2="21" y2="18" />
            </svg>
          </ToolbarBtn>
          <ToolbarBtn active={editor.isActive({ textAlign: "justify" })} onClick={() => editor.chain().focus().setTextAlign("justify").run()} title="Justify">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </ToolbarBtn>
        </div>

        {/* Editor area */}
        <div className="relative">
          {!value && (
            <div className="pointer-events-none absolute left-3 top-2 text-sm text-white/30 select-none">
              {placeholder}
            </div>
          )}
          <EditorContent editor={editor} />
        </div>
      </div>
    </div>
  );
}
