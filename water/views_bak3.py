from django.shortcuts import render
from django.shortcuts import render, redirect
from django.http import HttpResponse, JsonResponse
from django.contrib import messages, auth
from django.contrib.auth.models import User
from django.contrib.auth  import authenticate, login, logout
from django.core.files.storage import FileSystemStorage
#from django.views.decorators.csrf import csrf_exempt
# 引入 requests 模組
import requests, json, pymongo
#from pymongo import MongoClient
import pandas as pd
import datetime, time, math, re
#import json

# Create your views here.
def waterPage(request, device):
    #myclient = pymongo.MongoClient("mongodb://sinew:sinew3612@192.168.101.73:27017/")  ##IP需要修改
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
    #myclient = pymongo.MongoClient("mongodb://sinew:sinew3612@192.168.101.73:27017/")  ##IP需要修改
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
    #myclient = pymongo.MongoClient("mongodb://sinew:sinew3612@192.168.101.73:27017/")  ##IP需要修改
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
    #myclient = pymongo.MongoClient("mongodb://sinew:sinew3612@192.168.101.73:27017/")  ##IP需要修改
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
    #myclient = pymongo.MongoClient("mongodb://sinew:sinew3612@192.168.101.73:27017/")  ##IP需要修改
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
    #myclient = pymongo.MongoClient("mongodb://sinew:sinew3612@192.168.101.73:27017/")  ##IP需要修改
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
    #myclient = pymongo.MongoClient("mongodb://sinew:sinew3612@192.168.101.73:27017/")  ##IP需要修改
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

            #myclient = pymongo.MongoClient("mongodb://sinew:sinew3612@192.168.101.73:27017/") ##IP需要修改
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
    #myclient = pymongo.MongoClient("mongodb://sinew:sinew3612@163.21.4.230:27017/")  ##IP需要修改
    myclient = pymongo.MongoClient("mongodb://xinxing:xinxing@127.0.0.1:27017/")  ##IP需要修改
    try:
        mydb = myclient["xinxing_dispenser"]
        mycol = mydb["tablet_display"]
        mycol2 = mydb["raw_data"]
        ## 今日日期, 要計算目前飲水機用水量
        today = datetime.date.today()
        #date_object = datetime.datetime.strptime(today, '%Y-%m-%d').date() ## 轉成<class 'datetime.date'>
        endate = today + datetime.timedelta(days=1)
        endate = str(endate)

        mydoc = mycol.find()
        Data =[]
        for x in mydoc:
            myquery = {"Dispenser": x['Dispenser'], "Timming": {"$lte":  endate, "$gte": str(today)},  "WaterVolume": {"$gte": 0}  }
            rawData = mycol2.find(myquery)
            sumValue =0
            for x1 in rawData:
                sumValue += x1['WaterVolume']

            data = {
                'Dispenser': x['Dispenser'],
                'Location': x['Location'],
                'HotTemp' : x['HotTemp'],
                'WarmTemp' : x['WarmTemp'],
                'ColdTemp' : x['ColdTemp'],
                'Type' : x['Type'],
                'LastPunchInTime' : x['LastPunchInTime'],
                'LastModbusPunchInTime' : x['LastModbusPunchInTime'],
                'Current' : sumValue,
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
    #myclient = pymongo.MongoClient("mongodb://sinew:sinew3612@192.168.101.73:27017/")  ##IP需要修改
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
            grade = request.POST.get("grade")
            Class = request.POST.get("Class")
            schoolId = request.POST.get("schoolId")
            fromDate = request.POST.get("formdate")
            toDate = request.POST.get("todate")
            ## 結束時間
            date_object = datetime.datetime.strptime(toDate, '%Y-%m-%d').date() ## 轉成<class 'datetime.date'>
            endate = date_object + datetime.timedelta(days=1)
            endate = str(endate)
            
            #myclient = pymongo.MongoClient("mongodb://sinew:sinew3612@192.168.101.73:27017/") ##IP需要修改
            #myclient = pymongo.MongoClient("mongodb://dispenser:dispenser@34.81.61.172:27017/") ##IP需要修改
            myclient = pymongo.MongoClient("mongodb://xinxing:xinxing@127.0.0.1:27017/") ##IP需要修改
            mydb = myclient["xinxing_dispenser"]
            ## Collection members_data，取出Card ID的值
            mycollect = mydb["members_data"]
            mycollect2 = mydb["raw_data"]
            #print(len(schoolId))
            ## 搜尋級別條件
            if grade != 'non' and Class == 'non' and len(schoolId) == 0:
                myquery = {"Identity":"Student", "Class": {"$regex": "^"+grade+""}}
                mydoc1 = mycollect.find(myquery)
            elif Class != 'non' and len(schoolId) == 0:
                myquery = {"Identity":"Student", "Class": Class}
                mydoc1 = mycollect.find(myquery)
            elif len(schoolId) != 0:
                myquery = {"Identity":"Student", "SchoolID": schoolId}
                mydoc1 = mycollect.find(myquery)
            else:
                mydoc1 = mycollect.find()

            ## 人員清單
            Member =[]
            for x1 in mydoc1:
                data = {
                    'SchoolID' : x1['SchoolID'],
                    'Name' : x1['Name'],
                    'Gender' : x1['Gender'],
                    #'Gender' : Gender(item['性別']),
                    'CardID' : x1['CardID'],
                    'Class' : x1['Class'],
                    'Number' : x1['Number'],
                    'Weight' : x1['Weight'],
                    #'Height' : item['身高'],
                    'DailyShouldDrink' : x1['DailyShouldDrink'],
                    #'TodayDrinkRefreshDate' : str(today),
                    #'TodayDrink' : 0,
                    #'Number' : item['座號'],
                }
                Member.append(data)
            
            ## 取出CardID 相關Raw Data
            rawData =[]
            for data in Member:
                #print(data['CardID'])
                #myquery3 = {"CardID": data['CardID'], "Timming": {"$lte":  endate, "$gte": fromDate},  "WaterVolume": {"$gte": 0}  }
                myquery3 = {"$or":[{"CardID": data['CardID']}, {"CardID": data['SchoolID']}], "Timming": {"$lte":  endate, "$gte": fromDate},  "WaterVolume": {"$gte": 0}  }
                #print(myquery3)
                mydoc2 = mycollect2.find(myquery3)
                for x2 in mydoc2:
                    data = {
                            'Timming' : x2['Timming'],
                            'CardID' : x2['CardID'],
                            'Choose' : x2['Choose'],
                            'WaterVolume' : x2['WaterVolume'],
                            'Dispenser' : x2['Dispenser'],
                    }
                    rawData.append(data)
                #Cardid.append(data['CardID'])

            dataset = {"members":Member, "datas":rawData}
            return HttpResponse(json.dumps(dataset), content_type='application/json')
            myclient.disconnect()
        except:
            return JsonResponse({"status":1})

# 上傳學生資料檔案
def saveuploadfile(request):
    if request.method == 'POST' and request.FILES['fileupload']:
        myfile = request.FILES['fileupload']
        fs = FileSystemStorage()
        filename = fs.save(myfile.name, myfile)
        print(filename)
        fileurl = fs.url(filename)
        #print(fileurl)
        #print(myfile.name)

        df = pd.read_excel(r'/home/xinxing/djangoenv/nilmProject'+fileurl+'', usecols=["班級", "座號", "學號", "姓名", "性別", "卡片內碼", "體重", "身高"]) # 指定 sheet_name
        # 性別 英文
        def Gender(value):
            if value == "男生":
                gender = "Male"
            else:
                gender = "Female"
       
            return gender

        ## 計算每日飲水量
        def dailyDrinkingWater(value):
            drink = value * 30;

            return drink

        myclient = pymongo.MongoClient("mongodb://xinxing:xinxing@127.0.0.1:27017")
        mydb = myclient["xinxing_dispenser"]

        mycol = mydb["members_data"]
        #mycol1 = mydb["members_addtional_card_test"] ##卡片紀錄

        # 输出修改后的  "sites"  集合
        SchoolIDList =[]
        for x in mycol.find():
            SchoolIDList.append(x['SchoolID'])

        for index, row in df.iterrows():
            result =list(filter(lambda SchoolID: SchoolID == str(row['學號']), SchoolIDList))
            ## 判斷身高是否沒有填值
            if pd.isna(row['身高']): ## return value is TRUE
                height = 0
            else:
                height = float(row['身高'])

            ## 判斷體重是否沒有填值
            if pd.isna(row['體重']): ## return value is TRUE
                weight = 0
                dailywater = 1000
            else:
                weight = float(row['體重'])
                dailywater = dailyDrinkingWater(weight)

            ## 今日日期
            today = datetime.date.today()
            #print(today)
             ## 要加入新增Execl資料表
            if len(result) != 0:
                myquery = { "SchoolID": str(row['學號']) } ## 條件
                newvalues = {"$set": {"Name":row['姓名'], "Gender": Gender(row['性別']), "CardID": str(row['卡片內碼']), "Class": str(row['班級']), "Weight": float(weight), "Height": float(height), "DailyShouldDrink": dailywater, "Number": str(row['座號'])}}
                #print('update\n')
                x = mycol.update_one(myquery, newvalues)
            else:
                mydict = {'SchoolID': str(row['學號']),
                    'Identity' : 'Student',
                    'Name' : str(row['姓名']),
                    'EnrollYear' : 'none',
                    'Gender' : Gender(row['性別']),
                    'CardID' : str(row['卡片內碼']),
                    'Class' : str(row['班級']),
                    'Weight' : row['體重'],
                    'Height' : row['身高'],
                    'DailyShouldDrink' : dailywater,
                    'TodayDrinkRefreshDate' : str(today),
                    'TodayDrink' : 0,
                    'Number' : str(row['座號']),
                }
                x = mycol.insert_one(mydict)
        
        #datasetOut = {'status':'ok', 'dataset':mylist, 'filename':filename}
        datasetOut = {'status':'ok', 'filename':filename}
        return HttpResponse(json.dumps(datasetOut), content_type='application/json')

        ## 資料庫現存的學號
        #myclient = pymongo.MongoClient("mongodb://dispenser:dispenser@34.81.61.172:27017")
        #mydb = myclient['xinxing_dispenser']

    
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


# 搜尋學生資料
## 沒有使用到
def getSearchStudentsData(request):
    if request.method=="POST":                   #驗証是否有登入過
        try:
            grade = request.POST.get("grade")
            Class = request.POST.get("class")
            schoolID = request.POST.get("schoolID")

            ## 計算每日飲水量
            def dailyDrinkingWater(value):
                drink = value * 30;

                return drink

            myclient1 = pymongo.MongoClient("mongodb://xinxing:xinxing@127.0.0.1:27017/") ##IP需要修改
            mydb1 = myclient1["xinxing_dispenser"]
            mycol1 = mydb1["members_data"]

            myquery1 = {"Class": "701"}
            mydoc1 = mycol1.find(myquery1)
            Data =[]
            for x2 in mydoc1:
                data ={
                       'SchoolID': x2['SchoolID'],
                       'Name': x2['Name'],
                }
                Data.append(data)
            
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
            ## 每日飲水量
            dailywater = math.ceil( dailyDrinkingWater(float(weight)))

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
            myclient1.disconnect()
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


# 更新學生資料。 資料表Collection 更新
def updateMembersData(request):
    if request.method=="POST":                   #驗証是否有登入過
        try:
            filename = request.POST.get("fileName")
            df = pd.read_excel(r'/home/xinxing/djangoenv/nilmProject/media/'+filename+'', usecols=["班級", "座號", "學號", "姓名", "性別", "卡片內碼", "體重", "身高"]) # 指定 sheet_name, 路徑要改
            
            SchoolIDList =[]
            for index, row in df.iterrows():
                SchoolIDList.append(str(row['學號']))
                #row['體重']

            ## 資料庫
            myclient = pymongo.MongoClient("mongodb://xinxing:xinxing@127.0.0.1:27017/")  ##IP需要修改
            mydb = myclient["xinxing_dispenser"]
            mycol = mydb["members_data"]

            for x in mycol.find():
                if x['Identity'] == 'Student':
                    result =list(filter(lambda SchoolID: SchoolID == str(x['SchoolID']), SchoolIDList))
                    ## 修改身份
                    if len(result) == 0:
                        print('update')
                        myquery = { "SchoolID": str(x['SchoolID']) }
                        newvalues = { "$set": { "Identity": "Leaving" } }
                        mycol.update_one(myquery, newvalues)

            return JsonResponse({"status":"okay", "SchoolIDList":SchoolIDList})
            myclient.disconnect()
        except:
            return JsonResponse({"status":1})