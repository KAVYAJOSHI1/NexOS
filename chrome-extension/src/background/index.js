const N8N_WEBHOOK_URL = 'http://127.0.0.1:5678/webhook/reply';

// Setup Context Menu
chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: "generate-reply",
        title: "NexOS Reply",
        contexts: ["selection"]
    });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "generate-reply" && info.selectionText) {
        // Send selected text to n8n
        handleGenerateReply({ text: info.selectionText, context: "Reply to this message" })
            .then(data => {
                // Determine text to insert
                const replyText = data.reply || data.text || (data[0] && (data[0].reply || data[0].text)) || "No reply generated";

                // Send back to content script to insert
                chrome.tabs.sendMessage(tab.id, {
                    type: 'INSERT_REPLY',
                    text: replyText
                }).catch(err => {
                    // Ignore "Receiving end does not exist" errors - usually means page needs refresh
                    console.log("Could not send reply to page (likely needs refresh):", err);
                });
            })
            .catch(err => {
                console.error("Context Menu Error", err);
                // Try to alert user, but ignore if it fails
                chrome.tabs.sendMessage(tab.id, {
                    type: 'INSERT_REPLY',
                    text: `Error: ${err.message}`
                }).catch(() => { });
            });
    }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'GENERATE_REPLY') {
        handleGenerateReply(message.payload)
            .then(data => sendResponse({ data }))
            .catch(error => sendResponse({ error: error.message }));
        return true; // Keep channel open for async response
    }
});

async function handleGenerateReply({ text, context }) {
    try {
        const response = await fetch(N8N_WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ text, context })
        });

        if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
        }

        const json = await response.json();
        return json;
    } catch (error) {
        console.error('N8N Fetch Error:', error);
        throw error;
    }
}

console.log('NexOS Background Service Worker Ready');
