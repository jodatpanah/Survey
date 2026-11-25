$(document).ajaxError(function (event, jqxhr, settings, thrownError) {
    if (jqxhr.status == 401) {

        Swal.fire({
            text: "مدت زمان مجاز استفاده از سامانه به پایان رسیده است و برای استفاده مجدد باید لاگین کنید",
            icon: "warning",
            buttonsStyling: !1,
            confirmButtonText: "تایید",
            customClass: {
                confirmButton: "btn btn-primary"
            }
        }).then((result) => {
            if (result.isConfirmed) {
                window.location.href = '/Account/Login';
            }
        })
    }
    if (jqxhr.status == 403) {

        Swal.fire({
            text: "شما مجاز به انجام این عملیات نیستید",
            icon: "warning",
            buttonsStyling: !1,
            confirmButtonText: "تایید",
            customClass: {
                confirmButton: "btn btn-primary"
            }
        }).then((result) => {
            if (result.isConfirmed) { }
        })
    }
    if (jqxhr.status == 429) {
        Swal.fire({
            text: "تعداد دفعات درخواست بیشتر از حد مجاز می باشد، لطفا چند دقیقه دیگر تلاش کنید.",
            icon: "warning",
            buttonsStyling: !1,
            confirmButtonText: "تایید",
            customClass: {
                confirmButton: "btn btn-primary"
            }
        }).then((result) => {
            if (result.isConfirmed) { }
        })
    }
});

function ResetVariables() {
    page = 1;
    searchTerm = '';
    isLastPage = false;
}

function CountContentChar(inputElement, singleLimit) {
    const concatenatedLimit = 67;
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
    $('#charCount').text(`${messageType}کاراکتر باقی‌مانده  : ${remainingChars}`);
}

document.addEventListener("click", function (e) {
    const btn = e.target.closest("#add_Question_btn");
    if (!btn) return;

    Edit(e);
});


function Edit(e) {

    e.preventDefault();
    a = document.querySelector("#kt_modal_add_form");
    const dataForm = $("#kt_modal_add_form").serializeArray();
    var sDate = document.getElementById('PersianDateTime1').value;
    var nowDate = document.getElementById('NowPersianDateTime').value;
    var persianDateTimeObj = dataForm.find(obj => obj.name === 'PersianDateTime');
    var persianDateTime = persianDateTimeObj ? persianDateTimeObj.value : undefined;
    var eTitle = $('#Title').val();
    if (eTitle === '') {
        $('#TitleHintText').remove();
        $('#TitleHint').after('<div id="TitleHintText" style="color:red;" data-field="Title" data-validator="notEmpty">لطفا عنوان را وارد نمایید. </div>');
    }
    var ePersianDateTime = $('#PersianDateTime').val();
    if (ePersianDateTime === '') {
        $('#PersianDateTimeHintText').remove();
        $('#PersianDateTimeHint').after('<div id="PersianDateTimeHintText" style="color:red;" data-field="Title" data-validator="notEmpty">لطفا تاریخ را وارد نمایید.</div>');
    }
    var eVotePackageId = $('#VotePackageId').val();
    //if (eVotePackageId === '') {
    //    $('#VotePackageIdHintText').remove();
    //    $('#VotePackageIdHint').after('<div id="VotePackageIdText" style="color:red;" data-field="Title" data-validator="notEmpty">لطفا یک فرم نظرسنجی انتخاب شود</div>');
    //}
    var eContent = $('#Content').val();
    if (eContent === '') {
        $('#ContentHintText').remove();
        $('#ContentHint').after('<div id="ContentHintText" style="color:red;" data-field="Title" data-validator="notEmpty">لطفا متن پیامک را وارد نمایید.</div>');
    }
    if (persianDateTime < sDate && persianDateTime !=''&&
        persianDateTime != nowDate) {
        Swal.fire({
            text: "تاریخ نباید قبل از تاریخ روز باشد!",
            icon: "warning",
            buttonsStyling: !1,
            confirmButtonText: "تایید",
            customClass: { confirmButton: "btn btn-warning" },
        })
    }
    var votePackageIdObj = dataForm.find(obj => obj.name === 'VotePackageId');
    var votePackageId = votePackageIdObj ? votePackageIdObj.value : undefined;
    if (votePackageId =='') {
        Swal.fire({
            text: "لطفا یک فرم نظرسنجی انتخاب شود!",
            icon: "warning",
            buttonsStyling: !1,
            confirmButtonText: "تایید",
            customClass: { confirmButton: "btn btn-warning" },
        })
    }
    if (eTitle != '' && ePersianDateTime != '' && eVotePackageId != '' && eContent != '') {
        $.ajax({
            type: "POST",
            dataType: 'JSON',
            url: '/VoteRequestSpecificationSms/UpdateRecord',
            data: dataForm,
            beforeSend: function (xhr) {
                xhr.setRequestHeader("RequestVerificationToken", $('input[name="__RequestVerificationToken"]').val());
            },
            success: function (response) {

                if (response.success) {
                    Swal.fire({
                        text: "با موفقیت انجام شد",
                        icon: "success",
                        buttonsStyling: !1,
                        confirmButtonText: "بستن",
                        customClass: { confirmButton: "btn btn-primary" },
                    }).then((result) => {
                        if (result.isConfirmed) {
                            $("#kt_modal_add").modal("hide");
                            $.ajax({
                                url: location.href,
                                type: "GET",
                                success: function (data) {
                                    $("#kt_main_table").html($(data).find("#kt_main_table").html());
                                    document.querySelector("#kt_modal_add_form").reset();
                                }
                            });
                        }
                    });
                }
            }
        });
    }
}


jalaliDatepicker.startWatch({
    //   container: '.openDatetimeBody',
    zIndex: '9999',
});
