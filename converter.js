const fs = require('fs');
const path = require('path');
const vm = require('vm');

const processFile = (filePath) => {
    try {
        console.log(`Processando: ${filePath}`);
        const fileContent = fs.readFileSync(filePath, 'utf8');
        const bookAbbreviation = path.basename(filePath, '.js');

        // Encontra a primeira atribuição a window.bibleData no arquivo
        const genericPrefixMatch = fileContent.match(/window\.bibleData\[.*?\] = /);
        if (!genericPrefixMatch) {
            throw new Error(`Formato de atribuição 'window.bibleData' não encontrado.`);
        }
        
        const actualPrefix = genericPrefixMatch[0];
        let objectString = fileContent.substring(fileContent.indexOf(actualPrefix) + actualPrefix.length).trim();

        if (objectString.endsWith(';')) {
            objectString = objectString.slice(0, -1);
        }

        const context = {};
        vm.createContext(context);
        vm.runInContext(`data = ${objectString}`, context);
        const rawData = context.data;
        
        let bookName = bookAbbreviation;
        const h1Match = fileContent.match(/<h1>(.*?) -/);
        if (h1Match && h1Match[1]) {
            bookName = h1Match[1].trim();
        }

        const chapters = [];
        for (const chapterNum in rawData) {
            if (isNaN(parseInt(chapterNum))) continue;

            const chapterHtml = rawData[chapterNum];
            const contentWithoutH1 = chapterHtml.replace(/<h1>.*?<\/h1>/, '');
            const verseHtmls = contentWithoutH1.split('</p>').filter(p => p.trim().length > 0);

            const verses = verseHtmls
                .map(verseHtml => {
                    const cleanText = verseHtml.replace(/<[^>]*>/g, '').trim();
                    const numberMatch = cleanText.match(/^(\d+)\s*/);
                    if (numberMatch && numberMatch[1]) {
                        const verseNumber = parseInt(numberMatch[1], 10);
                        const verseText = cleanText.replace(/^\d+\s*/, '').trim();
                        if (verseText) {
                            return { verse: verseNumber, text: verseText };
                        }
                    }
                    return null;
                })
                .filter(v => {
                    if (v === null || !v.text) return false;
                    if (/^[\d\s\r\n]+$/.test(v.text.trim())) return false;
                    return true;
                });

            chapters.push({
                chapter: parseInt(chapterNum, 10),
                verses: verses
            });
        }
        
        const outputData = {
            book: bookAbbreviation,
            name: bookName,
            chapters: chapters,
        };

        const outputDir = path.join(process.cwd(), 'output');
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir);
        }
        const outputFilePath = path.join(outputDir, `${bookAbbreviation}.js`);
        const outputFileContent = `if (typeof window.bibleData === 'undefined') { window.bibleData = {}; } window.bibleData['${bookAbbreviation}'] = ${JSON.stringify(outputData, null, 2)};`;
        fs.writeFileSync(outputFilePath, outputFileContent, 'utf8');
        console.log(` -> Salvo em: ${outputFilePath}`);

    } catch (error) {
        console.error(`ERRO ao processar ${filePath}:`, error.message);
    }
};

const inputPath = process.argv[2];
if (!inputPath) {
    console.error('Especifique um arquivo ou diretório de entrada.');
    process.exit(1);
}

try {
    const stats = fs.statSync(inputPath);
    if (stats.isDirectory()) {
        const files = fs.readdirSync(inputPath);
        files.forEach(file => {
            if (path.extname(file).toLowerCase() === '.js') {
                processFile(path.join(inputPath, file));
            }
        });
        console.log('\nProcessamento concluído!');
    } else if (stats.isFile()) {
        processFile(inputPath);
    }
} catch (error) {
    console.error(`Erro ao acessar o caminho: ${inputPath}`, error);
    process.exit(1);
}
