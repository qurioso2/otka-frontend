'use client';
import { useState, useRef } from 'react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    updateContent();
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

  return (
    <div className="border-2 border-neutral-300 rounded-lg overflow-hidden">
      {/* Toolbar */}
      <div className="bg-neutral-100 border-b-2 border-neutral-300 p-2 flex flex-wrap gap-1">
        <button
          type="button"
          onClick={() => execCommand('bold')}
          className="px-3 py-1.5 bg-white border border-neutral-300 rounded hover:bg-neutral-50 font-bold text-sm"
          title="Bold"
        >
          B
        </button>
        <button
          type="button"
          onClick={() => execCommand('italic')}
          className="px-3 py-1.5 bg-white border border-neutral-300 rounded hover:bg-neutral-50 italic text-sm"
          title="Italic"
        >
          I
        </button>
        <button
          type="button"
          onClick={() => execCommand('underline')}
          className="px-3 py-1.5 bg-white border border-neutral-300 rounded hover:bg-neutral-50 underline text-sm"
          title="Underline"
        >
          U
        </button>
        
        <div className="w-px bg-neutral-300 mx-1" />
        
        <button
          type="button"
          onClick={() => execCommand('formatBlock', '<h2>')}
          className="px-3 py-1.5 bg-white border border-neutral-300 rounded hover:bg-neutral-50 font-bold text-sm"
          title="Heading 2"
        >
          H2
        </button>
        <button
          type="button"
          onClick={() => execCommand('formatBlock', '<h3>')}
          className="px-3 py-1.5 bg-white border border-neutral-300 rounded hover:bg-neutral-50 font-bold text-sm"
          title="Heading 3"
        >
          H3
        </button>
        <button
          type="button"
          onClick={() => execCommand('formatBlock', '<p>')}
          className="px-3 py-1.5 bg-white border border-neutral-300 rounded hover:bg-neutral-50 text-sm"
          title="Paragraph"
        >
          P
        </button>
        
        <div className="w-px bg-neutral-300 mx-1" />
        
        <button
          type="button"
          onClick={() => execCommand('insertUnorderedList')}
          className="px-3 py-1.5 bg-white border border-neutral-300 rounded hover:bg-neutral-50 text-sm"
          title="Bullet List"
        >
          • List
        </button>
        <button
          type="button"
          onClick={() => execCommand('insertOrderedList')}
          className="px-3 py-1.5 bg-white border border-neutral-300 rounded hover:bg-neutral-50 text-sm"
          title="Numbered List"
        >
          1. List
        </button>
        
        <div className="w-px bg-neutral-300 mx-1" />
        
        <button
          type="button"
          onClick={() => execCommand('removeFormat')}
          className="px-3 py-1.5 bg-white border border-neutral-300 rounded hover:bg-neutral-50 text-sm text-red-600"
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
        dangerouslySetInnerHTML={{ __html: value }}
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
