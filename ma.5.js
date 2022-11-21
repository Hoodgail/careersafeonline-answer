
function multipleAnswers() {
    //-----------
    //--------------------------------------------------------------------------------------
    // INITIALIZE VARIABLES
    //--------------------------------------------------------------------------------------

    //Name of type of activity
    if (typeof window.top.questionsCombined == 'undefined' || window.top.questionsCombined == false) { var questionName = eval("KCObject"); }
    else { var questionName = eval("KCActivity_" + pageNumber); }

    var audFile = questionName.getAudioFile();
    debug.log("Audio File " + audFile);

    var audSpriteList = questionName.getAudSprite().slice();

    // Audio Sprite
    manifest = [{ src: audFile, data: { audioSprite: audSpriteList } }];




    //--------------------------------------------------------------------------------------
    // POSTLOAD
    //--------------------------------------------------------------------------------------
    window.beginPlayback = function () {
        debug.log("beginPlayback()...");

        window.initializeMute();

        $('.question-progress').show();
        $(".question-container").show();
        loadQuestion('0');

        disableClass(["activityBtns"], false);
        $(".question0").focus();

        disableClass(["accBtns", "activityBtns"], false);

    }

    //--------------------------------------------------------------------------------------
    // FUNCTIONS FOR QUESTIONS
    //--------------------------------------------------------------------------------------

    var currentQuestion = 0;
    var correct = false;

    var qTextArray;
    var optionsArray;
    var fBCorArray;
    var fBIncArray;
    var ansKeyArray = questionName.getAnswer().slice();

    var answeredQuestions = Array.apply(null, Array(ansKeyArray.length)).map(Number.prototype.valueOf, 0); //Empty array for number of questions

    var userAnswers = [];

    window.resetAnswers = function () {
        userAnswers = [];
        $(".question-options").empty();
    }

    window.createOptions = function () {
        //Answer Options Set-Up
        var optionsArray = questionName.getOptions().slice();

        const correctStyle = "border:solid 2px green !important;";
        const incorrectStyle = "border:solid 2px red !important;";


        for (var i = 0; i < optionsArray[currentQuestion].length; i++) {

            let correct = KCObject._ansKey[currentQuestion].includes(i)

            console.log(KCObject._ansKey, KCObject._ansKey[currentQuestion], i, correct)

            // if (correct) {
            //     setTimeout(() => {
            //         toggleSelect(i)
            //     }, 1000)
            // }

            //write out only the amount of options available
            $('.question-options').append(`<div style="${correct ? correctStyle : incorrectStyle}" class=\"ma-opt-container\"><div class=\"ma-cont\"><div class=\"ma-selector\"></div><div class=\"ma-btn-container\"><button type=\"button\" class=\"btn btn-lg activityBtns ma-btn-options option` + i + "\" aria-pressed=\"false\" onclick=\"toggleSelect(" + i + "); return false;\">" + optionsArray[currentQuestion][i] + "</button></div></div></div>");
        }
    }

    window.loadQuestion = function (questionSelected) {
        //stop audio in case accessibility instructions were playing
        createjs.Sound.stop();

        //Return to top of the page so feedback won't be off-screen.
        window.goToTop();

        //Focus on accessibility instructions when a new question loads
        $(".accessibility-button").focus();

        $(".feedback-container").hide(); //If student doesn't close feedback, this must hide when clicking another question
        $(".completion-container").hide(); //Hiding alert, if students are retrying questions

        currentQuestion = questionSelected;

        $(".instruction-container").hide();
        $(".question-container").show();

        //Question Set-up
        qTextArray = questionName.getQText().slice();
        $(".question-progress-text").html("Question " + (Number(currentQuestion) + 1) + " of " + ansKeyArray.length);
        $(".question-text").html(qTextArray[currentQuestion]);

        //Toggle highlight on button for current question
        for (var id = 0; id < ansKeyArray.length; id++) {
            if (parseInt(id) === parseInt(currentQuestion)) {
                $(".question" + id).addClass("highlighted");
            } else {
                $(".question" + id).removeClass("highlighted");
            }
        }

        resetAnswers();
        createOptions();

        audioObj = createjs.Sound.play("question" + currentQuestion);

        disableClass(["accBtns", "activityBtns"], false);

    }


    window.toggleSelect = function (answerSelected) {

        if ($(".option" + answerSelected).attr("aria-pressed") == "false") {

            $(".option" + answerSelected).attr("aria-pressed", "true");
            $(".option" + answerSelected).parent().prev(".ma-selector").css('visibility', 'visible');
            userAnswers.push(answerSelected);

        } else if ($(".option" + answerSelected).attr("aria-pressed") == "true") {

            $(".option" + answerSelected).attr("aria-pressed", "false");
            $(".option" + answerSelected).parent().prev(".ma-selector").css('visibility', 'hidden');
            userAnswers.splice($.inArray(answerSelected, userAnswers), 1);

        }

    }

    window.checkAnswer = function () {
        createjs.Sound.stop();
        $(".accessibility-button").focus();

        answeredQuestions[currentQuestion] = 1;

        $(".question-container").hide();

        //Return to top of the page so feedback won't be off-screen.
        window.goToTop();

        var ans = userAnswers.sort().toString();
        debug.log("User answer: " + ans);

        //Get correct answer
        ansKeyArray = questionName.getAnswer().slice();
        correct = (ans === ansKeyArray[currentQuestion].slice().sort().toString());

        //Feedback Set-Up
        fBCorArray = questionName.getCorFB().slice();
        fBIncArray = questionName.getIncFB().slice();

        //Check whether an answer is correct or not
        if (correct) {
            showFeedback(fBCorArray[currentQuestion]);
            audioObj = createjs.Sound.play("correct" + currentQuestion);
            debug.log("User answered correctly!");
            $(".question" + currentQuestion + " .question-number").hide();
            $(".question" + currentQuestion + " .question-incorrect").hide(); //In case question is repeated, we want to hide previous icon
            $(".question" + currentQuestion + " .question-correct").show();
            $(".question" + currentQuestion).attr("aria-label", "Question " + (Number(currentQuestion) + 1) + " Answered Correctly");
        } else {
            showFeedback(fBIncArray[currentQuestion]);
            audioObj = createjs.Sound.play("incorrect" + currentQuestion);
            debug.log("User answered incorrectly!");
            $(".question" + currentQuestion + " .question-number").hide();
            $(".question" + currentQuestion + " .question-correct").hide(); //In case question is repeated, we want to hide previous icon
            $(".question" + currentQuestion + " .question-incorrect").show();
            $(".question" + currentQuestion).attr("aria-label", "Question " + (Number(currentQuestion) + 1) + " Answered Incorrectly");
        }

        disableClass(["accBtns", "activityBtns"], false);

    }

    window.showFeedback = function (newText) {

        $(".feedback-text").html(newText);
        $(".feedback-container").show();

    }

    var finalFbViewed = false;

    window.hideFeedback = function () {

        //Hide feedback window and go back to main screen
        $(".feedback-container").hide();

        if (allQuestionsAnswered()) {

            createjs.Sound.stop();//In case 508 audio is playing

            if (!finalFbViewed) {
                //if it's the last question
                disableClass(["accBtns"], true);
                pageComplete();

                $(".completion-container").show();
                audioObj = createjs.Sound.play("final");
                audioObj.addEventListener("complete", function () {
                    disableClass(["accBtns", "activityBtns"], false);
                });
                finalFbViewed = true;

            } else {

                $(".completion-container").show();

            }

        } else {
            loadNextQuestion();
        }

    }


    window.loadNextQuestion = function () {

        //valuesChecked lets us keep track if we've gone through all questions, so we can loop back around to the start if needed.
        var valuesChecked = 0;

        currentQuestion++;

        if (currentQuestion == answeredQuestions.length) {
            currentQuestion = 0;
        }

        for (var i = currentQuestion; i < answeredQuestions.length; i++) {

            if (answeredQuestions[i] == 0) {

                currentQuestion = i;
                loadQuestion(currentQuestion);

                return;

            }

            valuesChecked++;
        }


        //If we've hit the end of the list, but haven't checked all questions, start at the beginning until we do.
        if (valuesChecked !== answeredQuestions.length) {

            for (var i = 0; valuesChecked < answeredQuestions.length; i++) {

                if (answeredQuestions[i] == 0) {

                    currentQuestion = i;
                    loadQuestion(currentQuestion);

                    return;

                }

                valuesChecked++;
            }
        }

    }


    window.allQuestionsAnswered = function () {

        for (var i = 0; i < answeredQuestions.length; i++) {
            if (answeredQuestions[i] == 0) {

                return false;
            }
        }

        return true;

    }

    //--------------------------------------------------------------------------------------
    // EXECUTE UPON LOAD
    //--------------------------------------------------------------------------------------

    $(document).ready(function () {

        //write out the question circles as needed.
        for (var i = 0; i < ansKeyArray.length; i++) {
            $(".progress-list").append("<li><button class=\"progress-circle activityBtns question" + i + "\" aria-label=\"Question " + (i + 1) + " Unanswered\" onclick=\"loadQuestion( '" + i + "' ); return false;\"><div class=\"question-number question" + i + "_id\">0" + (i + 1) + "</div><img class=\"question-correct question" + i + "_cor\" src=\"" + assetsPath + "/images/icon_check.png\"><img class=\"question-incorrect question" + i + "_inc\" src=\"" + assetsPath + "/images/icon_x.png\"></button></li>");
        }

        //If instructions or final feeback parameters are set to null, they will keep the default text
        if (questionName.getInstructions() != null) {
            $(".instruction-text").prepend("<p>" + questionName.getInstructions() + "</p>");
        }

        if (questionName.getFinalFB() != null) {
            $(".final-feedback").prepend(questionName.getFinalFB() + " ");
        }
        //---------------------------------------------------------------------------------------------

        $("#page-div").attr("aria-hidden", "true");

        debug.log("Page loaded: Beginning preloading");
        isMobile = mobileCheck();
        if (!isMobile) {
            //window.top.$(".BeginPlaybackOverlay").hide();
            $("#page-div").removeAttr("aria-hidden");
        } else {
            //window.top.$(".BeginPlaybackOverlay").show();
            window.top.$(".overlayBtn").prop("disabled", false);
        }

    });
    //---------------------------------------
    // END OF creationComplete()
    //---------------------------------------
}
