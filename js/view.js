(function(window) {
    'use strict';

    function View() {
        var self = this;
        this.tmpl_owner = Handlebars.compile($("#tmpl_owner").html());
        this.tmpl_friend = Handlebars.compile($("#tmpl_friend").html());

        this.updated = new Event();
        this.add = new Event();
        this.remove = new Event();

        this.$ownerContainer = qs('.owner-container');
        this.$friendList = qs('.friend-list');
        this.$add = qs('.add');
        this.$field = qs('.field');

        $on(this.$field, 'keydown', function (e) {
            if (e.keyCode == 13 && this.value) {
                self.add.raise(this.value);
            } else {
                return true;
            }
        });
    }




    View.prototype.render = function (cmd, parameter) {
        var self = this;
        var viewCommands = {

            owners: function () {
                qsa('.owner').forEach(function (el) {
                    el.remove();
                });

                parameter.forEach(function(el){
                    var root = self._getRoot(self.tmpl_owner, el);

                    var photo = qs('.owner__delete', root);
                    $on(photo, 'click', function (e) {
                        self.remove.raise(this.dataset.id);
                    });

                    self.$ownerContainer.appendChild(root);
                });
            },

            friends: function () {
                qsa('.friend').forEach(function (el) {
                    el.remove();
                });
                parameter.forEach(function(el){
                    var root = self._getRoot(self.tmpl_friend, el);

                    var photo = qs('.friend__add', root);
                    $on(photo, 'click', function (e) {
                        self.add.raise(this.dataset.id);
                    });

                    self.$friendList.appendChild(root);
                });
            },

            field: function () {
                self.$field.value = parameter || '';
                self.$field.focus();
            }
        };

        viewCommands[cmd](parameter);
    };

    View.prototype._getRoot = function (template, data) {
        var html = template(data);
        var el = document.createElement('div');
        el.innerHTML = html;
        return el.firstElementChild;
    };



    // Exports
    window.app = window.app || {};
    window.app.View = View;
})(window);
