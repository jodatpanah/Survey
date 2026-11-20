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

function validateOptionPriorities() {
    fillOptionPriorities();
    const invalidField = document.querySelector(
        '#kt_repeater_RadioShowcase .OrderIndex:enabled:invalid'
    );
    if (invalidField) {
        invalidField.reportValidity();
        return false;
    }
    return true;
}

console.log('=== فایل update.js بارگذاری شد ===');

$(document).ajaxError(function (event, jqxhr, settings, thrownError) {
    if (jqxhr.status == 401) {
        Swal.fire({
            text: "مدت زمان مجاز استفاده از سامانه به پایان رسیده است و برای استفاده مجدد باید لاگین کنید",
            icon: "warning",
            buttonsStyling: !1,
            confirmButtonText: "تایید",
            customClass: { confirmButton: "btn btn-primary" }
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
            customClass: { confirmButton: "btn btn-primary" }
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
            customClass: { confirmButton: "btn btn-primary" }
        })
    }
});

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

function updateWeightDisplay(input, value = input.value) {
    const $box = $(input).closest('.weight-box');
    $box.find('.weight-min').text(input.min);
    $box.find('.weight-max').text(input.max);
    $box.find('.weight-value-display').text(value);
}

$(document).ready(function () {
    let selected = $('#VoteQuestionTypeId').val();
    console.log('selected مقدار اولیه:', selected);

    let page = 1;
    let isLoading = false;

    const $choiceOptions = $('#kt_repeater_RadioShowcase');

    $choiceOptions.find('.Weight[data-saved-weight]').each(function () {
        const savedWeight = this.dataset.savedWeight;
        const value = Number(savedWeight);
        if (savedWeight === '' || !Number.isFinite(value)) {
            return;
        }

        // Keep saved values from being rounded or clamped by the slider.
        this.min = Math.min(Number(this.min), value);
        this.max = Math.max(Number(this.max), value);
        if (!Number.isInteger(value)) {
            this.step = 'any';
        }
        this.value = savedWeight;
        updateWeightDisplay(this, savedWeight);
    });

    $choiceOptions.on('input', '.Weight', function () {
        delete this.dataset.savedWeight;
        updateWeightDisplay(this);
    });

    function appendOptions(data) {
        $('#VoteQuestionGroupId').select2();
        var option = new Option('', '', false, false);
        $('#VoteQuestionGroupId').append(option);
        data.forEach(item => {
            var option = new Option(item.title, item.voteQuestionGroupId, false, false);
            $('#VoteQuestionGroupId').append(option);
        });
        $('#VoteQuestionGroupId').select2('open');
    }

    function loadData(pageNumber, searchTerm) {
        if (isLoading) return;
        isLoading = true;
        $('.loading').show();

        $.ajax({
            type: "GET",
            dataType: 'json',
            url: '/VoteQuestionGroup/GetAllActiveVoteQuestionGroupWithOutParentQuery',
            data: { page: pageNumber, title: searchTerm },
            success: function (data) {
                $('.loading').hide();
                if (data.length === 0) {
                    isLoading = true;
                    return;
                }
                appendOptions(data);
                isLoading = false;
            },
            error: function () {
                $('.loading').hide();
                isLoading = false;
            }
        });
    }

    $('#VoteQuestionGroupId').select2({}).on('select2:open', function () {
        let select2Dropdown = $('.select2-results__options');
        select2Dropdown.off('scroll').on('scroll', function () {
            if (!isLoading && select2Dropdown[0].scrollHeight - select2Dropdown.scrollTop() <= select2Dropdown.outerHeight()) {
                page++;
                let searchTerm = $('#VoteQuestionGroupId').data('select2').dropdown.$search.val();
                loadData(page, searchTerm);
            }
        });
    });

    $('#VotequestionTypeId').empty();
    $.ajax({
        type: "GET",
        dataType: 'JSON',
        url: '/VoteQuestionType/IndexResult',
        data: {
            pageSize: 100
        },
        success: function (data) {
            for (var i = 0; i < data.length; i++) {
                $("#VotequestionTypeIdSearch").append(
                    '<label class="d-flex flex-stack cursor-pointer mb-5">' +
                    '<span class="d-flex align-items-center me-2">' +
                    '<span class="symbol symbol-50px me-6">' +
                    '<span class="symbol-label color-item" data-color="' + data[i].color + '">' +
                    '<img src="' + data[i].icon + '"/>' +
                    '</span>' +
                    '</span>' +
                    '<span class="d-flex flex-column">' +
                    '<span class="fw-bolder fs-6">' + data[i].title + '</span>' +
                    '<span class="fs-7 text-muted">' + data[i].description + '</span>' +
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

            var VotequestionTypeNumber = $('#VoteQuestionTypeId').val();
            $('#VotequestionTypeIdSearch input[value="' + VotequestionTypeNumber + '"]').prop('checked', true);

            document.querySelectorAll(".color-item").forEach(function (el) {
                const color = el.dataset.color.replace('!important', '').trim();
                el.style.setProperty('background-color', color, 'important');
            });

            $(document).on("change", ".vote-type-radio", function () {
                const id = $(this).data("id");
                SelectTypeQestion(id);
            });
        }
    });

    $.ajax({
        type: "GET",
        dataType: 'JSON',
        url: '/VoteQuestionGroup/GetAllActiveVoteQuestionGroupWithOutParentQuery',
        success: function (data2) {
            for (var i = 0; i < data2.length; i++) {
                var itemType = new Option(data2[i].title, data2[i].voteQuestionGroupId, false, false);
                $("#VoteQuestionGroupId").append(itemType);
            }
            // مقدار فعلی را ست کنید
            $('#VoteQuestionGroupId').val($('#VoteQuestionGroupId option:first').val()).trigger('change');
        }
    });

    $.ajax({
        type: "GET",
        dataType: 'JSON',
        url: '/InputPattern/IndexResult',
        success: function (data3) {
            for (var i = 0; i < data3.length; i++) {
                var itemType = new Option(data3[i].title + "-" + data3[i].pattern, data3[i].inputPatternId, false, false);
                $("#InputPatternId").append(itemType);
            }
        }
    });

    $('#VoteQuestionGroupId').on('select2:select', function (e) {
        var data = e.params.data;
        $.ajax({
            type: "GET",
            dataType: 'JSON',
            url: '/VoteQuestionGroup/GetAllVoteQuestionGroupParentById',
            data: { parentid: data.id },
            success: function (data) {
                $('#SubVoteQuestionGroupId').empty();
                if (data.length > 0) {
                    for (var i = 0; i < data.length; i++) {
                        var itemType = new Option(data[i].title, data[i].voteQuestionGroupId, false, false);
                        $("#SubVoteQuestionGroupId").append(itemType);
                    }
                }
            }
        });
    });

    $choiceOptions.repeater({
        initEmpty: false,

        show: function () {
            const $row = $(this);

            // پاک کردن مقادیر ردیف جدید
            $row.find('.VoteQuestionItemId').val('');
            $row.find('.ExistingImageUrl').val('');
            $row.find('.js-remove-image-flag').val('false');

            $row.find('.VoteQuestionItemTitle').val('');
            $row.find('.OrderIndex').val('');

            $row.find('.Weight').each(function () {
                delete this.dataset.savedWeight;
                this.min = '-10';
                this.max = '10';
                this.step = '1';
                this.value = '1';
                updateWeightDisplay(this);
            });

            // پاک کردن فایل انتخاب‌شده
            $row.find('.ImageFileCreate').val('');

            // بازگرداندن وضعیت انتخاب عکس
            $row.find('.image-preview-wrapper')
                .addClass('d-none');

            $row.find('.option-image-preview')
                .attr('src', '');

            $row.find('.js-label-trigger')
                .removeClass('d-none');

            fillOptionPriorities();
            $row.slideDown(function () {
                $row.find('.VoteQuestionItemTitle').trigger('focus');
            });
        },

        hide: function (deleteElement) {
            if (confirm('آیا از حذف این گزینه اطمینان دارید؟')) {
                $(this).find('.OrderIndex').prop('disabled', true);
                $(this).slideUp(deleteElement);
            }
        }
    });
    fillOptionPriorities();


    // نمایش بخش مربوط به نوع سوال
    $('.showDetailQuestion .showDetailQuestionItem').addClass('d-none');
    switch (selected) {
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
            //منبع داده
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
        default:
    }
});

function loadAttachmentFileTypesForUpdate() {

    const $select =
        $("#AttachmentAllowedFileTypeIds");


    const selectedIds =
        getCurrentAttachmentAllowedFileTypeIds()
            .map(String);


    $.ajax({

        type:
            "GET",

        dataType:
            "json",

        url:
            "/VoteQuestion/GetAllFileTypes",

        success: function (response) {

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


            if (
                $select.hasClass(
                    "select2-hidden-accessible"
                )
            ) {

                $select.select2(
                    "destroy"
                );

            }


            $select.empty();


            items.forEach(
                function (item) {

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
                        fileTypeId === undefined ||
                        fileTypeId === null
                    ) {

                        return;

                    }


                    const isSelected =
                        selectedIds.includes(
                            String(fileTypeId)
                        );


                    const option =
                        new Option(
                            title || fileTypeId,
                            fileTypeId,
                            isSelected,
                            isSelected
                        );


                    $select.append(
                        option
                    );

                }
            );


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


            $select.trigger(
                "change"
            );

        }

    });
}

$(document).ready(
    function () {

        const questionTypeId =
            Number(
                '@Model.VoteQuestionTypeId'
            );


        if (
            questionTypeId === 15
        ) {

            $("#bodyQuestionType15")
                .removeClass(
                    "d-none"
                );


            loadAttachmentFileTypesForUpdate();

        }

    }
);

function loadAttachmentFileTypesForEdit(
    selectedFileTypeIds
) {

    const $select =
        $("#AttachmentAllowedFileTypeIds");


    const selectedIds =
        Array.isArray(selectedFileTypeIds)
            ? selectedFileTypeIds.map(String)
            : [];


    $.ajax({

        type:
            "GET",

        dataType:
            "json",

        // اگر Controller متفاوت است
        // فقط همین URL را مطابق route واقعی تغییر بده
        url:
            "/VoteQuestion/GetAllFileTypes",


        success: function (response) {

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


            if (
                $select.hasClass(
                    "select2-hidden-accessible"
                )
            ) {

                $select.select2(
                    "destroy"
                );

            }


            $select.empty();


            items.forEach(
                function (item) {

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


                    const isSelected =
                        selectedIds.includes(
                            String(fileTypeId)
                        );


                    const option =
                        new Option(
                            title || fileTypeId,
                            fileTypeId,
                            isSelected,
                            isSelected
                        );


                    $select.append(
                        option
                    );

                }
            );


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


            $select.trigger(
                "change"
            );

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

        }

    });
}

// تابع انتخاب نوع سوال
function SelectTypeQestion(val) {
    $('#VoteQuestionTypeId').val(val);
    var selected = $('input[name="VoteQuestionTypeId"]:checked').val();
    if (!selected && val) {
        selected = val;
    }

    $('.showDetailQuestion .showDetailQuestionItem').addClass('d-none');
    switch (selected) {
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
            //منبع داده
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
        default:
    }
}

// Tagify برای کلمات کلیدی
var inputKeyWord = document.querySelector("input[name=KeyWord]");
var maxCharLength = 15;
var errorMessage = document.getElementById("tag-error-message");
var apiResponse = inputKeyWord.value;
inputKeyWord.value = '';
var tagsArray = apiResponse.split(',').map(tag => tag.trim());
let isAddingInitialTags = true;

var tagify = new Tagify(inputKeyWord, {
    whitelist: ["مدیریت", "شعبه", "سخت", "رضایت", "آسان", "نظر خواهی", "نظرسنجی"],
    originalInputValueFormat: valuesArr => valuesArr.map(item => item.value).join(', '),
    maxTags: 10,
    delimiters: ",",
    dropdown: { maxItems: 20, classname: "tagify__inline__suggestions", enabled: 0, closeOnSelect: false },
    validate: function (tagData) {
        if (!isAddingInitialTags && tagData.value.length > maxCharLength) {
            showErrorMessage(`حداکثر طول برچسب ${maxCharLength} کاراکتر است.`);
            return false;
        }
        hideErrorMessage();
        isAddingInitialTags = false;
        return true;
    }
});

function showErrorMessage(message) {
    errorMessage.innerText = message;
    errorMessage.classList.add('display-block');
    errorMessage.classList.remove('display-none');
    inputKeyWord.classList.add('tagify__input--error');
}

function hideErrorMessage() {
    errorMessage.classList.add('display-none');
    errorMessage.classList.remove('display-block');
    inputKeyWord.classList.remove('tagify__input--error');
}

tagify.addTags(tagsArray);
tagify.on('input', function (e) {
    var inputLength = e.detail.input.value.length;
    if (inputLength > maxCharLength) {
        showErrorMessage(`حداکثر طول برچسب ${maxCharLength} کاراکتر است.`);
    } else {
        hideErrorMessage();
    }
});

// اعتبارسنجی ساده بدون validator مشکل‌دار
const submitButton = document.getElementById('add_Question_btn');

function validateForm() {
    const selectedType = document.querySelector('input[name="VoteQuestionTypeId"]:checked');
    if (!selectedType) {
        Swal.fire({ text: "لطفا نوع پرسش را انتخاب نمایید.", icon: "warning", confirmButtonText: "تایید" });
        return false;
    }

    const groupVal = $("#SubVoteQuestionGroupId").val();
    if (!groupVal || groupVal === '') {
        Swal.fire({ text: "لطفا نام گروه را انتخاب نمایید.", icon: "warning", confirmButtonText: "تایید" });
        return false;
    }

    const title = $("#Title").val();
    if (!title || title.trim() === '') {
        Swal.fire({ text: "لطفا عنوان را وارد نمایید.", icon: "warning", confirmButtonText: "تایید" });
        return false;
    }

    const keyWord = $("#KeyWord").val();
    if (!keyWord || keyWord.trim() === '') {
        Swal.fire({ text: "لطفا کلمات کلیدی را وارد نمایید.", icon: "warning", confirmButtonText: "تایید" });
        return false;
    }

    return true;
}

if (submitButton) {

    const newSubmitButton = submitButton.cloneNode(true);
    submitButton.parentNode.replaceChild(newSubmitButton, submitButton);

    newSubmitButton.addEventListener('click', function (e) {
        e.preventDefault();

        console.log('کلیک دکمه ویرایش - شروع فرآیند');

        if (!validateForm()) {
            return;
        }

        var selectedType = $('input[name="VoteQuestionTypeId"]:checked').val();
        console.log(selectedType)
        if (!selectedType) {
            Swal.fire({
                text: "لطفا نوع پرسش را انتخاب نمایید.",
                icon: "warning",
                confirmButtonText: "تایید"
            });
            return;
        }

        if (Number(selectedType) === 1 && !validateOptionPriorities()) {
            return;
        }

        newSubmitButton.setAttribute('data-kt-indicator', 'on');
        newSubmitButton.disabled = true;

        let inputPattenrTemp = null;
        if (selectedType == 6) {
            var selectData = $("#InputPatternId").select2('data');
            if (selectData && selectData[0]) {
                inputPattenrTemp = selectData[0].id;
            }
        }

        var groupData = $("#VoteQuestionGroupId").select2('data');
        var subGroupData = $("#SubVoteQuestionGroupId").select2('data');

        var groupId = groupData && groupData[0] ? groupData[0].id : null;
        var subGroupId = subGroupData && subGroupData[0] ? subGroupData[0].id : null;

        var dataSourceId = null;
        if (selectedType == 12 && selectedDataSourceId) {
            dataSourceId = selectedDataSourceId;
        }

        var formData = new FormData();

        formData.append('VoteQuestionId', $("#VoteQuestionId").val() || '');
        formData.append('VoteQuestionGroupId', groupId || '');
        formData.append('VoteQuestionGroupChildId', subGroupId || '');
        formData.append('VoteQuestionTypeId', selectedType || '');
        formData.append('KeyWord', $("#KeyWord").val() || '');
        formData.append('Title', $("#Title").val() || '');
        formData.append('ValidationMessage', $("#ValidationMessage").val() || '');
        formData.append('InputPatternId', inputPattenrTemp ? Number(inputPattenrTemp) : '');
        formData.append('DataSourceId', dataSourceId ?? '');
        formData.append(
            'Title',
            $("#Title").val() || ''
        );

        if (String(selectedType) === "15") {
            $("#bodyQuestionType15")
                .removeClass(
                    "d-none"
                );


            loadAttachmentFileTypesForUpdate();
        }

        if (String(selectedType) === "14") {

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

        if (Number(selectedType) === 1) {
            let itemIndex = 0;

            $('#kt_repeater_RadioShowcase [data-repeater-item]:has(.OrderIndex:enabled)').each(function () {
                const $row = $(this);

                const itemId = $row.find('.VoteQuestionItemId').val();
                const title = $row.find('.VoteQuestionItemTitle').val();
                const weightInput = $row.find('.Weight')[0];
                const weight = weightInput?.dataset.savedWeight ?? weightInput?.value;
                const orderIndex = $row.find('.OrderIndex').val();
                const existingImageUrl = $row.find('.ExistingImageUrl').val();

                const fileInput = $row.find('.file-input-option').first()[0];
                const imageFile = fileInput?.files?.[0];

                // ردیف جدید و کاملاً خالی ارسال نشود
                if ($.trim(title || '') === '' && !imageFile && !itemId) {
                    return;
                }

                // این نام باید دقیقاً با نام کالکشن در DTO والدِ Update یکی باشد.
                const prefix = `VoteQuestionItemsList[${itemIndex}]`;

                formData.append(`${prefix}.VoteQuestionItemId`, itemId || '');
                formData.append(`${prefix}.Title`, title || '');
                if (weight) {
                    formData.append(`${prefix}.Weight`, weight);
                }
                formData.append(`${prefix}.OrderIndex`, orderIndex || '0');
                formData.append(`${prefix}.ImageUrl`, existingImageUrl || '');

                // تنها در صورت انتخاب فایل جدید
                if (imageFile instanceof File && imageFile.size > 0) {
                    formData.append(
                        `${prefix}.ImageFile`,
                        imageFile,
                        imageFile.name
                    );
                }

                itemIndex++;
            });
        }


        $.ajax({
            type: "POST",
            url: '/VoteQuestion/Update',
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

function getCurrentAttachmentAllowedFileTypeIds() {

    const value =
        $(
            "#CurrentAttachmentAllowedFileTypeIds"
        ).val() || "";


    if (!value) {
        return [];
    }


    return value
        .split(",")
        .map(function (id) {

            return Number(id);

        })
        .filter(function (id) {

            return Number.isFinite(id);

        });
}

//$(document).on('input', '.js-vote-question-weight', function () {
//    validateVoteQuestionWeightInput(this);
//});
//function validateVoteQuestionWeightInput(input) {
//    if (input.value.length > 1 && input.value[0] === '0') {
//        input.value = parseInt(input.value, 10);
//    }
//    const value = Number(input.value);
//    if (isNaN(value) || value < 1) {
//        input.value = 1;
//    }
//}

function validateVoteQuestionItemWeightInput(input) {
    const value = parseFloat(input.value);
    if (isNaN(value) || value < 0 || value > 1) {
        input.value = '';
        return;
    }
    const parts = input.value.split('.');
    if (parts.length > 1 && parts[1].length > 2) {
        input.value = parseFloat(input.value).toFixed(2);
    }
    if (input.value.length > 1 && input.value[0] === '0' && input.value[1] !== '.') {
        input.value = parseFloat(input.value);
    }
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
                        $this.append('<li id="ds-loading-msg" class="select2-results__option" style="text-align:center;color:#999;padding:10px;">در حال بارگذاری موارد بیشتر...</li>');
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
    console.log('DataSourceId selected:', selectedDataSourceId);
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


// ۱. رویداد تغییر اینپوت آپلود فایل
$(document).on('change', '.ImageFileCreate', function () {
    const file = this.files && this.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
        Swal.fire({
            text: "فایل انتخابی باید تصویر باشد.",
            icon: "warning",
            confirmButtonText: "تایید"
        });
        $(this).val('');
        return;
    }

    const $input = $(this);
    const $row = $input.closest('[data-repeater-item]');
    const $wrapper = $row.find('.image-preview-wrapper').first();
    const $img = $wrapper.find('.option-image-preview').first();
    const $flag = $row.find('.js-remove-image-flag').first();
    const reader = new FileReader();
    const $status = $row.find('.js-upload-status').first(); // ← جدید

    // ✅ نمایش فوری تیک سبز — حتی قبل از اینکه preview آماده شود
    $status.removeClass('d-none');

    reader.onload = function (e) {
        $img.attr('src', e.target.result);
        $wrapper.removeClass('d-none');
        $row.find('.js-label-trigger').addClass('d-none');
        $flag.val('false'); // لغو پرچم حذف چون عکس جدید انتخاب شد
    };
    reader.readAsDataURL(file);
});

// ۲. کلیک روی دکمه حذف تصویر (ضربدر)
// ۲. کلیک روی دکمه حذف تصویر (ضربدر)
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

    // ۳. نمایش مجدد دکمه "انتخاب عکس"
    $label.removeClass('d-none');

    // ۴. مخفی کردن تیک سبز چون عکس حذف شد ← جدید
    $status.addClass('d-none');

    // ۵. فعال کردن پرچم حذف برای سمت سرور
    $flag.val('true');
    if ($existingUrl.length) {
        $existingUrl.val('');
    }
});

// ۱. رویداد کلیک روی عکس برای بزرگنمایی
$(document).on('click', '.option-image-preview', function (e) {
    // جلوگیری از تداخل با دکمه حذف اگر احتمالا روی هم هستند
    if ($(e.target).hasClass('js-remove-image')) return;

    const src = $(this).attr('src');

    if (src && src.trim() !== "" && !src.includes('placeholder')) {
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

