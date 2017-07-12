var document = document;
'use strict'

// Вспомагательные функции
function templateEl(template, data) {
    var html = template(data);
    var el = document.createElement('div');
    el.innerHTML = html;
    return el.firstElementChild;
}



function Quiz(parent) {
    this._progressBar = document.getElementById('progressBar');
    this._parent    = parent;
    this._current   = 0; // текущий слайд
    this._questions = []; // массив со слайдами
    this._answers   = []; // ответы пользователя
}

Quiz.prototype.init = function(params) {
    var quiz = this;
    this._questions = params.questions.map(function(el, i, arr) {

        if (el.type === "scale") {
            var scale = new QuestionScale({
                question: el.text,
                quiz:     quiz
            });
            // TODO: крепить при инициализации
            scale.appendTo(quiz._parent);
            return scale;


        } else if (el.type === "quiz") {
            var answers = el.answers.map(function(el, i, arr) {
                return {answer: i+1, text: el};
            });
            var slide = new QuestionQuiz({
                question:   el.text,
                answers:    answers,
                quiz:       quiz
            });
            // TODO: крепить при инициализации
            slide.appendTo(quiz._parent);
            return slide;


        } else {
            console.log("Неизвестный тип", el.type);
        }
    });

    this._hello = new Hello({quiz: this});
    this._hello.appendTo(this._parent);
    this._hello.show();
};

Quiz.prototype.start = function(params) {
    this._hello.hide();
    this.updateProgressbar();
    this._questions[this._current].show();
};


Quiz.prototype.updateProgressbar = function() {
    var width = (this._current / this._questions.length) * 800;
    this._progressBar.style.width = width + "px";
};


Quiz.prototype.next = function(answer) {
    this._answers[this._current] = answer;
    this._questions[this._current].hide();
    this._current++;
    this.updateProgressbar();
    if (this._current < this._questions.length) {
        this._questions[this._current].show();
    } else {
        this.getResult();
    }
};


Quiz.prototype.showResult = function(params) {
    this._result = new Result(params);
    this._result.appendTo(this._parent);
    this._result.show();
};


Quiz.prototype.getResult = function() {
    var quiz = this;
    var json_response = JSON.stringify({data:{
          answers: this._answers,
          userData: userData
      }});

    $.ajax({
    type:    "POST",
    url:     "//petersburganalytics.ru/surveys/1/result/",
    data:    json_response,
    success: function(data) {
        quiz.showResult(data);
    },
    error:   function(jqXHR, textStatus, errorThrown) {
        console.warn("Error, status = " + textStatus + ", " +
              "error thrown: " + errorThrown
        );
    }
    });
};



function Slide() {}
Slide.prototype.show = function() {
    this._root.classList.remove('hide');
    // this._root.classList.add('show');
};
Slide.prototype.hide = function() {
    // this._root.classList.remove('show');
    this._root.classList.add('hide');
};
Slide.prototype.appendTo = function append(node) {
    node.appendChild(this._root);
};



function Hello(param) {
    var tmpl_Hello          = Handlebars.compile($("#tmpl_Hello").html());
    var quiz = param.quiz;
    this._root = templateEl(tmpl_Hello);
    this._root.querySelector("#starter").addEventListener('click', function(e){
        quiz.start();
    });
}
Hello.prototype = Object.create(Slide.prototype);


function QuestionQuiz(param) {
    var tmpl_QuestionQuiz   = Handlebars.compile($("#tmpl_QuestionQuiz").html());
    this._quiz = param.quiz;
    this._root = templateEl(tmpl_QuestionQuiz, param);
    this._root.onclick = function(e) {
        if (e.target.tagName === "BUTTON") {
            quiz.next(e.target.dataset.answer);
        }
    };
}
QuestionQuiz.prototype = Object.create(Slide.prototype);


function QuestionScale(param) {
    var tmpl_QuestionScale  = Handlebars.compile($("#tmpl_QuestionScale").html());
    this._quiz = param.quiz;
    this._root = templateEl(tmpl_QuestionScale, param);
    this._root.onclick = function(e) {
        if (e.target.tagName === "BUTTON") {
            quiz.next(e.target.dataset.answer);
        }
    };
}
QuestionScale.prototype = Object.create(Slide.prototype);


function Result(param) {
    var tmpl_Result = Handlebars.compile($("#tmpl_Result").html());
    this._quiz = param.quiz;
    this._root = templateEl(tmpl_Result, param);
}
Result.prototype = Object.create(Slide.prototype);







// ВЫЗОВЫ

var quiz = new Quiz(document.querySelector('.wrapper'));
$.getJSON('//petersburganalytics.ru/surveys/1/questions_all/', function(json) {
    quiz.init(json);
});



// var testQuestions = {
//     questions: [
//         {
//             type: "scale",
//             text: "Вопрос типа шкала"
//         },
//         {
//             type: "quiz",
//             text: "Вопрос типа викторина с разными вариантами ответов",
//             answers: ["Ответ номер один", "Ответ номер два", "Ответ номер три"]
//         }
//     ]
// };
// quiz.init(testQuestions);
