var socket = io.connect('http://192.168.0.100:8000/');
console.log('Connecting to Ubiq server...');

socket.on('connect', function () {
    console.log('Connected to Ubiq. Registering device...');
    
    var device_data = { 
        user: 'timmy',
        device: 'Frinkiac-7'
    };

    //socket.of('/register').emit('apocalypse', {});

    socket.of('/register').emit('register', device_data);

});

socket.of('/register').on('new_device', function (data) {
    // TODO: Something
    console.log(data + ' registered');
});

var handleMessage = function (request, sendResponse) {
    switch (request.action) {
        case 'ubiq:device:load-resource':
            console.log('would load ' + request.resourceURL + ' on device, id = ' + request.deviceID);
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

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    // verify socket connection before taking action
    var retry_count = 0;
     
    setTimeout(function () {
        if (retry_count > 5) {
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

