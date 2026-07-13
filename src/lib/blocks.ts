// Shared lightweight markdown/notebook block parser used by the tutor panel
// and notes page to render headings, code, math, and text consistently.
export interface Block {
  type: "text" | "code" | "math" | "heading";
  content: string;
  lang?: string;
  level?: number;
}

export function parseMarkdown(text: string): Block[] {
  const blocks: Block[] = [];
  const codeRegex = /```(\w*)\n([\s\S]*?)```/g;

  let lastIndex = 0;
  let match;

  while ((match = codeRegex.exec(text)) !== null) {
    const prevText = text.slice(lastIndex, match.index);
    if (prevText) {
      blocks.push(...parseMathAndText(prevText));
    }
    blocks.push({
      type: "code",
      lang: match[1] || "typescript",
      content: match[2].trim(),
    });
    lastIndex = codeRegex.lastIndex;
  }
  const remainingText = text.slice(lastIndex);
  if (remainingText) {
    blocks.push(...parseMathAndText(remainingText));
  }
  return blocks;
}

function parseMathAndText(text: string): Block[] {
  const blocks: Block[] = [];
  const mathRegex = /\$\$([\s\S]*?)\$\$/g;

  let lastIndex = 0;
  let match;

  while ((match = mathRegex.exec(text)) !== null) {
    const prevText = text.slice(lastIndex, match.index);
    if (prevText) {
      blocks.push(...parseHeadingsAndParagraphs(prevText));
    }
    blocks.push({
      type: "math",
      content: match[1],
    });
    lastIndex = mathRegex.lastIndex;
  }
  const remainingText = text.slice(lastIndex);
  if (remainingText) {
    blocks.push(...parseHeadingsAndParagraphs(remainingText));
  }
  return blocks;
}

function parseHeadingsAndParagraphs(text: string): Block[] {
  const lines = text.split("\n");
  const blocks: Block[] = [];
  let currentParagraphLines: string[] = [];

  const flushParagraph = () => {
    if (currentParagraphLines.length > 0) {
      blocks.push({
        type: "text",
        content: currentParagraphLines.join("\n"),
      });
      currentParagraphLines = [];
    }
  };

  for (const line of lines) {
    const headingMatch = line.match(/^(#{1,6})\s+(.*)$/);
    if (headingMatch) {
      flushParagraph();
      blocks.push({
        type: "heading",
        level: headingMatch[1].length,
        content: headingMatch[2],
      });
    } else {
      if (line.trim() === "") {
        flushParagraph();
      } else {
        currentParagraphLines.push(line);
      }
    }
  }
  flushParagraph();
  return blocks;
}
