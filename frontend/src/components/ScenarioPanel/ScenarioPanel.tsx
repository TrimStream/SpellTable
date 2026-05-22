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
		if (!canSubmit) {
			return;
		}

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
				<textarea
					className={styles.textarea}
					value={freeformAnswer}
					onChange={(event) => setFreeformAnswer(event.target.value)}
					placeholder="Type your answer here..."
					rows={4}
				/>
			)}

			<button
				type="button"
				className={styles.submitButton}
				onClick={handleSubmit}
				disabled={!canSubmit}
			>
				Submit
			</button>

			{submittedAnswer !== null && isCorrect !== null ? (
				<div className={styles.feedback}>
					<p className={isCorrect ? styles.correct : styles.incorrect}>
						{isCorrect ? 'Correct!' : 'Not quite.'}
					</p>
					<p className={styles.correctAnswer}>
						<strong>Correct answer:</strong> {scenario.correctAnswer}
					</p>
				</div>
			) : null}
		</section>
	);
}

