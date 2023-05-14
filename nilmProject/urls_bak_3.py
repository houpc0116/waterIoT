"""nilmProject URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/3.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from django.conf.urls import include, re_path, url, handler404
from account.views import loginPage, handleLogin, handleLogout
from water.views import waterPage, dispenserMap, peoplePage, GradePage, manageStudentPage, manageFacultyPage, statisticsDispenser, getDispenserInfo, showDispenserList, statisticsPeople, saveuploadfile, getAllStudentsData, insertStudentData, updateStudentData, deleteStudentData, updateMembersData, getDispenserInfoApi

urlpatterns = [
    path('', loginPage, name='index'),
    path('admin/', admin.site.urls),
    path('accounts/login/', loginPage, name='login'),
    path('login/auth/', handleLogin, name='login_auth'),
    path('accounts/logout/', handleLogout, name='logout'),
    path ('dispensercrontrol/<str:device>/', waterPage, name='Dispenser_Crontrol'), # 飲水機控制頁面
    path ('uploadstudentdata/', saveuploadfile, name='uploadStudentFile'), # Execl 上傳學生資料
    path ('insertStudentsData/', insertStudentData, name='insertStudentData'), # 新增學生資料
    path ('updStudentsData/', updateStudentData, name='updateStudentData'), # 更新學生資料
    path ('updateMembersData/', updateMembersData, name='updateMembersData'), # 更新學生資料。 更新學生資料
    path ('delStudentsData/', deleteStudentData, name='deleteStudentData'), # 刪除學生資料
    #url(r'^dispensercrontrol/', waterPage, name='index'),      # 飲水機控制頁面
    url(r'^map/', dispenserMap, name='map'),           # dispenser Map
    url(r'^peoplechart/', peoplePage, name='showPeopleChart'),           # show people statistics Page
    url(r'^dispenserstatistics/', statisticsDispenser, name='statisticsDispenser'),  # dispenser statistics
    url(r'^dispenserchart/', showDispenserList, name='showDispenserChart'),       # dispenser List and show dispenser Page
    url(r'^dispenserinfo/', getDispenserInfo, name='getDispenserInfo'),           # dispenser Info
    url(r'^peoplestatistics/', statisticsPeople, name='statisticsPeople'),        # people statistics
    url(r'^gradechart/', GradePage, name='showGradeChart'),           # show grade statistics Page
    url(r'^manage/student/', manageStudentPage, name='manageStudent'),           # 學生資料管理頁面
    url(r'^manage/faculty/', manageFacultyPage, name='manageFaculty'),           # 教職員資料管理頁面
    url(r'^studentsAllData/', getAllStudentsData, name='getAllStudentsInfo'),           # get all students Data
    url(r'^display/get_dispenser_info/', getDispenserInfoApi, name='getDispenserInfoApi'),           # 取出飲水機相關資料的API (台科大使用) 。2023.04.13
#    url(r'^searchStudentsData/', getSearchStudentsData, name='getSearchStudentsInfo'),           # get search students Data
#    url(r'^uploadstudentdata/', saveuploadfile, name='uploadStudentFile'),           # 上傳Execl
#   path('index/', waterPage, name='index'),
#   url(r'^accounts/login/', loginPage),      #Login 頁面
]
