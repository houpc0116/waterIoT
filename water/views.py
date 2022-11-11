from django.shortcuts import render
from django.shortcuts import render, redirect
from django.http import HttpResponse, JsonResponse
from django.contrib import messages, auth
from django.contrib.auth.models import User
from django.contrib.auth  import authenticate, login, logout

# Create your views here.
def waterPage(request):
    return render(request, 'water.html')
