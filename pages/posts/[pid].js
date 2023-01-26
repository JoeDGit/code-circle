import { useRouter } from 'next/router';
import { getFirestore, collection, getDocs } from 'firebase/firestore/lite';
import { useState, useEffect } from 'react';
import { app } from '../../firebase/config';

const db = getFirestore(app);

// Gets all posts from Firestore database
async function getPosts(db) {
  const postsCol = collection(db, "posts");
  const postsSnapshot = await getDocs(postsCol);
  const postsList = postsSnapshot.docs.map((doc) => doc.data());
  return postsList;
}

export default function SinglePost() {
  var router = useRouter();
  var pid = router.query["pid"];
  console.log(pid, "<------ Post ID");

  const [ posts, setPosts ] = useState( [] );
  const [ postToRender, setPostToRender ] = useState( {} );

  useEffect(() => {
    getPosts(db)
        .then((response) => {
          setPosts(response);
        })
  }, []);

  useEffect(() => {
    const post = posts.filter((post) => {
      return post.postId === pid;
    })
    setPostToRender(post)
  }, [posts]);

  // console.log(posts, "<------ posts");
  console.log(postToRender, "<------ post to render");
  
  return (
    <div>
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <h1>View a post</h1>
    </div>
    
  )
}