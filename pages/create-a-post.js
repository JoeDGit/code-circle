import { useState } from 'react';
import { createAPost } from '../hooks/useCreateAPost';
import { useRouter } from 'next/router';
import { useAuthContext } from '../hooks/useAuthContext';
import styles from '../css/createPost.module.css';
import { motion } from 'framer-motion';
import LoaderButton from '../components/LoaderButton';
import LanguageSelect from '../components/LanguageSelect';
import checkLoggedIn from '../hooks/checkLoggedIn';

const buttonVariants = {
  hover: {
    scale: 1.06,
  },
  tap: {
    scale: 0.99,
  },
};

export default function CreateAPost() {
  const { user } = useAuthContext();

  const [postTitleInput, setPostTitleinput] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [programmingLanguage, setProgrammingLanguage] = useState('');
  const [weekDayAvailability, setWeekDayAvailability] =
    useState('Weekdays (Mon-Fri)');
  const [dailyAvailability, setDailyAvailability] = useState(
    'Flexible (varying availability)'
  );
  const [timeZone, setTimeZone] = useState('GMT');
  const [loading, setLoading] = useState(false);
  checkLoggedIn();
  const router = useRouter();
  const weeklyAvailability = [
    'Weekdays (Mon-Fri)',
    'Weekends (Sat-Sun)',
    'Anytime',
    'Flexible (varying availability)',
  ];

  const timesOfDay = [
    'Mornings (6am - 12pm)',
    'Afternoons (12pm - 6pm)',
    'Evenings (6pm - 12am)',
    'Night (12am - 6am)',
    'Anytime (24/7)',
    'Flexible (varying availability)',
  ];

  function handleSubmit(e) {
    e.preventDefault();
    createAPost(
      user.displayName,
      user.photoURL,
      postTitleInput,
      projectDescription,
      programmingLanguage,
      dailyAvailability,
      weekDayAvailability,
      timeZone
    );
    setLoading(true);
    setTimeout(() => {
      router.push('/home');
    }, 1500);
  }

  function HandlePostTitleInput(e) {
    setPostTitleinput(e.target.value);
  }

  function HandleProjectDescription(e) {
    setProjectDescription(e.target.value);
  }

  function handleOnChangeTimeZone(e) {
    setTimeZone(e.target.value);
  }

  return (
    <div className="flex flex-col items-center pt-[150px] pb-[50px]">
      <h1 className="text-4xl mb-2">Create a Post</h1>
      <form
        onSubmit={handleSubmit}
        className="flex flex-col w-3/4 mx-auto border border-[#eaeaea] rounded-[10px] py-[40px] bg-[#ffffff] drop-shadow items-center justify-center gap-5"
      >
        <input
          className="w-11/12 md:w-1/2 h-12 border border-[#dbdbdb] rounded-[15px] bg-[#fafafa] px-[10px] mb-[10px] text-[14px]"
          type="text"
          value={postTitleInput}
          onChange={HandlePostTitleInput}
          required
          placeholder="Enter a title for your project"
          autoFocus
        />

        <textarea
          name="project-description"
          value={projectDescription}
          onChange={HandleProjectDescription}
          required
          placeholder="Enter a description for your project"
          spellCheck="true"
          className="w-11/12 md:w-1/2 h-[100px] mx-auto border-2 border-[#eaeaea] rounded-[10px] p-5 bg-[#ffffff] my-5 drop-shadow resize-none"
        />

        <label className="flex flex-col items-center justify-center w-full gap-1">
          Choose the main language for the project :
          <LanguageSelect
            customStyle={'md:w-1/2 w-5/6'}
            selectedLanguages={programmingLanguage}
            setSelectedLanguages={setProgrammingLanguage}
          />
        </label>

        <label className="flex flex-col items-center justify-center w-full gap-3">
          Select when you&apos;re available to pair:
          <select
            value={weekDayAvailability}
            onChange={(e) => setWeekDayAvailability(e.target.value)}
            className="border p-2"
          >
            {weeklyAvailability.map((availabilityOption) => {
              return (
                <option key={availabilityOption}>{availabilityOption}</option>
              );
            })}
          </select>
          <select
            className="border p-2"
            value={dailyAvailability}
            onChange={(e) => setDailyAvailability(e.target.value)}
          >
            {timesOfDay.map((availableTime) => {
              return <option key={availableTime}>{availableTime}</option>;
            })}
          </select>
        </label>
        <label className="flex flex-col items-center justify-center w-full gap-1">
          Choose a time zone :
          <select
            name="Time-zone"
            onChange={handleOnChangeTimeZone}
            className={styles.select}
          >
            <option value="GMT">GMT</option>
            <option value="UTC">UTC</option>
            <option value="PST">PST</option>
            <option value="UTC">UTC</option>
            <option value="ET">ET</option>
            <option value="CT">CT</option>
            <option value="PT">PT</option>
          </select>
        </label>
        <motion.button
          variants={buttonVariants}
          whileHover="hover"
          whileTap="tap"
          className={styles.button}
        >
          {loading ? <LoaderButton /> : 'Add Post'}
        </motion.button>
      </form>
    </div>
  );
}
