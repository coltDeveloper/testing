import React, { useState, useRef, useEffect } from "react";
import { paperPlaneSvg } from "../../Constant/svgs";
import { SidebarLogo, primaryLogo } from "../../Constant/images";
import { postRequest } from "../../services";
import { VideoCameraOutlined, AudioOutlined, PauseOutlined, DeleteOutlined } from "@ant-design/icons"; 
import { useNavigate } from "react-router-dom";
import { attachmentSvg } from "../../Constant/svgs";
import { message } from "antd";

const Chatbot = () => {

  const messagesRef = useRef(null);
  const [content, setMessage] = useState("");
  const [chat, setChat] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const [isAudioMode, setIsAudioMode] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const navigate = useNavigate();
  const mediaRecorderRef = useRef(null);
  const recordingIntervalRef = useRef(null);
  const [showMediaOptions, setShowMediaOptions] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (isRecording) {
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime((prevTime) => prevTime + 1);
      }, 1000);
    } else {
      clearInterval(recordingIntervalRef.current);
    }

    return () => clearInterval(recordingIntervalRef.current);
  }, [isRecording]);

  const handleSentMessage = async (messageContent, messageType = "text") => {
    if (!messageContent || !messageContent.trim()) return; // Avoid sending empty messages

    const newMessage = {
      content: messageContent,
      subject: "sender",
      type: messageType,
    };
    setChat((prevChat) => [...prevChat, newMessage]);
    setMessage("");

    if (messagesRef.current) {
      const { scrollHeight, clientHeight } = messagesRef.current;
      messagesRef.current.scrollTop = scrollHeight - clientHeight + 2;
    }

    try {
      // Send the content to the API
      const response = await postRequest("/api/Chatbot/message", { content: messageContent });
      const data = response.data;

      const botReply = data.response; // Assuming 'response' is a string or renderable content

      setChat((prevChat) => [
        ...prevChat,
        { content: botReply, subject: "reciever" },
      ]);
    } catch (error) {
      console.error("Error sending content:", error);
      // Optionally handle the error by showing a failure message
    }
  };

  const handleAudioClick = () => {
    if (!isRecording) {
      // Check if mediaDevices API is supported
      if (!navigator.mediaDevices?.getUserMedia) {
        // Try fallback for older browsers
        const getUserMedia = navigator.getUserMedia ||
                           navigator.webkitGetUserMedia ||
                           navigator.mozGetUserMedia ||
                           navigator.msGetUserMedia;
        
        if (!getUserMedia) {
          message.error("Audio recording is not supported on this device/browser");
          return;
        }
      }

      // Proceed with requesting audio access
      navigator.mediaDevices?.getUserMedia({ audio: true })
        .then(stream => {
          const chunks = [];
          mediaRecorderRef.current = new MediaRecorder(stream);
          mediaRecorderRef.current.ondataavailable = (event) => {
            chunks.push(event.data);
          };
          mediaRecorderRef.current.onstop = () => {
            const audioBlob = new Blob(chunks, { type: 'audio/wav' });
            const url = URL.createObjectURL(audioBlob);
            setAudioUrl(url);
          };
          mediaRecorderRef.current.start();
          setIsRecording(true);
          setIsAudioMode(true);
        })
        .catch(error => {
          console.error("Error accessing microphone:", error);
          if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
            message.error("Microphone permission denied. Please allow microphone access to use this feature.");
          } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
            message.error("No microphone found on your device");
          } else {
            message.error("Error accessing microphone. Please try again.");
          }
          setIsAudioMode(false);
          setIsRecording(false);
        });
    } else {
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
        setIsRecording(false);
      }
    }
  };

  const handlePauseAudio = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      if (mediaRecorderRef.current.stream) {
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      }
      setIsRecording(false);
    }
  };

  const handleDeleteAudio = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.stream) {
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
    setAudioUrl(null);
    setIsAudioMode(false);
    setIsRecording(false);
    setRecordingTime(0);
  };

  // Handle Enter key press to send the message
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSentMessage(content);
    }
  };

  const formatRecordingTime = (timeInSeconds) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = timeInSeconds % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      handleSentMessage(imageUrl, "image");
      setShowMediaOptions(false);
    }
  };

  const handleCamera = async () => {
    try {
      // First check if the device has a camera
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        message.error("Camera not found on your device");
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      
      // Create a modal container
      const modalContainer = document.createElement('div');
      modalContainer.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        z-index: 1000;
      `;

      // Create video element
      const videoElement = document.createElement('video');
      videoElement.style.cssText = 'max-width: 90%; max-height: 70%;';
      videoElement.autoplay = true;
      videoElement.srcObject = stream;

      // Create canvas (for capturing the image)
      const canvas = document.createElement('canvas');

      // Create capture button
      const captureButton = document.createElement('button');
      captureButton.textContent = 'Take Photo';
      captureButton.style.cssText = `
        margin-top: 20px;
        padding: 10px 20px;
        background: #007bff;
        color: white;
        border: none;
        border-radius: 5px;
        cursor: pointer;
      `;

      // Add elements to modal
      modalContainer.appendChild(videoElement);
      modalContainer.appendChild(captureButton);
      document.body.appendChild(modalContainer);

      // Handle capture click
      captureButton.onclick = () => {
        canvas.width = videoElement.videoWidth;
        canvas.height = videoElement.videoHeight;
        canvas.getContext('2d').drawImage(videoElement, 0, 0);
        
        // Convert to image URL
        const imageUrl = canvas.toDataURL('image/jpeg');
        
        // Clean up
        stream.getTracks().forEach(track => track.stop());
        document.body.removeChild(modalContainer);
        
        // Send the captured image
        handleSentMessage(imageUrl, "image");
        setShowMediaOptions(false);
      };

      // Add close functionality (clicking outside)
      modalContainer.onclick = (e) => {
        if (e.target === modalContainer) {
          stream.getTracks().forEach(track => track.stop());
          document.body.removeChild(modalContainer);
          setShowMediaOptions(false);
        }
      };

    } catch (error) {
      if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
        message.error("Camera not found on your device");
      } else if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        message.error("Camera permission denied. Please allow camera access to use this feature.");
      } else {
        message.error("Error accessing camera: " + error.message);
      }
      console.error("Error accessing camera:", error);
    }
  };

  return (
    <div className="chatbox">
      <div className="chatbotHeader text-white d-flex justify-content-between align-items-center">
        <div className="text-white d-flex justify-content-start gap-2 align-items-center">
          <div className="chatbotLogoWrapper">
            <img src={SidebarLogo} className="h-100 w-100" alt="chatbot" />
          </div>
          <div className="d-flex flex-column justify-content-center p-0 m-0">
            <h6 className="p-0 m-0 fw-bold">Wiser-Adviser</h6>
            <div className="d-flex gap-1 align-items-center">
              <div className="onlineDot"></div>
              <p className="p-0 m-0">online</p>
            </div>
          </div>
        </div>
        {/* Video Icon - Positioned on the right */}
        <div className="videoIconWrapper">
          <VideoCameraOutlined
            style={{
              fontSize: "24px",
              color: "#fff", // Set icon color
              cursor: "pointer",
            }}
            onClick={() => navigate("/video-chat")} // Example click handler
          />
        </div>
      </div>
      {/* Chat area */}
      <div
        className="chats d-flex flex-column w-100 gap-4 py-2 px-2"
        ref={messagesRef}
      >
        {chat.map((message, index) => (
          <div
            key={index}
            className={`w-100 d-flex position-relative ${message.subject === "reciever"
                ? "justify-content-start"
                : "justify-content-end"
              }`}
          >
            <div
              className={`w-auto ${message.subject === "sender"
                  ? "sentMessageBubble"
                  : "recievedMessageBubble"
                }`}
            >
              <div
                className={`${message.subject === "sender"
                    ? "chatBotSentMessages"
                    : "RecievedMessageBubbleChatBot"
                  }`}
              >
                {message.subject === "reciever" && (
                  <div className="d-flex align-items-center gap-2">
                    <div className="chatbotAvatarWrapper">
                      <img src={primaryLogo} />
                    </div>
                    <div className="chatboxRecievedMessages">
                      {message.content}
                    </div>
                  </div>
                )}
                {message.subject === "sender" && message.type === "audio" ? (
                  <audio controls src={message.content}></audio>
                ) : message.subject === "sender" && message.type === "image" ? (
                  <div className="chatboxSentMessages">
                    <img 
                      src={message.content} 
                      alt="Sent image" 
                      style={{ maxWidth: '200px', maxHeight: '200px', borderRadius: '8px' }}
                    />
                  </div>
                ) : (
                  message.subject === "sender" && (
                    <div className="chatboxSentMessages">{message.content}</div>
                  )
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="divider"></div>
      <div className="footer">
        {!isAudioMode ? (
          <>
            <input
              type="text"
              placeholder="Ask your question..."
              onChange={(e) => setMessage(e.target.value)}
              value={content}
              onKeyDown={handleKeyDown}
            />
            <div className="d-flex align-items-center gap-3 position-relative">
              <AudioOutlined 
                style={{ fontSize: "20px", cursor: "pointer" }} 
                onClick={handleAudioClick}
              />
              <div className="position-relative">
                <p 
                  className="m-0 cursor-pointer" 
                  onClick={() => setShowMediaOptions(!showMediaOptions)}
                >
                  {attachmentSvg}
                </p>
                {showMediaOptions && (
                  <div className="media-options-popup">
                    <input
                      type="file"
                      accept="image/*"
                      ref={fileInputRef}
                      style={{ display: 'none' }}
                      onChange={handleFileUpload}
                    />
                    <div 
                      className="option-item"
                      onClick={() => fileInputRef.current.click()}
                    >
                      Upload from Device
                    </div>
                    <div 
                      className="option-item"
                      onClick={handleCamera}
                    >
                      Use Camera
                    </div>
                  </div>
                )}
              </div>
              <span className="m-0 cursor-pointer" onClick={() => handleSentMessage(content)}>
                {paperPlaneSvg}
              </span>
            </div>
          </>
        ) : (
          <div className="d-flex align-items-center gap-3">
            <span>{formatRecordingTime(recordingTime)}</span>
            {isRecording ? (
              <PauseOutlined 
                style={{ fontSize: "20px", cursor: "pointer" }} 
                onClick={handlePauseAudio}
              />
            ) : (
              <AudioOutlined 
                style={{ fontSize: "20px", cursor: "pointer" }} 
                onClick={handleAudioClick}
              />
            )}
            <DeleteOutlined 
              style={{ fontSize: "20px", cursor: "pointer" }} 
              onClick={handleDeleteAudio}
            />
            <span className="m-0 cursor-pointer" onClick={() => {
              if (isRecording && mediaRecorderRef.current) {
                const currentRecorder = mediaRecorderRef.current;
                const chunks = [];
                
                // Set up a one-time handler for this specific stop event
                currentRecorder.ondataavailable = (event) => {
                  chunks.push(event.data);
                };
                
                currentRecorder.onstop = () => {
                  const audioBlob = new Blob(chunks, { type: 'audio/wav' });
                  const url = URL.createObjectURL(audioBlob);
                  handleSentMessage(url, "audio");
                  setIsAudioMode(false);
                  setIsRecording(false);
                  setRecordingTime(0);
                };
                
                currentRecorder.stop();
              } else if (audioUrl) {
                handleSentMessage(audioUrl, "audio");
                setIsAudioMode(false);
                setAudioUrl(null);
                setRecordingTime(0);
              }
            }}>
              {paperPlaneSvg}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chatbot;
