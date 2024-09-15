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

  useEffect(() => {
    if (!editorRef.current) return;
    const welcomeText =
      "欢迎使用生如夏花内容管理系统。\n\n您可以在左侧的目录中选择一个文档进行编辑。点击「+」展开子目录，点击「-」折叠子目录。";
    const vditor = new Vditor(editorRef.current, {
      after: () => {
        vditor.setValue(welcomeText);
        setVd(vditor);
      },
      height: document.body.clientHeight - 320,
      outline: {
        enable: true,
        position: "right",
      },
      cache: {
        enable: false,
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
