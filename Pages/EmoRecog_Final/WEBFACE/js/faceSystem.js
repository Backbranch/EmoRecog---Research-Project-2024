console.log("loading");
const analyzed = 0;
let videoStream;
  let video;
  let currentDeviceIdIndex = 0;
  let devices = [];
async function getAvailableCameras() {
  const devicesList = await navigator.mediaDevices.enumerateDevices();
  devices = devicesList.filter(device => device.kind === 'videoinput');
}

async function startCamera(deviceId) {
  if (videoStream) {
    videoStream.getTracks().forEach(track => track.stop());
  }

  videoStream = await navigator.mediaDevices.getUserMedia({
    video: { deviceId: { exact: deviceId } },
  });
  video.srcObject = videoStream;
}

async function flipCamera() {
  currentDeviceIdIndex = (currentDeviceIdIndex + 1) % devices.length;
  await startCamera(devices[currentDeviceIdIndex].deviceId);
}

async function analyzeVideo() {
  const videoUpload = document.getElementById("videoUpload");
  const file = videoUpload.files[0];
  if (file) {
    const video = document.createElement("video");
    video.src = URL.createObjectURL(file);
    video.load();
    video.play();

    console.log("Video is playing...");

    await new Promise((resolve) => (video.onplaying = resolve));

    let emotionSums = {};
    let frameCount = 0;
    
    const analyze = async () => {
      if (video.currentTime >= video.duration) {
        console.log("End of video");
        const emotionAverages = Object.fromEntries(
          Object.entries(emotionSums).map(([emotion, sum]) => [
            emotion,
            sum / frameCount,
          ]),
        );
        console.log("Average Emotion Percentages:", emotionAverages);
        const para = document.createElement("p");
        const text = `Average Emotion Percentages: ${JSON.stringify(emotionAverages)}`;
        const textNode = document.createTextNode(text);
        para.appendChild(textNode);
        document.body.appendChild(para);
        para.style = "text-align: center; color: #EFE1CD; font-size: 12px; font-family: Oxygen Mono; font-weight: 400;";
        const analyzed = 1;
        return;
      }

      const detections = await faceapi
        .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
        .withFaceExpressions();
      if (detections.length > 0) {
        const emotions = detections[0].expressions;
        for (const [emotion, value] of Object.entries(emotions)) {
          emotionSums[emotion] = (emotionSums[emotion] || 0) + value;
        }
        frameCount++;
      }

      setTimeout(analyze, 100); // Adjust the timeout as needed
    };

    analyze();
  }
}

async function start() {
  await getAvailableCameras();
  if (devices.length > 0) {
    video = document.getElementById("canvasPlayer");
    await startCamera(devices[currentDeviceIdIndex].deviceId);
  }

  await faceapi.nets.tinyFaceDetector.loadFromUri("./WEBFACE/models");
  await faceapi.nets.faceLandmark68Net.loadFromUri("./WEBFACE/models");
  await faceapi.nets.faceRecognitionNet.loadFromUri("./WEBFACE/models");
  await faceapi.nets.faceExpressionNet.loadFromUri("./WEBFACE/models");
  await faceapi.nets.ageGenderNet.loadFromUri("./WEBFACE/models");
  await faceapi.nets.ssdMobilenetv1.loadFromUri("./WEBFACE/models");

  function interpolateAgePredictions(age) {
    return age;
  }

  video.addEventListener("play", async () => {
    const canvas = faceapi.createCanvasFromMedia(video);
    const videoContainer = document.getElementById("videoContainer");
    document.querySelector(".webcamContainer").append(canvas);
    const displaySize = {
      width: video.videoWidth,
      height: video.videoHeight,
    };

    faceapi.matchDimensions(canvas, displaySize);
    canvas.style.position = "absolute";
    canvas.style.top = "0";
    canvas.style.left = "0";
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    const canvasRect = canvas.getBoundingClientRect();

    canvas.getContext("2d").clearRect(0, 0, displaySize.width, displaySize.height);

    setInterval(async () => {
      detections = await faceapi
        .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptors()
        .withFaceExpressions();

      renderedSize = {
        width: canvasRect.width,
        height: canvasRect.height,
      };

      const resizedDetections = faceapi.resizeResults(detections, renderedSize);

      canvas.getContext("2d").clearRect(0, 0, displaySize.width, displaySize.height);

      faceapi.draw.drawFaceExpressions(canvas, resizedDetections);
    }, 25);
  });
}

document.querySelector('.flipCamera').addEventListener('click', flipCamera);

start();
