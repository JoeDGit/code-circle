import logo from '../images/Logo.svg';
import arrow from '../images/arrow.svg';
import Image from 'next/image';
import styles from '../css/loggedOutNav.module.css';
export default function LoggedOutNav() {
  return (
    <nav>
      <div className={styles.navContainer}>
        <Image className={styles.logoStyle} alt="logo" src={logo} />

        <div className={styles.buttonContainerStyle}>
          <button className={styles.loginButtonStyle}>Login</button>
          <button className={styles.tryCodeCircleButtonStyle}>
            <div className={styles.tryCodeText}>Try Code Circle free</div>{' '}
            <Image src={arrow} alt="button arrow" />
          </button>
        </div>
      </div>
    </nav>
  );
}
