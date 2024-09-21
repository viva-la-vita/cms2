import styled from "styled-components";
import { apiAtom, modelAtom, pathAtom, sidebarAtom, TreeNode } from "../atoms";
import { useAtom, useAtomValue, useSetAtom } from "jotai";

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
  index,
}: {
  node: TreeNode;
  parent: string[];
  index: number;
}) {
  const api = useAtomValue(apiAtom);
  const path = parent.concat([node.name]);
  const [currentPath, setPath] = useAtom(pathAtom);
  const [show, setShow] = useAtom(sidebarAtom);
  const setModel = useSetAtom(modelAtom);
  const hasChildren = node.items.length > 0 || node.unknown_items.length > 0;
  return (
    <li>
      <div
        className={path.join("/") === currentPath.join("/") ? "active" : ""}
        onClick={() => {
          setPath(path);
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
                newNode.items = await api.expand(newNode.unknown_items, path);
                newNode.unknown_items = [];
              }
              setModel((draft) => draft.set(parent, index, newNode));
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

export default function Sidebar() {
  const model = useAtomValue(modelAtom);

  return (
    <aside style={{ width: "100%" }}>
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
    </aside>
  );
}
