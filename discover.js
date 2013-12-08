var UBIQ = {
    ubiqSelectHtml: null,
    
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
            case 'EMBED':
                return elem.getAttribute('src');
            case 'VIDEO':
                return elem.getAttribute('src');
        }
    },

    handleSendDeviceResponse: function (response) {},

    handleSelectClick: function (e) {
        var elem = e.target,
            list;

        e.preventDefault();

        if (elem.className === 'ubiq-device') {
            list = elem.parentNode.parentNode;
            
            var deviceID = e.target.getAttribute('data-device-id'),
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

            console.log(list.style.display);
            
            if (!list.style.display || list.style.display === 'none') {
                // show the list
                list.style.display = 'inherit';
            }
            else {
                // hide the list
                list.style.display = 'none';
            }
        }
    },

    addUbiqSelect: function (device_list, frame, element) {
        var container = frame.createElement('div');
        container.className = 'ubiq-select';

        if (!this.ubiqSelectHtml) {
            var container_html = '<a href="#"></a><ul class="ubiq-list">';

            for (var i = 0, l = device_list.length; i < l; i++) {
                container_html += '<li><a href="#" class="ubiq-device" data-device-id="' + 
                    device_list[i].device + '">' + device_list[i].device + '</a></li>';
            }

            container_html += '</ul>';
            
            this.ubiqSelectHtml = container_html;
        }
        
        container.innerHTML = this.ubiqSelectHtml;
        container.addEventListener('click', this.handleSelectClick.bind(this));

        element.parentNode.insertBefore(container, element);
    },

    markElement: function (device_list, frame, tagName) {
        var tags = frame.getElementsByTagName(tagName),
            ubiq_select;

        for (var i = 0, l = tags.length; i < l; i++) {
            ubiq_select = tags[i].parentNode.getElementsByClassName('ubiq-select');

            if (!ubiq_select.length) {
                this.addUbiqSelect(device_list, frame, tags[i]);
            }
        }
    },

    markElements: function (device_list, frame, tagNames) {
        if (tagNames instanceof Array) {
            for (var i = 0, l = tagNames.length; i < l; i++) {
                this.markElement(device_list, frame, tagNames[i]);
            }
        }
        else {
            this.markElement(device_list, frame, tagNames);
        }
    },

    markContent: function (device_list) {
        if (!device_list.length) {
            console.error('ubiq-chrome: Unable to mark content. No devices specified.');
        }

        // mark elements in main page
        this.markElements(device_list, document, ['embed', 'object', 'video']);

        // mark elements inside any frames
        var frames = window.frames;
        for (var i = 0, l = frames.length; i < l; i++) {
            if (!this.isFrameCrossOrigin(frames[i]) && frames[i].document) {
                this.markElements(device_list, frames[i].document, ['embed', 'object']);
            }
        }
    },

    loadDevices: function (callback) {
        // request device list from server
        chrome.runtime.sendMessage({
            action: 'ubiq:device:list'
        }, function (response) { callback(response.device_list); });
    }
};

UBIQ.loadDevices(function (device_list) {
    UBIQ.markContent(device_list);
});
