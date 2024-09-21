import { useAtomValue } from "jotai";
import { Col, Form, InputGroup, Row } from "react-bootstrap";
import { modelAtom, pathAtom } from "../atoms";

export default function Metadata() {
  const path = useAtomValue(pathAtom);
  const model = useAtomValue(modelAtom);
  const node = model.get(path);
  if (!node) return null;

  const hint = [""].concat(path.slice(0, path.length - 1)).join("/") + "/";
  return (
    <Form as={Row} style={{ rowGap: "1rem" }}>
      <Col xs={12} md={6}>
        <Form.Group as={Row}>
          <Form.Label column xs={3} md={2}>
            标题
          </Form.Label>
          <Col xs={9}>
            <Form.Control
              type="text"
              placeholder="中文标题"
              value={node.title}
            />
          </Col>
        </Form.Group>
      </Col>
      <Col xs={12} md={6}>
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
                value={node.name}
                readOnly
              />
            </InputGroup>
          </Col>
        </Form.Group>
      </Col>
    </Form>
  );
}
