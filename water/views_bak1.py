from django.shortcuts import render
from django.shortcuts import render, redirect
from django.http import HttpResponse, JsonResponse
from django.contrib import messages, auth
from django.contrib.auth.models import User
from django.contrib.auth  import authenticate, login, logout
#from django.views.decorators.csrf import csrf_exempt
# 引入 requests 模組
import requests, json, pymongo
#from pymongo import MongoClient
import pandas as pd
import datetime, time, math, re
#import json

# Create your views here.
def waterPage(request, device):
    myclient = pymongo.MongoClient("mongodb://xinxing:xinxing@127.0.0.1:27017/")  ##IP需要修改
    mydb = myclient["xinxing_dispenser"]
    mycol = mydb["tablet_display"]

    mydoc = mycol.find()
    Data =[]
    for x in mydoc:
        Data.append(x['Dispenser'])

    ## 取出指定飲水機資訊
    myquery = {"Dispenser": device}
    mydata = mycol.find(myquery)
    nowdatetime = datetime.datetime.now().timestamp() ##現在時間戳記

    for x in mydata:
        ## 判斷裝置是否在線上
        struct_time = time.strptime(x['LastModbusPunchInTime'], "%Y-%m-%d %H:%M:%S") # 轉成時間元組
        time_stamp = int(time.mktime(struct_time)) # 轉成時間戳
        if (nowdatetime - time_stamp) > 240:
           status = 'offline'
        else:
           status = "online"

        stack = {
            'Dispenser': x['Dispenser'],
            'Location' : x['Location'],
            'HotTemp' : x['HotTemp'],
            'WarmTemp' : x['WarmTemp'],
            'ColdTemp' : x['ColdTemp'],
            'Timestamp' : x['Timestamp'],
            'Type' : x['Type'],
            'Status' : x['Status'],
            'LastPunchInTime' : x['LastPunchInTime'],
            'LastModbusPunchInTime' : x['LastModbusPunchInTime'],
            'status' : status
        }

    views_list ={"list": Data, "device": device, "data":stack}
    return render(request, "water-index-6.html", views_list)
    #return render(request, 'water-index-6.html')

def dispenserMap(request):
    myclient = pymongo.MongoClient("mongodb://xinxing:xinxing@127.0.0.1:27017/")  ##IP需要修改
    mydb = myclient["xinxing_dispenser"]
    mycol = mydb["tablet_display"]

    mydoc = mycol.find()
    Data =[]
    for x in mydoc:
        Data.append(x['Dispenser'])

    views_list ={"list": Data}
    return render(request, "map.html", views_list)
    #return render(request, 'map.html')

# 2022.12.22 人員統計頁面
def peoplePage(request):
    myclient = pymongo.MongoClient("mongodb://xinxing:xinxing@127.0.0.1:27017/")  ##IP需要修改
    mydb = myclient["xinxing_dispenser"]
    mycol = mydb["tablet_display"]

    mydoc = mycol.find()
    Data =[]
    for x in mydoc:
        Data.append(x['Dispenser'])

    views_list ={"list": Data}
    return render(request, "water-index-3.html", views_list)
    #return render(request, 'water-index-3.html')

# 2022.12.23 年級/班級
def GradePage(request):
    myclient = pymongo.MongoClient("mongodb://xinxing:xinxing@127.0.0.1:27017/")  ##IP需要修改
    mydb = myclient["xinxing_dispenser"]
    mycol = mydb["tablet_display"]

    mydoc = mycol.find()
    Data =[]
    for x in mydoc:
        Data.append(x['Dispenser'])

    views_list ={"list": Data}
    return render(request, 'water-index-3-Class.html', views_list)

# 2022.12.23 人員管理 - 學生
def manageStudentPage(request):
    myclient = pymongo.MongoClient("mongodb://xinxing:xinxing@127.0.0.1:27017/")  ##IP需要修改
    mydb = myclient["xinxing_dispenser"]
    mycol = mydb["tablet_display"]

    mydoc = mycol.find()
    Data =[]
    for x in mydoc:
        Data.append(x['Dispenser'])

    views_list ={"list": Data}
    return render(request, "water-index-4.html", views_list)
    #return render(request, 'water-index-4.html')

# 2022.12.23 人員管理 - 學生
def manageFacultyPage(request):
    myclient = pymongo.MongoClient("mongodb://xinxing:xinxing@127.0.0.1:27017/")  ##IP需要修改
    mydb = myclient["xinxing_dispenser"]
    mycol = mydb["tablet_display"]

    mydoc = mycol.find()
    Data =[]
    for x in mydoc:
        Data.append(x['Dispenser'])

    views_list ={"list": Data}
    return render(request, "water-index-5.html", views_list)
    #return render(request, 'water-index-5.html')

def getDispenerInfo(request):
    myclient = pymongo.MongoClient("mongodb://xinxing:xinxing@127.0.0.1:27017/")  ##IP需要修改
    mydb = myclient["xinxing_dispenser"]
    mycol = mydb["tablet_display"]

    Data =[]
    for x in mycol.find():
        #print(x)
        data = {
            'Dispenser': x['Dispenser'],
            'Location' : x['Location'],
            'HotTemp' : x['HotTemp'],
            'WarmTemp' : x['WarmTemp'],
            'ColdTemp' : x['ColdTemp'],
            'Timestamp' : x['Timestamp'],
            'Type' : x['Type'],
            'Status' : x['Status'],
            'LastPunchInTime' : x['LastPunchInTime'],
            'LastModbusPunchInTime' : x['LastModbusPunchInTime'],
        }
        Data.append(data)
        #print(x['Location'])

    #print(Data)
    dataset = {'data':Data}
    return HttpResponse(json.dumps(dataset), content_type='application/json')
    """
    url = 'http://192.168.101.73:5000/get/display/all'
    response = requests.get(url)
    obj = response.json()
    message = {'response':obj['Data']}
    return JsonResponse(message)
    """

# 取得飲水機資料
def statisticsDispenser(request):
    if request.method=="POST":                   #驗証是否有登入過
        try:
            dispenser = request.POST.get("dispenser")
            fromDate = request.POST.get("formdate")
            toDate = request.POST.get("todate")
            
            date_object = datetime.datetime.strptime(toDate, '%Y-%m-%d').date() ## 轉成<class 'datetime.date'>
            endate = date_object + datetime.timedelta(days=1)
            endate = str(endate)

            myclient = pymongo.MongoClient("mongodb://xinxing:xinxing@127.0.0.1:27017/") ##IP需要修改
            mydb = myclient["xinxing_dispenser"]
            mycol = mydb["raw_data"]

            #myquery = {"Dispenser": "EE0601", "Timming": {"$lte":  "2021-01-28", "$gte": "2021-01-26"}, "WaterVolume": {"$gte": 0}  }
            #myquery = {"Dispenser": dispenser, "Timming": {"$lte":  srt(toDate), "$gte": fromDate}, "WaterVolume": {"$gte": 0}  }
            myquery = {"Dispenser": dispenser, "Timming": {"$lte":  endate, "$gte": fromDate},  "WaterVolume": {"$gte": 0}  }
            mydoc1 = mycol.find(myquery)
            Data =[]
            for x1 in mydoc1:
                data = {
                    'Timming': x1['Timming'],
                    'Choose' : x1['Choose'],
                    'WaterVolume' : round(x1['WaterVolume']),
                    'Dispenser' : x1['Dispenser'],
                    'CardID' : x1['CardID'],
                }
                Data.append(data)
                #print(x1)
            dataset = {'data':Data}
            return HttpResponse(json.dumps(dataset), content_type='application/json')
        except:
            return JsonResponse({"status":1})


# 取得飲水機資訊
def getDispenserInfo(request):
    myclient = pymongo.MongoClient("mongodb://xinxing:xinxing@127.0.0.1:27017/")  ##IP需要修改
    try:
        mydb = myclient["xinxing_dispenser"]
        mycol = mydb["tablet_display"]

        mydoc = mycol.find()
        Data =[]
        for x in mydoc:
            data = {
                'Dispenser': x['Dispenser'],
                'Location': x['Location'],
                'HotTemp' : x['HotTemp'],
                'WarmTemp' : x['WarmTemp'],
                'ColdTemp' : x['ColdTemp'],
                'Type' : x['Type'],
                'LastPunchInTime' : x['LastPunchInTime'],
                'LastModbusPunchInTime' : x['LastModbusPunchInTime'],
                #'SchoolID' : x1['SchoolID'],
                #'SchoolID' : x1['SchoolID'],
            }
            Data.append(data)

        dataset = {'data':Data}
        return HttpResponse(json.dumps(dataset), content_type='application/json')
    except:
        return JsonResponse({"status":1})

# 取得飲水機列表 和 飲水機統計頁面
# 套用樣版語法,回傳型態要使用物件
def showDispenserList(request):
    myclient = pymongo.MongoClient("mongodb://xinxing:xinxing@127.0.0.1:27017/")  ##IP需要修改
    mydb = myclient["xinxing_dispenser"]
    mycol = mydb["tablet_display"]

    mydoc = mycol.find()
    Data =[]
    for x in mydoc:
        Data.append(x['Dispenser'])

    views_list ={"list": Data}
    return render(request, "water-index-2.html", views_list)

# 取得人員資料
def statisticsPeople(request):
    if request.method=="POST":                   #驗証是否有登入過
        try:
            schoolId = request.POST.get("schoolId")
            fromDate = request.POST.get("formdate")
            toDate = request.POST.get("todate")
            
            date_object = datetime.datetime.strptime(toDate, '%Y-%m-%d').date() ## 轉成<class 'datetime.date'>
            endate = date_object + datetime.timedelta(days=1)
            endate = str(endate)

            myclient = pymongo.MongoClient("mongodb://xinxing:xinxing@127.0.0.1:27017/") ##IP需要修改
            mydb = myclient["xinxing_dispenser"]
            ## Collection members_data，取出Card ID的值
            mycollect = mydb["members_data"]
            myquery1 = {"SchoolID": schoolId}
            mydoc2 = mycollect.find_one(myquery1)
            #dataset = {'data': mydoc2['CardID']}
            #return HttpResponse(json.dumps(dataset), content_type='application/json')
            ## 取出使用者用水資料
            mycol = mydb["raw_data"]

            #myquery = {"Dispenser": "EE0601", "Timming": {"$lte":  "2021-01-28", "$gte": "2021-01-26"}, "WaterVolume": {"$gte": 0}  }
            #myquery = {"Dispenser": dispenser, "Timming": {"$lte":  srt(toDate), "$gte": fromDate}, "WaterVolume": {"$gte": 0}  }
            myquery = {"CardID": mydoc2['CardID'], "Timming": {"$lte":  endate, "$gte": fromDate},  "WaterVolume": {"$gte": 0}  }
            mydoc1 = mycol.find(myquery)
            Data =[]
            for x1 in mydoc1:
                data = {
                    'Timming': x1['Timming'],
                    'Choose' : x1['Choose'],
                    'WaterVolume' : round(x1['WaterVolume']),
                    'Dispenser' : x1['Dispenser'],
                    'CardID' : x1['CardID'],
                }
                Data.append(data)
                #print(x1)
            dataset = {'data':Data}
            return HttpResponse(json.dumps(dataset), content_type='application/json')
        except:
            return JsonResponse({"status":1})

# 新增學生資料
def insertStudentData(request):
    if request.method=="POST":                   #驗証是否有登入過
        try:
            schoolID = request.POST.get("schoolID")
            name = request.POST.get("name")
            cardID = request.POST.get("cardID")
            Class = request.POST.get("Class")
            height = request.POST.get("height")
            weight = request.POST.get("weight")
            number = request.POST.get("number")
            gender = request.POST.get("gender")

            ## 計算每日飲水量
            def dailyDrinkingWater(value):
                drink = value * 30;

                return drink

            ## 今日日期
            today = datetime.date.today()
            #print(today)
            ## 每日飲水量
            dailywater = math.ceil(dailyDrinkingWater(float(weight)))
            #print(dailywater)
            myclient = pymongo.MongoClient("mongodb://xinxing:xinxing@127.0.0.1:27017/")  ##IP需要修改
            
            #Define DB Name
            dbname = myclient["xinxing_dispenser"]
            #Define Collection
            #collection = dbname["mascot"]
            collection = dbname["members_data"]
            mascot_1={
                "SchoolID": str(schoolID),
                "Identity":"Student",
                "Name": name,
                "EnrollYear":"none",
                "Gender" : gender,
                "CardID" : str(cardID),
                "Class" : str(Class),
                'Weight': float(weight),
                'Height': float(height),
                'DailyShouldDrink': dailywater,
                'TodayDrinkRefreshDate': str(today),
                'TodayDrink': 0,
                'Number':str(number),
            }
            collection.insert_one(mascot_1)
            #x = mycol1.insert_one(mydict)
            #print(x.inserted_id)
            
            #myclient1.close()
            return JsonResponse({"status":'okay'})
            myclient.disconnect()
        except:
            return JsonResponse({"status":1})


# 更新學生資料
def updateStudentData(request):
    if request.method=="POST":                   #驗証是否有登入過
        try:
            schoolID = request.POST.get("schoolID")
            name = request.POST.get("name")
            cardID = request.POST.get("cardID")
            Class = request.POST.get("Class")
            height = request.POST.get("height")
            weight = request.POST.get("weight")
            number = request.POST.get("number")
            gender = request.POST.get("gender")

            ## 計算每日飲水量
            def dailyDrinkingWater(value):
                drink = value * 30;

                return drink

            ## 每日飲水量
            dailywater = math.ceil( dailyDrinkingWater(float(weight)))

            myclient2 = pymongo.MongoClient("mongodb://xinxing:xinxing@127.0.0.1:27017/")  ##IP需要修改
            #Define DB Name
            dbname = myclient2["xinxing_dispenser"]
            #Define Collection
            #collection = dbname["mascot"]
            collection = dbname["members_data"]

            myquery = {"SchoolID": str(schoolID)}
            newvalues = {"$set": {"Name": name, "Gender": gender, "CardID": str(cardID), "Class": str(Class), "Weight": float(weight), "Height": float(height), "DailyShouldDrink": dailywater, "Number": str(number)}}
            collection.update_one(myquery, newvalues)

            return JsonResponse({"status":"okay"})
            myclient2.disconnect()
        except:
            return JsonResponse({"status":1})

# 刪除學生資料
def deleteStudentData(request):
    if request.method=="POST":                   #驗証是否有登入過
        try:
            schoolID = request.POST.get("schoolID")

            myclient2 = pymongo.MongoClient("mongodb://xinxing:xinxing@127.0.0.1:27017/")  ##IP需要修改
            #Define DB Name
            dbname = myclient2["xinxing_dispenser"]
            #Define Collection
            #collection = dbname["mascot"]
            collection = dbname["members_data"]

            myquery = {"SchoolID": str(schoolID)}
            newvalues = {"$set": {"Identity": "delete"}}
            collection.update_one(myquery, newvalues)

            return JsonResponse({"status":"okay"})
            myclient2.disconnect()
        except:
            return JsonResponse({"status":1})

# 取出所有學生資料
def getAllStudentsData(request):
    def dailyDrinkingWater(value):
        drink = value * 30;

        return drink

    myclient = pymongo.MongoClient("mongodb://xinxing:xinxing@127.0.0.1:27017/")  ##IP需要修改
    try:
        mydb = myclient["xinxing_dispenser"]
        ## Collection members_data，取出Card ID的值
        mycollect = mydb["members_data"]
        #mydoc = mycollect.find()
        Member =[]
        for x1 in mycollect.find():
            if x1['Identity'] == "Student":
                if pd.isna(x1['Weight']): ## return value is TRUE
                    weight = 0
                    dailywater = 1000
                else:
                    weight = x1['Weight']
                    dailywater = math.ceil( dailyDrinkingWater(x1['Weight']) )

                if pd.isna(x1['Height']): ## return value is TRUE
                    height = 0
                else:
                    height = x1['Height']

                data1 = {
                    'SchoolID' : x1['SchoolID'],
                    'Name' : x1['Name'],
                    'Gender' : x1['Gender'],
                    'CardID' : x1['CardID'],
                    'Class' : x1['Class'],
                    'Number' : x1['Number'],
                    'EnrollYear' : x1['EnrollYear'],
                    'TodayDrinkRefreshDate' : x1['TodayDrinkRefreshDate'],
                    'Weight' : weight,
                    'Height' : height,
                    'DailyShouldDrink' : dailywater,
                    #'SchoolID' : x1['SchoolID'],
                }
                Member.append(data1)

        dataset = {"datas":Member}
        return HttpResponse(json.dumps(dataset), content_type='application/json')
        myclient.disconnect()
    except:
        return JsonResponse({"status":1})