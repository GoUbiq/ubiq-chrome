var UBIQ = {
    markedElemBorder: '5px solid red',

    isFrameCrossOrigin: function (frame) {
        try {
            // try to access frame content
            var doc = iframe.contentDocument || frame.contentWindow.document;
            doc.body.innerHTML;
            return false;
        } catch(err){
            // cross origin, do nothing
            return true;
        }
    },

    markTag: function (frame, tagName) {
        var tags = frame.getElementsByTagName(tagName);

        for (var i = 0, l = tags.length; i < l; i++) {
            tags[i].style.border = this.markedElemBorder;
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