import React, { useState, useEffect } from "react";
import socketIOClient from "socket.io-client";
import { Navigate } from "react-router-dom";

import { endpoint } from "../../endpoint";

const Start = () => {
  const [response, setResponse] = useState(0);
  const [sessionName, setSessionName] = useState("");
  const [redirect, setRediect] = useState();
  let socket;

  useEffect(() => {
    socket = socketIOClient(endpoint);
    socket.on("api", (data) => setResponse(data));

    return () => {
      socket.disconnect();
      socket = null;
    };
  }, []);

  const startSession = () => {
    socket = socketIOClient(endpoint);
    socket.emit("start-session", { sessionName: null });
    socket.on("create-room", (data) => {
      setRediect(data);
    });
  };

  const updateSession = (e) => {
    setSessionName(e.target.value);
  };

  useEffect(() => {
    let oldRoomVotes = localStorage.getItem("keep-safe-votes");
    try {
      let data = JSON.parse(oldRoomVotes);
      if (data) {
        setRoomVotes(data);
      }
    } catch (e) {
      console.error("Failed to load old vote info");
    }
  }, []);

  const toggle = (v) => {
    let i = voteSequence.indexOf(v);
    d[i] = !d[i];
  };

  return (
    <>
      <h2>Start Session</h2>
      <div className="box start-session">
        <button onClick={startSession}>Start Session</button>
        {redirect ? <Navigate to={`/room/${redirect.data}`} /> : null}
      </div>
    </>
  );
};

export default Start;
