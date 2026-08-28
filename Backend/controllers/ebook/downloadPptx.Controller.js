import Course from '../../models/courseModel.js';
const GAMMA_API_KEY = process.env.GAMMA_API_KEY;
export const downloadPptx = async (req, res) => {
    try {
        const { courseId, moduleNumber } = req.params;
        const course = await Course.findOne({ userId: req.user.id, courseId: String(courseId) });
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }
        const mod = course.modules.find(m => Number(m.moduleNumber) === Number(moduleNumber));
        if (!mod || !mod.gammaGenerationId) {
            return res.status(404).json({ message: 'Gamma generation ID not found for this module.' });
        }
        if (!GAMMA_API_KEY) {
            return res.status(503).json({ message: 'Gamma API key not configured' });
        }
        const statusRes = await fetch(`https://public-api.gamma.app/v1.0/generations/${mod.gammaGenerationId}`, { headers: { 'X-API-KEY': GAMMA_API_KEY } });
        if (!statusRes.ok) {
            throw new Error(`Failed to fetch Gamma status: ${statusRes.status}`);
        }
        let statusData = await statusRes.json();
        console.log("Gamma Proxy Status Response:", JSON.stringify(statusData, null, 2));
        let downloadUrl = statusData.exportUrl ||
            statusData.downloadLink ||
            statusData.download_url ||
            statusData.export_url ||
            statusData.output?.exportUrl ||
            statusData.output?.export_url ||
            statusData.output?.downloadLink ||
            statusData.output?.download_url ||
            (statusData.exports && statusData.exports.find(e => e.format === 'pptx')?.url) ||
            (statusData.exports && statusData.exports[0]?.url);
        if (!downloadUrl) {
            console.log("No download URL found in status. Triggering fresh PPTX export for ID:", mod.gammaGenerationId);
            const exportRes = await fetch(`https://public-api.gamma.app/v1.0/generations/${mod.gammaGenerationId}/exports`, {
                method: 'POST',
                headers: {
                    'X-API-KEY': GAMMA_API_KEY,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ format: 'pptx' })
            });
            if (exportRes.ok) {
                const exportData = await exportRes.json();
                console.log("Gamma Export Response:", exportData);
                downloadUrl = exportData.exportUrl || exportData.url || exportData.downloadUrl;
                if (!downloadUrl) {
                    await new Promise(r => setTimeout(r, 3000));
                    const retryRes = await fetch(`https://public-api.gamma.app/v1.0/generations/${mod.gammaGenerationId}`, { headers: { 'X-API-KEY': GAMMA_API_KEY } });
                    if (retryRes.ok) {
                        const retryData = await retryRes.json();
                        downloadUrl = retryData.exportUrl || retryData.output?.exportUrl || (retryData.exports && retryData.exports[0]?.url);
                    }
                }
            }
        }
        if (!downloadUrl) {
            console.error("PPTX Download URL not found in Gamma response for ID:", mod.gammaGenerationId);
            return res.status(404).json({
                message: 'PPTX download link not available yet. Gamma might still be processing the export. Please wait a minute and try again.'
            });
        }
        const filename = `${course.title.replace(/[^a-z0-9]/gi, '_')}_Module_${moduleNumber}.pptx`;
        console.log('Streaming PPTX from CDN:', downloadUrl);
        const fileRes = await fetch(downloadUrl, {
            headers: {
                'User-Agent': 'CourseCreator/1.0'
            }
        });
        if (!fileRes.ok) {
            const errorText = await fileRes.text().catch(() => 'No error body');
            console.error(`[GAMMA CDN STREAM ERROR] Status: ${fileRes.status} ${fileRes.statusText}`);
            console.error(`[GAMMA CDN STREAM ERROR] Body: ${errorText}`);
            return res.status(502).json({
                message: 'Failed to fetch PPTX from Gamma CDN',
                gammaError: errorText
            });
        }
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.presentationml.presentation');
        for await (const chunk of fileRes.body) {
            res.write(chunk);
        }
        res.end();
    }
    catch (error) {
        console.error('Error proxying PPTX download:', error);
        res.status(500).json({ message: 'Failed to download PPTX' });
    }
};
