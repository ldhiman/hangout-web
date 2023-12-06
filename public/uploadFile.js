function sendStory(file, types, filename, sendTo){
    var name = new Date().getTime();
    var ref = storageRef.child(uid +'/story/' + `${name}` +'.'+ `${filename.split('.')[1]}` );
    $('.story-container').hide();
    showtoast('Sending Story...');

    var metadata = {
        contentType: types
    };

    var uploadTask = ref.put(file, metadata);

    uploadTask.on('state_changed', 
    (snapshot) => {
        var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.info('Upload is ' + Math.round(progress) + '% done');
        switch (snapshot.state) {
        case firebase.storage.TaskState.PAUSED: // or 'paused'
            console.log('Upload is paused');
            break;
        case firebase.storage.TaskState.RUNNING: // or 'running'
            console.log('Upload is running');
            break;
        }
    }, 
    (error) => {
        showtoast('Some error occur');
    }, 
    () => {
        uploadTask.snapshot.ref.getDownloadURL().then((downloadURL) => {
         console.log('File available at', downloadURL);
         showtoast('Story Successfully uploaded..');
        });
    }
    );
}