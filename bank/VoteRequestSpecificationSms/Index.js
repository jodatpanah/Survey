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
            if (result.isConfirmed) { location.reload(); }
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

let page = 1;
let page2 = 1;
let isLastPage = false;
let isLastPage2 = false;
let searchTerm
function ResetVariables() {//بازسازی تمامی متغیر ها برای شروع مجدد
    page = 1;
    page2 = 1;
    searchTerm = '';
    isLastPage = false;
    isLastPage2 = false;
}
function ResetSelectedValue() {
    localStorage.clear();
    sessionStorage.removeItem('selectedValue');
}

document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll(".change-status-spec-sms-checkbox").forEach(function (el) {

        el.addEventListener("change", function () {
            const id = this.dataset.id;
            const status = this.dataset.status

            ChangeStatus(id, status);
        });
    });

});




function ChangeStatus(clickedId, isActive) {
    if ($('#VoteRequestSpecificationSmsId-' + clickedId + '').attr('checked')) {

        Swal.fire({
            text: "از غیر فعال کردن این مورد اطمینان دارید؟",
            icon: "warning",
            showCancelButton: !0,
            buttonsStyling: !1,
            confirmButtonText: "بله",
            cancelButtonText: "خیر",
            customClass: {
                confirmButton: "btn btn-primary",
                cancelButton: "btn btn-active-light"
            }
        }).then((result) => {

            if (result.isConfirmed) {
                $.ajax({

                    type: "POST",
                    dataType: 'JSOn',
                    url: '/VoteRequestSpecificationSms/Update',
                    data: { isActive: false, VoteRequestSpecificationSmsId: clickedId },
                    beforeSend: function (xhr) {
                        xhr.setRequestHeader("RequestVerificationToken", $('input[name="__RequestVerificationToken"]').val());
                    }, success: function (response) {
                        if (response.success) {
                            Swal.fire({
                                text: "با موفقیت انجام شد",
                                icon: "success",
                                buttonsStyling: !1,
                                confirmButtonText: "تایید",
                                customClass: { confirmButton: "btn btn-primary" },

                            }).then((function (t) {

                                $.ajax({
                                    url: location.href,
                                    type: "GET",
                                    success: function (data) {
                                        $("#kt_main_table").html($(data).find("#kt_main_table").html());

                                    }

                                });

                            }))


                        }
                        else {


                            Swal.fire({
                                text: "خطا ! لطفا با ادمین سیستم تماس بگیرید",
                                icon: "warning",
                                buttonsStyling: !1,
                                confirmButtonText: "تایید",
                                customClass: { confirmButton: "btn btn-primary" },

                            });

                            $('#VoteRequestSpecificationSmsId-' + clickedId + '').prop('checked', true);
                        }
                    }
                });
            }
            else {
                $('#VoteRequestSpecificationSmsId-' + clickedId + '').prop('checked', true);
            }
        })
    }
    else {

        Swal.fire({
            text: "از  فعال کردن این مورد اطمینان دارید؟",
            icon: "success",
            showCancelButton: !0,
            buttonsStyling: !1,
            confirmButtonText: "بله",
            cancelButtonText: "خیر",
            customClass: {
                confirmButton: "btn btn-primary",
                cancelButton: "btn btn-active-light"
            }
        }).then((result) => {
            if (result.isConfirmed) {
                $.ajax({
                    type: "POST",
                    dataType: 'JSOn',
                    url: '/VoteRequestSpecificationSms/Update',
                    data: { isActive: true, VoteRequestSpecificationSmsId: clickedId },
                    beforeSend: function (xhr) {
                        xhr.setRequestHeader("RequestVerificationToken", $('input[name="__RequestVerificationToken"]').val());
                    }, success: function (data) {

                        if (data.success) {
                            Swal.fire({
                                text: "با موفقیت انجام شد",
                                icon: "success",
                                buttonsStyling: !1,
                                confirmButtonText: "تایید",
                                customClass: { confirmButton: "btn btn-primary" },

                            }).then((function (t) {

                                $.ajax({
                                    url: location.href,
                                    type: "GET",
                                    success: function (data) {
                                        $("#kt_main_table").html($(data).find("#kt_main_table").html());

                                    }

                                });

                            }
                            ))

                        }
                        else {
                            Swal.fire({
                                text: "خطا ! لطفا با ادمین سیستم تماس بگیرید",
                                icon: "warning",
                                buttonsStyling: !1,
                                confirmButtonText: "تایید",
                                customClass: { confirmButton: "btn btn-primary" },

                            });

                            $('#VoteRequestSpecificationSmsId-' + clickedId + '').attr('checked', false);
                            $('#VoteRequestSpecificationSmsId-' + clickedId + '').prop('checked', false);

                        }
                    }
                });
            } else {
                $('#VoteRequestSpecificationSmsId-' + clickedId + '').prop('checked', false);
            }
        })

    }

}

//$(document).ready(function () {

//    const details = document.getElementById('kt_view_table');
//    //var validator = FormValidation.formValidation(
//    //    details,
//    //    {
//    //        fields: {
//    //            //'VoteRequestSpecificationDetailSms[0].FirstName': { validators: { notEmpty: { message: "  نام را وارد نمایید." } } },
//    //            //'VoteRequestSpecificationDetailSms[0].LastName': { validators: { notEmpty: { message: ' نام خانوادگی را وارد نمایید.' } } },
//    //            'VoteRequestSpecificationDetailSms[0].MobileNo': {
//    //                validators: {
//    //                    notEmpty: { message: " شماره تماس را وارد نمایید." },
//    //                    regexp: {
//    //                        regexp: /^09\d{9}$/,
//    //                        message: "  شماره تماس را بصورت صحیح وارد نمایید"
//    //                    }
//    //                }
//    //            },
//    //            //'VoteRequestSpecificationDetailSms[0].EmployeeCode': { validators: { notEmpty: { message: " کدپرسنلی را وارد نمایید." } } },
//    //            //'VoteRequestSpecificationDetailSms[0].BranchCode': { validators: { notEmpty: { message: " کد شعب را وارد نمایید." } } },
//    //            //'VoteRequestSpecificationDetailSms[0].ProcessCode': { validators: { notEmpty: { message: " کد خدمت را وارد نمایید." } } },
//    //        },

//    //        plugins: {
//    //            trigger: new FormValidation.plugins.Trigger(),
//    //            bootstrap: new FormValidation.plugins.Bootstrap5({ rowSelector: '.fv-row', eleInvalidClass: '', eleValidClass: '' })
//    //        }
//    //    }
//    //);
//    function addRownew() {
//        var count = $("#kt_view_table >tr").length;
//        var newRow = `
//                <tr class='remove CountRow'>
//                <td class=''> <input class='form-control' value='' id='FirstName[${count}]' name='VoteRequestSpecificationDetailSms[${count}].FirstName' ></td>
//                <td class=''> <input class='form-control' value='' id='LastName[${count}]' name='VoteRequestSpecificationDetailSms[${count}].LastName'></td>
//                <td class=''> <input class='form-control' value='' id='MobileNo[${count}]' name='VoteRequestSpecificationDetailSms[${count}].MobileNo'></td>
//                <td class=''> <input class='form-control' value='' id='EmployeeCode[${count}]' name='VoteRequestSpecificationDetailSms[${count}].EmployeeCode'></td>
//                <td class=''> <input class='form-control' value='' id='BranchCode[${count}]' name='VoteRequestSpecificationDetailSms[${count}].BranchCode'></td>
//                <td class=''> <input class='form-control' value='' id='ProcessCode[${count}]' name='VoteRequestSpecificationDetailSms[${count}].ProcessCode'></td>
//                <td class='w-50px text-end px-5'><a class="btn btn-sm btn-light-danger btn-icon btnremove" title="حذف"><i class="fonticon-trash fs-2x"></i></a></td>
//                </tr> `;


//        $("#kt_view_table").append(newRow);
//    }

//    $("#btnAddNew").click(function (e) {
//        e.preventDefault();
//        const rowCount = $(' .CountRow').length;

//        if (rowCount == 0) {
//            addRownew()

//        } else {
//            var count = rowCount - 1;
//            var MobileNoId = 'MobileNo[' + count + ']';
//            var thisItemMobile = document.getElementById(MobileNoId).value;
//            var regexp = /^09\d{9}$/;
//            document.getElementById(MobileNoId).style.border = "";


//            if (thisItemMobile == '') {
//                document.getElementById(MobileNoId).style.border = "1px solid #f15a79";

//            } else if (!regexp.test(thisItemMobile)) {
//                document.getElementById(MobileNoId).style.border = "1px solid #f15a79";

//            }
//            else {
//                addRownew()

//            }

//        }



//        AddRemoveAction();

//        //validator.validate().then(function (status) {

//        //    if (status === 'Valid') {


//        //   addRownew()


//        //        //validator.addField(`VoteRequestSpecificationDetailSms[${count}].FirstName`, {
//        //        //    validators: { notEmpty: { message: "  نام را وارد نمایید." } }
//        //        //});

//        //        //validator.addField(`VoteRequestSpecificationDetailSms[${count}].`, {
//        //        //    validators: { notEmpty: { message: " نام خانوادگی را وارد نمایید." } }
//        //        //});
//        //        //validator.addField(`VoteRequestSpecificationDetailSms[${count}].MobileNo`, {
//        //        //    validators: {
//        //        //        notEmpty: { message: " شماره تماس را وارد نمایید." },
//        //        //        regexp: {
//        //        //            regexp: /^09\d{9}$/,
//        //        //            message: "  شماره تماس را بصورت صحیح وارد نمایید"
//        //        //        }
//        //        //    }
//        //        //});
//        //        //validator.addField(`VoteRequestSpecificationDetailSms[${count}].EmployeeCode`, {
//        //        //    validators: { notEmpty: { message: " کد پرسنلی را وارد نمایید." } }
//        //        //});
//        //        //validator.addField(`VoteRequestSpecificationDetailSms[${count}].BranchCode`, {
//        //        //    validators: { notEmpty: { message: "  کد شعب را وارد نمایید." } }
//        //        //});
//        //        //validator.addField(`VoteRequestSpecificationDetailSms[${count}].ProcessCode`, {
//        //        //    validators: { notEmpty: { message: "  کد خدمت را وارد نمایید." } }
//        //        //});

//        //        AddRemoveAction();

//        //    }

//        //});

//    });


//    //add remove boutton click event

//    function AddRemoveAction() {
//        $(".btnremove").each(function (index, item) {
//            $(item).click(function () {

//                $(this).closest('tr.remove').remove();

//                const rowCount = $(' .CountRow').length;
//                for (i = 0; i < rowCount; i++) {
//                }

//            });
//        });
//    }

//    AddRemoveAction();
//});



////persianDateTime
//var customOptions = {
//    placeholder: "روز / ماه / سال"
//    , twodigit: true
//    , closeAfterSelect: true
//    , nextButtonIcon: "fa fa-chevron-right"
//    , previousButtonIcon: "fa fa-chevron-left"
//    , buttonsColor: "blue"
//    , forceFarsiDigits: true
//    , markToday: true
//    , markHolidays: true
//    , highlightSelectedDay: true
//    , sync: true
//    , gotoToday: false
//    , position: 'auto'
//    , parentId: 'kt_advanced_search_form'

//}

//kamaDatepicker('PersianDateTime', customOptions);
//kamaDatepicker('ToSendDateTime', customOptions);
//kamaDatepicker('FromSendDateTime', customOptions);
$(document).ready(function () {
    const createFormSelector = '#kt_modal_add_form[data-sms-create]';

    function showError(error, message) {
        error.textContent = message;
        error.classList.toggle('d-none', !message);
    }

    function markInvalid(input, isInvalid) {
        input.classList.toggle('is-invalid', isInvalid);
        if (isInvalid) input.setAttribute('aria-invalid', 'true');
        else input.removeAttribute('aria-invalid');
    }

    function syncRecipientType(form) {
        const selected = form.querySelector('input[name="UseMobileNo"]:checked');
        form.querySelectorAll('input[name="UseMobileNo"]').forEach(function (radio) {
            const option = radio.closest('label');
            option.classList.toggle('btn-light-primary', radio.checked);
            option.classList.toggle('border-primary', radio.checked);
            option.classList.toggle('btn-light', !radio.checked);
            option.classList.toggle('border-secondary', !radio.checked);
        });
        form.querySelectorAll('[data-sms-file-hint]').forEach(function (hint) {
            hint.classList.toggle('d-none', hint.dataset.smsFileHint !== selected.value);
        });
        form.querySelectorAll('[data-sms-recipient]').forEach(function (cell) {
            const isSelected = cell.dataset.smsRecipient === selected.value;
            cell.classList.toggle('d-none', !isSelected);
            const input = cell.querySelector('input');
            if (input) {
                input.disabled = !isSelected;
                if (!isSelected) markInvalid(input, false);
            }
        });
        showError(form.querySelector('#sms-manual-error'), '');
    }

    function addRecipientRow(form) {
        const rows = form.querySelector('#kt_view_table tbody');
        rows.insertAdjacentHTML('beforeend', `
            <tr>
                <td><input class="form-control" maxlength="20" data-sms-field="FirstName" aria-label="نام"></td>
                <td><input class="form-control" maxlength="50" data-sms-field="LastName" aria-label="نام خانوادگی"></td>
                <td data-sms-recipient="true"><input class="form-control" type="tel" dir="ltr" inputmode="numeric" maxlength="11" data-sms-field="MobileNo" aria-label="شماره موبایل" aria-required="true" aria-describedby="sms-manual-error"></td>
                <td data-sms-recipient="false"><input class="form-control" dir="ltr" inputmode="numeric" maxlength="10" data-sms-field="EmployeeCode" aria-label="کد پرسنلی" aria-required="true" aria-describedby="sms-manual-error"></td>
                <td><input class="form-control" type="number" oninput="ValidateBranchCodeInput(this)" data-sms-field="BranchCode" aria-label="کد شعبه"></td>
                <td><input class="form-control" type="number" oninput="ValidateProcessCodeInput(this)" data-sms-field="ProcessCode" aria-label="کد خدمت"></td>
                <td class="text-end"><button type="button" class="btn btn-sm btn-light-danger btn-icon js-remove-sms-recipient" aria-label="حذف ردیف" title="حذف ردیف"><i class="fonticon-trash" aria-hidden="true"></i></button></td>
            </tr>`);
        syncRecipientType(form);
        rows.lastElementChild.querySelector('[data-sms-recipient]:not(.d-none) input').focus();
    }

    function validateRecipientRows(form, requireRows) {
        const usesMobile = form.querySelector('input[name="UseMobileNo"]:checked').value === 'true';
        const inputs = form.querySelectorAll(`[data-sms-recipient="${usesMobile}"] input`);
        const pattern = usesMobile ? /^09[0-9]{9}$/ : /^[0-9]{1,10}$/;
        let firstInvalid;

        inputs.forEach(function (input) {
            input.value = input.value.trim()
                .replace(/[۰-۹]/g, digit => '۰۱۲۳۴۵۶۷۸۹'.indexOf(digit))
                .replace(/[٠-٩]/g, digit => '٠١٢٣٤٥٦٧٨٩'.indexOf(digit));
            const isInvalid = !pattern.test(input.value);
            markInvalid(input, isInvalid);
            if (isInvalid) firstInvalid ??= input;
        });

        const error = form.querySelector('#sms-manual-error');
        if (firstInvalid) {
            showError(error, usesMobile
                ? 'شماره موبایل هر ردیف باید ۱۱ رقمی باشد و با ۰۹ شروع شود.'
                : 'کد پرسنلی هر ردیف را با ۱ تا ۱۰ رقم وارد کنید.');
            firstInvalid.focus();
            return false;
        }
        if (requireRows && !inputs.length) {
            showError(error, 'دست‌کم یک ردیف گیرنده اضافه کنید.');
            form.querySelector('#btnAddNew').focus();
            return false;
        }
        showError(error, '');
        return true;
    }

    const formValidators = new WeakMap();

    $(document)
        .on('change', `${createFormSelector} input[name="UseMobileNo"]`, function () {
            syncRecipientType(this.form);
        })
        .on('change', `${createFormSelector} #formFile`, function () {
            markInvalid(this, false);
            showError(this.form.querySelector('#sms-file-error'), '');
        })
        .on('input', `${createFormSelector} [data-sms-recipient] input`, function () {
            markInvalid(this, false);
        })
        .on('click', `${createFormSelector} #btnAddNew`, function () {
            if (validateRecipientRows(this.form, false)) addRecipientRow(this.form);
        })
        .on('click', `${createFormSelector} .js-remove-sms-recipient`, function () {
            this.closest('tr').remove();
            showError(this.form.querySelector('#sms-manual-error'), '');
        })
        .on('submit', createFormSelector, async function (event) {
            event.preventDefault();

            const form = this;
            const button = form.querySelector('#kt_modal_add_submit')
                || document.querySelector('#kt_modal_add_submit[form="kt_modal_add_form"]');
            if (button.disabled) return;

            if (!formValidators.has(form)) {
                formValidators.set(form, FormValidation.formValidation(form, {
                    fields: {
                        Title: { validators: { notEmpty: { message: 'لطفا عنوان را وارد کنید.' } } },
                        Content: { validators: { notEmpty: { message: 'لطفا متن پیامک را وارد کنید.' } } },
                        PersianDateTime: { validators: { notEmpty: { message: 'لطفا تاریخ را وارد کنید.' } } },
                        VotePackageId: { validators: { notEmpty: { message: 'لطفا یک فرم نظرسنجی انتخاب کنید.' } } }
                    },
                    plugins: {
                        trigger: new FormValidation.plugins.Trigger(),
                        bootstrap: new FormValidation.plugins.Bootstrap5({ rowSelector: '.fv-row', eleInvalidClass: '', eleValidClass: '' })
                    }
                }));
            }

            button.disabled = true;
            try {
                if ((await formValidators.get(form).validate()) !== 'Valid') return;

                const addingFile = form.querySelector('#kt_advanced').classList.contains('active');
                const fileInput = form.querySelector('#formFile');
                if (addingFile && !fileInput.files.length) {
                    showError(form.querySelector('#sms-file-error'), 'فایل اکسل گیرندگان را انتخاب کنید.');
                    markInvalid(fileInput, true);
                    fileInput.focus();
                    return;
                }
                if (!addingFile && !validateRecipientRows(form, true)) return;

                const data = new FormData(form);
                if (!addingFile) {
                    data.delete('formFile');
                    form.querySelectorAll('#kt_view_table tbody tr').forEach(function (row, index) {
                        row.querySelectorAll('input[data-sms-field]:enabled').forEach(function (input) {
                            data.append(`VoteRequestSpecificationDetailSms[${index}].${input.dataset.smsField}`, input.value);
                        });
                    });
                }

                button.setAttribute('data-kt-indicator', 'on');
                const response = await $.ajax({
                    type: 'POST',
                    dataType: 'json',
                    url: form.action,
                    data,
                    processData: false,
                    contentType: false,
                    beforeSend: function (xhr) {
                        xhr.setRequestHeader('RequestVerificationToken', data.get('__RequestVerificationToken'));
                    }
                });

                if (response.success) {
                    await Swal.fire({
                        text: 'با موفقیت انجام شد',
                        icon: 'success',
                        buttonsStyling: false,
                        confirmButtonText: 'بستن',
                        customClass: { confirmButton: 'btn btn-primary' }
                    });
                    window.location.href = '/VoteRequestSpecificationSms/Index';
                } else {
                    await Swal.fire({
                        text: response.operationErrors?.[0]?.description || 'ثبت نظرسنجی انجام نشد.',
                        icon: 'warning',
                        buttonsStyling: false,
                        confirmButtonText: 'بستن',
                        customClass: { confirmButton: 'btn btn-primary' }
                    });
                }
            } catch (error) {
                if (![401, 403, 429].includes(error?.status)) {
                    await Swal.fire({
                        text: 'در ثبت نظرسنجی خطایی رخ داد.',
                        icon: 'warning',
                        buttonsStyling: false,
                        confirmButtonText: 'بستن',
                        customClass: { confirmButton: 'btn btn-primary' }
                    });
                }
            } finally {
                button.removeAttribute('data-kt-indicator');
                button.disabled = false;
            }
        });

    document.querySelectorAll(createFormSelector).forEach(syncRecipientType);
});

function ValidateBranchCodeInput(input) {
    if (input.value < 0 || input.value > 999999) {
        input.value = '';
    }

    input.value = input.value.slice(0, 6);
    // Remove leading zeros
    if (input.value.length > 1 && input.value[0] === '0') {
        input.value = parseInt(input.value, 10);
    }
}
function ValidateProcessCodeInput(input) {
    if (input.value < 0 || input.value > 999999) {
        input.value = '';
    }

    input.value = input.value.slice(0, 6);
    // Remove leading zeros
    if (input.value.length > 1 && input.value[0] === '0') {
        input.value = parseInt(input.value, 10);
    }
}

document.querySelectorAll(".delete-vote-request-spec-sms-btn").forEach(function (el) {
    el.addEventListener("click", function (e) {
        e.preventDefault();
        const id = this.dataset.id;

        DeleteVoteRequestSpecificationSms(id);
    });
});


function DeleteVoteRequestSpecificationSms(clickedId) {
    Swal.fire({
        text: "آیا از عملیات حذف اطمینان دارید؟",
        icon: "warning",
        showCancelButton: !0,
        buttonsStyling: !1,
        confirmButtonText: "بله",
        cancelButtonText: "خیر",
        customClass: {
            confirmButton: "btn btn-primary",
            cancelButton: "btn btn-active-light"
        }
    }).then((result) => {
        if (result.isConfirmed) {

            $.ajax({

                type: "POST",
                dataType: 'JSOn',
                url: '/VoteRequestSpecificationSms/DeleteVoteRequestSpecificationSms',
                data: { VoteRequestSpecificationSmsId: clickedId },
                beforeSend: function (xhr) {
                    xhr.setRequestHeader("RequestVerificationToken", $('input[name="__RequestVerificationToken"]').val());
                }, success: function (response) {

                    if (response.success) {
                        Swal.fire({
                            text: "با موفقیت انجام شد",
                            icon: "success",
                            buttonsStyling: !1,
                            confirmButtonText: "بستن",
                            customClass: { confirmButton: "btn btn-primary" },

                        }).then((function (t) {

                            $.ajax({
                                url: location.href,
                                type: "GET",
                                success: function (data) {
                                    $("#kt_main_table").html($(data).find("#kt_main_table").html());

                                }

                            });

                        }))


                    } else {

                        Swal.fire({
                            text: response.operationErrors[0].description,
                            icon: "warning",
                            buttonsStyling: !1,
                            confirmButtonText: "تایید",
                            customClass: { confirmButton: "btn btn-primary" },

                        });
                    }

                },
                error: function () {
                    Swal.fire({
                        text: "خطا ! لطفا با ادمین سیستم تماس بگیرید",
                        icon: "warning",
                        buttonsStyling: !1,
                        confirmButtonText: "بستن",
                        customClass: { confirmButton: "btn btn-primary" },

                    });
                }

            });
        }
    });
};
function UpdateVotePackageSelectlist() {

    function appendOptions(data, searchTerm, pageNumber) {
        if (searchTerm !== '' && pageNumber === 1) {
            $('#VotePackageId').empty().trigger('change');
        }

        let scrollTop = 0;
        let select2Dropdown = $('.select2-results__options');
        scrollTop = select2Dropdown.scrollTop();

        $('#VotePackageId').select2();
        var option = new Option('', '', false, false);
        $('#VotePackageId').append(option);

        data.forEach(item => {
            //if (searchVotePackageId == item.votePackageId) {
            //    var option = new Option(item.title, item.votePackageId, true, true);
            //}
            //else {
            //    var option = new Option(item.title, item.votePackageId, false, false);
            //}
            var option = new Option(item.title, item.votePackageId, false, false);
            $('#VotePackageId').append(option);
        });
        $('#VotePackageId').select2({
            dropdownParent: $('#kt_modal_add')
        });
        $('#VotePackageId').select2('open');
        select2Dropdown = $('.select2-results__options');
        let select2DropdownSearch = $('.select2-search__field');
        select2DropdownSearch.val(searchTerm);
        select2Dropdown.scrollTop(scrollTop);
    }

    function loadData(pageNumber, searchTerm) {
        $('.loading').show();

        $.ajax({
            type: "Get",
            dataType: 'json',
            url: '/VoteRequestSpecificationSms/GetVotePackageListForDropDown',
            data: {
                page: pageNumber,
                title: searchTerm
            },
            delay: 500,
            success: function (data) {
                $('.loading').hide();
                //isLastPage = data.length === 0;
                if (data.length === 0) {
                    isLastPage = true;
                } else {
                    isLastPage = false;
                }
                appendOptions(data, searchTerm, pageNumber);
            },
            error: function (jqXHR, textStatus, errorThrown) {
                $('.loading').hide();
            }
        });
    }

    $('#VotePackageId').select2().on('select2:open', function () {
        let select2Dropdown = $('.select2-results__options');
        let srch = $('.select2-search__field');
        srch.val(searchTerm);

        srch.on('input', function (e) {
            var srchtrm = $(this).val();
            loadData(1, srchtrm);
            searchTerm = srchtrm;
            page = 1;
        });

        select2Dropdown.off('scroll').on('scroll', function () {
            if (!isLastPage && select2Dropdown[0].scrollHeight - select2Dropdown.scrollTop() <= select2Dropdown.outerHeight()) {
                page++;
                loadData(page, searchTerm);
            }
        });
    });
    let searchVotePackageId = $('#searchVotePackageId').val();
    $.ajax({
        type: "Get",
        dataType: 'json',
        url: '/VoteRequestSpecificationSms/GetVotePackageListForDropDown',
        success: function (data) {
            data.forEach(item => {
                let displayTitle = item.title.length > 80 ? item.title.substring(0, 80) + '...' : item.title;
                if (searchVotePackageId == item.votePackageId) {
                    var option = new Option(displayTitle, item.votePackageId, true, true);
                }
                else {
                    var option = new Option(displayTitle, item.votePackageId, false, false);
                }
                // let option = new Option(displayTitle, item.votePackageId, false, false);
                $("#VotePackageId").append(option);
                $('#VotePackageId').select2({
                    dropdownParent: $('#kt_modal_add')
                });
            });
        }
    });
    ResetVariables();
    $(document).ready(function () {
        // گرفتن مقادیر از فیلدهای مخفی
        let searchVotePackageId = $('#searchVotePackageId').val();
        let searchVotePackageTitle = $('#searchVotePackageTitle').val();

        // ایجاد یک گزینه جدید در دراپ‌دان
        let option = new Option(searchVotePackageTitle, searchVotePackageId, true, true);
        $("#VotePackageId").append(option).trigger('change');

        // Initialize select2
        $('#VotePackageId').select2({
            dropdownParent: $('#kt_modal_add')
        });
    });
}//update***

document.addEventListener("click", function (e) {
    const btn = e.target.closest(".load-modal-btn");
    if (!btn) return;

    e.preventDefault();

    const id = btn.dataset.id;
    LoadModal(id);
});

function LoadModal(clickedId) {
    
    $.ajax({

        type: "Get",
        url: '/VoteRequestSpecificationSms/UpdateRecord',
        data: {
            VoteRequestSpecificationSmsId: clickedId
        },

        success: function (response) {
            $('#modalcontent').html(response);
            $('#kt_modal_add').data('validator', null);
            $("#kt_modal_add").modal("show");

            UpdateVotePackageSelectlist();
            var voteRequestSpecificationSmsId = '@Model.VoteRequestSpecificationSmsId';
            if (voteRequestSpecificationSmsId) {
                $('#VotePackageId').val(voteRequestSpecificationSmsId).trigger('change');
            }
            var contentElement = document.getElementById('Content'); CountContentChar(contentElement, 70)

            const form = document.getElementById('kt_modal_add_form');

            validator = FormValidation.formValidation(
                form,
                {
                    fields: {
                        Title: { validators: { notEmpty: { message: "لطفا  عنوان را وارد نمایید." } } },
                        Content: { validators: { notEmpty: { message: 'لطفا  متن پیامک را وارد نمایید.' } } },
                        PersianDateTime: { validators: { notEmpty: { message: "لطفا تاریخ را وارد نمایید." } } },
                        VotePackageId: { validators: { notEmpty: { message: "لطفا یک فرم نظرسنجی انتخاب  نمایید." } } },

                    },


                    plugins: {
                        trigger: new FormValidation.plugins.Trigger(),
                        bootstrap: new FormValidation.plugins.Bootstrap5({ rowSelector: '.fv-row', eleInvalidClass: '', eleValidClass: '' })
                    }
                }
            );
        },

        error: function () {

        }

    })

};

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

    $('#charCount').text(`${messageType}کاراکتر باقی‌مانده  : ${remainingChars}`);
}


