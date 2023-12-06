db.collection("Messages").onSnapshot((querySnapshot) => {
    querySnapshot.forEach((doc) => {
        console.log(doc.data());
    });
});

window.addEventListener('online', updateStatus);
window.addEventListener('offline', updateStatus);

function updateStatus() {
    var status = document.getElementById('online_status');
    if (navigator.onLine) {
        status.style.display = 'none';
        showtoast('Connection Found', 3000, 'success');
    } else {
        status.style.display = 'inline-block';
        showtoast('Connection Lost', 4000, 'failure');        
    }
};

function full_image(url, id, typ){
    console.log(url, typ, id);
    $('.full_screen_element').empty();
    var a = firebase.storage().refFromURL(url);
    $('.file_name').text(a.name);
    full_typ = typ;
    $('#download-file').attr('onclick', `downloadFile('${url}')`);
        if(typ.includes('image')){
            $('.full_screen_element').append(`<img id="fullElement" class="full_element full_element_img" style="cursor:zoom-in" onclick="Zoom()" src="${url}" loading="eager">`);
            $('.full_screen_view').css('display', 'flex');
        }else if(typ.includes("video")){
            $('.full_screen_element').append(`<video class="full_element" controls autoplay><source src="${url}" type="${typ}"></video>`);
            $('.full_screen_view').css('display', 'flex');                        
        }
}

function download(source){
    downloadImage(source);
}

function CloseFullScreenView(){
    $('.full_screen_element').empty();
    $('.full_screen_view').css('display', 'none');                        
}


async function downloadImage(imageSrc) {
    window.win = open(imageSrc);
    setTimeout('win.document.execCommand("SaveAs")', 0);
}

var zoom;
function Zoom(){
    $('#fullElement').css('transform','scale(1.5)');
    $('#fullElement').css('cursor', 'zoom-out');
    $('#fullElement').attr('onclick', 'ZoomOut()');
}


function ZoomOut(){
    $('#fullElement').css('transform', 'scale(1)');
    $('#fullElement').css('cursor', 'zoom-in');
    $('#fullElement').attr('onclick', 'Zoom()');    
}

function sizeunits(bytes){
  if      (bytes >= 1073741824) { bytes = (bytes / 1073741824).toFixed(0) + " GB"; }
  else if (bytes >= 1048576)    { bytes = (bytes / 1048576).toFixed(0) + " MB"; }
  else if (bytes >= 1024)       { bytes = (bytes / 1024).toFixed(0) + " KB"; }
  else if (bytes > 1)           { bytes = bytes + " bytes"; }
  else if (bytes == 1)          { bytes = bytes + " byte"; }
  else                          { bytes = "0 bytes"; }
  return bytes;
}

function downloadFile(url){
    showtoast('Downloading File');
  var a = firebase.storage().refFromURL(url)
  fetch(url, {
      headers: new Headers({
        'Origin': location.origin,
      }),
      mode: 'cors'
    })
    .then(response => response.blob())
    .then(blob => {
      let blobUrl = window.URL.createObjectURL(blob);
      console.log(blobUrl);
      forceDownload(blobUrl, a.name);
    })
    .catch(e => console.error(e));
}

function forceDownload(blob, filename) {
  var a = document.createElement('a');
  a.download = filename;
  a.href = blob;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

var oldName;
var oldStatus;
var oldPic;

function editInfo(){
	$('.user-edit-container').show();
    var user = JSON.parse(localStorage.getItem('user-info'));
    $('.edit-info-img').attr('src', user['Profile_Picture']);
    oldPic = user['Profile_Picture'];
    oldName = user['Name'];
    oldStatus = user['Status'];
    $('#edit-info-name').val(user['Name']);
    $('#edit-info-status').val(user['Status']);
}

function saveUserInfo(){   
    var name = $('#edit-info-name').val();
    var status = $('#edit-info-status').val();
    var pic = $('.edit-info-img').attr('src');
    var data;
    if(name != oldName){
        data = {
            'Name':name,
        }
        console.info('name');
    }else if(status != oldStatus){
        data = {
            'Status':status,
        }
        console.info('status');
    }else if(pic != oldPic){
        data = {
            'Profile_Picture': pic,
        }
        console.info('pic');
    }else if(name != oldName && pic != oldPic){
        data = {
            'Name':name,
            'Profile_Picture': pic,
        }
        console.info('name, pic');
    }else if(name != oldName && status != oldStatus){
        data = {
            'Name':name,
            'Status':status,
        }
        console.info('name, status');
    }else if(pic != oldPic && status != oldStatus){
        data = {
            'Status':status,
            'Profile_Picture': pic,
        }
        console.info('status, pic');
    }else if(name != oldName && status !== oldStatus && pic !== oldPic){
        data = {
            'Name':name,
            'Profile_Picture': pic,
            'Status':status,
        }
        console.info('all');
    }else{
        console.info('No Changes Find');
    }
    $('.user-edit-container').hide();
    db.collection("Users").doc(uid).update(data)
    .then(() => {
        showtoast('Profile Updated!!',3000, 'success');
    })
    .catch((error) => {
        showtoast('Some Error Occur',3000, 'failure');
    });
}

function ImageGen(){
    setTimeout(function(){
         var img = AvatarImage($('#edit-info-name').val(), 100);
        $('.edit-info-img').attr('src', img);
    },100);
    setTimeout(function(){
         var img = AvatarImage($('#edit-info-name').val(), 100);
        $('.edit-info-img').attr('src', img);
    },200);
    setTimeout(function(){
         var img = AvatarImage($('#edit-info-name').val(), 100);
        $('.edit-info-img').attr('src', img);
    },300);
    setTimeout(function(){
         var img = AvatarImage($('#edit-info-name').val(), 100);
        $('.edit-info-img').attr('src', img);
    },400);
    setTimeout(function(){
         var img = AvatarImage($('#edit-info-name').val(), 100);
        $('.edit-info-img').attr('src', img);
    },500);
    setTimeout(function(){
         var img = AvatarImage($('#edit-info-name').val(), 100);
        $('.edit-info-img').attr('src', img);
    },600);
    setTimeout(function(){
         var img = AvatarImage($('#edit-info-name').val(), 100);
        $('.edit-info-img').attr('src', img);
    },700);
    setTimeout(function(){
         var img = AvatarImage($('#edit-info-name').val(), 100);
        $('.edit-info-img').attr('src', img);
    },800);
}

$(function() {
    $("#upload-image:file").change(function (){
        var data = $(this)[0].files[0];
        console.log(data);
        var fr = new FileReader();
        fr.onload = function(){
            if (data.type.match('image.*')) {
                console.log(fr);
                $('.edit-info-img').attr('src', fr.result);                    
            }
        }
        fr.readAsDataURL($(this)[0].files[0]);
    });
});
