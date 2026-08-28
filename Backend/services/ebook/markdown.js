export const renderMarkdown = (text = '') => {
    if (!text)
        return '';
    const lines = String(text)
        .split('\n')
        .map(l => l.trimEnd());
    const html = [];
    let i = 0;
    const inlineFormat = (s) => s
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*([^*]+?)\*/g, '<em>$1</em>')
        .replace(/`([^`]+?)`/g, '<code>$1</code>');
    while (i < lines.length) {
        const line = lines[i];
        const trimmed = line.trim();
        if (!trimmed) {
            i++;
            continue;
        }
        if (/^-{3,}$/.test(trimmed) || /^={3,}$/.test(trimmed)) {
            html.push('<hr class="section-divider" />');
            i++;
            continue;
        }
        if (/^## /.test(trimmed)) {
            html.push(`<h3 class="md-h3">${inlineFormat(trimmed.replace(/^## /, ''))}</h3>`);
            i++;
            continue;
        }
        if (/^### /.test(trimmed)) {
            html.push(`<h4 class="md-h4">${inlineFormat(trimmed.replace(/^### /, ''))}</h4>`);
            i++;
            continue;
        }
        if (/^\|/.test(trimmed)) {
            const tableRows = [];
            while (i < lines.length && /^\|/.test(lines[i].trim())) {
                tableRows.push(lines[i].trim());
                i++;
            }
            const dataRows = tableRows.filter(r => !/^\|[-:\s|]+\|?$/.test(r));
            if (dataRows.length >= 2) {
                const headerCells = dataRows[0].split('|').filter((_, ci) => ci > 0 && ci < dataRows[0].split('|').length - 1);
                const bodyRows = dataRows.slice(1);
                html.push('<div class="table-wrapper"><table class="md-table">');
                html.push('<thead><tr>');
                headerCells.forEach(cell => html.push(`<th>${inlineFormat(cell.trim())}</th>`));
                html.push('</tr></thead><tbody>');
                bodyRows.forEach(row => {
                    const cells = row.split('|').filter((_, ci) => ci > 0 && ci < row.split('|').length - 1);
                    html.push('<tr>');
                    cells.forEach(cell => html.push(`<td>${inlineFormat(cell.trim())}</td>`));
                    html.push('</tr>');
                });
                html.push('</tbody></table></div>');
            }
            else if (dataRows.length === 1) {
                html.push(`<p class="md-p">${inlineFormat(dataRows[0].replace(/\|/g, ' | '))}</p>`);
            }
            continue;
        }
        if (/^[*\-] /.test(trimmed)) {
            const items = [];
            while (i < lines.length && /^[*\-] /.test(lines[i].trim())) {
                items.push(`<li>${inlineFormat(lines[i].trim().replace(/^[*\-] /, ''))}</li>`);
                i++;
            }
            html.push(`<ul class="md-ul">${items.join('')}</ul>`);
            continue;
        }
        if (/^\d+\.\s/.test(trimmed)) {
            const items = [];
            while (i < lines.length && /^\d+\.\s/.test(lines[i].trim())) {
                items.push(`<li>${inlineFormat(lines[i].trim().replace(/^\d+\.\s/, ''))}</li>`);
                i++;
            }
            html.push(`<ol class="md-ol">${items.join('')}</ol>`);
            continue;
        }
        const paraLines = [];
        while (i < lines.length &&
            lines[i].trim() &&
            !/^[*\-] /.test(lines[i].trim()) &&
            !/^\d+\.\s/.test(lines[i].trim()) &&
            !/^#+\s/.test(lines[i].trim()) &&
            !/^\|/.test(lines[i].trim()) &&
            !/^-{3,}$/.test(lines[i].trim())) {
            paraLines.push(lines[i].trim());
            i++;
        }
        if (paraLines.length) {
            html.push(`<p class="md-p">${inlineFormat(paraLines.join(' '))}</p>`);
        }
    }
    return html.join('');
};
