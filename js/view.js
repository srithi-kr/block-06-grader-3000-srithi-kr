export class GraderView {
    constructor() {
        this.appContainer = document.getElementById('app');
    }

    // Erstellt ein Eingabefeld für Punkte
    createScoreInput(label, id, value, isNegative = false, isDropped = false) {
        const div = document.createElement('div');
        div.className = 'input-group';
        if (isDropped) div.classList.add('dropped-exercise');

        const labelElement = document.createElement('label');
        labelElement.htmlFor = id;
        labelElement.textContent = label;

        const input = document.createElement('input');
        input.type = 'number';
        input.id = id;
        input.min = 0;
        input.max = 100;
        input.value = value;
        input.step = 1;

        if (isNegative) {
            input.classList.add('negative');
        }

        div.appendChild(labelElement);
        div.appendChild(input);

        if (isDropped) {
            const badge = document.createElement('div');
            badge.className = 'badge badge-dropped';
            badge.textContent = 'Wird gestrichen';
            div.appendChild(badge);
        }

        if (isNegative && !isDropped) {
            const badge = document.createElement('div');
            badge.className = 'badge badge-negative';
            badge.textContent = 'Negativ (<51%)';
            div.appendChild(badge);
        }

        return div;
    }

    // Erstellt Eingabefeld für Anwesenheit
    createAttendanceInput(value) {
        const div = document.createElement('div');
        div.className = 'input-group attendance-group';

        const label = document.createElement('label');
        label.htmlFor = 'attendance';
        label.textContent = 'Anwesenheit %';

        const input = document.createElement('input');
        input.type = 'number';
        input.id = 'attendance';
        input.min = 0;
        input.max = 100;
        input.value = value;
        input.step = 1;

        const info = document.createElement('div');
        info.className = 'info-text';
        info.textContent = 'Mindestens 80% Anwesenheit erforderlich';

        div.appendChild(label);
        div.appendChild(input);
        div.appendChild(info);

        return div;
    }

    // Zeigt Ergebnisse an mit optischer Hervorhebung
    displayResults(summary) {
        const resultSection = document.createElement('div');
        resultSection.className = 'result-section';

        const title = document.createElement('h3');
        title.textContent = 'Berechnungsergebnisse';

        const results = document.createElement('div');
        results.className = 'result-card';

        // Übungsnote
        const exerciseGradeDiv = document.createElement('div');
        const exerciseGradeText = `Übungsnote: ${summary.exerciseGrade.toFixed(2)}%`;
        exerciseGradeDiv.innerHTML = `<strong>${exerciseGradeText}</strong>`;
        if (!summary.isExercisePositive) {
            exerciseGradeDiv.style.color = '#ffcccc';
            exerciseGradeDiv.innerHTML += `<div class="warning">️ Übungsnote negativ (benötigt >50%)</div>`;
        } else if (!summary.areExercisesSufficient) {
            exerciseGradeDiv.innerHTML += `<div class="warning">️ Nicht genug positive Übungen (benötigt 75% = ${Math.ceil(8 * 0.75)} von 8)</div>`;
        }

        // Klausurnote
        const examGradeDiv = document.createElement('div');
        examGradeDiv.innerHTML = `<strong>Klausurnote: ${summary.examGrade.toFixed(2)}%</strong>`;
        if (!summary.isExamPositive) {
            examGradeDiv.style.color = '#ffcccc';
            examGradeDiv.innerHTML += `<div class="warning">Klausur negativ (benötigt >50%)</div>`;
        }

        // Anwesenheit
        const attendanceDiv = document.createElement('div');
        attendanceDiv.innerHTML = `<strong>Anwesenheit: ${summary.attendance}%</strong>`;
        if (!summary.hasEnoughAttendance) {
            attendanceDiv.style.color = '#ffcccc';
            attendanceDiv.innerHTML += `<div class="warning">Anwesenheit zu niedrig (benötigt ≥80%)</div>`;
        }

        // Gesamtnote
        const totalGradeDiv = document.createElement('div');
        totalGradeDiv.innerHTML = `<strong>Rohpunktzahl: ${summary.totalGrade.toFixed(2)}%</strong>`;

        const finalGradeDiv = document.createElement('div');
        finalGradeDiv.className = 'final-grade';
        finalGradeDiv.textContent = summary.gradeText;

        if (!summary.isPositive) {
            finalGradeDiv.style.color = '#ffcccc';
            const reasons = [];
            if (!summary.hasEnoughAttendance) reasons.push('Anwesenheit <80%');
            if (!summary.isExamPositive) reasons.push('Klausur negativ');
            if (!summary.isExercisePositive) reasons.push('Übungsnote negativ');
            if (!summary.areExercisesSufficient) reasons.push('Weniger als 75% der Übungen positiv');

            if (reasons.length > 0) {
                const warningDiv = document.createElement('div');
                warningDiv.className = 'warning';
                warningDiv.innerHTML = `<strong>Gesamtnote negativ weil:</strong><br>${reasons.join(', ')}`;
                finalGradeDiv.appendChild(warningDiv);
            }
        } else {
            finalGradeDiv.style.color = '#90ff90';
        }

        results.appendChild(exerciseGradeDiv);
        results.appendChild(document.createElement('br'));
        results.appendChild(examGradeDiv);
        results.appendChild(document.createElement('br'));
        results.appendChild(attendanceDiv);
        results.appendChild(document.createElement('br'));
        results.appendChild(totalGradeDiv);
        results.appendChild(finalGradeDiv);

        resultSection.appendChild(title);
        resultSection.appendChild(results);

        return resultSection;
    }

    // Hauptrender-Methode
    render(summary) {
        this.appContainer.innerHTML = '';

        // Übungen Section
        const exercisesSection = document.createElement('div');
        exercisesSection.className = 'section';
        exercisesSection.innerHTML = '<h2>Übungen (8 Stück)</h2>';

        const exercisesGrid = document.createElement('div');
        exercisesGrid.className = 'exercises-grid';

        for (let i = 0; i < summary.exerciseScores.length; i++) {
            const isNegative = summary.exerciseScores[i] <= 50;
            const isDropped = i === summary.droppedExerciseIndex;
            const inputField = this.createScoreInput(
                `Übung ${i + 1}`,
                `exercise${i}`,
                summary.exerciseScores[i],
                isNegative,
                isDropped
            );
            exercisesGrid.appendChild(inputField);
        }

        exercisesSection.appendChild(exercisesGrid);

        // Klausur und Anwesenheit Section
        const examSection = document.createElement('div');
        examSection.className = 'section';
        examSection.innerHTML = '<h2>Klausur & Anwesenheit</h2>';

        const examInput = this.createScoreInput(
            'Klausur (0-100%)',
            'exam',
            summary.examGrade,
            !summary.isExamPositive
        );

        const attendanceInput = this.createAttendanceInput(summary.attendance);

        examSection.appendChild(examInput);
        examSection.appendChild(attendanceInput);

        // Ergebnisse
        const resultsSection = this.displayResults(summary);

        // Alles zusammenfügen
        this.appContainer.appendChild(exercisesSection);
        this.appContainer.appendChild(examSection);
        this.appContainer.appendChild(resultsSection);
    }
}