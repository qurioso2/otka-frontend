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

  const execBasicCommand = (command: string) => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    document.execCommand(command, false);
    setTimeout(() => updateContent(), 10);
  };

  const applyHeading = (tag: 'h2' | 'h3') => {
    if (!editorRef.current) return;
    
    editorRef.current.focus();
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    
    const range = selection.getRangeAt(0);
    
    // Get the text
    let selectedText = range.toString();
    
    // If no selection, select the entire line
    if (!selectedText) {
      const node = selection.anchorNode;
      if (node) {
        if (node.nodeType === Node.TEXT_NODE && node.parentNode) {
          // Select parent element
          range.selectNode(node.parentNode);
          selectedText = range.toString();
        }
      }
    }
    
    // Create new heading element
    const heading = document.createElement(tag);
    heading.textContent = selectedText || 'Heading';
    
    // Delete current content and insert heading
    range.deleteContents();
    range.insertNode(heading);
    
    // Move cursor after heading
    range.setStartAfter(heading);
    range.setEndAfter(heading);
    selection.removeAllRanges();
    selection.addRange(range);
    
    setTimeout(() => updateContent(), 10);
  };

  const applyParagraph = () => {
    if (!editorRef.current) return;
    
    editorRef.current.focus();
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    
    const range = selection.getRangeAt(0);
    let selectedText = range.toString();
    
    if (!selectedText) {
      const node = selection.anchorNode;
      if (node) {
        if (node.nodeType === Node.TEXT_NODE && node.parentNode) {
          range.selectNode(node.parentNode);
          selectedText = range.toString();
        }
      }
    }
    
    const paragraph = document.createElement('p');
    paragraph.textContent = selectedText || 'Paragraph';
    
    range.deleteContents();
    range.insertNode(paragraph);
    
    range.setStartAfter(paragraph);
    range.setEndAfter(paragraph);
    selection.removeAllRanges();
    selection.addRange(range);
    
    setTimeout(() => updateContent(), 10);
  };

  const toggleList = (ordered: boolean) => {
    if (!editorRef.current) return;
    
    editorRef.current.focus();
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    
    const range = selection.getRangeAt(0);
    const selectedText = range.toString();
    
    // Create list
    const listTag = ordered ? 'ol' : 'ul';
    const list = document.createElement(listTag);
    
    // Split by newlines if multi-line
    const lines = selectedText ? selectedText.split('\n').filter(l => l.trim()) : ['Item'];
    
    lines.forEach(line => {
      const li = document.createElement('li');
      li.textContent = line.trim();
      list.appendChild(li);
    });
    
    range.deleteContents();
    range.insertNode(list);
    
    // Move cursor after list
    range.setStartAfter(list);
    range.setEndAfter(list);
    selection.removeAllRanges();
    selection.addRange(range);
    
    setTimeout(() => updateContent(), 10);
  };

  const clearFormatting = () => {
    if (!editorRef.current) return;
    
    editorRef.current.focus();
    const selection = window.getSelection();
    
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const selectedText = range.toString();
      
      if (selectedText) {
        // Create plain text node
        const textNode = document.createTextNode(selectedText);
        range.deleteContents();
        range.insertNode(textNode);
        
        // Move cursor after text
        range.setStartAfter(textNode);
        range.setEndAfter(textNode);
        selection.removeAllRanges();
        selection.addRange(range);
      } else {
        // Clear formatting of parent element
        const node = selection.anchorNode;
        if (node && node.parentNode && node.parentNode !== editorRef.current) {
          const parent = node.parentNode as HTMLElement;
          const text = parent.textContent || '';
          const textNode = document.createTextNode(text);
          parent.parentNode?.replaceChild(textNode, parent);
        }
      }
    }
    
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
      execBasicCommand('bold');
    }
    if ((e.ctrlKey || e.metaKey) && e.key === 'i') {
      e.preventDefault();
      execBasicCommand('italic');
    }
    if ((e.ctrlKey || e.metaKey) && e.key === 'u') {
      e.preventDefault();
      execBasicCommand('underline');
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
            execBasicCommand('bold');
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
            execBasicCommand('italic');
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
            execBasicCommand('underline');
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
            applyHeading('h2');
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
            applyHeading('h3');
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
            applyParagraph();
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
            toggleList(false);
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
            toggleList(true);
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
            clearFormatting();
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
