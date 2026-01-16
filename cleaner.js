const fs = require('fs');
const path = require('path');
const vm = require('vm');

const cleanFile = (filePath) => {
    try {
        console.log(`Limpando rodapés de: ${filePath}`);
        const fileContent = fs.readFileSync(filePath, 'utf8');
        const bookAbbreviation = path.basename(filePath, '.js');

        const genericPrefixMatch = fileContent.match(/window\.bibleData\[.*?\] = /);
        if (!genericPrefixMatch) {
            console.log(` -> Nenhum prefixo 'window.bibleData' encontrado. Pulando arquivo.`);
            return;
        }
        
        const actualPrefix = genericPrefixMatch[0];
        let objectString = fileContent.substring(fileContent.indexOf(actualPrefix) + actualPrefix.length).trim();

        if (objectString.endsWith(';')) {
            objectString = objectString.slice(0, -1);
        }

        const context = {};
        vm.createContext(context);
        vm.runInContext(`data = ${objectString}`, context);
        const bibleData = context.data;
        
        let modified = false;
        for (const chapterNum in bibleData) {
            if (typeof bibleData[chapterNum] === 'string') {
                const chapterHtml = bibleData[chapterNum];
                const hrIndex = chapterHtml.indexOf('<hr>');
                
                if (hrIndex !== -1) {
                    bibleData[chapterNum] = chapterHtml.substring(0, hrIndex).trim();
                    modified = true;
                }
            }
        }

        if (modified) {
            const finalObjectString = JSON.stringify(bibleData, null, 2);
            const finalFileContent = `${actualPrefix}${finalObjectString};`;
            fs.writeFileSync(filePath, finalFileContent, 'utf8');
            console.log(` -> Rodapés removidos e arquivo salvo: ${filePath}`);
        } else {
            console.log(` -> Nenhum rodapé encontrado para limpar.`);
        }

    } catch (error) {
        console.error(`ERRO ao limpar o arquivo ${filePath}:`, error.message);
    }
};

const directoryPath = process.argv[2];
if (!directoryPath) {
    console.error('Especifique o caminho do diretório. Ex: node cleaner.js js/content');
    process.exit(1);
}

try {
    const stats = fs.statSync(directoryPath);
    if (stats.isDirectory()) {
        const files = fs.readdirSync(directoryPath);
        files.forEach(file => {
            const fullPath = path.join(directoryPath, file);
            if (fs.statSync(fullPath).isFile() && path.extname(fullPath) === '.js') {
                cleanFile(fullPath);
            }
        });
        console.log('\nLimpeza de rodapés concluída!');
    } else {
        console.error('O caminho especificado não é um diretório válido.');
        process.exit(1);
    }
} catch (error) {
    console.error(`Erro ao acessar o diretório: ${directoryPath}`, error);
    process.exit(1);
}