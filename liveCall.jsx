import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

const LiveCall = () => {

  const [isFullScreen, setIsFullScreen] = useState(false);
  const { subjectId } = useLocation().state;
  useEffect(() => {
    const handleFullScreenChange = () => {
      setIsFullScreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullScreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullScreenChange);
  }, []);

  const toggleFullScreen = async () => {
    try {
      const iframe = document.querySelector('iframe');
      if (!document.fullscreenElement) {
        await iframe.requestFullscreen();
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        }
      }
    } catch (err) {
      console.error('Error toggling fullscreen:', err);
    }
  };

  return (
    <div style={{ width: "100%", height: "85vh", position: "relative" }}>
      <button
        onClick={toggleFullScreen}
        style={{
          position: "absolute", 
          top: "10px",
          right: "10px",
          zIndex: 1000,
          padding: "8px",
          cursor: "pointer",
          background: "#fff",
          border: "1px solid #ccc",
          borderRadius: "4px"
        }}
      >
        {isFullScreen ? '⛶' : '⛶'}
      </button>
      <iframe
        src={`https://wiser-hub.wiserbee.ca/join?room=${subjectId}`}
        style={{
          width: "100%",
          height: "85vh",
          border: "none"
        }}
        allow="camera;microphone"
        title="Live Call"
      />
    </div>
  );
};

export default LiveCall;
