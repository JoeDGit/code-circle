import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import PostReplyForm from '../../components/postReplyForm';
import PostReplies from '../../components/PostReplies';
import { getReplies } from '../../hooks/getReplies';
import styles from '../../css/posts.module.css';
import profilePlaceholder from '../../images/profilePlaceholder.png';
import Image from 'next/image';
import moment from 'moment/moment';
import { AiOutlineMail } from 'react-icons/ai';
import { IoReturnUpBackSharp } from 'react-icons/io5';
import checkLoggedIn from '../../hooks/checkLoggedIn';
import { useAuthContext } from '../../hooks/useAuthContext';
import deleteAreply from '../../hooks/deleteAreply';
import getSinglePost from '../../hooks/getSinglePost';
import Loader from '../../components/Loader.jsx';

export default function SinglePost() {
  const [postData, setPostData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [replies, setReplies] = useState([]);
  const [isDeletingReply, setIsDeletingReply] = useState(false);
  checkLoggedIn();
  const { user } = useAuthContext();

  const router = useRouter();
  const postId = router.query.pid;

  useEffect(() => {
    setIsLoading(true);
    const fetchPostData = async () => {
      try {
        const singlePostData = await getSinglePost(postId);
        const postReplies = await getReplies(postId);
        setPostData(singlePostData);
        setReplies(postReplies);
      } catch (error) {
        console.log(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPostData();
  }, [postId]);

  const handleDeleteReply = (replyId) => {
    setIsDeletingReply(true);
    Promise.resolve(deleteAreply(replyId))
      .then(() => {
        setReplies((prevReplies) =>
          prevReplies.filter((reply) => reply.replyId !== replyId)
        );
        setIsDeletingReply(false);
      })
      .catch(() => {});
  };

  const dateObject = moment(postData.postTime);
  const readableDate = dateObject.fromNow();

  if (isLoading) {
    return (
      <div className="flex justify-center mt-40">
        <Loader />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center pt-[150px] pb-12">
      <div
        onClick={() => {
          router.push('/home');
        }}
        className="flex self-start items-center gap-2 bg-[#4f9cf9] rounded px-2 pr-3 cursor-pointer ml-4"
      >
        <IoReturnUpBackSharp color={'white'} size={20} />
        <div className="text-white font-sans">Back to all posts</div>
      </div>
      <div className="w-3/4 m-auto border border-[#eaeaea] rounded-[10px] p-5 mt-2">
        <div className="flex flex-col md:gap-[15px] w-full items-start h-1/5">
          <div>
            {postData.photoURL ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={postData.photoURL}
                alt="profile "
                className="rounded-full w-[60px] h-[60px] md:w-[150px] md:h-[150px] cursor-pointer"
                onClick={() => {
                  router.push(`/users/${user?.displayName}`);
                }}
              />
            ) : (
              <Image
                src={profilePlaceholder}
                alt="profile"
                onClick={() => {
                  router.push(`/users/${user?.displayName}`);
                }}
                className="rounded-full w-[60px] h-[60px] md:w-[150px] md:h-[150px] cursor-pointer"
              />
            )}
          </div>
          <div className="self-start w-full h-full text-[10px] md:text-[16px]">
            <div className="flex flex-col  md:mb-4 md:mt-0 md:ml-4">
              <div
                onClick={() => {
                  router.push(`/users/${postData.user}`);
                }}
                className="text-[#4f9cf9] font-bold text-xl cursor-pointer w-fit"
              >
                @{postData.user}
              </div>

              <div className="font-bold">in {postData.programmingLanguage}</div>
              <div className={styles.time}>{readableDate}</div>
              <div className="text-2xl cursor-pointer w-fit">
                <AiOutlineMail />
              </div>
            </div>

            <div className="flex flex-col h-full gap-8">
              <div>
                <div className="text-3xl font-bold text-sans mb-5 mt-2">
                  {postData.postTitle}
                </div>
                <div className="text-lg font-sans mb-2.5 mt-5">
                  {postData.projectDescription}
                </div>
              </div>
              <div>
                <div className="text-[14px]">
                  Availability: {postData.weekDayAvailability}{' '}
                  {postData.dailyAvailability}
                </div>
                <div className="text-[14px]">
                  Time zone: {postData.timeZone}
                </div>
              </div>
            </div>
          </div>
        </div>
        <PostReplyForm postId={postId} setReplies={setReplies} />
        <PostReplies
          postId={postId}
          replies={replies}
          handleDeleteReply={handleDeleteReply}
          isDeletingReply={isDeletingReply}
        />
      </div>
    </div>
  );
}
