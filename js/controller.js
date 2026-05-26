import { GraderModel } from './model.js';
import { GraderView } from './view.js';

export class GraderController {
    constructor() {
        this.model = new GraderModel();
        this.view = new GraderView();
        this.init();
    }

    init() {
        // Initial render
        this.updateView();

        // Event listener für Änderungen im Model
        document.addEventListener('gradesChanged', (event) => {
            this.updateView(event.detail);
        });

        // Event listener für alle Eingabefelder (Delegation)
        this.setupEventDelegation();
    }

    setupEventDelegation() {
        const container = document.getElementById('app');

        container.addEventListener('input', (e) => {
            if (e.target.type === 'number') {
                const id = e.target.id;
                const value = parseInt(e.target.value, 10);

                if (isNaN(value)) return;

                // Übungen (exercise0 bis exercise7)
                if (id.startsWith('exercise')) {
                    const index = parseInt(id.replace('exercise', ''), 10);
                    if (!isNaN(index)) {
                        this.model.setExerciseScore(index, value);
                    }
                }
                // Klausur
                else if (id === 'exam') {
                    this.model.setExamScore(value);
                }
                // Anwesenheit
                else if (id === 'attendance') {
                    this.model.setAttendance(value);
                }
            }
        });
    }

    updateView(summary = null) {
        if (!summary) {
            summary = this.model.getGradeSummary();
        }
        this.view.render(summary);
    }
}

// App starten
document.addEventListener('DOMContentLoaded', () => {
    new GraderController();
});