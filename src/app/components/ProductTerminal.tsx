"use client";

import React, { useState, useEffect, useCallback } from "react";

// =============================================================================
// Terminal Sequence Data
// =============================================================================

interface TerminalLine {
  text: string;
  type: "command" | "success" | "response" | "blank";
}

interface TerminalBlock {
  lines: TerminalLine[];
}

const BLOCKS: TerminalBlock[] = [
  {
    lines: [
      { text: "torque campaigns create --type leaderboard --budget 50000 --epoch 7d", type: "command" },
      { text: 'Campaign "trading-comp-q1" created', type: "success" },
      { text: "847 eligible wallets detected", type: "response" },
      { text: "Epoch 1 starts in 3 minutes", type: "response" },
    ],
  },
  {
    lines: [
      { text: "torque analytics roi --campaign winners-arc", type: "command" },
      { text: "Volume Driven    $204M", type: "response" },
      { text: "ROI              5.9x", type: "response" },
      { text: "Unique Traders   69,204", type: "response" },
      { text: "Claim Rate       78%", type: "response" },
    ],
  },
  {
    lines: [
      { text: "torque users segment --risk at-risk --days 7", type: "command" },
      { text: "1,744 wallets flagged (43% of active)", type: "response" },
      { text: "Top action: Send re-engagement raffle", type: "response" },
      { text: "Projected save rate: 35%", type: "response" },
    ],
  },
  {
    lines: [
      { text: "torque campaigns launch --type raffle --target at-risk --budget 5000", type: "command" },
      { text: "Raffle deployed to 1,744 wallets", type: "success" },
      { text: "Expected volume lift: 3x per participant", type: "response" },
    ],
  },
];

// Flatten all blocks into a single list of lines with metadata
function flattenBlocks(): TerminalLine[] {
  const flat: TerminalLine[] = [];
  for (let i = 0; i < BLOCKS.length; i++) {
    const block = BLOCKS[i];
    for (const line of block.lines) {
      flat.push(line);
    }
    // Add a blank line between blocks (except after the last)
    if (i < BLOCKS.length - 1) {
      flat.push({ text: "", type: "blank" });
    }
  }
  return flat;
}

const ALL_LINES = flattenBlocks();

// =============================================================================
// Timing constants
// =============================================================================
const CHAR_DELAY = 30; // ms per character for commands
const RESPONSE_PAUSE = 500; // ms pause before showing a response line
const BETWEEN_BLOCKS_PAUSE = 1500; // ms pause at blank lines between blocks
const LOOP_PAUSE = 3000; // ms pause before restarting

// =============================================================================
// ProductTerminal Component
// =============================================================================
export default function ProductTerminal() {
  // completedLines: fully typed lines (indices into ALL_LINES)
  const [completedLines, setCompletedLines] = useState<number>(0);
  // currentChar: how many chars of the current line have been typed
  const [currentChar, setCurrentChar] = useState<number>(0);
  const currentLineIndex = completedLines;
  const currentLine = currentLineIndex < ALL_LINES.length ? ALL_LINES[currentLineIndex] : null;
  const isFinished = currentLineIndex >= ALL_LINES.length;

  const reset = useCallback(() => {
    setCompletedLines(0);
    setCurrentChar(0);
  }, []);

  useEffect(() => {
    if (isFinished) {
      // All lines done -- pause then loop
      const timer = setTimeout(reset, LOOP_PAUSE);
      return () => clearTimeout(timer);
    }

    if (!currentLine) return;

    // Blank lines (spacers between blocks)
    if (currentLine.type === "blank") {
      const timer = setTimeout(() => {
        setCompletedLines((prev) => prev + 1);
        setCurrentChar(0);
      }, BETWEEN_BLOCKS_PAUSE);
      return () => clearTimeout(timer);
    }

    // Response/success lines appear after a short pause (no typing)
    if (currentLine.type === "response" || currentLine.type === "success") {
      const timer = setTimeout(() => {
        setCompletedLines((prev) => prev + 1);
        setCurrentChar(0);
      }, RESPONSE_PAUSE);
      return () => clearTimeout(timer);
    }

    // Command lines type out character by character
    if (currentLine.type === "command") {
      if (currentChar < currentLine.text.length) {
        const timer = setTimeout(() => {
          setCurrentChar((prev) => prev + 1);
        }, CHAR_DELAY);
        return () => clearTimeout(timer);
      } else {
        // Finished typing this command line
        const timer = setTimeout(() => {
          setCompletedLines((prev) => prev + 1);
          setCurrentChar(0);
        }, RESPONSE_PAUSE);
        return () => clearTimeout(timer);
      }
    }
  }, [completedLines, currentChar, currentLine, isFinished, reset]);

  // Build rendered lines
  const renderedLines: React.ReactNode[] = [];

  for (let i = 0; i < completedLines && i < ALL_LINES.length; i++) {
    const line = ALL_LINES[i];
    renderedLines.push(
      <LineRenderer key={`line-${i}`} line={line} />
    );
  }

  // Current line being typed (if it's a command)
  if (!isFinished && currentLine) {
    if (currentLine.type === "command") {
      renderedLines.push(
        <div key="current" className="flex">
          <span className="text-green-400 select-none">$&nbsp;</span>
          <span className="text-white">
            {currentLine.text.slice(0, currentChar)}
          </span>
          <span className="animate-pulse text-white">|</span>
        </div>
      );
    }
    // Response/success lines appear instantly when their timer fires,
    // so we don't show a partial state for them.
  }

  // If we just finished all lines, show a final cursor
  if (isFinished) {
    renderedLines.push(
      <div key="final-cursor" className="flex">
        <span className="text-green-400 select-none">$&nbsp;</span>
        <span className="animate-pulse text-white">|</span>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="rounded-[3px] border border-white/10 bg-[#0a0a0a] shadow-2xl overflow-hidden">
        {/* Terminal header */}
        <div className="flex items-center gap-2 px-4 py-2.5 bg-white/5 border-b border-white/5">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FF5F57]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#FEBC2E]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#28C840]" />
          </div>
          <span className="font-mono text-[11px] text-white/30 ml-2">torque-mcp</span>
        </div>

        {/* Terminal body */}
        <div className="p-4 md:p-5 font-mono text-sm leading-relaxed min-h-[320px]">
          {renderedLines}
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// Line Renderer
// =============================================================================
function LineRenderer({ line }: { line: TerminalLine }) {
  if (line.type === "blank") {
    return <div className="h-4" />;
  }

  if (line.type === "command") {
    return (
      <div className="flex">
        <span className="text-green-400 select-none">$&nbsp;</span>
        <span className="text-white">{line.text}</span>
      </div>
    );
  }

  if (line.type === "success") {
    return (
      <div className="pl-4 flex items-center gap-1.5">
        <span className="text-blue">&#10003;</span>
        <span className="text-blue">{line.text}</span>
      </div>
    );
  }

  // response
  return (
    <div className="pl-4">
      <ResponseLine text={line.text} />
    </div>
  );
}

// =============================================================================
// Response Line - splits label from value for dual coloring
// =============================================================================
function ResponseLine({ text }: { text: string }) {
  // Try to split on multi-space gap (label    value pattern)
  const match = text.match(/^(.+?)\s{2,}(.+)$/);
  if (match) {
    return (
      <span>
        <span className="text-white/50">{match[1]}</span>
        <span className="text-white/20">{"  "}</span>
        <span className="text-blue">{match[2]}</span>
      </span>
    );
  }

  // No label/value split -- just render as response text
  return <span className="text-white/50">{text}</span>;
}
