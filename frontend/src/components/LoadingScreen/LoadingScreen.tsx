import { TarkLogo } from "../TarkLogo/TarkLogo";
import styles from './LoadingScreen.module.css'

export function LoadingScreen() {
    return (
        <div className={styles.container}>
            <div className={styles.logo}>
                <TarkLogo size="loading" />
            </div>
        </div>
    );
}
