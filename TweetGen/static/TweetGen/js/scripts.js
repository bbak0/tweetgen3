

$(document).ready(function() {

	$.ajaxSetup({
		beforeSend: function(xhr, settings) {
			if (!this.crossDomain) {
				xhr.setRequestHeader("X-CSRFToken", csrftoken);
			}
		}
	});
	
	function getCookie(name) {
		var cookieValue = null;
		if (document.cookie && document.cookie !== '') {
			var cookies = document.cookie.split(';');
			for (var i = 0; i < cookies.length; i++) {
				var cookie = jQuery.trim(cookies[i]);
				// Does this cookie string begin with the name we want?
				if (cookie.substring(0, name.length + 1) === (name + '=')) {
					cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
					break;
				}
			}
		}
		return cookieValue;
	}
	var csrftoken = getCookie('csrftoken');

	$(function () {
	  $('[data-toggle="popover"]').popover()
	})

	$("#close-button").on("click", function(){
		$("#explanation-div").fadeOut(500, function(){
			$("#recommendations").fadeIn();
		});
	});


	$(".give-space").on("click", function(event){
		let x = $("#screen_name_form").val();
		if (x === ""){
			x = event.target.innerText.substr(1);
		} else {
			x = x + ", " + event.target.innerText.substr(1);
		}
		$("#screen_name_form").val(x);
	});

	
	$('#screen_name_form').keypress(function (e) {
  if (e.which == 13) {
    $('#get_button').click(); 
    return false;
  }
});


	
	$("#get_button").on("click", function(){

		
		if ($("#screen_name_form").val() === ""){
			$("#emptyErrorModal").modal('show');

		} else { 
			$('#get_button').prop('disabled', true);
			$('#output-tweet-text').html("<i class=\"fa fa-cog fa-spin fa-fw\"></i>");
			
			var input = $('#screen_name_form').val();
			console.log(input)
			/*if (shown) {
				$("#output-tweet-text").fadeTo(500, 0);
			}
			shown = true;*/

			$.ajax({
				url: '/ajax/get_tweet/',
				data: {
					'input': input,
					'csrfmiddlewaretoken': csrftoken
				},
				dataType: 'json',
				success: function(data){
					console.log(data.tweet);
					$("#output-tweet-text").fadeTo(500, 0).queue( function() {
						$("#output-tweet-text").text(data.tweet);
						$('#get_button').prop('disabled', false);
						$(this).dequeue();
					}).fadeTo(500, 1);

				},
				error: function(){
					$('#get_button').prop('disabled', false);
					$("#noTweetsErrorModal").modal('show');
					$('#output-tweet-text').html(";[");
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


		}

	});
	
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
