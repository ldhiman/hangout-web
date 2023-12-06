function check_online(){
    $('.user-list > div').map(function() {
        var id = this.id;
        dbRef.child("users").child(id).get().then((snapshot) => {
            if (snapshot.exists()) {
                if(snapshot.val()['online'] == true){
                    $(`#${id}-online`).css('display', 'inline-block');
                    $(`#${id}Img`).css('border-color', 'green');
                    $(`#${id}Img`).css('padding', '1px');
                    if(current == id){
                        $('#header-online').css('display', 'inline-block');
                    }else{
                        $('#header-online').css('display', 'none');
                    }
                }else{
                    time = handle_time(snapshot.val()['lastSeen']);
                    $(`#${id}-lastSeen-menu`).text(time);
                    $(`#${id}-online`).css('display', 'none');
                    if(localStorage.getItem(`lastMsg${id}`)){
                        var time = localStorage.getItem(`lastMsgTime${id}`);
                        time = handle_time(parseInt(time));
                        $(`#${id}Status`).html(localStorage.getItem(`lastMsg${id}`));
                        $(`#${id}-lastSeen`).html(time);
                        $(`#${id}Img`).css('border-color', 'transparent');
                        $(`#${id}Img`).css('padding', '0px');                                                
                    }
                }
            }
        })
    });
}


setInterval(function(){check_online()}, 1000);

const dbRef = firebase.database().ref();

check_online();

function search_friend() {
        let input = document.getElementById('search').value
        input = input.toLowerCase();
        let x = document.getElementsByClassName('user-list-holder');

        if (x => none) {
            document.getElementById('no-search').style.display = "flex";
        } else {
            document.getElementById('no-search').style.display = "none";
        }

        for (i = 0; i < x.length; i++) {
            if (!x[i].innerHTML.toLowerCase().includes(input)) {
                x[i].style.display = "none";
            }
            else {
                x[i].style.display = "flex";
                document.getElementById('no-search').style.display = "none";
            }
        }
}

function Showmenu(id, sender){
    var msg_type = $(`#${id}`).data('type');
    console.info(`lastMsg${sender}`);
    localStorage.removeItem(`lastMsg${sender}`);
    if(sender == uid){
        $('.menu').html(`
            <button onclick="deleteMsg('self','${id}', '${msg_type}')" class="delete">Delete from Me</button>
		    <button class="delete" onclick="deleteMsg('both','${id}','${msg_type}')">Delete from Everyone</button>
        `);
        $('.menu').show();
    }else{
        $('.menu').html(`
            <button onclick="deleteMsg('self','${id}', '${msg_type}')" class="delete">Delete Message</button>
		`);
        $('.menu').show();
    }
}    

$(document).ready(function(){
    $("#search").on("input", function(){
        search_friend();
    });
});

$(document).mouseup(function(e){
    e.preventDefault(); 
    var container = $(".menu");
    if (!container.is(e.target) && container.has(e.target).length === 0) {
        container.hide();
    }
});


$(document).mouseup(function(e){
    e.preventDefault(); 
    var container = $(".friend-request-card");
    if (!container.is(e.target) && container.has(e.target).length === 0) {
        container.hide();
    }
});

$(document).mouseup(function(e){
    e.preventDefault(); 
    var container = $(".holder-menu");
    if (!container.is(e.target) && container.has(e.target).length === 0) {
        container.hide();
    }
});

$(document).mouseup(function(e){
    e.preventDefault(); 
    var container = $(".user-request-card");
    if (!container.is(e.target) && container.has(e.target).length === 0) {
        container.hide();
    }
});

$(document).mouseup(function(e) {
    e.preventDefault();     
    var container = $(".user-profile-card");
    if (!container.is(e.target) && container.has(e.target).length === 0) {
        container.hide();
    }
});

$(document).mouseup(function(e) {
    e.preventDefault();     
    var container = $(".user-edit-pane");
    if (!container.is(e.target) && container.has(e.target).length === 0) {
        $('.user-edit-container').hide();
    }
});

$(document).mouseup(function(e) {
    e.preventDefault();     
    var container = $(".UploadFile");
    if (!container.is(e.target) && container.has(e.target).length === 0) {
        container.hide();
    }
});

function searchUser(){
    $('.search-result').empty();
    var id= $('.input-id').val();
    var n =0;
    db.collection("Users").where("searchID", "==", id).get().then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
            n++;
			$('.search-result').append(`
            <div class='user-search-holder' id="${doc.id}search">
                <img class='search-user-img' src="${doc.data()['Profile_Picture']}"><span class='search-user-name'>${doc.data()['Name']}</span><button class="default-button" style="margin-left: auto;margin-right: 5px;border-color:#4f7dfe" onclick="AddFriend('${doc.id}')"> Add Friend </button>
            </div>
            `)
        });
        if(n==0){
            $('.search-result').append(`
            <div class='user-search-holder'>
                <div id='no-search'><img src="https://c.tenor.com/unvXyxtdn3oAAAAC/no-result.gif" style="width:100%;height:100%;"></div>
            </div>
            `)
        }
    })
    .catch((error) => {
        console.log("Error getting documents: ", error);
        showtoast("Some error occur in finding user ID", 6000, 'failure');        
    });
}

function AddFriend(id){
    db.collection('Users').doc(uid).collection('friends').doc(id).set({'timestamp': new Date().getTime(), 'accept':false, 'type':'sent'});
    db.collection('Users').doc(id).collection('friends').doc(uid).set({'timestamp': new Date().getTime(), 'accept':false, 'type':'request'});
    showtoast('Friend Request Sent!!');
    $(`#${id}search .default-button`).html('<span class="material-icons material-symbols-outlined">done</span>');
    $(`#${id}search .default-button`).attr('disabled', 'disabled');
    $(`#${id}listfriend`).html('<span class="material-icons material-symbols-outlined">done</span>');
    $(`#${id}listfriend`).attr('onclick', '');
}
