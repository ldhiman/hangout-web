setTimeout(function(){
		db.collection('Messages').doc(uid).collection('message').orderBy('time')
    .onSnapshot((snapshot) => {
        snapshot.docChanges().forEach((change) => {
			if (change.type === "added") {
					if (current !== null){
						if(change.doc.data()['from'] == uid){
							console.log(change.doc.data()['from']);						
								addMessage(change.doc.id, change.doc.data());			
						}else{
							if(change.doc.data()['from'] == current){
							console.log(change.doc.data()['from']);
								
								addMessage(change.doc.id, change.doc.data());
							}else{
								console.log(change.doc.data()['from']);
								addMessage(change.doc.id, change.doc.data());
								var name = $(`#${change.doc.data()['from']}Name`).text();
								
								showtoast(`${name}: ${decryptWithAES(change.doc.data()['message'], change.doc.data()['from'])}`, 5000);

								const greeting = new Notification(decryptWithAES(change.doc.data()['message'], change.doc.data()['from']),{
									body: `${name}: ${decryptWithAES(change.doc.data()['message'], change.doc.data()['from'])}`,
									icon: './logobg.png'
								});
								setTimeout(() => greeting.close(), 5*1000);
								greeting.onclick = () => window.open('https://www.hangoutweb.web.app/');

								if($(`#${change.doc.data()['from']}unread`).text()){
									$(`#${change.doc.data()['from']}unread`).text((parseInt($(`#${change.doc.data()['from']}unread`).text())+1))
								}else{
									$(`#${change.doc.data()['from']}unread`).text('1')
									$(`#${change.doc.data()['from']}unread`).show();
								}
							}
						}
					}else{
						try{
							addMessage(change.doc.id, change.doc.data());
						}catch(err){
							console.log(change.doc.id);
						}
					}
			}
			if (change.type === "modified") {
				console.log("Modified city: ", change.doc.data());
			}
			if (change.type === "removed") {
				console.log("Removed city: ", change.doc.data());
			}
    	});
	});
	}, 4000);

function addMessage(id, data){
    add_chat(id, data);
}

function add_chat(id, data){
    var data = data;
	var sender = data['from']
	var msg_type = data['type'];
    var time = data['time'];
	if(msg_type.includes('image')){
		//Image Code
		var data_msg = data['message'];
		var ImageCode = `<div class='msgholder img_loading' onclick="full_image('${data_msg}', '${id}', '${msg_type}')">
							<img id="${id}-msg-img" class="msg_img" src='${data_msg}' alt="image" loading="eager">
                			<div class="img_time" style='font-size:10px'>${getTime(data['time'])}</div>
							<div class="img_shadow"></div>
						</div>`
		if(sender == uid){  
                $(`#${data['to']}chat`).append(`
                	<div id="${id}" class="chat-user-self" data-type="image" data-url="${data_msg}" oncontextmenu="javascript:Showmenu('${id}', '${sender}');return false;" style="align-self:flex-end;background:transparent;order:${time}">
                		${ImageCode}              			
                	</div>`);

					localStorage.setItem(`lastMsg${data['to']}`, 'Image');
					localStorage.setItem(`lastMsgTime${data['to']}`, time);

            	}else{
            	  $(`#${data['from']}chat`).append(`<div id="${id}" class="chat-user" data-type="image" data-url="${data_msg}" oncontextmenu="javascript:Showmenu('${id}', '${sender}');return false;" style="align-self:flex-start;background:transparent;order:${time}">
                		${ImageCode}
                	</div>	`);
					localStorage.setItem(`lastMsg${data['from']}`, 'Image');
					localStorage.setItem(`lastMsgTime${data['from']}`, time);	
            }
	
	$(`#${id}`).nextAll().remove();

	}else if(msg_type.includes('video')){
		//Video Code
		var data_msg = data['message'];
		var video_code = `
		<div class='vid_loading msgholder' style="background:white;" onclick="full_image('${data_msg}', '${id}', '${msg_type}')">
						<video id="${id}-msg-video" class="msg_vid" src='${data_msg}' alt="video" loading="lazy">
						</video>
						<i class="fa-solid fa-circle-play play_btn"></i>						
                		<div class="img_time" style='font-size:10px;bottom:30px;'>${getTime(data['time'])}</div>
						<div class="img_shadow"></div>												
						</div>
						`;
		if(sender == uid){
                $(`#${data['to']}chat`).append(`
                	<div id="${id}"  class="chat-user-self" data-type="video" data-url="${data_msg}" oncontextmenu="javascript:Showmenu('${id}', '${sender}');return false;" style="align-self:flex-end;background:transparent;order:${time}">
                		${video_code}
                	</div>	`);

					
					localStorage.setItem(`lastMsg${data['to']}`, 'Video');
					localStorage.setItem(`lastMsgTime${data['to']}`, time);

            	}else{
            	  $(`#${data['from']}chat`).append(`<div id="${id}" class="chat-user" data-type="video" data-url="${data_msg}" oncontextmenu="javascript:Showmenu('${id}','${sender}');return false;" style="align-self:flex-start;background:transparent;order:${time}">
					${video_code}
                	</div>	`);

					
					localStorage.setItem(`lastMsg${data['from']}`, 'Video');
					localStorage.setItem(`lastMsgTime${data['from']}`, time);

            }
	$(`#${id}`).nextAll().remove();

	}else if(msg_type.includes('application')){
		//PDF Code
		var data_msg = data['message'];
		var a = firebase.storage().refFromURL(data_msg);
		a.getMetadata().then((metadata) => {
	  	var pdf_code = `
				<div style="display: flex;flex-direction: row;justify-content: space-between;align-items: center;background: #00000030;margin:1px;padding: 5px;border-radius: 8px;">
				<img src="https://img.icons8.com/color/36/000000/pdf-2--v1.png"/>
				<span style="display:inline-flex;flex-direction:column;">
					<span>${a.name}</span>
				</span>
				</span><span style="cursor:pointer;font-size:32px;margin: 5px;" class="material-icons material-icons-outlined" onclick="downloadFile('${data_msg}')">downloading</span>
				</div>
				<div style="width:100%;display:inline-flex;justify-content:space-between;">
            	    <div style="height:50%;font-size:10px;">${sizeunits(metadata.size)} &bull; ${metadata.contentType.split('/')[1].toUpperCase()}</div><div style='height:50%;float:right;font-size:10px'>${getTime(data['time'])}</div>
				</div>	
		`;
		if(sender == uid){
                $(`#${data['to']}chat`).append(`
                	<div id="${id}"  class="chat-user-self" data-type="pdf" data-url="${data_msg}" oncontextmenu="javascript:Showmenu('${id}', '${sender}');return false;" style="align-self:flex-end;background:transparent;order:${time}">
                		<div class='msgholder'>
							<div class="pdf_holder">
								${pdf_code}
							</div>
						</div>              		
                	</div>	`);
					
					localStorage.setItem(`lastMsg${data['to']}`, 'File');
					localStorage.setItem(`lastMsgTime${data['to']}`, time);
            	}else{
            	  $(`#${data['from']}chat`).append(`<div id="${id}" class="chat-user" data-type="pdf" data-url="${data_msg}" oncontextmenu="javascript:Showmenu('${id}', '${sender}');return false;" style="align-self:flex-start;background:transparent;order:${time}">
                		<div class='msgholder'>
							<div class="pdf_holder_user">
								${pdf_code}
							</div>
						</div>
                	</div>	`);
					localStorage.setItem(`lastMsg${data['from']}`, 'File');
					localStorage.setItem(`lastMsgTime${data['from']}`, time);	
            }
	$(`#${id}`).nextAll().remove();
  })
  .catch((error) => {
    console.log(error.message);
    showtoast(error.message);
  });
		
	}else if(msg_type.includes('audio')){
		//Audio Code
		var data_msg = data['message'];
		var a = firebase.storage().refFromURL(data_msg);
		a.getMetadata().then((metadata) => {
		var audio_code = `
			<div class='audio_loading msgholder' style="background:transparent;position:relative;border-radius: 8px;padding: 5px;">
						<audio id="${id}-msg-video" preload="auto" volume="50" controls class="msg_aud" src='${data_msg}' alt="audio" style="border-radius: 26px;width:auto;">
						</audio>
						<div style="display:flex;font-size:small">
							<span>${a.name.substr(0, 20)}... &nbsp;</span>
							<span>&bull; ${sizeunits(metadata.size)} &nbsp;</span>
							<div>&bull; ${getTime(data['time'])} &nbsp;&nbsp;&nbsp;</div>
						</div>						
						</div>
						`;
		if(sender == uid){
                $(`#${data['to']}chat`).append(`
                	<div id="${id}"  class="chat-user-self" data-type="audio" data-url="${data_msg}" oncontextmenu="javascript:Showmenu('${id}', '${sender}');return false;" style="align-self:flex-end;order:${time}">
                		${audio_code}
                	</div>	`);
					localStorage.setItem(`lastMsg${data['to']}`, 'Audio');
					localStorage.setItem(`lastMsgTime${data['to']}`, time);
            	}else{
            	  $(`#${data['from']}chat`).append(`<div id="${id}" class="chat-user" data-type="audio" data-url="${data_msg}" oncontextmenu="javascript:Showmenu('${id}','${sender}');return false;" style="align-self:flex-start;order:${time}">
					${audio_code}
                	</div>	`);
					localStorage.setItem(`lastMsg${data['from']}`, 'Audio');
					localStorage.setItem(`lastMsgTime${data['from']}`, time);		
            }
		});
	$(`#${id}`).nextAll().remove();
	}else{
		var data_msg;
		if(data['encrypt']){
			data_msg = urlify(decryptWithAES(data['message'], sender));
		}else{
			data_msg = urlify(data['message']);
		}
		if(sender == uid){
            msg = `<div id="${id}" class="chat-user-self" data-type="text" oncontextmenu="javascript:Showmenu('${id}', '${sender}');return false;"style="align-self:flex-end;order:${time}">
                		<div class='msgholder'>${data_msg}</div>
                		<div class="space">
                			<div  style='height:50%;float:right;font-size:10px'>${getTime(data['time'])}</div>
                		</div>	
                	</div>`
                    
                    $(`#${data['to']}chat`).append(msg);
				localStorage.setItem(`lastMsg${data['to']}`, data_msg);
				localStorage.setItem(`lastMsgTime${data['to']}`, time);
            	}else{
            	  $(`#${data['from']}chat`).append(`<div id="${id}" class="chat-user" data-type="text" oncontextmenu="javascript:Showmenu('${id}', '${sender}');return false;" style="align-self:flex-start;order:${time}">
                		<div class='msgholder'>${data_msg}</div>
                		<div  style='height:50%;font-size:10px;float:right'>${getTime(data['time'])}</div>
                	</div>	`);
				localStorage.setItem(`lastMsg${data['from']}`, data_msg);
				localStorage.setItem(`lastMsgTime${data['from']}`, time);	
            }
	$(`#${id}`).nextAll().remove();
	}
	if(id == new_msg || (new Date().getTime() - time) <= 100){
			$(`#${current}chat`).scrollTop($(`#${current}chat`)[0].scrollHeight);
	}
}	