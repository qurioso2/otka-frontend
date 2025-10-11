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

  const updateContent = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const wrapSelectedText = (tag: string) => {
    if (!editorRef.current) return;
    
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    
    const range = selection.getRangeAt(0);
    const selectedText = range.toString();
    
    if (!selectedText) {
      // No selection, insert placeholder
      const element = document.createElement(tag);
      element.innerHTML = tag === 'ul' || tag === 'ol' ? '<li>Text</li>' : 'Text';
      range.insertNode(element);
    } else {
      // Has selection
      const fragment = range.extractContents();
      const element = document.createElement(tag);
      
      if (tag === 'ul' || tag === 'ol') {
        // For lists, wrap in li
        const li = document.createElement('li');
        li.appendChild(fragment);
        element.appendChild(li);
      } else {
        element.appendChild(fragment);
      }
      
      range.insertNode(element);
    }
    
    // Clear selection
    selection.removeAllRanges();
    
    setTimeout(() => updateContent(), 10);
  };

  const handleHeading2 = () => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    wrapSelectedText('h2');
  };

  const handleHeading3 = () => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    wrapSelectedText('h3');
  };

  const handleParagraph = () => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    wrapSelectedText('p');
  };

  const handleBulletList = () => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    wrapSelectedText('ul');
  };

  const handleNumberedList = () => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    wrapSelectedText('ol');
  };

  const handleClearFormatting = () => {
    if (!editorRef.current) return;
    
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    
    const range = selection.getRangeAt(0);
    const selectedText = range.toString();
    
    if (selectedText) {
      // Replace with plain text
      const textNode = document.createTextNode(selectedText);
      range.deleteContents();
      range.insertNode(textNode);
    }
    
    setTimeout(() => updateContent(), 10);
  };

  const execCommand = (command: string) => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    document.execCommand(command, false);
    setTimeout(() => updateContent(), 10);
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    document.execCommand('insertText', false, text);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
      e.preventDefault();
      execCommand('bold');
    }
    if ((e.ctrlKey || e.metaKey) && e.key === 'i') {
      e.preventDefault();
      execCommand('italic');
    }
    if ((e.ctrlKey || e.metaKey) && e.key === 'u') {
      e.preventDefault();
      execCommand('underline');
    }
  };

  return (
    <div className="border-2 border-neutral-300 rounded-lg overflow-hidden">
      {/* Toolbar */}
      <div className="bg-neutral-100 border-b-2 border-neutral-300 p-2 flex flex-wrap gap-1">
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
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
          title="Underline (Ctrl+U)"
        >
          <u>U</u>
        </button>
        
        <div className="w-px bg-neutral-300 mx-1" />
        
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            handleHeading2();
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
            handleHeading3();
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
            handleParagraph();
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
            handleBulletList();
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
            handleNumberedList();
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
            handleClearFormatting();
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
          display: block;
        }
        [contenteditable] h3 {
          font-size: 1.25rem;
          font-weight: 600;
          margin: 0.75rem 0;
          display: block;
        }
        [contenteditable] p {
          margin: 0.5rem 0;
          display: block;
        }
        [contenteditable] ul,
        [contenteditable] ol {
          margin: 0.5rem 0;
          padding-left: 2rem;
          display: block;
        }
        [contenteditable] li {
          margin: 0.25rem 0;
          display: list-item;
        }
      `}</style>
    </div>
  );
}
