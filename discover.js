var UBIQ = {

    devices: [],
    ubiqSelect: '',

    isFrameCrossOrigin: function (frame) {
        try {
            // try to access frame content
            var doc = frame.contentDocument || frame.contentWindow.document;
            doc.body.innerHTML;
            return false;
        } catch(err){
            // cross origin
            return true;
        }
    },

    getResourceURL: function (elem) {
        var tagName = elem.tagName;

        switch (tagName) {
            case 'OBJECT':
                return elem.getAttribute('data');
                break;
            case 'EMBED':
                return elem.getAttribute('src');
                break;
            case 'VIDEO':
                return elem.getAttribute('src');
                break;
        }
    },

    handleSendDeviceResponse: function (response) {},

    handleSelectClick: function (e) {
        var elem = e.target,
            list;

        if (elem.className === 'ubiq-device') {
            var deviceID = e.target.getAttribute('data-device-id'),
                list = elem.parentNode.parentNode,
                select = list.parentNode,
                resourceURL = this.getResourceURL(select.nextSibling);

            // send the resource to the server for display on device
            chrome.runtime.sendMessage({
                action: 'ubiq:device:load-resource',
                deviceID: deviceID,
                resourceURL: resourceURL
            }, this.handleSendDeviceResponse.bind(this));

            // hide the list
            list.style.display = 'none';
        }
        else if (elem.parentElement.className === 'ubiq-select') {
            list = elem.parentElement.getElementsByClassName('ubiq-list')[0];

            if (list.style.display === 'none') {
                // show the list
                list.style.display = 'inherit';
            }
            else {
                // hide the list
                list.style.display = 'none';
            }
        }
    },

    addUbiqSelect: function (devices, frame, element) {
        var container = frame.createElement('div');
        container.className = 'ubiq-select';

        var container_html = '<a href="#"></a><ul class="ubiq-list">';

        for (var i = 0, l = devices.length; i < l; i++) {
            container_html += '<li><a href="#" class="ubiq-device" data-device-id="' + devices[i].id + '">' + devices[i].name + '</a></li>';
        }

        container_html += '</ul>';
        container.innerHTML = container_html;

        container.addEventListener('click', this.handleSelectClick.bind(this));

        element.parentNode.insertBefore(container, element);
    },

    markElement: function (frame, tagName) {
        var tags = frame.getElementsByTagName(tagName),
            ubiq_select;

        for (var i = 0, l = tags.length; i < l; i++) {
            ubiq_select = tags[i].parentNode.getElementsByClassName('ubiq-select');

            if (!ubiq_select.length) {
                this.addUbiqSelect(this.devices, frame, tags[i]);
            }
        }
    },

    markElements: function (frame, tagNames) {
        if (tagNames instanceof Array) {
            for (var i = 0, l = tagNames.length; i < l; i++) {
                this.markElement(frame, tagNames[i]);
            }
        }
        else {
            this.markElement(frame, tagNames);
        }
    },

    markContent: function () {
        if (!this.devices) {
            console.error('UBIQ: Devices have not been loaded. Unable to mark content.');
        }

        // mark elements in main page
        this.markElements(document, ['embed', 'object', 'video']);

        // mark elements inside any frames
        var frames = window.frames;
        for (var i = 0, l = frames.length; i < l; i++) {
            if (!this.isFrameCrossOrigin(frames[i]) && frames[i].document) {
                this.markElements(frames[i].document, ['embed', 'object']);
            }
        }
    },

    handleLoadDevicesResponse: function (callback, response) {
        this.devices = response.devices;
        callback();
    },

    loadDevices: function (callback) {
        // request device list from server
        chrome.runtime.sendMessage({
            action: 'ubiq:device:list'
        }, this.handleLoadDevicesResponse.bind(this, callback));
    }
};

UBIQ.loadDevices(function (devices) {
    console.log(UBIQ.devices);
    UBIQ.markContent();
});
