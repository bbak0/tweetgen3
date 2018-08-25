


$(document).ready(function() {

//Explanation div close button
	$("#close-button").on("click", function(){
		$("#explanation-div").fadeOut(500, function(){
			$("#recommendations").fadeIn();
		});
	});

// Code for recommendation buttons
	$(".give-space").on("click", function(event){
		let x = $("#screen_name_form").val();
		if (x === ""){
			x = event.target.innerText.substr(1);
		} else {
			x = x + ", " + event.target.innerText.substr(1);
		}
		$("#screen_name_form").val(x);
	});

	// Generate tweets on enter keypress in the form
	$('#screen_name_form').keypress(function (e) {
  if (e.which == 13) {
    $('#get_button').click(); //click the button (this way behavior is consistent with the button)
    return false;
  }
});


	//generate tweet button
	$("#get_button").on("click", function(){

		//Show modal with error if input form empty
		if ($("#screen_name_form").val() === ""){
			$("#emptyErrorModal").modal('show');

		} else { //if not empty

			//if every twitter handle is correct, the callback from getTweets should
			//display the result automatically, otherwise tweets array is checked after
			//7 seconds: if it is still empty display an error, otherwise generate a tweet
			//slide animation with different behavior for mobile and pc
			var input = $('#screen_name_form').val();
			console.log(input)
			/*if (shown) {
				$("#output-tweet-text").fadeTo(500, 0);
			}
			shown = true;*/

			$.ajax({
				url: '/ajax/get_tweet/',
				data: {
					'input': input
				},
				dataType: 'json',
				success: function(data){
					console.log(data.tweet);
					$("#output-tweet-text").fadeTo(500, 0).queue( function() {
						$("#output-tweet-text").text(data.tweet);
						$(this).dequeue();
					}).fadeTo(500, 1);
				},
				error: function(){

				},

			})

			$("#output-jumbotron").slideDown();
			if ($(window).width() > 992){
				$('html, body').animate({
					scrollTop: $("#output-jumbotron").offset().top
				}, 2000);
			} else {
				$('html, body').animate({
					scrollTop: $("#get_button").offset().top
				}, 2000);
			}

			//if getting another quote, fade out old one


		}

	});
	//custom twitter share button that includes generated tweet and #TweetGen hashtag
	$("#share-button").on("click", function(){
		let tweet = $("#output-tweet-text").text();
		//tweet = tweet.slice(1,tweet.length - 1);
		tweet = encodeURIComponent(tweet);
		let url = "http://twitter.com/share?hashtags=TweetGen&text=" + tweet;
		let features = "width=575, height=400";
		window.open(url, 'share dis', features);
		return false;
	});


});

// global variables
var shown = false;
var nameArray;
var tweets = [];
var name_len;
var finished = 0;
var timeout;
var posted = false;
