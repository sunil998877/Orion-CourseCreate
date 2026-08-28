import { getOpenAIClient, isOpenAIConfigured } from '../../utils/openaiClient.js';
import { escapeHtml } from './html.js';
export const processContentWithImages = async (html) => {
    const imageTagRegex = /\[GENERATE_IMAGE:\s*(.+?)\]/g;
    const matches = [...html.matchAll(imageTagRegex)];
    if (matches.length === 0)
        return html;
    if (!isOpenAIConfigured()) {
        return html.replace(imageTagRegex, '');
    }
    const openai = getOpenAIClient();
    let result = html;
    for (const match of matches) {
        const [fullTag, description] = match;
        try {
            const response = await openai.images.generate({
                model: 'dall-e-3',
                prompt: description,
                n: 1,
                size: '1024x1024',
            });
            const imageUrl = response.data[0]?.url;
            if (imageUrl) {
                const imgHtml = `<figure class="generated-image"><img src="${imageUrl}" alt="${escapeHtml(description)}" style="max-width:100%;height:auto;border-radius:8px;" /><figcaption style="text-align:center;font-style:italic;color:#64748b;margin-top:8px;">${escapeHtml(description)}</figcaption></figure>`;
                result = result.replace(fullTag, imgHtml);
            }
            else {
                result = result.replace(fullTag, '');
            }
        }
        catch (err) {
            console.error('Failed to generate image:', err?.message || err);
            result = result.replace(fullTag, '');
        }
    }
    return result;
};
