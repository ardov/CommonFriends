(function(window) {
    'use strict';
    function Finder(name) {
        this.model = new app.Model();
        this.view = new app.View();
        this.controller = new app.Controller(this.model, this.view);
        this.controller.init();
    }


    VK.init(start, function() {
        console.warn('trouble with VK.init');
    }, '5.65');

    function start () {
        console.clear();
        console.log('start');
        var finder = new Finder();
        finder.controller.setView();
        // finder.model.addOwner();
    }
})(window);
