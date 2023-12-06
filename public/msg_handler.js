var current = null;
window.curent_online = false;					

function LoadUserChat(id){
	firebase.database().ref('verified/'+id).get().then((snapshot) => {
      if (snapshot.exists()) {
        verified = snapshot.val()['verified'];
		if(verified == true){
			$('#verified').show();
		}else{
			$('#verified').hide();
		}
      }else{
		$('#verified').hide();  
	  }
    }).catch((error)=>{
		$('#verified').hide();
		console.log(error)
	});
	$('.initial').hide();
	window.current = id;
	
	$('.header-img').attr('src', sessionStorage.getItem(`${id}-img`));
	$('.header-name').html(sessionStorage.getItem(`${id}-name`));
	$('.header-name').attr('onclick', `ShowFriendDetail('${id}')`);
	$('.header-search-id').html('ID: ' + sessionStorage.getItem(`${id}-id`));

	

	$('#header_lastseen').text('Click here for more info');
	check_fav();
	getFriend(current);
	$('.chat-holder-viewer').hide();
	$(`#${current}chat`).show();
	$(`#${current}unread`).text('')
	$(`#${current}unread`).hide();
	$(`#${current}chat`).scrollTop($(`#${current}chat`)[0].scrollHeight);

	try{
		dbRef.child("users").child(id).get().then((snapshot) => {
			if (snapshot.exists()) {
				if(snapshot.val()['online'] == true){
					$('#header_lastseen').text('Online');
					window.curent_online = true;
				}
				else if((new Date().getTime() - 24*60*60*1000) <= snapshot.val()['lastSeen']){
					time = handle_time(snapshot.val()['lastSeen']);
					$('#header_lastseen').text('last seen today at ' + time);
					window.curent_online = false;					
				}else{
					time = handle_time(snapshot.val()['lastSeen']);
					$('#header_lastseen').text('last seen on ' + time + ' at ' + getTime(snapshot.val()['lastSeen']));
					window.curent_online = false;					
				}
			}
		});
	}catch(err){
		$('#header_lastseen').text(sessionStorage.getItem(`${id}-status`));
	}
}

 

function urlify(text) {
  var urlRegex = /(https?:\/\/[^\s]+)/g;
  return text.replace(urlRegex, function(url) {
	  if(matchYoutubeUrl(url)){
		  return '<div class="youtube-iframe"><iframe style="width:-webkit-fill-available" src="https://www.youtube.com/embed/'+ getID(url)+'"frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>' + `<a style="width:min-content" href="${url}">${url}</a></div>`;
	  }else{
    	return '<a href="' + url + '">' + url + '</a>';
	  }
  })
}

function getID(url) {
            VID_REGEX =
/(?:youtube(?:-nocookie)?\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
            return url.match(VID_REGEX)[1];
        }

function matchYoutubeUrl(url) {
    var p = /^(?:https?:\/\/)?(?:m\.|www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})(?:\S+)?$/;
    if(url.match(p)){
        return url.match(p)[1];
    }
    return false;
}


function add_date(date, id, data){
	var dateid = date.replaceAll('/','')
	if(date == getDate(new Date().getTime())){
		$('.view').append(`<div class='holder'> <div class="hr-text">Today</div><div id="${dateid}" class='chat-holder'></div></div>`);
	}else if(date == getDate((new Date().getTime())-86400000)){
		$('.view').append(`<div class='holder'> <div class="hr-text">Yesterday</div><div id="${dateid}" class='chat-holder'></div></div>`);
	}else if(data['time'] > (new Date().getTime()-604800000)){
		diff_week = new Date().getTime()-604800000;
		day = new Date(data['time']).getDay();
		$('.view').append(`<div class='holder'> <div class="hr-text">${weekdays[day]}</div><div id="${dateid}" class='chat-holder'></div></div>`);
	}else{
		$('.view').append(`<div class='holder'> <div class="hr-text">${date}</div><div id="${dateid}" class='chat-holder'></div></div>`);
	}
	add_chat(dateid, id, data);
}




$(function() {

    var $contextMenu = $("#contextMenu");

    $("body").on("contextmenu", "table tr", function(e) {
         $contextMenu.css({
              display: "block",
              left: e.pageX,
              top: e.pageY
         });
        debugger;
         return false;
    });

    $('html').click(function() {
         $contextMenu.hide();
    });
  
  $("#contextMenu li a").click(function(e){
    var  f = $(this);
    debugger;
  });

});


var new_msg;

function sendMsg(){
	$('#sendBtn').attr('disabled','disabled');
	var msg = $('.msg').val();
	localStorage.setItem(`lastMsg${current}`, msg);
	localStorage.setItem(`lastMsgTime${current}`, new Date().getTime());
	var msg = encryptWithAES(msg);
	$('.msg').val('');
	if(msg.length !== 0 && msg){
		var selfref = db.collection('Messages').doc(uid).collection('message').add({
			from: uid,
			to:current,
			message: msg,
			seenby: false,
			time: new Date().getTime(),
			type:'text',
			encrypt: true,
		}).then((docRef) => {
			new_msg = docRef.id;
	    	var userref = db.collection('Messages').doc(current).collection('message').doc(docRef.id).set({
					from: uid,
					to:current,
					message: msg,
					seenby: false,
					time: new Date().getTime(),
					type:'text',
					encrypt: true,					
			}).then(()=>{
	 			$('#sendBtn').removeAttr('disabled');
				db.collection('Users').doc(uid).collection('friends').doc(current).update({'timestamp': new  Date().getTime()})
				db.collection('Users').doc(current).collection('friends').doc(uid).update({'timestamp': new  Date().getTime()})
			}).catch((error) => {
	 			$('#sendBtn').removeAttr('disabled');
				db.collection('Messages').doc(uid).collection(userid).doc(docRef).delete();
	    		console.error("Error adding document: ", error);
				showtoast('Some Error Occur, Please try again', 'failure');
			})
		})
		.catch((error) => {
	 		$('#sendBtn').removeAttr('disabled');
	    	console.error("Error adding document: ", error);
			showtoast('Some Error Occur, Please try again', 'failure');
		});
	}else{
		$('#sendBtn').removeAttr('disabled');
	}
}

function hideSearch(){
	$('.search-friend').hide();
}

function showSearch(){
	$('.holder-menu').hide();
	$('.search-friend').show();
}