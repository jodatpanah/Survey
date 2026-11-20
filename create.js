function fillOptionPriorities() {
    const inputs = Array.from(document.querySelectorAll('#kt_repeater_RadioShowcase .OrderIndex:enabled'));
    const used = new Set(inputs.filter(input => input.value !== '' && input.validity.valid)
        .map(input => input.valueAsNumber));
    let next = Math.max(0, ...used) + 1;

    for (const input of inputs) {
        if (input.value !== '' || input.validity.badInput) {
            continue;
        }

        const maximum = Number(input.max);
        if (next > maximum) {
            next = 1;
        }
        while (used.has(next)) {
            next++;
        }
        if (next <= maximum) {
            input.value = next;
            used.add(next);
            next++;
        }
    }
}

function validateChoiceOptions() {
    fillOptionPriorities();
    const invalidField = document.querySelector(
        '#kt_repeater_RadioShowcase .OrderIndex:enabled:invalid, #kt_repeater_RadioShowcase .Weight:enabled:invalid'
    );
    if (invalidField) {
        invalidField.reportValidity();
        return false;
    }
    return true;
}

var selectedDataSourceId = null;

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


$(document).ready(function () {

    //
    let page = 1;
    let page2 = 1;
    let searchTerm;
    let searchTerm2;
    let isLastPage = false;
    let isLastPage2 = false;
    let selectedGroup;
    var selected = null;
    const $choiceOptions = $('#kt_repeater_RadioShowcase');

    $choiceOptions.find('.Weight').each(function () {
        if (this.value && !Number.isSafeInteger(this.valueAsNumber)) {
            this.value = '';
        } else if (this.value) {
            this.value = String(this.valueAsNumber);
        }
        this.dataset.lastIntegerWeight = this.value;
    });

    $choiceOptions.on('beforeinput', '.Weight', function (event) {
        const data = event.originalEvent?.data;
        if (data && !/^-?[\d۰-۹٠-٩]*$/.test(data)) {
            event.preventDefault();
        }
    });

    $choiceOptions.on('paste', '.Weight', function (event) {
        const pasted = event.originalEvent?.clipboardData?.getData('text');
        if (pasted && !/^-?[\d۰-۹٠-٩]+$/.test(pasted.trim())) {
            event.preventDefault();
        }
    });

    $choiceOptions.on('input', '.Weight', function () {
        if (this.value && !/^-?\d+$/.test(this.value)) {
            this.value = this.dataset.lastIntegerWeight ?? '';
        } else if (!this.validity.badInput) {
            this.dataset.lastIntegerWeight = this.value;
        }
    });

    $choiceOptions.on('click', '.js-option-weight-step', function () {
        const input = $(this).siblings('.Weight')[0];
        if (input.disabled) {
            return;
        }

        if (this.dataset.weightStep === '1') {
            input.stepUp();
        } else {
            input.stepDown();
        }
        input.dataset.lastIntegerWeight = input.value;
    });

    $('#VoteQuestionGroupId').select2().on('select2:select', function (e) {
        var data = e.params.data;
        selectedGroup = data.id;

        $.ajax({
            type: "GET",
            dataType: 'JSOn',
            url: '/VoteQuestionGroup/GetAllVoteQuestionGroupParentById',
            data: { parentid: selectedGroup },
            success: function (data) {
                if (data.length > 0) {
                    $('#SubVoteQuestionGroupId').empty();
                    for (var i = 0; i < data.length; i++) {
                        var itemType = new Option(data[i].title, data[i].voteQuestionGroupId, false, false);
                        $("#SubVoteQuestionGroupId").append(itemType);
                    }
                } else {
                    // parentid: data.id 
                    //  $(".subGroup").addClass("d-none");
                    $('#SubVoteQuestionGroupId').empty();
                }
            }, error: function (xhr, status, error) {
            }
        });
    });

    function appendOptions(data, searchTerm, pageNumber) {

        if ((searchTerm !== undefined || searchTerm !== '') && pageNumber === 1) {//با هر بار جستجوی جدید یکبار محتوا ریست میگردد
            $('#VoteQuestionGroupId').empty().trigger('change');
        }
        let scrollTop = 0;
        let select2Dropdown2 = $('.select2-results__options');

        scrollTop = select2Dropdown2.scrollTop();

        $('#VoteQuestionGroupId').select2();
        var option = new Option('', '', false, false);
        $('#VoteQuestionGroupId').append(option);
        data.forEach(item => {
            var option = new Option(item.title, item.voteQuestionGroupId, false, false);
            $('#VoteQuestionGroupId').append(option);
        });
        $('#VoteQuestionGroupId').select2('open');
        select2Dropdown2 = $('.select2-results__options');
        let select2DropdownSearch2 = $('.select2-search__field');
        select2DropdownSearch2.val(searchTerm);//حفظ متن داخل سرچ بار
        select2Dropdown2.scrollTop(scrollTop);
    }
    ///*

    function appendOptions2(data, searchTerm, pageNumber) {

        if ((searchTerm !== undefined || searchTerm !== '') && pageNumber === 1) {//با هر بار جستجوی جدید یکبار محتوا ریست میگردد
            $('#SubVoteQuestionGroupId').empty().trigger('change');
        }
        let scrollTop = 0;
        let select2Dropdown2 = $('.select2-results__options');

        scrollTop = select2Dropdown2.scrollTop();

        $('#SubVoteQuestionGroupId').select2();
        var option = new Option('', '', false, false);
        $('#SubVoteQuestionGroupId').append(option);
        data.forEach(item => {
            var option = new Option(item.title, item.voteQuestionGroupId, false, false);
            $('#SubVoteQuestionGroupId').append(option);
        });
        $('#SubVoteQuestionGroupId').select2('open');
        select2Dropdown2 = $('.select2-results__options');
        let select2DropdownSearch2 = $('.select2-search__field');
        select2DropdownSearch2.val(searchTerm);//حفظ متن داخل سرچ بار
        select2Dropdown2.scrollTop(scrollTop);
    }
    function ResetVariables() {//بازسازی تمامی متغیر ها برای شروع مجدد
        //console.log('1. شروع فایل create.js - قبل از ready');
        page = 1;
        page2 = 1;
        searchTerm = '';
        searchTerm2 = '';
        isLastPage = false;
        isLastPage2 = false;
    }
    function loadData(pageNumber, searchTerm) {
        $('.loading').show();

        $.ajax({
            type: "GET",
            dataType: 'json',
            url: '/VoteQuestionGroup/GetAllActiveVoteQuestionGroupWithOutParentQuery',
            data: {
                page: pageNumber,
                title: searchTerm
            },
            delay: 500,//ایجاد تاخیر جهت کاهش فشار در بکاند
            success: function (data) {
                $('.loading').hide();

                if (data.length === 0) {//تایین به اخر رسیدن نتایج برای اینکه درخواست های اضافی سمت سرور نرود
                    isLastPage = true;
                } else {
                    isLastPage = false;
                }
                appendOptions(data, searchTerm, pageNumber);
            },
            error: function (jqXHR, textStatus, errorThrown) {
                $('.loading').hide();
                //console.error('AJAX Error:', textStatus, errorThrown);
            }
        });
    }
    //*
    function loadData2(pageNumber, searchTerm) {
        $('.loading').show();

        $.ajax({
            type: "GET",
            dataType: 'json',
            url: '/VoteQuestionGroup/GetAllVoteQuestionGroupParentById',
            data: {
                page: pageNumber,
                title: searchTerm,
                parentid: selectedGroup
            },
            delay: 500,//ایجاد تاخیر جهت کاهش فشار در بکاند
            success: function (data) {
                $('.loading').hide();

                if (data.length === 0) {//تایین به اخر رسیدن نتایج برای اینکه درخواست های اضافی سمت سرور نرود
                    isLastPage2 = true;
                } else {
                    isLastPage2 = false;
                }
                appendOptions2(data, searchTerm, pageNumber);
            },
            error: function (jqXHR, textStatus, errorThrown) {
                $('.loading').hide();
                //console.error('AJAX Error:', textStatus, errorThrown);
            }
        });
    }

    $('#VoteQuestionGroupId').select2({
    }).on('select2:open', function () {
        $('#SubVoteQuestionGroupId').select2('close');
        let select2Dropdown = $('.select2-results__options');
        let srch = $('.select2-search__field');
        srch.val(searchTerm);//حفظ متن سرچ بار بعد از باز و بسته شدن دارپ داون
        srch.on('input', function (e) {

            var srchtrm = $(this).val();
            loadData(1, srchtrm);
            searchTerm = srchtrm;//حفظ متن مورد جستجو جهت اسکرول های بعدی
            page = 1;//ریست کردن شماره صفحه با هر بار جستجوی جدید-مورد نیاز برای اسکرول کردن
        });
        select2Dropdown.off('scroll').on('scroll', function () {
            if (!isLastPage && select2Dropdown[0].scrollHeight - select2Dropdown.scrollTop() <= select2Dropdown.outerHeight()) {
                page++;
                loadData(page, searchTerm);

            }
        });
    });
    ///**
    $('#SubVoteQuestionGroupId').select2({
    }).on('select2:open', function () {
        $('#VoteQuestionGroupId').select2('close');
        let select2Dropdown = $('.select2-results__options');
        let srch = $('.select2-search__field');
        srch.val(searchTerm2);//حفظ متن سرچ بار بعد از باز و بسته شدن دارپ داون
        srch.on('input', function (e) {

            var srchtrm = $(this).val();
            loadData2(1, srchtrm);
            searchTerm2 = srchtrm;//حفظ متن مورد جستجو جهت اسکرول های بعدی
            page2 = 1;//ریست کردن شماره صفحه با هر بار جستجوی جدید-مورد نیاز برای اسکرول کردن
        });
        select2Dropdown.off('scroll').on('scroll', function () {
            if (!isLastPage2 && select2Dropdown[0].scrollHeight - select2Dropdown.scrollTop() <= select2Dropdown.outerHeight()) {
                page2++;
                loadData2(page2, searchTerm2);

            }
        });
    });
    $('#kt_modal_add').on('hidden.bs.modal', function () {
        $('#VoteQuestionGroupId').select2('destroy').empty();
        ResetVariables();//بازسازی تمامی متغیر ها برای شروع مجدد
    });

    ///
    const $typeStatus = $('#question-editor-type-status');
    const $questionTypes = $('#VotequestionTypeIdSearch').attr('aria-busy', 'true');
    $.ajax({
        type: "GET",
        dataType: 'JSOn',
        url: '/VoteQuestionType/IndexResult',
        data: {
            pageSize: 100
        },
        success: function (data) {
            if (!data.length) {
                $typeStatus.text('نوع پرسشی برای انتخاب وجود ندارد.');
                return;
            }

            $typeStatus.addClass('d-none');
            for (var i = 0; i < data.length; i++) {
                $questionTypes.append(
                    '<label class="d-flex flex-stack cursor-pointer">' +
                    '<span class="d-flex align-items-center me-2">' +
                    '<span class="symbol symbol-50px me-6 mr-0">' +
                    '<span class="symbol-label color-item" data-color="' + data[i].color + '">' +
                    '<img src="' + data[i].icon + '" alt="" />' +
                    '</span>' +
                    '</span>' +
                    '<span class="d-flex flex-column">' +
                    '<span class="fw-bolder fs-6">' + data[i].title + '</span>' +
                    '<span class="fs-7 text-muted limitDataTable">' + data[i].description + '</span>' +
                    '</span>' +
                    '</span>' +
                    '<span class="form-check form-check-custom form-check-solid">' +
                    '<input class="form-check-input vote-type-radio" ' +
                    'type="radio" ' +
                    'name="VoteQuestionTypeId" ' +
                    'data-id="' + data[i].voteQuestionTypeId + '" ' +
                    'value="' + data[i].voteQuestionTypeId + '" />' +
                    '</span>' +
                    '</label>'
                );

            }
            document.querySelectorAll(".color-item").forEach(function (el) {
                const color = el.dataset.color.replace('!important', '').trim();
                el.style.setProperty('background-color', color, 'important');
            });

            $questionTypes.on("change", ".vote-type-radio", function () {
                const id = $(this).data("id");
                SelectTypeQestion(id);
            });

        },
        error: function () {
            $typeStatus.text('انواع پرسش بارگذاری نشد. صفحه را دوباره بارگذاری کنید.');
        },
        complete: function () {
            $questionTypes.removeAttr('aria-busy');
        }
    });



    $.ajax({
        type: "GET",
        dataType: 'JSOn',
        url: '/VoteQuestionGroup/GetAllActiveVoteQuestionGroupWithOutParentQuery',
        success: function (data2) {
            for (var i = 0; i < data2.length; i++) {
                var itemType = new Option(data2[i].title, data2[i].voteQuestionGroupId, false, false);
                $("#VoteQuestionGroupId").append(itemType);
            }
        }
    });

    $.ajax({
        type: "GET",
        dataType: 'JSOn',
        url: '/InputPattern/IndexResult',
        success: function (data3) {
            for (var i = 0; i < data3.length; i++) {
                var itemType = new Option(data3[i].title + "-" + data3[i].pattern, data3[i].inputPatternId, false, false);
                $("#InputPatternId").append(itemType);
            }
        }
    });







    $choiceOptions.repeater({
        initEmpty: false,

        show: function () {
            const $row = $(this);
            $row.find('.OrderIndex').val('');
            fillOptionPriorities();
            $row.find('.Weight').val('1').attr('data-last-integer-weight', '1');
            $row.slideDown(function () {
                $row.find('.VoteQuestionItemTitle').trigger('focus');
            });
        },

        hide: function (deleteElement) {
            $(this).find('.OrderIndex, .Weight').prop('disabled', true);
            $(this).slideUp(deleteElement);
        }
    });
    fillOptionPriorities();
});

var selected
function SelectTypeQestion(val) {

    selected =
        $('input[name="VoteQuestionTypeId"]:checked').val();

    if (!selected && val) {
        selected = String(val);
    }

    $('.showDetailQuestion .showDetailQuestionItem')
        .addClass('d-none');

    switch (String(selected)) {

        case "1":
            $("#RadioShowcase-Add").removeClass('d-none');
            break;

        case "10":
            $("#Star-Add").removeClass('d-none');
            break;

        case "3":
            $("#NumberShowcase-Add").removeClass('d-none');
            break;

        case "4":
            $("#TextInputShowcase-Add").removeClass('d-none');
            break;

        case "5":
            $("#DateTimeShowcase-Add").removeClass('d-none');
            break;

        case "6":
            $("#InputValid-Add").removeClass('d-none');
            break;

        case "11":
            $("#Range-Add").removeClass('d-none');
            break;

        case "12":
            $("#DataSourceSelection").removeClass('d-none');
            break;

        case "13":
            // Composition
            $("#CompositionShowcase-Add").removeClass('d-none');
            break;

        case "14":
            // محتوای نمایشی
            $("#DisplayContentShowcase-Add").removeClass('d-none');
            break;

        case "15":

            $("#bodyQuestionType15")
                .removeClass(
                    "d-none"
                );

            loadAttachmentFileTypes();

            break;
    }
}






var inputKeyWord = document.querySelector("input[name=KeyWord]");
var maxCharLength = 15; // Maximum allowed characters per tag
var errorMessage = document.getElementById("tag-error-message");

var tagify = new Tagify(inputKeyWord, {
    whitelist: ["مدیریت", "شعبه", "سخت", "رضایت", "آسان", "نظر خواهی", "نظرسنجی"],
    originalInputValueFormat: valuesArr => valuesArr.map(item => item.value).join(', '),
    maxTags: 10,
    delimiters: null,
    dropdown: {
        maxItems: 20,
        classname: "tagify__inline__suggestions",
        enabled: 0,
        closeOnSelect: false
    },
    validate: function (tagData) {
        // Reject tags that are over 5 characters long
        if (tagData.value.length > maxCharLength) {
            showErrorMessage(`حداکثر طول برچسب ${maxCharLength} کاراکتر است.`);
            return false; // Prevent adding the tag
        }
        hideErrorMessage();
        return true;
    }
});

function showErrorMessage(message) {
    errorMessage.innerText = message;

    errorMessage.classList.add('display-block');
    errorMessage.classList.remove('display-none');
}

function hideErrorMessage() {
    errorMessage.classList.add('display-none');
    errorMessage.classList.remove('display-block');
}





//console.log('FormValidation:', typeof FormValidation);
//console.log('validator:', typeof validator);
//console.log('form element:', document.getElementById('kt_add_Question_form'));



function validateVoteQuestionWeightInput(input) {

    if (input.value.length > 1 && input.value[0] === '0') {
        input.value = parseInt(input.value, 10);
    }

    const value = Number(input.value);

    if (isNaN(value) || value < 1) {
        input.value = 1;
    }
}

function validateVoteQuestionItemWeightInput(input) {

    const value = parseFloat(input.value);

    // چک کنید که مقدار عددی بوده و بین 0 و 1 باشد
    if (isNaN(value) || value < 0 || value > 1) {
        input.value = '';
        return;
    }

    // چک کردن تعداد اعشار
    const parts = input.value.split('.');
    if (parts.length > 1 && parts[1].length > 2) {
        input.value = parseFloat(input.value).toFixed(2); // محدود کردن به دو اعشار
    }

    // حذف صفرهای اضافی از ابتدا
    if (input.value.length > 1 && input.value[0] === '0' && input.value[1] !== '.') {
        input.value = parseFloat(input.value);
    }
}




// حذف کامل validator و replace با کد جدید
const submitButton = document.getElementById('add_Question_btn');

// تابع اعتبارسنجی ساده
function validateForm() {
    // بررسی نوع سوال
    const selectedType = document.querySelector('input[name="VoteQuestionTypeId"]:checked');
    if (!selectedType) {
        Swal.fire({
            text: "لطفا نوع پرسش را انتخاب نمایید.",
            icon: "warning",
            confirmButtonText: "تایید"
        });
        return false;
    }

    // بررسی گروه
    const groupVal = $("#SubVoteQuestionGroupId").val();
    if (!groupVal || groupVal === '') {
        Swal.fire({
            text: "لطفا نام گروه را انتخاب نمایید.",
            icon: "warning",
            confirmButtonText: "تایید"
        });
        return false;
    }

    // بررسی عنوان
    const title = $("#Title").val();
    if (!title || title.trim() === '') {
        Swal.fire({
            text: "لطفا عنوان را وارد نمایید.",
            icon: "warning",
            confirmButtonText: "تایید"
        });
        return false;
    }

    // بررسی کلمات کلیدی
    const keyWord = $("#KeyWord").val();
    if (!keyWord || keyWord.trim() === '') {
        Swal.fire({
            text: "لطفا کلمات کلیدی را وارد نمایید.",
            icon: "warning",
            confirmButtonText: "تایید"
        });
        return false;
    }

    return true;
}

// حذف رویدادهای قبلی و اضافه کردن رویداد جدید
if (submitButton) {
    // حذف ایونت‌های قبلی با clone
    const newSubmitButton = submitButton.cloneNode(true);
    submitButton.parentNode.replaceChild(newSubmitButton, submitButton);

    newSubmitButton.addEventListener('click', function (e) {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        if (!selected) {
            Swal.fire({
                text: "لطفا نوع پرسش را انتخاب نمایید.",
                icon: "warning",
                confirmButtonText: "تایید"
            });
            return;
        }

        if (Number(selected) === 1 && !validateChoiceOptions()) {
            return;
        }

        newSubmitButton.setAttribute('data-kt-indicator', 'on');
        newSubmitButton.disabled = true;

        let inputPattenrTemp = null;
        if (selected == 6) {
            var selectData = $("#InputPatternId").select2('data');
            if (selectData && selectData[0]) {
                inputPattenrTemp = selectData[0].id;
            }
        }

        var dataSourceId = null;
        if (selected == 12 && selectedDataSourceId) {
            dataSourceId = selectedDataSourceId;
        }

        var groupData = $("#VoteQuestionGroupId").select2('data');
        var subGroupData = $("#SubVoteQuestionGroupId").select2('data');

        var groupId = groupData && groupData[0] ? groupData[0].id : null;
        var subGroupId = subGroupData && subGroupData[0] ? subGroupData[0].id : null;

        var formData = new FormData();

        formData.append('VoteQuestionId', $("#VoteQuestionId").val() || '');
        formData.append('VoteQuestionGroupId', groupId || '');
        formData.append('SubVoteQuestionGroupId', subGroupId || '');
        formData.append('VoteQuestionTypeId', selected || '');
        formData.append('KeyWord', $("#KeyWord").val() || '');
        formData.append('Title', $("#Title").val() || '');
        formData.append('ValidationMessage', $("#ValidationMessage").val() || '');
        formData.append('InputPatternId', inputPattenrTemp ? Number(inputPattenrTemp) : '');
        formData.append('DataSourceId', dataSourceId ?? '');
        
        if (
            Number(selected) === 15
        ) {

            const minFiles =
                Number(
                    $("#AttachmentMinFiles")
                        .val()
                );


            const maxFiles =
                Number(
                    $("#AttachmentMaxFiles")
                        .val()
                );


            const maxFileSizeMB =
                Number(
                    $("#AttachmentMaxFileSizeMB")
                        .val()
                );


            /*
             * Backend Byte می‌خواهد
             */
            const maxFileSizeBytes =
                maxFileSizeMB
                *
                1024
                *
                1024;


            /*
             * خروجی Select Multiple:
             * ["1", "2", "5"]
             */
            const allowedFileTypeIds =
                $("#AttachmentAllowedFileTypeIds")
                    .val()
                ||
                [];


            formData.append(
                "AttachmentSetting.MinFiles",
                minFiles
            );


            formData.append(
                "AttachmentSetting.MaxFiles",
                maxFiles
            );


            formData.append(
                "AttachmentSetting.MaxFileSizeBytes",
                maxFileSizeBytes
            );


            allowedFileTypeIds.forEach(
                function (
                    fileTypeId,
                    index
                ) {

                    formData.append(
                        `AttachmentSetting.AllowedFileTypeIds[${index}]`,
                        Number(
                            fileTypeId
                        )
                    );

                }
            );
        }
        // ============================================
        // محتوای نمایشی
        // VoteQuestionTypeId = 14
        // ============================================

        // ============================================
        // Display Content
        // ============================================

        if (String(selected) === "14") {

            const description =
                ($("#DisplayContentDescription").val() || '')
                    .trim();

            const caption =
                ($("#DisplayContentImageCaption").val() || '')
                    .trim();

            const imageFile =
                document
                    .getElementById("DisplayContentImage")
                    ?.files?.[0];


            // متن نمایشی خود Question
            formData.append(
                'Description',
                description
            );


            // اگر تصویر انتخاب شده باشد
            if (imageFile) {

                formData.append(
                    'VoteQuestionMedias[0].VoteQuestionMediaId',
                    '0'
                );

                formData.append(
                    'VoteQuestionMedias[0].Caption',
                    caption
                );

                formData.append(
                    'VoteQuestionMedias[0].OrderIndex',
                    '1'
                );

                formData.append(
                    'VoteQuestionMedias[0].ImageFile',
                    imageFile
                );
            }
        }

        if (selected == 1) {
            let itemIndex = 0;

            $('#kt_repeater_RadioShowcase [data-repeater-item]:has(.OrderIndex:enabled)').each(function () {
                const $row = $(this);
                var title = $(this).find('.VoteQuestionItemTitle').val();
                const weight = $row.find('.Weight')[0].valueAsNumber;
                var orderIndex = $(this).find('.OrderIndex').val();
                var imageFile = $row.find('.file-input-option').first()[0]?.files?.[0];

                // اگر نه متن دارد نه فایل => ارسال نشود
                if ($.trim(title || '') === '' && !imageFile) {
                    return;
                }

                formData.append(`VoteQuestionItems[${itemIndex}].Title`, title || '');
                formData.append(`VoteQuestionItems[${itemIndex}].Weight`, String(weight));
                formData.append(`VoteQuestionItems[${itemIndex}].OrderIndex`, orderIndex || '');

                if (imageFile) {
                    formData.append(`VoteQuestionItems[${itemIndex}].ImageFile`, imageFile);
                }

                itemIndex++;
            });
        }

        $.ajax({
            type: "POST",
            url: '/VoteQuestion/Create',
            data: formData,
            processData: false,
            contentType: false,
            dataType: 'json',
            beforeSend: function (xhr) {
                xhr.setRequestHeader(
                    "RequestVerificationToken",
                    $('input[name="__RequestVerificationToken"]').val()
                );
            },
            success: function (response) {
                newSubmitButton.removeAttribute('data-kt-indicator');
                newSubmitButton.disabled = false;

                if (response.success) {
                    Swal.fire({
                        text: "با موفقیت انجام شد",
                        icon: "success",
                        confirmButtonText: "بستن"
                    }).then((result) => {
                        if (result.isConfirmed) {
                            window.location.href = '/VoteQuestion/Index';
                        }
                    });
                } else {
                    Swal.fire({
                        text: response.operationErrors && response.operationErrors[0]
                            ? response.operationErrors[0].description
                            : "خطا در ثبت اطلاعات",
                        icon: "warning",
                        confirmButtonText: "بستن"
                    });
                }
            },
            error: function (xhr, status, error) {
                newSubmitButton.removeAttribute('data-kt-indicator');
                newSubmitButton.disabled = false;

                Swal.fire({
                    text: "خطا ! لطفا با ادمین سیستم تماس بگیرید",
                    icon: "warning",
                    confirmButtonText: "بستن"
                });

                console.log("AJAX Error:", xhr, status, error);
            }
        });
    });
}

function loadAttachmentFileTypes() {

    const $select =
        $("#AttachmentAllowedFileTypeIds");


    /*
     * اگر قبلاً لود شده
     * دوباره درخواست نزن
     */
    if (
        $select.data(
            "file-types-loaded"
        ) === true
    ) {
        return;
    }


    $.ajax({

        type:
            "GET",

        dataType:
            "json",

        url:
            "/VoteQuestion/GetAllFileTypes",

        success: function (response) {

            /*
             * بسته به ساختار Response
             */
            const items =
                Array.isArray(response)
                    ? response
                    : (
                        response?.result
                        ??
                        response?.data
                        ??
                        []
                    );


            $select.empty();


            items.forEach(
                function (item) {

                    /*
                     * اگر DTO بک‌اند نام‌های دیگری دارد
                     * فقط همین دو قسمت را مطابق Response تغییر می‌دهیم
                     */
                    const fileTypeId =
                        item.fileTypeId
                        ??
                        item.FileTypeId;


                    const title =
                        item.title
                        ??
                        item.Title
                        ??
                        item.extension
                        ??
                        item.Extension
                        ??
                        item.code
                        ??
                        item.Code;


                    if (
                        fileTypeId === null ||
                        fileTypeId === undefined
                    ) {
                        return;
                    }


                    const option =
                        new Option(
                            title || fileTypeId,
                            fileTypeId,
                            false,
                            false
                        );


                    $select.append(
                        option
                    );

                }
            );


            $select.data(
                "file-types-loaded",
                true
            );


            /*
             * Select2
             */
            if (
                $select.hasClass(
                    "select2-hidden-accessible"
                )
            ) {

                $select
                    .select2(
                        "destroy"
                    );

            }


            $select.select2({

                width:
                    "100%",

                placeholder:
                    "فرمت‌های مجاز را انتخاب نمایید",

                allowClear:
                    true,

                closeOnSelect:
                    false

            });

        },


        error: function (
            xhr,
            status,
            error
        ) {

            console.error(
                "GetAllFileTypes Error:",
                xhr,
                status,
                error
            );


            Swal.fire({

                text:
                    "خطا در دریافت فرمت‌های مجاز فایل",

                icon:
                    "warning",

                confirmButtonText:
                    "بستن"

            });

        }

    });
}

// متغیرهای وضعیت
var dsLoading = false;
var dsPage = 1;
var dsTotalCount = 0;
var isFirstLoad = true;
var selectedDataSourceId = null;

// تابع راه‌اندازی و مقداردهی مجدد Select2 با حفظ موقعیت والد
function initSelect2() {
    // تخریب نمونه قبلی خراب شده در حالت مخفی
    if ($('#SearchDataSourceId').hasClass("select2-hidden-accessible")) {
        $('#SearchDataSourceId').select2('destroy');
    }

    // مقداردهی با ابعاد فیزیکی جدید و تثبیت در کانتینر والد
    $('#SearchDataSourceId').select2({
        placeholder: 'جستجو و انتخاب کنید...',
        allowClear: true,
        width: '100%',
        dropdownParent: $('#DataSourceSelection')
    });
}

// تابع بارگذاری داده‌ها
function loadDataSources(page, searchTerm, append) {
    if (dsLoading) return;
    dsLoading = true;

    // نمایش وضعیت بارگذاری
    if (!append) {
        $('#SearchDataSourceId').html('<option value="">در حال بارگذاری...</option>');
    }

    $.ajax({
        type: "GET",
        url: '/DataSource/GetDataSourcesForDropdown',
        data: { page: page, pageSize: 10 },
        success: function (data) {
            // اگر append نباشد، لیست را خالی کن
            if (!append) {
                $('#SearchDataSourceId').empty();
                // آپشن پیش‌فرض خالی
                $('#SearchDataSourceId').append(new Option('', '', false, false));
            }

            // اضافه کردن آیتم‌های جدید
            data.forEach(function (item) {
                $('#SearchDataSourceId').append(new Option(item.text, item.id, false, false));
            });

            // به‌روزرسانی اطلاعات pagination
            if (data.length > 0) {
                dsTotalCount = data[0].TotalCount || 0;
                dsPage = data[0].PageNumber || page;
            } else if (append) {
                dsTotalCount = dsTotalCount || 0;
            }

            dsLoading = false;
            isFirstLoad = false;

            // باز کردن مجدد Select2 فقط در صورتی که المان واقعاً در صفحه نمایش داده شده باشد
            if (!append && $('#DataSourceSelection').is(':visible')) {
                $('#SearchDataSourceId').select2('open');
            }

            // حذف پیام بارگذاری
            $('#ds-loading-msg').remove();
        },
        error: function () {
            dsLoading = false;
            isFirstLoad = false;
            if (!append) {
                $('#SearchDataSourceId').empty();
                $('#SearchDataSourceId').append(new Option('خطا در بارگذاری', '', false, false));
            }
            $('#ds-loading-msg').remove();
        }
    });
}

// اولین راه‌اندازی در زمان لود صفحه
initSelect2();

// ناظر هوشمند روی تغییرات کلاس d-none در والد
// به محض برداشته شدن کلاس d-none، افکت‌ها و پوزیشن Select2 اصلاح می‌شود
var observer = new MutationObserver(function (mutations) {
    mutations.forEach(function (mutation) {
        if (mutation.attributeName === "class") {
            var isHidden = $('#DataSourceSelection').hasClass('d-none');
            if (!isHidden) {
                // اگر بخش نمایش داده شد، Select2 را از نو می‌سازیم تا ابعاد دقیق را بگیرد
                initSelect2();
                loadDataSources(1, '', false);
            }
        }
    });
});

var targetNode = document.getElementById('DataSourceSelection');
if (targetNode) {
    observer.observe(targetNode, { attributes: true });
}

// رویداد باز شدن Select2 - بار اول
$('#SearchDataSourceId').on('select2:open', function (e) {
    if (isFirstLoad || $('#SearchDataSourceId option').length <= 1) {
        loadDataSources(1, '', false);
    }

    // پیاده‌سازی اسکرول نامحدود
    setTimeout(function () {
        var $resultsContainer = $('.select2-results__options');

        // حذف event های قبلی برای جلوگیری از چندباره شدن
        $resultsContainer.off('scroll.ds');

        $resultsContainer.on('scroll.ds', function () {
            var $this = $(this);
            if ($this.scrollTop() + $this.innerHeight() >= $this[0].scrollHeight - 10) {
                var loadedCount = dsPage * 10;
                if (!dsLoading && loadedCount < dsTotalCount && dsTotalCount > 0) {
                    if (!$('#ds-loading-msg').length) {
                        $this.append('<li id="ds-loading-msg" class="select2-results__option">در حال بارگذاری موارد بیشتر...</li>');
                    }
                    loadDataSources(dsPage + 1, '', true);
                }
            }
        });
    }, 200);
});

// رویداد انتخاب آیتم
$('#SearchDataSourceId').on('select2:select', function (e) {
    var data = e.params.data;
    selectedDataSourceId = data.id;
    //console.log('DataSourceId selected:', selectedDataSourceId);
});

// برای پاک کردن انتخاب
$('#SearchDataSourceId').on('select2:unselect', function (e) {
    selectedDataSourceId = null;
});

$(document).ready(function () {
    // فقط در صورتی که بخش از ابتدا آشکار باشد، لود اولیه انجام می‌شود
    if ($('#SearchDataSourceId').length > 0 && !$('#DataSourceSelection').hasClass('d-none')) {
        loadDataSources(1, '', false);
    }
});

// متد کمکی برای ویرایش و انتخاب دستی آیتم از بیرون
function setSelectedDataSource(dataSourceId) {
    if (dataSourceId) {
        $('#SearchDataSourceId').val(dataSourceId).trigger('change');
        selectedDataSourceId = dataSourceId;
    }
}


$(document).on('change', '.ImageFileCreate', function () {
    const file = this.files && this.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
        Swal.fire({ text: "فایل انتخابی باید تصویر باشد.", icon: "warning", confirmButtonText: "تایید" });
        $(this).val('');
        return;
    }

    const $input = $(this);
    const $box = $input.closest('.file-preview-box');
    const $label = $box.find('.js-label-trigger').first();
    const $wrapper = $box.find('.image-preview-wrapper').first();
    const $img = $wrapper.find('.option-image-preview').first();
    const $status = $box.find('.js-upload-status').first(); // ✅ هر دو = $box

    // ✅ نمایش فوری تیک سبز — قبل از آماده شدن preview
    $status.removeClass('d-none');

    const reader = new FileReader();
    reader.onload = function (e) {
        $img.attr('src', e.target.result);
        $wrapper.removeClass('d-none');
        $label.addClass('d-none'); // دکمه انتخاب عکس را مخفی کن
    };
    reader.readAsDataURL(file);
});


// کلیک روی عکس برای تغییر (دکمه انتخاب عکس را دوباره برمی‌گرداند)
$(document).on('click', '.option-image-preview', function () {
    const $box = $(this).closest('.file-preview-box');
    const $wrapper = $(this).closest('.image-preview-wrapper');
    const $label = $box.find('.js-label-trigger');
    const $input = $box.find('.ImageFileCreate');

    $input.val(''); // ریست کردن مقدار فایل قبلی
    $wrapper.addClass('d-none'); // مخفی کردن عکس قبلی
    $label.removeClass('d-none'); // نمایش مجدد دکمه انتخاب عکس
});

// کلیک روی ضربدر حذف
$(document).on('click', '.js-remove-image', function (e) {
    e.preventDefault();
    e.stopPropagation();

    const $box = $(this).closest('.file-preview-box');
    const $wrapper = $box.find('.image-preview-wrapper').first();
    const $label = $box.find('.js-label-trigger');
    const $input = $box.find('.ImageFileCreate');
    const $flag = $box.closest('[data-repeater-item]').find('.js-remove-image-flag');

    $wrapper.addClass('d-none');
    $label.removeClass('d-none'); // دکمه انتخاب عکس ظاهر شود
    $input.val('');
    $flag.val('true');
});
$(document).on('click', '.js-remove-image', function (e) {
    e.preventDefault();
    e.stopPropagation();

    const $box = $(this).closest('.file-preview-box');
    const $row = $(this).closest('[data-repeater-item]');
    const $wrapper = $box.find('.image-preview-wrapper').first();
    const $img = $wrapper.find('.option-image-preview').first();
    const $input = $box.find('.ImageFileCreate').first();

    // اضافه کردن متغیر لیبل برای نمایش مجدد دکمه سفارشی شما
    const $label = $box.find('.js-label-trigger').first();

    const $flag = $row.find('.js-remove-image-flag').first();
    const $existingUrl = $row.find('.js-existing-image-url').first();
    const $status = $row.find('.js-upload-status').first(); // ← جدید
    // ۱. پاک کردن مقادیر پیش‌نمایش
    $img.attr('src', '');
    $wrapper.addClass('d-none');

    // ۲. ریست کردن اینپوت فایل
    $input.val('');

    // ۳. نمایش مجدد دکمه "انتخاب عکس" (Label)
    $label.removeClass('d-none');
    // ۴. مخفی کردن تیک سبز چون عکس حذف شد ← جدید
    $status.addClass('d-none');
    // 5. فعال کردن پرچم حذف برای سمت سرور
    $flag.val('true');
    if ($existingUrl.length) {
        $existingUrl.val('');
    }
});

// ۱. رویداد کلیک روی عکس برای بزرگنمایی
$(document).off('click', '.option-image-preview').on('click', '.option-image-preview', function (e) {
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();

    const src = $(this).attr('src');
    if (src && src.trim() !== '' && !src.includes('placeholder')) {
        $('#imagePreviewModalImg').attr('src', src);
        $('#imagePreviewModal').fadeIn(200).css('display', 'flex');
    }
});


// ۲. بستن مودال با کلیک روی هر نقطه از پس‌زمینه یا دکمه ضربدر
$(document).on('click', '#imagePreviewModal, .close-zoom-modal', function (e) {
    // اگر کاربر دقیقا روی خودِ تصویر کلیک کرد، مودال بسته نشود
    if ($(e.target).is('#imagePreviewModalImg')) return;

    $('#imagePreviewModal').fadeOut(200);
});
