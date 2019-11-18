const path = require('path');
const Compiler = require('./compiler.js');
var bs = require('browser-sync').create('devServer');

console.log('Performing initial build...');
let comp = new Compiler({});
comp.compile();

console.log('Starting server...');
bs.init({
	server: [comp.outputPath, comp.rootPrefix],
});

function recompileTemplate(fp, subdir) {
	let type = path.extname(fp);
	let baseName = path.basename(fp, type);
	console.log(baseName);
	let name = subdir ? path.join(subdir, baseName) : baseName;
	let page = comp.siteData.filter((e) => e.name === name)[0];
	comp.template(page);
}

paths = {
	templates: path.join(comp.rootPrefix, comp.dirs.temps, '*'),
	css: path.join(comp.src.css, '*.css'),
	compiled: comp.outputPath,
	html: path.join(comp.src.html, '*'),
	blog: path.join(comp.src.html, 'blog/*.md'),
}

bs.watch(paths.templates).on('change', () => comp.html());
bs.watch(paths.css).on('change', (path) => bs.reload(path));
bs.watch(paths.html).on('change', (path) => recompileTemplate(path));
bs.watch(paths.blog).on('change', (path) => recompileTemplate(path, 'blog'));
bs.watch(paths.compiled).on('change', (path) => bs.reload(path));

process.on('SIGINT', function() {
    console.log('\nCleanining up...');
	comp.clean();
	console.log('Buh bye 👋');
    process.exit();
});