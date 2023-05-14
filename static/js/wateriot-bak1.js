//送出登入
function Login(){
	document.getElementById("usrLogin").submit();
}

//查詢水溫
function getWaterTempe(){
    $.ajax({
        url: "http://35.173.198.154:15034/get/dispenser/status/"+(urlParams.get('device')),
        type: "get",
        dataType: "json",
        timeout: 30000,
        success: function(data) {
           /* Do something */
           let json_obj = JSON.parse(JSON.stringify(data));
           //console.log(json_obj['upload_time']);
           $('.date-time').text( json_obj['upload_time'] );
           $('.hot').text( json_obj['hot'] );
           $('.warm').text( json_obj['warm'] );
           $('.cold').text( json_obj['cold'] );
        },

        complete: function() {
           /* Polling here. */
            //console.log('polling');
            getWaterTempe();
        }
    });
}


//將指定日期加上 X 天
function addDays(date, days){
  var dateTime = new Date(date);
  //console.log(dateTime.toLocaleDateString());
  dateTime=dateTime.setDate(dateTime.getDate()+days);
  dateTime=new Date(dateTime);
  let getDate = dateTime.toLocaleDateString();
  //切割字串
  let split = getDate.split("/");
  if(split[1].length <2){
     month = '0' + split[1];
  }
  else{
     month = split[1];
  }

  if(split[2].length <2){
      day = '0' + split[2];
  }
  else{
      day = split[2];
  }

  return split[0] + '-' + month + '-' + day;
  //return dateTime.toLocaleDateString();
  //console.log(dateTime.toLocaleDateString());
}

//相差天數
var DateDiff = function (sDate1, sDate2) { // sDate1 和 sDate2 是 2016-06-18 格式
  var oDate1 = new Date(sDate1);
  var oDate2 = new Date(sDate2);
  var iDays = parseInt(Math.abs(oDate1 - oDate2) / 1000 / 60 / 60 / 24); // 把相差的毫秒數轉換為天數
  return iDays;
};

//計算冷溫熱水取水量
function getWaterVolum(data, date){
    console.log(date);
    let array = [];
    //console.log(yAxis);
    let cold =0;
    let warn =0;
    let hot =0;
    data.forEach(function(item, index, array){
       //console.log(item['WaterVolume']);
       //冷水
       if(item['Timming'].indexOf(date) != -1 && item['Choose'] == 'Cold'){
           cold += item['WaterVolume'];
       }
       //溫水
       if(item['Timming'].indexOf(date) != -1 && item['Choose'] == 'Warm'){
           warn += item['WaterVolume'];
       }
       //熱水
       if(item['Timming'].indexOf(date) != -1 && item['Choose'] == 'Hot'){
           hot += item['WaterVolume'];
       }
    });
    array.push(cold);
    array.push(warn);
    array.push(hot);

    return array;
}

//飲水機圖表
function initChartPromse(dispenser, form, to){
  return new Promise(function(resolve, reject) {
    //setTimeout(function() {
       //let domain = window.location.hostname;
       //let port = window.location.port;
        //清空陣列
        while (yAxis.length > 0) {
           yAxis.pop();
        }

        while (cold.length > 0) {
           cold.pop();
        }

        while (warn.length > 0) {
           warn.pop();
        }

        while (hot.length > 0) {
           hot.pop();
        }


       let url = '/dispenserstatistics/';
       $.ajax({
            //url: '/api/sensor/?device='+device,
            url: url,
            type: "POST",
            cache: false,
            async: false,
            data: {
                'csrfmiddlewaretoken': csrftoken,
                'dispenser': dispenser,
                'formdate': form,
                'todate': to, 
            },
            /*beforeSend: function (xhr) {
               //$('.loading').html("<img src='{% static 'img/preloader.gif' %}' with='100' height='100'>");//Loading
               xhr.setRequestHeader("X-CSRFToken", csrftoken);
            },*/
            success: function (response) {
                const obj = JSON.parse(JSON.stringify(response));
                //前端處理計算
                //console.log(form);
                //console.log(to);
                var diff = (DateDiff(form, to)+1); //計算開始和結束日期相差天數
                //console.log(diff);
                //儲存日期陣列
                var startDate = form;
                for(var i=0;i<diff;i++){
                   //console.log(i);
                   //console.log(startDate);
                   yAxis.push(startDate);
                   //計算取水量
                   getWaterVolum(obj['data'], startDate);
                   let result = getWaterVolum(obj['data'], startDate);
                   cold.push(result[0]);
                   warn.push(result[1]);
                   hot.push(result[2]);
                   //重新設定日期
                   startDate = addDays(startDate, 1);
                   //console.log(result);
                }
            },
            error: function (error) {
              console.log(error);
            }
        });

        resolve('ok');
    //}, 100);
  });
}


//人員圖表
function initChartPromse1(schoolId, form, to){
  return new Promise(function(resolve, reject) {
    //setTimeout(function() {
       //let domain = window.location.hostname;
       //let port = window.location.port;
        //清空陣列
        while (yAxis.length > 0) {
           yAxis.pop();
        }

        while (cold.length > 0) {
           cold.pop();
        }

        while (warn.length > 0) {
           warn.pop();
        }

        while (hot.length > 0) {
           hot.pop();
        }
        //console.log(schoolId);

        let url = '/peoplestatistics/';
        $.ajax({
            //url: '/api/sensor/?device='+device,
            url: url,
            type: "POST",
            cache: false,
            async: false,
            data: {
                'csrfmiddlewaretoken': csrftoken,
                'schoolId': schoolId,
                'formdate': form,
                'todate': to, 
            },
            /*beforeSend: function (xhr) {
               //$('.loading').html("<img src='{% static 'img/preloader.gif' %}' with='100' height='100'>");//Loading
               xhr.setRequestHeader("X-CSRFToken", csrftoken);
            },*/
            success: function (response) {
                const obj = JSON.parse(JSON.stringify(response));
                //console.log(obj);
                //前端處理計算
                //console.log(form);
                //console.log(to);
                var diff = (DateDiff(form, to)+1); //計算開始和結束日期相差天數
                //console.log(diff);
                //儲存日期陣列
                var startDate = form;
                for(var i=0;i<diff;i++){
                   //console.log(i);
                   //console.log(startDate);
                   yAxis.push(startDate);
                   //計算取水量
                   getWaterVolum(obj['data'], startDate);
                   let result = getWaterVolum(obj['data'], startDate);
                   cold.push(result[0]);
                   warn.push(result[1]);
                   hot.push(result[2]);
                   //重新設定日期
                   startDate = addDays(startDate, 1);
                   //console.log(result);
                }
            },
            error: function (error) {
              console.log(error);
            }
        });
        resolve('ok');
    //}, 100);
  });
}

//顯示飲水機細節資訊
function showInfo(dispenser){
    //console.log(val); // ## 所有飲水機資料
    var filterObj = val['data'].filter(function(item, index, array){
         return item.Dispenser == dispenser;       // 取得飲水機名稱一樣
    });
    console.log(filterObj);
    $(".device").text(filterObj[0]['Dispenser']);
    $(".location").text(filterObj[0]['Location']);
    $(".type").text(filterObj[0]['Type']);
    //console.log(status);
    //Modbus 打卡時間
    const dateModbus = new Date(filterObj[0]['LastModbusPunchInTime']);
    const timestampInSeconds = Math.floor(dateModbus.getTime() / 1000);  //換成秒數
    //現在連線時間
    const nowdate = new Date();
    const timestampNowSeconds = Math.floor(nowdate.getTime() / 1000);  //換成秒數
    //if(status == '已離線' || status ==''){
    if( (timestampNowSeconds - timestampInSeconds) > 240){  //大於四分鐘
        $(".hot").html('--');
        $(".warn").html('--');
        $(".cold").html('--');
    }else{
        $(".hot").html(filterObj[0]['HotTemp']+'&#176;C');
        $(".warn").html(filterObj[0]['WarmTemp']+'&#176;C');
        $(".cold").html(filterObj[0]['ColdTemp']+'&#176;C');
    }
}


//顯示各飲水機資訊 -- UI
function showDispenserList(obj){
   let str ='';
   //str += "<ul class=\"list-group list-group-flush showdispenser\">";           
   obj['data'].forEach(function(value, key, array){
       //console.log(value['Dispenser']);
        if(value['Dispenser'] != 'EE0601'){
            str += "<div class='row'>";
            // ## 飲水機名稱
            str += "<div class='col col-sm-12 col-md-4 col-lg-2'>";
            str += "<a href='javascript:void(0)' onClick=\"showInfo('"+value['Dispenser']+"')\">"+value['Dispenser']+"</a>";
            str += "</div>";
            // ## 飲水機是否上線
            //Modbus 打卡時間
            const dateModbus = new Date(value['LastModbusPunchInTime']);
            const timestampInSeconds = Math.floor(dateModbus.getTime() / 1000);  //換成秒數
            //現在連線時間
            const nowdate = new Date();
            const timestampNowSeconds = Math.floor(nowdate.getTime() / 1000);  //換成秒數
            str += "<div class='col col-sm-12 col-md-2 col-lg-2'>";
            if( (timestampNowSeconds - timestampInSeconds) > 240){  //大於四分鐘
               status = '已離線';
               str += "<span id='onlinestatus' style='color:red'>"+status+"</span>";
            }else{
               status = '連線中';
               str += "<span id='onlinestatus' style='color:green'>"+status+"</span>";
            }
            str += "</div>";
            // ## 最後打卡時間
            str += "<div class='col col-sm-12 col-lg-8'>";
            str += "<span>最後打卡時間："+value['LastModbusPunchInTime']+"</span>";
            str += "</div>";

            str += "</div>";
            //水平線
            str += "<div class='row'>";
            str += "<div class='col'><hr></div>";
            str += "</div>";
           /*
           str += "<li class=\"list-group-item d-flex justify-content-between\">";
           // ## 飲水機名稱
           str += "<a href='javascript:void(0)' onClick=\"showInfo('"+value['Dispenser']+"')\">"+value['Dispenser']+"</a>";
           // ## 飲水機是否上線
           //Modbus 打卡時間
           const dateModbus = new Date(value['LastModbusPunchInTime']);
           const timestampInSeconds = Math.floor(dateModbus.getTime() / 1000);  //換成秒數
           //現在連線時間
           const nowdate = new Date();
           const timestampNowSeconds = Math.floor(nowdate.getTime() / 1000);  //換成秒數
           
           if( (timestampNowSeconds - timestampInSeconds) > 60){  //大於一分鐘
               status = '已離線';
           }else{
               status = '連線中';
           }
           str += "<span id='onlinestatus'>"+status+"</span>";
           // ## 最後打卡時間
           str += "<span>，最後打卡時間："+value['LastModbusPunchInTime']+"</span>";
           str += "</li>";
           */
        }
   });
   //str += "</ul>"; 
   //console.log(str);
   $(".showtablet").html(str);
}


//地圖資訊
function initDispenserPromse(){
    return new Promise(function(resolve, reject) {
        let url = '/dispenserinfo/';
        $.ajax({
            //url: '/api/sensor/?device='+device,
            url: url,
            type: "GET",
            cache: false,
            async: false,
            beforeSend: function (xhr) {
               //$('.loading').html("<img src='{% static 'img/preloader.gif' %}' with='100' height='100'>");//Loading
               xhr.setRequestHeader("X-CSRFToken", csrftoken);
            },
            success: function (response) {
                //console.log(response);
                val = JSON.parse(JSON.stringify(response)); //儲存到全域變數
                showDispenserList(val);//顯示UI 畫面 
            },
            error: function (error) {
              console.log(error);
            }
        });
        //console.log(val);
        resolve('ok');
    });
}


//取得今日日期
function getTodayDate() {
  var fullDate = new Date();
  var yyyy = fullDate.getFullYear();
  var MM = (fullDate.getMonth() + 1) >= 10 ? (fullDate.getMonth() + 1) : ("0" + (fullDate.getMonth() + 1));
  var dd = fullDate.getDate() < 10 ? ("0"+fullDate.getDate()) : fullDate.getDate();
  var today = yyyy + "-" + MM + "-" + dd;
  return today;
}


//送出查詢報表
function sendChart(type){
    if(type == 'dispenser'){
        //參數
        let dispenser = $('#dispenser').val();
        let form = $('#form').val();
        let to  = $('#to').val();
        //console.log(form);
        //console.log(to);
        initChartPromse(dispenser, form, to)
        .then(function() {
            barChart.update();   //更新圖表
            //console.log(msgs);
        });
        /*
        .then(function(){
        });
        */
    }
    else if(type =='people')
    {
       //console.log('people');
        //參數
        let schoolId = ($('#SchoolID').val()).replace(/\s*/g,"");
        let form = $('#form').val();
        let to  = $('#to').val();
        initChartPromse1(schoolId, form, to)
        .then(function() {
            barChart.update();   //更新圖表
            //console.log(msgs);
        });

    }
}

/*
function createStudent(type){
    if(type == 'create')
    {
      $('.typetitle').text('新增');
    }
    else
    {
      $('.typetitle').text('更新');
    }
    $('#createModal').modal({backdrop: 'static', keyboard: false});
}
*/

function delStudent(){
    $('#delModal').modal({backdrop: 'static', keyboard: false});
}

function batchData(){
  $('#uploadModal').modal({backdrop: 'static', keyboard: false});
}


function createFaculty(type){
    if(type == 'create')
    {
      $('.typetitle').text('新增');
    }
    else
    {
      $('.typetitle').text('更新');
    }
    $('#createModal').modal({backdrop: 'static', keyboard: false});
}

function delFaculty(){
    $('#delModal').modal({backdrop: 'static', keyboard: false});
}

function batchData(){
   $('#uploadModal').modal({backdrop: 'static', keyboard: false});
}

//所有學生資訊
function initStudentsPromse(){
    return new Promise(function(resolve, reject) {
        let url = '/studentsAllData/';
        $.ajax({
            //url: '/api/sensor/?device='+device,
            url: url,
            type: "GET",
            cache: false,
            async: false,
            dataType: "json",   //返回指定對像
            beforeSend: function (xhr) {
               //$('.loading').html("<img src='{% static 'img/preloader.gif' %}' with='100' height='100'>");//Loading
               $('.showcontent').html(img_loading); 
               //console.log(img_loading);
               xhr.setRequestHeader("X-CSRFToken", csrftoken);
            },
            success: function (response) {
                //let json_obj = JSON.parse(JSON.stringify(response));
                //console.log(json_obj);             
                data = response;
            },
            error: function (error) {
              console.log('error');
            }
        });
        //console.log(data);
        resolve(data);

    });
}


//顯示學生資訊 -- UI
function showStudentData(obj){
    let str ='<table class="table table-striped align-middle">';
    str += '<thead>';
    str += '<tr>';
    str += '<th scope="col">學號</th>';
    str += '<th scope="col">姓名</th>';
    str += '<th scope="col">卡號</th>';
    str += '<th scope="col">性別</th>';
    str += '<th scope="col">班級</th>';
    str += '<th scope="col">座號</th>';
    str += '<th scope="col">身高（cm）</th>';
    str += '<th scope="col">體重（kg）</th>';
    str += '<th scope="col">每日應喝水量</th>';
    str += '<th scope="col"></th>';
    str += '</tr>';
    str += '</thead>';
    str += '<tbody>';
    //迴圈
    obj.forEach(function(value, key, array){
        if(value['Gender'] == 'Female'){
          gender = '女生';
        }else{
          gender = '男生';
        }


        str += '<tr>';
        str += '<td>'+value['SchoolID']+'</td>';
        str += '<td>'+value['Name']+'</td>';
        str += '<td>'+value['CardID']+'</td>';
        str += '<td>'+gender+'</td>';
        str += '<td>'+value['Class']+'</td>';
        str += '<td>'+value['Number']+'</td>';
        str += '<td>'+value['Height']+'</td>';
        str += '<td>'+value['Weight']+'</td>';
        str += '<td>'+value['DailyShouldDrink']+'</td>';
        str += '<td><a href="javascript:void(0)" onClick="createStudent('+value['SchoolID']+')">編輯</a> |  <a href="javascript:void(0)" onClick="delStudent('+value['SchoolID']+')">刪除</a></td>';
        str += '</tr>';
    });

    str += '</tbody>';

    str += '</table>'; 
    //console.log(str);  
    $(".showcontent").html(str);
}

//顯示學生飲水資訊列表 -- UI
function createStudent(type){ //schoolID
    //console.log(type);
    //console.log(typeof type);
    //console.log(data['datas']);
    if(type == 'create')
    {
      let schoolID = $('#SchoolID').val('');  //學號
      let name = $('#Name').val('');          //姓名
      let cardID = $('#CardID').val('');      //卡號
      let Class = $('#Class').val('');        //班級
      let height = $('#Height').val('');      //身高
      let weight = $('#Weight').val('');      //體重
      let number = $('#Number').val('');      //座號
      $('#SchoolID').show(); //表單
      $('#schoolIDtxt').text('');
      $("#gender option[value='non']").attr("selected","selected");
      //let gender = $('#gender').val('');      //姓別
      
      $(".showstatus").hide();
      $('.typetitle').text('新增');

      $('.sendbtn').html('<button type="button" class="btn btn-primary" onClick="createStudentData()">確定</button><button type="button" class="btn btn-secondary" data-dismiss="modal">取消</button> ');
    }
    else
    {
      //console.log(data['datas']);
        //級別
        findObj = data['datas'].find(function(element, index, arr){
            return element['SchoolID'] === type.toString();  // 取得陣列 like === '蘿蔔泥'
        });
        //console.log(findObj);
        //let schoolID = $('#SchoolID').val( findObj['SchoolID'] );  //學號
        $('#SchoolID').hide(); //表單
        $('#schoolIDtxt').text(findObj['SchoolID']);
        let name = $('#Name').val( findObj['Name'] );          //姓名
        let cardID = $('#CardID').val( findObj['CardID'] );      //卡號
        let Class = $('#Class').val( findObj['Class'] );        //班級
        let height = $('#Height').val( findObj['Height'] );      //身高
        let weight = $('#Weight').val( findObj['Weight'] );      //體重
        let number = $('#Number').val( findObj['Number'] );      //座號
        //性別
        if( findObj['Gender'] == 'Male' ){
           $("#gender option[value='Male']").attr("selected","selected");
        }else if( findObj['Gender'] == 'Female'){
           $("#gender option[value='Female']").attr("selected","selected");
        }

        $('.sendbtn').html('<button type="button" class="btn btn-primary" onClick="UpdStudent('+type+')">確定</button><button type="button" class="btn btn-secondary" data-dismiss="modal">取消</button> ');
        $('.typetitle').text('更新');
    }

    $('#createModal').modal({backdrop: 'static', keyboard: false});
}


//新增學生資料
function createStudentData(){
    let schoolID = $('#SchoolID').val();  //學號
    let name = $('#Name').val();          //姓名
    let cardID = $('#CardID').val();      //卡號
    let Class = $('#Class').val();        //班級
    let height = $('#Height').val();      //身高
    let weight = $('#Weight').val();      //體重
    let number = $('#Number').val();      //座號
    let gender = $('#gender').val();      //姓別
    //console.log(schoolID);
    //.replace(/\s*/g,""); 去除字符串内所有的空格
    if(schoolID == ''){
       alert('請輸入學號!');
    }else if(name == ''){
       alert('請輸入姓名!');
    }else if(cardID == ''){
       alert('請輸入卡號!');
    }else if(Class == ''){
       alert('請輸入班級!');
    }else if(height == ''){
       alert('請輸入身高!');
    }else if(weight == ''){
       alert('請輸入體重!');
    }else if(number == ''){
       alert('請輸入座號!');
    }else if(gender == 'non'){
       alert('請輸入姓別!');
    }else{
       //let schoolID = schoolID.replace(/\s/g, '');
       let item = {schoolID: schoolID,
                   name: name,
                   cardID: cardID,
                   class: Class,
                   height: height,
                   weight: weight,
                   number: number,
                   gender: gender,
                }
        //console.log(item);
        insertStudentData(item)
        .then(function() {
            //畫面重新整理
        });
    }
}


function insertStudentData(obj){
    return new Promise(function(resolve, reject) {
        //console.log(csrftoken);
        console.log(obj);
        let url = '/insertStudentsData/';
        //console.log(obj['schoolID']);
        $.ajax({
            //url: '/api/sensor/?device='+device,
            url: url,
            type: "POST",
            cache: false,
            async: false,
            data: {
                'csrfmiddlewaretoken': csrftoken,
                'schoolID': obj['schoolID'], 
                'name': obj['name'],
                'cardID': obj['cardID'],
                'Class': obj['class'],
                'height': obj['height'],
                'weight': obj['weight'],
                'number': obj['number'],
                'gender': obj['gender'],
            },
            success: function (response) {
                console.log(response);
                //console.log(response['status']);
                if(response['status'] == 'okay'){
                    alert('新增成功!');
                }else{
                    alert('新增失敗!');
                }
                $("#createModal").modal('hide');  //隱藏 Modal
                location.reload();
                //data1 = response;
            },
            error: function (error) {
              console.log(error);
            }
        });    
        resolve('ok');
    });
}




//學生更新資訊
function UpdStudent(schoolId){
   //console.log(schoolId);
    let name = $('#Name').val();          //姓名
    let cardID = $('#CardID').val();      //卡號
    let Class = $('#Class').val();        //班級
    let height = $('#Height').val();      //身高
    let weight = $('#Weight').val();      //體重
    let number = $('#Number').val();      //座號
    let gender = $('#gender').val();      //姓別
    //console.log(schoolId);

    let url = '/updStudentsData/';
    $.ajax({
        //url: '/api/sensor/?device='+device,
        url: url,
        type: "POST",
        cache: false,
        async: false,
        data: {
            'csrfmiddlewaretoken': csrftoken,
            'schoolID': schoolId, 
            'name': name,
            'cardID': cardID,
            'Class': Class,
            'height': height,
            'weight': weight,
            'number': number,
            'gender': gender,
        },
        success: function (response) {
            console.log(response);
            //console.log(response['status']);
            if(response['status'] == 'okay'){
                alert('更新成功!');
            }else{
                alert('更新失敗!');
            }
            $("#createModal").modal('hide');  //隱藏 Modal
            location.reload();
            //data1 = response;
        },
        error: function (error) {
          console.log(error);
        }
    });
}


//確認刪除學生資訊
function delStudent(schoolId){
    //console.log(schoolId);
    //console.log(data);
    findObj = data['datas'].find(function(element, index, arr){
            return element['SchoolID'] === schoolId.toString();  // 取得陣列 like === '蘿蔔泥'
    });
    //console.log(findObj);
    let str ='<p>';
    str += '學號:'+schoolId+'<p>';
    str += '姓名:'+findObj['Name']+'<p>';
    str += '卡號:'+findObj['CardID']+'<p>';
    str += '班級:'+findObj['Class']+'<p>';
    //性別
    if( findObj['Gender'] == 'Male' ){
        str += '性別:男生<p>';
    }else if( findObj['Gender'] == 'Female'){
        str += '性別:女生<p>';
    }
    str += '身高:'+findObj['Height']+'<p>';
    str += '體重:'+findObj['Weight']+'<p>';
    str += '座號:'+findObj['Number']+'<p>';
    str += '<input type="hidden" id="schoolId" value="'+schoolId+'">';

    $('#personal').html(str);
    $('#delModal').modal({backdrop: 'static', keyboard: false});
}


//刪除學生資訊
function deleteStudentData(){
    let schoolId = $('#schoolId').val();
    //console.log(csrftoken);
    let url = '/delStudentsData/';
    $.ajax({
        //url: '/api/sensor/?device='+device,
        url: url,
        type: "POST",
        cache: false,
        async: false,
        data: {
            'csrfmiddlewaretoken': csrftoken,
            'schoolID': schoolId, 
        },
        success: function (response) {
            //console.log(response);
            //console.log(response['status']);
            if(response['status'] == 'okay'){
                alert('刪除成功!');
            }else{
                alert('刪除失敗!');
            }
            $("#delModal").modal('hide');  //隱藏 Modal
            location.reload();
            //data1 = response;
        },
        error: function (error) {
          console.log(error);
        }
    });
}


//送出查詢學生資料
function SearchMembers(){
    let grade = $('#grade').val();
    let Class = $('#class').val();
    let schoolID = $('#schoolID').val();
    //console.log(grade);
    //console.log(Class);
    console.log(schoolID);
    console.log(typeof schoolID);
    //console.log(data['datas']);//儲存所有學生資訊
    var filterObj;
    if(grade =='non' && Class =='non' && schoolID ==''){
        //沒有條件
        filterObj =data['datas'];
    }else if(grade !='non' && Class =='non' && schoolID ==''){
        //級別
        filterObj = data['datas'].filter(function(element, index, arr){
            if(String(element['Class']).indexOf(grade) != -1){
                return element;
            }
        });
    }else if(Class !='non' && schoolID ==''){
        //班級
        filterObj = data['datas'].filter(function(element, index, arr){
            return element['Class'] == Class;
        });
    }else if(schoolID !=''){
        //學號
        filterObj = data['datas'].filter(function(element, index, arr){
            return element['SchoolID'] == schoolID;
        });
        console.log('schoolID');
    }
    console.log(filterObj);
   showStudentData(filterObj);
   /* searchStudentInfo(grade, Class, schoolID)
    .then(function(obj) {
        //barChart.update();   //更新圖表
        //console.log(msgs);
    }); */
}