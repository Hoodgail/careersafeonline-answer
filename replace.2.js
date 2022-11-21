
function multipleChoice() {
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

        disableClass(["accBtns", "activityBtns"], false);
        $(".question0").focus();

        audioObj.addEventListener("complete", function () {
            disableClass(["accBtns", "activityBtns"], false);
        });

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


    window.loadQuestion = function (questionSelected) {
        //stop audio in case accessibility instructions were playing
        createjs.Sound.stop();

        //Return to top of the page so feedback won't be off-screen.
        window.goToTop();

        //Focus on accessibility instructions when a new question loads
        $(".accessibility-button").focus();

        $(".feedback-container").hide();//If student doesn't close feedback, this must hide when clicking another question
        $(".completion-container").hide();//Hiding alert, if students are retrying questions

        currentQuestion = questionSelected;

        $(".question-container").show();

        resetAnswers();

        disableClass(["accBtns", "activityBtns"], false);

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

        //Answer Options Set-Up
        optionsArray = questionName.getOptions().slice();

        audioObj = createjs.Sound.play("question" + currentQuestion);
        audioObj.addEventListener("complete", function () {
            disableClass(["accBtns", "activityBtns"], false);
        });

    }

    window.resetAnswers = function () {

        removeOptions();
        createOptions();
    }

    window.removeOptions = function () {
        $(".question-options").empty();
    }

    window.createOptions = function () {

        var optionsArray = KCObject._options[currentQuestion];
        var colVal = (optionsArray.length % 2) === 0 ? 6 : 4;
        var numOnLastRow = (colVal === 4) ? optionsArray.length % 3 : 0;

        const correctStyle = "border:solid 2px green;";
        const incorrectStyle = "border:solid 2px red;";

        console.log(optionsArray, KCObject)

        for (let i = 0; i < optionsArray.length; i++) {


            $('.question-options').append('<div class="col-sm-' + colVal + ' col-xs-12"><button type="button" class="btn btn-lg activityBtns mc-btn-options option' + i + '" onclick="checkAnswer(' + i + '); return false;">' + optionsArray[i] + '</button></div>');
        }

        // If there is one option on the last row, offset by 4 to make it center, and if there are two, offset the first on the row by two to center them both.
        if (numOnLastRow !== 0) {
            if (numOnLastRow === 1) {
                $('.question-options > div:last-child').addClass('col-sm-offset-4');
            } else {
                $('.question-options >div:nth-last-child(2)').addClass('col-sm-offset-2');
            }
        }

    }

    window.checkAnswer = function (optionSelected) {
        createjs.Sound.stop();
        $(".accessibility-button").focus();

        answeredQuestions[currentQuestion] = 1;

        disableClass(["accBtns", "activityBtns"], false);
        $(".question-container").hide();

        //Return to top of the page so feedback won't be off-screen.
        window.goToTop();

        var ans = optionSelected;
        debug.log("User answer: " + ans);

        //Get correct answer
        ansKeyArray = questionName.getAnswer().slice();
        correct = (Number(ans) == ansKeyArray[currentQuestion]);

        //Feedback Set-Up
        fBCorArray = questionName.getCorFB().slice();
        fBIncArray = questionName.getIncFB().slice();

        //Check whether an answer is correct or not
        if (correct) {
            showFeedback(fBCorArray[currentQuestion]);
            audioObj = createjs.Sound.play("correct" + currentQuestion);
            debug.log("User answered correctly!");
            $(".question" + currentQuestion + " .question-number").hide();
            $(".question" + currentQuestion + " .question-incorrect").hide();//In case question is repeated, we want to hide previous icon
            $(".question" + currentQuestion + " .question-correct").show();
            $(".question" + currentQuestion).attr("aria-label", "Question " + (Number(currentQuestion) + 1) + " Answered Correctly");
        } else {
            showFeedback(fBIncArray[currentQuestion]);
            audioObj = createjs.Sound.play("incorrect" + currentQuestion);
            debug.log("User answered incorrectly!");
            $(".question" + currentQuestion + " .question-number").hide();
            $(".question" + currentQuestion + " .question-correct").hide();//In case question is repeated, we want to hide previous icon
            $(".question" + currentQuestion + " .question-incorrect").show();
            $(".question" + currentQuestion).attr("aria-label", "Question " + (Number(currentQuestion) + 1) + " Answered Incorrectly");
        }

        audioObj.addEventListener("complete", function () {
            disableClass(["accBtns", "activityBtns"], false);
        });


    }

    window.showFeedback = function (newText) {
        $(".feedback-container").show();
        $(".feedback-text").html(String(newText));
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

        //disabling all input so that users cannot click any buttons when instructions are playing.
        $(":input").prop("disabled", true);

        //write out the question circles as needed.
        for (var i = 0; i < ansKeyArray.length; i++) {
            $(".progress-list").append("<li><button class=\"progress-circle activityBtns question" + i + "\" aria-label=\"Question " + (i + 1) + " Unanswered\" onclick=\"loadQuestion( '" + i + "' ); return false;\"><div class=\"question-number question" + i + "_id\">0" + (i + 1) + "</div><img class=\"question-correct question" + i + "_cor\" src=\"" + assetsPath + "/images/icon_check.png\"><img class=\"question-incorrect question" + i + "_inc\" src=\"" + assetsPath + "/images/icon_x.png\"></button></li>");
        }

        //If instructions or final feeback parameters are set to null, they will keep the default text
        if (questionName.getInstructions() != null) {
            $(".activity-instruction-text").html("<p>" + questionName.getInstructions() + "</p>");
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