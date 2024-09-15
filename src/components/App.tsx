import { StrictMode, useEffect } from "react";
import { Button, Container, Navbar, Offcanvas } from "react-bootstrap";
import { api, modelAtom, sidebarAtom } from "../atoms";
import Editor from "./Editor";
import { useAtom, useSetAtom } from "jotai";
import Sidebar from "./Sidebar";
import styled, { createGlobalStyle } from "styled-components";
import Metadata from "./Metadata";

const GlobalStyle = createGlobalStyle`
  html, body {
    height: 100%;
  }

  #root {
    height: 100%;
    display: flex;
    flex-direction: column;
  }

  header {
    position: sticky;
    top: 0;
    background-color: white;
  }
`;

const Wrapper = styled.div`
  flex: 1 0 200px;

  display: flex;
  position: relative;
  overflow: hidden;
`;

const Header = styled.header`
  background-color: #f0f0f0;
`;

const Footer = styled.footer`
  height: 64px;
  display: grid;
  place-items: center;
  background-color: #f0f0f0;

  & p {
    margin: 0;
  }
`;

const Aside = styled(Offcanvas)`
  width: 320px;
  padding: 1rem;
  overflow-y: scroll;
  overflow-x: hidden;
  border-right: 1px solid #e0e0e0;
`;

const Main = styled(Container)`
  padding: 1rem;
  overflow: scroll;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

export default function App() {
  const setModel = useSetAtom(modelAtom);
  const [show, setShow] = useAtom(sidebarAtom);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  useEffect(() => {
    api.initialize().then((model) => {
      setModel(model);
    });
  }, [setModel]);

  return (
    <StrictMode>
      <GlobalStyle />
      <Header>
        <Navbar>
          <Container fluid>
            <Navbar.Brand>生如夏花内容管理系统</Navbar.Brand>
            <Button className="d-lg-none" onClick={handleShow}>
              目录
            </Button>
          </Container>
        </Navbar>
      </Header>
      <Wrapper>
        <Aside show={show} onHide={handleClose} responsive="lg">
          <Offcanvas.Header closeButton>
            <Offcanvas.Title>目录</Offcanvas.Title>
          </Offcanvas.Header>
          <Offcanvas.Body>
            <Sidebar />
          </Offcanvas.Body>
        </Aside>
        <Main>
          <Metadata />
          <Editor />
        </Main>
      </Wrapper>
      <Footer>
        <p>© 2019 ~ {new Date().getFullYear()} 生如夏花创作者</p>
      </Footer>
    </StrictMode>
  );
}
