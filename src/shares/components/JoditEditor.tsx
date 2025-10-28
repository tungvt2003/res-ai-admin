"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import JoditEditor from "jodit-react";
import type { IJodit } from "jodit/esm/types";
import "../styles/jodit-custom.css";
import { useUploadBase64Mutation } from "../../modules/upload/hooks/mutations/use-upload-base64.mutation";
import { toast } from "react-toastify";

export interface JoditEditorProps {
  value?: string;
  onChange?: (newContent: string) => void;
  className?: string;
}

/**
 * Hàm clean chỉ cho images: xóa style không cần thiết từ img tags
 */
function cleanImageStyles(html: string): string {
  const doc = new DOMParser().parseFromString(html, "text/html");

  doc.body.querySelectorAll("img").forEach((img) => {
    const style = img.getAttribute("style");
    if (style) {
      // Chỉ xóa các style không cần thiết từ img, giữ lại width, height, margin, padding
      const newStyle = style
        .replace(/font-weight\s*:\s*[^;]+;?/gi, "")
        .replace(/font-family\s*:\s*[^;]+;?/gi, "")
        .replace(/font-size\s*:\s*[^;]+;?/gi, "")
        .replace(/color\s*:\s*[^;]+;?/gi, "")
        .replace(/text-align\s*:\s*[^;]+;?/gi, "")
        .replace(/line-height\s*:\s*[^;]+;?/gi, "")
        .replace(/\s*;\s*$/, "")
        .trim();

      if (newStyle) {
        img.setAttribute("style", newStyle);
      } else {
        img.removeAttribute("style");
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
  const { mutateAsync: uploadBase64 } = useUploadBase64Mutation();

  // Upload base64 images và thay thế bằng URL
  const uploadAndReplaceBase64Images = async (htmlContent: string): Promise<string> => {
    const base64Regex = /src="data:image\/[^;]+;base64,[^"]+"/g;
    const matches = htmlContent.match(base64Regex);

    if (!matches || matches.length === 0) {
      return htmlContent;
    }

    try {
      // Extract base64 data
      const base64Images = matches
        .map((match) => {
          const srcMatch = match.match(/src="([^"]+)"/);
          return srcMatch ? srcMatch[1] : "";
        })
        .filter(Boolean);

      if (base64Images.length === 0) {
        return htmlContent;
      }

      // Upload base64 images
      const response = await uploadBase64({ images: base64Images });
      const urls = response.data.data.urls;

      // Replace base64 với URLs
      let updatedContent = htmlContent;
      base64Images.forEach((base64, index) => {
        if (urls[index]) {
          updatedContent = updatedContent.replace(base64, urls[index]);
        }
      });

      // Clean styles chỉ cho images
      updatedContent = cleanImageStyles(updatedContent);

      return updatedContent;
    } catch (error) {
      console.error("Error uploading base64 images:", error);
      toast.error("Không thể upload ảnh");
      return htmlContent;
    }
  };

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

        // Khi dán: upload base64 images và clean chỉ images
        beforePaste: async (_e: ClipboardEvent, data: { html?: string; text?: string }) => {
          if (data.html) {
            data.html = await uploadAndReplaceBase64Images(data.html);
          }
        },

        // Sau khi dán xong: upload base64 images và clean chỉ images trong editor
        afterPaste: async () => {
          const j = editor.current;
          if (!j) return;
          let cleaned = await uploadAndReplaceBase64Images(j.value);
          cleaned = cleanImageStyles(cleaned);
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

  const handleBlur = async (newContent: string) => {
    let cleaned = await uploadAndReplaceBase64Images(newContent);
    cleaned = cleanImageStyles(cleaned);
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
