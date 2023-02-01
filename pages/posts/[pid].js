import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import {
  getFirestore,
  collection,
  getDocs
} from "firebase/firestore";
import { db } from "../../firebase/config";
import PostReplyForm from "../../components/postReplyForm";
import PostReplies from "../../components/PostReplies";
import { getReplies } from "../../hooks/getReplies";
import styles from "../../css/posts.module.css";
import profilePlaceholder from "../../images/profilePlaceholder.png";
import Image from "next/image";
import moment from "moment/moment";
import imagePlaceholder from "../../images/image-placeholder.svg";
import { IoChevronBackCircleSharp } from "react-icons/io5";
import Link from "next/link";
import checkLoggedIn from "../../hooks/checkLoggedIn";
import deleteAreply from "../../hooks/deleteAreply";

// Gets all posts from Firestore database
async function getPosts(db) {
  const postsCol = collection(db, "posts");
  const postsSnapshot = await getDocs(postsCol);
  const postsList = postsSnapshot.docs.map((doc) => doc.data());
  return postsList;
}

export default function SinglePost() {
  checkLoggedIn();
  const [posts, setPosts] = useState([]);
  const [replies, setReplies] = useState([]);

  const router = useRouter();
  const pid = router.query["pid"];

  useEffect(() => {
    getReplies().then((response) => {
      setReplies(response);
    });
  }, []);

  useEffect(() => {
    getPosts(db).then((response) => {
      setPosts(response);
    });
  }, []);

  const handleDeleteReply = (replyId) => {

    Promise.resolve(deleteAreply(replyId));
    setReplies((prevReplies) =>
      prevReplies.filter((reply) => reply.replyId !== replyId)
    );
  };

  const postToRender = posts.filter((post) => {
    return post.postId === pid;
  });

  return (
    <div className={styles.container}>
      <div
        style={{ cursor: "pointer" }}
        onClick={() => {
          router.push("/home");
        }}
      >
        <div className={styles.back}>
          <div>Back to all posts</div>
          <IoChevronBackCircleSharp />
        </div>
      </div>
      <div className={styles.post}>
        <div className={styles.colOne}>
          <div className={styles.profileContainer}>
            <Image
              src={profilePlaceholder}
              width={60}
              height={60}
              alt="profile placeholder"
              className={styles.profileImage}
            />
          </div>
          <div className={styles.colTwo}>
            <div className={styles.userInfo}>
              <div className={styles.link}>
                <Link href={`/users/${postToRender[0]?.user}`}>
                  {postToRender[0]?.user}
                </Link>
              </div>
              <div className={styles.atUser}>@{postToRender[0]?.user} in</div>
              <div className={styles.programmingLanguage}>
                {postToRender[0]?.programmingLanguage}
              </div>
              <div className={styles.time}>
                Today <span>at</span> 16:12pm
              </div>
            </div>

            <div className={styles.details}>
              <div>
                <div className={styles.title}>{postToRender[0]?.postTitle}</div>
                <div className={styles.description}>
                  {postToRender[0]?.projectDescription}
                </div>
              </div>
              <div>
                <div>
                  Time to code:{" "}
                  {moment(postToRender[0]?.timeToCode).format("MMMM Do YYYY")}{" "}
                  at {moment(postToRender[0]?.timeToCode).format("HH:MM a")}
                </div>
                <div>Time zone: {postToRender[0]?.timeZone}</div>
              </div>
            </div>
          </div>
          <div className={styles.colThree}>
            <Image
              src={imagePlaceholder}
              className={styles.image}
              alt="image placeholder"
            />
          </div>
        </div>
        <PostReplyForm pid={pid} setReplies={setReplies} />
        <PostReplies
          pid={pid}
          replies={replies}
          handleDeleteReply={handleDeleteReply}
        />
      </div>
    </div>
  );
}
