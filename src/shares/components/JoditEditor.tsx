"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import JoditEditor from "jodit-react";
import type { IJodit } from "jodit/esm/types";
import "../styles/jodit-custom.css";

export interface JoditEditorProps {
  value?: string;
  onChange?: (newContent: string) => void;
  className?: string;
}

/**
 * Hàm làm sạch: chỉ xóa font-weight khỏi inline style
 */
function removeFontWeightOnly(html: string) {
  const doc = new DOMParser().parseFromString(html, "text/html");

  doc.body.querySelectorAll("*").forEach((el) => {
    const style = el.getAttribute("style");
    if (style) {
      // Regex xóa tất cả font-weight: bold/normal/number/none... (và khoảng trắng dư)
      const newStyle = style
        .replace(/font-weight\s*:\s*[^;]+;?/gi, "")
        .replace(/\s*;\s*$/, "")
        .trim();
      if (newStyle) {
        el.setAttribute("style", newStyle);
      } else {
        el.removeAttribute("style");
      }
    }
  });

  return doc.body.innerHTML;
}

const JoditEditorComponent: React.FC<JoditEditorProps> = ({
  value = "",
  onChange,
  className = "",
}) => {
  const editor = useRef<IJodit | null>(null);
  const [content, setContent] = useState(value);

  useEffect(() => setContent(value), [value]);

  const config = useMemo(
    () => ({
      readonly: false,
      placeholder: "Nhập nội dung bài viết...",
      height: 500,
      language: "vi",
      toolbar: true,
      spellcheck: true,
      toolbarSticky: false,
      showCharsCounter: true,
      showWordsCounter: true,
      showXPathInStatusbar: false,

      // Dán giữ nguyên HTML, không xóa các style khác
      askBeforePasteHTML: false,
      askBeforePasteFromWord: false,
      defaultActionOnPaste: "insert_as_html" as const,

      uploader: { insertImageAsBase64URI: true },

      cleanHTML: {
        // Giữ nguyên mọi thẻ
        removeEmptyElements: false,
        removeEmptyBlocks: false,
      },

      events: {
        afterInit: (j: IJodit) => {
          editor.current = j;
          j.container.classList.add("jodit-theme-custom");
        },

        // Khi dán: chỉ xóa font-weight khỏi style
        beforePaste: (_e: ClipboardEvent, data: { html?: string; text?: string }) => {
          if (data.html) {
            data.html = removeFontWeightOnly(data.html);
          }
        },

        // Sau khi dán xong: vệ sinh lại toàn bộ nội dung trong editor
        afterPaste: () => {
          const j = editor.current;
          if (!j) return;
          const cleaned = removeFontWeightOnly(j.value);
          if (cleaned !== j.value) j.value = cleaned;
        },
      },

      textIcons: false,

      buttons: [
        "source",
        "|",
        "bold",
        "italic",
        "underline",
        "strikethrough",
        "|",
        "ul",
        "ol",
        "|",
        "outdent",
        "indent",
        "|",
        "font",
        "fontsize",
        "brush",
        "paragraph",
        "|",
        "image",
        "video",
        "table",
        "link",
        "|",
        "align",
        "undo",
        "redo",
        "|",
        "hr",
        "eraser",
        "copyformat",
        "|",
        "symbol",
        "fullsize",
        "preview",
      ],
    }),
    [],
  );

  const handleBlur = (newContent: string) => {
    const cleaned = removeFontWeightOnly(newContent);
    setContent(cleaned);
    onChange?.(cleaned);
  };

  return (
    <div className={className}>
      <JoditEditor
        ref={editor}
        value={content}
        config={config as any}
        onBlur={handleBlur}
        onChange={(val) => setContent(val)}
      />
    </div>
  );
};

export default JoditEditorComponent;
