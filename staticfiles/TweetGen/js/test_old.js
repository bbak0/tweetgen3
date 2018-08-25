


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
			//reset variables to initial values
			tweets = [];
			clearTimeout(timeout);
			finished = 0;
			posted = false;
			inputHandler($("#screen_name_form").val());
			let nr = nameArray.length;
			getTweets(); // gets tweets and puts them in tweets array (async)

			//if every twitter handle is correct, the callback from getTweets should
			//display the result automatically, otherwise tweets array is checked after
			//7 seconds: if it is still empty display an error, otherwise generate a tweet

			timeout = setTimeout(function() {
				if (!posted){
					if (tweets.length === 0){
						$("#noTweetsErrorModal").modal('show');
						$("#output-tweet-text").text("„Despite the constant negative press covfefe”").fadeTo(500, 1);
					} else {
						let x = generateTweet(tweets);
						$("#output-tweet-text").text("„" + x + "”").fadeTo(500, 1);
						posted = true;
					}
				}
			}, 7000);

			//slide animation with different behavior for mobile and pc
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
			if (shown) {
				$("#output-tweet-text").fadeTo(500, 0);
			}
			shown = true;

		}

	});
	//custom twitter share button that includes generated tweet and #TweetGen hashtag
	$("#share-button").on("click", function(){
		let tweet = $("#output-tweet-text").text();
		tweet = tweet.slice(1,tweet.length - 1);
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

//generate and return a tweet based on array of tweets
function generateTweet(array){
	let tweet = "";
	for (let i = 0; i < 3; i++){
		let a = getRandomInt(0,array.length);
		let temp = array[a].split(" ");
		let x = Math.floor(temp.length / 3);
		for (let j = 0 + i*x; j < x + i*x && temp.length; j++){
			tweet = tweet + " " + temp[j];
		}
	}
	return tweet;

}


function getRandomInt(min, max) {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
}

//takes care of user's input
function inputHandler(input){
	let removeSpaces = input.replace(/\s/g, '');
	let x = removeSpaces.split(",");
	nameArray = Array.from(new Set(x));
	name_len = nameArray.length;
}

//calls getTwitterProfile for every user's input
function getTweets(){
	while (nameArray.length > 0){
		let name = nameArray.pop();
		getTwitterProfile(name);
	}
}

//uses twitterFetcher with custom config to retrieve profile
function getTwitterProfile(screenName){
	let config = {
		"profile": {"screenName": screenName},
		"domId": 'exampleProfile',
		"maxTweets": 30,
		"enableLinks": false,
		"showUser": false,
		"showTime": false,
		"showImages": false,
		"showInteraction": false,
		"lang": 'en',
		"showRetweet": false,
		"showPermalinks": false,
		"dataOnly": true,
		"customCallback": getProfileCallback
	}
	twitterFetcher.fetch(config);

}

//its called automatically by twitterFetcher after fetching a getProfileCallback
//converts returned data to tweets and adds them to tweets array
function getProfileCallback(data){

	let tweetArray = [];
	for (let i = 0; i < data.length; i++){
		tweetArray.push(strip(data[i].tweet));
	}
	let a = cleanTweets(tweetArray);
	for (let i = 0; i < a.length; i++){
		if (a[i] !== ""){
			tweets.push(a[i]);
		}

	}
	finished++;

	if (finished === name_len && !posted){
		let x = generateTweet(tweets);
		timeout = setTimeout(function() {
			$("#output-tweet-text").text("„" + x + "”").fadeTo(500, 1);
		}, 500);

		posted = true;
	}



}

// gets rid of links and undesired characters
function cleanTweets(arr){
	let out = [];
	for (let i = 0; i < arr.length; i++){
		let index = arr[i].lastIndexOf("://");
		if (index === -1){
			out.push(arr[i]);
		} else {
			out.push(arr[i].slice(0, index - 5));
		}
	}
	for (let i = 0; i < out.length; i++){
		out[i] = out[i].replace(/[^\w\s]/gi, '');
	}
	return out;
}

//gets rid of html tags etc.
function strip(html)
{
	var tmp = document.createElement("DIV");
	tmp.innerHTML = html;
	return tmp.textContent || tmp.innerText || "";
}
