import React, { useEffect, useRef, useState } from 'react';
import styles from '../css/video.module.css';
import { db } from '../firebase/config';
import {
  collection,
  getDoc,
  addDoc,
  doc,
  setDoc,
  onSnapshot,
  updateDoc,
} from 'firebase/firestore';

export default function Video() {
  const [isRoomCreated, setIsRoomCreated] = useState(false);
  const [isCameraStarted, setIsCameraStarted] = useState(false);
  const [roomId, setRoomId] = useState(null);
  let localStream = null;
  let remoteStream = null;
  let peerConnection = useRef();
  const roomIdInput = useRef();
  const localUser = useRef();
  const remoteUser = useRef();

  const servers = {
    iceServers: [
      {
        urls: [
          'stun:stun1.l.google.com:19302',
          'stun:stun2.l.google.com:19302',
        ],
      },
    ],
    iceCandidatePoolSize: 10,
  };
  useEffect(() => {
    peerConnection.current = new RTCPeerConnection(servers);
  }, []);

  const getLocalAndRemoteMedia = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });

    localStream = stream;

    localStream.getTracks().forEach((track) => {
      peerConnection.current.addTrack(track, localStream);
    });

    localUser.current.srcObject = stream;

    remoteStream = new MediaStream();
    peerConnection.current.ontrack = (event) => {
      console.log(event.streams[0]);
      event.streams[0].getTracks().forEach((track) => {
        remoteStream.addTrack(track);
      });
      remoteUser.current.srcObject = remoteStream;
    };
    setIsCameraStarted(true);
  };

  const createCall = async (e) => {
    e.preventDefault();

    const callDoc = doc(collection(db, 'calls'));
    const offerCandidates = collection(callDoc, 'offerCandidates');
    const offerDescription = await peerConnection.current.createOffer();
    const answerCandidates = collection(callDoc, 'answerCandidates');

    await peerConnection.current.setLocalDescription(offerDescription);
    setRoomId(callDoc.id);

    peerConnection.current.onicecandidate = (event) => {
      console.log(event);

      event.candidate && addDoc(offerCandidates, event.candidate.toJSON());
    };
    const offer = {
      sdp: offerDescription.sdp,
      type: offerDescription.type,
    };

    await setDoc(callDoc, { offer });

    onSnapshot(callDoc),
      (snapshot) => {
        const data = snapshot.data();
        if (!peerConnection.current.currentRemoteDescription && data?.answer) {
          const answerDescription = new RTCSessionDescription(data.answer);
          peerConnection.current.setRemoteDescription(answerDescription);
        }
      };

    onSnapshot(answerCandidates),
      (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          if (change.type === 'added') {
            console.log('new answer candidate added');
            const candidate = new RTCIceCandidate(change.doc.data());
            peerConnection.current.addIceCandidate(candidate);
          }
        });
      };
    setIsRoomCreated(true);
  };

  const answerCall = async (e) => {
    e.preventDefault();
    const callId = roomIdInput.current.value;
    const callDoc = doc(collection(db, 'calls'), callId);
    const offerCandidates = collection(callDoc, 'offerCandidates');
    const answerCandidates = collection(callDoc, 'answerCandidates');

    peerConnection.current.onicecandidate = (event) => {
      event.candidate && addDoc(answerCandidates, event.candidate.toJSON());
    };

    const callData = (await getDoc(callDoc)).data();
    const offerDescription = callData.offer;

    await peerConnection.current.setRemoteDescription(
      new RTCSessionDescription(offerDescription)
    );

    const answerDescription = await peerConnection.current.createAnswer();
    await peerConnection.current.setLocalDescription(answerDescription);

    const answer = {
      type: answerDescription.type,
      sdp: answerDescription.sdp,
    };
    await updateDoc(callDoc, { answer });

    onSnapshot(offerCandidates),
      (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          if (change.type === 'added') {
            console.log('new answer candidate added');
            const candidate = new RTCIceCandidate(change.doc.data());
            peerConnection.current.addIceCandidate(candidate);
          }
        });
      };
  };

  async function hangUp() {
    const tracks = localUser.current.srcObject.getTracks();
    tracks.forEach((track) => {
      track.stop();
    });

    if (remoteStream) {
      remoteStream.getTracks().forEach((track) => track.stop());
    }

    if (peerConnection.current) {
      peerConnection.current.close();
    }
    setIsCameraStarted(false);
    peerConnection.current = new RTCPeerConnection(servers);
  }

  return (
    <div className={styles.pageContainer}>
      <div className={styles.videoContainer}>
        <video
          muted
          autoPlay
          playsInline
          className={styles.localUser}
          ref={localUser}
        ></video>
        <video
          autoPlay
          playsInline
          className={styles.remoteUser}
          ref={remoteUser}
        ></video>
      </div>
      <div className={styles.formAndButtonContainer}>
        <button onClick={() => getLocalAndRemoteMedia()}>Start camera</button>
        <button disabled={!isCameraStarted} onClick={createCall}>
          Create call
        </button>
        {isRoomCreated ? (
          <div className={styles.roomCreatedDialogue}>
            Room created with id of <code>{roomId}</code>
          </div>
        ) : null}
        <button disabled={!isCameraStarted} onClick={() => hangUp()}>
          Hang up
        </button>
        <form onSubmit={answerCall}>
          <input
            id="call-id-input"
            type="text"
            placeholder="Add your invite code"
            ref={roomIdInput}
          ></input>
          <button onClick={answerCall}>Join call</button>
        </form>
      </div>
    </div>
  );
}
