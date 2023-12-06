// Generate random room name if needed
var current = sessionStorage.getItem('current');
var hash;
if (!location.hash) {
  location.hash = Math.floor(Math.random() * 0xFFFFFF).toString(16);
  hash = location.hash;
}else{
  hash = location.hash;  
}
const roomHash = location.hash.substring(1);

var starCountRef = firebase.database().ref('call/'+roomHash);
starCountRef.on('value', (snapshot) => {
  const data = snapshot.val();
  console.log(snapshot.val());
  try{
    state.innerHTML=snapshot.val().state;
  }catch(err){}
  if(snapshot.val().state == "Not Answered" || snapshot.val().state == "Reject"){
    setTimeout(function(){
      drone.close();
    },1500);    
  }
});

starCountRef.on('child_removed', function(){
  drone.close();
})


var EndCall = setTimeout(function(){
  state.innerHTML="Not Answerd....";
  firebase.database().ref('call').child(roomHash).remove();  
  alert("Call not answered... \n Click OK to end the call");
  ring.pause();
  end.play();
  history.back();
},60000);

var ring = document.getElementById("ring");
var end = document.getElementById("end");
var remote = document.getElementById("remoteVideo");
var state = document.getElementById("state");

let mic_switch = true;
let video_switch = true;
var localStream;

function toggleVideo() {
  if(localStream != null && localStream.getVideoTracks().length > 0){
    video_switch = !video_switch;
    if($('#video_btn').text() =='videocam_off'){
      $('#video_btn').text('videocam');
        firebase.database().ref('call/'+roomHash).update({'state':'Camera Off'});                        
    }else{
      $('#video_btn').text('videocam_off');
        firebase.database().ref('call/'+roomHash).update({'state':'Camera On'});      
    }
    localStream.getVideoTracks()[0].enabled = video_switch;
  }

}

function toggleMic() {
  if(localStream != null && localStream.getAudioTracks().length > 0){
    mic_switch = !mic_switch;
    if($('#mic_btn').text() =='mic_off'){
      $('#mic_btn').text('mic');
        firebase.database().ref('call/'+roomHash).update({'state':'Muted'});
    }else{
      $('#mic_btn').text('mic_off');
        firebase.database().ref('call/'+roomHash).update({'state':'Unmuted'});      
    }
  }     
}
state.innerHTML="Calling....";

const drone = new ScaleDrone(//Scale Drone API Key);
const roomName = 'observable-' + roomHash;
const configuration = {
  /*iceServers: [{url:'stun:stun01.sipphone.com'},
{url:'stun:stun.ekiga.net'},
{url:'stun:stun.fwdnet.net'},
{url:'stun:stun.ideasip.com'},
{url:'stun:stun.iptel.org'},
{url:'stun:stun.rixtelecom.se'},
{url:'stun:stun.schlund.de'},
{url:'stun:stun.l.google.com:19302'},
{url:'stun:stun1.l.google.com:19302'},
{url:'stun:stun2.l.google.com:19302'},
{url:'stun:stun3.l.google.com:19302'},
{url:'stun:stun4.l.google.com:19302'},
{url:'stun:stunserver.org'},
{url:'stun:stun.softjoys.com'},
{url:'stun:stun.voiparound.com'},
{url:'stun:stun.voipbuster.com'},
{url:'stun:stun.voipstunt.com'},
{url:'stun:stun.voxgratia.org'},
{url:'stun:stun.xten.com'}]*/
iceServers: [{
   urls: 'stun:stun.l.google.com:19302' // Google's public STUN server
 }]
};

let room;
let pc;


setInterval(showTime, 1000);


function onSuccess() {
  console.log("connected");
  state.innerHTML="Connected";
  ring.pause();
  remote.style.display = "block"
  clearTimeout(EndCall);
  state.style.display="none";
};
function onError(error) {
  console.error(error);
};

function showTime() {
    let time = new Date();
    let hour = time.getHours();
    let min = time.getMinutes();
    let sec = time.getSeconds();
    am_pm = "AM";
 
    if (hour > 12) {
        hour -= 12;
        am_pm = "PM";
    }
    if (hour == 0) {
        hr = 12;
        am_pm = "AM";
    }
 
    hour = hour < 10 ? "0" + hour : hour;
    min = min < 10 ? "0" + min : min;
    sec = sec < 10 ? "0" + sec : sec;
 
    let currentTime = hour + ":"
            + min + ":" + sec + am_pm;
 
    document.getElementById("clock")
            .innerHTML = currentTime;
}


window.onbeforeunload = closingCode;
function closingCode(){
   state.innerHTML="Call Ended";
   setTimeout(function(){
           firebase.database().ref('call').child(roomHash).remove()
   });
   alert("confirm exit is being called");
   return false;
}


drone.on('open', error => {
  if (error) {
    return console.error(error);
  }
  room = drone.subscribe(roomName);
  room.on('open', error => {
    if (error) {
      onError(error);
    }
  });
  // We're connected to the room and received an array of 'members'
  // connected to the room (including us). Signaling server is ready.
  room.on('members', members => {
    console.log('MEMBERS', members);
    // If we are the second user to connect to the room we will be creating the offer
    const isOfferer = members.length === 2;
    startWebRTC(isOfferer);
  });
});


//on call end
drone.on('close', event => {
  state.innerHTML="Call Ended";
  end.play();    
  firebase.database().ref('call').child(roomHash).remove()
  .then(function(){
    end.play();
    ring.pause();
    history.back();
  });
});
  

// Send signaling data via Scaledrone
function sendMessage(message) {
  drone.publish({
    room: roomName,
    message
  });
}



function startWebRTC(isOfferer) {
  pc = new RTCPeerConnection(configuration);

  // 'onicecandidate' notifies us whenever an ICE agent needs to deliver a
  // message to the other peer through the signaling server
  pc.onicecandidate = event => {
    if (event.candidate) {
      sendMessage({'candidate': event.candidate});
    }
  };

  // If user is offerer let the 'negotiationneeded' event create the offer
  if (isOfferer) {
    pc.onnegotiationneeded = () => {
      pc.createOffer().then(localDescCreated).catch(onError);
    }
  }

  // When a remote stream arrives display it in the #remoteVideo element
  pc.ontrack = event => {
    const stream = event.streams[0];
    if (!remoteVideo.srcObject || remoteVideo.srcObject.id !== stream.id) {
      remoteVideo.srcObject = stream;

      if(!stream.getAudioTracks()[0].enabled){
        state.innerHTML="Muted!!";
      }else{
        state.innerHTML="UnMuted!!";
        setTimeout(function(){
          state.innerHTML="";
        })
      }

      if(!stream.getVideoTracks()[0].enabled){
        state.innerHTML="Video Paused!!";
      }else{
        state.innerHTML="Video Resumed!!";
        setTimeout(function(){
          state.innerHTML="";
        })
      }
    }
  };


  navigator.mediaDevices.getUserMedia({
    audio: true,
    video: true,
  }).then(stream => {
    // Display your local video in #localVideo element
    localVideo.srcObject = stream;
    localStream = stream;
    ring.play();
    //ring.play();
    // Add your stream to be sent to the conneting peer
    stream.getTracks().forEach(track => pc.addTrack(track, stream));
  }, function(){
  firebase.database().ref('call').child(roomHash).remove()
    
  });

  // Listen to signaling data from Scaledrone
  room.on('data', (message, client) => {
    // Message was sent by us
    if (client.id === drone.clientId) {
      return;
    }

    if (message.sdp) {
      // This is called after receiving an offer or answer from another peer
      pc.setRemoteDescription(new RTCSessionDescription(message.sdp), () => {
        // When receiving an offer lets answer it
        if (pc.remoteDescription.type === 'offer') {
          pc.createAnswer().then(localDescCreated).catch(onError);
        }
      }, onError);
    } else if (message.candidate) {
      // Add the new ICE candidate to our connections remote description
      pc.addIceCandidate(
        new RTCIceCandidate(message.candidate), onSuccess, onError
      );
    }
  });
}

function localDescCreated(desc) {
  pc.setLocalDescription(
    desc,
    () => sendMessage({'sdp': pc.localDescription}),
    onError
  );
}
