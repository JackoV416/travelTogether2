
import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import {
    Bold, Italic, Underline as UnderlineIcon, Strikethrough,
    AlignLeft, AlignCenter, AlignRight, AlignJustify,
    List, ListOrdered, Quote, Undo, Redo, Link as LinkIcon,
    Heading1, Heading2, Check
} from 'lucide-react';

export const TripDocsMenuBar = ({ editor, className, buttonClassName }) => {
    // If no editor/skeleton mode, we use a dummy interface to show disabled buttons
    const isSkeleton = !editor;

    const buttons = [
        { icon: Bold, action: () => editor?.chain().focus().toggleBold().run(), active: 'bold', title: '粗體 (Cmd+B)' },
        { icon: Italic, action: () => editor?.chain().focus().toggleItalic().run(), active: 'italic', title: '斜體 (Cmd+I)' },
        { icon: UnderlineIcon, action: () => editor?.chain().focus().toggleUnderline().run(), active: 'underline', title: '底線 (Cmd+U)' },
        { icon: Strikethrough, action: () => editor?.chain().focus().toggleStrike().run(), active: 'strike', title: '刪除線' },
        { type: 'divider' },
        { icon: Heading1, action: () => editor?.chain().focus().toggleHeading({ level: 1 }).run(), active: { level: 1 }, title: '標題 1' },
        { icon: Heading2, action: () => editor?.chain().focus().toggleHeading({ level: 2 }).run(), active: { level: 2 }, title: '標題 2' },
        { type: 'divider' },
        { icon: AlignLeft, action: () => editor?.chain().focus().setTextAlign('left').run(), active: { textAlign: 'left' }, title: '靠左' },
        { icon: AlignCenter, action: () => editor?.chain().focus().setTextAlign('center').run(), active: { textAlign: 'center' }, title: '置中' },
        { icon: AlignRight, action: () => editor?.chain().focus().setTextAlign('right').run(), active: { textAlign: 'right' }, title: '靠右' },
        { type: 'divider' },
        { icon: List, action: () => editor?.chain().focus().toggleBulletList().run(), active: 'bulletList', title: '項目符號' },
        { icon: ListOrdered, action: () => editor?.chain().focus().toggleOrderedList().run(), active: 'orderedList', title: '編號列表' },
        { icon: Quote, action: () => editor?.chain().focus().toggleBlockquote().run(), active: 'blockquote', title: '引用' },
        { type: 'divider' },
        { icon: Undo, action: () => editor?.chain().focus().undo().run(), disabled: !editor?.can().undo(), title: '復原 (Cmd+Z)' },
        { icon: Redo, action: () => editor?.chain().focus().redo().run(), disabled: !editor?.can().redo(), title: '重做 (Cmd+Shift+Z)' },
    ];

    return (
        <div className={className || "flex items-center gap-1 p-2 bg-gray-50 dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 flex-wrap sticky top-0 z-10"}>
            {buttons.map((btn, idx) => (
                btn.type === 'divider' ? (
                    <div key={idx} className="w-[1px] h-6 bg-gray-300 dark:bg-gray-600 mx-1" />
                ) : (
                    <button
                        key={idx}
                        onClick={isSkeleton ? undefined : btn.action}
                        disabled={isSkeleton || btn.disabled}
                        title={btn.title}
                        className={`p-1.5 rounded-lg transition-all ${!isSkeleton && btn.active && (typeof btn.active === 'string' ? editor.isActive(btn.active) : editor.isActive(btn.active.level ? 'heading' : 'textAlign', btn.active))
                            ? 'bg-indigo-500 text-white shadow-sm'
                            : (buttonClassName || 'text-gray-600 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/10')
                            } disabled:opacity-75 disabled:cursor-not-allowed`}
                    >
                        <btn.icon className="w-4 h-4" />
                    </button>
                )
            ))}
        </div>
    );
};

const TripDocsEditor = ({ content, onChange, editable = true, hideToolbar = false, onEditorReady, placeholder = '在此輸入內容... (支援 Markdown 快捷鍵)' }) => {
    const editor = useEditor({
        extensions: [
            StarterKit,
            TextAlign.configure({ types: ['heading', 'paragraph'] }),
            Placeholder.configure({ placeholder })
        ],
        content: content || '',
        editable: editable,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
        onFocus: ({ editor }) => {
            if (onEditorReady) onEditorReady(editor);
        },
        onSelectionUpdate: ({ editor }) => {
            if (onEditorReady) onEditorReady(editor);
        },
        editorProps: {
            attributes: {
                class: 'prose prose-sm sm:prose-base dark:prose-invert max-w-none focus:outline-none min-h-[100px] p-4'
            }
        }
    });

    // V1.7.6: Improved content sync to prevent cursor jumping
    React.useEffect(() => {
        if (editor && content !== undefined) {
            const currentHTML = editor.getHTML();
            if (content !== currentHTML) {
                // Only update if it's a completely different content (like switching items)
                // We use a simple length/content check to avoid micro-updates while typing
                if (Math.abs(content.length - currentHTML.length) > 20 || content === '' || currentHTML === '<p></p>') {
                    editor.commands.setContent(content || '', false);
                }
            }
        }
    }, [content, editor]);

    return (
        <div className="flex flex-col bg-transparent cursor-text" onClick={() => editor?.chain().focus().run()}>
            {editable && !hideToolbar && <TripDocsMenuBar editor={editor} />}
            <div className="overflow-y-auto max-h-[500px] custom-scrollbar bg-transparent cursor-text">
                <EditorContent editor={editor} />
            </div>
        </div>
    );
};

export default TripDocsEditor;
