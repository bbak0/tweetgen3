from twitter import *
from .models import Chain
import markovify
from django.utils.timezone import utc
import datetime
import re
from social_django.models import UserSocialAuth
from django.http import HttpResponse

USER_LIMIT = 3
UPDATE_THRESHOLD = 86400

#this function is called by view responsible for handling ajax request,
#returns tweet or None if error occured
def generateTweet(nameArray, userid):
    authinfo = UserSocialAuth.objects.get(user_id = userid)
    user_token = authinfo.extra_data['access_token']['oauth_token'] #get users' tokens
    user_token_secret = authinfo.extra_data['access_token']['oauth_token_secret']
    print(datetime.datetime.now())
    t = Twitter(
    auth=OAuth(user_token, user_token_secret,
    "IDDyDIvIVgPRmaDmdgusahoxG", "jk7fd9Uvc3S0t5xifnVVy5VJBeXKqLzOUr2GkPlMx4f7pG6qHk"))
    # for each name check if chain already exists and is up-to-date
    chainList = []
    nameArray = nameArray[:USER_LIMIT]
    for name in nameArray:
        if len(name) < 20:
            print(name)
            try:
                chain = Chain.objects.get(screen_name = name) #todo: add update chain
                used_chain = updateAndReturnChain(name, chain, t)
                print(used_chain)
                chainList.append(used_chain)
            except TwitterHTTPError:
                pass
            except Chain.DoesNotExist:
                tweetList, last_id = getAllTweets(name, t)
                chainList.append(generateChain(name, tweetList, last_id))
    if not chainList:
        return None

    finalChain = markovify.combine(chainList)
    return finalChain.make_short_sentence(250)

#updates database of tweets with screen_name = name

def updateAndReturnChain(name, chain, t):
    #if last update was more than an hour ago check for new tweets and get them
    now = datetime.datetime.utcnow().replace(tzinfo=utc)
    timediff = now - chain.last_updated
    if timediff.total_seconds() > UPDATE_THRESHOLD:
        return updateTweets(name, chain, t)
    else:
        oldChain = markovify.NewlineText.from_json(chain.chain)
        return oldChain
        

#gets as many tweets as possible(twitter limit ~3000)
def getAllTweets(name, t):
    tweetList = []
    last_id = 0
    tweets = t.statuses.user_timeline(
        screen_name = name,
        exclude_replies = "true",
        include_rts="false",
        trim_user="true",
        count = 200,
        tweet_mode='extended'
        )

    print(tweets)
    for tw in tweets:
        tweetList.append(tw['full_text'])
        last_id = tw['id']

    while len(tweets) > 0:
        maxID = tweets[len(tweets) - 1]['id']
        tweets = t.statuses.user_timeline(
            screen_name = name,
            exclude_replies = "true",
            include_rts="false",
            trim_user="true",
            count = 200,
            tweet_mode='extended',
            max_id = maxID - 1,
            )
        for tw in tweets:
            tweetList.append(tw['full_text'])
            last_id = tw['id']

    return tweetList, last_id



#self explanatory
def updateTweets(name, chain, t):
    last_id = 0
    tweets = t.statuses.user_timeline(
        screen_name = name,
        exclude_replies = "true",
        include_rts="false",
        trim_user="true",
        tweet_mode='extended',
        since_id = chain.latest_tweet_id,
        )
    tweetList = []
    for tw in tweets:
        tweetList.append(tw['full_text'])
        last_id = tw['id']
    updateChain(name, tweetList, chain, last_id)

#generates markov chain for twitter user
def generateChain(name, tweetList, last_id):
    text = '\n'.join(tweetList) #separates tweets by newline
    text = re.sub(r'https:\/\/t.co\S+', '', text) #remove links from text
    cleaned_text = text.replace("&amp;", "&") #fix for '&' symbol
    markov = markovify.NewlineText(cleaned_text)
    json_model = markov.to_json() #save model in db
    newChain = Chain(screen_name = name, latest_tweet_id = last_id, chain = json_model)
    newChain.save()
    return markov

#updates chain by combining old chain and new chain generated only from new tweets
#reworked
def updateChain(name, tweetList, chain, last_id):
    
    text = '\n'.join(tweetList)
    text = re.sub(r'https:\/\/t.co\S+', '', text)
    cleaned_text = text.replace("&amp;", "&")
    oldChain = markovify.NewlineText.from_json(chain.chain)
    newChain = markovify.NewlineText(cleaned_text)
    updatedChain = markovify.combine([oldChain, newChain])
    json_model = updatedChain.to_json()
    updatedChainModel = Chain(screen_name = name, latest_tweet_id = last_id, chain = json_model)
    updatedChainModel.save() #save in db
    return updatedChain
