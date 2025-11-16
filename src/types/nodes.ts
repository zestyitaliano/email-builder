export type BuilderNodeType = "text" | "image" | "button";

export interface BuilderNodeBase<TType extends BuilderNodeType, TProps> {
  id: string;
  type: TType;
  props: TProps;
}

export type TextNode = BuilderNodeBase<
  "text",
  {
    text: string;
    align: "left" | "center" | "right";
    color: string;
    fontSize: number;
  }
>;

export type ImageNode = BuilderNodeBase<
  "image",
  {
    url: string;
    alt: string;
    width: number;
  }
>;

export type ButtonNode = BuilderNodeBase<
  "button",
  {
    label: string;
    url: string;
    variant: "primary" | "secondary";
  }
>;

export type BuilderNode = TextNode | ImageNode | ButtonNode;

export type BuilderNodeMap = {
  text: TextNode;
  image: ImageNode;
  button: ButtonNode;
};

const defaultText = "Write something lovely";
const defaultImage = "https://placehold.co/600x200";

export const createNode = (type: BuilderNodeType): BuilderNode => {
  const baseId = typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${type}-${Math.random().toString(36).slice(2)}`;

  switch (type) {
    case "text":
      return {
        id: baseId,
        type,
        props: {
          text: defaultText,
          align: "left",
          color: "#0f172a",
          fontSize: 16
        }
      };
    case "image":
      return {
        id: baseId,
        type,
        props: {
          url: defaultImage,
          alt: "Placeholder",
          width: 600
        }
      };
    case "button":
    default:
      return {
        id: baseId,
        type: "button",
        props: {
          label: "Call to action",
          url: "https://example.com",
          variant: "primary"
        }
      };
  }
};

export const BLANK_NODES: BuilderNode[] = [];
