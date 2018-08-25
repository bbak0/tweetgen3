from django.shortcuts import render
from django.http import HttpResponse
from TweetGen.engine import generateTweet
from django.http import JsonResponse
from .models import UseCount, Chain
from django.db.models import F
from django.contrib.auth.decorators import login_required
from rest_framework import viewsets
from rest_framework.exceptions import APIException
from django.middleware.csrf import CsrfViewMiddleware
from django.core.exceptions import PermissionDenied

@login_required
def index(request):
    rec = UseCount.objects.order_by('-counter').all()[:20]
    context = {'recommendations': rec}
    return render(request, 'TweetGen/index.html', context)
# Create your views here.


def get_tweet(request):
    check_csrf(request)
    print(request.GET.get('csrfmiddlewaretoken'))
    user_input = request.GET.get('input', None)
    userid = request.user.id
    new_input = user_input.replace("@", "")
    names_table = new_input.split(', ')



    data = {
        'tweet': generateTweet(names_table, userid)
    }
    print(type(data['tweet']))
    if data['tweet'] is None:
        return HttpResponse('Failed to generate tweet', status=401)
    for name in names_table:
        if len(name) < 20 :
            counter, created = UseCount.objects.get_or_create(screen_name = name)
            counter.counter = F('counter') + 1
            counter.save()
    
    return JsonResponse(data)

def check_csrf(request):
    request.csrf_processing_done = False
    reason = CsrfViewMiddleware().process_view(request, None, (), {})

    if reason is not None:
        raise PermissionDenied
