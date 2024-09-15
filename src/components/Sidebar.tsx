import styled from "styled-components";
import { modelAtom, pathAtom, TreeNode } from "../atoms";
import { useAtom, useAtomValue } from "jotai";

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
    gap: 1rem;
  }
`;

const Item = styled.p`
  flex: 1;
  border-radius: 4px;
  margin: 0;
  padding: 4px;
  cursor: pointer;

  &:hover {
    background-color: #f0f0f0;
  }

  &.active {
    background-color: #e0e0e0;
  }
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
    background-color: #f0f0f0;
  }
`;

function SidebarItem({ node, parent }: { node: TreeNode; parent: string[] }) {
  const path = parent.concat([node.name]);
  const [currentPath, setPath] = useAtom(pathAtom);
  return (
    <li>
      <div>
        <Item
          className={path.join("/") === currentPath.join("/") ? "active" : ""}
          onClick={() => setPath(path)}
        >
          {node.title}
        </Item>
        {node.unknown_children.length > 0 && (
          <ExpandButton>{node.expanded ? "-" : "+"}</ExpandButton>
        )}
      </div>
      {node.children.length > 0 && (
        <TreeList>
          {node.children.map((child) => (
            <SidebarItem key={child.name} node={child} parent={path} />
          ))}
        </TreeList>
      )}
    </li>
  );
}

const Aside = styled.aside`
  flex: 0 0 240px;
  overflow-y: scroll;
  overflow-x: hidden;
`;

export default function Sidebar() {
  const model = useAtomValue(modelAtom);

  return (
    <Aside>
      <nav>
        <TreeList>
          {model.map((node) => (
            <SidebarItem key={node.name} node={node} parent={[]} />
          ))}
        </TreeList>
      </nav>
    </Aside>
  );
}
