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

var access_token = getParameterByName('access_token');
var userData = {};

// console.clear();



function grabber() {
    VK.api("users.get", {
        fields: 'verified, sex, bdate, city, country, home_town, has_photo, online, lists, domain, has_mobile, contacts, site, education, universities, schools, status, followers_count, common_count, occupation, nickname, relatives, relation, personal, connections, exports, wall_comments, activities, interests, music, movies, tv, books, games, about, quotes, timezone, screen_name, maiden_name, career, military',
        test_mode: 1,
        access_token: access_token
    }, function(data) {
        console.info('Получили данные', data);
        userData.user = data.response;
    });


    VK.api("friends.get", {
        fields: 'nickname, domain, sex, bdate, city, country, timezone, photo_50, photo_100, has_mobile, contacts, education, online, relation, last_seen, status',
        test_mode: 1,
        access_token: access_token
    }, function(data) {
        console.info('Получили друзей', data);
        userData.friends = data.response;
    });
}

$(document).ready(VK.init(grabber, function() {
    console.warn('initialization fail');
}, '5.62'))

function getFriensFor(userId, callback) {
    VK.api("friends.get", {
        user_id: userId,
        order: "name",
        fields: 'nickname, domain, sex, bdate, city, country, timezone, photo_50, photo_100, has_mobile, contacts, education, online, relation, last_seen, status, universities',
        test_mode: 1,
        access_token: access_token
    }, callback);
}









var data1 = {
    "response": {
        "count": 406,
        "items": [{
            "id": 8340243,
            "first_name": "Володя",
            "last_name": "Филимонов",
            "nickname": "®",
            "domain": "h0_0h",
            "online": 0,
            "lists": [3]
        }, {
            "id": 387752,
            "first_name": "Володя",
            "last_name": "Шарапов",
            "nickname": "",
            "domain": "madraddog",
            "online": 0
        }, {
            "id": 132641470,
            "first_name": "Воображаемый",
            "last_name": "Друг",
            "nickname": "Say A-A-A!",
            "domain": "sayaaa_amigo",
            "online": 0
        }]
    }
};


var friends = [],
    owners = [];

function findFriends(owners) {
    owners.forEach(function (owner, i, arr) {
        getFriensFor(owner.id, callback)
    });
}
