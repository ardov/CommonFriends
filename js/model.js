(function(window) {
    'use strict';

    function Model() {
        this.ownersIds = [];
        this.owners = [];
        this.commonList = [];
        this.updated = new Event();
    }

    Model.prototype.addOwner = function (owner) {
        this.ownersIds.push(owner);
        this.update();
    };

    Model.prototype.removeOwner = function (id) {
        var i = this.ownersIds.indexOf(id);
        if (i == -1) {
            return;
        } else {
            this.ownersIds.splice(i, 1);
            this.update();
        }
    };

    Model.prototype.update = function () {
        var self = this;
        var updated = 0;

        if (self.ownersIds.length === 0) {
            console.log('empty');
            self.owners = [];
            self.friends = [];
            self.commonList = [];

            self.updated.raise();
        } else {
            getOwners();
        }

        function getOwners() {
            var opts = {
                user_ids: self.ownersIds.join(','),
                fields: 'photo_100',
                test_mode: testMode,
                access_token: accessToken
            };

            VK.api("users.get", opts, function(data) {
                console.log('Получили данные для ', self.ownersIds.join(','), data);
                self.owners = data.response.filter(function(el) {
                    return !el.deactivated;
                });

                // delete all ids and fill again with nums
                self.ownersIds = self.owners.map(function(el) {
                    return el.id;
                });
                self.owners.forEach(getFriends);
            });
        }

        function getFriends(owner) {
            var opts = {
                user_id: owner.id,
                order: "name",
                fields: 'nickname, domain, sex, bdate, city, country, timezone, photo_50, photo_100, has_mobile, contacts, education, online, relation, last_seen, status, universities',
                test_mode: testMode,
                access_token: accessToken
            };

            VK.api("friends.get", opts, function(data) {
                owner.friends = data.response.items;
                console.log('Получили друзей для ', owner.id, owner.friends);

                updated++;
                if(self.owners.length == updated) makeCommonList();
            });
        }

        function makeCommonList() {
            var commonList = [];

            self.owners.forEach(function(owner) {
                owner.friends.forEach(function(friend) {
                    var index = commonList.findIndex(function(el) {
                        return friend.id == el.id;
                    });

                    if (index == -1) { // не нашли
                        friend.owners = [owner];
                        commonList.push(friend);
                    } else { // нашли
                        commonList[index].owners.push(owner);
                    }
                });
            });

            self.commonList = commonList.filter(function (el) {
                return el.owners.length > 1;
            });

            self.commonList.sort(function(a, b) {
                return b.owners.length - a.owners.length;
            });
            console.log('commonList ', self.commonList);
            self.updated.raise();
        }
    };

    // Exports
    window.app = window.app || {};
    window.app.Model = Model;
})(window);
