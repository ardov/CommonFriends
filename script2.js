// console.clear();


VK.init(function() {
   // API initialization succeeded
   // Your code here
}, function() {
   // API initialization failed
   // Can reload page here
}, '5.65');

var CommonFriends = (function() {

    function Event() {
        this._observers = [];
    }
    Event.prototype = {
        raise: function(data) {
            this._observers.forEach(function(el) {
                el.observer.call(el.context, data);
            });
        },

        subscribe: function(observer, context) {
            var ctx = context || null;
            this._observers.push({
                observer: observer,
                context: ctx
            });
        },

        unsubscribe: function(observer, context) {
            this._observers.forEach(function(el, i, arr) {
                if (el.observer == observer && el.context == context) {
                    delete arr[i];
                }
            });
        }
    };


    function getParameterByName(name, url) {
        if (!url) {
            url = window.location.href;
        }
        name = name.replace(/[\[\]]/g, "\\$&");
        var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
            results = regex.exec(url);
        if (!results) return null;
        if (!results[2]) return '';
        return decodeURIComponent(results[2].replace(/\+/g, " "));
    }

    var accessToken = getParameterByName('access_token');

    var testMode = 1;

    var app = {};




    function Model() {
        this.owners = [];
        this.commonList = [];
        this.upToDate = new Event();
    }

    Model.prototype.update = function(idList) {
        var self = this;
        var updated = 0;
        getOwners();

        function getOwners() {
            var opts = {
                user_ids: idList,
                fields: 'photo_100',
                test_mode: testMode,
                access_token: accessToken
            };

            VK.api("users.get", opts, function(data) {
                console.log('Получили данные для ', idList);
                self.owners = data.response;
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
                console.log('Получили друзей для ', owner.id);
                console.log(owner.friends.length);

                updated++;
                if(self.owners.length == updated) finish();
                // owner.friends.forEach(function(friend, i, arr) {
                //     friend.owners = [];
                // });
            });
        }

        function finish() {
            self.upToDate.raise();
            self.makeCommonList();
        }

    };

    Model.prototype.makeCommonList = function() {
        var self = this;
        var list = [];

        self.owners.forEach(function(owner) {
            owner.friends.forEach(function(friend) {
                var index = list.findIndex(function(el) {
                    return friend.id == el.id;
                });

                if (index == -1) { // не нашли
                    friend.owners = [owner];
                    list.push(friend);
                } else { // нашли
                    list[index].owners.push(owner);
                }
            });
        });

        self.commonList = list.filter(function (el) {
            return el.owners.length > 1;
        });
        console.log('commonList ', self.commonList);
    };

    app.model = new Model();
    app.model.update('gloomish, alexeyun1k');

    return {
        app: app
        // declare public variables and/or functions
    };
})();
