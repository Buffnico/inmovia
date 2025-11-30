const fs = require('fs');
const PizZip = require('pizzip');
const Docxtemplater = require('docxtemplater');

/**
 * Extracts unique placeholders from a DOCX file.
 * @param {string} filePath - Absolute path to the .docx file
 * @returns {string[]} - Array of unique placeholder names
 */
function extractPlaceholders(filePath) {
    if (!fs.existsSync(filePath)) {
        throw new Error("File not found");
    }

    const content = fs.readFileSync(filePath, 'binary');
    const zip = new PizZip(content);
    const doc = new Docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks: true,
    });

    const text = doc.getFullText();
    // This is a naive extraction. Docxtemplater has an inspector module but it's often simpler to just regex for {{...}}
    // However, docxtemplater's getFullText() returns the text content, but might lose the tags if they are complex.
    // Better approach: Use the inspector if available, or just regex the raw XML?
    // Docxtemplater doesn't expose a simple "getTags" method in v3 without modules.
    // But we can use the 'inspect' module if we had it. We don't want to add dependencies if possible.

    // Alternative: Regex on the raw XML content of document.xml.
    // But PizZip gives us access to files.

    // Let's try a simpler approach using a regex on the FullText is NOT reliable because tags might be split across runs.
    // But docxtemplater *resolves* tags.

    // Let's use a known method for docxtemplater to inspect tags.
    // Since we can't easily add the inspector module right now without npm install, 
    // and the user asked for a "helper... Use docxtemplater to extract tags".

    // Actually, docxtemplater throws an error if tags are invalid.
    // To get tags, we can parse the template.
    // doc.setData({}); doc.render(); will throw if tags are missing? No, it just replaces with empty if configured.

    // Let's look at how we can get the vars.
    // There is a standard way:
    // const inspect = require("docxtemplater/js/inspect"); // This is usually a separate package or internal.

    // Let's try a regex on the raw XML. It's 90% effective for simple {{tag}} placeholders.
    // zip.files['word/document.xml'].asText()

    const docXml = zip.files['word/document.xml'].asText();
    // Regex to find {{...}}
    // Note: Word often splits text into multiple <w:t> elements. {{name}} might become <w:t>{</w:t><w:t>{name</w:t>...
    // Docxtemplater handles this.
    // If we want to be accurate, we should let docxtemplater parse it.

    // Since I cannot easily add new packages, I will use a simplified regex approach on the *binary* or *text*?
    // Actually, docxtemplater v3 has a method to get undefined tags if we render with empty data?
    // No, that's tricky.

    // Let's try to use the regex on the raw XML, but cleaning up XML tags first?
    // No, that's hard.

    // Let's stick to the requirement: "Use docxtemplater to extract tags".
    // If I can't do it easily with the current version, I'll do a best-effort regex on the `doc.getFullText()`.
    // `doc.getFullText()` returns the text as seen by the user. So `{{name}}` should appear as `{{name}}`.
    // This works if the user typed it cleanly.

    const matches = text.match(/{{[a-zA-Z0-9_]+}}/g);
    if (!matches) return [];

    const uniqueTags = [...new Set(matches.map(m => m.replace(/{{|}}/g, '')))];

    // Filter out internal or reserved tags if any (though user said filter clausulas_extra etc)
    const reserved = ['clausulas_extra']; // We can add more if needed
    return uniqueTags.filter(t => !reserved.includes(t) && !t.startsWith('clausula_'));
}

module.exports = {
    extractPlaceholders
};
