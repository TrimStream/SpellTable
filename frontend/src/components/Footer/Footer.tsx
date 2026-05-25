import styles from './Footer.module.css';

// TODO: When Discord server is created, add this inside the creditRow div:
// <a href="YOUR_DISCORD_LINK" target="_blank" rel="noreferrer" className={styles.discordLink}>Discord</a>

export function Footer() {
    return (
        <footer className={styles.footer}>
            <div className={styles.resources}>
                <div className={styles.resourceGroup}>
                    <span className={styles.resourceTitle}>Tournaments & Stats</span>
                    <a href="https://topdeck.gg" target="_blank" rel="noreferrer" className={styles.resourceLink}>topdeck.gg</a>
                    <a href="https://cedhstats.org" target="_blank" rel="noreferrer" className={styles.resourceLink}>cedhstats.org</a>
                </div>

                <div className={styles.resourceGroup}>
                    <span className={styles.resourceTitle}>Deckbuilding</span>
                    <a href="https://moxfield.com" target="_blank" rel="noreferrer" className={styles.resourceLink}>Moxfield</a>
                    <a href="https://archidekt.com" target="_blank" rel="noreferrer" className={styles.resourceLink}>Archidekt</a>
                </div>

                <div className={styles.resourceGroup}>
                    <span className={styles.resourceTitle}>Find out more</span>
                    <a href="https://magic.wizards.com/en" target="_blank" rel="noreferrer" className={styles.resourceLink}>MTG</a>
                </div>
            </div>

            <div className={styles.credit}>
                <span className={styles.creditName}>Built by Eshaan Singh</span>
                <div className={styles.creditRow}>
                    <span className={styles.moxfieldText}>
                        Find me on Moxfield - <a href="https://moxfield.com/users/TrimStream" target="_blank" rel="noreferrer" className={styles.moxfieldLink}>TrimStream</a>
                    </span>
                </div>
                <a href="https://github.com/TrimStream/TrainingARK" target="_blank" rel="noreferrer" className={styles.githubLink}>GitHub</a>
            </div>

            <div className={styles.copyright}>
                © 2026 TrainingArk
            </div>
        </footer>
    );
}