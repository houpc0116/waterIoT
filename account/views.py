from django.shortcuts import render, redirect
from django.http import HttpResponse, JsonResponse
from django.contrib import messages
from django.contrib.auth.models import User
from django.contrib.auth  import authenticate, login, logout

# from account.models import Account

# Create your views here.
def loginPage(request):
    return render(request, 'index.html')

## login
def handleLogin(request):
    if request.user.is_authenticated:                   #驗証是否有登入過
       return redirect('/dispenser/?device=xinxing01')  #重新導向到首頁
    elif request.method=="POST":
       username = request.POST.get("username", '')
       password = request.POST.get("password", '')
       user = authenticate(request, username=username, password=password)

       if user is not None and user.is_active:
          login(request, user)
          messages.success(request, 'Logout Success.')
          return redirect('/dispenser/?device=xinxing01')  #重新導向到首頁
       else:
          messages.error(request, "Invalid credentials! Please try again")
          return redirect('/accounts/login/')
#          return render(request, 'index.html')

## logout
def handleLogout(request):
    logout(request)
    return redirect('/accounts/login/')
