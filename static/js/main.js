window.onload = function () {
  var toggle = document.querySelector(".toggle-wrap");
  var togglein = document.querySelector(".toggle-btn");
  var clockText = document.querySelector(".title-right");
  var warnDiv = document.querySelector(".warning");
  var rowDiv = document.querySelector(".row1");
  var obj = {};
  var audioPlaying = 0;
  var ledPlaying = 0;
  var ledStoping = 0;
  var audioControl = false;
  var ledControl = false;
  var sleepDetect = false;
  var sensorValue = [[0, 0, 0, 0, 0, 0, 0],[0, 0, 0, 0, 0, 0, 0]];
  var audio = document.getElementsByTagName('audio')[0];
  var sensorText = document.querySelector('.right-button');
  var sensorUrl = document.querySelector('#url-sensor');
  var ledOnUrl = document.querySelector('#url-ledon');
  var ledOffUrl = document.querySelector('#url-ledoff');


  var ctx = document.getElementById('myChart').getContext('2d');

  var chart = new Chart(ctx, {
    // The type of chart we want to create
    type: 'line',

    // The data for our dataset
    data: {
      labels: ['1', '2', '3', '4', '5', '6', '7'],
      datasets: [
        {
          label: '온도센서 값',
          backgroundColor: 'rgba(0,0,0,0.00)',
          borderColor: 'rgb(255, 99, 132)',
          data: sensorValue[0],
        },
        {
          label: '습도센서 값',
          backgroundColor: 'rgba(0,0,0,0.00)',
          borderColor: 'rgb(75, 192, 192)',
          data: sensorValue[1],
        }        
                ] // datasets
    },

    // Configuration options go here
    options: {

    }
  });

  toggle.addEventListener("click", function (e) {
    togglein.classList.toggle("active");
    rowDiv.classList.toggle("active");
    sleepDetect = !sleepDetect;

    fetch("http://localhost:5000/active").then(function (response) {
      response.text().then(function (text) {
        // console.log(text);
      });
    });
  });

  function clock() {
    var date = new Date();

    // 시간을 받아오고
    var hours = date.getHours();
    // 분도 받아옵니다.
    var minutes = date.getMinutes();

    // 초까지 받아온후
    var seconds = date.getSeconds();

    clockText.innerHTML = hours + ":" + minutes + ":" + seconds;
  }


  function warn() {
    if (sleepDetect == true) {
      fetch("http://localhost:5000/sleep").then(function (response) {
        response.json().then(function (json) {
          obj = json;
          // console.log(obj);

          if (obj.sleep == true) {
            // sleeping
            warnDiv.classList.remove("deactive");

            // start audio
            if(audioPlaying == 0){
              audio.play();
              audioControl = true;   
            }

            // Turn on led
            if(ledPlaying == 0 && ledControl == false) {
              ledStoping = 0;
              fetch(ledOnUrl).then(function (response){
                response.text().then(function(text){
                  // console.log(text);
                });
              });
              ledControl = true;
            }
            
              ledPlaying++;
              audioPlaying++;
          } 
          else {
            // not sleeping
            warnDiv.classList.add("deactive");

            // stop audio
            if(audioControl == true){
              audio.pause();
              audioPlaying = 0;
              audioControl = false;
            }

            // Turn off led
            if(ledStoping > 10 && ledControl == true){ // driver wake up over 5 sec and led is on
              ledPlaying = 0;
              fetch(ledOffUrl).then(function (response){
                response.text().then(function(text){
                  // console.log(text);
                });
              });
              ledControl = false;
            }

            ledStoping++;
          }
        });
      });
    } 
    else {
      warnDiv.classList.add("deactive");
    }
  } // warn

  function graph() {
    if (sleepDetect == true) {
      // console.log(sensorUrl.innerHTML);
      fetch(sensorUrl.innerHTML).then(function (response) {
        response.json().then(function (json) {
          obj = json;
          sensorValue[0] = obj.sensor1;
          sensorValue[1] = obj.sensor2;
          // console.log(obj);
          sensorText.innerHTML = "온도 센서 값 : " + sensorValue[0] + " , 습도 센서 값 : " + sensorValue[1];

          //라벨 삭제
          chart.data.labels.splice(0,1);

          // 데이터 삭제
          chart.data.datasets.forEach(function(dataset) {
            dataset.data.splice(0,1);
          });

          //라벨추가
          chart.data.labels.push(chart.data.labels.length.toString())

          //데이터셋 수 만큼 반복
          var dataset = chart.data.datasets;
          for (var i = 0; i < dataset.length; i++) {
            //데이터셋의 데이터 추가
            dataset[i].data.push(sensorValue[i]);
          }
          chart.update(); //차트 업데이트
        });
      });
    } 
    else {

    }
  } // graph

  function Init() {
    clock();
    setInterval(function () {
      clock();
      warn();
    }, 500);

    setInterval(function() {
      graph();
    }, 3000);

  } // Init

  Init();
};