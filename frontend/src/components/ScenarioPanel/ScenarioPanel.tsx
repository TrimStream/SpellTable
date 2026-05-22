import { useMemo, useState } from 'react';
import type { Scenario } from '../../types';
import styles from './ScenarioPanel.module.css';

interface ScenarioPanelProps {
	scenario: Scenario;
}

const normalizeAnswer = (value: string) => value.trim().toLowerCase();

export function ScenarioPanel({ scenario }: ScenarioPanelProps) {
	const hasOptions = (scenario.options?.length ?? 0) > 0;
	const [selectedOption, setSelectedOption] = useState<string>('');
	const [freeformAnswer, setFreeformAnswer] = useState('');
	const [submittedAnswer, setSubmittedAnswer] = useState<string | null>(null);
	const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

	const currentAnswer = hasOptions ? selectedOption : freeformAnswer;
	const canSubmit = useMemo(() => currentAnswer.trim().length > 0, [currentAnswer]);

	const handleSubmit = () => {
		if (!canSubmit) return;
		setSubmittedAnswer(currentAnswer);
		setIsCorrect(
			normalizeAnswer(currentAnswer) === normalizeAnswer(scenario.correctAnswer)
		);
	};

	return (
		<section className={styles.container}>
			<header className={styles.header}>
				<h2 className={styles.title}>{scenario.title}</h2>
				<p className={styles.question}>{scenario.question}</p>
			</header>
			{hasOptions ? (
				<div className={styles.options}>
					{scenario.options?.map((option) => {
						const isSelected = option === selectedOption;
						return (
							<button
								key={option}
								type="button"
								className={`${styles.optionCard} ${isSelected ? styles.optionCardSelected : ''}`}
								onClick={() => setSelectedOption(option)}
							>
								{option}
							</button>
						);
					})}
				</div>
			) : (
				/* TODO: [Milestone 5] Replace freeform textarea with AI evaluation via Gemini */
				<textarea
					className={styles.textarea}
					value={freeformAnswer}
					onChange={(e) => setFreeformAnswer(e.target.value)}
					placeholder="Type your answer here..."
					rows={3}
				/>
			)}

			<div className={styles.submitRow}>
				<button
					type="button"
					className={styles.submitButton}
					onClick={handleSubmit}
					disabled={!canSubmit}
				>
					Submit
				</button>

				{submittedAnswer !== null && isCorrect !== null && (
					<div className={styles.feedback}>
                        <span className={isCorrect ? styles.correct : styles.incorrect}>
                            {isCorrect ? 'Correct!' : 'Not quite.'}
                        </span>
						<span className={styles.correctAnswer}>
                            <strong>Correct answer:</strong> {scenario.correctAnswer}
                        </span>
					</div>
				)}
			</div>
		</section>
	);
}