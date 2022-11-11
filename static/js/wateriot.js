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
