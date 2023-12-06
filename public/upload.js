const storageRef = firebase.storage().ref();
const dbMessages = db.collection('Messages');
const dbUsers = db.collection('Users');

// Query DOM elements once and store references
const $fileSend = $('#file-send');
const $filePreview = $('.file-preview');
const $uploadFile = $('.UploadFile');
const $circleBorder = $('.circle-border');
const $uploadBtn = $('#UploadBtn');
const $sendBtn = $('.sendBtn');

function loadUpload() {
    $fileSend.hide();
    $filePreview.empty();
    $uploadFile.show();
}

function randomString(length) {
    const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz'.split('');

    if (!length) {
        length = Math.floor(Math.random() * chars.length);
    }

    let str = '';
    for (let i = 0; i < length; i++) {
        str += chars[Math.floor(Math.random() * chars.length)];
    }
    return str;
}

// Handle errors with a function instead of a global handler
function handleError(message) {
    $circleBorder.css('background', 'none');
    $uploadBtn.removeAttr('disabled');
    showtoast(message);
}

async function sendToServer(file, type, filename, sendTo, data) {
    $uploadFile.hide();
    $('.filePreview').remove();
    console.log(file);
    showtoast('Sending File ' + filename);
    fileType = type;
    $circleBorder.css('background', 'linear-gradient(0deg, rgb(0 0 0 / 0%) 33%, rgb(217 19 255) 100%)');
    $uploadBtn.attr('disabled', 'disabled');

    try {
        const uploadTask = storageRef.child(uid + '/file/' + `${filename}`).putString(file, 'data_url');
        const snapshot = await uploadTask;
        const metadata = await snapshot.ref.getMetadata();
        const downloadURL = await snapshot.ref.getDownloadURL();

        console.log('File available at', downloadURL);
        $sendBtn.attr('onclick', '');
        const today = new Date();
        await send(downloadURL, sendTo);

    } catch (error) {
        handleError(error.message);
    }
}

async function send(url, sendTo) {
    try {
        const docRef = await dbMessages.doc(uid).collection('message').add({
            from: uid,
            to: current,
            message: url,
            seenby: false,
            time: new Date().getTime(),
            type: fileType,
        });

        await dbMessages.doc(sendTo).collection('message').doc(docRef.id).set({
            from: uid,
            to: current,
            message: url,
            seenby: false,
            time: new Date().getTime(),
            type: fileType,
        });

        showtoast('File Sended Successfully', 5000, 'success');
        $circleBorder.css('background', 'none');
        $uploadBtn.removeAttr('disabled');
        localStorage.setItem(`lastMsg${sendTo}`, 'image');
        localStorage.setItem(`lastMsgTime${sendTo}`, new Date().getTime());
        await dbUsers.doc(uid).collection('friends').doc(sendTo).update({ timestamp: new Date().getTime() });
        await dbUsers.doc(sendTo).collection('friends').doc(uid).update({ timestamp: new Date().getTime() });

    } catch (error) {
        handleError('Some Error Occur, Please try again');
    }
}
