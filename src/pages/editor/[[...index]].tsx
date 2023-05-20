import {
  $createTextNode,
  $getRoot,
  $getSelection,
  EditorConfig,
  EditorState,
  LexicalNode,
  SerializedTextNode,
  Spread,
  TextNode,
} from "lexical";
import { useEffect } from "react";

import { TableNode, TableRowNode, TableCellNode } from "@lexical/table";
import { ListNode, ListItemNode } from "@lexical/list";
import { LinkNode } from "@lexical/link";
import { QuoteNode, HeadingNode } from "@lexical/rich-text";
import { CodeNode } from "@lexical/code";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import LexicalErrorBoundary from "@lexical/react/LexicalErrorBoundary";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { TabIndentationPlugin } from "@lexical/react/LexicalTabIndentationPlugin";
import { TablePlugin } from "@lexical/react/LexicalTablePlugin";
import { CheckListPlugin } from "@lexical/react/LexicalCheckListPlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
import { MarkdownShortcutPlugin } from "@lexical/react/LexicalMarkdownShortcutPlugin";
import { TRANSFORMERS } from "@lexical/markdown";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { TreeView } from "@lexical/react/LexicalTreeView";
import { NodeKey } from "lexical";

const theme = {
  root: "p-4 border-slate-500 border-2 rounded h-auto min-h-[200px] focus:outline-none focus-visible:border-black",
  link: "cursor-pointer",
  text: {
    bold: "font-semibold",
    underline: "underline decoration-wavy",
    italic: "italic",
    strikethrough: "line-through",
    underlineStrikethrough: "underlined-line-through",
  },
};

// When the editor changes, you can get notified via the
// LexicalOnChangePlugin!
function onChange(editorState: EditorState) {
  editorState.read(() => {
    // Read the contents of the EditorState here.
    const root = $getRoot();
    const selection = $getSelection();

    //console.log(root, selection);
  });
}

// Lexical React plugins are React components, which makes them
// highly composable. Furthermore, you can lazy load plugins if
// desired, so you don't pay the cost for plugins until you
// actually use them.
function MyCustomAutoFocusPlugin() {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    // Focus the editor when the effect fires!
    editor.focus();
  }, [editor]);

  return null;
}

// Catch any errors that occur during Lexical updates and log them
// or throw them as needed. If you don't throw them, Lexical will
// try to recover gracefully without losing user data.
function onError(error: Error) {
  throw error;
}

export default function Editor() {
  const initialConfig = {
    namespace: "MyEditor",
    nodes: [
      ColoredNode,
      {
        replace: TextNode,
        with: (node: TextNode) => {
          console.log("test");
          return new ColoredNode(node.getTextContent(), "blue", node.getKey());
        },
      },
      TableNode,
      TableCellNode,
      TableRowNode,
      ListNode,
      ListItemNode,
      LinkNode,
      CodeNode,
      HeadingNode,
      QuoteNode,
    ],
    theme,
    onError,
  };

  return (
    <>
      <div className="editor-container">
        <LexicalComposer initialConfig={initialConfig}>
          <RichTextPlugin
            contentEditable={<ContentEditable />}
            placeholder={<div>Enter some text...</div>}
            ErrorBoundary={LexicalErrorBoundary}
          />

          <OnChangePlugin onChange={onChange} />
          <HistoryPlugin />
          <MyCustomAutoFocusPlugin />
          <TabIndentationPlugin />
          <TablePlugin />
          <CheckListPlugin />
          <ListPlugin />
          <LinkPlugin />
          <ExportPlugin />
          <TreeViewPlugin />
          <MarkdownShortcutPlugin transformers={TRANSFORMERS} />
        </LexicalComposer>
      </div>
    </>
  );
}

type SerializedExtendedTextNode = Spread<
  { wordKey: string | undefined },
  SerializedTextNode
>;

class ExtendedTextNode extends TextNode {
  __wordKey: string | undefined;

  constructor(text: string, key?: string) {
    console.log("in constructor");
    super(text, key);
  }

  static getType(): string {
    return "extended-text";
  }

  static clone(node: ExtendedTextNode): ExtendedTextNode {
    console.log("cloning");
    return new ExtendedTextNode(node.__text, node.__key);
  }
  
  setWordKey(wordKey: string) {
    const self = this.getWritable();
    self.__wordKey = wordKey;
  }

  getWordKey() {
    const self = this.getLatest();
    return self.__wordKey;
  }

  exportJSON() {
    return {
      ...super.exportJSON(),
      wordKey: this.getWordKey(),
    };
  }

  static importJSON(
    serializedNode: SerializedExtendedTextNode
  ): ExtendedTextNode {
    const node = $createExtendedTextNode(
      serializedNode.text,
      serializedNode.type
    );
    return node;
  }
}
export class ColoredNode extends TextNode {
  __color: string;

  constructor(text: string, color: string, key?: NodeKey) {
    super(text, key);
    this.__color = color;
  }

  static getType(): string {
    return 'colored';
  }

  static clone(node: ColoredNode): ColoredNode {
    return new ColoredNode(node.__text, node.__color, node.__key);
  }

  createDOM(config: EditorConfig): HTMLElement {
    const element = super.createDOM(config);
    element.style.color = this.__color;
    return element;
  }

  updateDOM(
    prevNode: ColoredNode,
    dom: HTMLElement,
    config: EditorConfig,
  ): boolean {
    const isUpdated = super.updateDOM(prevNode, dom, config);
    if (prevNode.__color !== this.__color) {
      dom.style.color = this.__color;
    }
    return isUpdated;
  }
}

export function $createColoredNode(text: string, color: string): ColoredNode {
  return new ColoredNode(text, color);
}

export function $isColoredNode(node: LexicalNode): boolean {
  return node instanceof ColoredNode;
}

function $createExtendedTextNode(text: string, key?: string) {
  return new ExtendedTextNode(text, key);
}

function ExportPlugin() {
  const [editor] = useLexicalComposerContext();

  return (
    <button
      onClick={() => {
        const json = editor.getEditorState().toJSON();
        console.log(json);
      }}
    >
      serialize
    </button>
  );
}

function TranscriptKeyPlugin() {
  const [editor] = useLexicalComposerContext();
  useEffect(() => {
    editor.registerNodeTransform(ExtendedTextNode, (node) => {
      console.log("test");
      if (node.getWordKey() === undefined) {
        node.setWordKey("test");
      }
    });
  });

  return null;
}

function TreeViewPlugin() {
  const [editor] = useLexicalComposerContext();
  return (
    <TreeView
      viewClassName="tree-view-output"
      timeTravelPanelClassName="debug-timetravel-panel"
      timeTravelButtonClassName="debug-timetravel-button"
      timeTravelPanelSliderClassName="debug-timetravel-panel-slider"
      timeTravelPanelButtonClassName="debug-timetravel-panel-button"
      treeTypeButtonClassName="e"
      editor={editor}
    />
  );
}
