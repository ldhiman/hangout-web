$('#Name').ready(function(){
  $('#Name').hide();  
})

$('#UserPhone').ready(function(){
  $('#UserPhone').hide();  
});

function sendVerificationLink(){
  $('#verify_btn').html('<i class="fa-solid fa-spinner fa-spin-pulse"></i>');
  
  firebase.auth().currentUser.sendEmailVerification()
  .then(() => {
    console.log('Link Sent');
    $('#verify_btn').html('Link Sent!!!');
    $('#verify_btn').attr('disabled','disabled');
    location.href="https://accounts.google.com/b/0/AddMailService";
  })
  .catch((err)=>{
    console.log(err);
    showtoast(err.message, 'failure', 5000);
    $('#verify_btn').attr('disabled','disabled');
    $('#verify_btn').html('Error Occur, Try again in 10 second');     
    setTimeout(function(){
        $('#verify_btn').html('Click to Send Verification Link');        
        $('#verify_btn').removeAttr('disabled');
    },10000);
  })
}

function forgot_password(){
  $('.holder-menu').hide();
  var email = firebase.auth().currentUser.email;
    firebase.auth().sendPasswordResetEmail(email)
    .then(() => {
      showtoast('Email Sent, Check your Inbox');
    })
    .catch((error) => {
      var errorCode = error.code;
      var errorMessage = error.message;
      showtoast(errorCode + ' ' +  errorMessage, 4000, 'failure');
    });
}

function user_forgot_password(){
  if(!$('#Email').val()){
    showtoast('Enter your Email ID'); 
  }else{
    document.getElementById("loader").style.display="block";
    var userEmail = $('#Email').val();
    firebase.auth().sendPasswordResetEmail(userEmail)
    .then(() => {
        showtoast('Email Sent, Check your Inbox');
        document.getElementById("loader").style.display="none";
    })
    .catch((error) => {
      var errorCode = error.code;
      var errorMessage = error.message;
      showtoast(errorCode + ' ' +  errorMessage, 4000, 'failure');
      document.getElementById("loader").style.display="none";
    });
  }
}

function user_register(){
    $('#UserPhone').show();  
    $('#Name').show();
    $('#forgot_link').hide();
    $('#register_link').text('Already have an account!!');
    $('#register_link').attr('onclick', 'user_login()');
    $('#login-card').css('top', '7vh');
    $('#btn_login').text('Register');
    $('#btn_login').attr('onclick', 'register()');
		$('#loader-bar').hide();
}

function register(){
	$('#loader-bar').show();
  var pnumber = phoneInput.getNumber();
  console.log(pnumber);
  var userName = $('#Name').val();
  var userEmail = $('#Email').val();
  var userPass = $('#Password').val();
  firebase.auth().createUserWithEmailAndPassword(userEmail, userPass)
  .then((userCredential) => { 
    var user = userCredential.user;
    setTimeout(function(){
      var id = generateID();
      console.log(id);
      db.collection("Users").doc(user.uid).set({
        Name: userName,
        Profile_Picture : AvatarImage(userName),
        Status: "Hello Friend",
        searchID: id,
        Phone: pnumber,
        Email: userEmail,
      })
      .then(() => {
        console.log("Document successfully written!");
      })
      .catch((error) => {
        console.error("Error writing document: ", error);
		    $('#loader-bar').hide();
      });
    },1);
  })
  .catch((error) => {
    var errorCode = error.code;
    var errorMessage = error.message;
    showtoast(errorMessage);
		$('#loader-bar').hide();
  });

}

function user_login(){
    $('#UserPhone').hide();  
    $('#Name').hide();
    $('#forgot_link').show();
    $('#register_link').text('Create an account!!');
    $('#register_link').attr('onclick', 'user_register()');
    $('#login-card').css('top', '15vh');
    $('#btn_login').text('Login');
    $('#btn_login').attr('onclick', 'login()');
		$('#loader-bar').hide();
}

function request(id){
  db.collection("Users").doc(id).get().then((doc) => {
    if (doc.exists) {
      $('.user-request-card-img').attr('src', doc.data()['Profile_Picture']);
      $('.user-request-card-name').text(doc.data()['Name']);
      $('.user-request-card-id').text(doc.data()['searchID']);
      $('.user-request-card-status').text(doc.data()['Status']);
      $('#accept').attr('onclick', `accept('${id}')`);
      $('#deny').attr('onclick', `deny('${id}')`);
      $('.user-request-card').show();
    }else{
      showtoast('user not exist', 4000);
    }
  }).catch((error) => {
    showtoast("Some error occur, Try Again", 4000, 'failure');
  });
}

function accept(id){
  $('.user-request-card').hide();      
  db.collection('Users').doc(uid).collection('friends').doc(id).update({'accept':true}).then(()=>{
    showtoast('Friend Request Accepted');
    $(`.friend-request-view #${id}`).remove();
  });
  db.collection('Users').doc(id).collection('friends').doc(uid).update({'accept':true});
}

function deny(id){
  $('.user-request-card').hide();  
  db.collection('Users').doc(uid).collection('friends').doc(id).update({'accept':'deny'}).then(()=>{
    showtoast('Friend Request Denied');
    $(`.friend-request-view #${id}`).remove();    
  });
  db.collection('Users').doc(id).collection('friends').doc(uid).update({'accept':'deny'});
}

 const alphabet = [
      'A','B','C','D','E','F',
      'G','H','I','J','K','L',
      'M','N','O','P','Q','R',
      'S','T','U','V','W','X',
      'Y','Z' 
  ];
    
 function encryptText() {
  
  const form = document.forms[0];
  
  let title=
   document.getElementById("titleId");  
     
  title.innerHTML = "Encrypted text";
  
  let shift= Number(form.shift.value); 
     
  let sourceText =  
    form.sourceText.value;       
     
  form.sourceText.value 
    = [... sourceText ].map(char =>
      encrypt(char, shift)).join('');
 }
    
 function decryptText() {
  const form = document.forms[0];
  let title = document.getElementById("titleId");       
  
  title.innerHTML = "Plain text";
       
  let shift =   
    Number(form.shift.value);
  let sourceText = 
    form.sourceText.value;    
     
  shift = 
     (alphabet.length - shift) %  
      alphabet.length;
    
  form.sourceText.value 
      = [... sourceText ].map(char => 
        encrypt(char,    
        shift)).join('');
 }
    
 function encrypt(char, shift) {
  let include =        
   alphabet.includes(
    char.toUpperCase()); 
     
  if (include){      
   let position =         
    alphabet.indexOf(
     char.toUpperCase());
      
  let newPosition = 
    (position+shift) %  
      alphabet.length;
  return alphabet[newPosition];
 }else  return char;
}        