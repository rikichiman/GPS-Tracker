$(document).ready(function(){

	firebase.auth().onAuthStateChanged(function(user) {
	  if (user) {

			var email = user.email;

			if( sessionStorage.getItem("signup") != "signup" )
			{
				var uidString = email.replace('@' , '');
				sessionStorage.setItem("userId" , uidString.replace('.' , '').replace('+' , ''));		
				sessionStorage.setItem("email" , email);
				//redirect to profile if user is already signed in
				$(location).attr("href" , '../../html/profile.html');
			}

		} else {
		// User is signed out.
				//$(location).attr("href" , 'index.html');
				return;
		 //alert("you're signed mr" + sessionStorage.getItem("userId"));
		// ...
	  }
});
	
});