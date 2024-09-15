import { useAtomValue } from "jotai";
import { Col, Form, Row } from "react-bootstrap";
import { modelAtom, pathAtom } from "../atoms";

export default function Metadata() {
  const path = useAtomValue(pathAtom);
  const model = useAtomValue(modelAtom);
  const node = model.get(path);
  if (!node) return null;
  return (
    <Form>
      <Row>
        <Col>
          <Form.Group as={Row} className="mb-3">
            <Form.Label column sm={2}>
              标题
            </Form.Label>
            <Col sm={10}>
              <Form.Control
                type="text"
                placeholder="中文标题"
                value={node.title}
              />
            </Col>
          </Form.Group>
        </Col>
        <Col>
          <Form.Group as={Row} className="mb-3">
            <Form.Label column sm={2}>
              路径
            </Form.Label>
            <Col sm={10}>
              <Form.Control
                type="text"
                placeholder="只能使用小写字母 (a-z) 或连字符 (-)"
                value={node.name}
              />
            </Col>
          </Form.Group>
        </Col>
      </Row>
    </Form>
  );
}
