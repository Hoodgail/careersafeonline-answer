class KCActivity {

    /**
     * Instruction Text (set to null if it doesn't not exist)
     * @type {string} instruction
     */
    instruction = null;

    /**
     * Questions Text
     * @type {string[]} question
     */
    questions = [];

    /**
     * Options Text
     * @type {Array<string[]>} options
     */
    options = [];

    /**
     * Correct feedback Texts
     * @type {string[]} correctFeedback
     */
    correctFeedback = [];

    /**
     * Incorrect feedback Texts
     * @type {string[]} incorrectFeedback
     */
    incorrectFeedback = [];

    /**
     * Final feedback Text
     * @type {string} finalFeedback
     */
    finalFeedback = null;

    /**
     * Answer key
     * @type {number[]} answerKey
     * @example [1, 2, 3]
     */
    answerKey = [];

    /**
     * Audio file name
     * @example "audio.mp3"
     */
    audio = null;

    /** Useless */
    audioSprite = [];

    constructor(
        instruction,
        questions,
        options,
        correctFeedback,
        incorrectFeedback,
        finalFeedback,
        answerKey,
        audio,
        audioSprite
    ) {
        this.instruction = instruction;
        this.questions = questions;
        this.options = options;
        this.correctFeedback = correctFeedback;
        this.incorrectFeedback = incorrectFeedback;
        this.finalFeedback = finalFeedback;
        this.answerKey = answerKey;
        this.audio = audio;
        this.audioSprite = audioSprite;
    }
}

/**
 * @param {code} string
 * @returns {() => KCActivity}
 */
const createFunction = (code) => {

    return eval(`function anonymous() {
        ${code}
        return KCObject;
    }`);
}

const fetchActivity = async (activityId) => {
    const response = await fetch(`https://www.khanacademy.org/api/internal/scratchpads/${activityId}/latest`);
    const data = await response.json();
    return data;
}