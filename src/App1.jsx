import "./App.css";
import { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import { io } from "socket.io-client";
const socket = io("http://192.168.1.123:4445"); // Connect to the server
// const socket = io("http://localhost:4445"); // Connect to the server
const App = () => {
  const [connect, setConnect] = useState(false);
  const [state, setSate] = useState(false);
  const [room, setRoom] = useState("");
  const [user, setUser] = useState("");
  const [data, setData] = useState([
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
  ]);
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
    socket.on("winner", (data) => {
      toast(data);
    });
    socket.on("play", (data) => {
      console.log(data);
      setData(data);
    });
    socket.on("_disconnect", (data) => {
      toast.info(data);
    });

    socket.on("error", (data) => {
      toast.error(data);
    });
    // Cleanup on unmount
    return () => {
      socket.off("error");
    };
  }, []);
  const handleRoomCreate = () => {
    socket.emit("create");
  };
  const clickHandle = (d) => {
    if (data[d]) {
      return toast("Already used!");
    }
    socket.emit("play", d);
  };
  const roomJoin = (e) => {
    e.preventDefault();
    socket.emit("join", room);
  };
  return (
    <center>
      <h1>Real-time Chat & Game</h1>


      <ToastContainer />
      {!connect && !state && (
        <div>
          <button className="button" onClick={handleRoomCreate}>
            Create
          </button>
          <button className="button" onClick={() => setSate(true)}>
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
            onChange={(e) => {
              setRoom(e.target.value);
            }}
            placeholder="Room id"
          />
          <button className="button" onClick={roomJoin}>
            connect
          </button>
        </div>
      )}

      {connect && (
        <div>
          <h1>
            Room Id : {room} player {user}
            <button
              className="button"
              onClick={() => {
                socket.emit("_disconnect");
                setRoom("");
                setConnect(false);
                setData([null, null, null, null, null, null, null, null, null]);
              }}
            >
              Disconnect
            </button>
          </h1>
        </div>
      )}
      {connect && (
        <center className="container">
          <table>
            <tbody>
              <tr>
                <td onClick={() => clickHandle(0)}>{data[0]}</td>
                <td onClick={() => clickHandle(1)}>{data[1]}</td>
                <td onClick={() => clickHandle(2)}>{data[2]}</td>
              </tr>
              <tr>
                <td onClick={() => clickHandle(3)}>{data[3]}</td>
                <td onClick={() => clickHandle(4)}>{data[4]}</td>
                <td onClick={() => clickHandle(5)}>{data[5]}</td>
              </tr>
              <tr>
                <td onClick={() => clickHandle(6)}>{data[6]}</td>
                <td onClick={() => clickHandle(7)}>{data[7]}</td>
                <td onClick={() => clickHandle(8)}>{data[8]}</td>
              </tr>
            </tbody>
          </table>
          {/* <div>
            <ul>
              {messages.map((msg, index) => (
                <li key={index}>{msg}</li>
              ))}
            </ul>
          </div> */}
        </center>
      )}
      {/* {connect && (
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            className="form"
            value={message}
            onChange={handleMessageChange}
            placeholder="Type a message"
          />
          <button className="button" type="submit">
            Send
          </button>
        </form>
      )} */}
    </center>
  );
};

export default App;
// // import { loadStripe } from "@stripe/stripe-js";
// // import { useState } from "react";

// // const App = () => {
// //   const [price, setPrice] = useState(0);
// //   const handle = async () => {
// //     const stripe = await loadStripe(import.meta.env.VITE_KEY);

// //     const { id } = await fetch("http://127.0.0.1:4444/order/create", {
// //       method: "POST",
// //       headers: {
// //         "Content-Type": "application/json",
// //       },
// //       body: JSON.stringify({
// //         product_id: 1,
// //         quantity: 5,
// //         userId: 1,
// //       }),
// //     })
// //       .then((response) => response.json())
// //       .catch((e) => console.log(e));
// //     const { error } = await stripe.redirectToCheckout({
// //       sessionId: id,
// //     });
// //     if (error) {
// //       console.error(error.message);
// //     }
// //   };

// //   return (
// //     <div>
// //       <input
// //         type="number"
// //         value={price}
// //         onChange={(e) => setPrice(e.target.value)}
// //       />
// //       <button onClick={handle}>Pay</button>
// //     </div>
// //   );
// // };

// // export default App;
// import { useEffect, useState } from "react";
// import axios from "axios";
// const App = () => {
//   const [phoneCode, setPhoneCode] = useState("");
//   const [country, setCountry] = useState("");
//   useEffect(() => {
//     const fetchPhoneCode = async () => {
//       try {
//         // Step 1: Get the user's location from their IP
//         const {
//           data: { country_calling_code: code },
//         } = await axios.get("https://ipapi.co/json/");
//         console.log(code);
//       } catch (error) {
//         console.error("Error fetching phone code:", error);
//       }
//     };
//     fetchPhoneCode();
//   }, []);
//   return (
//     <div>
//       <h1>Country: {country || "Loading..."}</h1>
//       <h2>Phone Code: {phoneCode || "Loading..."}</h2>
//     </div>
//   );
// };
// export default App;
