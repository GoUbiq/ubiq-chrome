chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {

    switch (request.action) {
        case 'ubiq:device:load-resource':
            console.log('would load ' + request.resourceURL + ' on device, id = ' + request.deviceID);
            break;
        case 'ubiq:device:list':
            // load device list
            sendResponse({ devices: [
                { id: '11111', name: 'TV' },
                { id: '22222', name: 'Desktop' }]
            });
            break;
    }
});

