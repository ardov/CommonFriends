(function (exports) {
  'use strict';

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

  let accessToken = getParameterByName('access_token');

  let testMode = 1;

  VK.init(
    function success() {
      // console.clear();
      console.log('start');
    },
    function error() {
      console.warn('trouble with VK.init');
    },
    '5.65'
  );





  exports.vm145 = new Vue({
    el: '#app',
    data: {
      owners: [],
      minCommon: 2,
      input: ''
    },
    computed: {
      friendList() {
        let friendList = [];

        this.owners.forEach((owner) => {
          owner.friends.forEach((friend) => {
            var index = friendList.findIndex((el) => friend.id === el.id);

            if (index === -1) { // не нашли
              friend.owners = [owner];
              friendList.push(friend);
            } else { // нашли
              friendList[index].owners.push(owner);
            }
          });
        });

        return friendList;
      },

      commonFriends() {
        return this.friendList
          .filter((el) => el.owners.length >= this.minCommon)
          .sort((a, b) => b.owners.length - a.owners.length);
      }
    },

    methods: {
      addOwner(id) {
        if (!id) id = this.input;
        var self = this;

        VK.api(
          "users.get", {
            user_ids: id,
            fields: 'photo_100',
            test_mode: testMode,
            access_token: accessToken
          },
          gotOwners
        );

        function gotOwners(data) {
          console.log('Получили данные для ' + id, data);

          data.response.forEach( (el) => {
            if (!el.deactivated) {
              el.friends = [];
              self.owners.push(el);
            }
          });

          // let newOwners = data.response.filter((el) => !el.deactivated);
          // self.owners = self.owners.concat(newOwners);
          self.addFriends();
        }
      },

      addFriends() {
        this.owners.forEach((owner) => {
          if (owner.friends.length === 0) {
            VK.api(
              "friends.get", {
                user_id: owner.id,
                order: "name",
                fields: 'nickname, domain, sex, bdate, city, country, timezone, photo_50, photo_100, has_mobile, contacts, education, online, relation, last_seen, status, universities',
                test_mode: testMode,
                access_token: accessToken
              },
              function (data) {
                console.log('GOT FRIENDS', this, data);
                owner.friends = data.response.items;
              }
            );
          }
        });
      }
    },
  });
})(window);
