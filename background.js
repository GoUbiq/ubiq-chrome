var socket = io.connect('http://192.168.0.100:8000/');
console.log('Opened socket to Ubiq...');

socket.on('error', function () {
    console.log('Socket error.');
});

var handleMessage = function (request, sendResponse) {
    switch (request.action) {
        case 'ubiq:device:load-resource':
            console.log('Loading ' + request.resourceURL + '...');
            socket.of('/app').emit('app_start', { params: {
                app_id: '31337',
                app_name: 'Ubiq Video'
            }});

            socket.of('/app').emit('app_action', { params: {
                app_id: '31337',
                app_name: 'Ubiq Video',
                request: 'play_url',
                url: request.resourceURL
            }});
            break;
        case 'ubiq:device:list':
            console.log('Requesting device list...');

            socket.of('/register').emit('registered_devices', 'all');

            socket.of('/register').once('respond_registered_devices', function (device_list) {
                console.log('Received device list:');
                console.log(device_list);
                sendResponse({ device_list: device_list });
            });
            break;
    }
}

// Browser Events
// ----------
chrome.runtime.onInstalled.addListener(function () {
    // register this device
    socket.once('connect', function () {
        console.log('Connected to Ubiq. Registering device...');

        var device_data = {
            user: 'timmy',
            device: 'Frinkiac-7'
        };

        socket.of('/register').emit('register', device_data);
    });

    socket.of('/register').on('new_device', function (data) {
        // TODO: Verify shit worked
        console.log(data + ' registered');
    });

});

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    // verify socket connection before taking action
    var retry_count = 0;
     
    setTimeout(function () {
        if (retry_count > 5) {
            console.log('Maximum retries reached. You\'re on your own.');
            sendResponse({ error: 'Unable to connect to server.' });
            return;
        }

        console.log('Checking connection...');
        
        if (!socket.socket.connected) {
            console.log('Not connected.');
            retry_count += 1;
            setTimeout(arguments.callee, 3000)
        }
        else {
            console.log('Connected');
            handleMessage(request, sendResponse);
        }
    }, 0);

    return true;
});

