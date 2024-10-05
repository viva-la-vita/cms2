import { createRoot } from "react-dom/client";
import App from "./components/App";
import { createGlobalStyle } from "styled-components";

const GlobalStyle = createGlobalStyle`
  html, body {
    height: 100%;
  }

  #root {
    height: 100%;
    display: flex;
    flex-direction: column;
  }
`;

createRoot(document.getElementById("root")!).render(
  <>
    <GlobalStyle />
    <App />
  </>
);
