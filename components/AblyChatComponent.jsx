import React, { useEffect, useState } from 'react';
import { useChannel } from './AblyReactEffect';
import { useAuthContext } from '../hooks/useAuthContext';
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { useRouter } from 'next/router';
import styles from '../css/chat.module.css';
import { motion } from 'framer-motion';
import Link from 'next/link';

const buttonVariants = {
  hover: {
    scale: 1.06,
  },
  tap: {
    scale: 0.99,
  },
};

const AblyChatComponent = (props) => {
  const { user } = useAuthContext();
  let inputBox = null;
  let messageEnd = null;
  const [messageText, setMessageText] = useState('');
  const [receivedMessages, setMessages] = useState([]);
  const [messageHistory, setMessageHistory] = useState([]);
  const messageTextIsEmpty = messageText.trim().length === 0;
  const [channel, ably] = useChannel(props.channelNum.channel, (message) => {
    // Here we're computing the state that'll be drawn into the message history
    // We do that by slicing the last 199 messages from the receivedMessages buffer

    const history = receivedMessages.slice(-199);
    setMessages([...history, message]);

    // Then finally, we take the message history, and combine it with the new message
    // This means we'll always have up to 199 message + 1 new message, stored using the
    // setMessages react useState hook
  });
  const router = useRouter();

  useEffect(() => {
    async function getChatHistory() {
      const q = query(
        collection(db, 'messages'),
        where('channel', '==', `${props.channelNum.channel}`),
        orderBy('time')
      );
      const querySnapshot = await getDocs(q);
      const returnedMessages = querySnapshot.docs.map((doc) => {
        return doc._document.data.value.mapValue.fields;
      });
      return returnedMessages;
    }
    getChatHistory().then((res) => {
      setMessageHistory(res);
    });
    messageEnd.scrollIntoView({ behaviour: 'smooth' });
  }, []);
  const sendChatMessage = (messageText) => {
    const docRef = addDoc(collection(db, 'messages'), {
      user: user.displayName,
      message: messageText,
      channel: props.channelNum.channel,
      recipient: router.query.secondUser,
      time: Date.now(),
    });
    channel.publish({ name: user.displayName, data: messageText });
    setMessageText('');
    inputBox.focus();
  };
  const handleFormSubmission = (event) => {
    event.preventDefault();
    sendChatMessage(messageText);
  };
  const handleKeyPress = (event) => {
    if (event.charCode !== 13 || messageTextIsEmpty) {
      return;
    }
    sendChatMessage(messageText);
    event.preventDefault();
  };

  const previousMessages = messageHistory.map((msg, index) => {
    return (
      <section key={index}>
        <span className={styles.prevMessage}>
          {msg.user.stringValue}: {msg.message.stringValue}
        </span>
        <br />
      </section>
    );
  });

  const messages = receivedMessages.map((message, index) => {
    const author = message.connectionId === ably.connection.id ? 'me' : 'other';

    return (
      <section key={index}>
        <div>
          <span data-author={author} className="">
            {message.name}: {message.data}
          </span>
        </div>

        <br />
      </section>
    );
  });
  <div
    ref={(element) => {
      messageEnd = element;
    }}
  ></div>;

  return (
    <main className="gap-10 flex flex-col md:justify-end md:items-start pl-1 p-5">
      <div className="md:hidden text-2xl font-bold">
        Chatting with {router.query.secondUser}
      </div>
      <div>
        <div className="flex flex-col h-full w-full">
          <div>{previousMessages}</div>
          <div>{messages}</div>
        </div>

        <div
          ref={(element) => {
            messageEnd = element;
          }}
        ></div>
      </div>
      <form
        onSubmit={handleFormSubmission}
        className="flex flex-col md:flex-row md:items-end gap-[20px]"
      >
        <textarea
          className="h-full w-[400px] px-4 py-4 resize-none text-lg"
          value={messageText}
          ref={(element) => {
            inputBox = element;
          }}
          placeholder="Type a message..."
          onChange={(e) => setMessageText(e.target.value)}
          onKeyPress={handleKeyPress}
        ></textarea>
        <div className="flex gap-2">
          <motion.button
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
            type="submit"
            disabled={messageTextIsEmpty}
            className="bg-[#4f9cf9] text-[#ffffff] border-none cursor-pointer text-lg py-5 px-10 rounded self-end"
          >
            Send
          </motion.button>
          <Link href="/video" target="_blank">
            <motion.button
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
              type="button"
              className="bg-[#4f9cf9] text-[#ffffff] border-none cursor-pointer text-lg py-5 px-10 rounded self-end"
            >
              Video
            </motion.button>
          </Link>
        </div>
      </form>
    </main>
  );
};

export default AblyChatComponent;
