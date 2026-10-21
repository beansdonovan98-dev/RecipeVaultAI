export interface TextSelection {
  start: number;
  end: number;
}

export interface FormatResult {
  text: string;
  selection: TextSelection;
}

const BULLET_PREFIX = '- ';

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function getSelection(text: string, selection: TextSelection): TextSelection {
  const start = clamp(Math.min(selection.start, selection.end), 0, text.length);
  const end = clamp(Math.max(selection.start, selection.end), 0, text.length);
  return { start, end };
}

export function applyBullet(text: string, selection: TextSelection): FormatResult {
  const { start, end } = getSelection(text, selection);

  if (start === end) {
    const lineStart = text.lastIndexOf('\n', start - 1) + 1;
    const nextLineBreak = text.indexOf('\n', end);
    const lineEnd = nextLineBreak === -1 ? text.length : nextLineBreak;
    const line = text.slice(lineStart, lineEnd);

    if (line.startsWith(BULLET_PREFIX)) {
      const nextText = text.slice(0, lineStart) + line.slice(BULLET_PREFIX.length) + text.slice(lineEnd);
      return {
        text: nextText,
        selection: {
          start: Math.max(lineStart, start - BULLET_PREFIX.length),
          end: Math.max(lineStart, end - BULLET_PREFIX.length),
        },
      };
    }

    return {
      text: text.slice(0, start) + BULLET_PREFIX + text.slice(start),
      selection: { start: start + BULLET_PREFIX.length, end: end + BULLET_PREFIX.length },
    };
  }

  const lineStart = text.lastIndexOf('\n', start - 1) + 1;
  const nextLineBreak = text.indexOf('\n', end);
  const lineEnd = nextLineBreak === -1 ? text.length : nextLineBreak;
  const lines = text.slice(lineStart, lineEnd).split('\n');
  const nonEmptyLines = lines.filter((line) => line.length > 0);
  const allBulleted = nonEmptyLines.length > 0 && nonEmptyLines.every((line) => line.startsWith(BULLET_PREFIX));

  const nextLines = lines.map((line) => {
    if (line.length === 0) {
      return line;
    }
    return allBulleted ? line.slice(BULLET_PREFIX.length) : BULLET_PREFIX + line;
  });
  const nextBlock = nextLines.join('\n');

  return {
    text: text.slice(0, lineStart) + nextBlock + text.slice(lineEnd),
    selection: { start: lineStart, end: lineStart + nextBlock.length },
  };
}

export function wrapSelection(
  text: string,
  selection: TextSelection,
  marker: string,
  placeholder: string
): FormatResult {
  const { start, end } = getSelection(text, selection);

  if (start === end) {
    const insertion = `${marker}${placeholder}${marker}`;
    return {
      text: text.slice(0, start) + insertion + text.slice(start),
      selection: {
        start: start + marker.length,
        end: start + marker.length + placeholder.length,
      },
    };
  }

  const selected = text.slice(start, end);
  if (selected.startsWith(marker) && selected.endsWith(marker) && selected.length >= marker.length * 2) {
    const inner = selected.slice(marker.length, -marker.length);
    return {
      text: text.slice(0, start) + inner + text.slice(end),
      selection: { start, end: start + inner.length },
    };
  }

  return {
    text: text.slice(0, start) + marker + selected + marker + text.slice(end),
    selection: { start: start + marker.length, end: end + marker.length },
  };
}
