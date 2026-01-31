export const generateReply = async (text, context) => {
    return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage(
            {
                type: 'GENERATE_REPLY',
                payload: { text, context }
            },
            (response) => {
                if (chrome.runtime.lastError) {
                    reject(chrome.runtime.lastError);
                } else if (response && response.error) {
                    reject(response.error);
                } else {
                    resolve(response.data);
                }
            }
        );
    });
};
