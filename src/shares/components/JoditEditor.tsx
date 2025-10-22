import JoditEditor from "jodit-react";
import React, { useRef, useMemo } from "react";

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
  const editor = useRef(null);

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
        "image",
        "link",
        "|",
        "align",
      ],
      buttonsXS: ["bold", "italic", "|", "ul", "ol", "|", "image"],
      events: {},
      textIcons: false,
      enter: "P" as const,
    }),
    [],
  );

  const handleBlur = (newContent: string) => {
    if (onChange) {
      onChange(newContent);
    }
  };

  return (
    <div className={className}>
      <JoditEditor
        ref={editor}
        value={value || ""}
        config={config as any}
        onBlur={handleBlur}
        onChange={() => {}} // Để trống, dùng onBlur để tránh re-render liên tục
      />
    </div>
  );
};

export default JoditEditorComponent;
