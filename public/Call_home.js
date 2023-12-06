var starCountRef = firebase.database().ref('call');

var timeout;

starCountRef.on('child_added', (data) => {
  console.log(data.val());  
  if(data.val() != null){
    if(data.val()['to'] == window.uid){
        firebase.database().ref('call/'+data.key).update({'state':'Ringing...'});        
        $(".incoming-call").html(`<img src="${data.val()['pic']}"><div>${data.val()['name']}</div><button class="answer" onclick="AnswerCall('${data.key}')">Answer</button><button class="reject" onclick="RejectCall('${data.key}')">Reject</button>`);
        $(".incoming-call").show();
        ring.play();
        timeout = setTimeout(function(){
            ring.pause();
            end.play();
            firebase.database().ref('call/'+key).update({'state':'Not Answered'});
            $(".incoming-call").hide();
        }, 30000);
    }
  }
});

$(".incoming-call").hide();

function AnswerCall(key){
        clearTimeout(timeout);
        ring.pause();
        firebase.database().ref('call/'+key).update({'state':'Answered'});
        $(".incoming-call").hide();    
        location.assign("Call.html#"+key);
}

function RejectCall(key){
        clearTimeout(timeout);
        ring.pause();
        end.play();
        firebase.database().ref('call/'+key).update({'state':'Reject'});
        $(".incoming-call").hide();
}



function makeCall(){ 					
    if(window.curent_online){
        ref=firebase.database().ref('call')
        ref.push({
            'from': window.uid,
            'to': window.current,
            'time': new Date().getTime(),
            'state':'Calling...',
            'pic': window.propic,
            'name': window.selfName,
        })
        .then(res => {
            console.log(res.getKey())
            location.assign("Call.html#"+res.getKey());
        })
        .catch(error => console.log(error));
    }else{
        showtoast("User is offline");
    }
}