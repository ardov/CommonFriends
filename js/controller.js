(function(window) {
    'use strict';

    function Controller(model, view) {
        var self = this;
		self.model = model;
		self.view = view;

    }

    Controller.prototype.setView = function () {
        var self = this;

        self.view.render('owners', self.model.owners);
        self.view.render('friends', self.model.getCommonList());
        self.view.render('field', '');
        self.view.loading(false);
    };

    Controller.prototype.getId = function (val) {
        var self = this;

        if (val.indexOf('/') != -1) { // if its URL
            var parts = val.split('/');
            val = parts[parts.length - 1];
        }

        self.model.addOwner(val);
    };

    Controller.prototype.removeOwner = function (id) {
        var self = this;
        self.model.removeOwner(+id);
    };

    Controller.prototype.loading = function () {
        var self = this;
        self.view.loading(true);
    };

    Controller.prototype.init = function () {
        var self = this;
        self.model.updated.subscribe(self.setView, self);
        self.model.loading.subscribe(self.loading, self);

        self.view.add.subscribe(self.getId, self);
        self.view.remove.subscribe(self.removeOwner, self);
    };


    // Exports
    window.app = window.app || {};
    window.app.Controller = Controller;
})(window);
