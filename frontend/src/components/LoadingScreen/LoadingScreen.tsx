import { TarkLogo } from "../TarkLogo/TarkLogo";
import styles from './LoadingScreen.module.css'

interface LoadingScreenProps {
    inline?: boolean;
}

export function LoadingScreen({ inline = false }: LoadingScreenProps) {
    return (
        <div className={inline ? styles.containerInline : styles.container}>
            <div className={styles.logo}>
                <TarkLogo size={inline ? 'hero' : 'loading'} />
            </div>
        </div>
    );
}