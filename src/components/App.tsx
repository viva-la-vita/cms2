import { useEffect, useState } from "react";
import Button from "react-bootstrap/Button";
import Container from "react-bootstrap/Container";
import Dropdown from "react-bootstrap/Dropdown";
import DropdownButton from "react-bootstrap/DropdownButton";
import Navbar from "react-bootstrap/Navbar";
import Offcanvas from "react-bootstrap/Offcanvas";
import Spinner from "react-bootstrap/Spinner";
import {
  apiAtom,
  branchAtom,
  mainBranch,
  modelAtom,
  sidebarAtom,
} from "../atoms";
import Editor from "./Editor";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import Sidebar from "./Sidebar";
import styled from "styled-components";
import Metadata from "./Metadata";
import Login from "./Login";

const Wrapper = styled.div`
  flex: 1 0 200px;

  display: flex;
  position: relative;
  overflow: hidden;
`;

const Header = styled.header`
  background-color: #f0f0f0;
  position: sticky;
  top: 0;
  background-color: white;
  z-index: 1;
  border-bottom: 1px solid #e0e0e0;
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

function CMS() {
  const api = useAtomValue(apiAtom);
  const setModel = useSetAtom(modelAtom);
  const [show, setShow] = useAtom(sidebarAtom);
  const user = localStorage.getItem("user") || "";
  const [hasUserBranch, setHasUserBranch] = useState(false);
  const [branchLoading, setBranchLoading] = useState(false);
  const [branch, setBranch] = useAtom(branchAtom);
  const [hasPullRequest, setHasPullRequest] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  useEffect(() => {
    if (!api) return;
    api.initialize(branch).then(setModel);
  }, [api, branch, setModel]);

  useEffect(() => {
    if (!api) return;
    api.getBranches().then((branches) => {
      const hasUserBranch = branches.includes(user);
      setHasUserBranch(hasUserBranch);
    });
    api.getPullRequests().then((prs) => {
      const hasPullRequest = prs.some((x) => x.head.ref === user);
      setHasPullRequest(hasPullRequest);
    });
  }, [api, user]);

  if (!api) return <Spinner />;

  return (
    <>
      <Header>
        <Navbar>
          <Container fluid>
            <Navbar.Brand>
              <img
                src="https://viva-la-vita.org/favicon.ico"
                width="32"
                alt="logo"
              />
            </Navbar.Brand>
            <Button className="d-lg-none" onClick={handleShow}>
              目录
            </Button>
            <Navbar.Collapse
              className="justify-content-end"
              style={{ gap: 16 }}
            >
              <Button
                variant={hasPullRequest ? "text" : "primary"}
                disabled={hasPullRequest}
                onClick={() => {
                  api.createPullRequest(branch).then(() => {
                    setHasPullRequest(true);
                  });
                }}
              >
                {hasPullRequest ? "已提交" : "提交"}
              </Button>
              <DropdownButton title={branch === mainBranch ? "主线" : "分支"}>
                <Dropdown.Item onClick={() => setBranch(mainBranch)}>
                  主线
                </Dropdown.Item>
                {hasUserBranch ? (
                  <Dropdown.Item onClick={() => setBranch(user)}>
                    分支
                  </Dropdown.Item>
                ) : (
                  <Dropdown.Item
                    onClick={() => {
                      setBranchLoading(true);
                      api.createBranch(user).then(() => {
                        setBranch(user);
                        setHasUserBranch(true);
                        setBranchLoading(false);
                      });
                    }}
                  >
                    {branchLoading ? <Spinner /> : "（创建分支）"}
                  </Dropdown.Item>
                )}
              </DropdownButton>
              <Button
                onClick={() => {
                  localStorage.removeItem("user");
                  localStorage.removeItem("token");
                  window.location.reload();
                }}
              >
                登出
              </Button>
            </Navbar.Collapse>
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
    </>
  );
}

export default function App() {
  const user = localStorage.getItem("user");
  const token = localStorage.getItem("token");
  if (!token || !user) {
    return <Login />;
  }
  return <CMS />;
}
