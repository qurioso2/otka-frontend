'use client';
import { useState, useRef, useEffect } from 'react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  // Initialize editor content
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || '';
    }
  }, [value]);

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      editorRef.current.focus();
      // Trigger change after command
      setTimeout(() => updateContent(), 0);
    }
  };

  const updateContent = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    document.execCommand('insertText', false, text);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Handle Ctrl/Cmd + B for bold
    if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
      e.preventDefault();
      execCommand('bold');
    }
    // Handle Ctrl/Cmd + I for italic
    if ((e.ctrlKey || e.metaKey) && e.key === 'i') {
      e.preventDefault();
      execCommand('italic');
    }
  };

  return (
    <div className="border-2 border-neutral-300 rounded-lg overflow-hidden">
      {/* Toolbar */}
      <div className="bg-neutral-100 border-b-2 border-neutral-300 p-2 flex flex-wrap gap-1">
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault(); // Prevent focus loss
            execCommand('bold');
          }}
          className="px-3 py-1.5 bg-white border border-neutral-300 rounded hover:bg-neutral-50 font-bold text-sm transition"
          title="Bold (Ctrl+B)"
        >
          <strong>B</strong>
        </button>
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            execCommand('italic');
          }}
          className="px-3 py-1.5 bg-white border border-neutral-300 rounded hover:bg-neutral-50 italic text-sm transition"
          title="Italic (Ctrl+I)"
        >
          <em>I</em>
        </button>
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            execCommand('underline');
          }}
          className="px-3 py-1.5 bg-white border border-neutral-300 rounded hover:bg-neutral-50 underline text-sm transition"
          title="Underline"
        >
          <u>U</u>
        </button>
        
        <div className="w-px bg-neutral-300 mx-1" />
        
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            execCommand('formatBlock', '<h2>');
          }}
          className="px-3 py-1.5 bg-white border border-neutral-300 rounded hover:bg-neutral-50 font-bold text-sm transition"
          title="Heading 2"
        >
          H2
        </button>
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            execCommand('formatBlock', '<h3>');
          }}
          className="px-3 py-1.5 bg-white border border-neutral-300 rounded hover:bg-neutral-50 font-bold text-sm transition"
          title="Heading 3"
        >
          H3
        </button>
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            execCommand('formatBlock', '<p>');
          }}
          className="px-3 py-1.5 bg-white border border-neutral-300 rounded hover:bg-neutral-50 text-sm transition"
          title="Paragraph"
        >
          P
        </button>
        
        <div className="w-px bg-neutral-300 mx-1" />
        
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            execCommand('insertUnorderedList');
          }}
          className="px-3 py-1.5 bg-white border border-neutral-300 rounded hover:bg-neutral-50 text-sm transition"
          title="Bullet List"
        >
          • List
        </button>
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            execCommand('insertOrderedList');
          }}
          className="px-3 py-1.5 bg-white border border-neutral-300 rounded hover:bg-neutral-50 text-sm transition"
          title="Numbered List"
        >
          1. List
        </button>
        
        <div className="w-px bg-neutral-300 mx-1" />
        
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            execCommand('removeFormat');
          }}
          className="px-3 py-1.5 bg-white border border-neutral-300 rounded hover:bg-neutral-50 text-sm text-red-600 transition"
          title="Clear Formatting"
        >
          ✕ Clear
        </button>
      </div>
      
      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        onInput={updateContent}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        onPaste={handlePaste}
        onKeyDown={handleKeyDown}
        className={`min-h-[200px] p-4 focus:outline-none ${
          isFocused ? 'ring-2 ring-blue-500' : ''
        }`}
        style={{
          wordWrap: 'break-word',
          overflowWrap: 'break-word'
        }}
        data-placeholder={placeholder}
      />
      
      <style jsx>{`
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: #9ca3af;
          pointer-events: none;
        }
        [contenteditable] h2 {
          font-size: 1.5rem;
          font-weight: 700;
          margin: 1rem 0;
        }
        [contenteditable] h3 {
          font-size: 1.25rem;
          font-weight: 600;
          margin: 0.75rem 0;
        }
        [contenteditable] p {
          margin: 0.5rem 0;
        }
        [contenteditable] ul,
        [contenteditable] ol {
          margin: 0.5rem 0;
          padding-left: 2rem;
        }
        [contenteditable] li {
          margin: 0.25rem 0;
        }
      `}</style>
    </div>
  );
}
