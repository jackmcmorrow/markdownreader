/*
MARKDOWN READER

@by cav_dan <daniel@shinka.com.br>

TODO:
	- Sync when original file is modified (like http://marked2app.com/)
	- Create a simpler dialog open/close systen
*/


//View MarkDown Object
vmd = {};

vmd.element = document.getElementById('viewer');
vmd.maxFileSize = 5; //mb

vmd.update = function(markdownTxt)
{
	vmd.element.innerHTML = markdown.toHTML(markdownTxt);
}

vmd.load = function (fileEntry)
{
	window.globalFile = fileEntry;
	fileEntry.file(function(file) 
	{
		var reader = new FileReader();
		
		reader.readAsText(file); //Fires loadstart();

		reader.onloadend = function() {
			vmd.html = reader.result;
			vmd.update(vmd.html);
			btnExport.disabled = false;
			btnPrint.disabled = false;
			return vmd.html;
		};

	});
}

//	$()
//  not jquery, but enough for me!
//	@args
//		string selector -> a css like selector.
//			returns single object OR array of objects
var $ = function(selector) {
	var selectorResults = document.querySelectorAll(selector)
	return selectorResults.length > 1 ? selectorResults : selectorResults[0];
}

// $each()
//	@args 
//		arrayOfElements -> self explanatory
//		whatToDo(element) -> function with element as arg.
// ex: $(arrayOfItems, function(el) {
//			el.style.display = 'none'; //
//		})
var $each = function(arrayOfElements, whatToDo)
{
	for (var el = arrayOfElements.length - 1; el >= 0; el--) {
		whatToDo(arrayOfElements[el]);
	};
}

//Drag and Drop file

var dnd = new DnDFileController('html', function(data) {
  var fileEntry = data.items[0].webkitGetAsEntry();
  //console.info(fileEntry);
  vmd.load(fileEntry);
});

//Load via button
var btnLoadFile = $('#btnLoadFile');
btnLoadFile.onclick = function()
{
	chrome.fileSystem.chooseEntry(
		{
			type: "openFile",
			accepts: [
				{
					description: "Markdown Files (*.md, *.txt)",
					mimeTypes:  ["text/md", "text/txt"],
					extensions: ["md", "txt"]
				}
			],
			acceptsAllTypes: true,
			acceptsMultiple: false
		}, 
		
		function(fileEntry)
		{
			vmd.load(fileEntry[0])
		}
	);
};

//modais
var modais = $('.modal');

//Export to HTML
var btnExport = $('#btnExport'),
	modalExport = $("#modalExport"),
	btnCopyAll = $("#btnCopyAll"),
	btnSaveToFile = $("#btnSaveToFile"),
	btnCloseExportModal = $("#closeExportModal"),
	exportArea = document.forms.export.exportArea;

btnExport.onclick = function()
{
	$each(modais, function(modal) {
		modal.style.display = 'none';
	});

	exportArea.value = vmd.element.innerHTML;
	modalExport.style.display = 'block';
	btnCloseExportModal.onclick = function()
	{
		modalExport.style.display = 'none';
	}
}

btnCopyAll.onclick = function()
{
	exportArea.focus();
	document.execCommand("SelectAll");
	document.execCommand("Copy");
}

btnSaveToFile.onclick = function()
{
	chrome.fileSystem.chooseEntry(
		{
			type: "saveFile",
			suggestedName: globalFile.name.substring(0, globalFile.name.indexOf('.md') || globalFile.name.length) + '.html'
		}, 
		
		function(fileEntry)
		{
			//console.log(fileEntry);
			fileEntry.file(function(file){
				//console.log(file);

				var writer = fileEntry.createWriter(function(w){
					//console.log(w);
					w.onwriteend = function(){
						//console.log("File saved!")
					}

					var htmlFile = '<!DOCTYPE html> <html lang="en"> <head> <meta charset="UTF-8"> <title>View Markdown</title>';
						htmlFile += '<style>';
						htmlFile += $('#vmdTheme').innerHTML;
						htmlFile += '</style>';
						htmlFile += '</head><body>';
						htmlFile += exportArea.value
						htmlFile += '</body>';
					w.write(new Blob(
						[htmlFile],
						{type: 'text/plain'}
					));

				});

			});
			
		}
	);
}

//Import Markdown
var btnImport = $('#btnImport'),
	modalImport = $("#modalImport"),
	//btnPaste = $("#btnPaste"),
	btnUpdateViewer = $("#btnUpdateViewer"),
	btnCloseImportModal = $("#closeImportModal"),
	importArea = document.forms.import.importArea;

btnImport.onclick = function()
{
	$each(modais, function(modal) {
		modal.style.display = 'none';
	});

	modalImport.style.display = 'block';
	btnCloseImportModal.onclick = function()
	{
		modalImport.style.display = 'none';
	}
}

btnUpdateViewer.onclick = function()
{
	vmd.update(importArea.value);
	modalImport.style.display = 'none';
}

//Print
var btnPrint = $('#btnPrint');

btnPrint.onclick = function()
{
	$each(modais, function(modal) {
		modal.style.display = 'none';
	});

	window.print();
}

//UI Config
var modalConfig = $('#modalConfig'),
	btnOpenConfigModal = $('#openConfigModal'),
	btnCloseConfigModal = $('#closeConfigModal'),
	btnApplyConfigModal = $('#applyConfigs'),
	configInputs = $("#config input, #config select");

configs = {
	theme: 0,
	fontSize: 13,
	lineHeight: 1.8
}

document.forms.config.theme[configs.theme].selected = "selected";
document.forms.config.fontSize.value = configs.fontSize;
document.forms.config.lineHeight.value = configs.lineHeight;

configs.update = function(isPreview)
{
	var style = "";

	style += "font-size: " + configs.fontSize + "px;";
	style += "line-height: " + configs.lineHeight + ";";
	style += "background-color: ";
	var theme = parseInt(configs.theme, 10);
	switch(theme){
		case 0:
			style += "#ffffff; color: #000000;"
		break;

		case 1:
			style += "#cccccc; color: #666666;"
		break;

		case 2:
			style += "#000000; color: #ffffff;"
		break;
	}

	style += "margin-top: 0;"
	
	if (isPreview === true)
	{
		styleElement = $('#vmdPreviewTheme')
		styleElement.innerHTML = "#preview, #preview * {" + style + "}";
		//return $("#preview").style = style;

	} else {
		styleElement = $('#vmdTheme')
		styleElement.innerHTML = "body, #viewer * {" + style + "}";
		//return $("body").style = style;
	}

}

configs.update();
configs.update(true);

btnOpenConfigModal.onclick = function()
{
	$each(modais, function(modal) {
		modal.style.display = 'none';
	});
	modalConfig.style.display = 'block';
}

btnCloseConfigModal.onclick = function()
{
	modalConfig.style.display = 'none';
}

btnApplyConfigModal.onclick = function()
{
	configs.update();
	modalConfig.style.display = 'none';
}

for (var input = configInputs.length - 1; input >= 0; input--) {
	configInputs[input].onchange = function()
	{
		configs[this.name] = this.value;
		//console.log(configs);
		configs.update(true);
	}
};

//About
var btnAbout = $('#btnAbout'),
	closeAbout = $("#closeAbout"),
	modalAbout = $("#modalAbout");

btnAbout.onclick = function()
{
	modalAbout.style.display = "block";
}

closeAbout.onclick = function()
{
	modalAbout.style.display = "none";
}