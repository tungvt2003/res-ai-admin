"use client";

import JoditEditor from "jodit-react";
import { IJodit } from "jodit/esm/types";
import React, { useRef, useMemo, useState } from "react";
import "../styles/jodit-custom.css";

interface JoditEditorProps {
  value?: string;
  onChange?: (newContent: string) => void;
  className?: string;
}

const JoditEditorComponent: React.FC<JoditEditorProps> = ({
  value = "",
  onChange,
  className = "",
}) => {
  const editor = useRef<IJodit | null>(null);
  const [content, setContent] = useState(value);

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
      askBeforePasteHTML: false,
      askBeforePasteFromWord: false,
      uploader: {
        insertImageAsBase64URI: true,
      },

      // ⚙️ Toolbar đầy đủ, loại bỏ h1-h2-h3 rời vì đã có paragraph dropdown
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

      // ⚙️ Responsive toolbar
      buttonsMD: [
        "source",
        "|",
        "bold",
        "italic",
        "underline",
        "|",
        "ul",
        "ol",
        "|",
        "font",
        "fontsize",
        "|",
        "paragraph",
        "|",
        "image",
        "table",
        "link",
        "|",
        "align",
        "|",
        "undo",
        "redo",
      ],
      buttonsSM: [
        "bold",
        "italic",
        "|",
        "ul",
        "ol",
        "|",
        "fontsize",
        "|",
        "paragraph",
        "|",
        "image",
        "link",
        "|",
        "align",
      ],
      buttonsXS: ["bold", "italic", "|", "ul", "ol", "|", "paragraph", "|", "image"],

      // ⚙️ Quan trọng: để Jodit giữ nguyên <h1>, <h2> mà không ép về <p>
      cleanHTML: {
        allowTags: {
          h1: true,
          h2: true,
          h3: true,
          h4: true,
          h5: true,
          h6: true,
          p: true,
          div: true,
          span: true,
          strong: true,
          em: true,
          u: true,
          s: true,
          ul: true,
          ol: true,
          li: true,
          img: true,
          a: true,
          table: true,
          tr: true,
          td: true,
          th: true,
          br: true,
        },
        removeEmptyBlocks: false,
      },

      // ⚙️ Hành vi xuống dòng chuẩn, không ép thành <br> hoặc <p>
      // Bỏ enter / enterBlock để Jodit tự quản lý block
      // enter: "BR" as const,
      // enterBlock: "P" as const,

      defaultActionOnPaste: "insert_clear_html",
      textIcons: false,
      styles: {
        body: {
          fontSize: "16px",
          fontFamily: "Arial, sans-serif",
          color: "#333",
        },
      },
      events: {
        afterInit: (j: IJodit) => {
          j.container.classList.add("jodit-theme-custom");
        },
      },
    }),
    [],
  );

  const handleBlur = (newContent: string) => {
    setContent(newContent);
    if (onChange) {
      onChange(newContent);
    }
  };

  return (
    <div className={className}>
      <JoditEditor
        ref={editor}
        value={content}
        config={config as any}
        onBlur={handleBlur}
        onChange={(newContent) => setContent(newContent)}
      />
    </div>
  );
};

export default JoditEditorComponent;
