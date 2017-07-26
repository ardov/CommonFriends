(function(window) {
    'use strict';

    function Model() {
        this.owners = [];

        this.updated = new Event();
        this.loading = new Event();
    }

    Model.prototype.addOwner = function (id) {
        var self = this;
        var owners = [];
        var ready = [];

        self.loading.raise();

        VK.api(
            "users.get",
            {
                user_ids: id,
                fields: 'photo_100',
                test_mode: testMode,
                access_token: accessToken
            },
            gotOwners
        );

        function gotOwners(data) {
            console.log('Получили данные для ' + id, data);

            owners = data.response.filter(function(el) {
                return !el.deactivated;
            });

            if (owners.length) {
                owners.forEach(addFriends);
            } else {
                console.log('deactivated');
                self.updated.raise();
                return;
            }

        }

        function addFriends(owner) {

            VK.api(
                "friends.get",
                {
                    user_id: owner.id,
                    order: "name",
                    fields: 'nickname, domain, sex, bdate, city, country, timezone, photo_50, photo_100, has_mobile, contacts, education, online, relation, last_seen, status, universities',
                    test_mode: testMode,
                    access_token: accessToken
                },
                function(data) {
                    owner.friends = data.response.items;
                    ready.push(owner);
                    // console.log('Получили друзей для ' + owner.id, owner.friends);

                    if(owners.length == ready.length) {
                        self.owners = self.owners.concat(ready);
                        self.updated.raise();
                    }
            });
        }
    };



    Model.prototype.removeOwner = function (id) {
        var i = this.isOwner(id);
        if (i !== -1) {
            this.owners.splice(i, 1);
            this.updated.raise();
        }
    };


    Model.prototype.isOwner = function (id) {
        var i = this.owners.findIndex(function(el) {
            return el.id == id;
        });

        return i;
    };



    Model.prototype.getCommonList = function () {
        var self = this;
        var commonList = [];

        self.owners.forEach(function(owner) {

            owner.friends.forEach(function(friend) {

                var index = commonList.findIndex(function(el) {
                    return friend.id == el.id;
                });

                if (~index) { // не нашли
                    commonList[index].owners.push(owner);
                } else { // нашли
                    friend.owners = [owner];
                    commonList.push(friend);
                }

            });

        });

        commonList = commonList
            .filter(function (el) {
                return el.owners.length > 1 && !~self.isOwner(el.id);
            })
            .sort(function(a, b) {
                return b.owners.length - a.owners.length;
            });

        console.log('commonList ', self.commonList);
        return commonList;
    };

    // Exports
    window.app = window.app || {};
    window.app.Model = Model;
})(window);
