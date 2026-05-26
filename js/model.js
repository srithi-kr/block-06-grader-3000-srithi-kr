export class GraderModel {
    constructor() {
        this.exerciseScores = new Array(8).fill(0);
        this.examScore = 0;
        this.attendance = 100;
        this.totalExercises = 8;
    }

    // Übung mit Punkten bewerten (0-100)
    setExerciseScore(index, points) {
        if (index >= 0 && index < this.exerciseScores.length) {
            const validPoints = Math.min(100, Math.max(0, points));
            this.exerciseScores[index] = validPoints;
            this.notifyChange();
        }
    }

    // Klausur mit Punkten bewerten (0-100)
    setExamScore(points) {
        this.examScore = Math.min(100, Math.max(0, points));
        this.notifyChange();
    }

    // Anwesenheit einstellen (0-100%)
    setAttendance(percentage) {
        this.attendance = Math.min(100, Math.max(0, percentage));
        this.notifyChange();
    }

    // Prüft ob ein Punktewert positiv ist (>50%)
    isPositive(score) {
        return score > 50;
    }

    // Berechnet die Durchschnittsnote der Übungen (schlechteste wird gestrichen)
    calculateExerciseGrade() {
        if (this.exerciseScores.length === 0) return 0;

        // Kopiere Array und sortiere aufsteigend
        const sorted = [...this.exerciseScores].sort((a, b) => a - b);

        // Entferne die schlechteste Note (erstes Element)
        const bestScores = sorted.slice(1);

        if (bestScores.length === 0) return 0;

        // Berechne Durchschnitt
        const sum = bestScores.reduce((acc, score) => acc + score, 0);
        return sum / bestScores.length;
    }

    // Findet die gestrichene Übung
    getDroppedExerciseIndex() {
        if (this.exerciseScores.length === 0) return -1;

        let minIndex = 0;
        let minValue = this.exerciseScores[0];

        for (let i = 1; i < this.exerciseScores.length; i++) {
            if (this.exerciseScores[i] < minValue) {
                minValue = this.exerciseScores[i];
                minIndex = i;
            }
        }

        return minIndex;
    }

    // Prüft ob 75% der Übungen positiv sind
    areExercisesSufficient() {
        const positiveCount = this.exerciseScores.filter(score => this.isPositive(score)).length;
        const requiredPositive = Math.ceil(this.totalExercises * 0.75);
        return positiveCount >= requiredPositive;
    }

    // Berechnet die Gesamtnote (0-100)
    calculateTotalGrade() {
        const exerciseGrade = this.calculateExerciseGrade();
        const totalGrade = (exerciseGrade * 0.6) + (this.examScore * 0.4);

        // Prüfe Bedingungen für positive Gesamtnote
        const isExercisePositive = this.isPositive(exerciseGrade) && this.areExercisesSufficient();
        const isExamPositive = this.isPositive(this.examScore);
        const hasEnoughAttendance = this.attendance >= 80;

        if (!hasEnoughAttendance || !isExercisePositive || !isExamPositive) {
            return { grade: totalGrade, isPositive: false };
        }

        return { grade: totalGrade, isPositive: true };
    }

    // Konvertiert numerische Note in Textnote
    getGradeText(grade) {
        if (grade <= 50) return "Nicht Genügend";
        if (grade <= 61) return "Genügend";
        if (grade <= 74) return "Befriedigend";
        if (grade <= 86) return "Gut";
        return "Sehr gut";
    }

    // Benachrichtigt über Änderungen
    notifyChange() {
        const event = new CustomEvent('gradesChanged', { detail: this.getGradeSummary() });
        document.dispatchEvent(event);
    }

    // Gibt Zusammenfassung der Noten zurück
    getGradeSummary() {
        const exerciseGrade = this.calculateExerciseGrade();
        const totalGradeResult = this.calculateTotalGrade();
        const droppedIndex = this.getDroppedExerciseIndex();

        return {
            exerciseGrade: exerciseGrade,
            examGrade: this.examScore,
            totalGrade: totalGradeResult.grade,
            isPositive: totalGradeResult.isPositive,
            gradeText: this.getGradeText(totalGradeResult.grade),
            attendance: this.attendance,
            hasEnoughAttendance: this.attendance >= 80,
            areExercisesSufficient: this.areExercisesSufficient(),
            isExercisePositive: this.isPositive(exerciseGrade),
            isExamPositive: this.isPositive(this.examScore),
            droppedExerciseIndex: droppedIndex,
            exerciseScores: [...this.exerciseScores]
        };
    }
}