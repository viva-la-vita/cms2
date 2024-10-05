import { useAtom, useAtomValue } from "jotai";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";
import Row from "react-bootstrap/Row";
import Spinner from "react-bootstrap/Spinner";
import { apiAtom, draftAtom, modelAtom, pathAtom } from "../atoms";
import hashfunc from "object-hash";
import { useState } from "react";

function Actions() {
  const api = useAtomValue(apiAtom)!;
  const [path, setPath] = useAtom(pathAtom);
  const [model, setModel] = useAtom(modelAtom);
  const [draft, setDraft] = useAtom(draftAtom);
  const [loading, setLoading] = useState(false);
  if (!draft) return null;
  const { hash, ...rest } = draft;
  const match = hashfunc(rest) === hash;
  const node = model.get(path)!;
  return (
    <>
      <Button
        disabled={match}
        onClick={() => {
          setDraft((draft) => ({
            ...draft,
            name: node.name,
            title: node.title,
            content: node.content,
          }));
        }}
      >
        重置
      </Button>
      <Button
        disabled={match}
        onClick={async () => {
          setLoading(true);
          const new_path = await api.updateFileWithPath(path, draft);
          setLoading(false);
          // 远程更新成功之后，更新本地状态
          // 如果路径发生变化，更新路径
          if (new_path.some((x, i) => x !== path[i])) {
            setPath(new_path);
          }
          // 更新节点数据
          setModel((model) => {
            model.set(path, { ...node, ...rest });
          });
          // 更新草稿
          setDraft({ ...draft, hash: hashfunc(rest) });
        }}
      >
        {loading ? <Spinner size="sm" /> : "保存"}
      </Button>
    </>
  );
}

export default function Metadata() {
  const path = useAtomValue(pathAtom);
  const [draft, setDraft] = useAtom(draftAtom);
  if (path.length === 0) return null;

  const hint = [""].concat(path.slice(0, path.length - 1)).join("/") + "/";
  return (
    <Form as={Row} style={{ rowGap: "1rem" }}>
      <Col
        xs={12}
        lg={2}
        style={{ display: "flex", justifyContent: "center", gap: "1rem" }}
      >
        <Actions />
      </Col>
      <Col xs={12} md={6} lg={5}>
        <Form.Group as={Row}>
          <Form.Label column xs={3} md={2}>
            标题
          </Form.Label>
          <Col xs={9}>
            <Form.Control
              type="text"
              placeholder="中文标题"
              value={draft.title}
              onChange={(e) => setDraft({ ...draft, title: e.target.value })}
            />
          </Col>
        </Form.Group>
      </Col>
      <Col xs={12} md={6} lg={5}>
        <Form.Group as={Row}>
          <Form.Label column xs={3} md={2}>
            路径
          </Form.Label>
          <Col xs={9}>
            <InputGroup>
              <InputGroup.Text>{hint}</InputGroup.Text>
              <Form.Control
                type="text"
                placeholder="只能使用小写字母 (a-z) 或连字符 (-)"
                disabled
                value={draft.name}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
              />
            </InputGroup>
          </Col>
        </Form.Group>
      </Col>
    </Form>
  );
}
