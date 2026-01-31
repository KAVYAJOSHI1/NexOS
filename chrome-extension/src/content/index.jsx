import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { generateReply } from '../utils/api';
import './index.css'; // Import new styles

const NexOSOverlay = () => {
    const [activeElement, setActiveElement] = useState(null);
    const [position, setPosition] = useState({ top: 0, left: 0 });
    const [showButton, setShowButton] = useState(false);
    const [loading, setLoading] = useState(false);
    const buttonRef = useRef(null);

    const [modalText, setModalText] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [floatingPos, setFloatingPos] = useState(null);
    const lastActiveRef = useRef(null);
    const [toast, setToast] = useState(null); // { message, type }

    const showToast = (message, type = 'info') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    useEffect(() => {
        const handleFocus = (event) => {
            const target = event.target;
            const isInput = target.tagName === 'INPUT' && (
                target.type === 'text' || target.type === 'search' ||
                target.type === 'email' || target.type === 'url'
            );
            const isTextarea = target.tagName === 'TEXTAREA';
            const isContentEditable = target.isContentEditable || target.closest('[contenteditable="true"]');

            if (isInput || isTextarea || isContentEditable) {
                const actualElement = isContentEditable ? (target.closest('[contenteditable="true"]') || target) : target;
                setActiveElement(actualElement);
                lastActiveRef.current = actualElement;
                updatePosition(actualElement);
                setShowButton(true);
            }
        };

        const handleBlur = () => {
            // Delay hide to allow clicks
            setTimeout(() => {
                if (buttonRef.current && !buttonRef.current.contains(document.activeElement)) {
                    setShowButton(false);
                }
            }, 200);
        };

        const handleMouseUp = () => {
            const selection = window.getSelection();
            if (selection && selection.toString().trim().length > 0) {
                const range = selection.getRangeAt(0);
                const rect = range.getBoundingClientRect();
                setFloatingPos({
                    top: rect.top + window.scrollY - 50,
                    left: rect.left + window.scrollX + (rect.width / 2) - 40
                });
            } else {
                setFloatingPos(null);
            }
        };

        const handleMessage = (request) => {
            if (request.type === 'INSERT_REPLY') {
                if (lastActiveRef.current) {
                    setModalText(request.text);
                    setShowModal(true);
                } else {
                    showToast("Click a text box first!", "error");
                }
            }
        };

        chrome.runtime.onMessage.addListener(handleMessage);
        document.addEventListener('focusin', handleFocus);
        document.addEventListener('mouseup', handleMouseUp);

        return () => {
            document.removeEventListener('focusin', handleFocus);
            document.removeEventListener('mouseup', handleMouseUp);
            chrome.runtime.onMessage.removeListener(handleMessage);
        };
    }, []);

    const updatePosition = (element) => {
        const rect = element.getBoundingClientRect();
        setPosition({
            top: rect.bottom + window.scrollY + 8,
            left: rect.right + window.scrollX - 40
        });
    };

    // --- CORE LOGIC: REWRITE MODE (Button near input) ---
    const handleRewriteClick = async (e) => {
        e.preventDefault(); e.stopPropagation();
        if (!activeElement) return;

        setLoading(true);
        try {
            let currentText = activeElement.value !== undefined ? activeElement.value : activeElement.innerText;
            if (!currentText.trim()) {
                showToast("Type something first!", "error");
                return;
            }

            // INSTRUCTION: REWRITE
            const persona = "\n\n[SYSTEM: You are currently 'Writing Mode'. The user has drafted a message. Your job is to POLISH it. Fix grammar, make it sound smarter and more casual. Do not change the meaning. Same meaning, better english. Tone: Digital Native, Tech-Savvy.]";
            const response = await generateReply("REWRITE THIS DRAFT: " + currentText, "User Draft" + persona);

            setModalText(response.reply || response.text || "Could not rewrite.");
            setShowModal(true);
        } catch (err) {
            console.error(err);
            showToast("Failed to rewrite.", "error");
        } finally {
            setLoading(false);
        }
    };

    // --- CORE LOGIC: REPLY MODE (Floating Button) ---
    const handleReplyClick = async (e) => {
        e.preventDefault(); e.stopPropagation();
        const selectionText = window.getSelection().toString();
        if (!selectionText) return;

        setLoading(true);
        try {
            // INSTRUCTION: REPLY
            const persona = "\n\n[SYSTEM: You are currently 'Reply Mode'. The user selected a message they received. Your job is to write a REPLY to it. Reply as 'I' (Kavya). Tone: Casual, confident, use tech slang like 'lgtm', 'shipping'. Be concise.]";
            const response = await generateReply("REPLY TO THIS MESSAGE: " + selectionText, "Incoming Message" + persona);

            setModalText(response.reply || response.text || "Could not generate reply.");
            setShowModal(true);
            setFloatingPos(null);
        } catch (err) {
            console.error(err);
            showToast("Failed to reply.", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleInsert = () => {
        const target = activeElement || lastActiveRef.current;
        if (target) {
            if (target.value !== undefined) {
                target.value = modalText;
            } else {
                target.innerText = modalText;
            }
            target.dispatchEvent(new Event('input', { bubbles: true }));
            setShowModal(false);
            showToast("Inserted!", "success");
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(modalText);
        setShowModal(false);
        showToast("Copied!", "success");
    };

    const handleClose = () => setShowModal(false);

    return (
        <>
            {/* TOAST NOTIFICATION */}
            {toast && (
                <div className={`nexos-toast ${toast.type}`}>
                    {toast.message}
                </div>
            )}

            {/* REWRITE BUTTON (Near Input) */}
            {showButton && (
                <div
                    ref={buttonRef}
                    className="nexos-floating-container"
                    style={{ top: position.top, left: position.left }}
                    onMouseDown={e => e.preventDefault()}
                >
                    <button onClick={handleRewriteClick} className="nexos-btn-primary">
                        {loading ? <span className="nexos-spinner"></span> : '✨ Rewrite'}
                    </button>
                </div>
            )}

            {/* REPLY BUTTON (Floating on Selection) */}
            {floatingPos && (
                <div
                    className="nexos-floating-container animate-pop"
                    style={{ top: floatingPos.top, left: floatingPos.left }}
                    onMouseDown={e => e.preventDefault()}
                >
                    <button onClick={handleReplyClick} className="nexos-btn-accent">
                        {loading ? <span className="nexos-spinner"></span> : '💬 Reply'}
                    </button>
                </div>
            )}

            {/* PREVIEW MODAL */}
            {showModal && (
                <div className="nexos-modal-overlay">
                    <div className="nexos-modal-glass">
                        <div className="nexos-modal-header">
                            <h3>✨ NexOS AI</h3>
                            <button onClick={() => setShowModal(false)} className="nexos-close-btn">×</button>
                        </div>
                        <textarea
                            value={modalText}
                            onChange={(e) => setModalText(e.target.value)}
                            className="nexos-textarea"
                            placeholder="AI Output..."
                        />
                        <div className="nexos-modal-actions">
                            <button onClick={() => setShowModal(false)} className="nexos-btn-ghost">Discard</button>
                            <button onClick={handleCopy} className="nexos-btn-secondary">Copy</button>
                            <button onClick={handleInsert} className="nexos-btn-primary">Insert</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

// Mount the app
const rootDiv = document.createElement('div');
rootDiv.id = 'nexos-extension-root';
document.body.appendChild(rootDiv);

const root = createRoot(rootDiv);
root.render(<NexOSOverlay />);
