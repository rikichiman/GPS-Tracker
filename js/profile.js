$(document).ready(function(){
    var lastconOfsset = [] , lastconValue = [];

        $("#ul_logout li label").click(function()
        {
            firebase.auth().signOut().then(function() {
    
                sessionStorage.clear();
                $(location).attr("href" , 'redirectToindex.html');
    
            }).catch(function(error) {
                // An error happened.
                $(location).attr("href" , '../404.html');
              });
        });

    var db = firebase.firestore();
	var docRef = db.collection("Profiles").doc(sessionStorage.userId);

        docRef.get().then(function(doc) {
            if (doc.exists) {
                $("#username").html( doc.data().prenom_user + " " + doc.data().nom_user);
                $("#li_email p").html( sessionStorage.getItem("email") );

                $("#profile_image").removeClass("fas fa-user-circle fa-7x");
                $("#profile_image").css({"border" : "none"});
                $("#profile_image").html("<img src='" + doc.data().profilepicture + "' >");

                $("#prifile_picture").removeClass("fas fa-user-circle fa-7x");
                $("#prifile_picture").css({"border" : "none"});
                $("#prifile_picture").html("<img  src='" + doc.data().profilepicture + "' >");

            } else {
                // doc.data() will be undefined in this case
            }
        }).catch(function(error) {
           /* firebase.auth().signOut().then(function() {
    
                sessionStorage.clear();
               $(location).attr("href" , '../404.html');
               alert("load userdata : " + error);
            });*/
            alert("load userdata : " + error);
        });
    
    //load cibles
    db.collection("Profiles/" + sessionStorage.userId + "/cibles")
    .get()
    .then(function(querySnapshot) {
        if( querySnapshot != null )
        {
            querySnapshot.forEach(function(doc) {
                lastconOfsset.push(doc.id);
                // doc.data() is never undefined for query doc snapshots
                $("#list_cibles > select").append("<option value='"+ doc.id + "'>" + doc.data().pseudo + "</option>");
            });
            $("#list_cibles > select").append("<option value='all'>all</option>");                                
        }else{
            $("#list_cibles > select").prop('disabled', 'disabled');
        }

    })
    .catch(function(error) {
        firebase.auth().signOut().then(function() {
            sessionStorage.clear();
           $(location).attr("href" , '../404.html');
            alert("load cibles");
        });
    }); 

    /*function disconnect()
    {
        for( var i = 0 ; i < lastconOfsset.length ; i++)
        {
            var defaultref = firebase.database().ref("users/"+sessionStorage.userId+ "/" + lastconOfsset[i] );

            defaultref.on('value', function(snapshot) {

                if( lastconValue[i] != undefined && lastconValue[i] != null )
                {
                        if(  snapshot.val().lastcon < (lastconValue[i] + 5000) )
                        {
                            defaultref.set().then( snap => {

                            });

                        }else
                        {

                        }
                }

            });
        }
    }*/


    $("#option").draggable();
    $("#option").hide();
    $("#definePeriode").hide();
    $("#option").mouseleave(function () { 
        $(this).hide();
    });

    $("#show_more").mouseover(function()
    {   
        if( $("#selectlist").find(":selected").text() != "Choose here"  && $("#selectlist").find(":selected").text() != "all" )
            $("#option").show();
    });

    $("#close_periode").click(function(){
        $("#r_history").prop('checked' , false );
            $(this).parent().hide();
    });


});

