import twitter

api = twitter.Api(consumer_key='IDDyDIvIVgPRmaDmdgusahoxG',
                      consumer_secret='jk7fd9Uvc3S0t5xifnVVy5VJBeXKqLzOUr2GkPlMx4f7pG6qHk',
                      access_token_key='312730070-1YCttVb342IoKEYMfiD5m4cPQoXa7764scnQ0fPS',
                      access_token_secret='1N95KYYwPcqXjuGurKsYW3A1S40ei4eQl3GmxQmGaoOVL')

print(api.VerifyCredentials())
