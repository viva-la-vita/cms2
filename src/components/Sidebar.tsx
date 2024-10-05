import styled from "styled-components";
import {
  apiAtom,
  branchAtom,
  draftAtom,
  modelAtom,
  pathAtom,
  sidebarAtom,
  TreeNode,
} from "../atoms";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import { useState } from "react";
import hash from "object-hash";

const TreeList = styled.ul`
  padding: 0;

  & > li {
    list-style-type: none;
    margin-left: 1em;
  }

  & > li > div {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-radius: 4px;
    gap: 1rem;
    cursor: pointer;

    &:hover {
      background-color: #f0f0f0;
    }

    &.active {
      background-color: #f0f0f0;
    }
  }
`;

const Item = styled.p`
  flex: 1;
  margin: 0;
  padding: 4px 8px;
`;

const ExpandButton = styled.button`
  background: none;
  border-radius: 4px;
  border: none;
  padding: 0;
  margin: 0;
  font-size: 1.2rem;
  min-width: 2rem;
  min-height: 2rem;

  &:hover {
    background-color: #e0e0e0;
  }
`;

function SidebarItem({
  node,
  parent,
}: {
  node: TreeNode;
  parent: string[];
  index: number;
}) {
  const api = useAtomValue(apiAtom)!;
  const path = parent.concat([node.name]);
  const [currentPath, setPath] = useAtom(pathAtom);
  const branch = useAtomValue(branchAtom);
  const setDraft = useSetAtom(draftAtom);
  const [show, setShow] = useAtom(sidebarAtom);
  const [model, setModel] = useAtom(modelAtom);
  const hasChildren = node.items.length > 0 || node.unknown_items.length > 0;
  return (
    <li>
      <div
        className={path.join("/") === currentPath.join("/") ? "active" : ""}
        onClick={() => {
          setPath(path);
          const node = model.get(path)!;
          const draftContent = {
            name: node.name,
            title: node.title,
            content: node.content,
          };
          setDraft({ hash: hash(draftContent), ...draftContent });
          if (show) setShow(false);
        }}
      >
        <Item>{node.title}</Item>
        {hasChildren && (
          <ExpandButton
            onClick={async (e) => {
              e.stopPropagation();
              const newNode = { ...node, expanded: !node.expanded };
              if (newNode.expanded && newNode.unknown_items.length > 0) {
                newNode.items = await api.expand(
                  branch,
                  newNode.unknown_items,
                  path
                );
                newNode.unknown_items = [];
              }
              setModel((draft) => draft.set(path, newNode));
            }}
          >
            {node.expanded ? <span>&minus;</span> : <span>+</span>}
          </ExpandButton>
        )}
      </div>
      {node.items.length > 0 && node.expanded && (
        <TreeList>
          {node.items.map((child, index) => (
            <SidebarItem
              key={child.name}
              node={child}
              parent={path}
              index={index}
            />
          ))}
        </TreeList>
      )}
    </li>
  );
}

const Aside = styled.aside`
  width: 100%;
`;

export default function Sidebar() {
  const model = useAtomValue(modelAtom);
  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);

  return (
    <Aside>
      <nav>
        <TreeList>
          {model.data.map((node, index) => (
            <SidebarItem
              key={node.name}
              node={node}
              parent={[]}
              index={index}
            />
          ))}
        </TreeList>
      </nav>
      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Modal heading</Modal.Title>
        </Modal.Header>
        <Modal.Body>Woohoo, you are reading this text in a modal!</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
          <Button variant="primary" onClick={handleClose}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    </Aside>
  );
}
