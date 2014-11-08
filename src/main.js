chrome.app.runtime.onLaunched.addListener(function(launchData){
	chrome.app.window.create('mdviewer.html', {
		'id' : 'mdviewer',
		'bounds': {
			'width' : 675,
			'height' : 500
		},
		'minWidth'  : 600,
		'minHeight' : 400
	}, function(win)
	{
		win.contentWindow.launchData = launchData;
	})
})