type TreeNode = {
  name: string;
  path: string;
  type: "folder" | "file";
  children?: TreeNode[];
};

export function buildTree(paths: string[]): TreeNode[] {
  const root: Record<string, TreeNode> = {};

  for (const path of paths) {
    const parts = path.split("/");
    let currentLevel:any = root;

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const isFile = i === parts.length - 1;

      if (!currentLevel[part]) {
        currentLevel[part] = {
          name: part,
          path: parts.slice(0, i + 1).join("/"),
          type: isFile ? "file" : "folder",
          ...(isFile ? {} : { children: {} })
        };
      }

      if (!isFile) {
        currentLevel = currentLevel[part].children as any;
      }
    }
  }

  function objectToArray(obj: Record<string, TreeNode>): TreeNode[] {
    return Object.values(obj).map((node) => {
      if (node.type === "folder" && node.children)
        return { ...node, children: objectToArray(node.children as any) };
      return node;
    });
  }

  return objectToArray(root);
}
