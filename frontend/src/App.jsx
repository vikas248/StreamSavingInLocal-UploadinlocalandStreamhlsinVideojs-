import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import VideoPlayer from './videoPlayer'
import { useRef } from 'react'

function App() {
  const playerRef = useRef(null)
  //10 sec video
  const videoLink = "http://localhost:8000/uploads/courses/69e17e3e-3a37-4d8b-8a6b-ba9f4ac623e9/index.m3u8"
  //60 sec video
  //const videoLink = "http://localhost:8000/uploads/courses/d6b2d731-d00a-4991-84c8-62466a2fe80b/index.m3u8"
  //s3 url
  // const videoLink = "https://s3.ap-south-1.amazonaws.com/hls.codzy.dev/outputs/index.m3u8"
  const videoPlayerOptions = {
    controls: true,
    responsive: true,
    fluid: true,
    sources: [
      {
        src: videoLink,
        type: "application/x-mpegURL"
      }
    ]
  }
  const handlePlayerReady = (player) => {
    playerRef.current = player;

    // You can handle player events here, for example:
    player.on("waiting", () => {
      videojs.log("player is waiting");
    });

    player.on("dispose", () => {
      videojs.log("player will dispose");
    });
  };
  return (
    <>
      <div>
        <h1>Video player</h1>
      </div>
      <VideoPlayer
      options={videoPlayerOptions}
      onReady={handlePlayerReady}
      />
    </>
  )
}

export default App