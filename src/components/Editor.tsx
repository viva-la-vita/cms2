import Vditor from "vditor";
import "vditor/dist/index.css";

import { useEffect, useRef, useState } from "react";
import { useAtom, useAtomValue } from "jotai";
import { branchAtom, draftAtom, mainBranch } from "../atoms";

export default function Editor() {
  const [vd, setVd] = useState<Vditor>();
  const branch = useAtomValue(branchAtom);
  const [draft, setDraft] = useAtom(draftAtom);
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
  }, []);

  useEffect(() => {
    const useOutline = document.body.clientWidth > 992;
    const vditor = new Vditor("vditor", {
      after: () => {
        vditor.setValue(
          "欢迎使用生如夏花内容管理系统。\n\n您可以在目录中选择一个文档进行编辑。点击 ` + ` 展开子目录，点击 ` \u2212 ` 折叠子目录。"
        );
      },
      input: (content) => {
        setDraft((draft) => ({ ...draft, content }));
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
    setVd(vditor);
    return () => {
      vditor.destroy();
      setVd(undefined);
    };
  }, [setDraft]);

  useEffect(() => {
    try {
      if (branch === mainBranch) {
        vd?.disabled();
      } else {
        vd?.enable();
      }
    } catch (error) {
      console.log(error);
    }
  }, [vd, branch]);

  useEffect(() => {
    try {
      if (vd && draft.content !== vd.getValue()) vd.setValue(draft.content);
    } catch (error) {
      console.log(error);
    }
  }, [vd, draft]);

  return <div ref={editorRef} id="vditor" className="vditor" />;
}
