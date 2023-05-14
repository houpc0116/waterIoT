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
    //console.log(date);
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
function initChartPromse1(grade, Class, schoolId, form, to){
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
                'grade': grade,
                'Class': Class,
                'schoolId': schoolId,
                'formdate': form,
                'todate': to, 
            },
            /*beforeSend: function (xhr) {
               //$('.loading').html("<img src='{% static 'img/preloader.gif' %}' with='100' height='100'>");//Loading
               xhr.setRequestHeader("X-CSRFToken", csrftoken);
            },*/
            success: function (response) {
                //console.log(response);
                data = response;
            },
            error: function (error) {
              console.log(error);
            }
        });
        resolve(data);
    //}, 100);
  });
}

//顯示飲水機細節資訊
function showInfo(dispenser){
    //console.log(val); // ## 所有飲水機資料
    var filterObj = val['data'].filter(function(item, index, array){
         return item.Dispenser == dispenser;       // 取得飲水機名稱一樣
    });
    //console.log(filterObj);
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
   //console.log(obj['data']);
   let str ='';
   //str += "<ul class=\"list-group list-group-flush showdispenser\">";           
   obj['data'].forEach(function(value, key, array){
       //console.log(value['Dispenser']);
        if(value['Dispenser'] != 'EE0601' && value['Dispenser'] != 'xinxing09'){
            str += "<div class='row'>";
            // ## 飲水機名稱
            //str += "<div class='col col-sm-12 col-md-4 col-lg-2'>";
            str += "<div class='col-auto'>";
            str += "<a href='javascript:void(0)' onClick=\"showInfo('"+value['Dispenser']+"')\">"+value['Dispenser']+"</a>";
            str += "</div>";
            // ## 飲水機是否上線
            //Modbus 打卡時間
            const dateModbus = new Date(value['LastModbusPunchInTime']);
            const timestampInSeconds = Math.floor(dateModbus.getTime() / 1000);  //換成秒數
            //現在連線時間
            const nowdate = new Date();
            const timestampNowSeconds = Math.floor(nowdate.getTime() / 1000);  //換成秒數
            //str += "<div class='col col-sm-12 col-md-2 col-lg-1'>";
            str += "<div class='col-auto'>";
            if( (timestampNowSeconds - timestampInSeconds) > 240){  //大於四分鐘
               status = '已離線';
               str += "<span id='onlinestatus' style='color:red'>"+status+"</span>";
            }else{
               status = '連線中';
               str += "<span id='onlinestatus' style='color:green'>"+status+"</span>";
            }
            str += "</div>";
            //目前飲水總量
            str += "<div class='col col-sm-12 col-md-2 col-lg-3'>";
            //str += "<div class='col-auto'>";
            str += "<span>供水情況："+value['Current']+' ml</span>';
            str += "</div>";
            // ## 最後打卡時間
            str += "<div class='col col-sm-12 col-lg-6'>";
            //str += "<div class='col-auto'>";
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
                console.log(response);
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
               //$('.showcontent').html(img_loading);
               loadPageLoading(); 
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


//更新目前會員資料庫
function updateCurrentDB(filename){
    return new Promise(function(resolve, reject) {
        //console.log(filename);
        let url = '/updateMembersData/';
        $.ajax({
            url: url,
            type: "POST",
            cache: false,
            async: false,
            data: {
                'csrfmiddlewaretoken': csrftoken,
                'fileName': filename, 
            },
            success: function (response) {
                data = response;
            },
            error: function (error) {
              console.log('error');
            }
        });
        resolve(data);
    });
}



//所有教職員資訊
function initFacultyPromse(){
    return new Promise(function(resolve, reject) {
        let url = '/facultyAllData/';
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
        console.log(data);
        resolve(data);
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
        let grade = $('#grade').val();
        let Class = $('#class').val();
        let schoolId = $('#SchoolID').val();
        let form = $('#form').val();
        let to  = $('#to').val();
        /*
        console.log(grade);
        console.log(Class);
        console.log(schoolId);
        console.log(form);
        console.log(to);
        */
        initChartPromse1(grade, Class, schoolId, form, to)
        .then(function(obj) {
            //console.log(obj);
            //取出CardID相對應的raw data
            var filterObj = obj['datas'].filter(function(element, index, arr){
                return element['Dispenser'] == "xinxing06";
            });
            //console.log(filterObj);
            showStudentList(obj['members'], obj['datas']); //顯示列表畫面
            //顯示圖表
            var diff = (DateDiff(form, to)+1); //計算開始和結束日期相差天數
            //儲存日期陣列
            var startDate = form;
            for(var i=0;i<diff;i++){
               yAxis.push(startDate);
               //計算取水量
               getWaterVolum(obj['datas'], startDate);
               let result = getWaterVolum(obj['datas'], startDate);
               //console.log(result);
               cold.push(result[0]);
               warn.push(result[1]);
               hot.push(result[2]);
               //重新設定日期
               startDate = addDays(startDate, 1);
            }
        })
        .then(function(){
            barChart.update();   //更新圖表
        });
    }
}

//顯示學生飲水資訊列表 -- UI
function showStudentList(obj, data){ 
    //console.log(data);
    let form = $('#form').val(); //起時日期
    let to  = $('#to').val();    //結束日期
    var diff = (DateDiff(form, to)+1); //計算開始和結束日期相差天數
    //console.log(typeof diff);
    let str ='<table class="table table-striped align-middle">';
       str += '<thead>';
       str += '<tr>';
       str += '<th scope="col">學號</th>';
       str += '<th scope="col">姓名</th>';;
       str += '<th scope="col">性別</th>';
       str += '<th scope="col">班級</th>';
       str += '<th scope="col">座號</th>';
       str += '<th scope="col">每日應喝飲水量</th>';
       str += '<th scope="col">每日平均飲水量</th>';
       str += '<th scope="col">飲水完成度</th>';
       str += '<th scope="col"></th>';
       str += '</tr>';
       str += '</thead>';
       str += '<tbody>';     

       obj.forEach(function(value, key, array){
            if(value['Gender'] == 'Female'){
              gender = '女生';
            }else{
              gender = '男生';
            }
            //取出CardID相對應的raw data
            var filterObj = data.filter(function(element, index, arr){
                //return element['CardID'] == value['CardID'];
                if((element['CardID'] == value['CardID']) || (element['CardID'] == value['SchoolID'])){
                     return element;
                }
            });
            //console.log(filterObj);
            let sum =0;
            let avg =0;
            filterObj.forEach(function(value, key, array){
                  sum += value['WaterVolume'];
            });
            if(sum == 0){
                avg =0;
                percent1 =0;
            }else{
                avg =Math.floor(sum / diff);
                percent1 =Math.floor(sum / (parseInt(value['DailyShouldDrink']) * diff)  * 100);
            }
            //console.log(percent1);
            str += '<tr>';
            str += '<td>'+value['SchoolID']+'</td>';
            str += '<td>'+value['Name']+'</td>';
            str += '<td>'+gender+'</td>';
            str += '<td>'+value['Class']+'</td>';
            str += '<td>'+value['Number']+'</td>';
            str += '<td>'+Math.round(value['DailyShouldDrink'])+'</td>';
            str += '<td>'+avg+' ml</td>';
            str += '<td>'+percent1+'%</td>';
            str += '<td><a href="javascript:void(0)" onClick=\"detail('+value['SchoolID']+')\">詳細</a></td>';
            str += '</tr>';
       });
       str += '</tbody>';
       str += '</table>';

       $(".showmember").html(str);
}


function createStudent(type){ //schoolID
    //console.log(type);
    //console.log(typeof type);
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
            return element['SchoolID'] === String(type);  // 取得陣列 like === '蘿蔔泥'
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

function delStudent(){
    $('#delModal').modal({backdrop: 'static', keyboard: false});
}

function batchData(){
  $(".custom-file-label").html('');
  $('#uploadModal').modal({backdrop: 'static', keyboard: false});
}

//上傳檔案
function uploadFile() {
  loadPageLoading();
  $("#uploadModal").modal('hide');
  var file = document.getElementById("fileupload").files;  //存取檔案

  var fd = new FormData();            //模擬表單
 
  //上傳檔案
  var type =  file[0]['type'];                 //資料型態MIME
  var size =  file[0]['size'];                 //資料檔案大小, 單位為bytes
  
  fd.append('fileupload', file[0]);    //圖檔
  //fd.append('csrfmiddlewaretoken', csrftoken);    //圖檔
  //console.log(csrftoken);
  
  const headers = new Headers({
            'X-CSRFToken': csrftoken
        });
  let url = '/uploadstudentdata/';
  fetch(url, {
    method: 'POST',
    headers: headers,
    body: fd,
  }).then((response) => {
    return response.json();
    //return response.text();
  }).then((jsonData) => {  //完成時
    //console.log(jsonData);
    var obj = JSON.parse(JSON.stringify(jsonData));  //資料型態-物件
    //console.log(obj);
    //2023.02.23 加入更新現有資料庫
    updateCurrentDB(obj['filename'])
    .then(function(result) {
        console.log(result);
          //console.log(obj['datas']);
         //顯示畫面
          if(obj['status'] == 'ok'){
            alert('更新成功!');
            location.reload();
            //console.log('next');
            //updateExistingData();
          }else{
            alert('更新失敗!');
          }
    }); 
  }).catch((err) => {
    console.log('error:', err);
  });
}

//送出查詢學生資料
function SearchMembers(){
    let grade = $('#grade').val();
    let Class = $('#class').val();
    let schoolID = $('#schoolID').val();
    //console.log(grade);
    //console.log(Class);
    //console.log(schoolID);
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
        //console.log('schoolID');
    }
    //console.log(filterObj);
   showStudentData(filterObj);
   /* searchStudentInfo(grade, Class, schoolID)
    .then(function(obj) {
        //barChart.update();   //更新圖表
        //console.log(msgs);
    }); */
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
                //console.log(response);
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
            //console.log(response);
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
            return element['SchoolID'] === String(schoolId);  // 取得陣列 like === '蘿蔔泥'
    });
    console.log(findObj);
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


//各別學生每日飲水資料
function detail(schoolID){
    //清空陣列
    while (yAxis1.length > 0) {
        yAxis1.pop();
    }

    while (cold1.length > 0) {
        cold1.pop();
    }

    while (warn1.length > 0) {
        warn1.pop();
    }

    while (hot1.length > 0) {
        hot1.pop();
    }
   //console.log(schoolID);
   //console.log(data);
    $("#showdailydata").html('');
    var findObj = data['members'].find(function(item, index, array){
         return item.SchoolID == String(schoolID);       // 取得飲水機名稱一樣
    });
    //顯示名字
    $('#studentname').html(schoolID+'/'+findObj['Name']);

    let form = $('#form').val();
    let to = $('#to').val();
    var filterObj = data['datas'].filter(function(item, index, array){
        //return item.CardID == String(findObj['CardID']) && (item.Timming >= form &&  item.Timming <= to);       // 取得飲水機名稱一樣
        //return item.CardID == String(findObj['CardID']);       // 取得飲水機名稱一樣
        if( (item.CardID == String(findObj['CardID'])) || (item.CardID == String(findObj['SchoolID'])) ){
             return item;
        }
    });
    console.log(filterObj);
    var diff = (DateDiff(form, to)+1); //計算開始和結束日期相差天數   
   let str ='<table class="table table-striped align-middle">';
       str += '<thead>';
       str += '<tr>';
       str += '<th scope="col">日期</th>';
       str += '<th scope="col">每日應喝飲水量</th>';
       str += '<th scope="col">實際飲水量</th>';
       str += '<th scope="col">冷水</th>';
       str += '<th scope="col">溫水</th>';
       str += '<th scope="col">熱水</th>';
       str += '<th scope="col">飲水完成度</th>';
       str += '</tr>';
       str += '</thead>';
       str += '<tbody>';
       //儲存日期陣列
       var startDate = form;
       for(var i=0;i<diff;i++){
          yAxis1.push(startDate);
          //console.log(startDate);
          //計算取水量
          getWaterVolum(filterObj, startDate);
          let result = getWaterVolum(filterObj, startDate);
          //console.log(result);
          cold1.push(result[0]);
          warn1.push(result[1]);
          hot1.push(result[2]);
          let sum = parseInt(result[0]) + parseInt(result[1]) + parseInt(result[2]);
          console.log( typeof(sum) );
          console.log( typeof(findObj['DailyShouldDrink']) );
          //console.log(typeof findObj['DailyShouldDrink']);
          //console.log(findObj['DailyShouldDrink']);
          var percent1 = 0;
          //console.log(percent);
          if(sum == 0){
            percent1 =0;
          }else{
            //percent =Math.round(findObj['DailyShouldDrink'] / sum);
            percent1 =Math.floor(sum / parseInt(findObj['DailyShouldDrink']) * 100);
          }
          console.log(percent1);

          //樣版
          str += "<tr>";
          str += "<td>"+startDate+"</td>";
          str += "<td>"+Math.round(findObj['DailyShouldDrink'])+"</td>";
          str += "<td>"+sum+"</td>";
          str += "<td>"+result[0]+"</td>";
          str += "<td>"+result[1]+"</td>";
          str += "<td>"+result[2]+"</td>";
          str += "<td>"+percent1+"%</td>";
          str += "</tr>";
          //重新設定日期
          startDate = addDays(startDate, 1);
       }

       str += '</tbody>';
       str += '</table>';
       //console.log(yAxis1);
       $("#showdailydata").html(str);
       barChart1.update();   //更新圖表       

   $('#DailyDataModal').modal({backdrop: 'static', keyboard: false});
}

//載入頁面
function loadPageLoading(){
    $('body').loading(); // 開始
}

//載入頁面
function cancelPageLoading(){
    $('body').loading('stop'); // 開始
}


//飲水機保溫設定
// 2023.04.24 新增
function Controltemp(Dispenser, type){
    $('.message').text('');
    var temp =0;
    if(type == 'hot'){
       if($('#hottemp').val() == ''){
          $('.message').text('請輸入溫度數值');
          $('#dispensermsgModal').modal({backdrop: 'static', keyboard: false});
       }
       else{
          temp = $('#hottemp').val();
          settingDispenserTemp(Dispenser, temp, type);
       }
    }
    else{
      if($('#hottemp').val() == ''){
          $('.message').text('請輸入溫度數值');
          $('#dispensermsgModal').modal({backdrop: 'static', keyboard: false});
       }
       else{
          temp = $('#coldtemp').val();
          settingDispenserTemp(Dispenser, temp, type);
       }
    }
}

// 2023.04.24 新增
function settingDispenserTemp(Dispenser, temp, type){
    let url = '/insulation/';
    $.ajax({
        //url: '/api/sensor/?device='+device,
        url: url,
        type: "POST",
        cache: false,
        async: false,
        data: {
            'csrfmiddlewaretoken': csrftoken,
            'Dispenser': Dispenser,
            'temp': temp,
            'type': type,
        },
        success: function (response) {
            console.log(response);
            //$('#status').text('飲水機節電設定');
            if(response['status'] == "okay"){
               //alert('更新成功!');
                $('.message').text('設定成功!');
            }
            else{
               //alert('更新失敗!');
                $('.message').text('飲水機連線異常,無法設定');
            }
            $('#dispensermsgModal').modal({backdrop: 'static', keyboard: false});
            //data = response;
        },
        error: function (error) {
            console.log(error);
        }
    });
}

//飲水機節電設定
// 2023.04.24 新增
//飲水機節電設定
function savingPw(Dispenser){
   /*
   var saving_pw1_on = $('#saving_pw1_on').val();
   var saving_pw1_off = $('#saving_pw1_off').val();
   var saving_pw2_on = $('#saving_pw2_on').val();
   var saving_pw2_off = $('#saving_pw2_off').val();
   var saving_pw3_on = $('#saving_pw3_on').val();
   var saving_pw3_off = $('#saving_pw3_off').val();
   var saving_pw4_on = $('#saving_pw4_on').val();
   var saving_pw4_off = $('#saving_pw4_off').val();
   var saving_pw5_on = $('#saving_pw5_on').val();
   var saving_pw5_off = $('#saving_pw5_off').val();
   var saving_pw6_on = $('#saving_pw6_on').val();
   var saving_pw6_off = $('#saving_pw6_off').val();
   var saving_pw7_on = $('#saving_pw7_on').val();
   var saving_pw7_off = $('#saving_pw7_off').val();
   */
   //console.log( typeof saving_pw_on);
   //console.log(saving_pw_off);
   // 星期一
   if( $("#SavingSwitch1").prop("checked") == true){
      if($('#saving_pw1_on').val() == "00:00" && $('#saving_pw1_off').val() == "00:00"){
         var saving_pw1_on = "0";
         var saving_pw1_off = "0";
      }else if($('#saving_pw1_on').val() == "00:00" && $('#saving_pw1_off').val() != "00:00" && $('#saving_pw1_off').val() != ""){
         var saving_pw1_on = "0";
         var saving_pw1_off = $('#saving_pw1_off').val();
      }else if($('#saving_pw1_on').val() != "00:00" && $('#saving_pw1_off').val() == "00:00" && $('#saving_pw1_on').val() != ""){
         var saving_pw1_on = $('#saving_pw1_on').val();
         var saving_pw1_off = "0";
      }else if($('#saving_pw1_on').val() != "00:00" && $('#saving_pw1_off').val() != "00:00" && $('#saving_pw1_on').val() != "" && $('#saving_pw1_off').val() != ""){
         var saving_pw1_on = $('#saving_pw1_on').val();
         var saving_pw1_off = $('#saving_pw1_off').val();
      }else {
          console.log('請輸入節電時間');
      }
   }else{
      var saving_pw1_on = "9999";
      var saving_pw1_off = "9999";
   }
   // 星期二
   if( $("#SavingSwitch2").prop("checked") == true){
      if($('#saving_pw2_on').val() == "00:00" && $('#saving_pw2_off').val() == "00:00"){
         saving_pw2_on = "0";
         saving_pw2_off = "0";
      }else if($('#saving_pw2_on').val() == "00:00" && $('#saving_pw2_off').val() != "00:00" && $('#saving_pw2_off').val() != ""){
         saving_pw2_on = "0";
         saving_pw2_off = $('#saving_pw2_off').val();
      }else if($('#saving_pw2_on').val() != "00:00" && $('#saving_pw2_off').val() == "00:00" && $('#saving_pw2_on').val() != ""){
         saving_pw2_on = $('#saving_pw2_on').val();
         saving_pw2_off = "0";
      }else if($('#saving_pw2_on').val() != "00:00" && $('#saving_pw2_off').val() != "00:00" && $('#saving_pw2_on').val() != "" && $('#saving_pw2_off').val() != ""){
         saving_pw2_on = $('#saving_pw2_on').val();
         saving_pw2_off = $('#saving_pw2_off').val();
      }else {
          console.log('請輸入節電時間');
      }
   }else{
      var saving_pw2_on = "9999";
      var saving_pw2_off = "9999";
   }
   // 星期三
   if( $("#SavingSwitch3").prop("checked") == true){
      if($('#saving_pw3_on').val() == "00:00" && $('#saving_pw3_off').val() == "00:00"){
         saving_pw3_on = "0";
         saving_pw3_off = "0";
      }else if($('#saving_pw3_on').val() == "00:00" && $('#saving_pw3_off').val() != "00:00" && $('#saving_pw3_off').val() != ""){
         saving_pw3_on = "0";
         saving_pw3_off = $('#saving_pw3_off').val();
      }else if($('#saving_pw3_on').val() != "00:00" && $('#saving_pw3_off').val() == "00:00" && $('#saving_pw3_on').val() != ""){
         saving_pw3_on = $('#saving_pw3_on').val();
         saving_pw3_off = "0";
      }else if($('#saving_pw3_on').val() != "00:00" && $('#saving_pw3_off').val() != "00:00" && $('#saving_pw3_on').val() != "" && $('#saving_pw3_off').val() != ""){
         saving_pw3_on = $('#saving_pw3_on').val();
         saving_pw3_off = $('#saving_pw3_off').val();
      }else {
          console.log('請輸入節電時間');
      }
   }else{
      var saving_pw3_on = "9999";
      var saving_pw3_off = "9999";
   }
   // 星期四
   if( $("#SavingSwitch4").prop("checked") == true){
      if($('#saving_pw4_on').val() == "00:00" && $('#saving_pw4_off').val() == "00:00"){
         saving_pw4_on = "0";
         saving_pw4_off = "0";
      }else if($('#saving_pw4_on').val() == "00:00" && $('#saving_pw4_off').val() != "00:00" && $('#saving_pw4_off').val() != ""){
         saving_pw4_on = "0";
         saving_pw4_off = $('#saving_pw4_off').val();
      }else if($('#saving_pw4_on').val() != "00:00" && $('#saving_pw4_off').val() == "00:00" && $('#saving_pw4_on').val() != ""){
         saving_pw4_on = $('#saving_pw4_on').val();
         saving_pw4_off = "0";
      }else if($('#saving_pw4_on').val() != "00:00" && $('#saving_pw4_off').val() != "00:00" && $('#saving_pw4_on').val() != "" && $('#saving_pw4_off').val() != ""){
         saving_pw4_on = $('#saving_pw4_on').val();
         saving_pw4_off = $('#saving_pw4_off').val();
      }else {
          console.log('請輸入節電時間');
      }
   }else{
      var saving_pw4_on = "9999";
      var saving_pw4_off = "9999";
   }
   // 星期五
   if( $("#SavingSwitch5").prop("checked") == true){
      if($('#saving_pw5_on').val() == "00:00" && $('#saving_pw5_off').val() == "00:00"){
         saving_pw5_on = "0";
         saving_pw5_off = "0";
      }else if($('#saving_pw5_on').val() == "00:00" && $('#saving_pw5_off').val() != "00:00" && $('#saving_pw5_off').val() != ""){
         saving_pw5_on = "0";
         saving_pw5_off = $('#saving_pw5_off').val();
      }else if($('#saving_pw5_on').val() != "00:00" && $('#saving_pw5_off').val() == "00:00" && $('#saving_pw5_on').val() != ""){
         saving_pw5_on = $('#saving_pw5_on').val();
         saving_pw5_off = "0";
      }else if($('#saving_pw5_on').val() != "00:00" && $('#saving_pw5_off').val() != "00:00" && $('#saving_pw5_on').val() != "" && $('#saving_pw5_off').val() != ""){
         saving_pw5_on = $('#saving_pw5_on').val();
         saving_pw5_off = $('#saving_pw5_off').val();
      }else {
          console.log('請輸入節電時間');
      }
   }else{
      var saving_pw5_on = "9999";
      var saving_pw5_off = "9999";
   }
   // 星期六
   if( $("#SavingSwitch6").prop("checked") == true){
      if($('#saving_pw6_on').val() == "00:00" && $('#saving_pw6_off').val() == "00:00"){
         saving_pw6_on = "0";
         saving_pw6_off = "0";
      }else if($('#saving_pw6_on').val() == "00:00" && $('#saving_pw6_off').val() != "00:00" && $('#saving_pw6_off').val() != ""){
         saving_pw6_on = "0";
         saving_pw6_off = $('#saving_pw6_off').val();
      }else if($('#saving_pw6_on').val() != "00:00" && $('#saving_pw6_off').val() == "00:00" && $('#saving_pw6_on').val() != ""){
         saving_pw6_on = $('#saving_pw6_on').val();
         saving_pw6_off = "0";
      }else if($('#saving_pw6_on').val() != "00:00" && $('#saving_pw6_off').val() != "00:00" && $('#saving_pw6_on').val() != "" && $('#saving_pw6_off').val() != ""){
         saving_pw6_on = $('#saving_pw6_on').val();
         saving_pw6_off = $('#saving_pw6_off').val();
      }else {
          console.log('請輸入節電時間');
      }
   }else{
      var saving_pw6_on = "9999";
      var saving_pw6_off = "9999";
   }
   // 星期日
   if( $("#SavingSwitch7").prop("checked") == true){
      if($('#saving_pw7_on').val() == "00:00" && $('#saving_pw7_off').val() == "00:00"){
         saving_pw7_on = "0";
         saving_pw7_off = "0";
      }else if($('#saving_pw7_on').val() == "00:00" && $('#saving_pw7_off').val() != "00:00" && $('#saving_pw7_off').val() != ""){
         saving_pw7_on = "0";
         saving_pw7_off = $('#saving_pw7_off').val();
      }else if($('#saving_pw7_on').val() != "00:00" && $('#saving_pw7_off').val() == "00:00" && $('#saving_pw7_on').val() != ""){
         saving_pw7_on = $('#saving_pw7_on').val();
         saving_pw7_off = "0";
      }else if($('#saving_pw7_on').val() != "00:00" && $('#saving_pw7_off').val() != "00:00" && $('#saving_pw7_on').val() != "" && $('#saving_pw7_off').val() != ""){
         saving_pw7_on = $('#saving_pw7_on').val();
         saving_pw7_off = $('#saving_pw7_off').val();
      }else {
          console.log('請輸入節電時間');
      }
   }else{
      var saving_pw7_on = "9999";
      var saving_pw7_off = "9999";
   }

   if(saving_pw1_on == undefined || saving_pw1_off == undefined || saving_pw2_on == undefined || saving_pw2_off == undefined || saving_pw3_on == undefined || saving_pw3_off == undefined || saving_pw4_on == undefined || saving_pw4_off == undefined || saving_pw5_on == undefined || saving_pw5_off == undefined || saving_pw6_on == undefined || saving_pw6_off == undefined || saving_pw7_on == undefined || saving_pw7_off == undefined){
      $('.message').text('請輸入節電設定相關的時間');
      $('#dispensermsgModal').modal({backdrop: 'static', keyboard: false});
   }
   else{
        //console.log('send');
        let url = '/savingPW/';
        $.ajax({
            //url: '/api/sensor/?device='+device,
            url: url,
            type: "POST",
            cache: false,
            async: false,
            data: {
                'csrfmiddlewaretoken': csrftoken,
                'Dispenser': Dispenser,
                'Saving_pw1_on': saving_pw1_on,
                'Saving_pw1_off': saving_pw1_off,
                'Saving_pw2_on': saving_pw2_on,
                'Saving_pw2_off': saving_pw2_off,
                'Saving_pw3_on': saving_pw3_on,
                'Saving_pw3_off': saving_pw3_off,
                'Saving_pw4_on': saving_pw4_on,
                'Saving_pw4_off': saving_pw4_off,
                'Saving_pw5_on': saving_pw5_on,
                'Saving_pw5_off': saving_pw5_off,
                'Saving_pw6_on': saving_pw6_on,
                'Saving_pw6_off': saving_pw6_off,
                'Saving_pw7_on': saving_pw7_on,
                'Saving_pw7_off': saving_pw7_off,
            },
            success: function (response) {
                //console.log(response);
                if(response['status'] == "okay"){
                    //alert('更新成功!');
                    $('.message').text('設定成功!');
                }
                else{
                    //alert('更新失敗!');
                    $('.message').text('飲水機連線異常,無法設定');
                }
                $('#dispensermsgModal').modal({backdrop: 'static', keyboard: false});
            },
            error: function (error) {
                console.log(error);
            }
        });
    }
}

//飲水機取出控制值。 2023.03.15 create
//2023.04.25 update
function initDispenserCtrl(device){
    //console.log(device);
    let url = '/getSetting/';
    $.ajax({
        //url: '/api/sensor/?device='+device,
        url: url,
        type: "POST",
        cache: false,
        async: false,
        data: {
            'csrfmiddlewaretoken': csrftoken,
            'Dispenser': device,
        },
        success: function (response) {
            //console.log(response['data']);
            //console.log(typeof response['data']['Hot_insulation'] );
            $('#hottemp').val(response['data']['Hot_insulation']);
            $('#coldtemp').val(response['data']['Cold_insulation']);
            
            const regex = /(.{2})/g;
            //以下是節電
            //星期一節電開
            if(response['data']['Savingpwon1'] == "9999" && response['data']['Savingpwoff1'] == "9999"){
                $('#SavingSwitch1').prop("checked",false);  //沒有勾選
            }
            
            if(response['data']['Savingpwon1'] == "9999"){    
                $('#saving_pw1_on').val("");
            }else if(response['data']['Savingpwon1'] == "0"){
                $('#SavingSwitch1').prop("checked",true);  //有勾選
                $('#saving_pw1_on').val("00:00");
            }else{
                $('#SavingSwitch1').prop("checked",true);  //有勾選
                if((response['data']['Savingpwon1']).length == 3){
                    let newStr = "0"+response['data']['Savingpwon1'];
                    const resulton1 = newStr.match(regex);
                    $('#saving_pw1_on').val(resulton1[0]+':'+resulton1[1]);  
                }else{
                    const resulton1 = (response['data']['Savingpwon1']).match(regex);
                    $('#saving_pw1_on').val(resulton1[0]+':'+resulton1[1]);
                }
            }
            //星期一節電關
            if(response['data']['Savingpwoff1'] == "9999"){    
                $//('#SavingSwitch1').prop("checked",false);  //沒有勾選
                $('#saving_pw1_off').val("");
            }else if(response['data']['Savingpwoff1'] == "0"){
                $('#SavingSwitch1').prop("checked",true);  //沒有勾選
                $('#saving_pw1_off').val("00:00");
            }else{
                $('#SavingSwitch1').prop("checked",true);  //沒有勾選
                if((response['data']['Savingpwoff1']).length == 3){
                   let newStr = "0"+response['data']['Savingpwoff1'];
                   const resultoff1 = newStr.match(regex);
                   $('#saving_pw1_off').val(resultoff1[0]+':'+resultoff1[1]);
                }else{
                   const resultoff1 = (response['data']['Savingpwoff1']).match(regex);
                   //console.log(resultoff1);
                   $('#saving_pw1_off').val(resultoff1[0]+':'+resultoff1[1]);
                }
            }
            //星期二節電開
            if(response['data']['Savingpwon2'] == "9999" && response['data']['Savingpwoff2'] == "9999"){
                $('#SavingSwitch2').prop("checked",false);  //沒有勾選
            }

            if(response['data']['Savingpwon2'] == "9999"){    
                $('#saving_pw2_on').val("");
            }else if(response['data']['Savingpwon2'] == "0"){
                $('#SavingSwitch2').prop("checked",true);  //沒有勾選
                $('#saving_pw2_on').val("00:00");
            }else{
                $('#SavingSwitch2').prop("checked",true);  //沒有勾選
                if((response['data']['Savingpwon2']).length == 3){
                    let newStr = "0"+response['data']['Savingpwon2'];
                    const resulton2 = newStr.match(regex);
                    $('#saving_pw2_on').val(resulton2[0]+':'+resulton2[1]);  
                }else{
                    const resulton2 = (response['data']['Savingpwon2']).match(regex);
                    $('#saving_pw2_on').val(resulton2[0]+':'+resulton2[1]);
                }
            }
            //星期二節電關
            if(response['data']['Savingpwoff2'] == "9999"){    
                //$('#SavingSwitch2').prop("checked",false);  //沒有勾選
                $('#saving_pw2_off').val("");
            }else if(response['data']['Savingpwoff2'] == "0"){
                $('#SavingSwitch2').prop("checked",true);  //沒有勾選
                $('#saving_pw2_off').val("00:00");
            }else{
                $('#SavingSwitch2').prop("checked",true);  //沒有勾選
                if((response['data']['Savingpwoff2']).length == 3){
                   let newStr = "0"+response['data']['Savingpwoff2'];
                   const resultoff2 = newStr.match(regex);
                   $('#saving_pw2_off').val(resultoff2[0]+':'+resultoff2[1]);
                }else{
                   const resultoff2 = (response['data']['Savingpwoff2']).match(regex);
                   $('#saving_pw2_off').val(resultoff2[0]+':'+resultoff2[1]);
                }
            }
            //星期三節電開
            if(response['data']['Savingpwon3'] == "9999" && response['data']['Savingpwoff3'] == "9999"){
                $('#SavingSwitch3').prop("checked",false);  //沒有勾選
            }

            if(response['data']['Savingpwon3'] == "9999"){    
                //$('#SavingSwitch3').prop("checked",false);  //沒有勾選
                $('#saving_pw3_on').val("");
            }else if(response['data']['Savingpwon3'] == "0"){
                $('#SavingSwitch3').prop("checked",true);  //沒有勾選
                $('#saving_pw3_on').val("00:00");
            }else{
                $('#SavingSwitch3').prop("checked",true);  //沒有勾選
                if((response['data']['Savingpwon3']).length == 3){
                    let newStr = "0"+response['data']['Savingpwon3'];
                    const resulton3 = newStr.match(regex);
                    $('#saving_pw3_on').val(resulton3[0]+':'+resulton3[1]);  
                }else{
                    const resulton3 = (response['data']['Savingpwon3']).match(regex);
                    $('#saving_pw3_on').val(resulton3[0]+':'+resulton3[1]);
                }                
            }
            //星期三節電關
            if(response['data']['Savingpwoff3'] == "9999"){    
                //$('#SavingSwitch3').prop("checked",false);  //沒有勾選
                $('#saving_pw3_off').val("");
            }else if(response['data']['Savingpwoff3'] == "0"){
                $('#SavingSwitch3').prop("checked",true);  //沒有勾選
                $('#saving_pw3_off').val("00:00");
            }else{
                $('#SavingSwitch3').prop("checked",true);  //沒有勾選
                if((response['data']['Savingpwoff3']).length == 3){
                   let newStr = "0"+response['data']['Savingpwoff3'];
                   const resultoff3 = newStr.match(regex);
                   $('#saving_pw3_off').val(resultoff3[0]+':'+resultoff3[1]);
                }else{
                   const resultoff3 = (response['data']['Savingpwoff3']).match(regex);
                   $('#saving_pw3_off').val(resultoff3[0]+':'+resultoff3[1]);
                }
                //const resultoff3 = (response['data']['Savingpwoff3']).match(regex);
                //$('#saving_pw3_off').val(resultoff3[0]+':'+resultoff3[1]);
            }
            //星期四節電開
            if(response['data']['Savingpwon4'] == "9999" && response['data']['Savingpwoff4'] == "9999"){
                $('#SavingSwitch4').prop("checked",false);  //沒有勾選
            }

            if(response['data']['Savingpwon4'] == "9999"){    
                //$('#SavingSwitch4').prop("checked",false);  //沒有勾選
                $('#saving_pw4_on').val("");
            }else if(response['data']['Savingpwon4'] == "0"){
                $('#SavingSwitch4').prop("checked",true);  //沒有勾選
                $('#saving_pw4_on').val("00:00");
            }else{
                $('#SavingSwitch4').prop("checked",true);  //沒有勾選
                if((response['data']['Savingpwon4']).length == 3){
                    let newStr = "0"+response['data']['Savingpwon4'];
                    const resulton4 = newStr.match(regex);
                    $('#saving_pw4_on').val(resulton4[0]+':'+resulton4[1]);  
                }else{
                    const resulton4 = (response['data']['Savingpwon4']).match(regex);
                    $('#saving_pw4_on').val(resulton4[0]+':'+resulton4[1]);
                }
            }
            //星期四節電關
            if(response['data']['Savingpwoff4'] == "9999"){    
                //$('#SavingSwitch4').prop("checked",false);  //沒有勾選
                $('#saving_pw4_off').val("");
            }else if(response['data']['Savingpwoff4'] == "0"){
                $('#SavingSwitch4').prop("checked",true);  //沒有勾選
                $('#saving_pw4_off').val("00:00");
            }else{
                $('#SavingSwitch4').prop("checked",true);  //沒有勾選
                if((response['data']['Savingpwoff4']).length == 3){
                   let newStr = "0"+response['data']['Savingpwoff4'];
                   const resultoff4 = newStr.match(regex);
                   $('#saving_pw4_off').val(resultoff4[0]+':'+resultoff4[1]);
                }else{
                   const resultoff4 = (response['data']['Savingpwoff4']).match(regex);
                   $('#saving_pw4_off').val(resultoff4[0]+':'+resultoff4[1]);
                }      
            }
            //星期五節電開
            if(response['data']['Savingpwon5'] == "9999" && response['data']['Savingpwoff5'] == "9999"){
                $('#SavingSwitch5').prop("checked",false);  //沒有勾選
            }

            if(response['data']['Savingpwon5'] == "9999"){    
                //$('#SavingSwitch5').prop("checked",false);  //沒有勾選
                $('#saving_pw5_on').val("");
            }else if(response['data']['Savingpwon5'] == "0"){
                $('#SavingSwitch5').prop("checked",true);  //沒有勾選
                $('#saving_pw5_on').val("00:00");
            }else{
                $('#SavingSwitch5').prop("checked",true);  //沒有勾選
                if((response['data']['Savingpwon5']).length == 3){
                    let newStr = "0"+response['data']['Savingpwon5'];
                    const resulton5 = newStr.match(regex);
                    $('#saving_pw5_on').val(resulton5[0]+':'+resulton5[1]);  
                }else{
                    const resulton5 = (response['data']['Savingpwon5']).match(regex);
                    $('#saving_pw5_on').val(resulton5[0]+':'+resulton5[1]);
                }   
            }
            //星期五節電關
            if(response['data']['Savingpwoff5'] == "9999"){    
                //$('#SavingSwitch5').prop("checked",false);  //沒有勾選
                $('#saving_pw5_off').val("");
            }else if(response['data']['Savingpwoff5'] == "0"){
                $('#SavingSwitch5').prop("checked",true);  //沒有勾選
                $('#saving_pw5_off').val("00:00");
            }else{
                $('#SavingSwitch5').prop("checked",true);  //沒有勾選
                if((response['data']['Savingpwoff5']).length == 3){
                   let newStr = "0"+response['data']['Savingpwoff5'];
                   const resultoff5 = newStr.match(regex);
                   $('#saving_pw5_off').val(resultoff5[0]+':'+resultoff5[1]);
                }else{
                   const resultoff5 = (response['data']['Savingpwoff5']).match(regex);
                   $('#saving_pw5_off').val(resultoff5[0]+':'+resultoff5[1]);
                }       
            }
            //星期六節電開
            if(response['data']['Savingpwon6'] == "9999" && response['data']['Savingpwoff6'] == "9999"){
                $('#SavingSwitch6').prop("checked",false);  //沒有勾選
            }

            if(response['data']['Savingpwon6'] == "9999"){    
                //$('#SavingSwitch6').prop("checked",false);  //沒有勾選
                $('#saving_pw6_on').val("");
            }else if(response['data']['Savingpwon6'] == "0"){
                $('#SavingSwitch6').prop("checked",true);  //沒有勾選
                $('#saving_pw6_on').val("00:00");
            }else{
                $('#SavingSwitch6').prop("checked",true);  //沒有勾選
                if((response['data']['Savingpwon6']).length == 3){
                    let newStr = "0"+response['data']['Savingpwon6'];
                    const resulton6 = newStr.match(regex);
                    $('#saving_pw6_on').val(resulton6[0]+':'+resulton6[1]);  
                }else{
                    const resulton6 = (response['data']['Savingpwon6']).match(regex);
                    $('#saving_pw6_on').val(resulton6[0]+':'+resulton6[1]);
                }
            }
            //星期六節電關
            if(response['data']['Savingpwoff6'] == "9999"){    
                //$('#SavingSwitch6').prop("checked",false);  //沒有勾選
                $('#saving_pw6_off').val("");
            }else if(response['data']['Savingpwoff6'] == "0"){
                $('#SavingSwitch6').prop("checked",true);  //沒有勾選
                $('#saving_pw6_off').val("00:00");
            }else{
                $('#SavingSwitch6').prop("checked",true);  //沒有勾選
                if((response['data']['Savingpwoff6']).length == 3){
                   let newStr = "0"+response['data']['Savingpwoff6'];
                   const resultoff6 = newStr.match(regex);
                   $('#saving_pw6_off').val(resultoff6[0]+':'+resultoff6[1]);
                }else{
                   const resultoff6 = (response['data']['Savingpwoff6']).match(regex);
                   $('#saving_pw6_off').val(resultoff6[0]+':'+resultoff6[1]);
                } 
            }
            //星期日節電開
            if(response['data']['Savingpwon7'] == "9999" && response['data']['Savingpwoff7'] == "9999"){
                $('#SavingSwitch7').prop("checked",false);  //沒有勾選
            }

            if(response['data']['Savingpwon7'] == "9999"){    
                //$('#SavingSwitch7').prop("checked",false);  //沒有勾選
                $('#saving_pw7_on').val("");
            }else if(response['data']['Savingpwon7'] == "0"){
                $('#SavingSwitch7').prop("checked",true);  //沒有勾選
                $('#saving_pw7_on').val("00:00");
            }else{
                $('#SavingSwitch7').prop("checked",true);  //沒有勾選
                if((response['data']['Savingpwon7']).length == 3){
                    let newStr = "0"+response['data']['Savingpwon7'];
                    const resulton7 = newStr.match(regex);
                    $('#saving_pw7_on').val(resulton7[0]+':'+resulton7[1]);  
                }else{
                    const resulton7 = (response['data']['Savingpwon7']).match(regex);
                    $('#saving_pw7_on').val(resulton7[0]+':'+resulton7[1]);
                }   
            }
            //星期日節電關
            if(response['data']['Savingpwoff7'] == "9999"){    
                //$('#SavingSwitch7').prop("checked",false);  //沒有勾選
                $('#saving_pw7_off').val("");
            }else if(response['data']['Savingpwoff7'] == "0"){
                $('#SavingSwitch7').prop("checked",true);  //沒有勾選
                $('#saving_pw7_off').val("00:00");
            }else{
                $('#SavingSwitch7').prop("checked",true);  //沒有勾選
                if((response['data']['Savingpwoff7']).length == 3){
                   let newStr = "0"+response['data']['Savingpwoff7'];
                   const resultoff7 = newStr.match(regex);
                   $('#saving_pw7_off').val(resultoff7[0]+':'+resultoff7[1]);
                }else{
                   const resultoff7 = (response['data']['Savingpwoff7']).match(regex);
                   $('#saving_pw7_off').val(resultoff7[0]+':'+resultoff7[1]);
                }   
            }
            
            //以下是殺菌
            //星期一
            if(response['data']['Bactericide1'] == '9999'){
               $('#BactericideSwitch1').prop("checked",false);  //沒有勾選
            }
            else if(response['data']['Bactericide1'] == '0'){
               $('#BactericideSwitch1').prop("checked",true);  //沒有勾選
               $('#bactericideTime1').val("00:00");
            }
            else{
               $('#BactericideSwitch1').prop("checked", true);  //勾選 
               if((response['data']['Bactericide1']).length == 3){
                    let newStr = "0"+response['data']['Bactericide1'];
                    const rsbactericide1 = newStr.match(regex);
                    $('#bactericideTime1').val(rsbactericide1[0]+':'+rsbactericide1[1]);  
                }else{
                    const rsbactericide1 = (response['data']['Bactericide1']).match(regex);
                    $('#bactericideTime1').val(rsbactericide1[0]+':'+rsbactericide1[1]);
                }
            }
            //星期二
            if(response['data']['Bactericide2'] == '9999'){
               $('#BactericideSwitch2').prop("checked",false);  //沒有勾選
            }
            else if(response['data']['Bactericide2'] == '0'){
               $('#BactericideSwitch2').prop("checked",true);  //沒有勾選
               $('#bactericideTime2').val("00:00");
            }
            else{
               $('#BactericideSwitch2').prop("checked", true);  //勾選 
               if((response['data']['Bactericide2']).length == 3){
                    let newStr = "0"+response['data']['Bactericide2'];
                    const rsbactericide2 = newStr.match(regex);
                    $('#bactericideTime2').val(rsbactericide2[0]+':'+rsbactericide2[1]);  
                }else{
                    const rsbactericide2 = (response['data']['Bactericide2']).match(regex);
                    $('#bactericideTime2').val(rsbactericide2[0]+':'+rsbactericide2[1]);
                }
            }
            //星期三
            if(response['data']['Bactericide3'] == '9999'){
               $('#BactericideSwitch3').prop("checked",false);  //沒有勾選
            }
            else if(response['data']['Bactericide3'] == '0'){
               $('#BactericideSwitch3').prop("checked",true);  //沒有勾選
               $('#bactericideTime3').val("00:00");
            }
            else{
               $('#BactericideSwitch3').prop("checked", true);  //勾選 
               if((response['data']['Bactericide3']).length == 3){
                    let newStr = "0"+response['data']['Bactericide3'];
                    const rsbactericide3 = newStr.match(regex);
                    $('#bactericideTime3').val(rsbactericide3[0]+':'+rsbactericide3[1]);  
                }else{
                    const rsbactericide3 = (response['data']['Bactericide3']).match(regex);
                    $('#bactericideTime3').val(rsbactericide3[0]+':'+rsbactericide3[1]);
                }
            }
            //星期四
            if(response['data']['Bactericide4'] == '9999'){
               $('#BactericideSwitch4').prop("checked",false);  //沒有勾選
            }
            else if(response['data']['Bactericide4'] == '0'){
               $('#BactericideSwitch4').prop("checked",true);  //沒有勾選
               $('#bactericideTime4').val("00:00");
            }
            else{
               $('#BactericideSwitch4').prop("checked", true);  //勾選 
               if((response['data']['Bactericide4']).length == 3){
                    let newStr = "0"+response['data']['Bactericide4'];
                    const rsbactericide4 = newStr.match(regex);
                    $('#bactericideTime4').val(rsbactericide4[0]+':'+rsbactericide4[1]);  
                }else{
                    const rsbactericide4 = (response['data']['Bactericide4']).match(regex);
                    $('#bactericideTime4').val(rsbactericide4[0]+':'+rsbactericide4[1]);
                }
            }
            //星期五
            if(response['data']['Bactericide5'] == '9999'){
               $('#BactericideSwitch5').prop("checked",false);  //沒有勾選
            }
            else if(response['data']['Bactericide5'] == '0'){
               $('#BactericideSwitch5').prop("checked",true);  //沒有勾選
               $('#bactericideTime5').val("00:00");
            }
            else{
               $('#BactericideSwitch5').prop("checked", true);  //勾選 
               if((response['data']['Bactericide5']).length == 3){
                    let newStr = "0"+response['data']['Bactericide5'];
                    const rsbactericide5 = newStr.match(regex);
                    $('#bactericideTime5').val(rsbactericide5[0]+':'+rsbactericide5[1]);  
                }else{
                    const rsbactericide5 = (response['data']['Bactericide5']).match(regex);
                    $('#bactericideTime5').val(rsbactericide5[0]+':'+rsbactericide5[1]);
                }
            }
            //星期六
            if(response['data']['Bactericide6'] == '9999'){
               $('#BactericideSwitch6').prop("checked",false);  //沒有勾選
            }
            else if(response['data']['Bactericide6'] == '0'){
               $('#BactericideSwitch6').prop("checked",true);  //沒有勾選
               $('#bactericideTime6').val("00:00");
            }
            else{
               $('#BactericideSwitch6').prop("checked", true);  //勾選 
               if((response['data']['Bactericide6']).length == 3){
                    let newStr = "0"+response['data']['Bactericide6'];
                    const rsbactericide6 = newStr.match(regex);
                    $('#bactericideTime6').val(rsbactericide6[0]+':'+rsbactericide6[1]);  
                }else{
                    const rsbactericide6 = (response['data']['Bactericide6']).match(regex);
                    $('#bactericideTime6').val(rsbactericide6[0]+':'+rsbactericide6[1]);
                }
            }
            //星期日
            if(response['data']['Bactericide7'] == '9999'){
               $('#BactericideSwitch7').prop("checked",false);  //沒有勾選
            }
            else if(response['data']['Bactericide7'] == '0'){
               $('#BactericideSwitch7').prop("checked",true);  //沒有勾選
               $('#bactericideTime7').val("00:00");
            }
            else{
               $('#BactericideSwitch7').prop("checked", true);  //勾選 
               if((response['data']['Bactericide7']).length == 3){
                    let newStr = "0"+response['data']['Bactericide7'];
                    const rsbactericide7 = newStr.match(regex);
                    $('#bactericideTime7').val(rsbactericide7[0]+':'+rsbactericide7[1]);  
                }else{
                    const rsbactericide7 = (response['data']['Bactericide7']).match(regex);
                    $('#bactericideTime7').val(rsbactericide7[0]+':'+rsbactericide7[1]);
                }
            }
        },
        error: function (error) {
            console.log(error);
        }
    });
}


//查詢飲水機節電狀態。
// 2023.04.24 新增
function savePWstatus(device){
    //console.log(device);
    $('.message').html('');
    let url = '/getsavePwstatus/';
    $.ajax({
        //url: '/api/sensor/?device='+device,
        url: url,
        type: "POST",
        cache: false,
        async: false,
        data: {
            'csrfmiddlewaretoken': csrftoken,
            'Dispenser': device,
        },
        success: function (response) {
            console.log(response);
            //data = response;
            let str ='';
            if(response['status'] == "okay"){
                //if(response['SavingSwitch'] == 1){
                //str += "<div class='row'><div class='col-auto'>節電功能開啟</div></div>";
                str += "<div class='row'><div class='col-auto'>星期一:</div><div class='col-auto'>開始節電:"+response['Savingpwon1']+"</div><div class='col-auto'>結束節電:"+response['Savingpwoff1']+"</div></div>";
                str += "<div class='row'><div class='col-auto'>星期二:</div><div class='col-auto'>開始節電:"+response['Savingpwon2']+"</div><div class='col-auto'>結束節電:"+response['Savingpwoff2']+"</div></div>";
                str += "<div class='row'><div class='col-auto'>星期三:</div><div class='col-auto'>開始節電:"+response['Savingpwon3']+"</div><div class='col-auto'>結束節電:"+response['Savingpwoff3']+"</div></div>";
                str += "<div class='row'><div class='col-auto'>星期四:</div><div class='col-auto'>開始節電:"+response['Savingpwon4']+"</div><div class='col-auto'>結束節電:"+response['Savingpwoff4']+"</div></div>";
                str += "<div class='row'><div class='col-auto'>星期五:</div><div class='col-auto'>開始節電:"+response['Savingpwon5']+"</div><div class='col-auto'>結束節電:"+response['Savingpwoff5']+"</div></div>";
                str += "<div class='row'><div class='col-auto'>星期六:</div><div class='col-auto'>開始節電:"+response['Savingpwon6']+"</div><div class='col-auto'>結束節電:"+response['Savingpwoff6']+"</div></div>";
                str += "<div class='row'><div class='col-auto'>星期日:</div><div class='col-auto'>開始節電:"+response['Savingpwon7']+"</div><div class='col-auto'>結束節電:"+response['Savingpwoff7']+"</div></div>";
               /* }
                else if(response['SavingSwitch'] == 0){
                    str = "節電功能關閉";
                } */  
            }
            else{
                str = "飲水機連線異常,無法設定";
            }
            //console.log(str);
            $('.message').html(str);
            $('#dispensermsgModal').modal({backdrop: 'static', keyboard: false});
        },
        error: function (error) {
            console.log(error);
        }
    });
}


//查詢飲水機殺菌狀態。
// 2023.04.24 新增
function BactericideStatus(device){
    //console.log(device);
    $('.message').html('');
    let url = '/getBactericide/';
    $.ajax({
        //url: '/api/sensor/?device='+device,
        url: url,
        type: "POST",
        cache: false,
        async: false,
        data: {
            'csrfmiddlewaretoken': csrftoken,
            'Dispenser': device,
        },
        success: function (response) {
            console.log(response);
            //data = response;
            let str ='';
            if(response['status'] == "okay"){
                //let msg ='';
                //if(response['SavingSwitch'] == 1){ //SavingSwitch
                //str += "殺菌功能開啟<p>";
                //str += "<div class='row'><div class='col-auto'>殺菌功能開啟</div></div>";
                str += "<div class='row'><div class='col-auto'>星期一:</div><div class='col-auto'>開始殺菌:"+response['Bactericide1']+"</div></div>";
                str += "<div class='row'><div class='col-auto'>星期二:</div><div class='col-auto'>開始殺菌:"+response['Bactericide2']+"</div></div>";
                str += "<div class='row'><div class='col-auto'>星期三:</div><div class='col-auto'>開始殺菌:"+response['Bactericide3']+"</div></div>";
                str += "<div class='row'><div class='col-auto'>星期四:</div><div class='col-auto'>開始殺菌:"+response['Bactericide4']+"</div></div>";
                str += "<div class='row'><div class='col-auto'>星期五:</div><div class='col-auto'>開始殺菌:"+response['Bactericide5']+"</div></div>";
                str += "<div class='row'><div class='col-auto'>星期六:</div><div class='col-auto'>開始殺菌:"+response['Bactericide6']+"</div></div>";
                str += "<div class='row'><div class='col-auto'>星期日:</div><div class='col-auto'>開始殺菌:"+response['Bactericide7']+"</div></div>";
                //}
                /*
                else if(response['SavingSwitch'] == 0){
                  str = "殺菌功能關閉";
                }
                */
            }
            else{
                str = "飲水機連線異常,無法設定";
            }
            //console.log(str);
            $('.message').html(str);
            $('#dispensermsgModal').modal({backdrop: 'static', keyboard: false});
        },
        error: function (error) {
            console.log(error);
        }
    });
}

//飲水機殺菌設定。
// 2023.04.24 新增
//飲水機殺菌設定。2023.03.25
function savingBactericide(Dispenser){
   var SavingSwitch = $('#SavingSwitch').val();
   //let threshold = 0;
   var bactericideTime1 ='';
   var bactericideTime2 ='';
   var bactericideTime3 ='';
   var bactericideTime4 ='';
   var bactericideTime5 ='';
   var bactericideTime6 ='';
   var bactericideTime7 ='';
   if($('#BactericideSwitch1').prop('checked') == true){
       //threshold1 =1;
       bactericideTime1 = $('#bactericideTime1').val();
       if(bactericideTime1 == ""){
          //alert('請輸入殺菌時間');
            bactericideTime1 = "no";
       }else{
            if(bactericideTime1 == "00:00"){
                bactericideTime1 =0;
            }else{
                bactericideTime1.replace(":", "");
            }
       }
   }else{
       bactericideTime1 = "9999";
   }

   if($('#BactericideSwitch2').prop('checked') == true){
       bactericideTime2 = $('#bactericideTime2').val();
       if(bactericideTime2 == ""){
          //alert('請輸入殺菌時間');
            bactericideTime2 = "no";    
       }else{
            if(bactericideTime2 == "00:00"){
                bactericideTime2 =0;
            }else{
                bactericideTime2.replace(":", "");
            }
          //bactericideTime2.replace(":", "");
       }
   }else{
       bactericideTime2 = "9999";
   }

   if($('#BactericideSwitch3').prop('checked') == true){
       bactericideTime3 = $('#bactericideTime3').val();
       if(bactericideTime3 == ""){
          //alert('請輸入殺菌時間');
            bactericideTime3 = "no";
       }else{
            if(bactericideTime3 == "00:00"){
                bactericideTime3 =0;
            }else{
                bactericideTime3.replace(":", "");
            }
          //bactericideTime3.replace(":", "");
       }
   }else{
       bactericideTime3 = "9999";
   }

   if($('#BactericideSwitch4').prop('checked') == true){
       bactericideTime4 = $('#bactericideTime4').val();
       if(bactericideTime4 == ""){
          //alert('請輸入殺菌時間');
            bactericideTime4 = "no";
       }else{
            if(bactericideTime4 == "00:00"){
                bactericideTime4 =0;
            }else{
                bactericideTime4.replace(":", "");
            }
          //bactericideTime4.replace(":", "");
       }
   }else{
       bactericideTime4 = "9999";
   }

   if($('#BactericideSwitch5').prop('checked') == true){
       bactericideTime5 = $('#bactericideTime5').val();
       if(bactericideTime5 == ""){
          //alert('請輸入殺菌時間');
            bactericideTime5 = "no";
       }else{
            if(bactericideTime5 == "00:00"){
                bactericideTime5 =0;
            }else{
                bactericideTime5.replace(":", "");
            }
          //bactericideTime5.replace(":", "");
       }
   }else{
       bactericideTime5 = "9999";
   }

   if($('#BactericideSwitch6').prop('checked') == true){
       bactericideTime6 = $('#bactericideTime6').val();
       bactericideTime6.replace(":", "");
       if(bactericideTime6 == ""){
          //alert('請輸入殺菌時間');
            bactericideTime6 = "no";
       }else{
            if(bactericideTime6 == "00:00"){
                bactericideTime6 =0;
            }else{
                bactericideTime6.replace(":", "");
            }
          //bactericideTime5.replace(":", "");
       }
   }else{
       bactericideTime6 = "9999";
   }

   if($('#BactericideSwitch7').prop('checked') == true){
       bactericideTime7 = $('#bactericideTime7').val();
       if(bactericideTime7 == ""){
          //alert('請輸入殺菌時間');
            bactericideTime7 = "no";
       }else{
            if(bactericideTime7 == "00:00"){
                bactericideTime7 =0;
            }else{
                bactericideTime7.replace(":", "");
            }
          //bactericideTime7.replace(":", "");
       }
   }else{
        bactericideTime7 = "9999";
   }
   //console.log(bactericideTime1);
   //console.log(bactericideTime2);
   //console.log(bactericideTime3);
   //console.log(bactericideTime4);
   //console.log(bactericideTime5);
   //console.log(bactericideTime6);
   //console.log(bactericideTime7); 
    if(bactericideTime1 == "no" || bactericideTime2 == "no" || bactericideTime3 == "no" || bactericideTime4 == "no" || bactericideTime5 == "no" || bactericideTime6 == "no" || bactericideTime7 == "no"){
         $('.message').text('請輸入殺菌設定相關的時間');
         $('#dispensermsgModal').modal({backdrop: 'static', keyboard: false});
    }
    else{
        let url = '/bactericide/';
        $.ajax({
            //url: '/api/sensor/?device='+device,
            url: url,
            type: "POST",
            cache: false,
            async: false,
            data: {
                'csrfmiddlewaretoken': csrftoken,
                'Dispenser': Dispenser,
                //'SavingSwitch': threshold,
                //'bactericideTime': bactericideTime,
                'bactericideTime1': bactericideTime1,
                'bactericideTime2': bactericideTime2,
                'bactericideTime3': bactericideTime3,
                'bactericideTime4': bactericideTime4,
                'bactericideTime5': bactericideTime5,
                'bactericideTime6': bactericideTime6,
                'bactericideTime7': bactericideTime7,
            },
            success: function (response) {
                //console.log(response['status']);
                if(response['status'] == "okay"){
                    //alert('更新成功!');
                    $('.message').text('設定成功!');
                }
                else if(response['status'] == 2){
                    //alert('更新失敗!');
                    $('.message').text('飲水機連線異常,無法設定');
                }
                $('#dispensermsgModal').modal({backdrop: 'static', keyboard: false});
            },
            error: function (error) {
                console.log(error);
            }
        });
    }
}

//顯示飲水機殺菌時間設定。
// 2023.04.24 新增
function checkBatericide(){
    if($('#SavingSwitch').prop('checked') == true){
       //console.log('checked');
       $(".batericide").show();
    }
    else{
       //console.log('no');
       $(".batericide").hide();
    }
}

/*
function searchStudentInfo(grade, Class, schoolID){
    return new Promise(function(resolve, reject) {
        let url = '/searchStudentsData/';
        var data1;
        $.ajax({
            //url: '/api/sensor/?device='+device,
            url: url,
            type: "POST",
            cache: false,
            async: false,
            data: {
                'csrfmiddlewaretoken': csrftoken,
                'grade': grade,
                'class': Class,
                'schoolID': schoolID, 
            },
            success: function (response) {
                //console.log(response);
                data1 = response;
            },
            error: function (error) {
              console.log(error);
            }
        });       
        console.log(data1);
        resolve('ok');
    });
}
*/