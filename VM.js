// console.clear();
function autosize(width) {
  if (typeof VK.callMethod != "undefined") {
    VK.callMethod(
      "resizeWindow",
      width,
      document.getElementById("body").clientHeight + 60
    );
  } else {
    alert("error #2");
  }
}

(function(exports) {
  "use strict";

  function getParameterByName(name, url) {
    if (!url) {
      url = window.location.href;
    }
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
      results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return "";
    return decodeURIComponent(results[2].replace(/\+/g, " "));
  }
  let accessToken = getParameterByName("access_token");
  let testMode = 1;

  class Owner {
    constructor(data) {
      this.first_name = data.first_name;
      this.last_name = data.last_name;
      this.id = data.id;
      this.photo_100 = data.photo_100;

      this.friends = [];
      this.friendsCount = 0;
      this.loading = false;
      this.recievedFriends = false;
      this.enabled = true;

      this.fetchFriends();
    }
    fetchFriends() {
      let self = this;
      self.loading = true;
      console.log("loading friends");
      VK.api(
        "friends.get",
        {
          user_id: this.id,
          order: "name",
          fields:
            "nickname, domain, sex, bdate, city, country, timezone, photo_50, photo_100, has_mobile, contacts, education, online, relation, last_seen, status, universities",
          test_mode: testMode,
          access_token: accessToken
        },
        function(data) {
          self.friends = data.response.items;
          self.friendsCount = data.response.count;
          self.loading = false;
          self.recievedFriends = true;

          console.log("GOT FRIENDS", self, data);
          if (self.friends.length !== self.friendsCount)
            console.log(
              `Not all friends ${self.friends.length}/${self.friendsCount}`
            );
        }
      );
    }
  }

  VK.init(
    function success() {
      console.log("start");
      setInterval("autosize(700)", 1000);
    },
    function error() {
      console.warn("! trouble with VK.init");
    },
    "5.65"
  );

  exports.vm = new Vue({
    el: "#app",
    name: "Friend Search App",
    data: {
      owners: {},
      minCommon: 2,
      loading: false,
      errorText: "",
      input: ""
    },
    computed: {
      ownersList() {
        return Object.values(this.owners);
      },

      friendList() {
        let friendList = [];

        this.ownersList.forEach(owner => {
          owner.friends.forEach(friend => {
            var index = friendList.findIndex(el => friend.id === el.id);

            if (index === -1) {
              // не нашли
              friend.owners = [owner];
              friendList.push(friend);
            } else {
              // нашли
              friendList[index].owners.push(owner);
            }
          });
        });

        return friendList;
      },

      commonFriends() {
        return this.friendList
          .filter(el => el.owners.length >= this.minCommon)
          .sort((a, b) => b.owners.length - a.owners.length);
      }
    },

    methods: {
      consolIt() {
        console.log(this);
      },

      fetchOwnersFromInput(e) {
        e.target.select();
        let id = this.input.split("/").reverse()[0];
        this.fetchOwners(id);
      },

      fetchOwners(id) {
        let self = this;
        self.loading = true;
        if (!id) id = this.input;

        VK.api(
          "users.get",
          {
            user_ids: id,
            fields: "photo_100",
            test_mode: testMode,
            access_token: accessToken
          },
          function(data) {
            self.loading = false;
            self.addOwners(data);
          }
        );
      },

      addOwners(data) {
        let self = this;
        console.log("Получили данные", data);

        if (data.error) {
          self.showError(data.error.error_msg);
        } else {
          data.response.forEach(el => {
            if (el.deactivated) {
              self.showError("Пользователь " + el.first_name + " удалён =(");
            } else {
              Vue.set(self.owners, el.id, new Owner(el));
            }
          });
        }
      },

      removeOwner(id) {
        Vue.delete(this.owners, id);
      },

      showError(text) {
        this.errorText = text;
        setTimeout(this.hideError, 2000);
      },
      hideError() {
        this.errorText = "";
      }
    }
  });
})(window);
