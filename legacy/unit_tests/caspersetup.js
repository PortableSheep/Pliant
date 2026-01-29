if (casper.options.clientScripts.indexOf('Example/jquery-1.9.1.min.js') == -1) {
	casper.options.clientScripts.push('Example/jquery-1.9.1.min.js');
	casper.options.clientScripts.push('jquery.pliant.min.js');
	casper.options.clientScripts.push('plugins/pl.decorator.min.js');
	casper.options.clientScripts.push('plugins/pl.htmlrules.min.js');
	casper.options.clientScripts.push('plugins/pl.inputhint.min.js');
	casper.options.clientScripts.push('plugins/pl.inputsuccess.min.js');
	casper.options.clientScripts.push('plugins/pl.utils.min.js');
}
// casper.test.on('fail', function() {
// 	casper.capture('default-fail.png');
// 	casper.exit(1);
// });