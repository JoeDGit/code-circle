import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import checkLoggedIn from '../../hooks/checkLoggedIn';
import styles from '../../css/chat.module.css';
import FormSide from '../../components/FormSide';
import { useAuthContext } from '../../hooks/useAuthContext';

const AblyChatComponent = dynamic(
  () => import('../../components/AblyChatComponent'),
  { ssr: false }
);

export default function Message() {
  checkLoggedIn();
  const router = useRouter();
  const channelNum = router.query;
  const { user } = useAuthContext();

  return (
    <div className="mx-2 md:mx-0 w-full mt-60 md:mt-0 md:flex">
      <FormSide
        title={`Chatting with ${router.query.secondUser}`}
        paragraph1="
        Please remember to keep all communication respectful and kind. Harassment, hate speech, or any form of discrimination will not be tolerated. Let's have a great conversation!"
      />
      <AblyChatComponent channelNum={channelNum} />
    </div>
  );
}
