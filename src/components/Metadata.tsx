import { useAtom, useAtomValue } from "jotai";
import { Button, Col, Form, InputGroup, Row, Spinner } from "react-bootstrap";
import { apiAtom, branchAtom, draftAtom, modelAtom, pathAtom } from "../atoms";
import hashfunc from "object-hash";
import { useState } from "react";

export default function Metadata() {
  const api = useAtomValue(apiAtom)!;
  const path = useAtomValue(pathAtom);
  const model = useAtomValue(modelAtom);
  const [draft, setDraft] = useAtom(draftAtom);
  const branch = useAtomValue(branchAtom);

  const [loading, setLoading] = useState(false);
  if (!draft) return null;
  const { hash, ...rest } = draft;
  const match = hashfunc(rest) === hash;

  const hint = [""].concat(path.slice(0, path.length - 1)).join("/") + "/";
  return (
    <Form as={Row} style={{ rowGap: "1rem" }}>
      <Col
        xs={12}
        lg={2}
        style={{ display: "flex", justifyContent: "center", gap: "1rem" }}
      >
        <Button
          disabled={match}
          onClick={() => {
            const node = model.get(path)!;
            const draftContent = {
              name: node.name,
              title: node.title,
              content: node.content,
            };
            setDraft({ ...draft, ...draftContent });
          }}
        >
          重置
        </Button>
        <Button
          disabled={match}
          onClick={() => {
            const node = model.get(path)!;
            setLoading(true);
            api
              .updateFileWithPath(branch, node.original_path, draft)
              .then(() => setLoading(false));
          }}
        >
          {loading ? <Spinner size="sm"/> : "保存"}
        </Button>
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
