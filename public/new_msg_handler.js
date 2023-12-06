function loadMessages() {
    db.collection('Messages').doc(uid).collection('message').orderBy('time')
        .onSnapshot((snapshot) => {
            snapshot.docChanges().forEach((change) => {
                if (change.type === "added") {
                    handleAddedMessage(change.doc);
                } else if (change.type === "modified") {
                    console.log("Modified city: ", change.doc.data());
                } else if (change.type === "removed") {
                    console.log("Removed city: ", change.doc.data());
                }
            });
        });
}

function handleAddedMessage(doc) {
    const data = doc.data();
    const sender = data['from'];
    const msg_type = data['type'];
    const time = data['time'];

    if (current !== null) {
        if (sender === uid) {
            handleOutgoingMessage(doc, msg_type, time);
        } else {
            handleIncomingMessage(doc, sender, msg_type, time);
        }
    } else {
        try {
            addMessage(doc.id, data);
        } catch (err) {
            console.log(doc.id);
        }
    }
}

function handleOutgoingMessage(doc, msg_type, time) {
    const data_msg = data['message'];
    const code = generateMessageCode(data_msg, msg_type, uid);
    
    $(`#${data['to']}chat`).append(`
        <div id="${doc.id}" class="chat-user-self" data-type="${msg_type}" data-url="${data_msg}" oncontextmenu="javascript:Showmenu('${doc.id}', '${uid}');return false;" style="align-self:flex-end;background:transparent;order:${time}">
            ${code}              			
        </div>`);

    localStorage.setItem(`lastMsg${data['to']}`, `${msg_type}`);
    localStorage.setItem(`lastMsgTime${data['to']}`, time);

    if (doc.id === new_msg || (new Date().getTime() - time) <= 100) {
        $(`#${current}chat`).scrollTop($(`#${current}chat`)[0].scrollHeight);
    }
}

function handleIncomingMessage(doc, sender, msg_type, time) {
    const data_msg = doc.data()['message'];
    const code = generateMessageCode(data_msg, msg_type, sender);
    const name = $(`#${sender}Name`).text();

    showtoast(`${name}: ${decryptWithAES(data_msg, sender)}`, 5000);

    const greeting = new Notification(decryptWithAES(data_msg, sender), {
        body: `${name}: ${decryptWithAES(data_msg, sender)}`,
        icon: './logobg.png'
    });

    setTimeout(() => greeting.close(), 5 * 1000);
    greeting.onclick = () => window.open('https://www.hangoutweb.web.app/');

    if ($(`#${sender}unread`).text()) {
        $(`#${sender}unread`).text((parseInt($(`#${sender}unread`).text()) + 1));
    } else {
        $(`#${sender}unread`).text('1');
        $(`#${sender}unread`).show();
    }

    $(`#${sender}chat`).append(`
        <div id="${doc.id}" class="chat-user" data-type="${msg_type}" data-url="${data_msg}" oncontextmenu="javascript:Showmenu('${doc.id}', '${sender}');return false;" style="align-self:flex-start;background:transparent;order:${time}">
            ${code}
        </div>	`);

    localStorage.setItem(`lastMsg${sender}`, `${msg_type}`);
    localStorage.setItem(`lastMsgTime${sender}`, time);
}

function generateMessageCode(data_msg, msg_type, sender) {
    let code = "";
    let code_type = "";

    if (msg_type.includes('image')) {
        code = generateImageCode(data_msg, sender);
        code_type = "image";
    } else if (msg_type.includes('video')) {
        code = generateVideoCode(data_msg, sender);
        code_type = "video";
    } else if (msg_type.includes('application')) {
        code = generatePdfCode(data_msg);
        code_type = "pdf";
    } else if (msg_type.includes('audio')) {
        code = generateAudioCode(data_msg);
        code_type = "audio";
    } else {
        const data_msg_text = (data['encrypt']) ? urlify(decryptWithAES(data_msg, sender)) : urlify(data_msg);
        code = generateTextCode(data_msg_text, sender);
        code_type = "text";
    }

    return code;
}

// Define functions for generating code for different message types, e.g., generateImageCode, generateVideoCode, etc.
function generateImageCode(data_msg, sender) {
    // Image Code
    return `
        <div class='msgholder img_loading' onclick="full_image('${data_msg}', '${id}', 'image')">
            <img id="${id}-msg-img" class="msg_img" src='${data_msg}' alt="image" loading="eager">
            <div class="img_time" style='font-size:10px'>${getTime(data['time'])}</div>
            <div class="img_shadow"></div>
        </div>`;
}

function generateVideoCode(data_msg, sender) {
    // Video Code
    return `
        <div class='vid_loading msgholder' style="background:white;" onclick="full_image('${data_msg}', '${id}', 'video')">
            <video id="${id}-msg-video" class="msg_vid" src='${data_msg}' alt="video" loading="lazy">
            </video>
            <i class="fa-solid fa-circle-play play_btn"></i>
            <div class="img_time" style='font-size:10px;bottom:30px;'>${getTime(data['time'])}</div>
            <div class="img_shadow"></div>
        </div>`;
}

function generatePdfCode(data_msg) {
    // PDF Code
    return `
        <div style="display: flex;flex-direction: row;justify-content: space-between;align-items: center;background: #00000030;margin:1px;padding: 5px;border-radius: 8px;">
            <img src="https://img.icons8.com/color/36/000000/pdf-2--v1.png"/>
            <span style="display:inline-flex;flex-direction:column;">
                <span>${a.name}</span>
            </span>
            </span>
            <span style="cursor:pointer;font-size:32px;margin: 5px;" class="material-icons material-icons-outlined" onclick="downloadFile('${data_msg}')">downloading</span>
        </div>
        <div style="width:100%;display:inline-flex;justify-content:space-between;">
            <div style="height:50%;font-size:10px;">${sizeunits(metadata.size)} &bull; ${metadata.contentType.split('/')[1].toUpperCase()}</div>
            <div style='height:50%;float:right;font-size:10px'>${getTime(data['time'])}</div>
        </div>`;
}

function generateAudioCode(data_msg) {
    // Audio Code
    return `
        <div class='audio_loading msgholder' style="background:transparent;position:relative;border-radius: 8px;padding: 5px;">
            <audio id="${id}-msg-video" preload="auto" volume="50" controls class="msg_aud" src='${data_msg}' alt="audio" style="border-radius: 26px;width:auto;">
            </audio>
            <div style="display:flex;font-size:small">
                <span>${a.name.substr(0, 20)}... &nbsp;</span>
                <span>&bull; ${sizeunits(metadata.size)} &nbsp;</span>
                <div>&bull; ${getTime(data['time'])} &nbsp;&nbsp;&nbsp;</div>
            </div>
        </div>`;
}

function generateTextCode(data_msg_text, sender) {
    // Text Code
    return `
        <div id="${id}" class="chat-user-self" data-type="text" oncontextmenu="javascript:Showmenu('${id}', '${sender}');return false;"style="align-self:flex-end;order:${time}">
            <div class='msgholder'>${data_msg_text}</div>
            <div class="space">
                <div  style='height:50%;float:right;font-size:10px'>${getTime(data['time'])}</div>
            </div>
        </div>`;
}

