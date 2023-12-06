function Empty(){
    var a = $('.msg').val();
    if (a == null || a == ""){
        $('#sendBtn').text('mic');
        $('#sendBtn').attr('onclick','record()');
    }else{
        $('#sendBtn').text('send');
        $('#sendBtn').attr('onclick','sendMsg()');
    }
}

function record(){
    $('#sendBtn').text('stop_circle');
    $('#sendBtn').toggleClass('micOn');
    $('#sendBtn').attr('onclick','cancelrecord()');
    initaliseRecord();
}

function cancelrecord(){
    $('#sendBtn').toggleClass('micOn');
    mediaRecorder.stop(); 
    Empty();
}

var mediaRecorder;

function initaliseRecord(){
    navigator.mediaDevices.getUserMedia({audio: true, video:false})
    .then(stream => {
        mediaRecorder = new MediaRecorder(stream);
        mediaRecorder.start();
        $('.msg').hide();
        $('.audio-record').show();        
        var audioChunks = [];

        mediaRecorder.addEventListener("dataavailable", event => {
            if (event.data.size > 0){audioChunks.push(event.data)}
        });

        mediaRecorder.addEventListener("stop", () => {
            console.log(audioChunks);
            var audioBlob = new Blob(audioChunks, {type: 'audio/mp3'});
            var audioUrl = URL.createObjectURL(audioBlob);
            console.log(audioUrl);
            $('#SendBtn').hide();
            $('#recorded').attr('src', audioUrl);
            $('.spinner-box').hide();
            $('.audio-record').hide();                              
            $('.audio').show();
            $('.audio-send').attr('onclick', `sendrecord("${audioUrl}")`);
        });
    }).catch( err => {
        console.log("u got an error:" + err);
        $('#sendBtn').toggleClass('micOn');
        showtoast(err, 4000, 'failure');
        Empty();
    });
}

function discardrecord(){
    $('.msg').show();
    $('.spinner-box').show();
    $('#SendBtn').show();
    $('.audio').hide();
}
var azz;
var reader;
function sendrecord(audioUrl){1
    azz = audioUrl;
    $('.msg').show();
    $('.spinner-box').show();
    $('#SendBtn').show();
    $('.audio').hide();
   sendAudioFile(azz);
}

function toTime(seconds) {
       var date = new Date(null);
       date.setSeconds(seconds);
       return date.toISOString().substr(14, 5);
    }

function sendAudioFile(file){
    var filename = randomString(8)+'.mp3'    
    var xhr = new XMLHttpRequest;
    xhr.responseType = 'blob';

    xhr.onload = function() {
        var recoveredBlob = xhr.response;
        var reader = new FileReader;
        reader.onload = function() {
            var blobAsDataUrl = reader.result;
            console.log(blobAsDataUrl);
            sendToServer(blobAsDataUrl, 'audio/mp3', filename, current, 'abcd');
        };
        reader.readAsDataURL(recoveredBlob);
    };

    xhr.open('GET', file);
    xhr.send();
}