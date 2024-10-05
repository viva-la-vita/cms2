import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import { useState } from "react";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  return (
    <div style={{ display: "grid", height: "100%", placeItems: "center" }}>
      <Form
        style={{ width: 320 }}
        onSubmit={(e) => {
          e.preventDefault();
          localStorage.setItem("user", username);
          localStorage.setItem("token", password);
          window.location.reload();
        }}
      >
        <h2>生如夏花账号登录</h2>
        <Form.Group className="mb-3" controlId="formBasicEmail">
          <Form.Label>用户名</Form.Label>
          <Form.Control
            type="username"
            placeholder=""
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </Form.Group>
        <Form.Group className="mb-3" controlId="formBasicPassword">
          <Form.Label>密码</Form.Label>
          <Form.Control
            type="password"
            placeholder=""
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Form.Group>
        <Button type="submit">登录</Button>
      </Form>
    </div>
  );
}
