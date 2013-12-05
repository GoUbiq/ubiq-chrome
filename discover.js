var UBIQ = {
    markedElemBorder: '5px solid red',

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

    addUbiqSelect: function (frame, beforeElem) {
        var container = frame.createElement('div');
        container.className = 'ubiq-select';
        container.innerHTML = '<a href="#"></a>';

        beforeElem.parentNode.insertBefore(container, beforeElem);
    },

    markTag: function (frame, tagName) {
        var tags = frame.getElementsByTagName(tagName),
            ubiq_select;

        for (var i = 0, l = tags.length; i < l; i++) {
            tags[i].style.border = this.markedElemBorder;

            ubiq_select = tags[i].parentNode.getElementsByClassName('ubiq-select');

            if (!ubiq_select.length) {
                this.addUbiqSelect(frame, tags[i]);
            }
        }
    },

    markTags: function (doc, tagNames) {
        if (tagNames instanceof Array) {
            for (var i = 0, l = tagNames.length; i < l; i++) {
                this.markTag(doc, tagNames[i]);
            }
        }
        else {
            this.markTag(doc, tagNames);
        }
    },

    discoverContent: function () {
        // mark elements in main page
        this.markTags(document, ['embed', 'object', 'video']);

        // mark elements inside any frames
        var frames = window.frames;
        for (var i = 0, l = frames.length; i < l; i++) {
            if (!this.isFrameCrossOrigin(frames[i]) && frames[i].document) {
                this.markTags(frames[i].document, ['embed', 'object']);
            }
        }
    }
};

setInterval(UBIQ.discoverContent.bind(UBIQ), 1000);