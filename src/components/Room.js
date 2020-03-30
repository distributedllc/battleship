import React, { useState, useEffect } from 'react';
import { Redirect } from 'react-router-dom';
import { useParams } from 'react-router';
import socketIOClient from 'socket.io-client';
import { endpoint } from '../endpoint';
import { CopyButton } from './CopyButton';

const Room = () => {
  let { roomId } = useParams();
  let socket;
  let isNameSet = false;

  const [currentVote, setCurrentVote] = useState(-1);
  const [session, setSession] = useState();
  const [userId, setUserId] = useState(0);
  const [users, setUsers] = useState([]);
  const [name, setName] = useState('') ;
  const [showVotes, setShowVotes] = useState(false);
  const [joinedRoom, setJoinedRoom] = useState(false);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (name === '') {
      let hasLocalName = localStorage.getItem('name');
      if (typeof hasLocalName !== 'undefined' && hasLocalName !== null) {
        setName(hasLocalName);
      }
    }
    socket = socketIOClient(endpoint);
    socket.emit('join-session', {roomId});
    socket.on('joined-room', data => {
      setUserId(data.userId);
    });
    socket.on('room-show-votes', data => {
      setShowVotes(true);
    });
    socket.on('room-hide-votes', data => {
      setShowVotes(false);
    });
    socket.on('person-list', data => {
      setUsers(data.users);
    });
    socket.on('no-such-room', data => { setNotFound(true); });
    setSession(socket);
    return (() => {
      socket.emit('leave-room', {roomId});
      socket.disconnect();
    });
  }, []);

  const updateName = (e) => {
    setName(e.target.value);
  };

  const submitUpdateName = (e) => {
    e.preventDefault();

    if (name.trim() === '') {
      alert('Name is required');
      e.preventDefault();
      return false;
    }

    socket = session;
    socket.emit('person-update-name', {name});
    setJoinedRoom(true);
    localStorage.setItem('name', name);
    return false;
  };

  const displayVote = (id, vote) => (showVotes ? vote.toString() : (userId === id ? currentVote : (vote ? 'voted' : 'not voted')));

  const usersList = (users) => {
    return(
      <ul className="user-list"> 
        {users ? users.map((user) => (<li key={user.id} className={`user${user.id === userId ? ' current-user' : ''}`}><span className='user-name'>{user.name}</span><span className='user-vote'>{user.vote ? displayVote(user.id, user.vote) : 'not voted' }</span></li>)) : (<li>No one here...</li>)}
      </ul>
    );
  };

  const nameInput = () => {
    return (
      <form className="input-name" onSubmit={submitUpdateName}>
        <h3>Your Name</h3>
        <input autoFocus type="text" value={name} onChange={updateName} maxLength="26" placeholder="name"/> 
        <button onClick={submitUpdateName}>Set Name</button>
      </form>
    );
  };

  return notFound ? (<><h2>Not found</h2><p> Try another session, or create one!</p></>) : (
      <>
        <div className="header-wrapper">
          <h2 className="heading">Room - {roomId}</h2>
          <CopyButton />
        </div>
        {joinedRoom? (<Vote socket={session} currentVote={currentVote} setCurrentVote={setCurrentVote}/>) : null}
        {joinedRoom ? usersList(users) :  nameInput()}
      </>
  );
};

const Vote = ({socket, currentVote, setCurrentVote}) => {
  let voteSequence = [false, '0', '0.5', 1, 2, 3, 5, 8, 13, 21, '?'];


  const castVote = (vote) => {
    setCurrentVote(vote);
    socket.emit('cast-vote', {vote: vote});
  };

  const clearVotes = () => {
    socket.emit('room-clear-votes');
  };

  const showVotes = () => {
    socket.emit('room-show-votes');
  };

  const hideVotes = () => {
    socket.emit('room-hide-votes');
  };

  const voteClass = (v) => {
    return `vote${v === currentVote ? ' current-vote' : ''}`;
  };

  return (
    <>
      <div className="room-control">
        <button onClick={showVotes}>Show Votes</button>
        <button onClick={hideVotes}>Hide Votes</button>
        <button onClick={clearVotes}>Clear Votes</button>
      </div>
      <div className="vote-control">
      {voteSequence.map((v) => (<button key={`key-${v.toString()}`} className={voteClass(v)} onClick={() => castVote(v)}>{v ? v : 'Remove Vote'}</button>))}
      </div>
    </>
  );
};

export { Room };
