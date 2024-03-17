async function analyzeVideo() {
    const videoUpload = document.getElementById('videoUpload');
    const file = videoUpload.files[0];
    if (file) {
        const video = document.createElement('video');
        video.src = URL.createObjectURL(file);
         // Add the video element to the body
        video.load();
        video.play();

        console.log("Video is playing...");

        await new Promise(resolve => video.onplaying = resolve);

        let emotionSums = {};
        let frameCount = 0;

        const analyze = async () => {
            if (video.currentTime >= video.duration) {
                console.log("End of video");
                const emotionAverages = Object.fromEntries(
                    Object.entries(emotionSums).map(
                        ([emotion, sum]) => [emotion, sum / frameCount]
                    )
                );

                console.log("Average Emotion Percentages:", emotionAverages);
                const para = document.createElement("p");
                const text = `Average Emotion Percentages: ${JSON.stringify(emotionAverages)}`;
                const textnode = document.createTextNode(text);
                para.appendChild(node);
                document.body.appendChild(para);

                return;
            }

            const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions()).withFaceExpressions();
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
    await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
    await faceapi.nets.faceLandmark68Net.loadFromUri('/models');
    await faceapi.nets.faceRecognitionNet.loadFromUri('/models');
    await faceapi.nets.faceExpressionNet.loadFromUri('/models');
    await faceapi.nets.ageGenderNet.loadFromUri('/models');
    await faceapi.nets.ssdMobilenetv1.loadFromUri('/models');

    function interpolateAgePredictions(age) {
        return age;
    }

    // Access user's webcam
    const video = document.getElementById('canvasPlayer');
    navigator.mediaDevices.getUserMedia({ video: {} })
        .then(stream => {
            video.srcObject = stream;
        });

    // Detect faces
    // Detect faces
// Detect faces
video.addEventListener('play', async () => {
    const canvas = faceapi.createCanvasFromMedia(video);
    document.querySelector('.webcamContainer').append(canvas);
    const displaySize = { width: video.width, height: video.height };
    faceapi.matchDimensions(canvas, displaySize);
    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.left = '0';
    
    // Clear the canvas once
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
    


    setInterval(async () => {

        detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceDescriptors().withFaceExpressions();
        
       

        const resizedDetections = faceapi.resizeResults(detections, displaySize);



        
        // Clear the canvas
        canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);

        // Draw face detections and landmarks
        //faceapi.draw.drawDetections(canvas, resizedDetections);
        //faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
        
            
        faceapi.draw.drawFaceExpressions(canvas, resizedDetections);
        
        // Iterate over each detected face
        /*resizedDetections.forEach(async detection => {
            const ageGender = await faceapi.detectSingleFace(video).withFaceLandmarks().withAgeAndGender();
            const { age, gender, genderProbability } = ageGender;
            const interpolatedAge = interpolateAgePredictions(age);
            const labelText = `${gender} (${Math.round(genderProbability * 100)}%) ${Math.round(interpolatedAge)} years`;
            
            // Draw age and gender information
            const box = detection.detection.box;
            canvas.getContext('2d').font = '18px Arial';
            canvas.getContext('2d').fillStyle = '#ffffff';
            canvas.getContext('2d').fillText(labelText, box.x, box.y - 10);
            
            // Draw emotion boxes
            const emotions = detection.expressions;
            const emotionLabels = Object.keys(emotions).map(emotion => `${emotion}: ${Math.round(emotions[emotion] * 100)}%`);
            emotionLabels.forEach((label, index) => {
                canvas.getContext('2d').fillText(label, box.x, box.y + 20 + (index * 20));
            });
        });*/
    }, 50);
});
}

start();