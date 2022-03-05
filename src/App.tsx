import { useEffect, useRef, useState } from 'react';

function App() {
  const [hasPhoto, setHasPhoto] = useState(false);
  const [showRetake, setShowRetake] = useState(false);
  const [streams, setStreams] = useState<any>();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  let base64String: string;

  useEffect(() => {
    console.log('Use effect called');
    canvasRef.current!.hidden = true;
    //     intiateCamera();
  }, []);

  const intiateCamera = async () => {
    canvasRef.current!.hidden = true;
    const constraints = {
      audio: false,
      video: {
        facingMode: 'user',
      },
    };

    // Initiate media devices for capturing image
    try {
      const userMedia = await navigator.mediaDevices.getUserMedia(constraints);
      console.log('Stream obtained: ', userMedia);
      const video = videoRef.current;
      if (video) {
        video.srcObject = userMedia;
        await video.play();
        console.log('video play started');
        setStreams(userMedia);
      }
      setShowRetake(true);
    } catch (err) {
      console.log('error detected');
      alert(err);
    }
  };

  const takePhoto = async () => {
    console.log('takePhoto fn called');
    canvasRef.current!.hidden = false;

    let video = videoRef.current;
    let canvas = canvasRef.current;

    if (canvas && video) {
      const width = video.videoWidth;
      const height = video.videoHeight;
      canvas.width = width;
      canvas.height = height;
      let ctx = canvas.getContext('2d');
      console.log('Context: ', ctx);

      videoRef.current!.hidden = true;
      ctx?.drawImage(video, 0, 0, width, height);

      canvas.toBlob((blob) => storePhoto(blob));

      closePhoto();
    }
    setHasPhoto(true);
  };

  const storePhoto = (blob: Blob | null) => {
    const new_File = new File([blob as BlobPart], 'personalPhoto.jpeg', {
      type: 'image/jpeg',
      lastModified: Date.now(),
    });
    if (new_File.size > 50000000) {
      alert('video size exceeds maximum limit. Please upload it again');
      return false;
    }
    if (new_File.size < 1000) {
      alert('video size should be greater than 1KB. Please upload it again');
      return false;
    }

    const fileReader = new FileReader();

    fileReader.onload = function (event) {
      let base64 = (event.target && event.target.result)?.toString();
      base64String = base64!.split(',')[1];
      // console.log(base64);
    };
    fileReader.readAsDataURL(new_File);
  };

  const closePhoto = () => {
    console.log('Stopping all streams :', streams);
    streams?.getTracks().forEach((track: { stop(): any }) => {
      console.log(track);
      track.stop();
    });
    setHasPhoto(true);
  };

  return (
    <div className='App'>
      <h1>React TypeScript Webcamera Example</h1>
      <div className='imageBox'>
        <video ref={videoRef} className='videoBox'></video>
        <canvas ref={canvasRef} className='canvasImg'></canvas>
        {!showRetake ? (
          <button onClick={intiateCamera}>READY?</button>
        ) : hasPhoto ? (
          <button
            onClick={() => {
              videoRef.current!.hidden = false;
              setHasPhoto(false);
              intiateCamera();
            }}
          >
            RETAKE!
          </button>
        ) : (
          <>
            <button onClick={takePhoto}>SNAP!</button>
            <button onClick={closePhoto}>CLOSE!</button>
          </>
        )}
      </div>
    </div>
  );
}

export default App;
