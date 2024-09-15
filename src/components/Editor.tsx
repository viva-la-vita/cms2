import Vditor from "vditor";
import "vditor/dist/index.css";

import { useEffect, useRef, useState } from "react";
import { useAtomValue } from "jotai";
import { modelAtom, pathAtom } from "../atoms";

export default function Editor() {
  const [vd, setVd] = useState<Vditor>();
  const path = useAtomValue(pathAtom);
  const model = useAtomValue(modelAtom);
  const editorRef = useRef<HTMLDivElement>(null);

  const deduction = 240;

  useEffect(() => {
    window.addEventListener("resize", () => {
      editorRef.current?.style.setProperty(
        "height",
        `${document.body.clientHeight - deduction}px`
      );
      for (const elem of document.getElementsByClassName("vditor-outline")) {
        elem.setAttribute(
          "style",
          `display: ${document.body.clientWidth > 992 ? "block" : "none"}`
        );
      }
    });
    const useOutline = document.body.clientWidth > 992;
    if (!editorRef.current) return;
    const welcomeText =
      "欢迎使用生如夏花内容管理系统。\n\n您可以在目录中选择一个文档进行编辑。点击「+」展开子目录，点击「-」折叠子目录。";
    const vditor = new Vditor(editorRef.current, {
      after: () => {
        vditor.setValue(welcomeText);
        setVd(vditor);
      },
      toolbar: [
        "headings",
        "bold",
        "italic",
        "strike",
        "inline-code",
        "line",
        "quote",
        "list",
        "ordered-list",
        "check",
        "outdent",
        "indent",
        "link",
        "upload",
        "table",
        "code",
        "outline",
        "fullscreen",
      ],
      height: document.body.clientHeight - deduction,
      outline: {
        enable: useOutline,
        position: "right",
      },
      cache: {
        enable: false,
      },
      upload: {
        url: "https://upload.viva-la-vita.org",
      },
      mode: "wysiwyg",
      counter: {
        enable: true,
        type: "text",
      },
    });
    return () => {
      vd?.destroy();
      setVd(undefined);
    };
  }, []);

  useEffect(() => {
    if (!vd) {
      return;
    }
    const node = model.get(path);
    if (!node) {
      return;
    }
    vd.setValue(node.content);
  });

  return <div ref={editorRef} />;
}
