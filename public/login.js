 var firebaseConfig = {
    apiKey: //Project Api Key,
    authDomain: //Auth Domain,
    databaseURL: //Database URL,
    projectId: //Project ID,
    storageBucket: //Storage Bucket,
    messagingSenderId: //Messaging Sender,
    appId: //App id,
    measurementId: //Measurement ID
  };
  firebase.initializeApp(firebaseConfig);


  var db = firebase.firestore();
  var database = firebase.database();
  const perf = firebase.performance();
firebase.firestore().settings({
		merge:true,
    cacheSizeBytes: firebase.firestore.CACHE_SIZE_UNLIMITED
});
check();
var dark = true;

$('.menu').ready(function(){
	$('.menu').hide();
});


$('.holder-menu').ready(function(){
	$('.holder-menu').hide();
});


$('#loader').ready(function(){
	$('#loader').hide();
});

$('.user-edit-container').ready(function(){
	$('.user-edit-container').hide();
});

$('.toast').ready(function(){
	$('.toast').hide();
	showtoast('Press F11 for better experience', 10000);
});

$('.UploadFile').ready(function(){
	$('.UploadFile').hide();
});

$('.story-container').ready(function(){
	$('.story-container').hide();
});

$('.user-request-card').ready(function(){
	$('.user-request-card').hide();
});

$('.AddStoryBtn').ready(function(){
	$('.add-story').show();
});


$('#Verification_User').ready(function(){
	$('#Verification_User').hide();
});


function login(){
	setTimeout(() => {  
	document.getElementById("loader").style.display="block"; }, 500);
	setTimeout(() => {  login_fn(); }, 2000) ;
	setTimeout(() => {  
	document.getElementById("loader").style.display="none"; }, 4000);
}

function check(){
firebase.auth().onAuthStateChanged((user) => {
  if (user) {
    window.uid = user.uid;
	document.getElementById("login-page").style.display="none";
	document.getElementById("chat-page").style.display="block";
	LoadUser();
  	db = firebase.firestore();
  	database = firebase.database();
	setTimeout(function(){
		$('#loading_animation').hide();		
	}, 5000)
  }else{
	  $('#loading_animation').hide();		
		setTimeout(() => {document.getElementById("login-page").style.display="block"; }, 500);
		setTimeout(() => {document.getElementById("chat-page").style.display="none"; }, 500);
		setTimeout(() => {document.getElementById("loader-bar").style.display="none"; }, 500);
	}
});
}

  


function login_fn(){
	$('#loader-bar').show();
	var email = document.getElementById("Email").value;
	var pass = document.getElementById("Password").value;
	
	firebase.auth().signInWithEmailAndPassword(email, pass)
	.then((userCredential) => {
		var user = userCredential.user;
		document.getElementById("Email").value = "";
		document.getElementById("Password").value = "";
	})
	.catch((error) => {
		var errorCode = error.code;
		var errorMessage = error.message;
		$('#loader-bar').hide();
		window.alert(errorCode + errorMessage);
	});
}

var i = 0;





var opened = '';

var displayName=null;
var email=null; 
var photoURL=null;
var emailVerified=null;
var uid=null;
var status=null;
var user;
let permission;

if (window.Notification.permission !== 'default'){
	permission = Notification.requestPermission();
}


function LoadUser(){
	$('#menu-holder').show();
	user = firebase.auth().currentUser;
	if (user !== null) {
  		displayName = user.displayName;
  		email = user.email;
  		photoURL = user.photoURL;
		window.propic = photoURL; 
  		emailVerified = user.emailVerified;
		status = user.pa;
  		uid = user.uid;
		if(user.emailVerified){
			firebase.database().ref('verified/'+uid).set({
    			verified: true,
  			});
			$('#send_verify_link').hide();
		}else{
			firebase.database().ref('verified/'+uid).set({
    			verified: false,
  			});
			$('#send_verify_link').show();
			$('#send_verify_link').css('color', 'yellow');
			$('.dot3_button span').css('color', 'yellow');
		}
		listinChat(uid, false);
		db.collection("Users").doc(uid).onSnapshot((doc) => {
				localStorage.setItem('user-info',JSON.stringify(doc.data()));
				$('#self-img').html(`<img class='profile-img' src="${doc.data()['Profile_Picture']}">`);
				$('#self-name').html(`${doc.data()['Name'].split(' ')[0]}`)
				window.selfName = doc.data()['Name'];
				if(localStorage.getItem('searchID') !== doc.data()['searchID']){
					localStorage.setItem('searchID', doc.data()['searchID']);
					$('.user-search-id').text('ID: ' +localStorage.getItem('searchID'));
				}else if(!doc.data()['searchID']){
					userID();
				}else{
					$('.user-search-id').text('ID: ' +localStorage.getItem('searchID'));
				}
			}
		)
	}
	
}

var friend_list = [];

function listinChat(uid, i){
	var ref = db.collection('Users');
	db.collection("Users").doc(uid).collection('friends').where("accept", "==", true).get().then((snapshot) => {
		$('.user-list').empty();
        snapshot.forEach((document) => {
                ref.doc(document.id).onSnapshot((doc) => {
					lastseen = document.data()['timestamp'];
					lastseen = handle_time(lastseen);
					sessionStorage.setItem(`${document.id}-img`, doc.data()['Profile_Picture']);
					sessionStorage.setItem(`${document.id}-status`, doc.data()['Status']);
					sessionStorage.setItem(`${document.id}-name`, doc.data()['Name']);
					sessionStorage.setItem(`${document.id}-id`, doc.data()['searchID']);
					friend_list.push(document.id);
					if(document.id !== uid){
						sessionStorage.setItem('friend-list', friend_list);
						var last = localStorage.getItem(`lastMsgTime${document.id}`)
						$(`#${document.id}`).remove();
						$('.user-list').append(`
							<div class='user-list-holder' id='${document.id}' style="order:${last}">
								<div class='user-img' onclick="ShowFriendDetail('${document.id}')" style="position:relative"><img id="${document.id}Img" class='user-profile-img' src="${doc.data()['Profile_Picture']}"><div id='${document.id}-online' class="logged-in list-online">&#9679;</div></div>
								<div class='user-data-info' ondbclick='LoadUserChat("${document.id}")' onclick='LoadUserChat("${document.id}")'>
									<div style='display:inline-flex;justify-content: space-between;width:-webkit-fill-available;'>
										<div class='user-name-status'>
											<div id="${document.id}Name" class='user-name'>${doc.data()['Name'].trim().split(' ')[0]}</div>
											
										</div>
										<div id="${document.id}-lastSeen-menu" class='last-msg-send'>${lastseen}</div>
									</div>	
									<div style='display:inline-flex;width: -webkit-fill-available;justify-content: space-between;'>
										<div id="${document.id}Status" class='user-status'>${doc.data()['Status']}</div>
										<div class="Unread" id="${document.id}unread" hidden></div>
									</div>
								</div>
							</div>
						`);
                        if(!i){
						    $('.view').append(`<div id="${document.id}chat" class="chat-holder-viewer"></div>`);
						    $(`#${document.id}chat`).hide();
                        }
					}
    			});
			check_fav_list(document.id);
        });
    });
	requestFriend();
	
	
}

function requestFriend(){
	db.collection("Users").doc(uid).collection('friends').where("type", "==", "request").where("accept", "==", false).onSnapshot((snapshot) => {
  $('.friend-request-view').empty();
      snapshot.forEach((document) => {
      db.collection('Users').doc(document.id).onSnapshot((doc) => {
        console.log(doc.data());
        $('.friend-request-view').append(`
          <div class="friend-request-holder" id="${doc.id}" onclick="request('${doc.id}')">
			      <img class="friend-request-img" src="${doc.data()['Profile_Picture']}">
			      <div class="friend-request-name">${doc.data()['Name']}</div>
		      </div>
        `)
    })
  })
});	
}


String.prototype.hash = function() {
  var hash = 0, i, chr;
  if (this.length === 0) return hash;
  for (i = 0; i < this.length; i++) {
    chr   = this.charCodeAt(i);
    hash  = ((hash << 5) - hash) + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
};



var userref;
var selfRef;
var firebaseSelfRef;
var firebaseUserRef;

function addFavourite(){
  docRef = db.collection('Users').doc(uid).collection('friends').doc(current);
  docRef.get().then((doc) => {
    if (doc.data()['favorite']) {
      docRef.update({
            'favorite':false,
        }).then(()=>{
            setTimeout(function(){
                $('#favorite').css('color', '#888');
                $('#favorite').removeAttr('class');
                $('#favorite').attr('class', 'fa-regular fa-heart');
            }, 0);
        }).catch((error) => {
            setTimeout(function(){  
                $('#favorite').css('color', 'Red');
                $('#favorite').removeAttr('class');
                $('#favorite').attr('class', 'fa-solid fa-heart');
            },0);
      });
    } else {    
        docRef.update({
            'favorite':true,
        }).then(()=>{
            setTimeout(function(){  
                $('#favorite').css('color', 'Red');
                $('#favorite').removeAttr('class');
                $('#favorite').attr('class', 'fa-solid fa-heart');
            },0);
        }).catch((error) => {
            setTimeout(function(){
                $('#favorite').css('color', '#888');
                $('#favorite').removeAttr('class');
                $('#favorite').attr('class', 'fa-regular fa-heart');
            }, 0);
        });
    }
    //listinChat(uid);                
  }).catch((error) => {
      console.log("Error getting document:", error);
  });
  refreshUI();
}

async function refreshUI(){
    await new Promise(r => setTimeout(listinChat(uid, true), 0));
}

function check_fav(){
	docRef = db.collection('Users').doc(uid).collection('friends').doc(current);
  	docRef.get().then((doc) => {
		if (doc.data()['favorite']) {
			$('#favorite').css('color', 'Red');
		} else {    
			$('#favorite').css('color', '#888');
		}
	}).catch((error) => {
		check_fav();
	});
}

function check_fav_list(id){
	var docRef = db.collection('Users').doc(uid).collection('friends').doc(id);
  	docRef.get().then((doc) => {
		if(doc.data()['favorite']) {
			$(`#${id}`).attr('style', 'order:0');
			var name = $(`#${id}Name`).text();
			$(`#${id}Name`).html('<span>'+name+'</span><span style="font-size:14px;color:red" class="material-icons material-icons-round">push_pin</span>');
		} else {    
			$(`#${id}`).attr('style', 'order:1');			
		}
	});
}


var userid;


function online_header(){
	$('.logged-in').html('●')
}

function newMessageAlert(userid){
	if(opened !== userid){
		db.collection("cities").doc(userid)
	    .onSnapshot((doc) => {
	        console.log("Current data: ", doc.data());
	    		showtoast('New Message From '+doc.data()['Name'],3000);
	    });
	}  
}





function deleteMsg(type, removeid, msg_type){
	showtoast('Deleteing Message..', 1000);
	if(type == 'self'){
		db.collection('Messages').doc(uid).collection('message').doc(removeid).delete();
		$(`#${removeid}`).remove();
		$('.menu').hide();
		showtoast('Message deleted successfully',3000, 'success');
	}else if(type == 'both'){
		$('.menu').hide();
		if(msg_type == 'text'){
			db.collection('Messages').doc(uid).collection('message').doc(removeid).delete();
			db.collection('Messages').doc(current).collection('message').doc(removeid).delete();
			showtoast('Message deleted successfully',3000, 'success');
		}else{
			var url = $(`#${removeid}`).data('url');
			var a = firebase.storage().refFromURL(url); 
			a.delete()
			.then(()=>{
				db.collection('Messages').doc(uid).collection('message').doc(removeid).delete();
				db.collection('Messages').doc(current).collection('message').doc(removeid).delete();
				showtoast('Message deleted successfully',3000, 'success');
			})
			.catch((error) => {
				showtoast('Some Error Occur', 4000, 'failure');
    		});	
		}
	}	
}


function logout(){
	$('.holder-menu').hide();
	firebase.auth().signOut().then(() => {
	}).catch((error) => {
		
	});
}

function deviceCheck(){
	var isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
	if (isMobile) {
  		document.getElementById("chat-page").innerHTML="<h1>Please use your app, This web version only for desktop devices</h1><br><h3>To download your app <a href='https://drive.google.com/file/d/1niG-tIMpfszeikJfC0Vf18kg-goHzj4B/view?usp=sharing'>Click Here</a></h3>" 
	}
}

function getDate(time){
	var todayYear = new Date(time).getFullYear();
	var todayMonth = new Date(time).getMonth();
	todayMonth = Months[todayMonth];
	var todayDay = new Date(time).getDate();
	return todayDay+'/'+todayMonth+'/'+todayYear;
}

const Months = [1,2,3,4,5,6,7,8,9,10,11,12];

function getTime(time){
	var hour = new Date(time).getHours()
	var type = 'AM';
	if(hour > 12 && hour<=24){
		hour = hour - 12
		type='PM'
	}else{
		type ='AM'
	}
	if(hour<10){
		hour = '0'+hour;
	}else{
		hour = hour;
	}
	var min = new Date(time).getMinutes()
	if(min<10){
		min = '0'+min;
	}else{
		min = min;
	}
	return hour + ':' + min + ' ' +type; 
}

const weekdays= ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
function handle_time(time){
	var todayYear = new Date().getFullYear();
	var todayMonth = new Date().getMonth();
	var todayDay = new Date().getDate();
	var Year = new Date(time).getFullYear();
	var Month = new Date(time).getMonth();
	var Day = new Date(time).getDate();
	var text ='';
	if(Month == todayMonth && Year == todayYear){
		if(todayDay == Day){
			var hour = new Date(time).getHours()
			var type = 'AM';
			if(hour > 12 && hour<=24){
				hour = hour - 12
				type='PM'
			}else{
				type ='AM'
			}
			if(hour<10){
				hour = '0'+hour;
			}else{
				hour = hour;
			}
			var min = new Date(time).getMinutes()
			if(min<10){
				min = '0'+min;
			}else{
				min = min;
			}
			text = hour + ':' + min + ' ' +type; 
		}else if((todayDay - Day) <= 1){
			text = 'yesterday';
		}else if((todayDay - Day) <= 7){
			text = weekdays[new Date(time).getDay()];
		}
	}else{
			text = Day+'/'+Month+'/'+Year ;
		}
	return text;
}

let gID = () => {
  return Math.floor((6 + Math.random()) * 0x100000)
      .toString(16);
}

function generateID(){
	var gid= gID();
	var i=0;
	db.collection("Users").where("searchID", "==", gid).get()
    .then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
			i++;
        });
    })
    .catch((error) => {
        console.log("Error getting documents: ", error);
    });
	if(i>0){
		generateID();
	}else{
		return gid;
	}
}

function showtoast(msg, time_spend, type){
	var type = type || 'default'; 
	var time_spend = parseInt(time_spend) || 5000;
	var rid = new Date().getTime();
	rid = rid.toString();
	var background_color = "var(--light-color)";
	var text_color = "var(--default-primary-color)";
	switch(type) {
  	case 'success':
	  	background_color="#00C851";
		text_color = "#00C851"
		var box_shadow = text_color + ' 0px 0px 0px 3px';
		$('.toast-holder').append(`<div id="${rid}" class='toast' style="box-shadow:${box_shadow};color:${background_color}">${msg}</div>`).show(500);
		$(`#${rid}`).delay(time_spend).fadeOut();
    	break;
  	case 'failure':
	  	background_color="#ff4444";
		text_color = "#CC0000"
		var box_shadow = text_color + ' 0px 0px 0px 3px';
		$('.toast-holder').append(`<div id="${rid}" class='toast' style="box-shadow:${box_shadow};color:${background_color}">${msg}</div>`).show(500);
		$(`#${rid}`).delay(time_spend).fadeOut();
    	break;
	case 'default':
		$('.toast-holder').append(`<div id="${rid}" class='toast'>${msg}</div>`).show(500);
		$(`#${rid}`).delay(time_spend).fadeOut();
    	break;
  	default:
		$('.toast-holder').append(`<div id="${rid}" class='toast'>${msg}</div>`).show(500);
		$(`#${rid}`).delay(time_spend).fadeOut();
	}
}

function userID(){
	var docRef = db.collection("Users").doc(uid);

	docRef.get().then((doc) => {
		if (doc.exists) {
			if(doc.data()['searchID']){
				localStorage.setItem('searchID', doc.data()['searchID']);
			}else{
				id = generateID();
				docRef.update({'searchID': id});
				localStorage.setItem('searchID', id);
				console.log('New UserID generated: ' + id);
			}
		} else {
			console.log("No such document!");
		}
	}).catch((error) => {
		console.log("Error getting document:", error);
		showtoast('Some Error Occur', 5000, 'failure');
	});
}
