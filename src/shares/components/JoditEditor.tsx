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

const JoditEditorComponent: React.FC<JoditEditorProps> = ({
  value = "",
  onChange,
  className = "",
}) => {
  const editor = useRef<IJodit | null>(null);
  const [content, setContent] = useState(value);

  // Đồng bộ khi value từ ngoài đổi (form reset / load dữ liệu)
  useEffect(() => {
    setContent(value);
  }, [value]);

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

      // Dán ảnh base64 (tùy nhu cầu có thể tắt)
      uploader: { insertImageAsBase64URI: true },

      // ⚙️ Toolbar (đã có "paragraph" nên bỏ H1/H2/H3 riêng lẻ)
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

      // ⚙️ Cực quan trọng: Cho phép đầy đủ thẻ TABLE + tránh xóa phần tử rỗng
      // (tbody/thead/tfoot/caption/col/colgroup nếu không allow dễ bị cắt)
      cleanHTML: {
        allowTags: {
          // heading
          h1: true,
          h2: true,
          h3: true,
          h4: true,
          h5: true,
          h6: true,
          // text
          p: true,
          div: true,
          span: true,
          br: true,
          strong: true,
          em: true,
          u: true,
          s: true,
          ul: true,
          ol: true,
          li: true,
          a: true,
          img: true,
          // table
          table: true,
          thead: true,
          tbody: true,
          tfoot: true,
          tr: true,
          th: true,
          td: true,
          caption: true,
          col: true,
          colgroup: true,
        },
        removeEmptyElements: false, // giữ lại td/tr rỗng ngay sau khi chèn
        removeEmptyBlocks: false,
      },

      // ⚙️ Dán: GIỮ NGUYÊN HTML (tránh clear làm mất cấu trúc table)
      defaultActionOnPaste: "insert_as_html",

      // Tùy chọn: can thiệp khi dán, có thể tinh chỉnh nếu vẫn bị strip bởi nguồn lạ
      events: {
        afterInit: (j: IJodit) => {
          j.container.classList.add("jodit-theme-custom");
        },
        // Ví dụ: đảm bảo table không bị purifier tác động quá tay
        beforePaste: (_e: ClipboardEvent, data: { html?: string; text?: string }) => {
          // Nếu nội dung có table mà clean quá tay, ta có thể “nới tay” thêm ở đây:
          // data.html = data.html; // để nguyên — placeholder này giữ chỗ cho việc tuỳ biến sau
        },
      },

      textIcons: false,
      styles: {
        body: {
          fontSize: "16px",
          fontFamily: "Arial, sans-serif",
          color: "#333",
        },
      },
    }),
    [],
  );

  const handleBlur = (newContent: string) => {
    setContent(newContent);
    onChange?.(newContent);
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
