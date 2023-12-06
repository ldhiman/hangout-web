// Since I can connect from multiple devices or browser tabs, we store each connection instance separately
var uid;
firebase.auth().onAuthStateChanged((user) => {
  if (user) {
    uid = user.uid;
// any time that connectionsRef's value is null (i.e. has no children) I am offline
var myConnectionsRef = firebase.database().ref(`users/${uid}/online`);

// stores the timestamp of my last disconnect (the last time I was seen online)
var lastOnlineRef = firebase.database().ref(`users/${uid}/lastSeen`);

var connectedRef = firebase.database().ref('.info/connected');
connectedRef.on('value', (snap) => {
  if (snap.val() === true) {
    // We're connected (or reconnected)! Do anything here that should happen only if online (or on reconnect)
    var con = myConnectionsRef;

    // When I disconnect, remove this device
    con.onDisconnect().set(false);

    // Add this device to my connections list
    // this value could contain info about the device or a timestamp too
    con.set(true);

    // When I disconnect, update the last time I was seen online
    lastOnlineRef.onDisconnect().set(firebase.database.ServerValue.TIMESTAMP);
  }
});

}});

function getFriend(zid){
  $('.FriendList').empty();
  db.collection('Users').doc(zid).collection('friends').get().then((querySnapshot) => {
    querySnapshot.forEach((doc) => {
      db.collection('Users').doc(doc.id).get().then((doc) => {
        if (doc.exists) {
          var id = doc.id;
          var data = doc.data();
          var friends = sessionStorage.getItem('friend-list').split(',');
          var requested = JSON.parse(localStorage.getItem('request'));
          if(id != uid && zid != id){
            if(!friends.includes(id)){
              db.collection('Users').doc(id).collection('friends').doc(uid).get()
              .then((snapshot)=>{
                if(!snapshot.exists){
                  $('.FriendList').prepend(`
                    <div onclick="ShowFriendDetail('${id}')" class='right-search-holder' style="order:1">
                        <img class='right-user-img' src="${data['Profile_Picture']}"><span class='right-user-name'>${data['Name']}</span><button id="${id}listfriend" class="right-add-friend"  onclick="AddFriend('${id}')"> Add Friend </button>
                    </div>
                  `)
                }else{
                  $('.FriendList').prepend(`
                    <div onclick="ShowFriendDetail('${id}')" class='right-search-holder' style="order:1">
                        <img class='right-user-img' src="${data['Profile_Picture']}"><span class='right-user-name'>${data['Name']}</span><button id="${id}listfriend" class="right-add-friend"> Requested </button>
                    </div>
                  `)
                }
              }) 
            } 
            else{
              $('.FriendList').prepend(`
                <div onclick="ShowFriendDetail('${id}')" class='right-search-holder' style="order:1">
                    <img class='right-user-img' src="${data['Profile_Picture']}"><span class='right-user-name'>${data['Name']}</span>
                </div>
              `)
            }  
          }else if(id == uid){
            $('.FriendList').prepend(`
                <div onclick="ShowFriendDetail('${id}')" class='right-search-holder' style="order:0">
                    <img class='right-user-img' src="${data['Profile_Picture']}"><span class='right-user-name'>${data['Name']} (You)</span>
                </div>
              `)
          }
        }
      }).catch((error) => {
          console.log("Error getting document:", error);
          showtoast("Some error occur in loading friend list", 6000, 'failure');
      });
    });
  });
}

function ShowFriendDetail(id){
  var verified = false;
  firebase.database().ref().get('verified/'+uid).then((snapshot) => {
      if (snapshot.exists()) {
        console.log(snapshot.val());
      } else {
        console.log("No data available");
      }
    }).catch((error) => {
      console.error(error);
    });
    db.collection("Users").doc(id).get().then((doc) => {
    if (doc.exists) {
      $('.user-profile-card-img').attr('src', doc.data()['Profile_Picture']);
      $('.user-profile-card-name').text(doc.data()['Name']);
      $('.user-profile-card-id').text(doc.data()['searchID']);
      $('.user-profile-card-status').text(doc.data()['Status']);
      $('.user-profile-card').show();
    }else{
      showtoast('user not exist', 4000);
    }
  }).catch((error) => {
    showtoast("Some error occur, Try Again", 4000, 'failure');
  });
}



function showmenu(){
  $('.holder-menu').show();
}

function changeTheme(){
  $('.holder-menu').hide();
  console.log(dark);
  if(dark){
    dark = 0;
    console.log(dark);
    localStorage.setItem('Hangout_web_theme_dark', 0);
  }else{
    dark = 1;
    console.log(dark);
    localStorage.setItem('Hangout_web_theme_dark', 1);          
  }
  checkTheme();
}

function checkTheme(){
  if(localStorage.getItem('Hangout_web_theme_dark') == 0){
	  $("LINK[href='Dark.css']").remove();
    dark = 0;
  }else{
   var head  = document.getElementsByTagName('head')[0];
    var link  = document.createElement('link');
    link.rel  = 'stylesheet';
    link.type = 'text/css';
    link.href = 'Dark.css';
    link.media = 'all';
    head.appendChild(link);
    dark = 1;
  }
}