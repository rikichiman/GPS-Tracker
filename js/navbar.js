$(document).ready(function()
{
   $("#sec_nav").hide(); //hide navbar first

    // show left navbar
    $("#bar").click(function(){
        $("#sec_nav").show();
    });

    // hide navbar
    $("#right_bar").click(function()
    {
        $("#sec_nav").hide();
    });
    $("#button_p").click(function()
    {
        $("#sec_nav").hide();
    });

    $("#target_list  ul  li  a").click(function(){
        alert("hhhhh");
    });
    
});