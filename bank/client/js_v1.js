
/*$('#MobileNumberEnterByUser').text(toPersianDigits(mobileValue));*/

var votePackageBox = document.getElementById('votePackageBox');
var StructureId = $('#StructureId').val();
var SurveyTypeId = $('#SurveyTypeId').val();
var qrTypeId = $('#qrTypeId').val();
var ProcessTypeId;

var votePackageIdData;
var votePackageReferenceId;
var VotePackageId;
var MobileNumber;
var QuestionTypeId;
var VotePackageTitle;
var VotePackagegoodByeMessage;
var VotePackageTitleMain = ' سامانه نظرسنجی بانک ملت';
var votePackageDetailId;
var TopInformation;
var RequestQRType;

var typeLoad = $('#typeLoad').val();

var MandatoryLogin;
var SMSId;
var VoterLoginMethodType;
var ProcessCount = $('#ProcessTypeCount').val();
var isWaitForOTP = false

const TIMER_DURATION = 120; // 2 minutes
const FULL_DASH_ARRAY = 283;

var zoomSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
  <circle cx="11" cy="11" r="7"></circle>
  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
  <line x1="11" y1="8" x2="11" y2="14"></line>
  <line x1="8" y1="11" x2="14" y2="11"></line>
</svg>`;

$(document).ready(function () {
    const otpInputs = document.querySelectorAll('.otp-input'); // کلاس inputهای OTP رو بذار
    otpInputs[0].addEventListener('paste', function (e) {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').trim();
        const digits = pastedData.replace(/\D/g, ''); // فقط عدد
        otpInputs.forEach((input, index) => {
            if (digits[index]) {
                input.value = toPersianDigits(digits[index]);
            }
        });
        // focus بره روی آخرین خونه پر شده
        const lastIndex = Math.min(digits.length - 1, otpInputs.length - 1);
        if (lastIndex >= 0) otpInputs[lastIndex].focus();
    });



    const mobileSpan = document.getElementById('MobileNumberEnterByUser');
    if (mobileSpan) {
        new MutationObserver(() => {
            const t = mobileSpan.textContent;
            const p = toPersianDigits(t);
            if (t !== p) mobileSpan.textContent = p;
        }).observe(mobileSpan, { childList: true, characterData: true, subtree: true });
    }
    const timerLabel = document.getElementById('base-timer-label');
    if (timerLabel) {
        new MutationObserver(() => {
            const t = timerLabel.textContent;
            const p = toPersianDigits(t);
            if (t !== p) timerLabel.textContent = p;
        }).observe(timerLabel, { childList: true, characterData: true, subtree: true });
    }
    document.getElementById('MobileNumber').placeholder = toPersianDigits('9121234567');

    // Get token from meta tag (or localStorage/sessionStorage)
    const token = $('#JWT').val();

    // Set up AJAX defaults to include Authorization header
    if (token) {
        $.ajaxSetup({
            beforeSend: function (xhr) {
                xhr.setRequestHeader('Authorization', 'Bearer ' + token);
            }
        });
    }


    //if ('OTPCredential' in window) {
    //    const ac = new AbortController();

    //    document.getElementById('verifyOtpBtn')?.addEventListener('click', () => ac.abort(), { once: true });


    //    navigator.credentials.get({ otp: { transport: ['sms'] }, signal: ac.signal })
    //        .then(otp => {
    //            const hidden = document.getElementById('otpHidden');
    //            const single = document.getElementById('CodeOtp');

    //            if (hidden) {
    //                document.querySelectorAll('.otp-input').forEach((inp, i) => {
    //                    inp.value = toPersianDigits(otp.code[i] || '');
    //                });
    //                hidden.value = otp.code;
    //            } else if (single) {
    //                single.value = otp.code;
    //            }
    //        })
    //        .catch(err => {
    //            if (err.name === 'AbortError') return;
    //            console.error('❌ OTP error:', err);
    //        });


    //}

    ProcessTypeIdYaas = $("#ProcessTypeIdYaas").val();

    $(".HaveAnimation  ").addClass('start-animation')
    if (ProcessCount == 0) {
        ProcessTypeId = 0;
        $('.DataBox').addClass("animationShow", 500, "easeOutBounce");
        $(".card-selectServices").addClass('d-none');
        if (typeLoad !== '3') {//برای نظرسنجی های نوع غیر پیامک
        }
        VotePackageId = $('#VotePackageId').val();
        if (MandatoryLogin == true) {
            $(".LoginStep1").removeClass('d-none');
            $('.DataBox').removeClass('height400');
            $('#card-container').removeClass("height400");
        }
    }
    else if (ProcessCount == 1) {


        ProcessTypeId = $('#ProcessTypeIdFirst').val();



        VotePackageId = null;
    }
    else {
        $('.DataBox').removeClass('height400');
        $('#card-container').removeClass("height400");
    }



});

let idleTimeout;
function resetIdleTimer(displayedTimeOut) {
    if (!isWaitForOTP) {
        clearTimeout(idleTimeout);
        idleTimeout = setTimeout(() => {
            window.location.href = '/Home/ShowTerminal'; // Replace with your target URL

        }, displayedTimeOut * 1000); // 60000 milliseconds = 1 minute
    } else clearTimeout(idleTimeout);
}

let otpTimeout;

function changeWaitForOTP(isWait) {
    isWaitForOTP = isWait
    DisplayTimeOut = $('#DisplayTimeOut').val();

    if (isWaitForOTP) {
        otpTimeout = setTimeout(() => {
            isWaitForOTP = false

            resetIdleTimer(DisplayTimeOut)

        }, TIMER_DURATION * 1000);
    }

    resetIdleTimer(DisplayTimeOut)
}

function cancelOtpTimeout() {
    clearTimeout(otpTimeout)
}


EndSurvey();
function InformationOfVP() {
    let PersonnelFullname = $('#FullName').val();
    RequestQRType = $('#qrTypeId').val();
    var RequestQRTypeText;
    RequestQRTypeText = "";
    PersonnelFullname = PersonnelFullname;
    if (typeLoad == 2) {
        $('.TopInformation').append('<span class="info">' + PersonnelFullname + '</span>');
        $('.TopInformation').append('<span class="RequestQRType">' + RequestQRTypeText + '</span>');
    }
}
switch (typeLoad) {
    case '2':
        MandatoryLogin = $('#VotePackageIsLoginMandatory').val();
        InformationOfVP();
        loadVotepackage();
        break;

    case '3':  // Separate case for '3'
    case '4':  // Separate case for '4'
        MandatoryLogin = $('#VotePackageIsLoginMandatory').val();
        SMSId = $('#SMSId').val();
        VotePackageId = $('#VotePackageId').val();
        votePackageReferenceId = $('#VotePackageReferenceId').val();
        $('.DataBox').addClass("animationShow", 500, "easeOutBounce");
        $(".card-selectServices").addClass('d-none');
        $(".LoginStep1").removeClass('d-none');
        $('.DataBox').removeClass('height400');
        $('#card-container').removeClass("height400");
        InformationOfVP();
        loadVotepackage();
        break;

    case '5':
        MandatoryLogin = $('#VotePackageIsLoginMandatory').val();
        DisplayTimeOut = $('#DisplayTimeOut').val();
        InformationOfVP();
        $('.page_body').addClass("KioskMode");
        resetIdleTimer(DisplayTimeOut)

        window.onload = function () {
            document.addEventListener('mousemove', function () { resetIdleTimer(DisplayTimeOut) });
            document.addEventListener('keydown', function () { resetIdleTimer(DisplayTimeOut) });
            resetIdleTimer(DisplayTimeOut);
        };
        break;
}
function backToHomeBranch() {

    window.location.replace("/home/ShowTerminal");
}

function loadVotepackage(mandatoryLogin) {
    const votePackageData = getVotePackageData();
    votePackageReferenceId = votePackageData.VotePackageReferenceId;
    $(".text1 span").empty();
    $(".wellcomeMsg").empty();
    $(".goodbyeMsg").empty();

    const formattedWelcomeMessage = votePackageData.WelcomeMessage.replace(/\n/g, '<br>');
    $(".wellcomeMsg").append(formattedWelcomeMessage + ' ');

    const votePackageTitle = toFarsiNumber(votePackageData.Title);
    $('.TopInformation').append('<span class="info">' + votePackageTitle + '</span>');

    VotePackagegoodByeMessage = votePackageData.GoodByeMessage;
    MandatoryLogin = votePackageData.IsLoginMandatory;

    if (ProcessCount == 1) {
        $(".card-selectServices").addClass('d-none');
    }

    if (MandatoryLogin === true) {
        $(".LoginStep1").removeClass('d-none');
        window.addEventListener("load", () => {
            timeLabel.innerHTML = formatTime(TIMER_DURATION);
        });
    } else {
        forstarterVotepackage("NoMandatory");
    }
}
function getVotePackageData() {
    // Read from data attribute instead of value
    const input = document.getElementById('vote-package-data');
    if (!input) {
        //console.error("#vote-package-data input not found");
        return null;
    }

    // Get from data attribute
    const jsonStr = input.getAttribute('data-vote-package');
    if (!jsonStr || jsonStr === 'null') return null;

    try {
        return JSON.parse(jsonStr);
    } catch (e) {
        //console.error("Failed to parse JSON from data attribute:", jsonStr, e);
        return null;
    }
}

function getServicesCode(Code) {
    ProcessTypeId = Code;
    VotePackageId = null;

    $('.DataBox').addClass("animationShow", 500, "easeOutBounce");
    $(".card-selectServices").addClass('d-none');
    loadVotepackage();

    if (MandatoryLogin == true) {
        $(".LoginStep1").removeClass('d-none');
        $('.DataBox').removeClass('height400');
        $('#card-container').removeClass("height400");
    } else {
        $('.DataBox').removeClass('height400');
        $('#card-container').removeClass("height400");
    }
}
function LoadMore() {
    $('.DataBox').addClass('height400');
    $('#card-container').addClass("height400");
    $('.loadMoreTitle').addClass("d-none");
}
function StartSurvey() {
    $('#StartForm').addClass('d-none');
    $('#FormSurvey').removeClass('d-none');
}
function endOfSurvey() {
    $('#endPage').removeClass('d-none');
    $('#FormSurvey').addClass('d-none');

}
function AcceptCode() {
    $('.loginForm').addClass('d-none');
    $('#StartForm').removeClass('d-none');

}

//تایید نهایی نظرسنجی
function ConfirmTosentSurveyBtn() {

    FinalSaveAllAnswerList();
}


function EndSurvey() {
    setTimeout(
        function () {
            window.history.pushState("object or string", "Title", "/Home/Survey");
        }, 1000);
}


function UpdateIsDeraftVoteAnswer() {

    $('.ConfirmTosentSurveyBox').addClass('d-none');
    $('.EndText').removeClass('d-none');
    $('.dataFirsPage').removeClass('slide-up');
    $('.DataBox').removeClass('height85');
    $('body').removeClass('slide-up');
    $('.DataBox ').addClass('d-none');
    $('.dataFirsPage').empty();
    $('.dataFirsPage').addClass('EndPage');
    $('.dataFirsPage').prepend('<div class="MobileTopData animationShow "><figure class="ServicesImage" ><img class="mellat192" src="/images/logo/logo png-10.png"></figure><div class="form-title StartPage" id="signup"><h2 class="text1 animatTop"><img class="mellat32" src="/images/mellat32.png"></h2> <h1 class="text3 ">' + VotePackageTitle + '</h1></div></div > ');

    $('.TopInformation ').empty();
    $('.text3').empty();
    $('#backToHomeBranch').removeClass('d-none');
    var formattedgoodByeMessage = VotePackagegoodByeMessage.replace(String.fromCharCode(10), '<br>');
    $('.dataFirsPage ').append('<div class="EndText HaveAnimation ">' + formattedgoodByeMessage + '</div > ');


}
function DeactiveLastBtns() {
    $('#ConfirmSurveyBtn').addClass('disabled');
    $('#backToPackage').addClass('disabled');

}
function ActiveLastBtns() {
    $('#ConfirmSurveyBtn').removeClass('disabled');
    $('#backToPackage').removeClass('disabled');

}

$(".tb-next").click(function () {
    let cur = $(this).closest("#tabArea").find(".tab-pan.active");
    if (jQuery(cur).next().length > 0) {
        $(".tb-prev").removeClass("hide");
        jQuery(".tab-pan").removeClass("active");
        jQuery(cur).next().addClass("active");
    }
    if (jQuery(cur).next().next().length === 0) {
        $(".tb-next").addClass("hide");
        $(".submitbtn").removeClass("hide");
    }
});

$(".tb-prev").click(function () {
    let cur = $(this).closest("#tabArea").find(".tab-pan.active");
    if (jQuery(cur).prev().length > 0) {
        $(".submitbtn").addClass("hide");
        $(".tb-next").removeClass("hide");
        jQuery(".tab-pan").removeClass("active");
        jQuery(cur).prev().addClass("active");
    }
    if (jQuery(cur).prev().prev().length === 0) {
        $(".tb-prev").addClass("hide");
    }
});

class Timer {
    constructor(duration, onTick, onComplete) {
        this.duration = duration;
        this.remainingTime = duration;
        this.startTime = null;
        this.timerId = null;
        this.onTick = onTick;
        this.onComplete = onComplete;
        this.isPaused = false;
    }

    start(withReset = true) {
        if (this.timerId) return;

        if (withReset) {
            this.reset();
        }

        this.startTime = Date.now();

        this.timerId = setInterval(() => {
            if (this.isPaused || !this.timerId) return;

            const elapsedTime = Math.floor((Date.now() - this.startTime) / 1000);
            this.remainingTime = Math.max(0, this.duration - elapsedTime);

            if (this.onTick) {
                this.onTick(this.remainingTime);
            }

            if (this.remainingTime <= 0) {
                this.stop();
                if (this.onComplete) {
                    this.onComplete();
                }
            }
        }, 1000);
    }

    stop() {
        if (this.timerId) {
            clearInterval(this.timerId);
            this.timerId = null;
        }
    }

    pause() { this.isPaused = true; }

    resume() { this.isPaused = false; }

    reset() {
        this.stop();
        this.remainingTime = this.duration;
        this.startTime = null;
        this.isPaused = false;

        if (this.onTick) {
            this.onTick(this.remainingTime);
        }
    }
}

var progressBar = document.getElementById("base-timer-progress-remaining");
var timeLabel = document.getElementById("base-timer-label");
var timerRoot = document.querySelector(".otp-timer-neo");
var timerBox = document.querySelector(".base-timer");

const countdownTimer = new Timer(
    TIMER_DURATION,
    function (remainingTime) {
        if (!progressBar || !timeLabel) return;

        timeLabel.innerHTML = formatTime(remainingTime);

        var progressPercent = (remainingTime / TIMER_DURATION) * 100;
        progressBar.style.width = progressPercent + "%";

        if (timerRoot) {
            timerRoot.classList.remove("is-warning", "is-danger");

            if (remainingTime <= 20 && remainingTime > 10) {
                timerRoot.classList.add("is-warning");
            } else if (remainingTime <= 10 && remainingTime > 0) {
                timerRoot.classList.add("is-danger");
            }
        }
    },
    function () {
        clearOtpInputs()

        $("#textotpCodeBox").removeClass("hidden");

        if (timerBox) {
            timerBox.classList.add("hidden");
        }
    }
);




function sendOtpCode() {
    if (!validateMobileNumber()) {
        return;
    }

    if (OldNumber != MobileNumber) {
        countdownTimer.reset();
        if (typeLoad === '5') {
            changeWaitForOTP(true)
        }
    }

    $('#MobileNumberEnterByUser').html(MobileNumber);
    sendOtpCodeSms(1);
    $('#MobileNumber').css('border', 'none');

    $('.base-timer__path-remaining.arc').css('color', '#2cc570');
    closeNumberPad();
}

var mobile;
var mobileNew;
//function validateMobileNumber() {


//    mobile = $('#MobileNumber').val();
//    mobile = (mobile * 1).toString();
//    mobile = "98" + mobile;
//    MobileNumber = mobile.replace(/\D/g, '').trim();
//    const regexp = /^989\d{9}$/;


//    $('#MobileNumber').css("border-bottom", "1px solid #ccc");
//    $('.alertFild').html('');

//    if (MobileNumber === "") {
//        $('.alertFild').html(' شماره موبایل را وارد نمایید.').show(500);
//        $('#MobileNumber').css("border", "3px solid #fd282869").show(500);
//        return false;
//    }

//    if (!regexp.test(MobileNumber)) {
//        $('#MobileNumber').css("border", "3px solid #fd282869").show(500);
//        $('.alertFild').html('شماره وارد شده معتبر نمی باشد.').show(500);
//        return false;
//    }
//    return true;
//}
function validateMobileNumber() {
    let raw = toLatinDigits(($('#MobileNumber').val() || '').trim());
    mobile = (raw * 1).toString();
    mobile = "98" + mobile;
    MobileNumber = mobile.replace(/\D/g, '').trim();
    const regexp = /^989\d{9}$/;

    $('#MobileNumber').css("border-bottom", "1px solid #ccc");
    $('.alertFild').html('');

    if (MobileNumber === "") {
        $('.alertFild').html(' شماره موبایل را وارد نمایید.').show(500);
        $('#MobileNumber').css("border", "3px solid #fd282869").show(500);
        return false;
    }

    if (!regexp.test(MobileNumber)) {
        $('#MobileNumber').css("border", "3px solid #fd282869").show(500);
        $('.alertFild').html('شماره وارد شده معتبر نمی باشد.').show(500);
        return false;
    }
    return true;
}


function sendOtpCodeSms(VoterLoginMethodType) {

    $.ajax({
        type: "POST",
        dataType: 'JSON',
        url: '/Home/SendOtp',
        data: {
            FirstName: '',
            LastName: '',
            GenderId: '',
            MobileNo: toLatinDigits(MobileNumber),
            CustomerNo: '',
            LastVerificationCode: '',
            LastVerificationCodeSendDateTime: '',
            VerificationCodeSendCount: '',
            LastWrongLoginDateTime: '',
            LastWrongLoginCount: '',
            EnteredOtp: '',
            VoterLoginMethod: VoterLoginMethodType,
            TrackingCode: $('#TrackingCode').val()
        },
        success: function (data) {
            if (data.success) {
                $('.LoginStep1').addClass('d-none');
                $('.LoginStep2').removeClass('d-none');

                countdownTimer.reset();
                //  if (OldNumber != MobileNumber) {
                countdownTimer.start();
                //  }  

                $('.alertFild').html('');
                $('#MobileNumberEnterByUser').empty();
                $('#MobileNumberEnterByUser').html('');
                $('#MobileNumberEnterByUser').html(MobileNumber);
            }
            else {
                $('.alertFild').html(data.operationErrors[0].description);
                $('#MobileNumberEnterByUser').empty();
                $('#MobileNumberEnterByUser').html('');
                $('#MobileNumberEnterByUser').html(MobileNumber);

                var resultError = data.operationErrors[0].code;

                switch (resultError) {
                    case 7:
                        showAlert(data.operationErrors[0].description)
                        break;
                    case 19:
                        showAlert(data.operationErrors[0].description)
                        break;
                }
            }
        },
        error: function () {
            showAlert('خطا ! لطفا با ادمین سیستم تماس بگیرید');
        }
    });
}


function SendAgain() {

    $('#textotpCodeBox').addClass("hidden");
    $('.base-timer').removeClass("hidden");
    $('.base-timer__path-remaining.arc').css('color', '#49cf67');
    // Reset the timer
    //countdownTimer.reset();

    //// Restart the timer
    //countdownTimer.start();

    if (typeLoad === '5') {
        changeWaitForOTP(true)
    }

    // Clear any previous OTP input
    $('#otpInput').val('');
    sendOtpCodeSms(1);
}



// Utility function to format time
function formatTime(time) {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;

    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}





function clearInterval() {
    count = 0;
}

function display(val) {
    if (val < 10) {
        val = "0" + val;
    }
    else if (val == 10) {

    }
    $(".display").text(val);
}

var voterReferenceId;

function VerifiedOtp() {
    var CodeOtp = getOtpValue();
    if (CodeOtp === "") {
        $('.alertFild').html('کد ارسال شده را وارد نمایید.');
    }

    else {
        $.ajax({
            type: "POST",
            dataType: 'JSOn',
            url: '/Home/VerifyOtp',
            data: {
                MobileNumber: MobileNumber,
                EnteredOtp: toLatinDigits(CodeOtp),
                VoteRequestSmsId: ''
            },
            success: function (data) {
                if (data.success) {

                    forstarterVotepackage();
                    voterReferenceId = data.data;
                }
                else {

                    showAlert(data.operationErrors[0].description)
                }

                closeNumberPad();
            },
            error: function (data) {

                //  خطا! لطفا با ادمین سیستم تماس بگیرید
                showAlert('خطا! لطفا با ادمین سیستم تماس بگیرید')
            },
            complete: function () {
                if (typeLoad === '5') {

                    isWaitForOTP = false
                    cancelOtpTimeout()
                }
            }
        });
    }
}

function showAlert(textAlert) {
    $('.alert').addClass("show");
    $('.alert').removeClass("hide");
    $('.alert').addClass("showAlert");
    $('.alert .msg').empty();
    $('.alert .msg').append(textAlert);

    setTimeout(function () {
        $('.alert').removeClass("show");
        $('.alert').addClass("hide");
    }, 5000);
}


$('.close-btn').click(function () {
    $('.alert').removeClass("show");
    $('.alert').addClass("hide");

});
var OldNumber;
function editNumber() {
    $('.LoginStep2').addClass('d-none');
    $('.LoginStep1').removeClass('d-none');
    $('#CodeOtp').val('');
    $('.alertFild ').html('');
    OldNumber = $('#MobileNumberEnterByUser').html();
    OldNumber = (mobile * 1).toString();
    OldNumber = "98" + mobile;
    OldNumber = mobile.replace(/\D/g, '').trim();

}

function forstarterVotepackage(statusMandatory) {
    if (statusMandatory == 'NoMandatory') {
        setTimeout(function () {

            $(".LoginStep1").removeClass('Opacity1');
            $(".DataBox ").removeClass('start-animation');
            $(".DataBox ").removeClass('animationShow');
        }, 0);

        setTimeout(function () {


            $('.LoginStep2').addClass('d-none');
            $('.LoginStep1').addClass('d-none');
            $(".LoginStep1").addClass('Opacity0');
            $('.DataBox').addClass('animationShow');
            $('.DataBox').addClass('start-animation');
            $('.starterVotepackage').removeClass('d-none');
        }, 0);

    } else {
        setTimeout(function () {

            $(".LoginStep1").removeClass('Opacity1');
            $(".DataBox ").removeClass('start-animation');
            $(".DataBox ").removeClass('animationShow');
        }, 0);

        setTimeout(function () {

            $('.LoginStep2').addClass('d-none');
            $('.LoginStep1').addClass('d-none');
            $(".LoginStep1").addClass('Opacity0');
            $('.DataBox').addClass('animationShow');
            $('.DataBox').addClass('start-animation');
            $('.starterVotepackage').removeClass('d-none');
        }, 1200);

    }
}
function StartVotePackage() {

    $('#content').css("opacity", "1");
    $('.starterVotepackage').addClass('d-none');
    $('#votePackageBox').removeClass('d-none');
    $('#votePackageBox').addClass('slide-up');
    $('.DataBox ').addClass('height85');
    $('.StartPage').addClass('slide-up');
    $('.dataFirsPage').addClass('slide-up');
    $('#backToHomeBranch').addClass('d-none');
    const VotePackageReferenceIdFromSMS = $('#VotePackageReferenceId').val();

    $.ajax({
        type: "POST",
        dataType: 'JSOn',
        url: '/Home/FirstQuestion',
        data: {
            votePackageId: votePackageIdData,
            votePackageReferenceId: VotePackageReferenceIdFromSMS || votePackageReferenceId
        },

        success: function (data) {
            GetTypeQuestionAndLoadDetails(data)

            $("#questionText").empty();
            $("#questionText").append(' ' + data.data.voteQuestion.title + ' ');

            $("#infoQuestion").empty();
            var infoQuestion = data.data.voteQuestion.validationMessage;
            if (infoQuestion !== null) {
                $("#infoQuestion").append(' ' + data.data.voteQuestion.validationMessage + ' ');
            }

            $("#isMandatory").val('' + data.data.isMandatory + '');

            var thisQuestionNuber = currentStep + 1;
            thisQuestionNuber = toFarsiNumber(thisQuestionNuber);
            $(".CounterQuestion").empty();
            $(".CounterQuestion").append('' + thisQuestionNuber + '');

            var isMandatorySetStar = $('#isMandatory').val();

            if (isMandatorySetStar == "true") {
                $(".isMandatoryQuestion").removeClass('d-none');
            } else {
                $(".isMandatoryQuestion").addClass('d-none');
            }
        }
    });

}

//گرفتن کد سوال در پکیج و لود در قسمت جزییات نوع سوال
function GetTypeQuestionAndLoadDetails(data) {

    QuestionTypeId = data.data.voteQuestionTypeId;
    //QuestionTypeId = 12
    $('#DetailsQuestion').empty();
    $('#votePackageDetailId').empty();
    $('#votePackageDetailId').val(data.data.votePackageDetailId);
    $("#QuestionTypeIdthis").val(data.data.voteQuestionTypeId);
    $("#displayType").val(data.data.displayType);
    $("#isMandatory").val('');
    $("#isMandatory").val(data.data.isMandatory);
    votePackageDetailId = $('#votePackageDetailId').val(data.data.votePackageDetailId)

    switch (QuestionTypeId) {

        //انتخابی
        case 1:
            if (data.data.displayType == 2) {
                var items = data.data.voteQuestionItemDtoList || [];
                var questionTitle = data.data.title || "انتخاب کنید";
                var uniqueId = data.data.voteQuestionId || Math.floor(Math.random() * 10000);
                var selectionMode = data.data.upperLimitChosenCount > 1 ? "multiple" : "single";
                var isMultiple = data.data.upperLimitChosenCount > 1;
                var maxSelection = data.data.upperLimitChosenCount || "";
                var minSelection = data.data.lowerLimitChosenCount || "";
                var closeOnSelect = !isMultiple;
                var searchable = true;

                var placeholderText = isMultiple
                    ? "جستجو و انتخاب گزینه‌ها..."
                    : "جستجو و انتخاب گزینه...";

                var html = `
                <div class="mobile-combo-container"
                     id="container-${uniqueId}"
                     data-selection-mode="${selectionMode}"
                     data-max-selection="${maxSelection}"
                     data-min-selection="${minSelection}"
                     data-close-on-select="${closeOnSelect}"
                     data-searchable="${searchable}">
         

                    <div class="combo-trigger" id="trigger-${uniqueId}">
                        <span class="trigger-text" id="triggerText-${uniqueId}">${placeholderText}</span>
                        <span class="combo-arrow"></span>
                    </div>

                    <div class="combo-overlay" id="overlay-${uniqueId}"></div>

                    <div class="combo-sheet" id="sheet-${uniqueId}">
                        <div class="sheet-header">
                            <div class="sheet-handle"></div>

                            <div class="sheet-title-row">
                                <span class="sheet-title">${questionTitle}</span>
                                <button type="button" class="sheet-close" id="close-${uniqueId}">&times;</button>
                            </div>

                            ${searchable ? `
                            <div class="sheet-search-wrapper">
                                <input type="text"
                                       id="search-${uniqueId}"
                                       class="sheet-search-input"
                                       placeholder="${isMultiple ? 'چند گزینه را جستجو کنید...' : 'گزینه را جستجو کنید...'}"
                                       autocomplete="off">
                            </div>` : ""}

                            <div class="selection-hint" id="hint-${uniqueId}" style="display:none;"></div>
                        </div>

                        <div class="sheet-body">
                            <ul class="sheet-list" id="list-${uniqueId}">`;

                for (var i = 0; i < items.length; i++) {
                    html += `
                        <li class="sheet-option"
                            data-value="${items[i].voteQuestionItemId}"
                            data-label="${items[i].title}">
                            <div class="option-check ${isMultiple ? 'is-checkbox' : 'is-radio'}"></div>
                            <div class="option-info">
                                <span class="option-title">${items[i].title}</span>
                                ${items[i].imageUrl ? `<div class="option-image-wrapper"><img class="option-image" src="${items[i].imageUrl}" alt="${items[i].title}"><span class="option-zoom-icon">${zoomSvg}</span></div>` : ''}
                            </div>
                        </li>`;

                }

                html += `
                            </ul>
                            <div class="empty-state" id="empty-${uniqueId}" style="display:none;">موردی یافت نشد</div>
                        </div>
                    </div>

                    <div class="combo-tags" id="tags-${uniqueId}"></div>

                    <input type="hidden"
                           name="Answers[${uniqueId}].Value"
                           id="hidden-${uniqueId}"
                           class="combo-hidden-value" />
                </div>`;

                $('#DetailsQuestion').append(html);
                initMobileCombobox(uniqueId);
            } else {
                $('.LimitDataDetails').empty();

                if (data.data.upperLimitChosenCount > 1) {
                    for (var option = 0; option < data.data.voteQuestionItemDtoList.length; option++) {
                        var item = data.data.voteQuestionItemDtoList[option];
                        var imgSrc = item.imageUrl;
                        var titleHtml = item.title ? item.title : '';

                        $('#DetailsQuestion').append(
                            '<div class="inputGroup checkbox">' +
                            '<input class="multiType" id="voteQuestionItem' + option + '" name="voteQuestionItem" value="' + item.voteQuestionItemId + '" type="checkbox" />' +
                            '<label for="voteQuestionItem' + option + '">' +
                            titleHtml +
                            (imgSrc ?
                                '<div class="vote-option-image-wrapper">' +
                                '<img class="vote-option-image" src="' + imgSrc + '" alt="" />' +
                                '<span class="zoom-icon">' + zoomSvg + '</span>' +
                                '</div>' : '') +
                            '</label>' +
                            '</div>'
                        );
                    }
                } else {
                    for (var option = 0; option < data.data.voteQuestionItemDtoList.length; option++) {
                        var item = data.data.voteQuestionItemDtoList[option];
                        var imgSrc = item.imageUrl;
                        var titleHtml = item.title ? item.title : '';
                        
                        $('#DetailsQuestion').append(
                            '<div class="inputGroup">' +
                            '<input id="voteQuestionItem' + option + '" name="voteQuestionItem" value="' + item.voteQuestionItemId + '" type="radio" />' +
                            '<label for="voteQuestionItem' + option + '">' +
                            titleHtml +
                            (imgSrc ?
                                '<div class="vote-option-image-wrapper">' +
                                '<img class="vote-option-image" src="' + imgSrc + '" alt="" />' +
                                '<span class="zoom-icon">' + zoomSvg + '</span>' +
                                '</div>' : '') +
                            '</label>' +
                            '</div>'
                        );
                    }
                }




                $('.LimitDataDetails').append('<input id="voteQuestionItemMin" value="' + data.data.lowerLimitChosenCount + '" type="hidden" /> <input id="voteQuestionItemMax" value="' + data.data.upperLimitChosenCount + '" type="hidden" />')
            }

            break;
        case 2:

            break;
        //عددی
        case 3:
            $('#DetailsQuestion').append('<div class="FormInputs"><input class="inputFild" min="' + data.data.lowerLimitNumericValue + '" max="' + data.data.upperLimitNumericValue + '" type="number" placeholder="ورود عدد"  onkeydown="if(event.keyCode == 13) eventHandlerFunc(event)" id="getNumber" name="getNumber" /><div class="material-form__focus-animation"></div><p class="error-text hidden">'
                + data.data.voteQuestion.validationMessage + '</p></div>');
            break;
        //تشریحی
        case 4:

            $('#DetailsQuestion').append('<div class="FormInputs"><textarea class="inputFildText" type="text" placeholder="" rows="4"  onkeydown="if(event.keyCode == 13) eventHandlerFunc(event)" id="textAreaDec" oninput="CountContentChar(this,' + data.data.stringMaxLength + ')" maxlength="' + data.data.stringMaxLength + '"> </textarea><div class="material-form__focus-animation"></div><p class="error-text hidden">'
                + data.data.voteQuestion.validationMessage + '</p></div>');

            $('#DetailsQuestion').append('<div id="charCount">' + data.data.stringMaxLength + ' /  0 </div>')

            break;

        //تاریخی
        case 5:

            $('#DetailsQuestion').append('<div class="FormInputs"><input class="inputFild" type="text" placeholder="انتخاب تاریخ"  data-jdp data-jdp-min-date="'
                + data.data.lowerLimitDateValue + '" data-jdp-max-date="' + data.data.upperLimitDateValue + '" data-jdp-only-date id="getDate" /><div class="material-form__focus-animation"></div><p class="error-text hidden">'
                + data.data.voteQuestion.validationMessage + '</p></div>');

            break;

        //ورودی معتبر
        case 6:
            $('#DetailsQuestion').append('<div class="FormInputs"><input class="inputFild"  type="text" pattern="'
                + data.data.voteQuestion.inputPatternList.pattern + '" placeholder="' + data.data.voteQuestion.inputPatternList.title + '" onkeydown="if(event.keyCode == 13) eventHandlerFunc(event)" id="textAreaDec" onkeydown="myFunction()" /><div class="material-form__focus-animation"></div><p class="error-text hidden">'
                + data.data.voteQuestion.validationMessage + '</p></div>');

            break;

        //star
        case 10:
            if (data.data.upperLimitNumericValue == 3) {
                $('#DetailsQuestion').append('<div class= "starRating" ><div class="stars"><form action=""><input class="star star-3"  value="3" id="star-3" type="radio" name="star" /><label class="star star-3" for="star-3"></label><input class="star star-2"  value="2" id="star-2" type="radio" name="star" /><label class="star star-2" for="star-2"></label><input class="star star-1"  value="1" id="star-1" type="radio" name="star" /><label class="star star-1" for="star-1"></label></form></div></div > ');
            }
            if (data.data.upperLimitNumericValue == 5) {
                $('#DetailsQuestion').append('<div class= "starRating" ><div class="stars"><form action=""><input class="star star-5" id="star-5" value="5" type="radio" name="star" /><label class="star star-5" for="star-5"></label><input class="star star-4" id="star-4" value="4" type="radio" name="star" /><label class="star star-4" for="star-4"></label><input class="star star-3"  value="3" id="star-3" type="radio" name="star" /><label class="star star-3" for="star-3"></label><input class="star star-2"  value="2" id="star-2" type="radio" name="star" /><label class="star star-2" for="star-2"></label><input class="star star-1"  value="1" id="star-1" type="radio" name="star" /><label class="star star-1" for="star-1"></label></form></div></div > ');
            }
            break;
        //range
        case 11:
            var ToFaUpperLimitNumericValue = toFarsiNumber(data.data.upperLimitNumericValue);
            var ToFaLowerLimitNumericValue = toFarsiNumber(data.data.lowerLimitNumericValue);
            $('#DetailsQuestion').append('<div class="Rangeslider"><span class="range-slider "><input class="slider" id="rangevalueInput" data-default-unset="true" value="" min="'
                + data.data.lowerLimitNumericValue + '" max="'
                + data.data.upperLimitNumericValue + '" name="rangeslider" type="range" oninput="updateSlider(this)"><span class="slider-container"><span class="bar persian-digits"><span style="width: 0%;"></span></span><span class="bar-btn" style="right: 0%;"><span></span></span></span></span><div class="minMaxNumber"><div class="minnumber">'
                + ToFaLowerLimitNumericValue + '</div> <div class="maxnumber">'
                + ToFaUpperLimitNumericValue + '</div></div></div><span class="alertRageSlider">برای انتخاب، نشانه را حرکت دهید</span>');

            break;

        // case 12: combo box با قابلیت multi-select و سرچ
        case 12:
            var items = data.data.dataSourceItemDtoList || [];
            var questionTitle = data.data.title || "انتخاب کنید";
            var uniqueId = data.data.voteQuestionId || Math.floor(Math.random() * 10000);
            var selectionMode = (data.data.selectionMode || "single").toLowerCase();
            var isMultiple = data.data.upperLimitChosenCount > 1;
            var maxSelection = data.data.upperLimitChosenCount || "";
            var minSelection = data.data.lowerLimitChosenCount || "";
            var closeOnSelect = !isMultiple;
            var searchable = true;

            var placeholderText = isMultiple
                ? "جستجو و انتخاب گزینه‌ها..."
                : "جستجو و انتخاب گزینه...";

            var html = `
                <div class="mobile-combo-container"
                     id="container-${uniqueId}"
                     data-selection-mode="${selectionMode}"
                     data-max-selection="${maxSelection}"
                     data-min-selection="${minSelection}"
                     data-close-on-select="${closeOnSelect}"
                     data-searchable="${searchable}">
         

                    <div class="combo-trigger" id="trigger-${uniqueId}">
                        <span class="trigger-text" id="triggerText-${uniqueId}">${placeholderText}</span>
                        <span class="combo-arrow"></span>
                    </div>

                    <div class="combo-overlay" id="overlay-${uniqueId}"></div>

                    <div class="combo-sheet" id="sheet-${uniqueId}">
                        <div class="sheet-header">
                            <div class="sheet-handle"></div>

                            <div class="sheet-title-row">
                                <span class="sheet-title">${questionTitle}</span>
                                <button type="button" class="sheet-close" id="close-${uniqueId}">&times;</button>
                            </div>

                            ${searchable ? `
                            <div class="sheet-search-wrapper">
                                <input type="text"
                                       id="search-${uniqueId}"
                                       class="sheet-search-input"
                                       placeholder="${isMultiple ? 'چند گزینه را جستجو کنید...' : 'گزینه را جستجو کنید...'}"
                                       autocomplete="off">
                            </div>` : ""}

                            <div class="selection-hint" id="hint-${uniqueId}" style="display:none;"></div>
                        </div>

                        <div class="sheet-body">
                            <ul class="sheet-list" id="list-${uniqueId}">`;

            for (var i = 0; i < items.length; i++) {
                html += `
                        <li class="sheet-option"
                            data-value="${items[i].dataSourceItemId}"
                            data-label="${items[i].title}">

                            <div class="option-check ${isMultiple ? 'is-checkbox' : 'is-radio'}"></div>

                            <div class="option-info">
                                <span class="option-title">${items[i].title}</span>
                                ${items[i].imageUrl ? `<div class="option-image-wrapper"><img class="option-image" src="${items[i].imageUrl}" alt="${items[i].title}"><span class="option-zoom-icon">${zoomSvg}</span></div>` : ''}
                            </div>
                        </li>`;
            }

            html += `
                            </ul>
                            <div class="empty-state" id="empty-${uniqueId}" style="display:none;">موردی یافت نشد</div>
                        </div>
                    </div>

                    <div class="combo-tags" id="tags-${uniqueId}"></div>

                    <input type="hidden"
                           name="Answers[${uniqueId}].Value"
                           id="hidden-${uniqueId}"
                           class="combo-hidden-value" />
                </div>`;

            $('#DetailsQuestion').append(html);
            initMobileCombobox(uniqueId);
            break;


        default:
    }
}

// باز کردن مودال روی کلیک عکس
$(document).on('click', '.zoom-icon', function (e) {
    e.preventDefault();
    var src = $(this).closest('.vote-option-image-wrapper').find('.vote-option-image').attr('src');
    $('#imgModalSrc').attr('src', src);
    $('#imgModal').addClass('is-open');
});

$(document).on('click', '.option-image-wrapper', function (e) {
    e.preventDefault();
    e.stopPropagation();
    var $wrapper = $(this).hasClass('option-image-wrapper')
        ? $(this)
        : $(this).closest('.option-image-wrapper');

    var src = $wrapper.find('.option-image').attr('src');

    if (!src) return;

    $('#imgModalSrc').attr('src', src);
    $('#imgModal').addClass('is-open');
});



$('#imgModalClose').on('click', function () {
    $('#imgModal').removeClass('is-open');
});

$('#imgModal').on('click', function (e) {
    if (e.target === this) $(this).removeClass('is-open');
});

$(document).on('keydown', function (e) {
    if (e.key === 'Escape') $('#imgModal').removeClass('is-open');
});


function initMobileCombobox(id, initialItems) {
    const $container = $('#container-' + id);
    const $trigger = $('#trigger-' + id);
    const $sheet = $('#sheet-' + id);
    const $overlay = $('#overlay-' + id);
    const $search = $('#search-' + id);
    const $list = $('#list-' + id);
    const $hidden = $('#hidden-' + id);
    const $tags = $('#tags-' + id);
    const $close = $('#close-' + id);
    const $triggerText = $('#triggerText-' + id);
    const $empty = $('#empty-' + id);
    const $hint = $('#hint-' + id);

    const selectionMode = String($container.data('selection-mode') || 'single').toLowerCase();
    const isMultiple = selectionMode === 'multiple';

    const rawMinSelection = $container.data('min-selection');
    const minSelection = rawMinSelection !== undefined && rawMinSelection !== null && rawMinSelection !== ''
        ? parseInt(rawMinSelection, 10)
        : null;

    const rawMaxSelection = $container.data('max-selection');
    const maxSelection = rawMaxSelection !== undefined && rawMaxSelection !== null && rawMaxSelection !== ''
        ? parseInt(rawMaxSelection, 10)
        : null;

    const rawCloseOnSelect = String($container.data('close-on-select')).toLowerCase();
    const closeOnSelect = rawCloseOnSelect === 'true';

    const rawSearchable = String($container.data('searchable')).toLowerCase();
    const searchable = rawSearchable !== 'false';

    const singlePlaceholder = 'جستجو و انتخاب گزینه...';
    const multiPlaceholder = 'جستجو و انتخاب گزینه‌ها...';

    let selectedItems = Array.isArray(initialItems) ? initialItems : [];

    function openSheet() {
        $overlay.fadeIn(180);
        $sheet.addClass('active');
        $('body').css('overflow', 'hidden');

        if (searchable && $search.length) {
            setTimeout(function () {
                $search.trigger('focus');
            }, 220);
        }

        updateHint();
    }

    function closeSheet() {
        $sheet.removeClass('active');
        $overlay.fadeOut(180);
        $('body').css('overflow', '');

        if (searchable && $search.length) {
            $search.val('');
            filterOptions('');
        }

        hideHint();
    }

    function showHint(message) {
        if (!message) return;
        $hint.text(message).stop(true, true).fadeIn(150);
    }

    function hideHint() {
        $hint.stop(true, true).fadeOut(150).text('');
    }

    function updateHint() {
        if (!isMultiple) {
            hideHint();
            return;
        }

        const count = selectedItems.length;

        if (maxSelection && count >= maxSelection) {
            showHint('حداکثر ' + maxSelection + ' مورد قابل انتخاب است');
            return;
        }

        if (minSelection && count < minSelection) {
            showHint('حداقل ' + minSelection + ' مورد باید انتخاب شود');
            return;
        }

        if (minSelection && maxSelection) {
            showHint('حداقل ' + minSelection + ' و حداکثر ' + maxSelection + ' مورد قابل انتخاب است');
            return;
        }

        if (minSelection) {
            showHint('حداقل ' + minSelection + ' مورد باید انتخاب شود');
            return;
        }

        if (maxSelection) {
            showHint('حداکثر ' + maxSelection + ' مورد قابل انتخاب است');
            return;
        }

        hideHint();
    }

    function filterOptions(query) {
        query = (query || '').toLowerCase().trim();
        let hasResult = false;

        $list.find('.sheet-option').each(function () {
            const $option = $(this);
            const text = String($option.data('label') || '').toLowerCase();
            const matched = text.indexOf(query) > -1;

            $option.toggle(matched);
            if (matched) hasResult = true;
        });

        $empty.toggle(!hasResult);
    }

    function syncOptionSelectionState() {
        $list.find('.sheet-option').each(function () {
            const $option = $(this);
            const val = String($option.data('value'));

            const isSelected = selectedItems.some(function (item) {
                return item.val === val;
            });

            $option.toggleClass('selected', isSelected);
        });
    }

    function updateUI() {
        $tags.empty();

        if (isMultiple) {
            const values = selectedItems.map(function (item) {
                return item.val;
            });

            $hidden.val(values.join(','));

            selectedItems.forEach(function (item) {
                const $tag = $(`
                    <span class="m-tag">
                        ${item.label}
                        <i class="remove-tag" data-val="${item.val}">&times;</i>
                    </span>
                `);
                $tags.append($tag);
            });

            if (selectedItems.length > 0) {
                $trigger.addClass('has-value');
                $triggerText.text(selectedItems.length + ' مورد انتخاب شد');
            } else {
                $trigger.removeClass('has-value');
                $triggerText.text(multiPlaceholder);
            }
        } else {
            const selected = selectedItems.length ? selectedItems[0] : null;

            $hidden.val(selected ? selected.val : '');
            $tags.empty();

            if (selected) {
                $trigger.addClass('has-value');
                $triggerText.text(selected.label);
            } else {
                $trigger.removeClass('has-value');
                $triggerText.text(singlePlaceholder);
            }
        }

        syncOptionSelectionState();
        updateHint();
    }

    function selectSingle(val, label) {
        selectedItems = [{ val: val, label: label }];
        updateUI();

        if (closeOnSelect) {
            closeSheet();
        }
    }

    function toggleMultiple(val, label) {
        console.log('val',val)
        console.log('selectedItems', selectedItems)
        const exists = selectedItems.some(function (item) {
            return item.val === val;
        });

        if (exists) {
            selectedItems = selectedItems.filter(function (item) {
                return item.val !== val;
            });
            updateUI();
            return;
        }

        if (maxSelection && selectedItems.length >= maxSelection) {
            showHint('فقط ' + maxSelection + ' مورد می‌توانید انتخاب کنید');
            return;
        }

        selectedItems.push({ val: val, label: label });
        updateUI();

        if (closeOnSelect) {
            closeSheet();
        }
    }

    $trigger.on('click', openSheet);
    $close.on('click', closeSheet);
    $overlay.on('click', closeSheet);

    if (searchable && $search.length) {
        $search.on('input', function () {
            filterOptions($(this).val());
        });
    }

    $list.on('click', '.sheet-option', function (e) {
        if ($(e.target).closest('.option-image-wrapper').length) {
            return;
        }

        const $option = $(this);
        const val = String($option.data('value') || '');
        const label = String($option.data('label') || '');
        console.log('isMultiple', isMultiple)
        if (isMultiple) {
            toggleMultiple(val, label);
        } else {
            selectSingle(val, label);
        }
    });


    $tags.on('click', '.remove-tag', function (e) {
        e.stopPropagation();

        if (!isMultiple) return;

        const val = String($(this).data('val') || '');

        selectedItems = selectedItems.filter(function (item) {
            return item.val !== val;
        });

        updateUI();
    });

    updateUI();
}


document.addEventListener("DOMContentLoaded", function () {
    const mobileInput = document.getElementById("MobileNumber");
    if (!mobileInput) return;

    // ۱. فیلتر کردن ورودی با استفاده از تابع isNumberKey موجود شما
    mobileInput.addEventListener("keypress", function (evt) {
        if (typeof isNumberKey === "function") {
            const isValid = isNumberKey(evt);
            if (!isValid) {
                evt.preventDefault();
            }
        }
    });

    // ۲. تبدیل در لحظه اعداد به فارسی
    mobileInput.addEventListener("input", function () {
        this.value = toPersianDigits(this.value);
    });

    // ۳. مدیریت رویدادهای کلیک و کیبورد بر اساس نوع اینپوت
    if (mobileInput.classList.contains("mobile-input-type-qr")) {
        // برای حالت QRTerminal
        mobileInput.addEventListener("click", function () {
            if (typeof toggleNumberPad === "function") {
                toggleNumberPad();
            }
        });
    } else {
        // برای حالت SMS و Default
        mobileInput.addEventListener("keydown", function (event) {
            if (event.key === "Enter" || event.keyCode === 13) {
                if (typeof eventHandlersendOtpCode === "function") {
                    eventHandlersendOtpCode(event);
                }
            }
        });
    }
});


function eventHandlerFunc(event) {
    event.preventDefault();
    $('#nextBtn').click();
}
function eventHandlersendOtpCode(event) {
    event.preventDefault();
    sendOtpCode();
}
function eventHandlerVerifiedOtp(event) {
    event.preventDefault();
    VerifiedOtp();
}
function isNumberKey(evt) {
    var charCode = (evt.which) ? evt.which : evt.keyCode
    if (charCode > 31 && (charCode < 48 || charCode > 57))
        return false;
    return true;
}

function GetIdQuestionAndLoadAnswear(getTypeForAnwesr, CurrentQuestion, data) {
    switch (getTypeForAnwesr) {

        //انتخابی
        case 1:
            if (data.data.displayType == 2) {
                $('#DetailsQuestion').empty();
                var items = data.data.voteQuestionItemDtoList || [];
                var questionTitle = data.data.title || "انتخاب کنید";
                var uniqueId = data.data.voteQuestionId || Math.floor(Math.random() * 10000);

                // تنظیمات بر اساس دیتای سرور
                var selectionMode = data.data.upperLimitChosenCount > 1 ? "multiple" : "single";
                var isMultiple = selectionMode === "multiple";
                var maxSelection = data.data.upperLimitChosenCount || "";
                var closeOnSelect = !isMultiple;
                var searchable = true;

                // استخراج پاسخ‌های قبلی
                var preSelectedItems = [];
                var preSelectedIds = [];
                if (CurrentQuestion && CurrentQuestion.VoteAnswerDetailQuestionItem.length) {
                    for (var j = 0; j < CurrentQuestion.VoteAnswerDetailQuestionItem.length; j++) {
                        var sId = CurrentQuestion.VoteAnswerDetailQuestionItem[j].VoteQuestionItemId;
                        preSelectedIds.push(String(sId));

                        // پیدا کردن متن گزینه برای نمایش در تگ‌ها
                        var foundItem = items.find(function (i) { return i.voteQuestionItemId == sId; });
                        if (foundItem) {
                            preSelectedItems.push({ val: sId, label: foundItem.title });
                        }
                    }
                }

                var placeholderText = isMultiple ? "جستجو و انتخاب گزینه‌ها..." : "جستجو و انتخاب گزینه...";

                // ایجاد HTML (همان ساختار قبلی با مقادیر اولیه)
                var html = `
                <div class="mobile-combo-container" 
                     id="container-${uniqueId}" 
                     data-selection-mode="${selectionMode}" 
                     data-max-selection="${maxSelection}"
                     data-close-on-select="${closeOnSelect}"
                     data-searchable="${searchable}">
         
                    <div class="combo-trigger" id="trigger-${uniqueId}">
                        <span class="trigger-text" id="triggerText-${uniqueId}">${placeholderText}</span>
                        <span class="combo-arrow"></span>
                    </div>
                    <div class="combo-overlay" id="overlay-${uniqueId}"></div>
                    <div class="combo-sheet" id="sheet-${uniqueId}">
                        <div class="sheet-header">
                            <div class="sheet-handle"></div>
                            <div class="sheet-title-row">
                                <span class="sheet-title">${questionTitle}</span>
                                <button type="button" class="sheet-close" id="close-${uniqueId}">&times;</button>
                            </div>
                            ${searchable ? `<div class="sheet-search-wrapper"><input type="text" id="search-${uniqueId}" class="sheet-search-input" placeholder="جستجو..." autocomplete="off"></div>` : ""}
                            <div class="selection-hint" id="hint-${uniqueId}" style="display:none;"></div>
                        </div>
                        <div class="sheet-body">
                            <ul class="sheet-list" id="list-${uniqueId}">`;

                for (var i = 0; i < items.length; i++) {
                    var isSelected = preSelectedIds.indexOf(String(items[i].voteQuestionItemId)) > -1;
                    
                    html += `
                        <li class="sheet-option ${isSelected ? 'selected' : ''}" 
                            data-value="${items[i].voteQuestionItemId}" 
                            data-label="${items[i].title}">
                            <div class="option-check ${isMultiple ? 'is-checkbox' : 'is-radio'}"></div>

                            <div class="option-info">
                                <span class="option-title">${items[i].title}</span>
                                ${items[i].imageUrl ? `<div class="option-image-wrapper"><img class="option-image" src="${items[i].imageUrl}" alt="${items[i].title}"><span class="option-zoom-icon">${zoomSvg}</span></div>` : ''}
                            </div>
                        </li>`;
                }

                html += `
                            </ul>
                            <div class="empty-state" id="empty-${uniqueId}" style="display:none;">موردی یافت نشد</div>
                        </div>
                    </div>
                    <div class="combo-tags" id="tags-${uniqueId}"></div>
                    <input type="hidden" name="Answers[${uniqueId}].Value" id="hidden-${uniqueId}" class="combo-hidden-value" value="${preSelectedIds.join(',')}" />
                </div>`;

                $('#DetailsQuestion').append(html);

                // فراخوانی تابع Init با داده‌های لود شده
                initMobileCombobox(uniqueId, preSelectedItems);
            } else {
                $('#DetailsQuestion').empty();

                if (data.data.upperLimitChosenCount > 1) {
                    for (var option = 0; option < data.data.voteQuestionItemDtoList.length; option++) {
                        $('#DetailsQuestion').append(' <div class="inputGroup checkbox"><input class="multiType" id="voteQuestionItem' + option + '" name="voteQuestionItem" value="'
                            + data.data.voteQuestionItemDtoList[option].voteQuestionItemId + '" type="checkbox" /><label for="voteQuestionItem' + option + '"> '
                            + data.data.voteQuestionItemDtoList[option].title + (data.data.voteQuestionItemDtoList[option].imageUrl ?
                                '<div class="vote-option-image-wrapper">' +
                            '<img class="vote-option-image" src="' + data.data.voteQuestionItemDtoList[option].imageUrl + '" alt="" />' +
                                '<span class="zoom-icon">' + zoomSvg + '</span>' +
                                '</div>' : '') + '  </label></div > ');

                        for (var ItemSelected = 0; ItemSelected < CurrentQuestion.VoteAnswerDetailQuestionItem.length; ItemSelected++) {

                            var ThisChecked = CurrentQuestion.VoteAnswerDetailQuestionItem[ItemSelected].VoteQuestionItemId;

                            if (ThisChecked == data.data.voteQuestionItemDtoList[option].voteQuestionItemId) {
                                $('input#voteQuestionItem' + option + '').prop('checked', true);
                            }
                        }
                    }
                }
                else {

                    for (var option = 0; option < data.data.voteQuestionItemDtoList.length; option++) {
                        if (CurrentQuestion.VoteAnswerDetailQuestionItem.length !== 0) {
                            if (CurrentQuestion.VoteAnswerDetailQuestionItem[0].VoteQuestionItemId == data.data.voteQuestionItemDtoList[option].voteQuestionItemId) {
                                $('#DetailsQuestion').append(' <div class="inputGroup"><input id="voteQuestionItem' + option + '" name="voteQuestionItem" value="'
                                    + data.data.voteQuestionItemDtoList[option].voteQuestionItemId + '" type="radio" checked="checked" /><label for="voteQuestionItem' + option + '"> '
                                    + data.data.voteQuestionItemDtoList[option].title + (data.data.voteQuestionItemDtoList[option].imageUrl ?
                                        '<div class="vote-option-image-wrapper">' +
                                    '<img class="vote-option-image" src="' + data.data.voteQuestionItemDtoList[option].imageUrl + '" alt="" />' +
                                        '<span class="zoom-icon">' + zoomSvg + '</span>' +
                                        '</div>' : '') + '  </label></div > ');
                            }
                            else {
                                $('#DetailsQuestion').append(' <div class="inputGroup"><input id="voteQuestionItem' + option + '" name="voteQuestionItem" value="'
                                    + data.data.voteQuestionItemDtoList[option].voteQuestionItemId + '" type="radio" /><label for="voteQuestionItem' + option + '"> '
                                    + data.data.voteQuestionItemDtoList[option].title + (data.data.voteQuestionItemDtoList[option].imageUrl ?
                                        '<div class="vote-option-image-wrapper">' +
                                    '<img class="vote-option-image" src="' + data.data.voteQuestionItemDtoList[option].imageUrl + '" alt="" />' +
                                        '<span class="zoom-icon">' + zoomSvg + '</span>' +
                                        '</div>' : '') + '  </label></div > ');
                            }
                        } else {


                            if (data.data.upperLimitChosenCount > 1) {
                                for (var option = 0; option < data.data.voteQuestionItemDtoList.length; option++) {
                                    $('#DetailsQuestion').append(' <div class="inputGroup checkbox"><input class="multiType" id="voteQuestionItem' + option + '" name="voteQuestionItem" value="'
                                        + data.data.voteQuestionItemDtoList[option].voteQuestionItemId + '" type="checkbox" /><label for="voteQuestionItem' + option + '"> '
                                        + data.data.voteQuestionItemDtoList[option].title + (data.data.voteQuestionItemDtoList[option].imageUrl ?
                                            '<div class="vote-option-image-wrapper">' +
                                        '<img class="vote-option-image" src="' + data.data.voteQuestionItemDtoList[option].imageUrl + '" alt="" />' +
                                            '<span class="zoom-icon">' + zoomSvg + '</span>' +
                                            '</div>' : '') + '  </label></div > ');

                                }
                            } else {
                                for (var option = 0; option < data.data.voteQuestionItemDtoList.length; option++) {
                                    $('#DetailsQuestion').append(' <div class="inputGroup"><input id="voteQuestionItem' + option + '" name="voteQuestionItem" value="'
                                        + data.data.voteQuestionItemDtoList[option].voteQuestionItemId + '" type="radio" /><label for="voteQuestionItem' + option + '"> '
                                        + data.data.voteQuestionItemDtoList[option].title + (data.data.voteQuestionItemDtoList[option].imageUrl ?
                                            '<div class="vote-option-image-wrapper">' +
                                        '<img class="vote-option-image" src="' + data.data.voteQuestionItemDtoList[option].imageUrl + '" alt="" />' +
                                            '<span class="zoom-icon">' + zoomSvg + '</span>' +
                                            '</div>' : '') + '  </label></div > ');
                                }
                            }

                        }

                    }
                }
                $('.LimitDataDetails').append('<input id="voteQuestionItemMin" value="' + data.data.lowerLimitChosenCount + '" type="hidden" /> <input id="voteQuestionItemMax" value="' + data.data.upperLimitChosenCount + '" type="hidden" />')
            }
            break;
        case 2:

            break;
        //عددی
        case 3:
            $('#DetailsQuestion').empty();
            $('#DetailsQuestion').append('<div class="FormInputs"><input class="inputFild" min="'
                + data.data.lowerLimitNumericValue + '" max="'
                + data.data.upperLimitNumericValue + '" type="number" placeholder="ورود عدد "  id="getNumber" name="getNumber" value="'
                + CurrentQuestion.ValueNumeric + '" /><div class="material-form__focus-animation"></div><p class="error-text hidden">'
                + data.data.voteQuestion.validationMessage + '</p></div>');

            break;
        //تشریحی
        case 4:
            $('#DetailsQuestion').empty();
            $('#DetailsQuestion').append('<div class="FormInputs"><textarea class="inputFildText" type="text" placeholder="" rows="4" id="textAreaDec" oninput="CountContentChar(this,'
                + data.data.stringMaxLength + ')" maxlength="' + data.data.stringMaxLength + '"> </textarea><div class="material-form__focus-animation"></div><p class="error-text hidden">'
                + data.data.voteQuestion.validationMessage + '</p></div>');
            $('#textAreaDec').val(CurrentQuestion.ValueString)
            $('#DetailsQuestion').append('<div id="charCount">' + data.data.stringMaxLength + ' /  ' + CurrentQuestion.ValueString.length + ' </div>')

            break;

        //تاریخی
        case 5:
            $('#DetailsQuestion').empty();
            $('#DetailsQuestion').append('<div class="FormInputs"><input class="inputFild" type="text" placeholder="انتخاب تاریخ"  data-jdp data-jdp-min-date="'
                + data.data.lowerLimitDateValue + '" data-jdp-max-date="' + data.data.upperLimitDateValue + '" data-jdp-only-date id="getDate" value="'
                + CurrentQuestion.ValueDateTime + '" /><div class="material-form__focus-animation"></div><p class="error-text hidden">'
                + data.data.voteQuestion.validationMessage + '</p></div>');

            break;

        //ورودی معتبر
        case 6:
            $('#DetailsQuestion').empty();
            $('#DetailsQuestion').append('<div class="FormInputs"><input class="inputFild"  type="text" pattern="'
                + data.data.voteQuestion.inputPatternList.pattern + '" placeholder="' + data.data.voteQuestion.inputPatternList.title + '"  id="textAreaDec" value="'
                + CurrentQuestion.ValueString + '" /><div class="material-form__focus-animation"></div><p class="error-text hidden">'
                + data.data.voteQuestion.validationMessage + '</p></div>');

            break;

        //star
        case 10:
            $('#DetailsQuestion').empty();
            var valueSelect = CurrentQuestion.ValueNumeric;
            if (data.data.upperLimitNumericValue == 3) {
                $('#DetailsQuestion').append('<div class= "starRating" ><div class="stars"><form action=""><input class="star star-3"  value="3" id="star-3" type="radio" name="star" /><label class="star star-3" for="star-3"></label><input class="star star-2"  value="2" id="star-2" type="radio" name="star" /><label class="star star-2" for="star-2"></label><input class="star star-1"  value="1" id="star-1" type="radio" name="star" /><label class="star star-1" for="star-1"></label></form></div></div > ');
                $('input#star-' + option + '').prop('checked', true);

            }
            if (data.data.upperLimitNumericValue == 5) {
                $('#DetailsQuestion').append('<div class= "starRating" ><div class="stars"><form action=""><input class="star star-5" id="star-5" value="5" type="radio" name="star" /><label class="star star-5" for="star-5"></label><input class="star star-4" id="star-4" value="4" type="radio" name="star" /><label class="star star-4" for="star-4"></label><input class="star star-3"  value="3" id="star-3" type="radio" name="star" /><label class="star star-3" for="star-3"></label><input class="star star-2"  value="2" id="star-2" type="radio" name="star" /><label class="star star-2" for="star-2"></label><input class="star star-1"  value="1" id="star-1" type="radio" name="star" /><label class="star star-1" for="star-1"></label></form></div></div > ');
                $('input#star-' + valueSelect + '').prop('checked', true);
            }

            break;

        case 11:
            $('#DetailsQuestion').empty();
            var valueSelect = CurrentQuestion.ValueNumeric;
            $('#DetailsQuestion').append('<div class="Rangeslider"><span class= "range-slider" ><input class="slider" id="rangevalueInput" value="'
                + CurrentQuestion.ValueNumeric + '" min="'
                + data.data.lowerLimitNumericValue + '" max="'
                + data.data.upperLimitNumericValue + '" name="rangeslider" type="range" oninput="updateSlider(this)"><span class="slider-container"><span class="bar"><span style="width: '
                + ((valueSelect * 100) / ((data.data.upperLimitNumericValue) - (data.data.lowerLimitNumericValue))) + '%;"></span></span><span class="bar-btn" style="right: '
                + ((valueSelect * 100) / ((data.data.upperLimitNumericValue) - (data.data.lowerLimitNumericValue))) + '%;"><span>'
                + CurrentQuestion.ValueNumeric + '</span></span></span></span><div class="minMaxNumber"><div class="minnumber">'
                + data.data.lowerLimitNumericValue + '</div> <div class="maxnumber">'
                + data.data.upperLimitNumericValue + '</div></div></div> '
            );


            break;

        case 12:
            $('#DetailsQuestion').empty();
            var items = data.data.dataSourceItemDtoList || [];
            var questionTitle = data.data.title || "انتخاب کنید";
            var uniqueId = data.data.voteQuestionId || Math.floor(Math.random() * 10000);
            var config = data.data.config || {};

            // تنظیمات بر اساس دیتای سرور
            var selectionMode = (config.selectionMode || "single").toLowerCase();
            var isMultiple = selectionMode === "multiple";
            var maxSelection = config.maxSelection || "";
            var closeOnSelect = typeof config.closeOnSelect === "boolean" ? config.closeOnSelect : !isMultiple;
            var searchable = typeof config.searchable === "boolean" ? config.searchable : true;

            // استخراج پاسخ‌های قبلی
            var preSelectedItems = [];
            var preSelectedIds = [];
            if (CurrentQuestion && CurrentQuestion.DataSourceItemId) {
                //for (var j = 0; j < CurrentQuestion.VoteAnswerDetailQuestionItem.length; j++) {
                var sId = CurrentQuestion.DataSourceItemId;
                preSelectedIds.push(String(sId));

                // پیدا کردن متن گزینه برای نمایش در تگ‌ها
                var foundItem = items.find(function (i) { return i.dataSourceItemId == sId; });
                if (foundItem) {
                    preSelectedItems.push({ val: sId, label: foundItem.title });
                }
                //}
            }

            var placeholderText = isMultiple ? "جستجو و انتخاب گزینه‌ها..." : "جستجو و انتخاب گزینه...";

            // ایجاد HTML (همان ساختار قبلی با مقادیر اولیه)
            var html = `
                <div class="mobile-combo-container" 
                     id="container-${uniqueId}" 
                     data-selection-mode="${selectionMode}" 
                     data-max-selection="${maxSelection}"
                     data-close-on-select="${closeOnSelect}"
                     data-searchable="${searchable}">
         
                    <div class="combo-trigger" id="trigger-${uniqueId}">
                        <span class="trigger-text" id="triggerText-${uniqueId}">${placeholderText}</span>
                        <span class="combo-arrow"></span>
                    </div>
                    <div class="combo-overlay" id="overlay-${uniqueId}"></div>
                    <div class="combo-sheet" id="sheet-${uniqueId}">
                        <div class="sheet-header">
                            <div class="sheet-handle"></div>
                            <div class="sheet-title-row">
                                <span class="sheet-title">${questionTitle}</span>
                                <button type="button" class="sheet-close" id="close-${uniqueId}">&times;</button>
                            </div>
                            ${searchable ? `<div class="sheet-search-wrapper"><input type="text" id="search-${uniqueId}" class="sheet-search-input" placeholder="جستجو..." autocomplete="off"></div>` : ""}
                            <div class="selection-hint" id="hint-${uniqueId}" style="display:none;"></div>
                        </div>
                        <div class="sheet-body">
                            <ul class="sheet-list" id="list-${uniqueId}">`;

            for (var i = 0; i < items.length; i++) {
                var isSelected = preSelectedIds.indexOf(String(items[i].dataSourceItemId)) > -1;
                html += `
                        <li class="sheet-option ${isSelected ? 'selected' : ''}" 
                            data-value="${items[i].dataSourceItemId}" 
                            data-label="${items[i].title}">
                            <div class="option-check ${isMultiple ? 'is-checkbox' : 'is-radio'}"></div>

                            <div class="option-info">
                                <span class="option-title">${items[i].title}</span>
                                ${items[i].imageUrl ? `<div class="option-image-wrapper"><img class="option-image" src="${items[i].imageUrl}" alt="${items[i].title}"><span class="option-zoom-icon">${zoomSvg}</span></div>` : ''}
                            </div>
                        </li>`;
            }

            html += `
                            </ul>
                            <div class="empty-state" id="empty-${uniqueId}" style="display:none;">موردی یافت نشد</div>
                        </div>
                    </div>
                    <div class="combo-tags" id="tags-${uniqueId}"></div>
                    <input type="hidden" name="Answers[${uniqueId}].Value" id="hidden-${uniqueId}" class="combo-hidden-value" value="${preSelectedIds.join(',')}" />
                </div>`;

            $('#DetailsQuestion').append(html);

            // فراخوانی تابع Init با داده‌های لود شده
            initMobileCombobox(uniqueId, preSelectedItems);
            break;

        default:
    }

}
function CountContentChar(inputElement, singleLimit) {
    const concatenatedLimit = singleLimit;
    const currentLength = inputElement.value.length;
    let remainingChars;
    let messageType;


    if (currentLength <= singleLimit) {
        remainingChars = singleLimit - currentLength;
        messageType = '';
    } else {
        const parts = Math.ceil(currentLength / concatenatedLimit);
        remainingChars = parts * concatenatedLimit - currentLength;
        messageType = `تعداد پیامک : ${parts} `;
    }

    // Update character count display
    $('#charCount').html('' + singleLimit + '/' + currentLength + '')
}


//stepProgreess


const previousBtn = document.getElementById('previousBtn');
const nextBtn = document.getElementById('nextBtn');
const backToPackage = document.getElementById('backToPackage');
const finishBtn = document.getElementById('finishBtn');
const content = document.getElementById('questionItem');
const typeOfAnswear = document.getElementById('typeOfAnswear');
const DetailsQuestion = document.getElementById('DetailsQuestion');
const bullets = [...document.querySelectorAll('.bullet')];

const MAX_STEPS = 4;
var currentStep = 0;
var countQuestion = 0;
var btnAction = 1;
function hasAnswearQuestionForMandatory(hasAnswearQuestion, QuestionTypeIdthis, btnAction) {
    var dataType1 = 0; var dataType2 = 0; var dataType3 = 0; var dataType4 = 0;
    var dataType5 = ""; var dataType6 = ""; var dataType10 = ""; var dataType11 = "null";
    var dataType12 = "";

    switch (QuestionTypeIdthis) {
        // انتخابی تک‌گزینه‌ای
        case '1':
            if ($("#displayType").val() == 2) {
                // پیدا کردن مقدار از اینپوت هیدنی که در Case 12 ساختیم
                dataType12 = $(".combo-hidden-value").val();
                // چک می‌کنیم که آیا مقداری انتخاب شده یا نه (خالی نباشد)
                if (dataType12 && dataType12.length > 0) {
                    checkAnswearCondition(QuestionTypeIdthis, btnAction);
                } else {
                    showMandatoryError();
                }
            } else {
                dataType1 = $('input[name="voteQuestionItem"]:checked').val();
                if (dataType1 > 0) {
                    checkAnswearCondition(QuestionTypeIdthis, btnAction);
                } else {
                    showMandatoryError();
                }
            }
            break;
        case '2':
            dataType2 = $('input[name="voteQuestionItem"]:checked').val();
            if (dataType2 > 0) {
                checkAnswearCondition(QuestionTypeIdthis, btnAction);
            } else {
                showMandatoryError();
            }
            break;

        // عددی
        case '3':
            dataType3 = $('#getNumber').val();
            if (dataType3 && dataType3.length > 0) {
                checkAnswearCondition(QuestionTypeIdthis, btnAction);
            } else {
                showMandatoryError();
            }
            break;
        // تشریحی
        case '4':
            dataType4 = $("#textAreaDec").val();
            if (dataType4 && dataType4.length > 1) {
                checkAnswearCondition(QuestionTypeIdthis, btnAction);
            } else {
                showMandatoryError();
            }
            break;
        // تاریخی
        case '5':
            dataType5 = $("#getDate").val();
            if (dataType5 && dataType5.length > 0) {
                checkAnswearCondition(QuestionTypeIdthis, btnAction);
            } else {
                showMandatoryError();
            }
            break;
        // ورودی معتبر
        case '6':
            dataType6 = $("#textAreaDec").val();
            if (dataType6 && dataType6.length > 0) {
                checkAnswearCondition(QuestionTypeIdthis, btnAction);
            } else {
                showMandatoryError();
            }
            break;

        // ستاره ای
        case '10':
            dataType10 = $('input[name=star]:checked').val();
            if (dataType10 == 0 || dataType10 == '' || dataType10 == undefined) {
                showMandatoryError();
            } else {
                checkAnswearCondition(QuestionTypeIdthis, btnAction);
            }
            break;
        // بازه ای
        case '11':
            dataType11 = $('#rangevalueInput').val();
            let slider = $('#rangevalueInput');
            if (slider.is('[data-default-unset]')) {
                showMandatoryError();
            } else {
                if (dataType11 >= 0) {
                    checkAnswearCondition(QuestionTypeIdthis, btnAction);
                } else {
                    showMandatoryError();
                }
            }
            break;

        //--- اضافه شده: کامبوباکس مدرن (موبایل‌فرست) ---
        case '12':
            // پیدا کردن مقدار از اینپوت هیدنی که در Case 12 ساختیم
            dataType12 = $(".combo-hidden-value").val();

            // چک می‌کنیم که آیا مقداری انتخاب شده یا نه (خالی نباشد)
            if (dataType12 && dataType12.length > 0) {
                checkAnswearCondition(QuestionTypeIdthis, btnAction);
            } else {
                showMandatoryError();
            }
            break;

        default:
            break;
    }

    // تابع کمکی برای جلوگیری از تکرار کد نمایش خطا
    function showMandatoryError() {
        $("#errorLimitQuestion").empty();
        $("#isMandatoryText").empty();
        $("#isMandatoryText").html('پاسخ به این سوال اجباری می باشد.');
    }
}




$('#nextBtn').click(function () {
    $('#content').removeClass('page-enter-active');
    $("#isMandatoryText").empty();
    var QuestionTypeIdthis = $("#QuestionTypeIdthis").val();
    var hasAnswearQuestion = $('#isMandatory').val();
    btnAction = 1;


    if (hasAnswearQuestion == "true") {
        hasAnswearQuestionForMandatory(hasAnswearQuestion, QuestionTypeIdthis, btnAction);
    } else {
        checkAnswearCondition(QuestionTypeIdthis, btnAction);
    }

});



previousBtn.addEventListener('click', () => {

    btnAction = 0;
    if (currentStep != 0) {
        var CurrentQuestion = allAnswerList[currentStep - 1].VoteAnswerDetailDtos[0];
        var QuestionId = CurrentQuestion.VotePackageDetailId;
        GetVotePackageDetailById(QuestionId, CurrentQuestion);


        nextBtn.disabled = false;
        finishBtn.disabled = true;
        if (currentStep === 0) {
            $('#previousBtn').removeAttr('disabled', 'disabled')
        }
    }
    else {
        showAlert('سوال اول است')
        $('#previousBtn').attr('disabled', 'disabled')
    }
    hasAnswearQuestion = $('#isMandatory').val();
    $("#isMandatoryText").empty();
    return;
});


backToPackage.addEventListener('click', () => {
    var lastQuestion = allAnswerList[allAnswerList.length - 1].VoteAnswerDetailDtos[0];
    var lastQuestionId = lastQuestion.VotePackageDetailId;

    GetVotePackageDetailById(lastQuestionId, lastQuestion);
    $('#votePackageBox').removeClass('d-none');
    $('.dataFirsPage').addClass('slide-up');
    $('.DataBox ').addClass('height85');
    $('.ConfirmTosentSurveyBox').addClass('d-none');
    $('.MobileTopData ').removeClass('topheight800');
    $('.DataBox ').removeClass('height350');

    countCurrentSteps(0);
    return;

});

function countCurrentSteps(btnAction) {
    if (btnAction == 0) {
        if (currentStep > 0) {
            currentStep--;
        }
        $('#currentQuestion').append('-b' + currentStep);

    }
    if (btnAction == 1) {

        currentStep++;

        $('#currentQuestion').append('-N' + currentStep);

    }

    var thisQuestionNumber = currentStep + 1;
    thisQuestionNumber = toFarsiNumber(thisQuestionNumber);
    $(".CounterQuestion").empty();
    $(".CounterQuestion").append('' + thisQuestionNumber + '');

}

function GetVotePackageDetailById(QuestionId, CurrentQuestion) {
    $.ajax({
        type: "POST",
        dataType: 'JSOn',
        url: '/Home/QuestionDetail',
        data: {
            'getGetVotePackageDetailByIdQueryFilter': {
                'votePackageDetailId': QuestionId
            }
        },
        success: function (data) {

            $('#content').addClass("page-enter-active");
            $("#questionText").empty();
            $("#questionText").append(data.data.voteQuestion.title);
            $("#infoQuestion").empty();
            $("#isMandatory").val(data.data.isMandatory);
            var isMandatorySetStar = $('#isMandatory').val();
            if (isMandatorySetStar == "true") {
                $(".isMandatoryQuestion").removeClass('d-none');
            } else {
                $(".isMandatoryQuestion").addClass('d-none');
            }
            var getTypeForAnwesr = data.data.voteQuestionTypeId
            //var getTypeForAnwesr = 12

            var infoQuestion = data.data.voteQuestion.validationMessage;
            if (infoQuestion !== null) {
                $("#infoQuestion").append(' ' + data.data.voteQuestion.validationMessage + ' ');
            }

            GetTypeQuestionAndLoadDetails(data);

            GetIdQuestionAndLoadAnswear(getTypeForAnwesr, CurrentQuestion, data);

            if (btnAction == 0) {
                countCurrentSteps(btnAction);
            }

        },
        error: function (jqXHR, textStatus, errorThrown) {

            showAlert('خطا');

        }
    });

}

function checkAnswearCondition(QuestionTypeIdthis, btnAction) {
    var isMandatorySetStar = $('#isMandatory').val();
    switch (QuestionTypeIdthis) {
        // انتخابی
        case '1':
            if ($("#displayType").val() == 2) {
                $('#errorLimitQuestion').empty();
                $('#isMandatoryText').empty();

                var $combo = $('.combo-hidden-value').first();
                var comboValue = ($combo.val() || '').trim();

                var $container = $combo.closest('.mobile-combo-container');
                var selectionMode = String($container.data('selection-mode') || 'single').toLowerCase();

                var rawMinSelection = $container.data('min-selection');
                var minSelection = rawMinSelection !== undefined && rawMinSelection !== null && rawMinSelection !== ''
                    ? parseInt(rawMinSelection, 10)
                    : null;

                var rawMaxSelection = $container.data('max-selection');
                var maxSelection = rawMaxSelection !== undefined && rawMaxSelection !== null && rawMaxSelection !== ''
                    ? parseInt(rawMaxSelection, 10)
                    : null;

                var isMandatory = $('#isMandatory').val() === 'true';

                if (selectionMode === 'multiple') {
                    var selectedIds = comboValue
                        ? comboValue
                            .split(',')
                            .map(function (item) { return item.trim(); })
                            .filter(function (item) { return item !== ''; })
                        : [];

                    // اگر سوال اجباری است و هیچ موردی انتخاب نشده
                    if (isMandatory && selectedIds.length === 0) {
                        $('#isMandatoryText').html('پاسخ به این سوال اجباری می‌باشد.');
                        return;
                    }

                    // اگر چیزی انتخاب نشده و سوال اجباری هم نیست
                    if (!isMandatory && selectedIds.length === 0) {
                        saveAnswer([]);
                        return;
                    }

                    // حداقل تعداد انتخاب
                    if (minSelection && selectedIds.length < minSelection) {
                        var minSelectionText = toFarsiNumber('حداقل ' + minSelection + ' مورد باید انتخاب شود.');
                        $('#errorLimitQuestion').append(minSelectionText);
                        return;
                    }

                    // حداکثر تعداد انتخاب
                    if (maxSelection && selectedIds.length > maxSelection) {
                        var maxSelectionText = toFarsiNumber('حداکثر ' + maxSelection + ' مورد قابل انتخاب است.');
                        $('#errorLimitQuestion').append(maxSelectionText);
                        return;
                    }

                    var comboAnswerItems = selectedIds.map(function (id) {
                        return { voteQuestionItemId: id };
                    });
                    saveAnswer(comboAnswerItems);

                } else {
                    // single mode
                    if (!comboValue) {
                        if (isMandatory) {
                            $('#isMandatoryText').html('پاسخ به این سوال اجباری می‌باشد.');
                            return;
                        } else {
                            saveAnswer([]);
                            return;
                        }
                    }

                    saveAnswer([{ VoteQuestionItemId: comboValue }]);
                }

            } else {
                let VoteAnswerDetailQuestionItems = [];
                const voteQuestionItemMin = $('#voteQuestionItemMin').val();
                const voteQuestionItemMax = $('#voteQuestionItemMax').val();

                $('input:checked').each(function () {
                    VoteAnswerDetailQuestionItems.push({ VoteQuestionItemId: $(this).val() });
                });

                if (isMandatorySetStar == 'true') {
                    if (VoteAnswerDetailQuestionItems.length > voteQuestionItemMax || VoteAnswerDetailQuestionItems.length < voteQuestionItemMin) {
                        var text = toFarsiNumber('حداقل انتخاب ' + voteQuestionItemMin + ' و حداکثر ' + voteQuestionItemMax + ' است. ');
                        showAlert(text);
                    } else {
                        saveAnswer(VoteAnswerDetailQuestionItems);
                    }
                } else {
                    saveAnswer(VoteAnswerDetailQuestionItems);
                }
            }

            break;

        case '2':
            saveAnswer();
            break;

        // عددی
        case '3':
            const getNumber = parseInt($("#getNumber").val());
            const getNumberMin = parseInt($('input[name="getNumber"]').attr('min'));
            const getNumberMax = parseInt($('input[name="getNumber"]').attr('max'));

            if ((getNumber > getNumberMax) || (getNumber < getNumberMin)) {
                $('#errorLimitQuestion').empty();
                var text = toFarsiNumber('بازه عددی باید بین ' + getNumberMin + ' تا ' + getNumberMax + ' باشد');
                $('#errorLimitQuestion').append(text);
            } else {
                $('#errorLimitQuestion').empty();
                saveAnswer('', getNumber);
            }
            break;

        // تشریحی
        case '4':
            saveAnswer();
            break;

        // تاریخی
        case '5':
            const getDate = parseInt($("#getDate").val());
            const getDateMin = parseInt($('input[name="getDate"]').attr('min'));
            const getDateMax = parseInt($('input[name="getDate"]').attr('max'));

            if ((getDate >= getDateMax) || (getDate <= getDateMin)) {
                $('#errorLimitQuestion').empty();
                var text = toFarsiNumber('حداقل انتخاببازه عددی باید بین ' + getDateMin + ' تا ' + getDateMax + ' باشد');
                $('#errorLimitQuestion').append(text);
            } else {
                $('#errorLimitQuestion').empty();
                saveAnswer();
            }
            break;

        // ورودی معتبر
        case '6':
            var inputFild = $(".inputFild").val();
            var pattern = $(".inputFild").attr('pattern');
            var exp = new RegExp('^' + pattern + '$');

            if (exp.test(inputFild)) {
                $('#errorLimitQuestion').empty();
                saveAnswer();
            } else {
                $('#errorLimitQuestion').empty();
                $('#errorLimitQuestion').append('لطفا ورودی معتبر وارد نمایید.');
            }
            break;

        // ستاره ای
        case '10':
            const getStarNumber = $('input[name=star]:checked').val();
            saveAnswer('', getStarNumber);
            break;

        // بازه ای
        case '11':
            const getRangeNumber = $("#rangevalueInput").val();
            var getRangeNumberMin = $('input[name="rangeslider"]').attr('min');
            var getRangeNumberMax = $('input[name="rangeslider"]').attr('max');

            getRangeNumberMin = parseInt(getRangeNumberMin);
            getRangeNumberMax = parseInt(getRangeNumberMax);

            if ((getRangeNumber > getRangeNumberMax) || (getRangeNumber < getRangeNumberMin)) {
                $('#errorLimitQuestion').empty();
                var text = toFarsiNumber('بازه عددی باید بین ' + getRangeNumberMin + ' تا ' + getRangeNumberMax + ' باشد');
                $('#errorLimitQuestion').append(text);
            } else {
                $('#errorLimitQuestion').empty();
                saveAnswer('', getRangeNumber);
            }
            break;

        // کامبوباکس
        case '12':
            $('#errorLimitQuestion').empty();

            var $combo = $('.combo-hidden-value').first();
            var comboValue = ($combo.val() || '').trim();

            if (!comboValue) {
                $('#isMandatoryText').empty().html('پاسخ به این سوال اجباری می باشد.');
                return;
            }

            var $container = $combo.closest('.mobile-combo-container');
            var selectionMode = String($container.data('selection-mode') || 'single').toLowerCase();
            var rawMaxSelection = $container.data('max-selection');
            var maxSelection = rawMaxSelection !== undefined && rawMaxSelection !== null && rawMaxSelection !== ''
                ? parseInt(rawMaxSelection, 10)
                : null;

            if (selectionMode === 'multiple') {
                var selectedIds = comboValue
                    .split(',')
                    .map(function (item) { return item.trim(); })
                    .filter(function (item) { return item !== ''; });

                if (maxSelection && selectedIds.length > maxSelection) {
                    var maxSelectionText = toFarsiNumber('حداکثر ' + maxSelection + ' مورد قابل انتخاب است.');
                    $('#errorLimitQuestion').append(maxSelectionText);
                    return;
                }

                var comboAnswerItems = selectedIds.map(function (id) {
                    return { DataSourceItemId: id };
                });

                saveAnswer(comboAnswerItems);
            } else {
                saveAnswer([{ DataSourceItemId: comboValue }]);
            }
            break;

        default:
            break;
    }
}


const allAnswerList = [];
function saveAnswer(VoteAnswerDetailQuestionItems, getNumber) {
    var VoteAnswerDetailDtos = [];

    if (currentStep == allAnswerList.length) {
        const tempData = {
            VotePackageDetailId: $("#votePackageDetailId").val(),
            ValueString: $("#textAreaDec").val(),
            ValueNumeric: getNumber,
            ValueDateTime: $("#getDate").val(),
            ValueDateTimePersian: $("#getDate").val(),
        }
        if (VoteAnswerDetailQuestionItems?.[0]?.DataSourceItemId) {
            tempData.DataSourceItemId = VoteAnswerDetailQuestionItems[0]?.DataSourceItemId
        } else {
            tempData.VoteAnswerDetailQuestionItem = VoteAnswerDetailQuestionItems
        }

        VoteAnswerDetailDtos.push(tempData);

        allAnswerList.push({ VoteAnswerDetailDtos });
        countCurrentSteps(btnAction);
        loadNextQuestion(VoteAnswerDetailDtos, getNumber);
        $('#previousBtn').removeAttr("disabled");

    }
    if (currentStep < (allAnswerList.length)) {

        allAnswerList[currentStep].VoteAnswerDetailDtos[0].ValueDateTime = $("#getDate").val();
        allAnswerList[currentStep].VoteAnswerDetailDtos[0].VotePackageDetailId = $("#votePackageDetailId").val(),
        allAnswerList[currentStep].VoteAnswerDetailDtos[0].ValueString = $("#textAreaDec").val(),
        allAnswerList[currentStep].VoteAnswerDetailDtos[0].ValueNumeric = getNumber,
        allAnswerList[currentStep].VoteAnswerDetailDtos[0].ValueDateTime = $("#getDate").val(),
        allAnswerList[currentStep].VoteAnswerDetailDtos[0].ValueDateTimePersian = $("#getDate").val()

        if (VoteAnswerDetailQuestionItems?.[0]?.DataSourceItemId) {
            allAnswerList[currentStep].VoteAnswerDetailDtos[0].DataSourceItemId = VoteAnswerDetailQuestionItems[0].DataSourceItemId
        } else {
            allAnswerList[currentStep].VoteAnswerDetailDtos[0].VoteAnswerDetailQuestionItem = VoteAnswerDetailQuestionItems
        }

        const tempData = {
            VotePackageDetailId: allAnswerList[currentStep].VoteAnswerDetailDtos[0].VotePackageDetailId,
            ValueString: allAnswerList[currentStep].VoteAnswerDetailDtos[0].ValueString,
            ValueNumeric: allAnswerList[currentStep].VoteAnswerDetailDtos[0].ValueNumeric,
            ValueDateTime: allAnswerList[currentStep].VoteAnswerDetailDtos[0].ValueDateTime,
            ValueDateTimePersian: allAnswerList[currentStep].VoteAnswerDetailDtos[0].ValueDateTimePersian,
        }

        if (allAnswerList[currentStep].VoteAnswerDetailDtos[0].DataSourceItemId) {
            tempData.DataSourceItemId = allAnswerList[currentStep].VoteAnswerDetailDtos[0].DataSourceItemId
        } else {
            tempData.VoteAnswerDetailQuestionItem = allAnswerList[currentStep].VoteAnswerDetailDtos[0].VoteAnswerDetailQuestionItem
        }

        VoteAnswerDetailDtos.push(tempData);
        loadNextQuestion(VoteAnswerDetailDtos, getNumber);
        countCurrentSteps(btnAction);
        $('#previousBtn').removeAttr("disabled");
    }
}

function FinalSaveAllAnswerList() {
    let tracking = $('#TrackingCode').val();

    DeactiveLastBtns();

    if (qrTypeId == 1) {//Employee
        var EmployeeId = StructureId
    }
    else if (qrTypeId == 2) {//Organization

        var OrganizationId = StructureId
    }
    else if (qrTypeId == 3) {//OrganizationStructure
        var OrganizationStructureId = StructureId
    }


    var VoteAnswerDetailDtos = [];
    for (var i = 0; i < allAnswerList.length; i++) {
        var VoteAnswerDetailQuestionItem = [];
        //var DataSourceItemId = [];
        if (allAnswerList[i].VoteAnswerDetailDtos[0].VoteAnswerDetailQuestionItem !== undefined && allAnswerList[i].VoteAnswerDetailDtos[0].VoteAnswerDetailQuestionItem !== null) {
            for (var Items = 0; Items < allAnswerList[i].VoteAnswerDetailDtos[0].VoteAnswerDetailQuestionItem.length; Items++) {

                VoteAnswerDetailQuestionItem.push({
                    VoteQuestionItemId: allAnswerList[i].VoteAnswerDetailDtos[0].VoteAnswerDetailQuestionItem[Items].VoteQuestionItemId
                })

            }

            //for (var dataSourceItem = 0; dataSourceItem < allAnswerList[i].VoteAnswerDetailDtos[0].DataSourceItemId.length; dataSourceItem++) {

            //    DataSourceItemId.push({
            //        DataSourceItemId: allAnswerList[i].VoteAnswerDetailDtos[0].VoteAnswerDetailQuestionItem[dataSourceItem].DataSourceItemId
            //    })

            //}
        }

        VoteAnswerDetailDtos.push({
            VotePackageDetailId: allAnswerList[i].VoteAnswerDetailDtos[0].VotePackageDetailId,
            ValueString: allAnswerList[i].VoteAnswerDetailDtos[0].ValueString,
            ValueNumeric: allAnswerList[i].VoteAnswerDetailDtos[0].ValueNumeric,
            ValueDateTime: allAnswerList[i].VoteAnswerDetailDtos[0].ValueDateTime,
            ValueDateTimePersian: allAnswerList[i].VoteAnswerDetailDtos[0].ValueDateTimePersian,
            DataSourceItemId: allAnswerList[i].VoteAnswerDetailDtos[0].DataSourceItemId,
            VoteAnswerDetailQuestionItem: VoteAnswerDetailQuestionItem
        })

    }

    $.ajax({
        type: "POST",
        dataType: 'JSOn',
        url: '/Home/SaveVoteAnswer',
        data: {
            VoteParticipationTypeId: SurveyTypeId,
            VoterReferenceId: voterReferenceId,
            VotePackageId: votePackageIdData,
            VotePackageReferenceId: votePackageReferenceId,
            EmployeeId: EmployeeId,
            OrganizationId: OrganizationId,
            OrganizationStructureId: OrganizationStructureId,
            IsDraft: false,
            ProcessTypeId: $("#ProcessTypeIdYaas").val() || 0,
            VoteAnswerDetailDtos: VoteAnswerDetailDtos,
            JwtToken: $('#JWT').val(),
            TrackingCode: $('#TrackingCode').val(),
            SurveyTypeId: $('#SurveyTypeId').val(),
        },


        success: function (data) {

            if (data.success) {
                UpdateIsDeraftVoteAnswer();

                setTimeout(function () {

                    $('.EndText').addClass(' animationShow');
                    $('.EndPage').addClass('showEnd');
                }, 500);
            } else {
                showAlert('عملیات ذخیره با خطا مواجه شد. لطفا دوباره تلاش کنید. ');
            }

        },
        error: function (jqXHR, textStatus, errorThrown) {
            if (jqXHR.status === 400) {
                window.location.href = '/Home/Error';
            }
            else {

                ActiveLastBtns();
                showAlert('عملیات ذخیره با خطا مواجه شد. لطفا دوباره تلاش کنید. ')
            }
        }
    });

}
function loadNextQuestion(VoteAnswerDetailDtos, getNumber) {

    $.ajax({
        type: "POST",
        dataType: 'JSOn',
        url: '/Home/NextQuestion',
        data: {
            VoteParticipationTypeId: '',
            VoteRequestSmsId: '',
            VoterLoginId: '',
            VotePackageId: votePackageIdData,
            VotePackageReferenceId: votePackageReferenceId,
            EmployeeId: '',
            OrganizationId: '',
            OrganizationStructureId: '',
            IsDraft: '',
            VoteAnswerDetailDtos: VoteAnswerDetailDtos
        },
        success: function (data) {
            if (!data?.success) {
                showAlert(data?.operationErrors[0]?.description || data?.validationErrors[0]?.description || 'عملیات با خطا مواجه شد. لطفا دوباره تلاش کنید.');
                return;
            }
            //شرط بابت اینکه آیا این سوال اخر هست یا خیر
            if (data?.data.isTheLastQuestion === false) {

                $('#content').addClass("page-enter-active");
                $("#questionText").empty();
                $("#questionText").append(data.data.voteQuestion.title);

                $("#isMandatory").val('');
                $("#isMandatory").val(data.data.isMandatory);

                $("#infoQuestion").empty();
                var infoQuestion = data.data.voteQuestion.validationMessage;
                if (infoQuestion !== null) {
                    $("#infoQuestion").append(' ' + data.data.voteQuestion.validationMessage + ' ');
                }

                var isMandatorySetStar = $('#isMandatory').val();
                if (isMandatorySetStar == "true") {
                    $(".isMandatoryQuestion").removeClass('d-none');
                } else {
                    $(".isMandatoryQuestion").addClass('d-none');
                }
                GetTypeQuestionAndLoadDetails(data);


                var nextItem = currentStep;
                if ((allAnswerList.length) > nextItem) {
                    var QuestionId = allAnswerList[nextItem].VoteAnswerDetailDtos[0].VotePackageDetailId;
                    if (data.data.votePackageDetailId == QuestionId) {
                        nextItem = allAnswerList[nextItem].VoteAnswerDetailDtos[0];
                        GetVotePackageDetailById(QuestionId, nextItem);

                    } else {
                        var removeFrom = currentStep;
                        allAnswerList.splice(removeFrom);
                    }
                }

            }
            else {
                allAnswerList.splice(currentStep);
                $('#votePackageBox').addClass('d-none');
                $('.ConfirmTosentSurveyBox').removeClass('d-none');
                $('.DataBox').removeClass('height85');
                $('.DataBox').addClass('height350');
                $('.dataFirsPage').removeClass('slide-up');
                $('.MobileTopData').addClass('topheight800');
            }
        },
        error: function (jqXHR, textStatus, errorThrown) {
            currentStep--;
            showAlert('عملیات با خطا مواجه شد. لطفا دوباره تلاش کنید.');
        }
    });
}

$(document).ready(function () {
    StarInit();
});
function StarInit() {

    $(".rateYo").each(function (e) {

        var ChngRatevaluesEn = { 1: 'bad', 2: 'poor', 3: 'ok', 4: 'good', 5: 'super' };
        var rating = $(this).attr("data-rating");
        $(this).rateYo({
            onSet: function (rating) {
                if (window.location.href.indexOf("/ar/") > -1) {
                    $(this).next().val(ChngRatevaluesAr[rating]);
                } else {
                    $(this).next().val(ChngRatevaluesEn[rating]);
                }
                ratingFunc(rating, $(this).next().next().val());
            },
            rating: rating,
            starWidth: "20px",
            numStars: 5,
            fullStar: true,
            normalFill: "#A0A0A0",
            spacing: "5px",
            precision: 2
        });
    });
}


function updateSlider(passObj) {
    $("#rangevalueInput").removeAttr('data-default-unset');
    var obj = $(passObj);
    var value = obj.val();
    var min = obj.attr("min");
    var max = obj.attr("max");
    var range = Math.round(max - min);
    var percentage = Math.round((value - min) * 100 / range);
    var nextObj = obj.next();

    nextObj.find("span.bar-btn").css("right", percentage + "%");
    nextObj.find("span.bar > span").css("width", percentage + "%");

    var spanText = (value === "" || value === 0)
        ? "برای انتخاب، رنج اسلایدر را حرکت دهید"
        : toPersianDigits(value);
    nextObj.find("span.bar-btn > span").text(spanText);
}



function toFarsiNumber(n) {
    const farsiDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];

    return n
        .toString()
        .replace(/\d/g, x => farsiDigits[x]);
}
function toEnNumber(n) {
    const EnDigits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

    return n
        .toString()
        .replace(/\d/g, x => EnDigits[x]);
}




function toggleNumberPad() {
    $('.KioskMode .form-structor').toggleClass("openNumberPad");
    $('.numeric-keypad-box').toggleClass("visible");
    $('.DataBox ').toggleClass("DataBoxforNumeric-keypad");
}
function closeNumberPad() {
    $('.KioskMode .form-structor').removeClass("openNumberPad");
    $('.numeric-keypad-box').removeClass("visible");
}

var seStart = 0, seEnd = 0;
var lastInput = null;

$(function () {
    var drop = '';
    var i = 1;
    for (i; i < 10; i++) {
        if (i === 10) {
            drop += '';
        }

        drop += '<button class="btn num-btn" value="' + i + '">' + toFarsiNumber(i) + '</button>';
        if (i === 12) {
            drop += '<button class="btn num-btn num-btn-delete">DEL</button>';
        }
    }
    drop = '<div class="numeric-keypad-box"><div class="number-box">' + drop +
        '<button class="btn num-btn num-btn-clear bg-light-danger"  value="C"><span class="svg-icon svg-icon-danger svg-icon-2x"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"><rect opacity = "0.3" x = "2" y = "2" width = "20" height = "20" rx = "10" fill = "black" /><rect x="7" y="15.3137" width="12" height="2" rx="1" transform="rotate(-45 7 15.3137)" fill="black"/><rect x="8.41422" y="7" width="12" height="2" rx="1" transform="rotate(45 8.41422 7)" fill="black"/></svg></span></button>' +
        '<button class="btn num-btn" value="0">' + toFarsiNumber(0) + '</button>' +
        '<button class="btn num-btn num-btn-delete bg-light-warning" " value="DEL"><span class="svg-icon bg-light-warning svg-icon-warning svg-icon-2x"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M9.60001 11H21C21.6 11 22 11.4 22 12C22 12.6 21.6 13 21 13H9.60001V11Z" fill="black"/><path d="M6.2238 13.2561C5.54282 12.5572 5.54281 11.4429 6.22379 10.7439L10.377 6.48107C10.8779 5.96697 11.75 6.32158 11.75 7.03934V16.9607C11.75 17.6785 10.8779 18.0331 10.377 17.519L6.2238 13.2561Z" fill="black"/><rect opacity="0.3" x="2" y="4" width="2" height="16" rx="1" fill="black"/></svg></span></button>' +

        '</div></div>';
    $('.LoginStep1').append(drop);
    $('.LoginStep2').append(drop);

    var ins = document.getElementsByTagName('input');
    for (i = 0; i < ins.length; i++) {
        if (ins[i].type === 'text') {
            ins[i].onfocus = function () {
                lastInput = this;
            }
        }
    }






    $('.num-btn').click(function () {
        var input = $(this).parent().parent().prev().prev().find('input.input-group-addon');
        var str = input.val();
        switch ($(this).val()) {
            case 'C':
                input.val("");
                break;
            case '0':
                if (str == '0' || str == '-0') {
                } else {
                    input.val(input.val() + "0");
                }
                break;
            case 'DEL':
                if (str == '') {

                } else {
                    input.val(str.substring(0, str.length - 1));
                }
                break;

            default:
                var newValue = input.val() + $(this).val();
                input.val(newValue);
        }
    });
});




document.querySelectorAll('.otp-input').forEach((input, index, inputs) => {
    input.addEventListener('input', () => {
        // بعد از وارد کردن رقم، برو به بعدی
        if (input.value.length === 1 && index < inputs.length - 1) {
            inputs[index + 1].focus();
        }
    });

    input.addEventListener('keydown', (e) => {
        // با backspace برگرد به قبلی
        if (e.key === 'Backspace' && input.value === '' && index > 0) {
            inputs[index - 1].focus();
        }
    });
});

// برای گرفتن مقدار کامل OTP
function getOtpValue() {
    return [...document.querySelectorAll('.otp-input')]
        .map(input => input.value)
        .join('');
}


function clearOtpInputs() {
    document.querySelectorAll('.otp-input').forEach(input => {
        input.value = '';
    });
    // فوکوس رو هم به اولین اینپوت برگردون
    document.querySelector('.otp-input')?.focus();
}
