/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly PAT: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}