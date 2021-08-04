$(window).on("load", function(event) {
    if(localStorage.getItem("user_id") != 101) {
        window.location.replace("../login.html")
    } else {
        console.log("allowed")
    }
})