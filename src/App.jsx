import "./App.css";
import { useEffect, useRef, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import { io } from "socket.io-client";
const socket = io("https://tic-tac-toe-back-452m.onrender.com"); // Adjust your server URL

const App = () => {
  const [connect, setConnect] = useState(false);
  const [state, setState] = useState(false);
  const [room, setRoom] = useState("");
  const [user, setUser] = useState("");
  const [data, setData] = useState(Array(9).fill(null));
  const [winningPattern, setWinningPattern] = useState([]);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [isMicOn, setIsMicOn] = useState(false); // Track mic state
  const [audioStream, setAudioStream] = useState(null);
  const audioRef = useRef(null); // To play the incoming audio
  // Listen for incoming messages
  useEffect(() => {
    socket.on("create", (data) => {
      setUser("X");
      setRoom(data);
      setConnect(true);
    });

    socket.on("join", (data) => {
      setUser(data.players[data.socket_id]);
      setData(data.data);
      setConnect(true);
    });
    socket.on("receive_audio", (audioData) => {
      const audio = new Audio(audioData);
      audio.play();
    });
    socket.on("winner", (data) => {
      toast(data.message);
      setWinningPattern(data.pattern);
    });

    socket.on("play", (data) => {
      setData(data);
      setWinningPattern([]);
    });

    socket.on("_disconnect", (data) => {
      toast.info(data);
    });

    socket.on("receive_message", (data) => {
      setMessages((prev) => [...prev, data]);
    });

    socket.on("error", (data) => {
      toast.error(data);
    });

    return () => {
      socket.off("error");
    };
  }, []);

  const handleRoomCreate = () => {
    socket.emit("create");
  };
  const sendMessage = () => {
    if (message.trim()) {
      const messageData = {
        room,
        user,
        text: message,
      };
      socket.emit("send_message", messageData);
      setMessages((prev) => [...prev, messageData]);
      setMessage("");
    }
  };
  const clickHandle = (index) => {
    if (data[index]) {
      return toast("Already used!");
    }
    socket.emit("play", index);
  };

  const roomJoin = (e) => {
    e.preventDefault();
    socket.emit("join", room);
  };
  const handleCopy = () => {
    if (navigator.clipboard) {
      // Use clipboard API for modern browsers (works on desktop and mobile web)
      navigator.clipboard
        .writeText(room)
        .then(() => {
          toast.success("Room ID copied to clipboard!");
        })
        .catch((err) => {
          toast.error("Failed to copy Room ID: " + err);
        });
    } else {
      // Fallback for browsers or devices that don't support the Clipboard API
      const textArea = document.createElement("textarea");
      textArea.value = room;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand("copy");
        toast.success("Room ID copied to clipboard!");
      } catch (err) {
        toast.error("Failed to copy Room ID");
      } finally {
        document.body.removeChild(textArea);
      }
    }
  };
  const messagesEndRef = useRef(null); // Create a ref for the last message

  const scrollToBottom = () => {
    // Scroll to the last message after a short delay to ensure DOM updates
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }, 100);
  };

  useEffect(() => {
    // Scroll to the last message whenever the messages array changes
    scrollToBottom();
  }, [messages]);

  const toggleMic = async () => {
    if (isMicOn) {
      audioStream.getTracks().forEach((track) => track.stop());
      // Stop the audio stream and close the microphone
      setIsMicOn(false);
    } else {
      try {
        // Request microphone access from the user
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });

        // Store the stream for future use
        setAudioStream(stream);
        setIsMicOn(true);

        // Emit audio stream to the server (if using for voice chat)
        socket.emit("send_audio", stream);

        // Optionally, you can attach the stream to an audio element if you want to play it back locally
        const audioElement = new Audio();
        audioElement.srcObject = stream;
        audioElement.play();
      } catch (error) {
        console.error("Error accessing microphone:", error);
        toast.error(
          "Microphone access denied. Please enable microphone permissions."
        );
      }
    }
  };

  return (
    <center>
      <ToastContainer />
      {!connect && !state && (
        <div>
          <button className="button" onClick={handleRoomCreate}>
            Create
          </button>
          <button className="button" onClick={() => setState(true)}>
            Join
          </button>
        </div>
      )}

      {!connect && state && (
        <div>
          <input
            type="text"
            value={room}
            className="form"
            onChange={(e) => setRoom(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                roomJoin(e);
              }
            }}
            placeholder="Room id"
          />
          <button className="button" onClick={roomJoin}>
            Connect
          </button>
        </div>
      )}

      {connect && (
        <div>
          <h1>
            <span onClick={handleCopy}>
              Room ID: {room} | Player: {user}
            </span>
            <button className="button" onClick={toggleMic}>
              {isMicOn ? "Turn Mic Off" : "Turn Mic On"}
            </button>
            <button
              className="button"
              onClick={() => {
                socket.emit("_disconnect");
                setRoom("");
                setConnect(false);
                setData(Array(9).fill(null));
                setWinningPattern([]);
              }}
            >
              Disconnect
            </button>
          </h1>
        </div>
      )}
      {connect && (
        <div className="container">
          <table>
            <tbody>
              {[0, 3, 6].map((rowStart) => (
                <tr key={rowStart}>
                  {[0, 1, 2].map((colOffset) => {
                    const cellIndex = rowStart + colOffset;
                    const isWinningCell = winningPattern.includes(cellIndex);
                    return (
                      <td
                        key={cellIndex}
                        onClick={() => clickHandle(cellIndex)}
                        className={isWinningCell ? "winning-cell" : ""}
                      >
                        {data[cellIndex]}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
          <div className="chat">
            <div className="messages">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`message ${msg.user === user ? "own" : ""}`}
                >
                  <b>{msg.user}:</b> {msg.text}
                </div>
              ))}
              {/* This is the element we scroll to */}
              <div ref={messagesEndRef} />
            </div>
            <div className="message-input">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type a message..."
                onKeyDown={(e) => {
                  if (e.key === "Enter" && message.trim()) {
                    sendMessage();
                  }
                }}
              />
              <button onClick={sendMessage}>Send</button>
            </div>
          </div>
        </div>
      )}
    </center>
  );
};

export default App;
