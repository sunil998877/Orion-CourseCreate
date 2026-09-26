export const proxyHeyGenMedia = async (req, res) => {
    try {
        const mediaUrl = req.query.url;
        if (!mediaUrl || !mediaUrl.startsWith('http')) {
            return res.status(400).send('Valid url query parameter is required');
        }

        const response = await fetch(mediaUrl);
        if (!response.ok) {
            return res.status(response.status).send(`Failed to fetch media: ${response.statusText}`);
        }

        const contentType = response.headers.get('content-type') || 'video/mp4';
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Content-Type', contentType);
        res.setHeader('Cache-Control', 'public, max-age=604800, immutable');

        const arrayBuffer = await response.arrayBuffer();
        return res.send(Buffer.from(arrayBuffer));
    } catch (err) {
        console.error('Error proxying media:', err);
        return res.status(500).send('Error proxying media');
    }
};
