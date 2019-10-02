$(document).ready(function(){
	$("#signup-form").hide();
	$("#choose").hide();
	$("#upload").hide();

//authentification
	$("#btnlogin").click(function(){
		$("#msgerror").innerHTML = "";

		firebase.auth().signInWithEmailAndPassword($("#email_log").val() , $("#password_log").val()).then(function(){
			sessionStorage.setItem("signup" , "signin");
			$(location).attr("href" , '../../html/redirectToindex.html');	
		}).catch(function(error) {
		  // Handle Errors here.
			var errorMessage = error.message;
			if( errorMessage.includes("unreachable") )
			{ 	
				$("body").append("<div class='alert'>You're offline please verifie your connection and try again</div>");
				new Audio('../songs/notification.mp3').play();
				$(".alert").click(function()
				{
						$(this).remove();
				});
			}else{
				msgerror.innerHTML = errorMessage;
			}
		  // ...
		});
	});


var ui = new firebaseui.auth.AuthUI(firebase.auth());

	var uiConfig = {
					callbacks: {
						signInSuccessWithAuthResult: function(authResult, redirectUrl) {
							userPhone = authResult;
							var user = authResult.user;
							var isNewUser = authResult.additionalUserInfo.isNewUser;
							var providerID = authResult.additionalUserInfo.providerId;
							sessionStorage.setItem("signup" , "signup");
							sessionStorage.setItem("providerID" , providerID);
							var displayName = user.displayName;
							var email = user.email;
							var photoURL = user.photoURL;
							var numberPhone = authResult.user.phoneNumber;
							if (isNewUser == true) {

								if( providerID == "google.com")
								{
									user.delete();
									$("#signup-form").show();
									$("#profile").html("<img src='" + photoURL + "'>");
				
									$("#firstname").val(displayName.split(' ')[0]);
									$("#firstname").prev('label').addClass('active highlight');
				
									$("#lastname").val(displayName.split(' ')[1]);
									$("#lastname").prev('label').addClass('active highlight');
				
									$("#email").val( email );
									$("#email").prev('label').addClass('active highlight');
				
									$("#firebaseui-sign-up").hide();
								}
								else if( providerID == "phone" )
								{
									user.delete();
									$("#signup-form").show();
									$("#profile").addClass("fas fa-user-circle fa-5x");
									$("#choose").show();
									$("#email").val( numberPhone + "@idtracker.ml" );
									$("#email").prev('label').addClass('active highlight');	
								}

						} else {
							sessionStorage.setItem("click" , "click");
							location.reload();
						}

							return false;
						}
					},
					// Will use popup for IDP Providers sign-in flow instead of the default, redirect.
					signInFlow: 'popup',
					signInOptions: [
						// Leave the lines as is for the providers you want to offer your users.
						firebase.auth.GoogleAuthProvider.PROVIDER_ID,
					//	firebase.auth.FacebookAuthProvider.PROVIDER_ID,
						firebase.auth.PhoneAuthProvider.PROVIDER_ID,
						firebase.auth.TwitterAuthProvider.PROVIDER_ID,
						firebase.auth.GithubAuthProvider.PROVIDER_ID,
						firebase.auth.EmailAuthProvider.PROVIDER_ID,
					]
				};

				// The start method will wait until the DOM is loaded.
				ui.start('.firebaseui-sign-up', uiConfig);
	


			// create new account 
			function createNewUserGOOGLE( email , password , firstname , lastname , photoURL)
			{
				firebase.auth().createUserWithEmailAndPassword(email, password)
				.then(
					(user)=>{
						var db = firebase.firestore();
						var docRef = db.collection("Profiles").doc(email.replace('@'  , '').replace('.' , '').replace('+' , ''));
						docRef.set({
							nom_user: firstname,
							prenom_user: lastname,
							profilepicture: photoURL
						}
						).then( function(doc){

							sessionStorage.setItem("userId" , email.replace('@'  , '').replace('.' , '').replace('+' , ''));		
							sessionStorage.setItem("email" , email);
							firebase.auth().signInWithEmailAndPassword( email , password ).then(function(){
							$(location).attr("href" , '../../html/profile.html');
								
							});
						})
					});
			}

			function createNewUserPHONE( email , password , firstname , lastname )
			{
					var link = $("#fileToUploid").get(0).files[0];

					var storage = firebase.storage().ref(link.name);

					var task = storage.put(link);
					
					$("#upload").show();
					task.on('state_changed', 

							function progress(snapshot)
							{
								var pr = (snapshot.bytesTransferred / snapshot.totalBytes ) * 100;

								$("#upload").val(pr);
							},

							function error(err)
							{
									console.log(err);
									$("body").append("<div class='alert'>Sorry we can't your profile image</div>");
									new Audio('../songs/notification.mp3').play();
									$(".alert").click(function()
									{
										$(this).remove();
									});
							},
							function complete()
							{
								var ptURL = 'https://firebasestorage.googleapis.com/v0/b/idtracker-a7f0d.appspot.com/o/' + link.name +'?alt=media&token=d0902ee4-5bd8-4959-b56e-ebe846f0cbd5';
								createNewUserGOOGLE( email , password , firstname , lastname , ptURL);
							}
					);
			}


			// sign up by clicking in get started
			$("#getStarted").click(function()
			{
							var email = $("#email").val();
							var password = $("#password").val();
							var firstname = $("#firstname").val();
							var lastname = $("#lastname").val();
							var photoURL = $("#profile > img").attr('src');

							if( email.length > 0 && password.length > 0 && firstname.length > 0 && lastname.length > 0 )
							{
								if( sessionStorage.getItem("providerID") == "google.com" )
									createNewUserGOOGLE( email , password , firstname , lastname , photoURL);
								else if( sessionStorage.getItem("providerID") == "phone" )
								{
									var link = $("#fileToUploid").get(0).files[0]; 
									console.log(link);
									if( link != undefined)
									{
										createNewUserPHONE( email , password , firstname , lastname );
									}else{
										$("#selectpicture").css({
											"border" : "1px solid red"
										});
									}
								}	
														
							}else{

								if( email == "" )
								{
									$("#email").css({"border" : "1px solid red"});
								}

								if( password == "" )
								{
									$("#password").css({"border" : "1px solid red"});
								}

								if( firstname == "" )
								{
									$("#firstname").css({"border" : "1px solid red"});
								}

								if( lastname == "" )
								{
									$("#lastname").css({"border" : "1px solid red"});
								}
							}

			});



			// firebaseui signin

			// events
				
			$('.tab a').on('click', function (e) {
					
					e.preventDefault();
					$(this).parent().addClass('active');
					$(this).parent().siblings().removeClass('active');
					
					target = $(this).attr('href');
				
					$('.tab-content > div').not(target).hide();
					$("#msgerror").html("");
					$(target).fadeIn(600);
					
				});

			if( sessionStorage.getItem("click") == "click" )
			{
				$("#loginhref").click();
				$("#msgerror").html("You already have an account with this email please try to login")
				sessionStorage.removeItem("click");
			}


			$('.form').find('input, textarea').on('keyup blur focus', function (e) {
  
				var $this = $(this),
						label = $this.prev('label');
			
					if (e.type === 'keyup' || e.type === 'change') {
						if ($this.val() === '') {
								label.removeClass('active highlight');
							} else {
								label.addClass('active highlight');
								$this.css({"border" : "1px solid #a0b3b0"});
							}
					} else if (e.type === 'blur') {
						if( $this.val() === '' ) {
							label.removeClass('active highlight'); 
						} else {
							label.removeClass('highlight');   
						}   
					} else if (e.type === 'focus') {
						
						if( $this.val() === '' ) {
							label.removeClass('highlight'); 
						} 
						else if( $this.val() !== '' ) {
							label.addClass('highlight');
						}
					}
			
			});


			$("#selectpicture").click(function(){
					$("#fileToUploid").click();
			});


			$("#fileToUploid").on('change' , function(e){

				$("#profile").removeClass("fas fa-user-circle fa-5x");

				var link = e.target.files[0];

				var reader = new FileReader();
            
				reader.onload = function (e) {
					$("#profile").html("<img src='" + e.target.result + "'/>");
				}

				reader.readAsDataURL(link);
				
				$("#selectpicture").css({
					"border" : "1px solid white"
				});

			});

			$("#confirmepassword").on('keyup focus', function(){

					if( $(this).val() != $("#password").val() )
						$(this).css({"border" : "1px solid red"});
					else
						$(this).css({"border" : "1px solid #a0b3b0"});

			});

			$("#password_log").keyup(function (e) {

				if( e.keyCode == 13)
				{
					$("#btnlogin").click();
				}

			});
	
});