import { StrictMode, useEffect } from "react";
import { Container, Navbar } from "react-bootstrap";
import { api, modelAtom } from "../atoms";
import Editor from "./Editor";
import { useSetAtom } from "jotai";
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
  width: 1440px;
  margin: 0 auto;

  display: flex;
  position: relative;
  overflow: hidden;
  padding: 2rem;
  gap: 4rem;
`;

const Footer = styled.footer`
  height: 64px;
  width: 100%;
  text-align: center;
  padding: 10px;
  background-color: #f8f9fa;
`;

const Main = styled.main`
  flex: 1 0 800px;
  overflow: scroll;
  padding: 0.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

export default function App() {
  const setModel = useSetAtom(modelAtom);

  useEffect(() => {
    api.initialize().then((model) => {
      setModel(model);
    });
  }, [setModel]);

  return (
    <StrictMode>
      <GlobalStyle />
      <header>
        <Navbar>
          <Container fluid>
            <Navbar.Brand>生如夏花内容管理系统</Navbar.Brand>
          </Container>
        </Navbar>
      </header>
      <Wrapper>
        <Sidebar />
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
