let page = 1;
let page2 = 1;
let page3 = 1;
let isLastPage = false;
let isLastPage2 = false;
let isLastPage3 = false;
let searchTerm;
let searchTerm2;
let searchTerm3;
let SelectedParentId;
let SelectedSubQuestionId;
var filteredRecordCount;
let isGroupSearch = Boolean(false);
let isProcessingStep2 = false;
var VotePackageIdVal;
let activeConfigurationTarget = null;
let nextVotePackageDetailOrderIndex = 1;
// ======================================================
// Vote Package Question Sections
// فعلاً Front-end Mock - بعداً به Backend وصل می‌شود
// ======================================================
let activeCompositionDetailId = null;

let activeCompositionIsInLoop = false;

const COMPOSITION_CONFIG = {

    questionTypeId: 13,

    voteQuestionGroupId: 184,

    subVoteQuestionGroupId: 209,

    keyword: "کامپوزیشن",

    pageSize: 20

};


let lastCreatedCompositionVotePackageDetailId = null;

const VotePackageSectionEndpoints = {
    create: '/VotePackageSection/Create',
    update: '/VotePackageSection/Update',
    delete: '/VotePackageSection/Delete',
    getByVotePackageId: '/VotePackageSection/GetByVotePackageId'
};


let votePackageQuestionSections = [];

let activeVotePackageSectionId = null;

let currentVotePackageDetails = [];

let pendingSectionAssignment = null;

let loadedVotePackageSectionStorageKey = null;


function getVotePackageSectionStorageKey() {

    const votePackageId =
        $("#VotePackageIdGET").val() || "draft";

    return `vote-package-question-sections-${votePackageId}`;
}


function ensureVotePackageSectionsLoaded() {

    const storageKey =
        getVotePackageSectionStorageKey();

    if (
        loadedVotePackageSectionStorageKey ===
        storageKey
    ) {
        return;
    }

    loadedVotePackageSectionStorageKey =
        storageKey;

    try {

        const data =
            localStorage.getItem(storageKey);

        votePackageQuestionSections =
            data ? JSON.parse(data) : [];

        if (
            !Array.isArray(
                votePackageQuestionSections
            )
        ) {
            votePackageQuestionSections = [];
        }

    } catch {

        votePackageQuestionSections = [];

    }
}


function saveVotePackageSections() {

    ensureVotePackageSectionsLoaded();

    localStorage.setItem(
        getVotePackageSectionStorageKey(),
        JSON.stringify(
            votePackageQuestionSections
        )
    );
}

function createCompositionQuestion(
    title
) {

    $.ajax({

        type:
            "POST",

        dataType:
            "json",

        url:
            "/VoteQuestion/Create",

        data: {

            VoteQuestionId:
                0,

            VoteQuestionGroupId:
                COMPOSITION_CONFIG
                    .voteQuestionGroupId,

            SubVoteQuestionGroupId:
                COMPOSITION_CONFIG
                    .subVoteQuestionGroupId,

            VoteQuestionTypeId:
                COMPOSITION_CONFIG
                    .questionTypeId,

            KeyWord:
                COMPOSITION_CONFIG
                    .keyword,

            Title:
                title,

            ValidationMessage:
                "",

            InputPatternId:
                null,

            DataSourceId:
                null

        },


        beforeSend:
            function (xhr) {

                xhr.setRequestHeader(

                    "RequestVerificationToken",

                    $(
                        'input[name="__RequestVerificationToken"]'
                    ).val()

                );

            },


        success:
            function (response) {


                if (
                    response?.success ===
                    false
                ) {

                    const errorMessage =

                        response
                            ?.operationErrors
                            ?.[0]
                            ?.description

                        ??

                        response
                            ?.validationErrors
                            ?.[0]
                            ?.errorMessage

                        ??

                        response
                            ?.message

                        ??

                        "خطا در ایجاد دسته‌بندی";


                    Swal.fire({

                        text:
                            errorMessage,

                        icon:
                            "warning",

                        buttonsStyling:
                            false,

                        confirmButtonText:
                            "بستن",

                        customClass: {

                            confirmButton:
                                "btn btn-confirmPage"

                        }

                    });


                    return;
                }


                // =====================================
                // طبق Response جدید Backend
                // =====================================

                const votePackageDetailId =

                    response
                        ?.data
                        ?.votePackageDetailId

                    ??

                    response
                        ?.votePackageDetailId

                    ??

                    response
                        ?.result
                        ?.votePackageDetailId

                    ??

                    null;


                lastCreatedCompositionVotePackageDetailId =
                    votePackageDetailId;


                console.log(
                    "Created Composition votePackageDetailId:",
                    votePackageDetailId
                );


                $("#CreateCompositionBox")
                    .addClass("d-none");


                $("#NewCompositionTitle")
                    .val("");


                Swal.fire({

                    text:
                        "دسته‌بندی با موفقیت به بانک سوالات اضافه شد.",

                    icon:
                        "success",

                    buttonsStyling:
                        false,

                    confirmButtonText:
                        "بستن",

                    customClass: {

                        confirmButton:
                            "btn btn-confirmPage"

                    }

                }).then(
                    function () {

                        // لیست دوباره از Backend خوانده می‌شود
                        refreshCompositionListAfterCreate(
                            title
                        );

                    }
                );

            },


        error:
            function (xhr) {

                console.error(
                    "Create Composition Error:",
                    xhr
                );


                Swal.fire({

                    text:
                        "خطا در ایجاد دسته‌بندی",

                    icon:
                        "warning",

                    buttonsStyling:
                        false,

                    confirmButtonText:
                        "بستن",

                    customClass: {

                        confirmButton:
                            "btn btn-confirmPage"

                    }

                });

            }

    });

}

function refreshCompositionListAfterCreate(
    title
) {

    $.ajax({

        type:
            "POST",

        dataType:
            "json",

        url:
            "/VoteQuestion/GetAllVoteQuestionsByFilter",

        data: {

            title:
                title,

            keyword:
                COMPOSITION_CONFIG.keyword,

            voteQuestionTypeId:
                COMPOSITION_CONFIG.questionTypeId,

            page:
                1,

            pageSize:
                20

        },


        beforeSend:
            function (xhr) {

                xhr.setRequestHeader(

                    "RequestVerificationToken",

                    $(
                        'input[name="__RequestVerificationToken"]'
                    ).val()

                );

            },


        success:
            function (response) {

                const items =

                    response?.result ??
                    response?.Result ??
                    [];


                const normalizedTitle =
                    normalizeCompositionTitle(
                        title
                    );


                const createdItem =
                    items.find(
                        function (item) {

                            return (
                                normalizeCompositionTitle(
                                    item.title
                                ) ===
                                normalizedTitle
                            );

                        }
                    );


                if (createdItem) {

                    selectExistingComposition(
                        createdItem
                    );

                }

            }

    });

}

$(document).on(
    "click",
    "#AddCompositionToPackageBtn",
    function () {

        const voteQuestionId =
            $("#CompositionQuestionSelect")
                .val();


        if (!voteQuestionId) {

            Swal.fire({

                text:
                    "لطفاً یک دسته‌بندی را انتخاب نمایید.",

                icon:
                    "warning",

                buttonsStyling:
                    false,

                confirmButtonText:
                    "بستن",

                customClass: {

                    confirmButton:
                        "btn btn-confirmPage"

                }

            });


            return;
        }


        // جلوگیری از اضافه شدن دوباره
        const alreadyExists =
            currentVotePackageDetails.some(
                function (item) {

                    const itemVoteQuestionId =

                        item.voteQuestionId

                        ??

                        item
                            .voteQuestion
                            ?.voteQuestionId;


                    return (

                        String(
                            itemVoteQuestionId
                        ) ===

                        String(
                            voteQuestionId
                        )

                    );

                }
            );


        if (alreadyExists) {

            Swal.fire({

                text:
                    "این دسته‌بندی قبلاً به پرسشنامه اضافه شده است.",

                icon:
                    "warning",

                buttonsStyling:
                    false,

                confirmButtonText:
                    "بستن",

                customClass: {

                    confirmButton:
                        "btn btn-confirmPage"

                }

            });


            return;
        }


        addCompositionToVotePackage(
            voteQuestionId
        );

    }
);

function addCompositionToVotePackage(
    voteQuestionId
) {

    const orderIndex =
        getNextOrderIndex();


    const isInLoop = $("#IsInLoop").is(":checked");

    $.ajax({

        type:
            "POST",

        dataType:
            "json",

        url:
            "/VotePackageDetail/CreateVotePackageDetail",

        data: {

            VotePackageId:
                $("#VotePackageIdGET").val(),

            VoteQuestionId:
                voteQuestionId,


            // Composition خودش Top Level است
            ParentId:
                null,


            // ترتیب بین سوال‌های عادی و Compositionها
            OrderIndex:
                orderIndex,


            IsMandatory:
                false,

            IsMultipleChoice:
                false,

            IsRanged:
                false,

            StringMaxLength:
                null,

            IsMultiFile:
                false,

            IsStart:
                false,

            IsActive:
                true,

            LowerLimitDateValueString:
                null,

            UpperLimitDateValueString:
                null,

            LowerLimitNumericValue:
                null,

            UpperLimitNumericValue:
                null,

            LowerLimitChosenCount:
                null,

            UpperLimitChosenCount:
                null,

            Weight:
                1,

            DisplayTypeEnum:
                0,

            IsInLoop:
                isInLoop,
        },


        beforeSend: function (xhr) {

            xhr.setRequestHeader(
                "RequestVerificationToken",
                $('input[name="__RequestVerificationToken"]').val()
            );

        },


        success: function (response) {

            if (!response.success) {

                const errorMessage =
                    response?.operationErrors?.[0]?.description
                    ??
                    response?.validationErrors?.[0]?.errorMessage
                    ??
                    response?.message
                    ??
                    "خطا در افزودن دسته‌بندی";


                Swal.fire({

                    text:
                        errorMessage,

                    icon:
                        "warning",

                    buttonsStyling:
                        false,

                    confirmButtonText:
                        "بستن",

                    customClass: {
                        confirmButton:
                            "btn btn-confirmPage"
                    }

                });

                return;
            }


            $("#kt_modal_add_question_section")
                .modal("hide");


            Swal.fire({

                text:
                    "دسته‌بندی با موفقیت به پرسشنامه اضافه شد.",

                icon:
                    "success",

                buttonsStyling:
                    false,

                confirmButtonText:
                    "بستن",

                customClass: {
                    confirmButton:
                        "btn btn-confirmPage"
                }

            }).then(function () {

                GetAllVotePackageDetailByVotePackageId();

            });

        }

    });

}

function createCompositionPackageDetail(
    voteQuestionId,
    title
) {

    const parentId = null;

    const orderIndex =
        getNextOrderIndex();


    $.ajax({

        type: "POST",

        dataType: "json",

        url:
            "/VotePackageDetail/CreateVotePackageDetail",

        data: {

            VotePackageId:
                $("#VotePackageIdGET").val(),

            VoteQuestionId:
                voteQuestionId,


            // Composition در سطح اصلی فرم است
            ParentId:
                parentId,


            // ترتیب در سطح اصلی فرم
            OrderIndex:
                orderIndex,


            IsMandatory:
                false,

            IsMultipleChoice:
                false,

            IsRanged:
                false,

            StringMaxLength:
                null,

            IsMultiFile:
                false,

            IsStart:
                false,

            IsActive:
                true,

            LowerLimitDateValueString:
                null,

            UpperLimitDateValueString:
                null,

            LowerLimitNumericValue:
                null,

            UpperLimitNumericValue:
                null,

            LowerLimitChosenCount:
                null,

            UpperLimitChosenCount:
                null,

            Weight:
                1,

            DisplayTypeEnum:
                0,
            
        },


        beforeSend: function (xhr) {

            xhr.setRequestHeader(
                "RequestVerificationToken",
                $('input[name="__RequestVerificationToken"]').val()
            );

        },


        success: function (response) {

            if (!response.success) {

                const errorMessage =
                    response?.operationErrors?.[0]?.description
                    ??
                    response?.validationErrors?.[0]?.errorMessage
                    ??
                    response?.message
                    ??
                    response?.data
                    ??
                    "خطا در افزودن دسته به پرسشنامه";


                Swal.fire({

                    text:
                        errorMessage,

                    icon:
                        "warning",

                    buttonsStyling:
                        false,

                    confirmButtonText:
                        "بستن",

                    customClass: {
                        confirmButton:
                            "btn btn-confirmPage"
                    }

                });

                return;
            }


            $("#kt_modal_add_question_section")
                .modal("hide");


            $("#VotePackageSectionTitle")
                .val("");


            Swal.fire({

                text:
                    "دسته سوالات با موفقیت به پرسشنامه اضافه شد",

                icon:
                    "success",

                buttonsStyling:
                    false,

                confirmButtonText:
                    "بستن",

                customClass: {
                    confirmButton:
                        "btn btn-confirmPage"
                }

            }).then(function () {

                GetAllVotePackageDetailByVotePackageId();

            });

        },


        error: function (xhr) {

            console.error(
                "Create Composition PackageDetail Error:",
                xhr
            );


            Swal.fire({

                text:
                    "خطا در افزودن دسته به پرسشنامه",

                icon:
                    "warning",

                buttonsStyling:
                    false,

                confirmButtonText:
                    "بستن",

                customClass: {
                    confirmButton:
                        "btn btn-confirmPage"
                }

            });

        }

    });
}

function initCompositionQuestionSelect() {

    const $select =
        $("#CompositionQuestionSelect");


    if (
        $select.hasClass(
            "select2-hidden-accessible"
        )
    ) {

        $select.select2("destroy");

    }


    $select.select2({

        dropdownParent:
            $("#kt_modal_add_question_section"),

        placeholder:
            "دسته‌بندی را انتخاب نمایید",

        allowClear:
            true,

        width:
            "100%",

        minimumInputLength:
            0,


        ajax: {

            url:
                "/VoteQuestion/GetAllVoteQuestionsByFilter",

            type:
                "POST",

            dataType:
                "json",

            delay:
                300,

            data: function (params) {

                return {

                    title:
                        params.term || null,

                    voteQuestionTypeId:
                        COMPOSITION_CONFIG.questionTypeId,

                    page:
                        params.page || 1,

                    pageSize:
                        COMPOSITION_CONFIG.pageSize,

                    '__RequestVerificationToken': document.querySelector(
                        'input[name="__RequestVerificationToken"]'
                    )?.value,

                };

            },


            processResults: function (
                response,
                params
            ) {

                params.page =
                    params.page || 1;


                const items =
                    response?.result ??
                    response?.Result ??
                    [];


                const results =
                    items.map(
                        function (item) {

                            return {

                                id:
                                    item.voteQuestionId,

                                text:
                                    item.title,

                                voteQuestionId:
                                    item.voteQuestionId,

                                item:
                                    item

                            };

                        }
                    );


                const hasNextPage =
                    response?.hasNextPage ??
                    response?.HasNextPage ??
                    (
                        items.length >=
                        COMPOSITION_CONFIG.pageSize
                    );


                return {

                    results:
                        results,

                    pagination: {
                        more:
                            hasNextPage
                    }

                };

            }

        }

    });

}

function findQuestionSection(sectionId) {

    ensureVotePackageSectionsLoaded();

    return votePackageQuestionSections.find(
        x =>
            String(x.id) ===
            String(sectionId)
    );
}


function findSectionByQuestionDetailId(
    votePackageDetailId
) {

    ensureVotePackageSectionsLoaded();

    return votePackageQuestionSections.find(
        section =>

            section.questionDetailIds.some(
                id =>
                    String(id) ===
                    String(votePackageDetailId)
            )

    ) || null;
}


function addQuestionDetailToSection(
    sectionId,
    votePackageDetailId
) {

    ensureVotePackageSectionsLoaded();

    // هر Detail فقط داخل یک دسته باشد.
    // البته همان VoteQuestion می‌تواند Detail مستقل دیگری هم داشته باشد.

    votePackageQuestionSections.forEach(
        section => {

            section.questionDetailIds =
                section.questionDetailIds.filter(
                    id =>
                        String(id) !==
                        String(votePackageDetailId)
                );

        }
    );

    const section =
        findQuestionSection(sectionId);

    if (!section) {
        return;
    }

    const exists =
        section.questionDetailIds.some(
            id =>
                String(id) ===
                String(votePackageDetailId)
        );

    if (!exists) {

        section.questionDetailIds.push(
            votePackageDetailId
        );

    }

    saveVotePackageSections();
}


function syncQuestionSectionsWithDetails(
    details
) {

    ensureVotePackageSectionsLoaded();

    const availableIds =
        new Set(
            details.map(
                item =>
                    String(
                        item.votePackageDetailId
                    )
            )
        );

    votePackageQuestionSections.forEach(
        section => {

            section.questionDetailIds =
                section.questionDetailIds.filter(
                    id =>
                        availableIds.has(
                            String(id)
                        )
                );

        }
    );

    saveVotePackageSections();
}
const STEP_CONFIG = {
    1: {
        icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="32" height="32">
  <defs>
    <linearGradient id="g1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFFFFF"/>
      <stop offset="60%" stop-color="#F5FBDA"/>
      <stop offset="100%" stop-color="#D9EFBD"/>
    </linearGradient>
  </defs>
  <rect width="64" height="64" rx="16" fill="url(#g1)"/>
  <rect x="16" y="10" width="26" height="34" rx="4" fill="none" stroke="#4A5568" stroke-width="2.5"/>
  <rect x="22" y="18" width="14" height="3" rx="1.5" fill="#4A5568"/>
  <rect x="22" y="25" width="10" height="3" rx="1.5" fill="#4A5568"/>
  <rect x="22" y="32" width="12" height="3" rx="1.5" fill="#4A5568"/>
  <g transform="translate(39, 38) rotate(-45)">
    <rect x="-4" y="-12" width="8" height="16" rx="2" fill="#B7E28E"/>
    <polygon points="-4,4 4,4 0,11" fill="#88C757"/>
    <rect x="-4" y="-15" width="8" height="4" rx="1" fill="#4A5568"/>
  </g>
</svg>`,
        title: 'مرحله 1',
        desc: 'طراحی فرم'
    },
    2: {
        icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="32" height="32">
  <defs>
    <linearGradient id="g2" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFFFFF"/>
      <stop offset="60%" stop-color="#F5FBDA"/>
      <stop offset="100%" stop-color="#D9EFBD"/>
    </linearGradient>
  </defs>
  <rect width="64" height="64" rx="16" fill="url(#g2)"/>
  <rect x="10" y="12" width="44" height="11" rx="5" fill="#FFFFFF" opacity="0.8" stroke="#4A5568" stroke-width="1.8"/>
  <circle cx="20" cy="17.5" r="4" fill="#88C757"/>
  <rect x="28" y="15" width="20" height="4" rx="2" fill="#4A5568"/>
  <rect x="10" y="27" width="44" height="11" rx="5" fill="#FFFFFF" opacity="0.8" stroke="#4A5568" stroke-width="1.8"/>
  <circle cx="20" cy="32.5" r="4" fill="#88C757"/>
  <rect x="28" y="30" width="24" height="4" rx="2" fill="#4A5568"/>
  <rect x="10" y="42" width="44" height="11" rx="5" fill="#FFFFFF" opacity="0.8" stroke="#4A5568" stroke-width="1.8"/>
  <circle cx="20" cy="47.5" r="4" fill="#88C757"/>
  <rect x="28" y="45" width="18" height="4" rx="2" fill="#4A5568"/>
</svg>`,
        title: 'مرحله 2',
        desc: 'لیست خدمت'
    },
    3: {
        icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="32" height="32">
  <defs>
    <linearGradient id="g3" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFFFFF"/>
      <stop offset="60%" stop-color="#F5FBDA"/>
      <stop offset="100%" stop-color="#D9EFBD"/>
    </linearGradient>
  </defs>
  <rect width="64" height="64" rx="16" fill="url(#g3)"/>
  <rect x="13" y="14" width="34" height="40" rx="4" fill="none" stroke="#4A5568" stroke-width="2.5"/>
  <rect x="23" y="9" width="14" height="9" rx="3" fill="#B7E28E" stroke="#4A5568" stroke-width="1.5"/>
  <rect x="20" y="26" width="6" height="6" rx="1.5" fill="none" stroke="#4A5568" stroke-width="2.5"/>
  <polyline points="21,29 22.5,30.5 25.5,27" fill="none" stroke="#68A33C" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
  <rect x="30" y="27" width="14" height="3.5" rx="1.75" fill="#4A5568"/>
  <rect x="20" y="36" width="6" height="6" rx="1.5" fill="none" stroke="#4A5568" stroke-width="2.5"/>
  <polyline points="21,39 22.5,40.5 25.5,37" fill="none" stroke="#68A33C" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
  <rect x="30" y="37" width="18" height="3.5" rx="1.75" fill="#4A5568"/>
  <text x="36" y="53" font-size="16" font-family="Arial" font-weight="900" fill="#68A33C" text-anchor="middle">?</text>
</svg>`,
        title: 'مرحله 3',
        desc: 'پرسشنامه و شروط'
    },
    4: {
        icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="32" height="32">
  <defs>
    <linearGradient id="g4" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFFFFF"/>
      <stop offset="60%" stop-color="#F5FBDA"/>
      <stop offset="100%" stop-color="#D9EFBD"/>
    </linearGradient>
  </defs>
  <rect width="64" height="64" rx="16" fill="url(#g4)"/>
  <circle cx="32" cy="20" r="8" fill="#4A5568"/>
  <path d="M16,50 C16,38 48,38 48,50" fill="#4A5568"/>
  <circle cx="12" cy="26" r="6" fill="#88C757" opacity="0.9"/>
  <path d="M2,50 C2,41 22,41 22,50" fill="#88C757" opacity="0.9"/>
  <circle cx="52" cy="26" r="6" fill="#88C757" opacity="0.9"/>
  <path d="M42,50 C42,41 62,41 62,50" fill="#88C757" opacity="0.9"/>
  <line x1="32" y1="20" x2="12" y2="26" stroke="#4A5568" stroke-width="2" stroke-dasharray="4,2"/>
  <line x1="32" y1="20" x2="52" y2="26" stroke="#4A5568" stroke-width="2" stroke-dasharray="4,2"/>
</svg>`,
        title: 'مرحله 4',
        desc: 'خدمات دهندگان'
    },
    5: {
        icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="32" height="32">
  <defs>
    <linearGradient id="g5" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFFFFF"/>
      <stop offset="60%" stop-color="#F5FBDA"/>
      <stop offset="100%" stop-color="#D9EFBD"/>
    </linearGradient>
  </defs>
  <rect width="64" height="64" rx="16" fill="url(#g5)"/>
  <circle cx="32" cy="20" r="8" fill="#4A5568"/>
  <path d="M16,50 C16,38 48,38 48,50" fill="#4A5568"/>
  <circle cx="12" cy="26" r="6" fill="#88C757" opacity="0.9"/>
  <path d="M2,50 C2,41 22,41 22,50" fill="#88C757" opacity="0.9"/>
  <circle cx="52" cy="26" r="6" fill="#88C757" opacity="0.9"/>
  <path d="M42,50 C42,41 62,41 62,50" fill="#88C757" opacity="0.9"/>
  <line x1="32" y1="20" x2="12" y2="26" stroke="#4A5568" stroke-width="2" stroke-dasharray="4,2"/>
  <line x1="32" y1="20" x2="52" y2="26" stroke="#4A5568" stroke-width="2" stroke-dasharray="4,2"/>
</svg>`,
        title: 'مرحله 5',
        desc: 'لیست کارمندان'
    },
};






var currentStep = null
var isMultiSelectProcessTypes = false;
var isOwnerRequired = false

function getActiveSteps(surveyTypeId) {
    // 1=طراحی فرم  2=لیست خدمت  3=پرسشنامه و شروط  4=خدمات دهندگان  5=لیست کاربران
    if (surveyTypeId == 2) {
        isMultiSelectProcessTypes = true;
        return [1, 2, 5, 3, 4];   // لیست کاربران بلافاصله بعد از لیست خدمت
    } else {
        isMultiSelectProcessTypes = true;
        return [1, 2, 5, 3];
    }
}
function buildStepperNav(activeSteps) {
    const nav = document.querySelector('#kt_stepper_example_clickable .stepper-nav');
    nav.innerHTML = activeSteps.map((stepNum, idx) => {
        const cfg = STEP_CONFIG[stepNum];
        const isCurrent = idx === 0 ? 'current' : '';
        return `
        <div class="stepper-item ${isCurrent}" data-kt-stepper-element="nav" data-kt-stepper-action="step" data-original-step="${stepNum}">
            <div class="stepper-topPart w-100 steper-100">
                <div class="stepper-icon w-50px h-50px">
                    <i class="stepper-check fas fa-check"></i>
                    <span class="stepper-number">
                        <span class="font-icon">${cfg.icon}</span>
                    </span>
                </div>
                <div class="stepper-line w-100"></div>
            </div>
            <div class="stepper-label px-4">
                <h3 class="stepper-title">مرحله ${toPersianDigits(idx + 1)}</h3>
                <div class="stepper-desc">${cfg.desc}</div>
            </div>
        </div>`;
    }).join('');
}

const _panelCache = {};

function buildStepperContent(activeSteps) {
    const wrapper = document.querySelector('#kt_stepper_example_clickable .stepper-content');

    wrapper.querySelectorAll('[data-kt-stepper-element="content"]').forEach(panel => {
        const step = panel.dataset.originalStep;
        _panelCache[step] = panel;
    });

    wrapper.innerHTML = '';

    activeSteps.forEach((stepNum, idx) => {
        const panel = _panelCache[stepNum];
        if (panel) {
            panel.classList.remove('current');
            if (idx === 0) panel.classList.add('current');
            panel.style.display = ''; wrapper.appendChild(panel);
        }
    });
}

var stepper = null;
var stepperNextHandler = null;
var stepperHandlerAttached = false;

function reinitStepper(surveyTypeId) {
    const activeSteps = getActiveSteps(surveyTypeId);
    const element = document.querySelector('#kt_stepper_example_clickable');

    if (!element) {
        console.error('Stepper element not found');
        return;
    }

    removeAllListenersFromNextBtn();

    stepperNextHandler = null;
    stepperHandlerAttached = false;

    let oldStepper = KTStepper.getInstance(element);
    if (oldStepper) {
        oldStepper.destroy();
        oldStepper = null
    }

    stepper = null;

    const nav = element.querySelector('.stepper-nav');
    const contentWrapper = element.querySelector('.stepper-content-wrapper');

    if (nav) nav.innerHTML = '';
    if (contentWrapper) contentWrapper.innerHTML = '';

    buildStepperNav(activeSteps);
    buildStepperContent(activeSteps);

    stepper = new KTStepper(element);
    attachStepperNextHandler(stepper, activeSteps);

    hideStepperOverlay()
}

function removeAllListenersFromNextBtn() {
    const btn = document.querySelector('[data-kt-stepper-action="next"]');
    if (!btn) return;
    const newBtn = btn.cloneNode(true);
    btn.parentNode.replaceChild(newBtn, btn);
}

function showStepperOverlay() {
    document.getElementById('stepper-overlay').style.display = 'flex';
}

function hideStepperOverlay() {
    document.getElementById('stepper-overlay').style.display = 'none';
}

showStepperOverlay()

function attachStepperNextHandler(stepperInstance, activeSteps) {
    if (stepperHandlerAttached) {
        console.warn('Handler already attached, skipping.');
        return;
    }
    stepperNextHandler = async function (st) {
        const currentPos = st.getCurrentStepIndex();
        const originalStep = activeSteps[currentPos - 1];
        currentStep = originalStep
        var hasIdVotePackage = $("#VotePackageIdGET").val();
        /*  console.log(originalStep);*/
        switch (originalStep) {
            case 1:
                if (validatorStep) {
                    //console.log(validatorStep)
                    const status = await validatorStep.validate();
                    //console.log(status)
                    if (status == 'Valid') {
                        if (hasIdVotePackage > 0) {
                            await updateVotePackage();
                        } else {
                            await createVotePackage();
                        }
                        VotePackageTitleMain = $("#Title").val();
                        $('#VotePackageTitleGET').empty().append(VotePackageTitleMain);
                        //alert("salam mamadreza")
                        CheckAllProcessTypes('');
                    }

                }
                break;


            case 2:
                if (isProcessingStep2) return;
                if (isMultiSelectProcessTypes) {
                    if (selectedprocessTypeId.length === 0) {
                        Swal.fire({
                            text: "لطفاً حداقل یک خدمت را انتخاب کنید",
                            icon: "warning",
                            buttonsStyling: false,
                            confirmButtonText: "تایید",
                            customClass: { confirmButton: "btn btn-confirmPage" }
                        });
                        return;
                    }
                } else {
                    if (selectedprocessTypeId.length !== 1) {
                        Swal.fire({
                            text: "لطفاً دقیقاً یک خدمت را انتخاب کنید",
                            icon: "warning",
                            buttonsStyling: false,
                            confirmButtonText: "تایید",
                            customClass: { confirmButton: "btn btn-confirmPage" }
                        });
                        return;
                    }
                }
                isProcessingStep2 = true;
                PostDataToPocessTypeVotePackage(selectedprocessTypeId);
                GetAllVotePackageDetailByVotePackageId();
                addSelectStartQuestionList();
                setTimeout(function () { isProcessingStep2 = false; }, 3000);
                break;

            case 3:

                selectStartQuestion(selectStartQuestion);
                LoadAllOwnr();
                UpdateOwnerAll();
                break;
            case 5:

                createuservotepackage()

                break;

            case 4:

                const hasEmployees = selectedAllowedUsers?.length > 0;
                const hasOrganizations = selectedOrganizationCodes?.length > 0;
                const hasStructures = selectedOrganizationStructureCodes?.length > 0;

                if (!hasEmployees && !hasOrganizations && !hasStructures) {
                    Swal.fire({
                        text: "لطفاً حداقل یک مورد را انتخاب کنید",
                        icon: "warning",
                        buttonsStyling: false,
                        confirmButtonText: "تایید",
                        customClass: { confirmButton: "btn btn-confirmPage" }
                    });
                    return;
                }
                GetDataToVotePackageOwner(
                    selectedPersonnelCodes,
                    selectedOrganizationCodes,
                    selectedOrganizationStructureCodes
                );
                break;
        }
    };

    stepperInstance.on('kt.stepper.next', stepperNextHandler);
    stepperInstance.on("kt.stepper.previous", function (stepper) {
        stepper.goPrevious(); // go previous step
    });

    stepperHandlerAttached = true;
}



$('#IsDefault').prop('checked', false);

document.querySelectorAll('input[name="SurveyTypeSelect"]').forEach(function (radio) {
    radio.addEventListener('change', function () {
        reinitStepper(this.value);
    });
});

$("#BtnConfirmSurveyType").on("click", function () {
    $('#setFormDetails').show()
    $('#selectGeneralFormInfo').hide()
})

let selectedSurveyType = null;

$(document).on("click", ".survey-type-card", function () {

    $(".survey-type-card").removeClass("active");
    $(this).addClass("active");

    selectedSurveyType = $(this).data("id");

    $("#ErrorSurveyTypeList").addClass("d-none");
});

$("#btnStartSurvey").on("click", function () {

    if (!selectedSurveyType) {
        $("#ErrorSurveyTypeList").removeClass("d-none");
        return;
    }

    // مخفی شدن بخش انتخاب نوع
    $("#surveyTypeSection").addClass("d-none");

    // نمایش استپر
    $("#surveyStepperSection").removeClass("d-none");

    // اگر نیاز داری مقدار انتخاب شده داخل فرم بره:
    $("#HiddenSurveyTypeId").val(selectedSurveyType);

});

$(document).ready(function () {
    $('[data-bs-toggle="tooltip"]').tooltip();
    let page = 1;
    let page2 = 1;
    let searchTerm;
    let searchTerm2;
    let isLastPage = false;
    let isLastPage2 = false;
    //$('#WeightValue').text($('#WeightOfForm').val());

   
    //$(document).on('input', '#WeightOfForm', function () {
    //    $('#WeightValue').text($(this).val());
    //});
    $('#WeightValueQuestion').text($('#weightOfQuestion').val());

    // آپدیت هنگام تغییر
    $(document).on('input', '#weightOfQuestion', function () {
        $('#WeightValueQuestion').text($(this).val());
    });

    $(document).on("click", ".add-confirm-config", function () {
        const qId = this.dataset.questionId;
        const typeId = this.dataset.typeId;
        const detailId = this.dataset.detailId;
        const packageId = this.dataset.packageId;
        const weight = this.dataset.weight;
        const upper = this.dataset.upper;

        GetDetailsQuestion(qId, typeId, detailId, packageId, weight, upper);
    });

    // Event listener for "حذف" (Delete) button - Attached ONCE
    $(document).on("click", ".delete-vote-question", function () {
        const id = this.dataset.id;
        DeleteVoteDetailsQuestion(id);
    });

    //*
    function appendOptions(data, searchTerm, pageNumber) {
        if (searchTerm !== undefined && searchTerm !== '' && pageNumber === 1) {
            $('#WelcomePackageTitleId').empty().trigger('change');
        }

        let select2Dropdown2 = $('.select2-results__options');
        let scrollTop = select2Dropdown2.scrollTop();

        $('#WelcomePackageTitleId').select2();

        if (pageNumber === 1) {
            var emptyOption = new Option('', '', false, false);
            $('#WelcomePackageTitleId').append(emptyOption);
        }

        data.forEach(item => {
            var message = item.message || '';
            var limitedMessage = message.substring(0, 160);

            if (message.length > 160) {
                limitedMessage += '...';
            }

            var option = new Option(limitedMessage, item.packageTitleId, false, false);
            $('#WelcomePackageTitleId').append(option);
        });

        $('#WelcomePackageTitleId').select2('open');

        select2Dropdown2 = $('.select2-results__options');
        let select2DropdownSearch2 = $('.select2-search__field');

        select2DropdownSearch2.val(searchTerm);
        select2Dropdown2.scrollTop(scrollTop);
    }


    function appendOptions2(data, searchTerm, pageNumber) {
        if ((searchTerm !== undefined || searchTerm !== '') && pageNumber === 1) {
            $('#GoodbyePackageTitleId').empty().trigger('change');
        }
        let scrollTop = 0;
        let select2Dropdown2 = $('.select2-results__options');

        scrollTop = select2Dropdown2.scrollTop();

        $('#GoodbyePackageTitleId').select2();
        var option = new Option('', '', false, false);
        $('#GoodbyePackageTitleId').append(option);
        data.forEach(item => {
            var option = new Option(item.message, item.packageTitleId, false, false);
            $('#GoodbyePackageTitleId').append(option);
        });
        $('#GoodbyePackageTitleId').select2('open');
        select2Dropdown2 = $('.select2-results__options');
        let select2DropdownSearch2 = $('.select2-search__field');
        select2DropdownSearch2.val(searchTerm);
        select2Dropdown2.scrollTop(scrollTop);
    }
    function loadData(pageNumber, searchTerm) {
        $('.loading').show();

        $.ajax({
            type: "GET",
            dataType: 'json',
            url: '/PackageTitle/ActiveWelComeMessage',
            data: {
                page: pageNumber,
                title: searchTerm
            },
            delay: 500,
            success: function (data) {
                $('.loading').hide();

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
    function ResetVariables() {
        page = 1;
        pagee = 1;
        searchTerm = '';
        searchTerm2 = '';
        isLastPage = false;
        isLastPage2 = false;
    }
    function loadData2(pageNumber, searchTerm) {

        $('.loading').show();

        $.ajax({
            type: "GET",
            dataType: 'json',
            url: '/PackageTitle/ActiveGoodByeMessage',
            data: {
                page: pageNumber,
                title: searchTerm
            },
            delay: 500,
            success: function (data) {
                $('.loading').hide();

                if (data.length === 0) {
                    isLastPage2 = true;
                } else {
                    isLastPage2 = false;
                }

                appendOptions2(data, searchTerm, pageNumber);
            },
            error: function (jqXHR, textStatus, errorThrown) {
                $('.loading').hide();

            }
        });
    }


    $('#WelcomePackageTitleId').select2({
    }).on('select2:open', function () {
        $('#GoodbyePackageTitleId').select2('close');
        let select2Dropdown = $('.select2-results__options');
        let srch = $('.select2-search__field');
        srch.val(searchTerm);
        srch.on('input', function (e) {
            srch.prop('disabled', true);
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
    $('#WelcomePackageTitleId').select2({
    }).on('select2:close', function () {
    });

    //**


    $('#GoodbyePackageTitleId').select2({
    }).on('select2:open', function () {
        $('#WelcomePackageTitleId').select2('close');
        let select2Dropdown2 = $('.select2-results__options');
        let srch = $('.select2-search__field');
        srch.val(searchTerm2);
        srch.on('input', function (e) {
            srch.prop('disabled', true);
            var srchtrm = $(this).val();
            loadData2(1, srchtrm);
            searchTerm2 = srchtrm;
            page2 = 1;
        });

        select2Dropdown2.off('scroll').on('scroll', function () {
            if (!isLastPage2 && select2Dropdown2[0].scrollHeight - select2Dropdown2.scrollTop() <= select2Dropdown2.outerHeight()) {
                page2++;
                loadData2(page2, searchTerm2);

            }
        });
    });
    $('#GoodbyePackageTitleId').select2({
    }).on('select2:close', function () {
    });
    ResetVariables();


    //WellComeMessage
    $.ajax({
        type: "GET",
        dataType: 'JSOn',
        url: '/PackageTitle/ActiveWelComeMessage',
        success: function (data3) {
            for (var i = 0; i < data3.length; i++) {
                var WellComeMessageLimit = (data3[i].message).substring(0, 160);
                var countText = data3[i].message.length
                if (countText > 160) {
                    WellComeMessageLimit += '...'
                }
                var itemType = new Option(WellComeMessageLimit, data3[i].packageTitleId, false, false);
                $("#WelcomePackageTitleId").append(itemType);

            }
        }
    });

    //GoodByMessage
    $.ajax({
        type: "GET",
        dataType: 'JSOn',
        url: '/PackageTitle/ActiveGoodByeMessage',
        success: function (data4) {
            for (var i = 0; i < data4.length; i++) {
                var GoodByMessageLimit = (data4[i].message).substring(0, 160);
                var countText = data4[i].message.length
                if (countText > 160) {
                    GoodByMessageLimit += '...'
                }

                var itemType = new Option(GoodByMessageLimit, data4[i].packageTitleId, false, false);
                $("#GoodbyePackageTitleId").append(itemType);
            }
        }
    });


});




let selectedprocessTypeId = [];


//var element = document.querySelector("#kt_stepper_example_clickable");
//var stepper = new KTStepper(element);

//stepper.on("kt.stepper.click", function (stepper) {
//    //  stepper.goTo(stepper.getClickedStepIndex()); // go to clicked step
//});


const form = document.getElementById('add_question');
var validatorStep = FormValidation.formValidation(
    form,
    {
        fields: {
            //SurveyTypeSelect: { validators: { notEmpty: { message: " نوع نظرسنجی را انتخاب نمایید" } } },
            Title: { validators: { notEmpty: { message: "عنوان را وارد نمایید" } } },
           /* WeightOfForm: { validators: { notEmpty: { message: "وزن فرم را وارد نمایید." } } },*/
            WelcomePackageTitleId: { validators: { notEmpty: { message: " پیام پیشواز را وارد نمایید" } } },
            GoodbyePackageTitleId: { validators: { notEmpty: { message: "پیام بدرقه را وارد نمایید" } } },
            StartDateTimePersian: { validators: { notEmpty: { message: "تاریخ آغاز را وارد نمایید" } } },
            ExpireDateTimePersian: { validators: { notEmpty: { message: "تاریخ پایان را وارد نمایید" } } },

        },
        plugins: {
            trigger: new FormValidation.plugins.Trigger(),
            bootstrap: new FormValidation.plugins.Bootstrap5({
                rowSelector: '.fv-row',
                eleInvalidClass: '',
                eleValidClass: ''
            })
        }
    }
);


function createVotePackage() {
    const userIds = selectedAllowedUsers.map(user => user.userId);
    return new Promise((resolve, reject) => {
        $.ajax({
            type: "POST",
            dataType: 'JSON',
            url: '/VotePackage/Create',
            data: {
                'SurveyTypeId': $('input[name="SurveyTypeSelect"]:checked').val(),
                'Title': $("#Title").val(),
                'WelcomePackageTitleId': $("#WelcomePackageTitleId").select2('data')[0].id,
                'GoodbyePackageTitleId': $("#GoodbyePackageTitleId").select2('data')[0].id,
                'StartDateTime': $("#StartDateTimePersian").val(),
                'ExpireDateTime': $("#ExpireDateTimePersian").val(),
                'StartDateTimePersian': $("#StartDateTimePersian").val(),
                'ExpireDateTimePersian': $("#ExpireDateTimePersian").val(),
                'IsActive': $("#IsActive").val(),
                'IsDefault': $("#IsDefault").val(),
                'IsLoginMandatory': $("#IsLoginMandatory").val(),
                'MaxParticipations': $('#MaxParticipations').val(),
               /* 'Weight': $("#WeightOfForm").val(),*/
                'UserIds': userIds
            },
            beforeSend: function (xhr) {
                xhr.setRequestHeader("RequestVerificationToken", $('input[name="__RequestVerificationToken"]').val());
            },
            success: function (response) {
                if (response.success) {
                    VotePackageIdVal = response.successMessage;
                    $("#VotePackageIdGET").val(VotePackageIdVal);

                    $.ajax({
                        url: location.href,
                        type: "GET",
                        success: function (data) {
                            stepper.goNext();
                            resolve(); // ✅ اینجا resolve
                        },
                        error: function () {
                            reject('GET request failed');
                        }
                    });

                } else {
                    var errorMessage = response?.operationErrors?.[0]?.description ??
                        response?.validationErrors?.[0]?.errorMessage ??
                        response?.message ??
                        response?.data ??
                        "خطایی رخ داده است!";
                    Swal.fire({
                        text: errorMessage,
                        icon: "warning",
                        buttonsStyling: !1,
                        confirmButtonText: "تایید",
                        customClass: { confirmButton: "btn btn-confirmPage" },

                    });
                    reject('validation error');
                }
            },
            error: function (xhr, status, message) {
                var errorMessage = response?.operationErrors?.[0]?.description ??
                    response?.validationErrors?.[0]?.errorMessage ??
                    response?.message ??
                    response?.data ??
                    "خطایی رخ داده است!";
                Swal.fire({
                    text: errorMessage,
                    icon: "warning",
                    buttonsStyling: !1,
                    confirmButtonText: "تایید",
                    customClass: { confirmButton: "btn btn-confirmPage" },

                });
                reject(message);
            }
        });
    });
}

function updateVotePackage() {
    $.ajax({
        type: "POST",
        dataType: 'JSON',
        url: '/VotePackage/Update',
        data: {
            'VotePackageId': $("#VotePackageIdGET").val(),
            'SurveyTypeId': $('input[name="SurveyTypeSelect"]:checked').val(),
            'Title': $("#Title").val(),
            'WelcomePackageTitleId': $("#WelcomePackageTitleId").select2('data')[0].id,
            'GoodbyePackageTitleId': $("#GoodbyePackageTitleId").select2('data')[0].id,
            'StartDateTimePersian': $("#StartDateTimePersian").val(),
            'ExpireDateTimePersian': $("#ExpireDateTimePersian").val(),
            'IsActive': $("#IsActive").val(),
            'IsDefault': $("#IsDefault").val(),
            'IsLoginMandatory': $("#IsLoginMandatory").val(),
            //'Weight': $("#WeightOfForm").val()
        },
        beforeSend: function (xhr) {
            xhr.setRequestHeader("RequestVerificationToken", $('input[name="__RequestVerificationToken"]').val());
        }, success: function (response) {
            stepper.goNext();


        },
        error: function (xhr, status, message) {
            Swal.fire({
                text: " خطا ! لطفا با ادمین سیستم تماس بگیرید",
                icon: "warning",
                buttonsStyling: !1,
                confirmButtonText: "بستن",
                customClass: { confirmButton: "btn btn-confirmPage" },

            });
        }


    })
}


function getQuestionTypeId(item) {

    return Number(

        item.voteQuestionTypeId

        ??

        item.voteQuestion
            ?.voteQuestionTypeList
            ?.voteQuestionTypeId

        ??

        0

    );
}


function addInDropItems(data) {

    currentVotePackageDetails =
        Array.isArray(data?.result)
            ? data.result
            : [];


    $("#drop-items").empty();


    // ==========================================
    // فقط آیتم‌های سطح اصلی
    // سوال عادی + Composition Parent
    // ==========================================

    const topLevelItems =
        currentVotePackageDetails

            .filter(
                function (item) {

                    return (
                        getQuestionParentId(item) === null
                    );

                }
            )

            .sort(
                function (a, b) {

                    return (
                        getQuestionOrderIndex(a)
                        -
                        getQuestionOrderIndex(b)
                    );

                }
            );


    // ==========================================
    // Render
    // ==========================================

    topLevelItems.forEach(
        function (item) {

            const questionTypeId =
                getQuestionTypeId(item);


            // ==================================
            // Composition
            // ==================================

            if (
                questionTypeId === 13
            ) {

                const compositionId =
                    item.votePackageDetailId;


                // ------------------------------
                // Childهای nested
                // ------------------------------

                const nestedChildren =
                    Array.isArray(item.children)
                        ? item.children
                        : [];


                // ------------------------------
                // Childهای flat
                // برای سازگاری با هر دو مدل Response
                // ------------------------------

                const flatChildren =
                    currentVotePackageDetails.filter(
                        function (child) {

                            return (
                                String(
                                    getQuestionParentId(
                                        child
                                    )
                                )
                                ===
                                String(
                                    compositionId
                                )
                            );

                        }
                    );


                // ------------------------------
                // ترکیب بدون تکرار
                // ------------------------------

                const childrenMap =
                    new Map();


                nestedChildren.forEach(
                    function (child) {

                        childrenMap.set(
                            String(
                                child.votePackageDetailId
                            ),
                            child
                        );

                    }
                );


                flatChildren.forEach(
                    function (child) {

                        childrenMap.set(
                            String(
                                child.votePackageDetailId
                            ),
                            child
                        );

                    }
                );


                const childQuestions =
                    Array
                        .from(
                            childrenMap.values()
                        )
                        .sort(
                            function (a, b) {

                                return (
                                    getQuestionOrderIndex(a)
                                    -
                                    getQuestionOrderIndex(b)
                                );

                            }
                        );


                console.log(
                    "Composition Render",
                    {
                        compositionId:
                            compositionId,

                        nestedChildren:
                            nestedChildren,

                        flatChildren:
                            flatChildren,

                        childQuestions:
                            childQuestions
                    }
                );


                $("#drop-items")
                    .append(

                        renderVoteQuestionSection(
                            item,
                            childQuestions
                        )

                    );


                return;
            }


            // ==================================
            // سوال عادی
            // ==================================

            $("#drop-items")
                .append(

                    renderVoteQuestionCard(
                        item,
                        true
                    )

                );

        }
    );


    // ==========================================
    // Empty
    // ==========================================

    if (
        topLevelItems.length === 0
    ) {

        $("#drop-items").html(`

            <div class="text-center text-muted py-15">

                هنوز سوالی به پرسشنامه
                اضافه نشده است.

            </div>

        `);

    }


    // ==========================================
    // Color
    // ==========================================

    document
        .querySelectorAll(
            ".question-color"
        )
        .forEach(
            function (el) {

                const color =
                    (
                        el.dataset.color ||
                        ""
                    )
                        .replace(
                            "!important",
                            ""
                        )
                        .trim();


                if (color) {

                    el.style.setProperty(
                        "background-color",
                        color,
                        "important"
                    );

                }

            }
        );
}

function renderVoteQuestionSection(
    composition,
    questions
) {

    const compositionDetailId =
        composition.votePackageDetailId;


    const compositionQuestionId =
        composition.voteQuestionId
        ??
        composition.voteQuestion
            ?.voteQuestionId
        ??
        "";


    const compositionTitle =
        composition.voteQuestionTitle
        ??
        composition.voteQuestion
            ?.title
        ??
        "دسته سوالات";


    const questionCount =
        Array.isArray(questions)
            ? questions.length
            : 0;


    // ==========================================
    // شروع پرسشنامه
    // ==========================================

    const startSectionHtml = `

        <div class="
            form-check
            form-check-custom
            form-check-solid
            me-2
        ">

            <input
                class="form-check-input h-20px w-20px"

                name="isStartInPackage"

                type="radio"

                value="${compositionDetailId}"

                id="isStart-QuestionNumber${compositionDetailId}"

                ${composition.isStart ? "checked" : ""}
            />


            <label
                class="
                    form-check-label
                    fs-7
                    fw-bolder
                "

                for="isStart-QuestionNumber${compositionDetailId}"
            >

                انتخاب دسته به عنوان شروع

            </label>

        </div>
    `;


    // ==========================================
    // سوال‌های داخل Composition
    // ==========================================

    let questionsHtml = "";


    if (questionCount > 0) {

        questionsHtml =
            questions
                .map(
                    function (question) {

                        return renderVoteQuestionCard(
                            question,

                            // child ها Start مستقل ندارند
                            false
                        );

                    }
                )
                .join("");

    }

    else {

        questionsHtml = `

            <div class="vp-question-section-empty">

                <div class="text-center">

                    <i class="
                        la
                        la-question-circle
                        fs-2x
                        text-gray-400
                        mb-2
                    "></i>


                    <div class="
                        fw-bold
                        text-gray-600
                        fs-7
                    ">

                        هنوز سوالی به این دسته
                        اضافه نشده است.

                    </div>


                    <div class="
                        text-muted
                        fs-8
                        mt-1
                    ">

                        از دکمه افزودن سوال استفاده کنید.

                    </div>

                </div>

            </div>
        `;

    }


    // ==========================================
    // خروجی
    // ==========================================

    return `

        <div
            class="vp-question-section"

            data-composition-detail-id="${compositionDetailId}"

            data-composition-question-id="${compositionQuestionId}"
        >


            <div class="vp-question-section-header">


                <!-- عنوان -->

                <div class="
                    d-flex
                    align-items-center
                    gap-3
                ">

                    <div class="vp-question-section-icon">

                        <i class="
                            la
                            la-layer-group
                        "></i>

                    </div>


                    <div>

                        <div class="
                            fw-bolder
                            fs-5
                            text-gray-800
                        ">

                            ${compositionTitle}

                        </div>


                        <div class="
                            text-muted
                            fs-7
                            mt-1
                        ">

                            ${questionCount}
                            سوال

                        </div>

                    </div>

                </div>


                <!-- اکشن‌های Composition -->

                <div class="
                    d-flex
                    align-items-center
                    flex-wrap
                    gap-2
                ">


                    ${startSectionHtml}


                    <!-- افزودن سوال -->

                    <button
                        type="button"
                        class="
                            btn
                            btn-sm
                            yas-btn-success
                            add-question-to-composition
                        "
                        data-composition-detail-id="${composition.votePackageDetailId}"
                        data-is-in-loop="${composition.isInLoop}"
                    >
                        <i class="la la-plus"></i>

                        افزودن سوال
                    </button>

                                <!-- پیکربندی -->

                    <a
                        href="#kt_modal_condition"

                        class="
                            btn
                            btn-sm
                            btn-info
                            add-confirm-config
                        "

                        data-question-id="${compositionQuestionId}"

                        data-type-id="13"

                        data-detail-id="${compositionDetailId}"

                        data-package-id="${composition.votePackageId ?? ""
                }"

                        data-weight="${composition.weight ?? 0
                }"

                        data-upper="${composition.upperLimitChosenCount ?? ""
                }"

                        data-bs-toggle="modal"

                        title="پیکربندی"
                    >

                        <div class="icon-config">

                            ${composition.isConfiguration

                    ? `
                                        <i class="
                                            la
                                            la-check-circle
                                            fs-3
                                            text-success
                                        "></i>
                                        `

                    : `
                                        <i class="
                                            fonticon-settings
                                            fs-3
                                        "></i>
                                        `
        }

                        </div>

                        پیکربندی

                    </a>

                    <!-- حذف Composition -->

                    <button
                        type="button"

                        class="
                            btn
                            btn-sm
                            btn-icon
                            btn-light-danger
                            delete-vote-question
                        "

                        data-id="${compositionDetailId}"

                        title="حذف دسته"
                    >

                        <i class="
                            fonticon-trash
                            fs-2x
                        "></i>

                    </button>

                </div>

            </div>


            <!-- سوال‌های داخل Composition -->

            <div class="vp-question-section-body">

                ${questionsHtml}

            </div>

        </div>

    `;
}


$(document).on(
    "click",
    ".add-question-to-composition",
    function () {

        const compositionDetailId =
            $(this).data(
                "composition-detail-id"
            );


        activeCompositionDetailId =
            compositionDetailId
                ? String(compositionDetailId)
                : null;


        activeCompositionIsInLoop =
            String(
                $(this).data('is-in-loop')
            ).toLowerCase() === 'true';

        prepareAddQuestionModal(
            activeCompositionDetailId
        );


        $("#kt_modal_add_question")
            .modal("show");

    }
);


$(document).on(
    "click",
    ".configure-composition-question",
    function () {

        const compositionId =
            $(this).data(
                "composition-id"
            );


        const composition =
            votePackageQuestionSections.find(
                function (item) {

                    return (
                        String(
                            item.votePackageDetailId
                        ) ===
                        String(compositionId)
                    );

                }
            );


        if (!composition) {
            return;
        }


        openCompositionConfiguration(
            composition
        );

    }
);

function openCompositionConfiguration(
    composition
) {

    activeConfigurationTarget = {

        type:
            "composition",

        votePackageDetailId:
            composition.votePackageDetailId,

        title:
            composition.title

    };


    $("#VotePackageDetailGraphIdHidden")
        .val(
            composition.votePackageDetailId
        );


    $("#voteQuestionTypeId")
        .val("composition");


    $("#QuestionTitle")
        .html(
            composition.title
        );


    $("#kt_modal_condition")
        .modal("show");


    prepareCompositionConfiguration(
        composition
    );
}

function prepareCompositionConfiguration(
    composition
) {

    console.log(
        "Composition Configuration:",
        composition
    );


    /*
        فعلاً فقط Modal پیکربندی باز می‌شود.

        بعداً وقتی مشخص شد Composition
        چه پارامترهایی دارد، اینجا UI آن را
        مقداردهی می‌کنیم.
    */

}

function renderVoteQuestionCard(
    item,
    showStartQuestion
) {

    const voteQuestion =
        item.voteQuestion || {};

    const questionType =
        voteQuestion.voteQuestionTypeList || {};

    const questionGroup =
        voteQuestion.voteQuestionGroupList || {};


    const questionId =
        voteQuestion.voteQuestionId ??
        item.voteQuestionId;

    const detailId =
        item.votePackageDetailId;


    const parentGroupTitle =
        questionGroup.parentVoteQuestionGroupTitle || "";

    const groupTitle =
        questionGroup.title || "";


    const groupPath =
        parentGroupTitle && groupTitle
            ? parentGroupTitle + " > " + groupTitle
            : groupTitle || parentGroupTitle;


    const isCompositionChild =
        item.parentId !== null &&
        item.parentId !== undefined &&
        Number(item.parentId) > 0;


    const startQuestionHtml =
        showStartQuestion
            ? `
                <div class="form-check form-check-custom form-check-solid me-10">

                    <input
                        class="form-check-input h-20px w-20px"
                        name="isStartInPackage"
                        type="radio"
                        value="${detailId}"
                        id="isStart-QuestionNumber${detailId}"
                        ${item.isStart ? "checked" : ""}
                    />

                    <label
                        class="form-check-label flexRadio30 fs-7 fw-bolder"
                        for="isStart-QuestionNumber${detailId}">
                        انتخاب سوال شروع
                    </label>

                </div>
              `
            : "";


    const configurationIcon =
        item.isConfiguration
            ? `
                <span class="svg-icon svg-icon-2 svg-icon-success">

                    <svg xmlns="http://www.w3.org/2000/svg"
                         width="24"
                         height="24"
                         viewBox="0 0 24 24"
                         fill="none">

                        <rect opacity="0.3"
                              x="2"
                              y="2"
                              width="20"
                              height="20"
                              rx="10"
                              fill="black">
                        </rect>

                        <path
                            d="M10.4343 12.4343L8.75 10.75C8.33579 10.3358 7.66421 10.3358 7.25 10.75C6.83579 11.1642 6.83579 11.8358 7.25 12.25L10.2929 15.2929C10.6834 15.6834 11.3166 15.6834 11.7071 15.2929L17.25 9.75C17.6642 9.33579 17.6642 8.66421 17.25 8.25C16.8358 7.83579 16.1642 7.83579 15.75 8.25L11.5657 12.4343C11.2533 12.7467 10.7467 12.7467 10.4343 12.4343Z"
                            fill="black">
                        </path>

                    </svg>

                </span>
              `
            : `
                <i class="fonticon-settings fs-3"></i>
              `;


    const configurationButton =
        !isCompositionChild
            ? `
                <a href="#kt_modal_condition"
                   class="btn btn-sm btn-info me-2 add-confirm-config"

                   data-question-id="${questionId}"

                   data-type-id="${questionType.voteQuestionTypeId ?? ""}"

                   data-detail-id="${detailId}"

                   data-package-id="${item.votePackageId ?? ""}"

                   data-weight="${item.weight ?? 0}"

                   data-upper="${item.upperLimitChosenCount ?? ""}"

                   data-bs-toggle="modal"

                   title="پیکربندی">

                    <div class="icon-config">

                        ${configurationIcon}

                    </div>

                    پیکربندی

                </a>
              `
            : "";


    return `

        <div class="drop__card"
             data-detail-id="${detailId}">

            <div class="overflow-auto pb-3">

                <div class="
                    d-flex
                    space-between
                    align-items-center
                    border
                    border-dashed
                    border-gray-300
                    rounded
                    min-w-750px
                    px-4
                    py-3
                    mb-5
                    drop-grid
                ">

                    <div class="d-flex align-items-center">

                        <div class="symbol symbol-50px me-5">

                            <span
                                class="symbol-label question-color"
                                data-color="${item.color || ""}">

                                <span class="svg-icon svg-icon-2x svg-icon-danger">

                                    <img
                                        src="${item.icon || ""}"
                                        alt=""
                                    />

                                </span>

                            </span>

                        </div>


                        <div class="d-flex flex-column">

                            <div class="text-dark fs-6 fw-bold">

                                ${item.isMandatory
            ? '<span class="required"></span>'
            : ''
        }

                                ${item.voteQuestionTitle || ""}

                            </div>


                            <div class="Line2Card">

                                ${groupPath
            ? `
                                            <span
                                                class="badge badge-light text-muted mx-2">

                                                ${groupPath}

                                            </span>
                                          `
            : ""
        }

                                ${startQuestionHtml}

                            </div>

                        </div>

                    </div>


                    <div class="drop-actions">

                        <div class="d-flex">

                            ${configurationButton}


                            <a class="
                                    btn
                                    btn-sm
                                    btn-light-danger
                                    btn-icon
                                    delete-vote-question
                               "

                               data-id="${detailId}"

                               title="حذف">

                                <i class="fonticon-trash fs-2x"></i>

                            </a>

                        </div>

                    </div>

                </div>

            </div>

        </div>
    `;
}

function addSelectStartQuestionList() {
    $("#selectStartQuestion").empty();

    $.ajax({
        url: '/VotePackageDetail/GetAllVotePackageDetailByVotePackageId',

        type: "POST",
        dataType: 'json',
        data: {
            votePackageId: $("#VotePackageId").val(),
            pagesize: 1000,
        },
        beforeSend: function (xhr) {
            xhr.setRequestHeader("RequestVerificationToken", $('input[name="__RequestVerificationToken"]').val());
        },
        success: function (data) {

            for (var i = 0; i < data.result.length; i++) {

                var itemType = new Option(data.result[i].voteQuestionTitle, data.result[i].votePackageDetailId, false, false);
                $("#selectStartQuestion").append(itemType);
            }
        },
        error: function (xhr, status, message) {
            Swal.fire({
                text: "خطا ! لطفا با ادمین سیستم تماس بگیرید",
                icon: "warning",
                buttonsStyling: !1,
                confirmButtonText: "بستن",
                customClass: { confirmButton: "btn btn-confirmPage" },
            });
        }
    });
}


function checkedSelectedStartQuestion() {
}
function selectStartQuestion(selectStartQuestion) {
    var selectStartQuestion = $('input[name="isStartInPackage"]:checked').val();


    if (selectStartQuestion > 0) {
        $.ajax({
            url: '/VotePackageDetail/UpdateVotePackageDetailIsStart',
            type: "POST",
            dataType: 'json',
            data: {
                'VotePackageDetailId': selectStartQuestion,
            },
            beforeSend: function (xhr) {
                xhr.setRequestHeader("RequestVerificationToken", $('input[name="__RequestVerificationToken"]').val());
            }, success: function (data) {
                if (data.success) {
                    stepper.goNext();
                } else {
                    Swal.fire({
                        text: data.operationErrors[0].description,
                        icon: "warning",
                        buttonsStyling: !1,
                        confirmButtonText: "بستن",
                        customClass: { confirmButton: "btn btn-confirmPage" },
                    });
                }
            },
            error: function (xhr, status, message) {
                Swal.fire({
                    text: "خطا ! لطفا با ادمین سیستم تماس بگیرید",
                    icon: "warning",
                    buttonsStyling: !1,
                    confirmButtonText: "بستن",
                    customClass: { confirmButton: "btn btn-confirmPage" },
                });
            }
        });
    }
    else {

        Swal.fire({
            text: "لطفا یک سوال را برای شروع  انتخاب نمایید",
            icon: "warning",
            buttonsStyling: !1,
            confirmButtonText: "بستن",
            customClass: { confirmButton: "btn btn-confirmPage" },
        })
    }

    return selectStartQuestion;
}

function GetAllVotePackageDetailByVotePackageId() {

    $.ajax({

        url: '/VotePackageDetail/GetAllVotePackageDetailByVotePackageId',

        type: "POST",

        dataType: 'json',

        data: {
            votePackageId: $("#VotePackageIdGET").val(),
            pagesize: 1000,
        },

        beforeSend: function (xhr) {

            xhr.setRequestHeader(
                "RequestVerificationToken",
                $('input[name="__RequestVerificationToken"]').val()
            );

        },

        success: function (data) {

            currentVotePackageDetails =
                data.result || [];


            syncNextOrderIndex(
                currentVotePackageDetails
            );


            addInDropItems({
                result:
                    currentVotePackageDetails
            });


            for (
                var i = 0;
                i < currentVotePackageDetails.length;
                i++
            ) {

                if (
                    currentVotePackageDetails[i].isStart === true
                ) {

                    const isStartRadio =
                        currentVotePackageDetails[i]
                            .votePackageDetailId;


                    $('#isStart-QuestionNumber' + isStartRadio)
                        .prop(
                            'checked',
                            true
                        );
                }
            }


            $('#kt_modal_add_question')
                .modal('hide');

        },

        error: function (xhr, status, message) {

            console.error(
                "GetAllVotePackageDetailByVotePackageId error:",
                xhr
            );

            Swal.fire({

                text:
                    "خطا ! لطفا با ادمین سیستم تماس بگیرید",

                icon:
                    "warning",

                buttonsStyling:
                    false,

                confirmButtonText:
                    "بستن",

                customClass: {
                    confirmButton:
                        "btn btn-confirmPage"
                }

            });

        }

    });

}

function getQuestionOrderIndex(item) {

    const value = Number(
        item.orderIndex
        ??
        item.OrderIndex
        ??
        0
    );

    return Number.isFinite(value)
        ? value
        : 0;
}


function syncNextOrderIndex(items) {

    if (
        !Array.isArray(items) ||
        items.length === 0
    ) {

        nextVotePackageDetailOrderIndex =
            Math.max(
                nextVotePackageDetailOrderIndex,
                1
            );

        return;
    }


    const maxOrderIndex =
        Math.max(
            ...items.map(
                function (item) {

                    return getQuestionOrderIndex(
                        item
                    );

                }
            )
        );


    // هیچ‌وقت Counter را عقب نمی‌بریم
    nextVotePackageDetailOrderIndex =
        Math.max(
            nextVotePackageDetailOrderIndex,
            maxOrderIndex + 1
        );
}

function getQuestionOrderIndex(item) {

    const value = Number(
        item.orderIndex
        ??
        item.OrderIndex
        ??
        0
    );

    return Number.isFinite(value)
        ? value
        : 0;
}


function syncNextOrderIndex(items) {

    if (
        !Array.isArray(items) ||
        items.length === 0
    ) {

        if (nextVotePackageDetailOrderIndex < 1) {
            nextVotePackageDetailOrderIndex = 1;
        }

        return;
    }


    const maxOrderIndex =
        Math.max(
            ...items.map(
                function (item) {

                    return getQuestionOrderIndex(
                        item
                    );

                }
            )
        );


    nextVotePackageDetailOrderIndex =
        Math.max(
            nextVotePackageDetailOrderIndex,
            maxOrderIndex + 1
        );
}


function getNextOrderIndex() {

    const orderIndex =
        nextVotePackageDetailOrderIndex;

    nextVotePackageDetailOrderIndex++;

    return orderIndex;
}

function loadQuestionForVotePackage() {

    $.ajax({
        url: '/VotePackageDetail/GetAllVotePackageDetailByVotePackageId',

        type: "POST",
        dataType: 'json',
        data: {
            // votePackageId: $("#VotePackageId").val(),
            votePackageId: $("#VotePackageIdGET").val(),
            pagesize: 1000,
        },
        beforeSend: function (xhr) {
            xhr.setRequestHeader("RequestVerificationToken", $('input[name="__RequestVerificationToken"]').val());
        },
        success: function (data) {
            $("#drop-items").empty();
            addInDropItems(data);
            $('#kt_modal_add_question').modal('hide');
            clearModalAddQuestionForData();
            clearModalAddQuestionForGroup();
            for (var i = 0; i < data.result.length; i++) {


                if (data.result[i].isStart == true) {

                    var isStartRadio = data.result[i].votePackageDetailId;
                    $('#isStart-QuestionNumber' + isStartRadio).attr('checked', 'checked');
                } else { }
            }

        },
        error: function (xhr, status, message) {
            Swal.fire({
                text: "خطا ! لطفا با ادمین سیستم تماس بگیرید",
                icon: "warning",
                buttonsStyling: !1,
                confirmButtonText: "بستن",
                customClass: { confirmButton: "btn btn-confirmPage" },
            });
        }
    });
}

$(document).on('change', '#IsActive', function () {
    if (this.checked) {
        $("#IsActive").attr('checked', 'checked');
        $("#IsActive").val('true');
    } else {
        $("#IsActive").val('false');
        $("#IsActive").removeAttr("checked");

    }
});

$(document).on('change', '#IsDefault', function () {
    if (this.checked) {
        $("#IsDefault").attr('checked', 'checked');
        $("#IsDefault").val('true');

    } else {
        $("#IsDefault").val('false');
        $("#IsDefault").removeAttr("checked");

    }
});

$(document).on('change', '#IsLoginMandatory', function () {
    if (this.checked) {
        $("#IsLoginMandatory").attr('checked', 'checked');
        $("#IsLoginMandatory").val('true');
    } else {
        $("#IsLoginMandatory").val('false');
        $("#IsLoginMandatory").removeAttr("checked");

    }
});
$(document).on('change', '#IsLoginMandatory', function () {
    if (this.checked) {
        $("#IsLoginMandatory").attr('checked', 'checked');
        $("#IsLoginMandatory").val('true');
    } else {
        $("#IsLoginMandatory").val('false');
        $("#IsMandatory").removeAttr("checked");

    }
});
$(document).on('change', '#IsMandatory', function () {
    if (this.checked) {
        $("#IsMandatory").attr('checked', 'checked');
        $("#IsMandatory").val('true');
    } else {
        $("#IsMandatory").val('false');
        $("#IsMandatory").removeAttr("checked");

    }
});

$(document).on('change', '#IsComboBoxShow', function () {
    if (this.checked) {
        $("#IsComboBoxShow").attr('checked', 'checked');
        $("#IsComboBoxShow").val('true');
    } else {
        $("#IsComboBoxShow").val('false');
        $("#IsComboBoxShow").removeAttr("checked");

    }
});


function PostDataToPocessTypeVotePackage(selectedprocessTypeId) {
    // Show loading state
    Swal.fire({
        title: "در حال پردازش...",
        text: "لطفاً منتظر بمانید",
        allowOutsideClick: false,
        allowEscapeKey: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });

    var listItem = [];
    var votePackageId = $("#VotePackageIdGET").val();
    if (selectedprocessTypeId.length === 0) {
        listItem.push({
            'ProcessTypeId': 0
        })
    } else {
        for (var i = 0; i < selectedprocessTypeId.length; i++) {
            listItem.push({
                'ProcessTypeId': selectedprocessTypeId[i]
            })
        }
    }

    $.ajax({
        url: '/ProcessTypeVotePackage/CreateProcessTypeVotePackage',
        type: "POST",
        dataType: 'json',
        data: {
            'CreateProcessTypeVotePackage': listItem,
            'VotePackageId': votePackageId
        },
        beforeSend: function (xhr) {
            xhr.setRequestHeader("RequestVerificationToken", $('input[name="__RequestVerificationToken"]').val());
        },
        success: function (response) {
            Swal.close(); // Close loading dialog

            // Check if the response indicates success
            if (response.success === true || response.success === undefined) {
                // Success - move to next step
                stepper.goNext();
            } else {
                var errorMessage = response?.operationErrors?.[0]?.description ??
                    response?.validationErrors?.[0]?.errorMessage ??
                    response?.message ??
                    response?.data ??
                    "خطایی رخ داده است!";
                Swal.fire({
                    text: errorMessage,
                    icon: "warning",
                    buttonsStyling: !1,
                    confirmButtonText: "تایید",
                    customClass: { confirmButton: "btn btn-confirmPage" },

                });
            }
        },
        error: function (xhr, status, error) {
            Swal.close(); // Close loading dialog

            let errorMessage = "خطا در ارتباط با سرور";

            // Check if the global ajaxError handler already showed a message
            // For 401, 403, 429 the global handler will show the message
            if (xhr.status === 400) {
                // Bad request - try to get validation errors
                try {
                    const response = JSON.parse(xhr.responseText);
                    if (response.operationErrors && response.operationErrors.length > 0) {
                        errorMessage = response.operationErrors[0].description;
                    } else if (response.errors) {
                        errorMessage = Object.values(response.errors).flat().join('\n');
                    }
                } catch (e) {
                    errorMessage = "خطا در اعتبارسنجی اطلاعات";
                }
                Swal.fire({
                    text: errorMessage,
                    icon: "error",
                    buttonsStyling: false,
                    confirmButtonText: "تایید",
                    customClass: { confirmButton: "btn btn-confirmPage" }
                });
            }
            else if (xhr.status !== 401 && xhr.status !== 403 && xhr.status !== 429) {
                // Only show generic error if not handled by global handler
                Swal.fire({
                    text: "خطا در ذخیره اطلاعات. لطفاً مجدداً تلاش کنید.",
                    icon: "error",
                    buttonsStyling: false,
                    confirmButtonText: "تایید",
                    customClass: { confirmButton: "btn btn-confirmPage" }
                });
            }

            // Do NOT call stepper.goNext() here - stay on current step
            console.error('PostDataToPocessTypeVotePackage error:', status, error);
        }
    });
}


var EndAndSaveProcessTypeVotePackage = document.getElementById("kt_submit");
EndAndSaveProcessTypeVotePackage.addEventListener('click', function (e) {
    // Declare variables first
    const hasEmployees = selectedPersonnelCodes && selectedPersonnelCodes.length > 0;
    const hasOrganizations = selectedOrganizationCodes && selectedOrganizationCodes.length > 0;
    const hasStructures = selectedOrganizationStructureCodes && selectedOrganizationStructureCodes.length > 0;
    const activeSteps = getActiveSteps($('input[name="SurveyTypeSelect"]:checked').val())

    if (activeSteps.includes(3)) {
        selectStartQuestion(selectStartQuestion);
        if (!selectStartQuestion(selectStartQuestion)) return
    }

    if (activeSteps.includes(2) && activeSteps.includes(4) && isOwnerRequired) {
        if (!hasEmployees && !hasOrganizations && !hasStructures) {
            Swal.fire({
                text: "لطفاً حداقل یک مورد را از لیست سمت، شعب یا اشخاص انتخاب کنید",
                icon: "warning",
                buttonsStyling: false,
                confirmButtonText: "تایید",
                customClass: { confirmButton: "btn btn-confirmPage" }
            });
            return;
        }
    }


    GetDataToVotePackageOwner(selectedPersonnelCodes, selectedOrganizationCodes, selectedOrganizationStructureCodes);
});


function GetDataToVotePackageOwner(selectedPersonnelCodes, selectedOrganizationCodes, selectedOrganizationStructureCodes) {
    var listItem = [];

    for (var i = 0; i < selectedPersonnelCodes.length; i++) {
        listItem.push({
            'VotePackageId': $("#VotePackageIdGET").val(),
            'EmployeeId': selectedPersonnelCodes[i],
            'OrganizationId': '',
            'OrganizationStructureId': ''
        })
    }

    for (var i = 0; i < selectedOrganizationCodes.length; i++) {
        listItem.push({
            'VotePackageId': $("#VotePackageIdGET").val(),
            'EmployeeId': '',
            'OrganizationId': selectedOrganizationCodes[i],
            'OrganizationStructureId': ''
        })
    }

    for (var i = 0; i < selectedOrganizationStructureCodes.length; i++) {
        listItem.push({
            'VotePackageId': $("#VotePackageIdGET").val(),
            'EmployeeId': '',
            'OrganizationId': '',
            'OrganizationStructureId': selectedOrganizationStructureCodes[i]
        })
    }

    let errors = '';


    if (listItem.length != 0) {


        $.ajax({
            url: '/VotePackageOwner/CreateVotePackageOwner',
            type: "POST",
            dataType: 'json',
            data: {
                'CreateVotePackageOwners': listItem
            },
            beforeSend: function (xhr) {
                xhr.setRequestHeader("RequestVerificationToken", $('input[name="__RequestVerificationToken"]').val());
            }, success: function (data) {
                if (data.success) {
                    Swal.fire({

                        text: "با موفقیت انجام شد",
                        icon: "success",
                        buttonsStyling: !1,
                        confirmButtonText: "بستن",
                        customClass: { confirmButton: "btn btn-confirmPage" },
                    }).then((result) => {
                        if (result.isConfirmed) {
                            window.location.href = '../VotePackage';
                        }
                    });
                } else {
                    var errorMessage = response?.operationErrors?.[0]?.description ??
                        response?.validationErrors?.[0]?.errorMessage ??
                        response?.message ??
                        response?.data ??
                        "خطایی رخ داده است!";
                    Swal.fire({
                        text: errorMessage,
                        icon: "warning",
                        buttonsStyling: !1,
                        confirmButtonText: "تایید",
                        customClass: { confirmButton: "btn btn-confirmPage" },

                    }).then((result) => {
                        if (result.isConfirmed) {
                            window.location.href = '../VotePackage';
                        }
                    });
                }

            }

        });
    } else {
        window.location.href = '../VotePackage';

    }

}



// Adding an event listener for the 'Enter' key press on the input field
document.getElementById("ProcessTypeSerachInput").addEventListener("keyup", function (event) {
    // Clear selection when search input changes
    selectedprocessTypeId = [];
    if (event.key === "Enter") {
        CheckAllProcessTypes(event.target.value);
    }
});




let dataTableProcessType; // Variable to store the DataTable instance
let globalSearchValueProcessType = '';

function CheckAllProcessTypes(value) {
    globalSearchValueProcessType = value; // Update the search value

    if (!dataTableProcessType) {
        // Initialize the DataTable with server-side processing
        dataTableProcessType = $("#kt_view_ProssesTypeChoosen").DataTable({
            processing: true,
            serverSide: true,
            paging: true,
            searching: true,
            lengthChange: true,
            pageLength: 10,
            info: true,
            ajax: function (data, callback, settings) {
                // Calculate the current page and page size
                const page = Math.ceil(settings._iDisplayStart / settings._iDisplayLength) + 1;
                const pageSize = settings._iDisplayLength;

                // AJAX call to fetch process type data with search and pagination parameters
                $.ajax({
                    type: "GET",
                    dataType: 'json',
                    url: '/ProcessType/GetAllProcessTypesByFilter',
                    data: {
                        page: page,
                        pageSize: pageSize,
                        name: globalSearchValueProcessType, // Pass the search value
                        votePackageId: $("#VotePackageIdGET").val()
                    },
                    success: function (response) {
                        filteredRecordCount = response.filteredRecordCount; // Update the filtered record count
                        // Populate DataTable with new data
                        selectedprocessTypeId = [];
                        callback({
                            draw: data.draw,
                            data: response.result || [],
                            recordsTotal: response.totalRecordCount,
                            recordsFiltered: response.filteredRecordCount
                        });

                        // Sync checkbox states with selectedProcessTypeIds array
                        updateProcessTypeCheckboxes();
                    },
                    error: function (xhr, textStatus, errorThrown) {
                        console.error('AJAX Error: ', textStatus, errorThrown);
                        Swal.fire({
                            text: "خطا ! لطفا با ادمین سیستم تماس بگیرید",
                            icon: "warning",
                            buttonsStyling: false,
                            confirmButtonText: "بستن",
                            customClass: { confirmButton: "btn btn-confirmPage" },
                        });
                    }
                });
            },
            columns: [
                {
                    data: 'processTypeId',
                    render: function (data, type, row) {
                        // Render a checkbox for selecting process types
                        let checked = selectedprocessTypeId.includes(data) ? 'checked' : '';
                        return `
                            <div class="form-check form-check-sm form-check-custom form-check-solid px-5">
                                <input id="${data}" class="form-check-input selection-process-type" type="checkbox" value="1" ${checked} />
                            </div>`;
                    },
                    orderable: false // Disable sorting on the checkbox column
                },
                {
                    data: 'name',
                    render: function (data, type, row) {
                        // Render the process type name with a custom SVG icon
                        return `
                            <div class="d-flex align-items-center">
                                <span class="svg-icon svg-icon-primary svg-icon-2hx me-3">
                                    <svg b-pdy6lt59wi="" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                                        <path b-pdy6lt59wi="" d="M6.28548 15.0861C7.34369 13.1814 9.35142 12 11.5304 12H12.4696C14.6486 12 16.6563 13.1814 17.7145 15.0861L19.3493 18.0287C20.0899 19.3618 19.1259 21 17.601 21H6.39903C4.87406 21 3.91012 19.3618 4.65071 18.0287L6.28548 15.0861Z" fill="#77cf97"></path>
                                        <rect b-pdy6lt59wi="" opacity="0.3" x="8" y="3" width="8" height="8" rx="4" fill="#77cf97"></rect>
                                    </svg>
                                </span>
                                <span class="text-gray-800 text-hover-primary mb-1">${row.name}</span>
                            </div>`;
                    }
                },
                {
                    data: "activeVotePackage_Date",
                    render: function (data, type, row) {
                        const date = toPersianDigits(row.activeVotePackage_Date || '');
                        const name = row.activeVotePackage || '';

                        const nameHtml = name
                            ? `<span class="vp-name-badge" title="${name}">${name}</span>`
                            : '';

                        return `${nameHtml}<span class="vp-date-text">${date}</span>`;
                    }

                },
                { data: 'code' } // Display the process type code
            ],
            order: [[1, 'asc']], // Default sorting on the name column

            rowCallback: function (row, data) {
                if (data.activeVotePackage_Date) {
                    $(row).addClass('disabled-row');
                    // جلوگیری از کلیک روی کل ردیف
                    $(row).find('.selection-process-type').prop('disabled', true);
                }
            }

        });

        // Use event delegation for dynamically created checkboxes
        $(document).off('change', '.selection-process-type').on('change', '.selection-process-type', function () {
            toggleSelectionProcessTypes(this, true);
        });

    } else {
        dataTableProcessType.ajax.reload(); // Reload DataTable with updated search term
    }
}

// Function to handle checkbox state changes for process types
function toggleSelectionProcessTypes(checkbox, isMultiSelect = false) {
    let ProcessTypesId = Number(checkbox.id);

    if (!isMultiSelect) {
        selectedprocessTypeId = checkbox.checked ? [ProcessTypesId] : [];
        document.querySelectorAll('.process-type-checkbox').forEach(cb => {
            if (cb !== checkbox) cb.checked = false;
        });
    } else {
        if (checkbox.checked) {
            if (!selectedprocessTypeId.includes(ProcessTypesId)) {
                selectedprocessTypeId.push(ProcessTypesId);
            }
        } else {
            selectedprocessTypeId = selectedprocessTypeId.filter(id => id !== ProcessTypesId);
        }
    }
}


// Function to synchronize checkbox states based on selected process type IDs
function updateProcessTypeCheckboxes() {
    selectedprocessTypeId.forEach(processTypeId => {
        let checkbox = document.getElementById(processTypeId);

        if (checkbox && !checkbox.disabled) {
            checkbox.checked = true; // Ensure the checkbox is checked if selected
        }
    });
}

document.getElementById("ProcessTypeSelectAll").addEventListener("change", function () {
    selectAllProcessType(this);
});
// Disable "Select All" functionality for single selection
let selectAllCheckbox = document.getElementById("ProcessTypeSelectAll");

function selectAllProcessType(selectAllCheckbox) {
    // Since only one service can be selected, "select all" is not allowed
    if (selectAllCheckbox.checked) {
        selectedPersonnelCodes = [];
        // Get all filtered records by setting page size to filteredRecordCount
        $.ajax({
            type: "GET",
            dataType: 'json',
            url: '/ProcessType/GetAllProcessTypesByFilter',
            data: {
                page: 1,
                pageSize: filteredRecordCount,
                name: globalSearchValueProcessType, // Pass the search value
                votePackageId: $("#VotePackageIdGET").val()
            },
            success: function (response) {
                response.result.forEach(item => {
                    if (!item.activeVotePackage) {
                        selectedprocessTypeId.push(item.processTypeId);
                    }
                });

                updateProcessTypeCheckboxes();
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.error('Ajax Error: ', textStatus, errorThrown);
            }
        });
    } else {
        // Uncheck all if needed (but we don't allow select all)
        selectedprocessTypeId = [];
        let checkboxes = document.querySelectorAll('#kt_view_ProssesTypeChoosen tbody .form-check-input:not(#ProcessTypeSelectAll)');
        checkboxes.forEach(checkbox => {
            checkbox.checked = false;
        });
    }
}

$(document).ready(function () {
    // Search input listener for updating DataTable
    $('#processTypeSearchInput').on('keyup', function () {
        CheckAllProcessTypes(this.value); // Fetch and update DataTable based on search input
    });
});




// Adding an event listener for the 'Enter' key press on the input field
document.getElementById("EmployeesearchInput").addEventListener("keyup", function (event) {
    // Check if the pressed key is "Enter"
    if (event.key === "Enter") {
        // Get the value from the input field and pass it to the function
        CheckEmployeeValue(event.target.value);
    }
});




let selectedPersonnelCodes = []; // Array to keep track of selected employee IDs
let dataTableEmployee; // Variable to store the DataTable instance
let globalSearchValueEmployee = ''; // Global variable for search value

function CheckEmployeeValue(value) {
    globalSearchValueEmployee = value; // Update the search value

    if (!dataTableEmployee) {
        // Initialize the DataTable with server-side processing
        dataTableEmployee = $("#kt_roles_view_table").DataTable({
            processing: true,
            serverSide: true,
            paging: true,
            searching: true,
            lengthChange: true,
            pageLength: 10,
            info: true,
            ajax: function (data, callback, settings) {
                // Calculate the current page and page size
                const page = Math.ceil(settings._iDisplayStart / settings._iDisplayLength) + 1;
                const pageSize = settings._iDisplayLength;

                // AJAX call to fetch employee data with search and pagination parameters
                $.ajax({
                    type: "GET",
                    dataType: 'json',
                    url: '/Employee/IndexSearch',
                    data: {
                        page: page,
                        pageSize: pageSize,
                        lastName: globalSearchValueEmployee // Pass the search value
                    },
                    success: function (response) {
                        $('#EmployeeChoosen').show()
                        filteredRecordCount = response.filteredRecordCount; // Update the filtered record count
                        // Populate DataTable with new data
                        callback({
                            draw: data.draw,
                            data: response.result || [],
                            recordsTotal: response.totalRecordCount,
                            recordsFiltered: response.filteredRecordCount
                        });

                        // Sync checkbox states with selectedPersonnelCodes array
                        updateEmployeeCheckboxes();
                    },
                    error: function (xhr, textStatus, errorThrown) {
                        console.error('AJAX Error: ', textStatus, errorThrown);
                    }
                });
            },
            columns: [
                {
                    data: 'employeeId',
                    render: function (data, type, row) {
                        // Render a checkbox for selecting employees
                        let checked = selectedPersonnelCodes.includes(data) ? 'checked' : '';
                        return `
                            <div class="form-check form-check-sm form-check-custom form-check-solid px-5">
                                <input id="${data}" class="form-check-input toggle-selection-checkbox" type="checkbox" value="1" ${checked} />
                            </div>`;
                    },
                    orderable: false // Disable sorting on the checkbox column
                },
                {
                    data: null,
                    render: function (data, type, row) {
                        // Render the employee's full name with custom SVG icon
                        return `
                           <div class="d-flex align-items-center">
                                <span class="svg-icon svg-icon-primary svg-icon-2hx me-3">
                                    <svg b-pdy6lt59wi="" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                                        <path b-pdy6lt59wi="" d="M6.28548 15.0861C7.34369 13.1814 9.35142 12 11.5304 12H12.4696C14.6486 12 16.6563 13.1814 17.7145 15.0861L19.3493 18.0287C20.0899 19.3618 19.1259 21 17.601 21H6.39903C4.87406 21 3.91012 19.3618 4.65071 18.0287L6.28548 15.0861Z" fill="#77cf97"></path>
                                        <rect b-pdy6lt59wi="" opacity="0.3" x="8" y="3" width="8" height="8" rx="4" fill="#77cf97"></rect>
                                    </svg>
                                </span>
                                <span class="text-gray-800 text-hover-primary mb-1">${row.firstName}</span>
                            </div>`;
                    }
                },
                { data: 'lastName' }, // Display the lastName
                { data: 'personnelCode' }, // Display the personnel code
                { data: 'organizationTitle' }, // Display the personnel code
                { data: 'organizationStructureTitle' } // Display the personnel code
            ],
            order: [[1, 'asc']], // Default sorting on the name column
        });

        // Use event delegation for dynamically created checkboxes
        $(document).off('change', '.toggle-selection-checkbox').on('change', '.toggle-selection-checkbox', function () {
            toggleSelection(this);
        });

    } else {
        dataTableEmployee.ajax.reload(); // Reload DataTable with updated search term
    }
}

// Function to handle checkbox state changes
function toggleSelection(checkbox) {

    let employeeId = checkbox.id; // Retrieve employee ID from checkbox

    if (checkbox.checked) {
        // Add the employee ID to the selected list if not already present
        if (!selectedPersonnelCodes.includes(employeeId)) {
            selectedPersonnelCodes.push(employeeId);
        }
    } else {
        // Remove the employee ID from the selected list
        selectedPersonnelCodes = selectedPersonnelCodes.filter(code => code !== employeeId);
    }
}

// Function to synchronize checkbox states based on selected personnel codes
function updateEmployeeCheckboxes() {
    selectedPersonnelCodes.forEach(employeeId => {
        let checkbox = document.getElementById(employeeId);
        if (checkbox) {
            checkbox.checked = true; // Ensure the checkbox is checked if selected
        }
    });
}

document.getElementById("EmployeeSelectAll").addEventListener("change", function () {
    selectAllEmployees(this);
});

function selectAllEmployees(selectAllCheckbox) {
    if (selectAllCheckbox.checked) {
        selectedPersonnelCodes = [];
        // Get all filtered records by setting page size to filteredRecordCount
        $.ajax({
            type: "GET",
            dataType: 'json',
            url: '/Employee/IndexSearch',
            data: {
                page: 1,
                pageSize: filteredRecordCount,
                lastName: globalSearchValueEmployee
            },
            success: function (response) {
                response.result.forEach(item => {

                    selectedPersonnelCodes.push(item.employeeId);

                });
                updateEmployeeCheckboxes();
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.error('Ajax Error: ', textStatus, errorThrown);
            }
        });
    } else {
        selectedPersonnelCodes = [];
        let checkboxes = document.querySelectorAll('#kt_roles_view_table tbody .form-check-input:not(#EmployeeSelectAll)');
        checkboxes.forEach(checkbox => {
            checkbox.checked = false;
        });
    }
}
$(document).ready(function () {

    // Search input listener for updating DataTable
    $('#employeeSearchInput').on('keyup', function () {
        CheckEmployeeValue(this.value); // Fetch and update DataTable based on search input
    });
});



// Adding an event listener for the 'Enter' key press on the input field
document.getElementById("OrganizationStructureSearchInput").addEventListener("keyup", function (event) {
    // Check if the pressed key is "Enter"
    if (event.key === "Enter") {
        // Get the value from the input field and pass it to the function
        CheckOrganizationStructureTitleValue(event.target.value);
    }
});





let selectedOrganizationStructureCodes = []; // Array to store selected organization structure IDs
let dataTableOrganizationStructure; // Variable to store the DataTable instance for organization structures
let globalSearchValueOrganizationStructure = ''; // Global variable for search value

function CheckOrganizationStructureTitleValue(value) {
    globalSearchValueOrganizationStructure = value; // Update the search value

    if (!dataTableOrganizationStructure) {
        // Initialize the DataTable with server-side processing
        dataTableOrganizationStructure = $('#kt_view_OrganizationStructureChoosen').DataTable({
            processing: true,
            serverSide: true,
            paging: true,
            searching: true,
            lengthChange: true,
            pageLength: 10,
            info: true,
            ajax: function (data, callback, settings) {
                // Calculate the current page and page size
                const page = Math.ceil(settings._iDisplayStart / settings._iDisplayLength) + 1;
                const pageSize = settings._iDisplayLength;

                // AJAX call to fetch organization structure data with search and pagination parameters
                $.ajax({
                    type: "GET",
                    dataType: 'json',
                    url: '/OrganizationStructure/IndexSearch',
                    data: {
                        page: page,
                        pageSize: pageSize,
                        title: globalSearchValueOrganizationStructure // Pass the updated search value
                    },
                    success: function (response) {
                        $('#OrganizationStructureChoosen').show()

                        filteredRecordCount = response.filteredRecordCount; // Update the filtered record count
                        // Populate DataTable with new data
                        callback({
                            draw: data.draw,
                            data: response.result || [],
                            recordsTotal: response.totalRecordCount,
                            recordsFiltered: response.filteredRecordCount
                        });

                        // Sync checkbox states with selectedOrganizationStructureCodes array
                        updateOrganizationStructureCheckboxes();
                    },
                    error: function (xhr, textStatus, errorThrown) {
                        console.error('AJAX Error: ', textStatus, errorThrown);
                    }
                });
            },
            columns: [
                {
                    data: 'organizationStructureId',
                    render: function (data, type, row) {
                        // Render a checkbox for selecting organization structures
                        let checked = selectedOrganizationStructureCodes.includes(data) ? 'checked' : '';
                        return `
                            <div class="form-check form-check-sm form-check-custom form-check-solid px-5">
                                <input id="${data}" class="form-check-input organization-structure-checkbox" type="checkbox" value="1" ${checked} />
                            </div>`;
                    },
                    orderable: false // Disable sorting on the checkbox column
                },
                {
                    data: null,
                    render: function (data, type, row) {
                        // Render the organization structure title with a custom icon
                        return `
                            <div class="d-flex align-items-center p-1">
                                <div class="symbol symbol-circle symbol-40px overflow-hidden me-3">
                                    <div class="symbol-label">
                                        <span class="svg-icon svg-icon-info svg-icon-2hx">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                                                <path opacity="0.3" d="M20 15H4C2.9 15 2 14.1 2 13V7C2 6.4 2.4 6 3 6H21C21.6 6 22 6.4 22 7V13C22 14.1 21.1 15 20 15ZM13 12H11C10.5 12 10 12.4 10 13V16C10 16.5 10.4 17 11 17H13C13.6 17 14 16.6 14 16V13C14 12.4 13.6 12 13 12Z" fill="black"></path>
                                                <path d="M14 6V5H10V6H8V5C8 3.9 8.9 3 10 3H14C15.1 3 16 3.9 16 5V6H14ZM20 15H14V16C14 16.6 13.5 17 13 17H11C10.5 17 10 16.6 10 16V15H4C3.6 15 3.3 14.9 3 14.7V18C3 19.1 3.9 20 5 20H19C20.1 20 21 19.1 21 18V14.7C20.7 14.9 20.4 15 20 15Z" fill="black"></path>
                                            </svg>
                                        </span>
                                    </div>
                                </div>
                                <div class="d-flex flex-column">
                                    <span class="text-gray-800 text-hover-primary mb-1">${row.title}</span>
                                </div>   
                            </div>`;
                    }
                },
                { data: 'organizationStructureCode' },
                { data: 'parentOrganizationStructureTitle' },
                { data: 'grade' },
            ],
            order: [[1, 'asc']], // Default sorting on the title column
        });

        // Use event delegation for dynamically created checkboxes
        $(document).off('change', '.organization-structure-checkbox').on('change', '.organization-structure-checkbox', function () {
            toggleOrganizationStructureSelection(this);
        });
    } else {
        dataTableOrganizationStructure.ajax.reload(); // Reload DataTable with updated search term
    }
}

// Function to handle checkbox state changes for organization structures
async function toggleOrganizationStructureSelection(checkbox) {
    let organizationStructureId = checkbox.id; // Retrieve organization structure ID from checkbox

    if (checkbox.checked) {
        // Add the organization structure ID to the selected list if not already present
        if (!selectedOrganizationStructureCodes.includes(organizationStructureId)) {
            selectedOrganizationStructureCodes.push(organizationStructureId);
        }

    } else {
        // Remove the organization structure ID from the selected list
        selectedOrganizationStructureCodes = selectedOrganizationStructureCodes.filter(id => id !== organizationStructureId);
    }
}

// Function to synchronize checkbox states based on selected organization structure codes
function updateOrganizationStructureCheckboxes() {

    selectedOrganizationStructureCodes.forEach(organizationStructureId => {
        let checkbox = document.getElementById(organizationStructureId);
        if (checkbox) {
            checkbox.checked = true; // Ensure the checkbox is checked if selected
        }
    });
}

document.getElementById("OrganizationStructureSelectAll").addEventListener("change", function () {
    selectAllOrganizationStructure(this);
});


function selectAllOrganizationStructure(selectAllCheckbox) {
    if (selectAllCheckbox.checked) {
        selectedOrganizationStructureCodes = [];

        // Get all filtered records by setting page size to filteredRecordCount
        $.ajax({
            type: "GET",
            dataType: 'json',
            url: '/OrganizationStructure/IndexSearch',
            data: {
                page: 1,
                pageSize: filteredRecordCount,
                title: globalSearchValueOrganizationStructure// Pass the search value
            },
            success: function (response) {
                response.result.forEach(item => {

                    selectedOrganizationStructureCodes.push(item.organizationStructureId);

                });
                updateOrganizationStructureCheckboxes();
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.error('Ajax Error: ', textStatus, errorThrown);
            }
        });
    } else {
        selectedOrganizationStructureCodes = [];
        let checkboxes = document.querySelectorAll('#kt_view_OrganizationStructureChoosen tbody .form-check-input:not(#OrganizationStructureSelectAll)');
        checkboxes.forEach(checkbox => {
            checkbox.checked = false; // Uncheck the checkbox
        });


    }
}

$(document).ready(function () {

    // Search input listener for updating DataTable
    $('#organizationStructureSearchInput').on('keyup', function () {
        CheckOrganizationStructureTitleValue(this.value); // Fetch and update DataTable based on search input
    });
});






// Adding an event listener for the 'Enter' key press on the input field
document.getElementById("OrganizationSearchInput").addEventListener("keyup", function (event) {
    // Check if the pressed key is "Enter"
    if (event.key === "Enter") {
        // Get the value from the input field and pass it to the function
        CheckOrganizationValue(event.target.value);
    }
});



let selectedOrganizationCodes = []; // Array to store selected organization IDs
let dataTableOrganization; // Variable to store the DataTable instance for organizations
let globalSearchValueOrganization = ''; // Global variable for search value

function CheckOrganizationValue(value) {
    globalSearchValueOrganization = value; // Update the search value

    if (!dataTableOrganization) {
        dataTableOrganization = $('#kt_view_table').DataTable({
            processing: true,
            serverSide: true,
            paging: true,
            searching: true,
            lengthChange: true,
            pageLength: 10,
            info: true,
            ajax: function (data, callback, settings) {
                // Extract the current page and items per page from DataTables settings
                const page = Math.ceil(settings._iDisplayStart / settings._iDisplayLength) + 1;
                const pageSize = settings._iDisplayLength;

                // AJAX call to fetch the data with pagination parameters
                $.ajax({
                    type: "GET",
                    dataType: 'json',
                    url: '/Organizations/IndexSearch',
                    data: {
                        page: page,
                        pageSize: pageSize,
                        title: globalSearchValueOrganization // Pass the search value
                    },
                    success: function (response) {
                        if (response.success) {
                            $('#OrganizationChoosen').show()
                            // Populate DataTable with new data
                            callback({
                                draw: data.draw,
                                data: response.result || [],
                                recordsTotal: response.totalRecordCount,
                                recordsFiltered: response.filteredRecordCount
                            });

                            // Update checkboxes after the table has been populated
                            updateOrganizationCheckboxes();
                        } else {
                            console.error("Error: No data found or unsuccessful response.");
                            callback({
                                draw: data.draw,
                                data: [],
                                recordsTotal: 0,
                                recordsFiltered: 0
                            });
                        }
                    },
                    error: function (xhr, textStatus, errorThrown) {
                        console.error('AJAX Error: ', textStatus, errorThrown);
                    }
                });
            },
            columns: [
                {
                    data: 'organizationId',
                    render: function (data, type, row) {
                        let checked = selectedOrganizationCodes.includes(data) ? 'checked' : '';
                        return `
                            <div class="form-check form-check-sm form-check-custom form-check-solid px-5">
                                <input id="org_${data}" class="form-check-input organization-checkbox" type="checkbox" value="${data}" ${checked} />
                            </div>`;
                    },
                    orderable: false // Disable sorting on the checkbox column
                },
                {
                    data: null,
                    render: function (data, type, row) {
                        // Include custom SVG icon here
                        return `
                            <div class="d-flex align-items-center p-1">
                                <div class="symbol symbol-circle symbol-40px overflow-hidden me-3">
                                    <div class="symbol-label">
                                        <span class="svg-icon svg-icon-primary svg-icon-2hx">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                                                <path d="M20 19.725V18.725C20 18.125 19.6 17.725 19 17.725H5C4.4 17.725 4 18.125 4 18.725V19.725H3C2.4 19.725 2 20.125 2 20.725V21.725H22V20.725C22 20.125 21.6 19.725 21 19.725H20Z" fill="black" />
                                                <path opacity="0.3" d="M22 6.725V7.725C22 8.325 21.6 8.725 21 8.725H18C18.6 8.725 19 9.125 19 9.725C19 10.325 18.6 10.725 18 10.725V15.725C18.6 15.725 19 16.125 19 16.725V17.725H15V16.725C15 16.125 15.4 15.725 16 15.725V10.725C15.4 10.725 15 10.325 15 9.725C15 9.125 15.4 8.725 16 8.725H13C13.6 8.725 14 9.125 14 9.725C14 10.325 13.6 10.725 13 10.725V15.725C13.6 15.725 14 16.125 14 16.725V17.725H10V16.725C10 16.125 10.4 15.725 11 15.725V10.725C10.4 10.725 10 10.325 10 9.725C10 9.125 10.4 8.725 11 8.725H8C8.6 8.725 9 9.125 9 9.725C9 10.325 8.6 10.725 8 10.725V15.725C8.6 15.725 9 16.125 9 16.725V17.725H5V16.725C5 16.125 5.4 15.725 6 15.725V10.725C5.4 10.725 5 10.325 5 9.725C5 9.125 5.4 8.725 6 8.725H3C2.4 8.725 2 8.325 2 7.725V6.725L11 2.225C11.6 1.925 12.4 1.925 13.1 2.225L22 6.725ZM12 3.725C11.2 3.725 10.5 4.425 10.5 5.225C10.5 6.025 11.2 6.725 12 6.725C12.8 6.725 13.5 6.025 13.5 5.225C13.5 4.425 12.8 3.725 12 3.725Z" fill="black"></path>
                                            </svg>
                                        </span>
                                    </div>
                                </div>
                                <div class="d-flex flex-column">
                                    <span class="text-gray-800 fw-bolder text-hover-primary mb-1">${row.title}</span>
                                </div>
                            </div>`;
                    }
                },
                { data: 'organizationCode', render: function (data) { return data || 'N/A'; } }, // Display organization code
                { data: 'parentOrganizationCode', render: function (data) { return data || 'N/A'; } }, // Display parent organization code
                { data: 'parentOrganizationTitle', render: function (data) { return data || 'N/A'; } }  // Display parent organization title
            ],
            order: [[1, 'asc']], // Default sorting on the title column
        });

        // Use event delegation for dynamically created checkboxes
        $(document).off('change', '.organization-checkbox').on('change', '.organization-checkbox', function () {
            toggleOrganizationSelection(this);
        });
    } else {
        dataTableOrganization.ajax.reload(); // Reload DataTable with updated search term
    }
}

// Function to handle checkbox state changes for organizations
function toggleOrganizationSelection(checkbox) {

    let organizationId = checkbox.value;

    if (checkbox.checked) {
        if (!selectedOrganizationCodes.includes(organizationId)) {
            selectedOrganizationCodes.push(organizationId);
        }
    } else {
        selectedOrganizationCodes = selectedOrganizationCodes.filter(id => id !== organizationId);
    }
}

// Function to synchronize checkbox states based on selected organization codes
function updateOrganizationCheckboxes() {
    selectedOrganizationCodes.forEach(organizationId => {
        let checkbox = document.getElementById(`org_${organizationId}`);
        if (checkbox) {
            checkbox.checked = true;
        }
    });
}

$(document).ready(function () {
    initializeSearchHandler();  // Initialize search handler for live updates
});

document.getElementById("OrganizationSelectAll").addEventListener("change", function () {
    selectAllOrganization(this);
});
function selectAllOrganization(selectAllCheckbox) {
    if (selectAllCheckbox.checked) {
        selectedOrganizationCodes = [];

        // Get all filtered records by setting page size to filteredRecordCount
        $.ajax({
            type: "GET",
            dataType: 'json',
            url: '/Organizations/IndexSearch',
            data: {
                page: 1,
                pageSize: filteredRecordCount,
                title: globalSearchValueOrganization // Pass the search value
            },
            success: function (response) {
                response.result.forEach(item => {

                    selectedOrganizationCodes.push(item.organizationId);

                });
                updateOrganizationCheckboxes();
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.error('Ajax Error: ', textStatus, errorThrown);
            }
        });
    } else {
        selectedOrganizationCodes = [];
        let checkboxes = document.querySelectorAll('#kt_view_table tbody .form-check-input:not(#OrganizationSelectAll)');

        checkboxes.forEach(checkbox => {
            checkbox.checked = false;
        });
    }
}

// Initialize search handler for input search
function initializeSearchHandler() {
    $('#organizationSearchInput').on('keyup', function () {
        CheckOrganizationValue(this.value); // Fetch and update DataTable based on search input
    });
}




function LoadAllOwnr() {

    CheckEmployeeValue();
    CheckOrganizationStructureTitleValue();
    CheckOrganizationValue();
}

function UpdateOwnerAll() {

    updateOrganizationCheckboxes();
    updateOrganizationStructureCheckboxes();
    updateEmployeeCheckboxes();
}




//stepper.on("kt.stepper.previous", function (stepper) {
//    stepper.goPrevious(); // go previous step
//});


function clearModalAddQuestionForData() {

    $("#addDataQuestion").empty();
    $("#LowerLimitChosenCount").val('');
    $("#UpperLimitChosenCount").val('');
    $("#LowerLimitNumericValue").val('');
    $("#UpperLimitNumericValue").val('');
    $("#LowerLimitDateValue").val('');
    $("#UpperLimitDateValue").val('');
    $("#numberOfChoosen").val('');
    $(".bodyQuestion").addClass('d-none');
    $(".addDataQuestionMain ").removeClass('active');
    // $("#VoteQuestionGroupId").empty();

    $("#IsInLoop")
        .prop(
            'checked',
            false
        );

}
function clearModalAddQuestionForGroup() {
    $("#VoteQuestionGroupId").empty();
    $("#VoteQuestionGroupId").prepend('<option  selected="selected"   disabled="disabled" value="None" >نام گروه را انتخاب نمایید</option>');
    $("#SubVoteQuestionGroupId").text(" نام زیر گروه را انتخاب نمایید  ");
    $("#AllQuestionByVoteQuestionGroupId").text("عنوان انتخاب سوال را انتخاب نمایید");

}
function prepareAddQuestionModal(
    compositionDetailId = null
) {

    activeCompositionDetailId =
        compositionDetailId
            ? String(compositionDetailId)
            : null;


    clearModalAddQuestionForData();

    clearModalAddQuestionForGroup();


    // ================================
    // عنوان مودال
    // ================================

    if (activeCompositionDetailId) {

        const composition =
            currentVotePackageDetails.find(
                function (item) {

                    return (
                        String(
                            item.votePackageDetailId
                        ) ===
                        String(
                            activeCompositionDetailId
                        )
                    );

                }
            );


        const title =
            composition?.voteQuestionTitle
            ??
            composition?.voteQuestion?.title
            ??
            "دسته سوالات";


        $("#AddQuestionModalTitle")
            .text(
                `افزودن سوال به دسته «${title}»`
            );

    }

    else {

        $("#AddQuestionModalTitle")
            .text(
                "افزودن سوال"
            );

    }


    // ================================
    // دریافت گروه‌های سوال
    // ================================

    $.ajax({

        type:
            "GET",

        dataType:
            "json",

        url:
            "/VoteQuestionGroup/GetAllActiveVoteQuestionGroupWithOutParentQuery",

        success:
            function (data2) {

                if (data2.length !== 0) {
                    page++;
                }


                for (
                    var i = 0;
                    i < data2.length;
                    i++
                ) {

                    var itemType =
                        new Option(

                            data2[i].title,

                            data2[i]
                                .voteQuestionGroupId,

                            false,

                            false

                        );


                    $("#VoteQuestionGroupId")
                        .append(itemType);

                }

            }

    });


    addSelectStartQuestionList();
}


// ============================================
// افزودن سوال مستقل
// ============================================

$(document).on(
    "click",
    "#kt_modal_add_question_btn",
    function () {

        activeCompositionDetailId = null;

        prepareAddQuestionModal(null);

    }
);



// ============================================
// افزودن سوال داخل دسته
// ============================================

$(document).on(
    "click",
    ".add-question-to-section",
    function () {

        const sectionId =
            $(this).data("section-id");

        prepareAddQuestionModal(
            sectionId
        );

    }
);

$('#VoteQuestionGroupId').on('select2:select', function (e) {
    var data = e.params.data;
    SelectedParentId = data.id;
    $.ajax({
        type: "GET",
        dataType: 'JSOn',
        url: '/VoteQuestionGroup/GetAllVoteQuestionGroupParentById',
        data: { parentid: data.id },
        success: function (data) {
            $('#SubVoteQuestionGroupId').empty();
            if (data.length > 0) {

                for (var i = 0; i < data.length; i++) {
                    var itemType = new Option(data[i].title, data[i].voteQuestionGroupId, false, false);
                    $("#SubVoteQuestionGroupId").append(itemType);
                }
                $("#SubVoteQuestionGroupId").prepend('<option selected="selected"  disabled="disabled" value="None" >  نام زیر گروه را انتخاب نمایید  </option>');
            } else {
                $('#SubVoteQuestionGroupId').empty();
            }
        }, error: function (xhr, status, error) {
        }
    });
});

$('#SubVoteQuestionGroupId').on('select2:select', function (e) {
    var data = e.params.data;
    SelectedSubQuestionId = data.id;
    isGroupSearch = true;
    clearTags();

    $.ajax({
        type: "POST",
        dataType: 'json',
        url: '/VoteQuestion/GetAllVoteQuestionByVoteQuestionGroupId',
        data: { voteQuestionGroupId: data.id },
        beforeSend: function (xhr) {
            xhr.setRequestHeader("RequestVerificationToken", $('input[name="__RequestVerificationToken"]').val());
        },
        success: function (data) {
            $('#AllQuestionByVoteQuestionGroupId').empty();

            if (data.length > 0) {

                for (var i = 0; i < data.length; i++) {
                    var itemType = new Option(data[i].title, data[i].voteQuestionId, false, false);
                    $("#AllQuestionByVoteQuestionGroupId").append(itemType);
                }
                $("#AllQuestionByVoteQuestionGroupId").prepend('<option selected="selected" disabled="disabled" value="None" >   عنوان انتخاب سوال را انتخاب نمایید</option>');
            } else {
                $('#AllQuestionByVoteQuestionGroupId').empty();
            }
        }, error: function (xhr, status, error) {
        }
    });
});

function handleUpperLimitChange() {
    var value = parseInt($(this).val(), 10);

    if (isNaN(value)) {
        value = 0;
    }

    var maxLength = parseInt($(this).attr('maxlength'), 10);
    if (maxLength && $(this).val().length > maxLength) {
        $(this).val($(this).val().slice(0, maxLength));
        value = parseInt($(this).val(), 10);
    }

    if (value > 1) {
        $('#IsComboBoxShowLabel').addClass('d-none');
    } else if (value === 1) {
        $('#IsComboBoxShowLabel').removeClass('d-none');
    }
}
$('#AllQuestionByVoteQuestionGroupId').on('select2:select', function (e) {

    var data = e.params.data;
    clearModalAddQuestionForData();


    $.ajax({
        type: "POST",
        dataType: 'json',
        url: '/VoteQuestion/GetVoteQuestionByVoteQuestionId',
        data: { voteQuestionId: data.id },
        beforeSend: function (xhr) {
            xhr.setRequestHeader("RequestVerificationToken", $('input[name="__RequestVerificationToken"]').val());
        },
        success: function (data) {
            var voteQuestionIdGET = data.data.voteQuestionId;
            $("#weightOfQuestion").val('');
            $("#weightOfQuestion").val(data.data.weight);
            $("#weightOfQuestion").text(data.data.weight);
            $("#voteQuestionIdGET").val(voteQuestionIdGET);
            $('.addDataQuestionMain').addClass('active');
            $('#bodyQuestion').addClass('active');
            $("#addDataQuestion").append(
                '<div class="d-flex space-between align-items-center w-100 mt-2">' +

                '<div class="d-flex align-items-center">' +

                '<div class="symbol symbol-50px me-5">' +

                '<span class="symbol-label colorBox" data-color="' + data.data.voteQuestionTypeList.color + '">' +

                '<span class="svg-icon svg-icon-2x">' +
                '<img class="iconBox" src="' + data.data.voteQuestionTypeList.icon + '" />' +
                '</span>' +

                '</span>' +

                '</div>' +

                '<div class="d-flex flex-column">' +

                '<a class="text-dark text-hover-primary fs-6 fw-bolder">' +
                data.data.title +
                '</a>' +

                '<span class="text-muted fw-bold"> نوع سوال:' +
                data.data.voteQuestionTypeList.title +
                '</span>' +

                '</div>' +

                '</div>' +

                '</div>' +

                '<input type="hidden" value="' +
                data.data.voteQuestionTypeList.voteQuestionTypeId +
                '" id="QuestionTypeIdToAdd" />'
            );


            document.querySelectorAll(".colorBox").forEach(function (el) {
                const color = el.dataset.color.replace('!important', '').trim();

                if (color) {
                    el.style.setProperty('background-color', color, 'important');
                }

            });

            $('#UpperLimitChosenCount').off('input change', handleUpperLimitChange);
            $('#IsComboBoxShowLabel').addClass('d-none');
            $('#IsComboBoxShow').prop('checked', false).trigger('change');

            switch (data.data.voteQuestionTypeList.voteQuestionTypeId) {
                case 1:
                    // انتخابی

                    $('#UpperLimitChosenCount')
                        .off('input change', handleUpperLimitChange)
                        .on('input change', handleUpperLimitChange)
                        .trigger('change');

                    $('#bodyQuestionType1').removeClass('d-none');

                    $('#IsComboBoxShow').prop(
                        'checked',
                        data.data.voteQuestionTypeList.displayType == 2
                    );


                    $('#IsComboBoxShowLabel').removeClass('d-none');
                    $("#voteQuestionItemsListGET").html('');
                    var itemsListChoose = data.data.voteQuestionItemsList;
                    for (var i = 0; i < itemsListChoose.length; i++) {
                        var lengthTitle = itemsListChoose[i].title.length;
                        $("#voteQuestionItemsListGET").append(
                            '<div class="d-flex align-items-center mb-2 gap-4"><span class="svg-icon svg-icon-1 svg-icon-success"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"><rect opacity="0.3" x="2" y="2" width="20" height="20" rx="10" fill="black"></rect><path d="M10.4343 12.4343L8.75 10.75C8.33579 10.3358 7.66421 10.3358 7.25 10.75C6.83579 11.1642 6.83579 11.8358 7.25 12.25L10.2929 15.2929C10.6834 15.6834 11.3166 15.6834 11.7071 15.2929L17.25 9.75C17.6642 9.33579 17.6642 8.66421 17.25 8.25C16.8358 7.83579 16.1642 7.83579 15.75 8.25L11.5657 12.4343C11.2533 12.7467 10.7467 12.7467 10.4343 12.4343Z" fill="black"></path></svg></span><span class="fw-bold fs-5 text-gray-700 flex-grow-1 '
                            + ((lengthTitle) > 60 ? 'textScroll' : '') + '"><span>'
                            + itemsListChoose[i].title + '</span></span><span class="badge badge-square badge-secondary ls-2 px-3 me-2 mb-0"> <span class="svg-icon svg-icon-1x svg-icon-warning"><svg xmlns = "http://www.w3.org/2000/svg" width = "24" height = "24" viewBox = "0 0 24 24" fill = "none" ><path opacity="0.3" d="M21.25 18.525L13.05 21.825C12.35 22.125 11.65 22.125 10.95 21.825L2.75 18.525C1.75 18.125 1.75 16.725 2.75 16.325L4.04999 15.825L10.25 18.325C10.85 18.525 11.45 18.625 12.05 18.625C12.65 18.625 13.25 18.525 13.85 18.325L20.05 15.825L21.35 16.325C22.35 16.725 22.35 18.125 21.25 18.525ZM13.05 16.425L21.25 13.125C22.25 12.725 22.25 11.325 21.25 10.925L13.05 7.62502C12.35 7.32502 11.65 7.32502 10.95 7.62502L2.75 10.925C1.75 11.325 1.75 12.725 2.75 13.125L10.95 16.425C11.65 16.725 12.45 16.725 13.05 16.425Z" fill="black"></path><path d="M11.05 11.025L2.84998 7.725C1.84998 7.325 1.84998 5.925 2.84998 5.525L11.05 2.225C11.75 1.925 12.45 1.925 13.15 2.225L21.35 5.525C22.35 5.925 22.35 7.325 21.35 7.725L13.05 11.025C12.45 11.325 11.65 11.325 11.05 11.025Z" fill="black"></path></svg ></span > وزن'
                            + data.data.voteQuestionItemsList[i].weight + '</span></div>')
                    }
                    break;
                case 2:
                    //توافقنامه
                    $('#bodyQuestionType2').removeClass('d-none');
                    $("#QuestionTypeIDThis").val("2");
                    break;
                case 3:
                    //بازه عددی
                    $('#bodyQuestionType3').removeClass('d-none');
                    $("#QuestionTypeIDThis").val("3");
                    break;
                case 4:
                    //تشریحی
                    $('#bodyQuestionType4').removeClass('d-none');
                    $("#QuestionTypeIDThis").val("4");
                    break;
                case 5:
                    //تاریخ
                    $('#bodyQuestionType5').removeClass('d-none');
                    $("#QuestionTypeIDThis").val("5");
                    break;
                case 6:
                    //ورودی معتبر
                    $('#bodyQuestionType6').removeClass('d-none');
                    $("#QuestionTypeIDThis").val("6");
                    break;

                case 10:
                    //ورودی معتبر
                    $('#bodyQuestionType10').removeClass('d-none');
                    $("#QuestionTypeIDThis").val("10");
                    break;
                case 11:
                    //ورودی معتبر
                    $('#bodyQuestionType11').removeClass('d-none');
                    $("#QuestionTypeIDThis").val("11");
                    break;
                case 12:
                    //ورودی معتبر
                    $('#bodyQuestionType12').removeClass('d-none');
                    $("#QuestionTypeIDThis").val("12");

                    var itemsListChoose = data.data.dataSourceItemsList;
                    for (var i = 0; i < itemsListChoose.length; i++) {
                        var item = itemsListChoose[i];
                        var lengthTitle = item.title ? item.title.length : 0;

                        // ۱. بررسی وجود تصویر
                        var imageHtml = '';
                        if (item.imageUrl && item.imageUrl.trim() !== '') {
                            imageHtml = `
                            <div class="symbol symbol-40px me-3">
                                <img src="${item.imageUrl}" 
                                     alt="${item.title}" 
                                     class="data-source-image"/>
                            </div>`;
                        } else {
                            imageHtml = '';
                        }

                        $("#dataSourceItemsListGET").append(
                            '<div class="d-flex align-items-center mb-3 gap-2 border-bottom pb-2">' +

                            '<span class="svg-icon svg-icon-1 svg-icon-success">' +
                            '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">' +
                            '<rect opacity="0.3" x="2" y="2" width="20" height="20" rx="10" fill="black"></rect>' +
                            '<path d="M10.4343 12.4343L8.75 10.75C8.33579 10.3358 7.66421 10.3358 7.25 10.75C6.83579 11.1642 6.83579 11.8358 7.25 12.25L10.2929 15.2929C10.6834 15.6834 11.3166 15.6834 11.7071 15.2929L17.25 9.75C17.6642 9.33579 17.6642 8.66421 17.25 8.25C16.8358 7.83579 16.1642 7.83579 15.75 8.25L11.5657 12.4343C11.2533 12.7467 10.7467 12.7467 10.4343 12.4343Z" fill="black"></path>' +
                            '</svg></span>' +

                            '<span class="fw-bold fs-5 text-gray-700 flex-grow-1 ' + (lengthTitle > 60 ? 'textScroll' : '') + '">' +
                            '<span>' + item.title + '</span>' +
                            '</span>' +
                            // اضافه شدن کامپوننت تصویر در این بخش
                            imageHtml +
                            '<span class="badge badge-square badge-secondary ls-2 px-3 me-2 mb-0">' +
                            '<span class="svg-icon svg-icon-1x svg-icon-warning">' +
                            '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">' +
                            '<path opacity="0.3" d="M21.25 18.525L13.05 21.825C12.35 22.125 11.65 22.125 10.95 21.825L2.75 18.525C1.75 18.125 1.75 16.725 2.75 16.325L4.04999 15.825L10.25 18.325C10.85 18.525 11.45 18.625 12.05 18.625C12.65 18.625 13.25 18.525 13.85 18.325L20.05 15.825L21.35 16.325C22.35 16.725 22.35 18.125 21.25 18.525ZM13.05 16.425L21.25 13.125C22.25 12.725 22.25 11.325 21.25 10.925L13.05 7.62502C12.35 7.32502 11.65 7.32502 10.95 7.62502L2.75 10.925C1.75 11.325 1.75 12.725 2.75 13.125L10.95 16.425C11.65 16.725 12.45 16.725 13.05 16.425Z" fill="black"></path>' +
                            '<path d="M11.05 11.025L2.84998 7.725C1.84998 7.325 1.84998 5.925 2.84998 5.525L11.05 2.225C11.75 1.925 12.45 1.925 13.15 2.225L21.35 5.525C22.35 5.925 22.35 7.325 21.35 7.725L13.05 11.025C12.45 11.325 11.65 11.325 11.05 11.025Z" fill="black"></path>' +
                            '</svg></span> وزن ' + (item.weight ?? 0) + '</span>' +
                            '</div>'
                        );
                    }

                    break;

                case 13:

                    // کامپوزیشن
                    $('#bodyQuestionType13')
                        .removeClass('d-none');

                    $("#QuestionTypeIDThis")
                        .val("13");

                    break;


                case 14:

                    // محتوای نمایشی
                    $('#bodyQuestionType14')
                        .removeClass('d-none');

                    $("#QuestionTypeIDThis")
                        .val("14");

                    renderDisplayContentAdminPreview(
                        data.data
                    );

                    break;

                default:

            }
        },
        error: function (xhr, status, error) {
        }
    });
});

function renderDisplayContentAdminPreview(
    question
) {

    const description =
        question?.description
        ?? '';

    const medias =
        question?.voteQuestionMedias
        ?? [];


    const $preview =
        $('#displayContentPreview');

    const $description =
        $('#displayContentDescriptionPreview');

    const $mediaContainer =
        $('#displayContentMediaPreview');


    $description.empty();

    $mediaContainer.empty();


    if (
        description &&
        String(description).trim()
    ) {

        $description.text(
            description
        );

    }


    if (
        Array.isArray(medias)
        &&
        medias.length > 0
    ) {

        medias
            .sort(
                function (a, b) {

                    return (
                        Number(a.orderIndex || 0)
                        -
                        Number(b.orderIndex || 0)
                    );

                }
            )
            .forEach(
                function (media) {

                    if (!media?.imageUrl) {
                        return;
                    }


                    const $item = $(`
                        <div class="border rounded p-2">

                            <img
                                class="rounded"
                                style="
                                    width:120px;
                                    height:120px;
                                    object-fit:cover;
                                "
                            />

                            <div
                                class="text-muted fs-8 mt-2"
                            ></div>

                        </div>
                    `);


                    $item
                        .find('img')
                        .attr(
                            'src',
                            media.imageUrl
                        );


                    if (
                        media.caption
                    ) {

                        $item
                            .find('div')
                            .text(
                                media.caption
                            );

                    }


                    $mediaContainer.append(
                        $item
                    );

                }
            );

    }


    if (
        (
            description &&
            String(description).trim()
        )
        ||
        (
            Array.isArray(medias)
            &&
            medias.length > 0
        )
    ) {

        $preview
            .removeClass('d-none');

    }

    else {

        $preview
            .addClass('d-none');

    }
}

function DeleteVoteDetailsQuestion(voteQuestionPackageId) {
    Swal.fire({
        text: "آیا از حذف این مورد اطمینان دارید؟",
        icon: "warning",
        buttonsStyling: !1,
        showCancelButton: !0,
        confirmButtonText: "بله",
        cancelButtonText: "خیر",
        customClass: {
            confirmButton: "btn btn-confirmPage",
            cancelButton: "btn btn-active-light"
        }
    }).then((result) => {
        if (result.isConfirmed) {

            $.ajax({
                type: "POST",
                dataType: 'JSOn',
                url: '/VotePackageDetail/DeleteVotePackageDetail',
                data: {
                    VotePackageDetailId: voteQuestionPackageId
                },
                beforeSend: function (xhr) {
                    xhr.setRequestHeader("RequestVerificationToken", $('input[name="__RequestVerificationToken"]').val());
                },
                success: function (data) {
                    if (data.success) {
                        Swal.fire({
                            text: "با موفقیت انجام شد",
                            icon: "success",
                            buttonsStyling: !1,
                            confirmButtonText: "بستن",
                            customClass: { confirmButton: "btn btn-confirmPage" },

                        }).then((result) => {
                            if (result.isConfirmed) {

                                $.ajax({
                                    url: '/VotePackageDetail/GetAllVotePackageDetailByVotePackageId',
                                    type: "POST",
                                    dataType: 'json',
                                    data: {
                                        votePackageId: $("#VotePackageIdGET").val(),
                                        pagesize: 1000,
                                    },
                                    beforeSend: function (xhr) {
                                        xhr.setRequestHeader("RequestVerificationToken", $('input[name="__RequestVerificationToken"]').val());
                                    },
                                    success: function (data) {

                                        $('#drop-items').empty();
                                        // ❌ OLD CODE - Calls addInDropItems multiple times:
                                        // for (var i = 0; i < data.result.length; i++) {
                                        //     addInDropItems(data);
                                        // }

                                        // ✅ NEW CODE - Call addInDropItems ONCE:
                                        addInDropItems(data);
                                        // loadQuestionForVotePackage();
                                        $('#kt_modal_add_question').modal('hide');
                                        addSelectStartQuestionList();
                                    }

                                });


                            }
                        });
                    }

                },
                error: function () {
                    Swal.fire({
                        text: "خطا ! لطفا با ادمین سیستم تماس بگیرید",
                        icon: "warning",
                        buttonsStyling: !1,
                        confirmButtonText: "بستن",
                        customClass: { confirmButton: "btn btn-confirmPage" },

                    });
                }
            });



        }
    })





}


function clearModalAdd_question() {

}


function CreateVotePackageDetailFunction(
    LowerValueNumeric,
    UpperValueNumeric,
    LowerLimitChosen,
    UpperLimitChosen,
    IsMultiple
) {

    const displayType =
        $("#IsComboBoxShow").is(":checked")
            ? 2
            : 0;


    const questionTypeId =
        Number(
            $("#QuestionTypeIdToAdd").val()
        );


    const parentId =
        activeCompositionDetailId
            ? Number(activeCompositionDetailId)
            : null;


    const isCompositionChild =
        parentId !== null;


    let isInLoop = false;


    // سوال داخلی دسته‌بندی
    if (
        isCompositionChild
    ) {

        // مقدار را از Parent می‌گیرد
        isInLoop =
            activeCompositionIsInLoop === true ||
            String(activeCompositionIsInLoop)
                .toLowerCase() === 'true';

    }


    // خود Parent دسته‌بندی
    else if (
        questionTypeId === 13
    ) {

        isInLoop =
            $("#IsInLoop").is(":checked");

    }


    // فقط یک بار اجرا شود
    const orderIndex =
        getNextOrderIndex();


    console.log(
        "Create VotePackageDetail",
        {
            VoteQuestionId:
                $("#voteQuestionIdGET").val(),

            ParentId:
                parentId,

            OrderIndex:
                orderIndex
        }
    );


    $.ajax({

        type:
            "POST",

        dataType:
            "json",

        url:
            "/VotePackageDetail/CreateVotePackageDetail",

        data: {

            VotePackageId:
                $("#VotePackageIdGET").val(),

            VoteQuestionId:
                $("#voteQuestionIdGET").val(),

            ParentId:
                parentId,

            IsInLoop:
                isInLoop,

            OrderIndex:
                orderIndex,

            IsMandatory:
                $("#IsMandatory").val(),

            IsMultipleChoice:
                IsMultiple,

            IsRanged:
                false,

            StringMaxLength:
                $("#numberOfChoosen").val(),

            IsMultiFile:
                false,

            IsStart:
                false,

            IsActive:
                $("#IsActive").val(),

            LowerLimitDateValueString:
                $("#LowerLimitDateValue").val(),

            UpperLimitDateValueString:
                $("#UpperLimitDateValue").val(),

            LowerLimitNumericValue:
                LowerValueNumeric,

            UpperLimitNumericValue:
                UpperValueNumeric,

            LowerLimitChosenCount:
                LowerLimitChosen,

            UpperLimitChosenCount:
                UpperLimitChosen,

            Weight:
                $("#weightOfQuestion").val(),

            DisplayTypeEnum:
                displayType
        },

        beforeSend: function (xhr) {

            xhr.setRequestHeader(
                "RequestVerificationToken",
                $('input[name="__RequestVerificationToken"]').val()
            );

        },

        success: function (response) {

            if (response.success) {

                Swal.fire({

                    text:
                        "با موفقیت انجام شد",

                    icon:
                        "success",

                    buttonsStyling:
                        false,

                    confirmButtonText:
                        "بستن",

                    customClass: {
                        confirmButton:
                            "btn btn-confirmPage"
                    }

                }).then(function () {

                    GetAllVotePackageDetailByVotePackageId();

                });

            }

            else {

                const errorMessage =
                    response?.operationErrors?.[0]?.description
                    ??
                    response?.validationErrors?.[0]?.errorMessage
                    ??
                    response?.message
                    ??
                    response?.data
                    ??
                    "خطایی رخ داده است!";


                Swal.fire({

                    text:
                        errorMessage,

                    icon:
                        "warning",

                    buttonsStyling:
                        false,

                    confirmButtonText:
                        "تایید",

                    customClass: {
                        confirmButton:
                            "btn btn-confirmPage"
                    }

                });

            }

        }

    });
}

function getQuestionParentId(item) {

    const parentId =
        item.parentId
        ??
        item.ParentId
        ??
        null;

    if (
        parentId === null ||
        parentId === undefined ||
        parentId === "" ||
        parentId === 0 ||
        parentId === "0"
    ) {
        return null;
    }

    return String(parentId);
}


function getQuestionOrderIndex(item) {

    const value = Number(
        item.orderIndex
        ??
        item.OrderIndex
        ??
        0
    );

    return Number.isFinite(value)
        ? value
        : 0;
}



function getQuestionParentId(item) {

    const parentId =
        item.parentId
        ??
        item.ParentId
        ??
        null;


    if (
        parentId === null ||
        parentId === undefined ||
        parentId === "" ||
        parentId === 0 ||
        parentId === "0"
    ) {
        return null;
    }


    return String(parentId);
}


function getQuestionOrderIndex(item) {

    return Number(
        item.orderIndex
        ??
        item.OrderIndex
        ??
        0
    );
}


function applyPendingSectionAssignment(result) {

    if (!pendingSectionAssignment) {
        return;
    }


    const beforeIds =
        new Set(
            pendingSectionAssignment
                .beforeDetailIds
                .map(String)
        );


    console.log(
        "pendingSectionAssignment:",
        pendingSectionAssignment
    );

    console.log(
        "new result:",
        result
    );


    const createdQuestion =
        result.find(function (item) {

            const detailId =
                String(
                    item.votePackageDetailId
                );

            const questionId =
                Number(
                    item.voteQuestionId ??
                    item.voteQuestion?.voteQuestionId
                );


            return (
                questionId ===
                Number(
                    pendingSectionAssignment
                        .voteQuestionId
                )
                &&
                !beforeIds.has(detailId)
            );

        });


    console.log(
        "createdQuestion:",
        createdQuestion
    );


    if (createdQuestion) {

        addQuestionDetailToSection(

            pendingSectionAssignment
                .sectionId,

            createdQuestion
                .votePackageDetailId

        );

    }


    pendingSectionAssignment = null;
}

const AcceptQuetionToPackage = document.getElementById('Accept_Quetion_Btn');
var ModalAdd = document.querySelector("#kt_modal_add_question");



let votepackageDetail = {}

AcceptQuetionToPackage.addEventListener('click', function (e) {

    e.preventDefault();

    var ThisQuestion = parseInt($("#voteQuestionIdGET").val());
    var Getweight = $('#weightOfQuestion').val();

    $.ajax({
        url: '/VotePackageDetail/GetAllVotePackageDetailByVotePackageId',
        type: "POST",
        dataType: 'json',

        data: {
            votePackageId: $("#VotePackageIdGET").val(),
            pagesize: 1000,
        },

        beforeSend: function (xhr) {
            xhr.setRequestHeader(
                "RequestVerificationToken",
                $('input[name="__RequestVerificationToken"]').val()
            );
        },

        success: function (data) {

            currentVotePackageDetails =
                Array.isArray(data.result)
                    ? data.result
                    : [];


            /*
             * ==========================================
             * Flat کردن Parentها و Childهای Composition
             * ==========================================
             */

            const allVotePackageDetails = [];


            currentVotePackageDetails.forEach(
                function (item) {

                    allVotePackageDetails.push(
                        item
                    );


                    if (
                        Array.isArray(
                            item.children
                        )
                    ) {

                        item.children.forEach(
                            function (child) {

                                allVotePackageDetails.push(
                                    child
                                );

                            }
                        );

                    }

                }
            );


            /*
             * ==========================================
             * Context فعلی
             *
             * null  => سوال مستقل
             * id    => Child یک Composition خاص
             * ==========================================
             */

            const targetParentId =
                activeCompositionDetailId
                    ? String(
                        activeCompositionDetailId
                    )
                    : null;


            /*
             * ==========================================
             * Duplicate فقط در همان Parent
             * ==========================================
             */

            const duplicateQuestion =
                allVotePackageDetails.some(
                    function (item) {

                        const itemQuestionId =
                            Number(
                                item.voteQuestionId
                                ??
                                item.voteQuestion
                                    ?.voteQuestionId
                            );


                        /*
                         * اصلاً همان Question نیست
                         */
                        if (
                            itemQuestionId !==
                            Number(ThisQuestion)
                        ) {

                            return false;

                        }


                        /*
                         * Parent واقعی Detail
                         */
                        const itemParentId =
                            getQuestionParentId(
                                item
                            );


                        /*
                         * فقط اگر Question و Parent
                         * هر دو یکی باشند Duplicate است
                         */
                        return (
                            itemParentId ===
                            targetParentId
                        );

                    }
                );


            // ==========================================
            // سوال تکراری در همان Context
            // ==========================================

            if (duplicateQuestion) {

                Swal.fire({

                    text:
                        activeCompositionDetailId
                            ? "این سوال قبلاً در این دسته بندی اضافه شده است"
                            : "این سوال قبلاً به صورت مستقل در پرسشنامه اضافه شده است",

                    icon: "warning",

                    buttonsStyling: false,

                    confirmButtonText: "بستن",

                    customClass: {
                        confirmButton:
                            "btn btn-confirmPage"
                    }

                });

                return;
            }


            // ==========================================
            // ادامه منطق قبلی افزودن سوال
            // ==========================================

            var QuestionTypeIdToAdd =
                Number(
                    $("#QuestionTypeIdToAdd").val()
                );


            // ==========================================
            // نوع 14 - محتوای نمایشی
            // وزن و تنظیمات پاسخ ندارد
            // ==========================================

            if (QuestionTypeIdToAdd === 14) {

                CreateVotePackageDetailFunction(
                    undefined,
                    undefined,
                    undefined,
                    undefined,
                    undefined
                );

                return;
            }

            // ==========================================
            // سایر سوال‌ها
            // ==========================================

            if (Getweight > 0) {

                // --------------------------------------
                // نوع 1 - انتخابی
                // --------------------------------------

                if (QuestionTypeIdToAdd === 1) {

                    var LowerLimitChosen =
                        $("#LowerLimitChosenCount").val();

                    var UpperLimitChosen =
                        $("#UpperLimitChosenCount").val();

                    var LowerValueNumeric;
                    var UpperValueNumeric;

                    var IsMultiple =
                        Number(UpperLimitChosen) > 1;


                    if (
                        LowerLimitChosen < 1 ||
                        UpperLimitChosen < 1 ||
                        LowerLimitChosen === undefined ||
                        UpperLimitChosen === undefined ||
                        Getweight < 0 ||
                        Getweight === undefined
                    ) {

                        Swal.fire({
                            text:
                                "لطفا حداقل انتخاب و حداکثر انتخاب را وارد نمایید.",

                            icon:
                                "warning",

                            buttonsStyling:
                                false,

                            confirmButtonText:
                                "بستن",

                            customClass: {
                                confirmButton:
                                    "btn btn-confirmPage"
                            }
                        });

                        return;
                    }


                    CreateVotePackageDetailFunction(
                        LowerValueNumeric,
                        UpperValueNumeric,
                        LowerLimitChosen,
                        UpperLimitChosen,
                        IsMultiple
                    );
                }


                // --------------------------------------
                // نوع 3 - بازه عددی
                // --------------------------------------

                else if (QuestionTypeIdToAdd === 3) {

                    var LowerValueNumeric =
                        $("#LowerLimitNumericValue").val();

                    var UpperValueNumeric =
                        $("#UpperLimitNumericValue").val();

                    var LowerLimitChosen;
                    var UpperLimitChosen;
                    var IsMultiple;


                    if (
                        LowerValueNumeric < 0 ||
                        UpperValueNumeric < 1 ||
                        LowerValueNumeric === undefined ||
                        UpperValueNumeric === undefined
                    ) {

                        Swal.fire({
                            text:
                                "لطفا شروع و پایان بازه را انتخاب نمایید.",

                            icon:
                                "warning",

                            buttonsStyling:
                                false,

                            confirmButtonText:
                                "بستن",

                            customClass: {
                                confirmButton:
                                    "btn btn-confirmPage"
                            }
                        });

                        return;
                    }


                    CreateVotePackageDetailFunction(
                        LowerValueNumeric,
                        UpperValueNumeric,
                        LowerLimitChosen,
                        UpperLimitChosen,
                        IsMultiple
                    );
                }


                // --------------------------------------
                // نوع 4 - تشریحی
                // --------------------------------------

                else if (QuestionTypeIdToAdd === 4) {

                    CreateVotePackageDetailFunction(
                        undefined,
                        undefined,
                        undefined,
                        undefined,
                        undefined
                    );
                }


                // --------------------------------------
                // نوع 5 - تاریخ
                // --------------------------------------

                else if (QuestionTypeIdToAdd === 5) {

                    CreateVotePackageDetailFunction(
                        undefined,
                        undefined,
                        undefined,
                        undefined,
                        undefined
                    );
                }


                // --------------------------------------
                // نوع 6 - ورودی معتبر
                // --------------------------------------

                else if (QuestionTypeIdToAdd === 6) {

                    CreateVotePackageDetailFunction(
                        undefined,
                        undefined,
                        undefined,
                        undefined,
                        undefined
                    );
                }


                // --------------------------------------
                // نوع 10 - ستاره‌ای
                // --------------------------------------

                else if (QuestionTypeIdToAdd === 10) {

                    var LowerValueNumeric =
                        "1";

                    var UpperValueNumeric =
                        $("#UpperLimitStarValue").val();


                    CreateVotePackageDetailFunction(
                        LowerValueNumeric,
                        UpperValueNumeric,
                        undefined,
                        undefined,
                        undefined
                    );
                }


                // --------------------------------------
                // نوع 11 - میله‌ای
                // --------------------------------------

                else if (QuestionTypeIdToAdd === 11) {

                    var LowerValueNumeric =
                        $("#LowerLimitRangeValue").val();

                    var UpperValueNumeric =
                        $("#UpperLimitRangeValue").val();


                    if (
                        LowerValueNumeric < 0 ||
                        UpperValueNumeric > 101 ||
                        LowerValueNumeric === undefined ||
                        UpperValueNumeric === undefined
                    ) {

                        Swal.fire({
                            text:
                                "وارد کردن شروع و پایان بازه در رنج 0-100 اجباری می باشد.",

                            icon:
                                "warning",

                            buttonsStyling:
                                false,

                            confirmButtonText:
                                "بستن",

                            customClass: {
                                confirmButton:
                                    "btn btn-confirmPage"
                            }
                        });

                        return;
                    }


                    CreateVotePackageDetailFunction(
                        LowerValueNumeric,
                        UpperValueNumeric,
                        undefined,
                        undefined,
                        undefined
                    );
                }


                // --------------------------------------
                // نوع 12 - منبع داده
                // --------------------------------------

                else if (QuestionTypeIdToAdd === 12) {

                    CreateVotePackageDetailFunction(
                        undefined,
                        undefined,
                        undefined,
                        undefined,
                        undefined
                    );
                }

                else if (QuestionTypeIdToAdd === 15) {

                    CreateVotePackageDetailFunction(
                        undefined,
                        undefined,
                        undefined,
                        undefined,
                        undefined
                    );
                }

            }

            else {

                Swal.fire({
                    text:
                        "لطفا وزن سوال را وارد نمایید.",

                    icon:
                        "warning",

                    buttonsStyling:
                        false,

                    confirmButtonText:
                        "بستن",

                    customClass: {
                        confirmButton:
                            "btn btn-confirmPage"
                    }
                });

            }

        },

        error: function (xhr, status, message) {

            Swal.fire({

                text:
                    "خطا ! لطفا با ادمین سیستم تماس بگیرید",

                icon:
                    "warning",

                buttonsStyling:
                    false,

                confirmButtonText:
                    "بستن",

                customClass: {
                    confirmButton:
                        "btn btn-confirmPage"
                }

            });

        }

    });


    var typeQuestion =
        $("#QuestionTypeIDThis").val();

});

$('#kt_modal_add_question_section')
    .on(
        'hidden.bs.modal',
        function () {

            $('#IsInLoop')
                .prop(
                    'checked',
                    false
                );

        }
    );

$('#ElseAnswearQuestion').select2().on('select2:open', function () {
    $('.select2-search__field').attr('maxlength', 10);
});

var MaxSelect = '';
var MaxSelect2 = 100;


function GetDetailsQuestion(QuestionId, typeQuestion, votePackageDetailId, votePackageId, weightQuestion, upperLimitChosenCount) {

    $('#MultipleChoiceRepeaterHint').remove();
    document.getElementById("QuestionIdHidden").value = QuestionId;
    document.getElementById("VotePackageDetailGraphIdHidden").value = votePackageDetailId;

    $("#MultipleChoiceRepeater").empty(),
        $("#MultipleChoiceRepeater2").empty(),
        $("#NumericRangeRepeater").empty(),
        $("#DateTimeRepeater").empty(),
        $("#StarRepeater").empty(),
        $("#RangeRepeater").empty(),
        $("#weightOfQuestion").val(''),
        $("#maxSelect").val(''),
        $('.voteQuestionItemsList').select2();
    $('.voteQuestionItemsList1_2').select2();
    $('.getQuestionList').select2();
    $('.getQuestionList1_2').select2();
    $('.getQuestionList5').select2();
    $('.getQuestionList10').select2();
    $('.getQuestionList11').select2();
    $("#ElseAnswearQuestion").empty();
    $("#weightOfQuestion").val(weightQuestion),
        $('#ElseAnswearQuestion').prepend('<option  selected="selected"   disabled="disabled" value="None" >انتخاب نمایید</option>');


    $.ajax({
        type: "POST",
        dataType: 'json',
        url: '/VotePackageDetailGraph/GetVotePackageDetailGraphById',
        data: {
            'GetAllVotePackageDetailGraphByIdFilter': {
                'VotePackageId': votePackageId,
                'VoteQuestionId': QuestionId
            }
        },
        beforeSend: function (xhr) {
            xhr.setRequestHeader("RequestVerificationToken", $('input[name="__RequestVerificationToken"]').val());
        }, success: function (data) {

            switch (typeQuestion) {
                case 1:
                case "1":
                    if (upperLimitChosenCount > 1) {
                        $("#voteQuestionItemsList1_2").html('');
                        $(".InCardQTypeClass").addClass('d-none');
                        $("#InCardQType1").removeClass('d-none');

                        var rowMain = 0;
                        var Row = 0;

                        //defauld Load Line
                        if (data.result.length == MaxSelect2) {
                            var baseLine = 0;
                            var rowData =
                                '<div data-repeater-item>' +

                                '<div class="form-group row repeater-grid">' +

                                '<div class="item-col">' +
                                '<div class="input-group flex-nowrap">' +
                                '<span class="input-group-text">در صورت انتخاب</span>' +

                                '<div class="overflow-hidden flex-grow-1 d-flex">' +
                                '<select class="form-select rounded-start-0 getIsAll" id="IsAll" ' +
                                'name="MultipleChoiceRepeater2[' + rowMain + '][selectIsAll]" ' +
                                'data-hide-search="true" data-kt-repeater="IsAll" data-control="select2" data-placeholder="انتخاب پاسخ">' +

                                '<option ' + (IsAllOrAny == true ? 'selected' : '') + ' value="true">همه</option>' +
                                '<option ' + (IsAllOrAny == true ? '' : 'selected') + ' value="false">یکی</option>' +

                                '</select>' +
                                '</div>' +
                                '</div>' +
                                '</div>' +

                                '<div class="item-col">' +
                                '<div class="inner-repeater">' +

                                '<div data-repeater-list="SubMultipleChoiceRepeater2" class="innerAdd-' + rowMain + '">' +

                                '<div data-repeater-item>' +

                                '<div class="item-col">' +

                                '<div class="input-group flex-nowrap">' +
                                '<span class="input-group-text">پاسخ</span>' +

                                '<div class="overflow-hidden d-flex flex-grow-1">' +

                                '<select class="form-select rounded-start-0 voteQuestionItemsList1_2" ' +
                                'id="voteQuestionItemsList1_2" ' +
                                'name="MultipleChoiceRepeater2[' + rowMain + '][SubMultipleChoiceRepeater2][' + baseLine + '][selectItems]" ' +
                                'data-kt-repeater="voteQuestionItemsList1_2" data-control="select2" data-placeholder="انتخاب گزینه های سوال">' +
                                '</select>' +

                                '<button class="btnMines btn btn-icon btn-light-danger" data-repeater-delete type="button">' +
                                '<span class="svg-icon svg-icon-muted svg-icon-2hx">' +
                                '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">' +
                                '<rect opacity="0.3" x="2" y="2" width="20" height="20" rx="5" fill="black"></rect>' +
                                '<rect x="6.0104" y="10.9247" width="12" height="2" rx="1" fill="black"></rect>' +
                                '</svg>' +
                                '</span>' +
                                '</button>' +

                                '</div>' +
                                '</div>' +
                                '</div>' +

                                '<a href="#" ' +
                                'class="btn form-group btn-icon btn-light-primary float-end mb-5 btn-primary add-choice-conditions-btn" ' +
                                'data-row="' + rowMain + '" ' +
                                'data-base="' + baseLine + '" ' +
                                'data-repeater-create ' +
                                'title="افزودن گزینه">' +

                                '<span class="svg-icon svg-icon-muted svg-icon-2hx">' +
                                '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">' +
                                '<rect opacity="0.3" x="2" y="2" width="20" height="20" rx="5" fill="black"></rect>' +
                                '<rect x="10.8891" y="17.8033" width="12" height="2" rx="1" transform="rotate(-90 10.8891 17.8033)" fill="#456"></rect>' +
                                '<rect x="6.01041" y="10.9247" width="12" height="2" rx="1" fill="#456"></rect>' +
                                '</svg>' +
                                '</span>' +

                                '</a>' +

                                '</div>' +
                                '</div>' +
                                '</div>' +

                                '<div class="item-col">' +

                                '<div class="input-group flex-nowrap">' +
                                '<span class="input-group-text"> برو به </span>' +

                                '<div class="overflow-hidden flex-grow-1">' +
                                '<select class="form-select rounded-start-0 getQuestionList1_2" ' +
                                'id="getQuestionList1_2" ' +
                                'name="MultipleChoiceRepeater2[' + rowMain + '][selectQuestion]" ' +
                                'data-kt-repeater="getQuestionList1_2" data-control="select2" data-placeholder="انتخاب پاسخ">' +
                                '</select>' +
                                '</div>' +

                                '</div>' +
                                '</div>' +

                                '<div class="item-col">' +
                                '<a href="#" data-repeater-delete class="btn btn-icon btn-md btn-light-danger">' +
                                '<i class="la la-trash-o fs-1"></i>' +
                                '</a>' +
                                '</div>' +

                                '</div>' +
                                '</div>';

                            $("#MultipleChoiceRepeater2").append(rowData);

                            $(document).on("click", ".add-choice-conditions-btn", function (e) {

                                e.preventDefault();

                                const rowMain = this.dataset.row;
                                const baseLine = this.dataset.base;

                                addChoiceForCondition(rowMain, baseLine);

                            });


                            AjaxItemListSubList(rowMain, SubItemsRowDataSeleted, baseLine);

                            // $('.voteQuestionItemsList1_2[name = "MultipleChoiceRepeater2[' + rowMain + '][SubMultipleChoiceRepeater2][' + baseLine + '][selectItems]"]').prepend('<option selected disabled>انتخاب نمایید</option>')

                            // $('.getQuestionList1_2[name = "MultipleChoiceRepeater2[' + rowMain + '][selectQuestion]"]').prepend('<option selected disabled>انتخاب نمایید</option>')
                            // $('.getIsAll[name = "MultipleChoiceRepeater2[' + rowMain + '][selectIsAll]"]').prepend('<option selected disabled>انتخاب نمایید</option>')




                        } else {
                            for (var i = 0; i < data.result.length; i++) {
                                if (data.result[i].isDefault == true) {
                                    var selectedElse = data.result[i].nextVotePackageDetailId;
                                }
                                else {
                                    var index = i;
                                    var selectedValue = data.result[i].nextVotePackageDetailId;
                                    //var selectedItemsValue = data.result[i].votePackageDetailMultipleChoiceCondition[i].voteQuestionItemId;
                                    var IsAllOrAny = data.result[i].allOfItemsChosenCondition;

                                    var rowData = '<div data-repeater-item>' +
                                        '<div class="form-group row repeater-grid">' +

                                        '<div class="item-col">' +
                                        '<div class="input-group flex-nowrap">' +
                                        '<span class="input-group-text">در صورت انتخاب</span>' +
                                        '<div class="overflow-hidden flex-grow-1 d-flex">' +

                                        '<select class="form-select rounded-start-0 getIsAll" id="IsAll" ' +
                                        'name="MultipleChoiceRepeater2[' + rowMain + '][selectIsAll]" ' +
                                        'data-hide-search="true" data-kt-repeater="IsAll" data-control="select2" data-placeholder="انتخاب پاسخ">' +

                                        '<option ' + (IsAllOrAny == true ? 'selected' : '') + ' value="true">همه</option>' +
                                        '<option ' + (IsAllOrAny == true ? '' : 'selected') + ' value="false">یکی</option>' +

                                        '</select>' +

                                        '</div>' +
                                        '</div>' +
                                        '</div>' +

                                        '<div class="item-col">' +
                                        '<div class="inner-repeater">' +
                                        '<div data-repeater-list="SubMultipleChoiceRepeater2" class="innerAdd-' + rowMain + '"></div>' +
                                        '</div>' +
                                        '</div>' +

                                        '<div class="item-col">' +
                                        '<div class="input-group flex-nowrap">' +
                                        '<span class="input-group-text"> برو به </span>' +
                                        '<div class="overflow-hidden flex-grow-1">' +

                                        '<select class="form-select rounded-start-0 getQuestionList1_2" id="getQuestionList1_2" ' +
                                        'name="MultipleChoiceRepeater2[' + rowMain + '][selectQuestion]" ' +
                                        'data-kt-repeater="getQuestionList1_2" data-control="select2" data-placeholder="انتخاب پاسخ">' +
                                        '</select>' +

                                        '</div>' +
                                        '</div>' +
                                        '</div>' +

                                        '<div class="item-col">' +
                                        '<a href="#" data-repeater-delete class="btn btn-icon btn-md btn-light-danger">' +
                                        '<i class="la la-trash-o fs-1"></i>' +
                                        '</a>' +
                                        '</div>' +

                                        '</div>' +
                                        '</div>';

                                    $("#MultipleChoiceRepeater2").append(rowData);

                                    var LengthMultipleChoiceCondition = data.result[i].votePackageDetailMultipleChoiceCondition.length;


                                    //  AjaxItemList2(i, selectedItemsValue)

                                    for (var CountItemsSub = 0; CountItemsSub < LengthMultipleChoiceCondition; CountItemsSub++) {
                                        var SubItemsRowDataSeleted = '';
                                        SubItemsRowDataSeleted = data.result[i].votePackageDetailMultipleChoiceCondition[CountItemsSub].voteQuestionItemId;

                                        var SubItemsRowData = '<div data-repeater-item=""><div class="item-col"><div class="input-group flex-nowrap"><span class="input-group-text">پاسخ</span><div class="overflow-hidden d-flex flex-grow-1"><select class="form-select rounded-start-0 voteQuestionItemsList1_2" id="voteQuestionItemsList1_2" name="MultipleChoiceRepeater2['
                                            + rowMain + '][SubMultipleChoiceRepeater2]['
                                            + CountItemsSub + '][selectItems]" data-kt-repeater="voteQuestionItemsList1_2" data-control="select2" data-placeholder="انتخاب گزینه های سوال"> </select><button class="btnMines btn btn-icon btn-light-danger" data-repeater-delete="" type="button"><span class="svg-icon svg-icon-muted svg-icon-2hx"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">< rect opacity = "0.3" x = "2" y = "2" width = "20" height = "20" rx = "5" fill = "black" /><rect x="6.0104" y="10.9247" width="12" height="2" rx="1" fill="black" /></svg ></span ></button ></div></div></div></div>';

                                        $('.innerAdd-' + rowMain).append(SubItemsRowData);
                                        AjaxItemListSubList(rowMain, SubItemsRowDataSeleted, CountItemsSub);

                                    }
                                    $('.innerAdd-' + rowMain).append('<a href="javascript:;" data-repeater-create="" class="btn form-group btn-icon btn-light-primary float-end mb-5 btn-primary addChoiceForConditionBtn" data-row-main="' + rowMain + '"data-count-items-sub="' + CountItemsSub + '" title="افزودن گزینه"><span class="svg-icon svg-icon-muted svg-icon-2hx"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">< rect opacity = "0.3" x = "2" y = "2" width = "20" height = "20" rx = "5" fill = "black" /><rect x="10.8891" y="17.8033" width="12" height="2" rx="1" transform="rotate(-90 10.8891 17.8033)" fill="black"/><rect x="6.01041" y="10.9247" width="12" height="2" rx="1" fill="black"/></svg ></span ></a>');

                                    document.querySelectorAll(".addChoiceForConditionBtn").forEach(function (btn) {

                                        if (btn.dataset.bound === "true") return; // جلوگیری از دوباره bind شدن

                                        btn.dataset.bound = "true";

                                        btn.addEventListener("click", function (e) {
                                            e.preventDefault();

                                            const rowMain = this.dataset.rowMain;
                                            const countItemsSub = this.dataset.countItemsSub;

                                            addChoiceForCondition(rowMain, countItemsSub);
                                        });

                                    });

                                    AjaxQuestionList2(index, selectedValue);


                                }
                                rowMain++;
                                Row++;
                            }
                        }


                    } else {
                        $("#voteQuestionItemsList1").html('');
                        $(".InCardQTypeClass").addClass('d-none');
                        $("#InCardQType1").removeClass('d-none');

                        for (var i = 0; i < data.result.length; i++) {

                            if (data.result[i].isDefault == true) {
                                var selectedElse = data.result[i].nextVotePackageDetailId;
                            }
                            else {
                                var index = i;
                                var selectedValue = data.result[i].nextVotePackageDetailId;
                                var selectedItemValue = data.result[i].votePackageDetailMultipleChoiceCondition[0].voteQuestionItemId;
                                AjaxQuestionList(index, selectedValue);
                                AjaxItemList(index, selectedItemValue);

                                var rowData = '<div data-repeater-item><div class="form-group d-flex space-between mb-3 align-items-center repeater-grid-2" id="MultipleChoiceRepeaterItem"><div class=""> <label class="form-label"></label></div ><div class="item-col"><div class="input-group flex-nowrap"><span class="input-group-text">  پاسخ   </span><div class="overflow-hidden flex-grow-1"><select class="form-select rounded-start-0 voteQuestionItemsList" id="voteQuestionItemsList1" name="MultipleChoiceRepeater['
                                    + i + '][selectItems]" data-kt-repeater="voteQuestionItemsList1" data-control="select2" data-placeholder="انتخاب گزینه های سوال"></select></div></div></div><div class="item-col"><div class="input-group flex-nowrap"><span class="input-group-text"> برو به </span><div class="overflow-hidden flex-grow-1"><select class="form-select rounded-start-0 getQuestionList" id = "getQuestionList1" name = "MultipleChoiceRepeater['
                                    + i + '][selectQuestion]" data-kt-repeater="getQuestionList" data-control="select2" data-placeholder="انتخاب پاسخ"></select></div></div></div> <div class="item-col"><a href="javascript:;" data-repeater-delete="" class="btn btn-icon btn-md btn-light-danger "><i class="la la-trash-o fs-1"></i></a></div></div > ';

                                $("#MultipleChoiceRepeater").append(rowData);
                            }
                        }
                    }

                    AjaxElseAnswearQuestion(selectedElse);
                    break;
                case 3:
                case "3":

                    $(".InCardQTypeClass").addClass('d-none');
                    $("#InCardQType3").removeClass('d-none');
                    var LowerNumeric = $('#LowerNumeric').val();
                    var UpperNumeric = $('#UpperNumeric').val();


                    $("input.setMinMax").attr({ "max": UpperNumeric, "min": LowerNumeric });
                    for (var i = 0; i < data.result.length; i++) {

                        if (data.result[i].isDefault == true) {

                            var selectedElse = data.result[i].nextVotePackageDetailId;


                        }
                        else {
                            var index = i;
                            var selectedValue = data.result[i].nextVotePackageDetailId;
                            var selectedItemValue = data.result[i].voteQuestionItemId;

                            AjaxQuestionListTypeNumeric(index, selectedValue);


                            AjaxItemList(index, selectedItemValue);
                            var rowData = '<div data-repeater-item><div class="form-group d-flex space-between mb-3 align-items-center repeater-grid-3"><div class=""> <label class="form-label"></label></div><div class="item-col"><div class="input-group flex-nowrap"><span class="input-group-text">   بین عدد   </span><div class="overflow-hidden flex-grow-1"><input class="form-control rounded-start-0 setMinMax LowerLimitNumericCondition" name="NumericRangeRepeater['
                                + i + '][LowerLimitNumericCondition]" type="number" min="" max="" value="'
                                + data.result[i].lowerLimitNumericCondition + '" /></div></div></div><div class="item-col"><div class="input-group flex-nowrap"><span class="input-group-text">   و عدد   </span><div class="overflow-hidden flex-grow-1"><input class="form-control rounded-start-0 setMinMax UpperLimitNumericCondition" name="NumericRangeRepeater['
                                + i + '][UpperLimitNumericCondition]" type="number" min="" max="" value="'
                                + data.result[i].upperLimitNumericCondition + '" /></div></div></div><div class="item-col"><div class="input-group flex-nowrap"><span class="input-group-text"> برو به </span><div class="overflow-hidden flex-grow-1"><select class="form-select rounded-start-0 getQuestionList3" name="NumericRangeRepeater['
                                + i + '][getQuestionList3]" id="getQuestionList3" data-kt-repeater="getQuestionList3" data-control="select2" data-placeholder="انتخاب سوال"></select></div></div></div><div class="item-col"><a href="javascript:;" data-repeater-delete class="btn btn-icon btn-md btn-light-danger "><i class="la la-trash-o fs-1"></i></a></div></div></div>'

                            $("#NumericRangeRepeater").append(rowData);
                        }
                    }

                    AjaxElseAnswearQuestion(selectedElse);
                    break;


                case 4:
                case "4":
                    $(".InCardQTypeClass").addClass('d-none');
                    $("#InCardQType4").removeClass('d-none');

                    for (var i = 0; i < data.result.length; i++) {

                        if (data.result[i].isDefault == true) {
                            var selectedElse = data.result[i].nextVotePackageDetailId;
                        }
                        else {


                        }
                    }

                    AjaxElseAnswearQuestion(selectedElse);
                    break;

                case 5:
                case "5":
                    $(".InCardQTypeClass").addClass('d-none');
                    $("#InCardQType5").removeClass('d-none');

                    for (var i = 0; i < data.result.length; i++) {

                        if (data.result[i].isDefault == true) {
                            var selectedElse = data.result[i].nextVotePackageDetailId;
                        }
                        else {
                            var index = i;
                            var selectedValue = data.result[i].nextVotePackageDetailId;
                            AjaxQuestionListTypeDate(index, selectedValue);
                            var rowData = '<div data-repeater-item ><div class="form-group d-flex space-between mb-3 align-items-center repeater-grid-3" id="DateTimeRepeaterItem"><div class=""> <label class="form-label"></label></div><div class="item-col"><div class="position-relative align-items-center"><span class="svg-icon svg-icon-2 position-absolute mx-4 my-3 z-index-3"><img src="assets/media/icons/duotune/general/gen014.svg" class="opacity-50 mx-n1 my-n1 m--3"></span><input class="form-control form-control-solid ps-12 LowerLimitDateItemValue" type="text" id="LowerLimitDateItemValue" name="DateTimeRepeater['
                                + i + '][LowerLimitDateItemValue]" data-kt-repeater="LowerLimitDateItemValue" placeholder="زمان شروع" value="'
                                + data.result[i].lowerLimitDateCondition + '" data-jdp-only-date data-jdp /></div></div ><div class="item-col"><div class="position-relative align-items-center"><span class="svg-icon svg-icon-2 position-absolute mx-4 my-3 z-index-3"><img src="assets/media/icons/duotune/general/gen014.svg" class="opacity-50 mx-n1 my-n1 m--3"></span><input class="form-control form-control-solid ps-12 UpperLimitDateItemValue" type="text" id="UpperLimitDateItemValue" name="DateTimeRepeater['
                                + i + '][UpperLimitDateItemValue]" data-kt-repeater="UpperLimitDateItemValue" placeholder="زمان پایان" value="'
                                + data.result[i].upperLimitDateCondition + '" data-jdp-only-date data-jdp /></div></div><div class="item-col"><div class="input-group flex-nowrap"><span class="input-group-text">برو به  </span><div class="overflow-hidden flex-grow-1"><select class="form-select rounded-start-0 getQuestionList5" id = "getQuestionList5" data-kt-repeater="selectQuestion5" name="DateTimeRepeater['
                                + i + '][selectQuestion5]" data-control="select2" data-placeholder="انتخاب پاسخ"></select></div></div></div><div class="item-col"><a href="javascript:;" data-repeater-delete class="btn btn-icon btn-md btn-light-danger "><i class="la la-trash-o fs-1"></i></a></div></div ></div > '

                            $("#DateTimeRepeater").append(rowData);
                            AddDateTimeEndDateItemInput(index);
                            AddDateTimeStartDateItemInput(index);
                        }
                    }
                    AjaxElseAnswearQuestion(selectedElse);
                    break;
                case 6:
                case "6":
                    $(".InCardQTypeClass").addClass('d-none');
                    $("#InCardQType6").removeClass('d-none');

                    for (var i = 0; i < data.result.length; i++) {
                        if (data.result[i].isDefault == true) {
                            var selectedElse = data.result[i].nextVotePackageDetailId;
                        }
                        else {

                        }
                    }

                    AjaxElseAnswearQuestion(selectedElse);
                    break;

                case 10:
                case "10":
                    $(".InCardQTypeClass").addClass('d-none');
                    $("#InCardQType10").removeClass('d-none');
                    var LowerStar = $('#LowerStar').val();
                    var UpperStar = $('#UpperStar').val();
                    $("input.setMinMaxStar").attr({ "max": UpperStar, "min": LowerStar });
                    for (var i = 0; i < data.result.length; i++) {

                        if (data.result[i].isDefault == true) {

                            var selectedElse = data.result[i].nextVotePackageDetailId;


                        }
                        else {
                            var index = i;
                            var selectedValue = data.result[i].nextVotePackageDetailId;
                            var selectedItemValue = data.result[i].voteQuestionItemId;

                            AjaxQuestionListTypeStar(index, selectedValue);

                            AjaxItemList(index, selectedItemValue);
                            var rowData = '<div data-repeater-item><div class="form-group d-flex space-between mb-3 align-items-center repeater-grid-3"><div class=""> <label class="form-label"></label></div><div class="item-col"><div class="input-group flex-nowrap"><span class="input-group-text">   بین عدد   </span><div class="overflow-hidden flex-grow-1"><input class="form-control rounded-start-0 setMinMaxStar LowerLimitStarCondition" name="StarRepeater['
                                + i + '][LowerLimitStarCondition]" type="number" min="' + data.result[i].lowerLimitNumericCondition + '" max="' + data.result[i].upperLimitNumericCondition + '" value="'
                                + data.result[i].lowerLimitNumericCondition + '" /></div></div></div><div class="item-col"><div class="input-group flex-nowrap"><span class="input-group-text">   و عدد   </span><div class="overflow-hidden flex-grow-1"><input class="form-control rounded-start-0 setMinMaxStar UpperLimitStarCondition" name="StarRepeater['
                                + i + '][UpperLimitStarCondition]" type="number" min="' + data.result[i].lowerLimitNumericCondition + '" max="' + data.result[i].upperLimitNumericCondition + '" value="'
                                + data.result[i].upperLimitNumericCondition + '" /></div></div></div><div class="item-col"><div class="input-group flex-nowrap"><span class="input-group-text"> برو به </span><div class="overflow-hidden flex-grow-1"><select class="form-select rounded-start-0 getQuestionList10" name="StarRepeater['
                                + i + '][getQuestionList10]" id="getQuestionList10" data-kt-repeater="getQuestionList10" data-control="select2" data-placeholder="انتخاب سوال"></select></div></div></div><div class="item-col"><a href="javascript:;" data-repeater-delete class="btn btn-icon btn-md btn-light-danger "><i class="la la-trash-o fs-1"></i></a></div></div></div>'

                            $("#StarRepeater").append(rowData);
                        }
                    }

                    AjaxElseAnswearQuestion(selectedElse);

                    break;
                case 11:
                case "11":
                    $(".InCardQTypeClass").addClass('d-none');
                    $("#InCardQType11").removeClass('d-none');
                    var LowerRange = $('#LowerRange').val();
                    var UpperRange = $('#UpperRange').val();
                    $("input.setMinMaxRange").attr({ "max": UpperRange, "min": LowerRange });
                    for (var i = 0; i < data.result.length; i++) {

                        if (data.result[i].isDefault == true) {
                            var selectedElse = data.result[i].nextVotePackageDetailId;
                        }
                        else {
                            var index = i;
                            var selectedValue = data.result[i].nextVotePackageDetailId;
                            var selectedItemValue = data.result[i].voteQuestionItemId;

                            AjaxQuestionListTypeRange(index, selectedValue);

                            AjaxItemList(index, selectedItemValue);
                            var rowData = '<div data-repeater-item><div class="form-group d-flex space-between mb-3 align-items-center repeater-grid-3"><div class=""> <label class="form-label"></label></div><div class="item-col"><div class="input-group flex-nowrap"><span class="input-group-text">   بین عدد   </span><div class="overflow-hidden flex-grow-1"><input class="form-control rounded-start-0 setMinMaxRange LowerLimitRangeCondition" name="RangeRepeater['
                                + i + '][LowerLimitRangeCondition]" type="number" min="' + data.result[i].lowerLimitNumericCondition + '" max="' + data.result[i].upperLimitNumericCondition + '" value="'
                                + data.result[i].lowerLimitNumericCondition + '" /></div></div></div><div class="item-col"><div class="input-group flex-nowrap"><span class="input-group-text">   و عدد   </span><div class="overflow-hidden flex-grow-1"><input class="form-control rounded-start-0 setMinMaxRange UpperLimitRangeCondition" name="RangeRepeater['
                                + i + '][UpperLimitRangeCondition]" type="number" min="' + data.result[i].lowerLimitNumericCondition + '" max="' + data.result[i].upperLimitNumericCondition + '" value="'
                                + data.result[i].upperLimitNumericCondition + '" /></div></div></div><div class="item-col"><div class="input-group flex-nowrap"><span class="input-group-text"> برو به </span><div class="overflow-hidden flex-grow-1"><select class="form-select rounded-start-0 getQuestionList11" name="RangeRepeater['
                                + i + '][getQuestionList11]" id="getQuestionList11" data-kt-repeater="getQuestionList11" data-control="select2" data-placeholder="انتخاب سوال"></select></div></div></div><div class="item-col"><a href="javascript:;" data-repeater-delete class="btn btn-icon btn-md btn-light-danger "><i class="la la-trash-o fs-1"></i></a></div></div></div>'

                            $("#RangeRepeater").append(rowData);
                        }
                    }

                    AjaxElseAnswearQuestion(selectedElse);

                    break;

                case 12:
                case "12":

                    $(".InCardQTypeClass").addClass('d-none');
                    $("#InCardQType12").removeClass('d-none');

                    $("#MultipleChoiceRepeater12").empty();

                    var selectedElse = null;

                    for (var i = 0; i < data.result.length; i++) {

                        if (data.result[i].isDefault === true) {
                            selectedElse = data.result[i].nextVotePackageDetailId;
                        } else {

                            var index = i;
                            var selectedValue = data.result[i].nextVotePackageDetailId;
                            var selectedItemValue = data.result[i].votePackageDetailMultipleChoiceCondition?.[0]?.dataSourceItemId ?? null;

                            var rowData = `
                                <div data-repeater-item>
                                    <div class="form-group d-flex space-between mb-3 align-items-center repeater-grid-2 multiple-choice-repeater-item-container">
                        
                                        <div class="">
                                            <label class="form-label"></label>
                                        </div>

                                        <div class="item-col">
                                            <div class="input-group flex-nowrap">
                                                <span class="input-group-text">پاسخ</span>
                                                <div class="overflow-hidden flex-grow-1">
                                                    <select class="form-select rounded-start-0 dataSourceItemsList12"
                                                            name="MultipleChoiceRepeater12[${index}][selectItems]"
                                                            data-control="select2"
                                                            data-placeholder="انتخاب گزینه های سوال">
                                                        <option></option>
                                                    </select>
                                                </div>
                                            </div>
                                        </div>

                                        <div class="item-col">
                                            <div class="input-group flex-nowrap">
                                                <span class="input-group-text">برو به</span>
                                                <div class="overflow-hidden flex-grow-1">
                                                    <select class="form-select rounded-start-0 getQuestionList12"
                                                            name="MultipleChoiceRepeater12[${index}][selectQuestion]"
                                                            data-control="select2"
                                                            data-placeholder="انتخاب پاسخ">
                                                        <option></option>
                                                    </select>
                                                </div>
                                            </div>
                                        </div>

                                        <div class="item-col">
                                            <a href="javascript:;" data-repeater-delete class="btn btn-icon btn-md btn-light-danger">
                                                <i class="la la-trash-o fs-1"></i>
                                            </a>
                                        </div>

                                    </div>
                                </div>
                            `;

                            $("#MultipleChoiceRepeater12").append(rowData);

                            AjaxQuestionListForDataSource(index, selectedValue);
                            AjaxDatasourceList(index, selectedItemValue);
                        }
                    }

                    AjaxElseAnswearQuestion(selectedElse);

                    // اگر default/else هم داری، اینجا ست کن
                    // مثال:
                    // $("#DefaultNextQuestion12").val(selectedElse).trigger("change");

                    break;
                case 13:
                case "13":

                    // Composition تنظیم شرطی وابسته به پاسخ خودش ندارد،
                    // چون پاسخ‌ها متعلق به Children هستند.
                    // پس تمام پنل‌های مخصوص Typeهای دیگر مخفی می‌شوند.
                    $(".InCardQTypeClass")
                        .addClass('d-none');


                    // مسیر پیش‌فرض / سوال بعدی Composition
                    var selectedElse = null;


                    if (
                        Array.isArray(data.result)
                    ) {

                        for (
                            var i = 0;
                            i < data.result.length;
                            i++
                        ) {

                            if (
                                data.result[i].isDefault === true
                            ) {

                                selectedElse =
                                    data.result[i]
                                        .nextVotePackageDetailId;

                                break;
                            }
                        }
                    }


                    AjaxElseAnswearQuestion(
                        selectedElse
                    );

                    break;

                case 14:
                case "14":

                    // DisplayContent پاسخ ندارد
                    // فقط مسیر پیش‌فرض / سوال بعدی دارد

                    $(".InCardQTypeClass")
                        .addClass('d-none');


                    var selectedElse = null;


                    if (
                        Array.isArray(data.result)
                    ) {

                        for (
                            var i = 0;
                            i < data.result.length;
                            i++
                        ) {

                            if (
                                data.result[i].isDefault === true
                            ) {

                                selectedElse =
                                    data.result[i]
                                        .nextVotePackageDetailId;

                                break;
                            }
                        }
                    }


                    AjaxElseAnswearQuestion(
                        selectedElse
                    );

                    break;
                case 15:
                case "15":

                    // Attachment
                    // روی پاسخ فایل فعلاً شرط مسیر نداریم.
                    // فقط مسیر پیش‌فرض / سوال بعدی تنظیم می‌شود.

                    $(".InCardQTypeClass")
                        .addClass('d-none');


                    var selectedElse = null;


                    if (
                        Array.isArray(data.result)
                    ) {

                        for (
                            var i = 0;
                            i < data.result.length;
                            i++
                        ) {

                            if (
                                data.result[i].isDefault === true
                            ) {

                                selectedElse =
                                    data.result[i]
                                        .nextVotePackageDetailId;

                                break;
                            }
                        }
                    }


                    AjaxElseAnswearQuestion(
                        selectedElse
                    );

                    break;

                default:
            }

        }
    });


    //    اطلاعات اولیه سوال لود میشود در مدال

    $.ajax({
        type: "POST",
        dataType: 'JSOn',
        url: '/VoteQuestion/GetVoteQuestionByVoteQuestionId',

        data: {
            VoteQuestionId: QuestionId
        },
        beforeSend: function (xhr) {
            xhr.setRequestHeader("RequestVerificationToken", $('input[name="__RequestVerificationToken"]').val());
        }, success: function (data2) {

            for (const item of data2.data.votePackageDetailList) {
                var LowerNumeric = $('#LowerNumeric');
                var UpperNumeric = $('#UpperNumeric');
                var LowerStar = $('#LowerStar');
                var UpperStar = $('#UpperStar');
                var LowerRange = $('#LowerRange');
                var UpperRange = $('#UpperRange');
                var lowerChosen = $('#lowerChosen');
                var UpperChosen = $('#UpperChosen');
                var lowerDate = $('#lowerLimitDateValueHide');
                var UpperDate = $('#upperLimitDateValueHide');


                if (item.votePackageDetailId === votePackageDetailId) {
                    LowerNumeric.val(item.lowerLimitNumericValue);
                    UpperNumeric.val(item.upperLimitNumericValue);
                    LowerStar.val(item.lowerLimitStarValue);
                    UpperStar.val(item.upperLimitStarValue);
                    LowerRange.val(item.lowerLimitRangeValue);
                    UpperRange.val(item.upperLimitRangeValue);
                    lowerChosen.val(item.LowerLimitChosenCount);
                    UpperChosen.val(item.UpperLimitChosenCount);
                    lowerDate.val(item.lowerLimitDateValue);
                    UpperDate.val(item.upperLimitDateValue);
                    document.getElementById('LowerNumerictext').innerHTML = '<span>' + item.lowerLimitNumericValue + '</span>';
                    document.getElementById('UpperNumerictext').innerHTML = '<span>' + item.upperLimitNumericValue + '</span>';
                    document.getElementById('LowerStartext').innerHTML = '<span>' + item.lowerLimitNumericValue + '</span>';
                    document.getElementById('UpperStartext').innerHTML = '<span>' + item.upperLimitNumericValue + '</span>';
                    document.getElementById('LowerRangetext').innerHTML = '<span>' + item.lowerLimitNumericValue + '</span>';
                    document.getElementById('UpperRangetext').innerHTML = '<span>' + item.upperLimitNumericValue + '</span>';
                    document.getElementById('LowerChosentext').innerHTML = '<span>' + item.lowerLimitChosenCount + '</span>';
                    document.getElementById('UpperChosentext').innerHTML = '<span>' + item.upperLimitChosenCount + '</span>';
                    document.getElementById('LowerChosentext2').innerHTML = '<span>' + item.lowerLimitChosenCount + '</span>';
                    document.getElementById('UpperChosentext2').innerHTML = '<span>' + item.upperLimitChosenCount + '</span>';
                    document.getElementById('lowerLimitDatetext').innerHTML = '<span>' + item.lowerLimitDateValuePersian + '</span>';
                    document.getElementById('upperLimitDatetext').innerHTML = '<span>' + item.upperLimitDateValuePersian + '</span>';
                    document.getElementById('upperLimitDatetext').innerHTML = '<span>' + item.upperLimitDateValuePersian + '</span>';
                    document.getElementById("maxSelect").value = item.upperLimitChosenCount;
                    MaxSelect = document.getElementById("maxSelect").value;
                }


            };

            if (MaxSelect > 1) {
                $('#repeater_MultipleChoiceRepeater2').removeClass('d-none');
                $('#repeater_MultipleChoiceRepeater').addClass('d-none');
            } else {
                $('#repeater_MultipleChoiceRepeater2').addClass('d-none');
                $('#repeater_MultipleChoiceRepeater').removeClass('d-none');
            }


            $(".voteQuestionItemsList1").empty();
            $('#voteQuestionTypeIcon').empty();
            $("#getQuestionList").empty();
            $('#voteQuestionWeight').html('');
            //$("#ElseAnswearQuestion").empty();
            //$('#ElseAnswearQuestion').prepend('<option  selected="selected"   disabled="disabled" value="None" >انتخاب نمایید</option>');
            const questionType =
                data2.data.voteQuestionTypeList
                || {};


            const typeColor =
                questionType.color
                    ? questionType.color
                        .replace(
                            '!important',
                            ''
                        )
                        .trim()
                    : '';


            const typeIcon =
                questionType.icon
                || '';


            let typeIconHtml = '';


            if (typeIcon) {

                typeIconHtml = `

                    <span class="svg-icon svg-icon-2x">

                        <img
                            src="${typeIcon}"
                            alt=""
                        />

                    </span>

                `;

                        }


                        $('#voteQuestionTypeIcon')
                            .html(`

                    <span
                        class="symbol-label vote-type-color"
                        ${typeColor
                                    ? `data-color="${typeColor}"`
                                    : ''
                                }
                    >

                        ${typeIconHtml}

                    </span>

                `);
            $('#voteQuestionTypetitle').html(data2.data.voteQuestionTypeList.title);
            $('#voteQuestionWeight').html(data2.data.weight);
            $('#voteQuestionTypeId').val(typeQuestion);
            $('#QuestionTitle').html(data2.data.title);


            document
                .querySelectorAll(
                    ".vote-type-color"
                )
                .forEach(
                    function (el) {

                        const color =
                            (
                                el.dataset.color
                                ||
                                ''
                            )
                                .replace(
                                    '!important',
                                    ''
                                )
                                .trim();


                        if (color) {

                            el.style.setProperty(
                                'background-color',
                                color,
                                'important'
                            );

                        }

                    }
                );
            switch (typeQuestion) {
                //انتخابی
                case 1:

                    if (MaxSelect > 1) {
                        $('#QuestionTitleInput1_2').val(data2.data.title);
                        for (var i = 0; i < data2.data.voteQuestionItemsList.length; i++) {
                            var ItemsList2 = new Option(data2.data.voteQuestionItemsList[i].title, data2.data.voteQuestionItemsList[i].voteQuestionItemId, false, false);
                            $("#voteQuestionItemsList1_2").append(ItemsList2)
                        }
                        $.ajax({
                            type: "post",
                            url: '/VotePackageDetail/GetAllVotePackageDetailByVotePackageIdExceptByVoteQuestionId',
                            data: {
                                currentVotePackageId: $("#VotePackageDetailGraphIdHidden").val(),
                                VotePackageId: $("#VotePackageIdGET").val(),
                                pagesize: 1000,
                            },
                            beforeSend: function (xhr) {
                                xhr.setRequestHeader("RequestVerificationToken", $('input[name="__RequestVerificationToken"]').val());
                            }, success: function (data) {

                                $("#getQuestionList1_2").empty();
                                for (var i = 0; i < data.result.length; i++) {
                                    var itemType = new Option(data.result[i].voteQuestionTitle, data.result[i].votePackageDetailId, false, false);
                                    $("#getQuestionList1_2").append(itemType);
                                }
                            }
                        });

                    } else {
                        $('#QuestionTitleInput').val(data2.data.title);
                        for (var i = 0; i < data2.data.voteQuestionItemsList.length; i++) {
                            var ItemsList = new Option(data2.data.voteQuestionItemsList[i].title, data2.data.voteQuestionItemsList[i].voteQuestionItemId, false, false);
                            $("#voteQuestionItemsList1").append(ItemsList)
                        }
                        $.ajax({
                            type: "post",
                            url: '/VotePackageDetail/GetAllVotePackageDetailByVotePackageIdExceptByVoteQuestionId',
                            data: {
                                currentVotePackageId: $("#VotePackageDetailGraphIdHidden").val(),
                                VotePackageId: $("#VotePackageIdGET").val(),
                                pagesize: 1000,
                            },
                            beforeSend: function (xhr) {
                                xhr.setRequestHeader("RequestVerificationToken", $('input[name="__RequestVerificationToken"]').val());
                            }, success: function (data) {
                                $("#getQuestionList1").empty();
                                for (var i = 0; i < data.result.length; i++) {
                                    var itemType = new Option(data.result[i].voteQuestionTitle, data.result[i].votePackageDetailId, false, false);
                                    $("#getQuestionList1").append(itemType);
                                }


                            }
                        });

                    }

                    break;
                //عددی
                case 3:
                    $('#QuestionTitleInput3').val(data2.data.title);
                    var LowerNumeric = $('#LowerNumeric').val();
                    var UpperNumeric = $('#UpperNumeric').val();
                    $("input.setMinMax").attr({ "max": UpperNumeric, "min": LowerNumeric });
                    $.ajax({
                        type: "post",
                        url: '/VotePackageDetail/GetAllVotePackageDetailByVotePackageIdExceptByVoteQuestionId',
                        data: {
                            currentVotePackageId: $("#VotePackageDetailGraphIdHidden").val(),
                            VotePackageId: $("#VotePackageIdGET").val(),
                            pagesize: 1000,
                        },
                        beforeSend: function (xhr) {
                            xhr.setRequestHeader("RequestVerificationToken", $('input[name="__RequestVerificationToken"]').val());
                        }, success: function (data) {
                            for (var i = 0; i < data.result.length; i++) {
                                var itemType = new Option(data.result[i].voteQuestionTitle, data.result[i].votePackageDetailId, false, false);
                                $("#getQuestionList3").append(itemType);
                            }
                        }
                    });

                    break;
                //تشریحی
                case 4:

                    break;

                //تاریخی
                case 5:
                    $('#QuestionTitleInput5').val(data2.data.title);
                    $.ajax({
                        type: "post",
                        url: '/VotePackageDetail/GetAllVotePackageDetailByVotePackageIdExceptByVoteQuestionId',
                        data: {
                            currentVotePackageId: $("#VotePackageDetailGraphIdHidden").val(),
                            VotePackageId: $("#VotePackageIdGET").val(),
                            pagesize: 1000,
                        },
                        beforeSend: function (xhr) {
                            xhr.setRequestHeader("RequestVerificationToken", $('input[name="__RequestVerificationToken"]').val());
                        }, success: function (data) {

                            for (var i = 0; i < data.result.length; i++) {
                                var itemType = new Option(data.result[i].voteQuestionTitle, data.result[i].votePackageDetailId, false, false);
                                $('.getQuestionList5[name="DateTimeRepeater[0][selectQuestion5]"]').append(itemType);
                            }
                        }
                    });
                    break;
                //ورودی معتبر
                case 6:
                    $('#QuestionTitleInput6').val(data2.data.title);
                    $.ajax({
                        type: "post",
                        url: '/VotePackageDetail/GetAllVotePackageDetailByVotePackageIdExceptByVoteQuestionId',
                        data: {
                            currentVotePackageId: $("#VotePackageDetailGraphIdHidden").val(),
                            VotePackageId: $("#VotePackageIdGET").val(),
                            pagesize: 1000,
                        },
                        beforeSend: function (xhr) {
                            xhr.setRequestHeader("RequestVerificationToken", $('input[name="__RequestVerificationToken"]').val());
                        }, success: function (data) {

                            for (var i = 0; i < data.result.length; i++) {
                                var itemType = new Option(data.result[i].voteQuestionTitle, data.result[i].votePackageDetailId, false, false);
                                $("#getQuestionList6").append(itemType);
                            }
                        }
                    });


                    break;
                //ستاره ای
                case 10:

                    $('#QuestionTitleInput10').val(data2.data.title);
                    var LowerStar = $('#LowerStar').val();
                    var UpperStar = $('#UpperStar').val();
                    $("input.setMinMaxStar").attr({ "max": UpperStar, "min": LowerStar });
                    $.ajax({
                        type: "post",
                        url: '/VotePackageDetail/GetAllVotePackageDetailByVotePackageIdExceptByVoteQuestionId',
                        data: {
                            currentVotePackageId: $("#VotePackageDetailGraphIdHidden").val(),
                            VotePackageId: $("#VotePackageIdGET").val(),
                            pagesize: 1000,
                        },
                        beforeSend: function (xhr) {
                            xhr.setRequestHeader("RequestVerificationToken", $('input[name="__RequestVerificationToken"]').val());
                        }, success: function (data) {
                            for (var i = 0; i < data.result.length; i++) {
                                var itemType = new Option(data.result[i].voteQuestionTitle, data.result[i].votePackageDetailId, false, false);
                                $("#getQuestionList10").append(itemType);
                            }
                        }
                    });

                    break;
                //  میله ای
                case 11:

                    $('#QuestionTitleInput11').val(data2.data.title);
                    var LowerRange = $('#LowerRange').val();
                    var UpperRange = $('#UpperRange').val();
                    $("input.setMinMaxRange").attr({ "max": UpperRange, "min": LowerRange });
                    $.ajax({
                        type: "post",
                        url: '/VotePackageDetail/GetAllVotePackageDetailByVotePackageIdExceptByVoteQuestionId',
                        data: {
                            currentVotePackageId: $("#VotePackageDetailGraphIdHidden").val(),
                            VotePackageId: $("#VotePackageIdGET").val(),
                            pagesize: 1000,
                        },
                        beforeSend: function (xhr) {
                            xhr.setRequestHeader("RequestVerificationToken", $('input[name="__RequestVerificationToken"]').val());
                        }, success: function (data) {
                            for (var i = 0; i < data.result.length; i++) {
                                var itemType = new Option(data.result[i].voteQuestionTitle, data.result[i].votePackageDetailId, false, false);
                                $("#getQuestionList11").append(itemType);
                            }
                        }
                    });

                    break;

                case 12:
                case "12":

                    $('#QuestionTitleInput12').val(data2.data.title);
                    for (var i = 0; i < data2.data.dataSourceItemsList.length; i++) {
                        var ItemsList = new Option(data2.data.dataSourceItemsList[i].title, data2.data.dataSourceItemsList[i].dataSourceItemId, false, false);
                        $("#voteQuestionItemsList12").append(ItemsList)
                    }

                    $.ajax({
                        type: "post",
                        url: '/VotePackageDetail/GetAllVotePackageDetailByVotePackageIdExceptByVoteQuestionId',
                        data: {
                            currentVotePackageId: $("#VotePackageDetailGraphIdHidden").val(),
                            VotePackageId: $("#VotePackageIdGET").val(),
                            pagesize: 1000,
                        },
                        beforeSend: function (xhr) {
                            xhr.setRequestHeader("RequestVerificationToken", $('input[name="__RequestVerificationToken"]').val());
                        }, success: function (data) {
                            $("#getQuestionList12").empty();
                            for (var i = 0; i < data.result.length; i++) {
                                var itemType = new Option(data.result[i].voteQuestionTitle, data.result[i].votePackageDetailId, false, false);
                                $("#getQuestionList12").append(itemType);
                            }


                        }
                    });

                    break;

                case 13:
                case "13":
                case 14:
                case "14":

                    // Composition و DisplayContent
                    // تنظیمات اختصاصی شرط ندارند

                    $(".InCardQTypeClass")
                        .addClass('d-none');

                    break;

                default:
                    break;

            }
        }
    });



}


function AjaxElseAnswearQuestion(selectedElse) {
    $("#ElseAnswearQuestion").empty();
    $('#ElseAnswearQuestion').prepend('<option  selected="selected"   disabled="disabled" value="None" >انتخاب نمایید</option>');

    $.ajax({
        type: "post",
        url: '/VotePackageDetail/GetAllVotePackageDetailByVotePackageIdExceptByVoteQuestionId',
        data: {
            currentVotePackageId: $("#VotePackageDetailGraphIdHidden").val(),

            VotePackageId: $("#VotePackageIdGET").val(),
            pagesize: 1000,
        },
        beforeSend: function (xhr) {
            xhr.setRequestHeader("RequestVerificationToken", $('input[name="__RequestVerificationToken"]').val());
        }, success: function (data) {

            for (var i = 0; i < data.result.length; i++) {

                if (selectedElse == data.result[i].votePackageDetailId) {
                    var itemType = new Option(data.result[i].voteQuestionTitle, data.result[i].votePackageDetailId, true, true);
                }
                else {
                    var itemType = new Option(data.result[i].voteQuestionTitle, data.result[i].votePackageDetailId, false, false);
                }


                $("#ElseAnswearQuestion").append(itemType);

            }

        }
    });
}
function AjaxItemList(name, selectedItemValue) {
    var QuestionIdForAdd = document.getElementById("QuestionIdHidden").value;
    $.ajax({
        type: "POST",
        dataType: 'JSOn',
        url: '/VoteQuestion/GetVoteQuestionByVoteQuestionId',
        data: {
            VoteQuestionId: QuestionIdForAdd
        },
        beforeSend: function (xhr) {
            xhr.setRequestHeader("RequestVerificationToken", $('input[name="__RequestVerificationToken"]').val());
        }, success: function (data2) {
            for (var i = 0; i < data2.data.voteQuestionItemsList.length; i++) {
                if (selectedItemValue == data2.data.voteQuestionItemsList[i].voteQuestionItemId) {
                    var itemType = new Option(data2.data.voteQuestionItemsList[i].title, data2.data.voteQuestionItemsList[i].voteQuestionItemId, true, true);
                }
                else {
                    var itemType = new Option(data2.data.voteQuestionItemsList[i].title, data2.data.voteQuestionItemsList[i].voteQuestionItemId, false, false);
                }
                $('.voteQuestionItemsList[name = "MultipleChoiceRepeater[' + name + '][selectItems]"]').append(itemType)
            }
        }
    });
}

function AjaxDatasourceList(name, selectedItemValue) {
    var QuestionIdForAdd = document.getElementById("QuestionIdHidden").value;
    $.ajax({
        type: "POST",
        dataType: 'JSOn',
        url: '/VoteQuestion/GetVoteQuestionByVoteQuestionId',
        data: {
            VoteQuestionId: QuestionIdForAdd
        },
        beforeSend: function (xhr) {
            xhr.setRequestHeader("RequestVerificationToken", $('input[name="__RequestVerificationToken"]').val());
        }, success: function (data2) {
            for (var i = 0; i < data2.data.dataSourceItemsList.length; i++) {
                if (selectedItemValue == data2.data.dataSourceItemsList[i].dataSourceItemId) {
                    var itemType = new Option(data2.data.dataSourceItemsList[i].title, data2.data.dataSourceItemsList[i].dataSourceItemId, true, true);
                }
                else {
                    var itemType = new Option(data2.data.dataSourceItemsList[i].title, data2.data.dataSourceItemsList[i].dataSourceItemId, false, false);
                }
                $('.dataSourceItemsList12[name = "MultipleChoiceRepeater12[' + name + '][selectItems]"]').append(itemType)
            }
        }
    });
}

function AjaxQuestionListForDataSource(name, selectedValue) {
    $('.getQuestionList12[name = "MultipleChoiceRepeater12[' + name + '][selectQuestion]').empty();
    $.ajax({
        type: "post",
        url: '/VotePackageDetail/GetAllVotePackageDetailByVotePackageIdExceptByVoteQuestionId',
        data: {
            currentVotePackageId: $("#VotePackageDetailGraphIdHidden").val(),
            VotePackageId: $("#VotePackageIdGET").val(),
            pagesize: 1000,
        },
        beforeSend: function (xhr) {
            xhr.setRequestHeader("RequestVerificationToken", $('input[name="__RequestVerificationToken"]').val());
        }, success: function (data) {

            for (var i = 0; i < data.result.length; i++) {

                if (selectedValue == data.result[i].votePackageDetailId) {
                    var itemType = new Option(data.result[i].voteQuestionTitle, data.result[i].votePackageDetailId, true, true);
                }
                else {
                    var itemType = new Option(data.result[i].voteQuestionTitle, data.result[i].votePackageDetailId, false, false);
                }
                $('.getQuestionList12[name = "MultipleChoiceRepeater12[' + name + '][selectQuestion]').append(itemType)
            }
        }
    });
}


function AjaxItemList2(name, selectedItemValue) {
    var QuestionIdForAdd = document.getElementById("QuestionIdHidden").value;
    $.ajax({
        type: "POST",
        dataType: 'JSOn',
        url: '/VoteQuestion/GetVoteQuestionByVoteQuestionId',
        data: {
            VoteQuestionId: QuestionIdForAdd
        },
        beforeSend: function (xhr) {
            xhr.setRequestHeader("RequestVerificationToken", $('input[name="__RequestVerificationToken"]').val());
        }, success: function (data2) {
            for (var i = 0; i < data2.data.voteQuestionItemsList.length; i++) {
                if (selectedItemValue == data2.data.voteQuestionItemsList[i].voteQuestionItemId) {
                    var itemType = new Option(data2.data.voteQuestionItemsList[i].title, data2.data.voteQuestionItemsList[i].voteQuestionItemId, true, true);
                }
                else {
                    var itemType = new Option(data2.data.voteQuestionItemsList[i].title, data2.data.voteQuestionItemsList[i].voteQuestionItemId, false, false);
                }
                $('.MultipleChoiceRepeater2[name = "MultipleChoiceRepeater2[' + name + '][selectItems]"]').append(itemType)
            }
        }
    });
}
function AjaxItemListSubList(rowMain, SubItemsRowDataSeleted, CountItemsSub) {
    var QuestionIdForAdd = document.getElementById("QuestionIdHidden").value;
    $.ajax({
        type: "POST",
        dataType: 'JSOn',
        url: '/VoteQuestion/GetVoteQuestionByVoteQuestionId',
        data: {
            VoteQuestionId: QuestionIdForAdd
        },
        beforeSend: function (xhr) {
            xhr.setRequestHeader("RequestVerificationToken", $('input[name="__RequestVerificationToken"]').val());
        }, success: function (data2) {
            for (var i = 0; i < data2.data.voteQuestionItemsList.length; i++) {
                if (SubItemsRowDataSeleted == data2.data.voteQuestionItemsList[i].voteQuestionItemId) {
                    var itemType = new Option(data2.data.voteQuestionItemsList[i].title, data2.data.voteQuestionItemsList[i].voteQuestionItemId, true, true);
                }
                else {
                    var itemType = new Option(data2.data.voteQuestionItemsList[i].title, data2.data.voteQuestionItemsList[i].voteQuestionItemId, false, false);
                }
                $('.voteQuestionItemsList1_2[name = "MultipleChoiceRepeater2[' + rowMain + '][SubMultipleChoiceRepeater2][' + CountItemsSub + '][selectItems]"]').append(itemType);


            }
        }
    });
}
function AjaxSubItemList2(Row, selectedItemValue) {

    var QuestionIdForAdd = document.getElementById("QuestionIdHidden").value;
    $.ajax({
        type: "POST",
        dataType: 'JSOn',
        url: '/VoteQuestion/GetVoteQuestionByVoteQuestionId',
        data: {
            VoteQuestionId: QuestionIdForAdd
        },
        beforeSend: function (xhr) {
            xhr.setRequestHeader("RequestVerificationToken", $('input[name="__RequestVerificationToken"]').val());
        }, success: function (data2) {
            for (var i = 0; i < data2.data.voteQuestionItemsList.length; i++) {
                if (selectedItemValue == data2.data.voteQuestionItemsList[i].voteQuestionItemId) {
                    var itemType = new Option(data2.data.voteQuestionItemsList[i].title, data2.data.voteQuestionItemsList[i].voteQuestionItemId, true, true);
                }
                else {
                    var itemType = new Option(data2.data.voteQuestionItemsList[i].title, data2.data.voteQuestionItemsList[i].voteQuestionItemId, false, false);
                }
                $('.voteQuestionItemsList1_2[name = "MultipleChoiceRepeater2[' + Row + '][SubMultipleChoiceRepeater2][' + i + '][selectItems]"]').append(itemType);




            }
        }
    });
}
function AddListItems(rowMain, Row, selectedItemValue) {
    var QuestionIdForAdd = document.getElementById("QuestionIdHidden").value;

    $.ajax({
        type: "POST",
        dataType: 'JSOn',
        url: '/VoteQuestion/GetVoteQuestionByVoteQuestionId',
        data: {
            VoteQuestionId: QuestionIdForAdd
        },
        beforeSend: function (xhr) {
            xhr.setRequestHeader("RequestVerificationToken", $('input[name="__RequestVerificationToken"]').val());
        }, success: function (data2) {
            for (var i = 0; i < data2.data.voteQuestionItemsList.length; i++) {


                if (selectedItemValue == data2.data.voteQuestionItemsList[i].voteQuestionItemId) {
                    var itemType = new Option(data2.data.voteQuestionItemsList[i].title, data2.data.voteQuestionItemsList[i].voteQuestionItemId, true, true);
                    $('.voteQuestionItemsList1_2[name = "MultipleChoiceRepeater2[' + rowMain + '][SubMultipleChoiceRepeater2][' + Row + '][selectItems]"]').append(itemType);

                }
                else {
                    var itemType = new Option(data2.data.voteQuestionItemsList[i].title, data2.data.voteQuestionItemsList[i].voteQuestionItemId, false, false);
                    $('.voteQuestionItemsList1_2[name = "MultipleChoiceRepeater2[' + rowMain + '][SubMultipleChoiceRepeater2][' + Row + '][selectItems]"]').append(itemType);
                }
            }
        }
    });


}
function AjaxQuestionList(name, selectedValue) {
    $('.getQuestionList1_2[name = "MultipleChoiceRepeater2[' + name + '][selectQuestion]').empty();
    $.ajax({
        type: "post",
        url: '/VotePackageDetail/GetAllVotePackageDetailByVotePackageIdExceptByVoteQuestionId',
        data: {
            currentVotePackageId: $("#VotePackageDetailGraphIdHidden").val(),
            VotePackageId: $("#VotePackageIdGET").val(),
            pagesize: 1000,
        },
        beforeSend: function (xhr) {
            xhr.setRequestHeader("RequestVerificationToken", $('input[name="__RequestVerificationToken"]').val());
        }, success: function (data) {

            for (var i = 0; i < data.result.length; i++) {

                if (selectedValue == data.result[i].votePackageDetailId) {
                    var itemType = new Option(data.result[i].voteQuestionTitle, data.result[i].votePackageDetailId, true, true);
                }
                else {
                    var itemType = new Option(data.result[i].voteQuestionTitle, data.result[i].votePackageDetailId, false, false);
                }
                $('.getQuestionList[name = "MultipleChoiceRepeater[' + name + '][selectQuestion]').append(itemType)
            }
        }
    });
}
function AjaxQuestionList2(name, selectedValue) {

    $.ajax({
        type: "post",
        url: '/VotePackageDetail/GetAllVotePackageDetailByVotePackageIdExceptByVoteQuestionId',
        data: {
            currentVotePackageId: $("#VotePackageDetailGraphIdHidden").val(),
            VotePackageId: $("#VotePackageIdGET").val(),
            pagesize: 1000,
        },
        beforeSend: function (xhr) {
            xhr.setRequestHeader("RequestVerificationToken", $('input[name="__RequestVerificationToken"]').val());
        }, success: function (data) {

            for (var i = 0; i < data.result.length; i++) {

                if (selectedValue == data.result[i].votePackageDetailId) {
                    var itemType = new Option(data.result[i].voteQuestionTitle, data.result[i].votePackageDetailId, true, true);
                }
                else {
                    var itemType = new Option(data.result[i].voteQuestionTitle, data.result[i].votePackageDetailId, false, false);
                }
                $('.getQuestionList1_2[name = "MultipleChoiceRepeater2[' + name + '][selectQuestion]').append(itemType)
            }
        }
    });
    $('.getQuestionList1_2[name = "MultipleChoiceRepeater2[' + name + '][selectQuestion]').prepend('<Option selected disabled >       </option>');
}
function AjaxQuestionListTypeDate(name, selectedValue) {
    $.ajax({
        type: "post",
        url: '/VotePackageDetail/GetAllVotePackageDetailByVotePackageIdExceptByVoteQuestionId',
        data: {
            currentVotePackageId: $("#VotePackageDetailGraphIdHidden").val(),
            VotePackageId: $("#VotePackageIdGET").val(),
            pagesize: 1000,
        },
        beforeSend: function (xhr) {
            xhr.setRequestHeader("RequestVerificationToken", $('input[name="__RequestVerificationToken"]').val());
        }, success: function (data) {

            for (var i = 0; i < data.result.length; i++) {

                if (selectedValue == data.result[i].votePackageDetailId) {
                    var itemType = new Option(data.result[i].voteQuestionTitle, data.result[i].votePackageDetailId, true, true);
                }
                else {
                    var itemType = new Option(data.result[i].voteQuestionTitle, data.result[i].votePackageDetailId, false, false);
                }

                $('.getQuestionList5[name = "DateTimeRepeater[' + name + '][selectQuestion5]').append(itemType)
            }
        }
    });
}
function AddDateTimeStartDateItemInput(name) {
    var Lower = $('.LowerLimitDateItemValue[name="DateTimeRepeater[' + name + '][LowerLimitDateItemValue]');
    Lower.attr("id", 'LowerLimitDateItemValue' + name + '');
    //  kamaDatepicker('LowerLimitDateItemValue' + name + '', customOptionsbottom);
}
function AddDateTimeEndDateItemInput(name) {
    var Upper = $('.UpperLimitDateItemValue[name="DateTimeRepeater[' + name + '][UpperLimitDateItemValue]');
    Upper.attr("id", 'UpperLimitDateItemValue' + name + '');
    // kamaDatepicker('UpperLimitDateItemValue' + name + '', customOptionsbottom);
}
function AjaxQuestionListTypeNumeric(name, selectedValue) {
    $.ajax({
        type: "post",
        url: '/VotePackageDetail/GetAllVotePackageDetailByVotePackageIdExceptByVoteQuestionId',
        data: {
            currentVotePackageId: $("#VotePackageDetailGraphIdHidden").val(),
            VotePackageId: $("#VotePackageIdGET").val(),
            pagesize: 1000,
        },
        beforeSend: function (xhr) {
            xhr.setRequestHeader("RequestVerificationToken", $('input[name="__RequestVerificationToken"]').val());
        }, success: function (data) {

            for (var i = 0; i < data.result.length; i++) {
                if (selectedValue == data.result[i].votePackageDetailId) {

                    var itemType = new Option(data.result[i].voteQuestionTitle, data.result[i].votePackageDetailId, true, true);
                }
                else {
                    var itemType = new Option(data.result[i].voteQuestionTitle, data.result[i].votePackageDetailId, false, false);

                }

                $('.getQuestionList3[name = "NumericRangeRepeater[' + name + '][getQuestionList3]').append(itemType)
            }
        }
    });
}
function AjaxQuestionListTypeStar(name, selectedValue) {
    $.ajax({
        type: "post",
        url: '/VotePackageDetail/GetAllVotePackageDetailByVotePackageIdExceptByVoteQuestionId',
        data: {
            currentVotePackageId: $("#VotePackageDetailGraphIdHidden").val(),
            VotePackageId: $("#VotePackageIdGET").val(),
            pagesize: 1000,
        },
        beforeSend: function (xhr) {
            xhr.setRequestHeader("RequestVerificationToken", $('input[name="__RequestVerificationToken"]').val());
        }, success: function (data) {

            for (var i = 0; i < data.result.length; i++) {
                if (selectedValue == data.result[i].votePackageDetailId) {

                    var itemType = new Option(data.result[i].voteQuestionTitle, data.result[i].votePackageDetailId, true, true);
                }
                else {
                    var itemType = new Option(data.result[i].voteQuestionTitle, data.result[i].votePackageDetailId, false, false);

                }

                $('.getQuestionList10[name = "StarRepeater[' + name + '][getQuestionList10]').append(itemType)
            }
        }
    });
}
function AjaxQuestionListTypeRange(name, selectedValue) {
    $.ajax({
        type: "post",
        url: '/VotePackageDetail/GetAllVotePackageDetailByVotePackageIdExceptByVoteQuestionId',
        data: {
            currentVotePackageId: $("#VotePackageDetailGraphIdHidden").val(),
            VotePackageId: $("#VotePackageIdGET").val(),
            pagesize: 1000,
        },
        beforeSend: function (xhr) {
            xhr.setRequestHeader("RequestVerificationToken", $('input[name="__RequestVerificationToken"]').val());
        }, success: function (data) {

            for (var i = 0; i < data.result.length; i++) {
                if (selectedValue == data.result[i].votePackageDetailId) {

                    var itemType = new Option(data.result[i].voteQuestionTitle, data.result[i].votePackageDetailId, true, true);
                }
                else {
                    var itemType = new Option(data.result[i].voteQuestionTitle, data.result[i].votePackageDetailId, false, false);

                }

                $('.getQuestionList11[name = "RangeRepeater[' + name + '][getQuestionList11]').append(itemType)
            }
        }
    });
}




$('#repeater_MultipleChoiceRepeater').repeater({

    defaultValues: {
        'selectItems': '11'
    },
    show: function () {
        $(this).slideDown(function () { });
        var index = $(this).closest('[data-repeater-item]').index();
        AjaxItemList(index);
        AjaxQuestionList(index);
    },

    hide: function (deleteElement) {
        $(this).slideUp(deleteElement);
    },
    ready: function () { }
});


$('#repeater_MultipleChoiceRepeater2').repeater({

    repeaters: [{

        selector: '.inner-repeater',
        show: function () {


            $(this).slideDown();



            var indexItem = $(this).closest('[data-repeater-item]').index();
            var rowHTML = $(this).closest('[data-repeater-list]');
            var rowMain = $(rowHTML).closest('[data-repeater-item]').index();

            var rowSub = $(this).closest('[data-repeater-list]').index();


            AddListItems(rowMain, row);
            //  addOnclickLink(rowMain, rowSub, rowHTML);

            AddListItems(rowMain, rowSub, selectedItemValue);
            AjaxItemListSubList(rowMain, '00', rowSub);

        },
        hide: function (deleteElement) {
            $(this).slideUp(deleteElement);
        }
    }],

    show: function () {


        $(this).slideDown();
        var rowMain = $(this).closest('[data-repeater-item]').index();
        var rowMainHtml = $(this).closest('[data-repeater-item]');
        var StartRowSub = 0;
        //برو به
        AjaxQuestionList2(rowMain);
        addClassInnerAdd(rowMain, rowMainHtml);
        AddListItems(rowMain, StartRowSub);
        AjaxIsAll(rowMain);
        addOnclickLink(rowMain, StartRowSub, rowMainHtml);

    },

    hide: function (deleteElement) {
        $(this).slideUp(deleteElement);
    }

});


function AjaxIsAll(rowMain) {
    $('[name="MultipleChoiceRepeater2[' + rowMain + '][selectIsAll]"]').empty();
    $('[name="MultipleChoiceRepeater2[' + rowMain + '][selectIsAll]"]').append('<option value="true"> همه</option><option value="false"> یکی</option> ');


}

function addClassInnerAdd(rowMain, rowMainHtml) {

    $(rowMainHtml).find('.SubRepeater').addClass('innerAdd-' + rowMain + '');

}
function addOnclickLink(rowMain, rowSub, rowMainHtml) {

    var rowSub = $('innerAdd-' + rowMain + '').find('[data-repeater-item]').length;
    //  $(rowMainHtml + ' a').attr('onClick', 'addChoiceForCondition(' + rowMain + ',' + rowSub + ')');
    $('.innerAdd-' + rowMain + ' a').attr('onClick', 'addChoiceForCondition(' + rowMain + ',' + rowSub + ') ');
}

$('#repeater_DateTimeRepeater').repeater({

    defaultValues: {
        'selectItems': '11'
    },
    show: function () {
        $(this).slideDown(function () {


        });

        var index = $(this).closest('[data-repeater-item]').index();
        AjaxQuestionListTypeDate(index);
        AddDateTimeStartDateItemInput(index);
        AddDateTimeEndDateItemInput(index);
        //AjaxQuestionListTypeDateAddDataPicker();
    },
    hide: function (deleteElement) {
        $(this).slideUp(deleteElement);
    },
    ready: function () { }
});

$('#repeater_NumericRangeRepeater').repeater({

    defaultValues: {
        'selectItems': '11'
    },
    show: function () {
        $(this).slideDown(function () {
        });
        var index = $(this).closest('[data-repeater-item]').index();
        AjaxQuestionListTypeNumeric(index);
    },

    hide: function (deleteElement) {
        $(this).slideUp(deleteElement);
    },
    ready: function () { }

});
$('#repeater_StarRepeater').repeater({

    defaultValues: {
        'selectItems': '11'
    },
    show: function () {
        $(this).slideDown(function () {
        });
        var index = $(this).closest('[data-repeater-item]').index();
        AjaxQuestionListTypeStar(index);
    },

    hide: function (deleteElement) {
        $(this).slideUp(deleteElement);
    },
    ready: function () { }

});


$('#repeater_RangeRepeater').repeater({

    defaultValues: {
        'selectItems': '11'
    },
    show: function () {
        $(this).slideDown(function () {
        });
        var index = $(this).closest('[data-repeater-item]').index();
        AjaxQuestionListTypeRange(index);
    },

    hide: function (deleteElement) {
        $(this).slideUp(deleteElement);
    },
    ready: function () { }

});

$('#repeater_MultipleChoiceRepeater12').repeater({

    repeaters: [{

        selector: '.inner-repeater',
        show: function () {
            var index = $(this).closest('[data-repeater-item]').index();

            $(this).slideDown();


            AjaxDatasourceList(index, null);

            var indexItem = $(this).closest('[data-repeater-item]').index();
            var rowHTML = $(this).closest('[data-repeater-list]');
            var rowMain = $(rowHTML).closest('[data-repeater-item]').index();

            var rowSub = $(this).closest('[data-repeater-list]').index();


            //AddListItems(rowMain, row);
            ////  addOnclickLink(rowMain, rowSub, rowHTML);

            //AddListItems(rowMain, rowSub, selectedItemValue);
            AjaxItemListSubList(rowMain, '00', rowSub);

        },
        hide: function (deleteElement) {
            $(this).slideUp(deleteElement);
        }
    }],

    show: function () {

        var index = $(this).closest('[data-repeater-item]').index();
        $(this).slideDown();
        var rowMain = $(this).closest('[data-repeater-item]').index();
        var rowMainHtml = $(this).closest('[data-repeater-item]');
        var StartRowSub = 0;
        //برو به
        //AjaxQuestionList2(rowMain);
        addClassInnerAdd(rowMain, rowMainHtml);
        //AddListItems(rowMain, StartRowSub);
        AjaxIsAll(rowMain);
        addOnclickLink(rowMain, StartRowSub, rowMainHtml);

        AjaxDatasourceList(index, null);
        AjaxQuestionListForDataSource(index, null);

    },

    hide: function (deleteElement) {
        $(this).slideUp(deleteElement);
    }





    //initEmpty: false,

    //show: function () {
    //    $(this).slideDown();

    //    var $row = $(this);

    //    $row.find('.dataSourceItemsList12').select2({
    //        placeholder: "انتخاب گزینه های سوال",
    //        allowClear: true,
    //        width: '100%'
    //    });

    //    $row.find('.getQuestionList12').select2({
    //        placeholder: "انتخاب پاسخ",
    //        allowClear: true,
    //        width: '100%'
    //    });

    //    AjaxDatasourceList($row.find('.dataSourceItemsList12'), null);
    //    AjaxQuestionListForDataSource($row.find('.getQuestionList12'), null);
    //},

    //hide: function (deleteElement) {
    //    $(this).slideUp(deleteElement);
    //}
});




document.querySelectorAll(".add-condition-item-question-btn").forEach(function (el) {
    el.addEventListener("click", function (e) {
        e.preventDefault();
        addConditionForItemQuestionBtn();
    });
});

function addConditionForItemQuestionBtn() {
    let i = 0;
    var listItem = [];
    $('#MultipleChoiceRepeaterHint').remove();
    VotePackageDetailMultipleChoiceCondition: (function () {
        $('[data-repeater-item]').filter(function () { return $.trim($(this).find('.voteQuestionItemsList').val()) != "" })
            .each(function () {

                let nextVotePackageDetailId = $('.getQuestionList[name = "MultipleChoiceRepeater[' + i + '][selectQuestion]').val();
                let voteQuestionItemId = $('.voteQuestionItemsList[name = "MultipleChoiceRepeater[' + i + '][selectItems]"]').val();
                var exists = listItem.some(function (item) {
                    return item.VoteQuestionItemId === voteQuestionItemId && item.Index !== i;
                });
                if (exists) {
                    $(this).closest('[data-repeater-item]').remove();
                    $('#MultipleChoiceRepeaterHint').remove();
                    $('#MultipleChoiceRepeater').after('<div class="text-red" id="MultipleChoiceRepeaterHint" data-field="Title" data-validator="notEmpty">برای این پاسخ قبلا شرط تایین شده است!</div>');
                } else {
                    $('#MultipleChoiceRepeaterHint').remove();
                    listItem.push({
                        Index: i,
                        NextVotePackageDetailId: nextVotePackageDetailId,
                        VoteQuestionItemId: voteQuestionItemId

                    })
                }
                i++;
            })

        return listItem

    })();
}


document.querySelectorAll(".add-condition-item-dataSource-btn").forEach(function (el) {
    el.addEventListener("click", function (e) {
        e.preventDefault();
        addConditionForItemDataSource();
    });
});

function addConditionForItemDataSource() {
    var listItem = [];
    $('#MultipleChoiceRepeaterHint').remove();

    $('#MultipleChoiceRepeater12 [data-repeater-item]').each(function () {
        var $row = $(this);

        var dataSourceItemId = $row.find('.dataSourceItemsList12').val();
        var nextVotePackageDetailId = $row.find('.getQuestionList12').val();

        if (!dataSourceItemId) {
            return;
        }

        var exists = listItem.some(function (item) {
            return item.VoteQuestionItemId === dataSourceItemId;
        });

        if (exists) {
            $('#MultipleChoiceRepeaterHint').remove();
            $('#MultipleChoiceRepeater12').after(
                '<div class="text-red" id="MultipleChoiceRepeaterHint">برای این پاسخ قبلاً شرط تعیین شده است!</div>'
            );
            return;
        }

        listItem.push({
            NextVotePackageDetailId: nextVotePackageDetailId,
            VoteQuestionItemId: dataSourceItemId
        });
    });

    return listItem;
}



document.querySelectorAll(".add-condition-item-question-btn2").forEach(function (el) {
    el.addEventListener("click", function (e) {
        e.preventDefault();
        addConditionForItemQuestionBtn2();
    });
});

function addConditionForItemQuestionBtn2() {
    let i = 0;
    var listItem = [];
    VotePackageDetailMultipleChoiceCondition2: (function () {
        $('[data-repeater-item]').filter(function () { return $.trim($(this).find('.voteQuestionItemsList1_2').val()) != "" })
            .each(function () {

                let nextVotePackageDetailId = $('.getQuestionList1_2[name = "MultipleChoiceRepeater2[' + i + '][selectQuestion]').val();
                let voteQuestionItemId = $('.voteQuestionItemsList1_2[name = "SubMultipleChoiceRepeater2[' + i + '][selectItems]"]').val();


                listItem.push({
                    Index: i,
                    NextVotePackageDetailId: nextVotePackageDetailId,
                    VoteQuestionItemId: voteQuestionItemId,

                })

                i++;
            })


        return listItem

    })();
}

document.querySelectorAll(".add-condition-numeric-question-btn").forEach(function (el) {
    el.addEventListener("click", function (e) {
        e.preventDefault();
        addConditionForNumericQuestionBtn();
    });
});


function addConditionForNumericQuestionBtn(QuestionId) {

    var VotePackageDetailNumericCondition = [];
    VotePackageDetailNumericCondition: (function () {
        var listItem = [];

        $('[data-repeater-item]').filter(function () {
            return $.trim($(this).find('.LowerLimitNumericCondition').val()) != ""
        })
            .each(function () {

                var index = $(this).closest('[data-repeater-item]').index();

                listItem.push({
                    NextVotePackageDetailId: $('.getQuestionList3[name = "NumericRangeRepeater[' + index + '][getQuestionList3]').val(),

                    LowerLimitNumericCondition: $('.LowerLimitNumericCondition[name = "NumericRangeRepeater[' + index + '][LowerLimitNumericCondition]').val(),
                    UpperLimitNumericCondition: $('.UpperLimitNumericCondition[name = "NumericRangeRepeater[' + index + '][UpperLimitNumericCondition]').val(),

                })
            })


        return listItem

    })();
}

document.querySelectorAll(".add-condition-star-question-btn").forEach(function (el) {
    el.addEventListener("click", function (e) {
        e.preventDefault();
        addConditionForStarQuestionBtn();
    });
});


function addConditionForStarQuestionBtn(QuestionId) {

    var VotePackageDetailStarCondition = [];
    VotePackageDetailStarCondition: (function () {
        var listItem = [];

        $('[data-repeater-item]').filter(function () {
            return $.trim($(this).find('.LowerLimitStarCondition').val()) != ""
        })
            .each(function () {

                var index = $(this).closest('[data-repeater-item]').index();

                listItem.push({
                    NextVotePackageDetailId: $('.getQuestionList10[name = "StarRepeater[' + index + '][getQuestionList10]').val(),

                    LowerLimitNumericCondition: $('.LowerLimitStarCondition[name = "StarRepeater[' + index + '][LowerLimitStarCondition]').val(),
                    UpperLimitNumericCondition: $('.UpperLimitStarCondition[name = "StarRepeater[' + index + '][UpperLimitStarCondition]').val(),

                })
            })


        return listItem

    })();
}

document.querySelectorAll(".add-condition-range-question-btn").forEach(function (el) {
    el.addEventListener("click", function (e) {
        e.preventDefault();
        addConditionForRangeQuestionBtn();
    });
});

function addConditionForRangeQuestionBtn(QuestionId) {

    var VotePackageDetailRangeCondition = [];
    VotePackageDetailRangeCondition: (function () {
        var listItem = [];

        $('[data-repeater-item]').filter(function () {
            return $.trim($(this).find('.LowerLimitRangeCondition').val()) != ""
        })
            .each(function () {

                var index = $(this).closest('[data-repeater-item]').index();

                listItem.push({
                    NextVotePackageDetailId: $('.getQuestionList11[name = "RangeRepeater[' + index + '][getQuestionList11]').val(),

                    LowerLimitNumericCondition: $('.LowerLimitRangeCondition[name = "RangeRepeater[' + index + '][LowerLimitRangeCondition]').val(),
                    UpperLimitNumericCondition: $('.UpperLimitRangeCondition[name = "RangeRepeater[' + index + '][UpperLimitRangeCondition]').val(),

                })
            })


        return listItem

    })();
}

document.querySelectorAll(".add-condition-datetime-question-btn").forEach(function (el) {
    el.addEventListener("click", function (e) {
        e.preventDefault();
        addConditionForDateTimeQuestionBtn();
    });
});


function addConditionForDateTimeQuestionBtn(QuestionId) {
    var VotePackageDetailDateTimeCondition = [];
    VotePackageDetailDateTimeCondition: (function () {
        var listItem = [];
        var nameItem;
        // var index = $(this).closest('[data-repeater-item]').index();
        $('[data-repeater-item]').filter(function () { return $.trim($(this).find('.voteQuestionItemsList').val()) != "" })
            .each(function () {
                var index = $(this).closest('[data-repeater-item]').index();

                listItem.push({

                    NextVotePackageDetailId: $('.getQuestionList[name = "MultipleChoiceRepeater[' + index + '][selectQuestion]').val(),

                    VoteQuestionItemId: $('.voteQuestionItemsList[name = "MultipleChoiceRepeater[' + index + '][selectItems]"]').val()

                })
            })


        return listItem

    })();


}

var ConditionForm = document.getElementById("kt_modal_ConditionForm_form");
var ConditionAddBtn = document.getElementById("kt_modal_add_Condition_submit");



//ذخیره  شرط ها
ConditionAddBtn.addEventListener('click', function (e) {

    var NextDefaultQuestion = $("#ElseAnswearQuestion option:selected").val();
    var VoteQuestionIdInPackage = document.getElementById("VotePackageDetailGraphIdHidden").value;
    var typeQuestionforCase = document.getElementById("voteQuestionTypeId").value;


    if (typeQuestionforCase == '1') {

        if (MaxSelect > 1) {
            var VotePackageDetail = [];
            VotePackageDetail = (function () {
                var listItem = [];
                var SublistItem = [];
                $('#MultipleChoiceRepeater2 > [data-repeater-item]').filter(function () { return $.trim($(this).find('.voteQuestionItemsList1_2').val()) != "" }).each(function () {
                    var index = $(this).closest('[data-repeater-item]').index();
                    var ThisRow = $(this).closest('[data-repeater-item]');
                    SublistItem = [];


                    var SubRowitems = $(ThisRow).find('.inner-repeater [data-repeater-item]').length;

                    for (var Sub = 0; Sub < SubRowitems; Sub++) {
                        var item = $('.voteQuestionItemsList1_2[name = "MultipleChoiceRepeater2[' + index + '][SubMultipleChoiceRepeater2][' + Sub + '][selectItems]"]').val();
                        SublistItem.push({ 'VoteQuestionItemId': item });

                    }


                    listItem.push({
                        NextVotePackageDetailId: $('.getQuestionList1_2[name = "MultipleChoiceRepeater2[' + index + '][selectQuestion]').val(),
                        VoteQuestionItemId: '',
                        VotePackageDetailId: VoteQuestionIdInPackage,
                        AllOfItemsChosenCondition: $('.getIsAll[name = "MultipleChoiceRepeater2[' + index + '][selectIsAll]').val(),
                        LowerLimitNumericCondition: '',
                        UpperLimitNumericCondition: '',
                        LowerLimitDateCondition: '',
                        UpperLimitDateCondition: '',
                        IsDefault: 'false',
                        VotePackageDetailMultipleChoiceCondition: SublistItem


                    })
                });


                if (NextDefaultQuestion != 'None') {
                    listItem.push({
                        NextVotePackageDetailId: NextDefaultQuestion,
                        VoteQuestionItemsId: '',
                        VotePackageDetailId: VoteQuestionIdInPackage,
                        AllOfItemsChosenCondition: '',
                        LowerLimitNumericCondition: '',
                        UpperLimitNumericCondition: '',
                        LowerLimitDateCondition: '',
                        UpperLimitDateCondition: '',
                        IsDefault: 'true',
                        VotePackageDetailMultipleChoiceCondition: ''
                    })
                }
                return listItem

            })();

        } else {
            var VotePackageDetail = [];
            VotePackageDetail = (function () {
                var listItem = [];
                $('[data-repeater-item]').filter(function () { return $.trim($(this).find('.voteQuestionItemsList').val()) != "" })
                    .each(function () {
                        var index = $(this).closest('[data-repeater-item]').index();

                        var Oneitems = [];

                        var item = $('.voteQuestionItemsList[name = "MultipleChoiceRepeater[' + index + '][selectItems]"]').val();
                        Oneitems.push({ 'VoteQuestionItemId': item });


                        listItem.push({
                            NextVotePackageDetailId: $('.getQuestionList[name = "MultipleChoiceRepeater[' + index + '][selectQuestion]').val(),
                            VoteQuestionItemId: '',
                            VotePackageDetailId: VoteQuestionIdInPackage,
                            AllOfItemsChosenCondition: '',
                            LowerLimitNumericCondition: '',
                            UpperLimitNumericCondition: '',
                            LowerLimitDateCondition: '',
                            UpperLimitDateCondition: '',
                            IsDefault: 'false',
                            VotePackageDetailMultipleChoiceCondition: Oneitems
                        })
                    });

                if (NextDefaultQuestion != 'None') {
                    listItem.push({
                        NextVotePackageDetailId: NextDefaultQuestion,
                        VoteQuestionItemsId: '',
                        VotePackageDetailId: VoteQuestionIdInPackage,
                        AllOfItemsChosenCondition: '',
                        LowerLimitNumericCondition: '',
                        UpperLimitNumericCondition: '',
                        LowerLimitDateCondition: '',
                        UpperLimitDateCondition: '',
                        IsDefault: 'true',
                        VotePackageDetailMultipleChoiceCondition: ''
                    })
                }
                return listItem

            })();
        }


    }

    //عددی
    else if (typeQuestionforCase == '3') {
        var VotePackageDetail = [];
        var IsOk = '';
        $('.setMinMax ').removeClass('border-danger');
        VotePackageDetail = (function () {
            var listItem = [];
            $('[data-repeater-item]').filter(function () { return $.trim($(this).find('.getQuestionList3 ').val()) != "" })
                .each(function () {

                    var index = $(this).closest('[data-repeater-item]').index();

                    var LowerLimitNumericCheck = $('.LowerLimitNumericCondition[name="NumericRangeRepeater[' + index + '][LowerLimitNumericCondition]').val();
                    var UpperLimitNumericCheck = $('.UpperLimitNumericCondition[name="NumericRangeRepeater[' + index + '][UpperLimitNumericCondition]').val();
                    if (LowerLimitNumericCheck == '') {

                        $('.LowerLimitNumericCondition[name="NumericRangeRepeater[' + index + '][LowerLimitNumericCondition]').addClass('border-danger');
                        IsOk = falseContinu;
                    } else if (UpperLimitNumericCheck == '') {

                        $('.UpperLimitNumericCondition[name="NumericRangeRepeater[' + index + '][UpperLimitNumericCondition]').addClass('border-danger');
                        IsOk = falseContinu;

                    } else {
                        listItem.push({
                            NextVotePackageDetailId: $('.getQuestionList3[name = "NumericRangeRepeater[' + index + '][getQuestionList3]').val(),
                            VoteQuestionItemId: '',
                            VotePackageDetailId: VoteQuestionIdInPackage,
                            AllOfItemsChosenCondition: '',
                            LowerLimitNumericCondition: $('.LowerLimitNumericCondition[name = "NumericRangeRepeater[' + index + '][LowerLimitNumericCondition]').val(),
                            UpperLimitNumericCondition: $('.UpperLimitNumericCondition[name = "NumericRangeRepeater[' + index + '][UpperLimitNumericCondition]').val(),
                            LowerLimitDateCondition: '',
                            UpperLimitDateCondition: '',
                            IsDefault: 'false',
                            VotePackageDetailMultipleChoiceCondition: ''

                        })
                    }
                });

            if (NextDefaultQuestion != 'None') {
                listItem.push({
                    NextVotePackageDetailId: NextDefaultQuestion,
                    VoteQuestionItemsId: '',
                    VotePackageDetailId: VoteQuestionIdInPackage,
                    AllOfItemsChosenCondition: '',
                    LowerLimitNumericCondition: '',
                    UpperLimitNumericCondition: '',
                    LowerLimitDateCondition: '',
                    UpperLimitDateCondition: '',
                    IsDefault: 'true',
                    VotePackageDetailMultipleChoiceCondition: ''
                })
            }

            return listItem

        })();



    }
    else if (typeQuestionforCase == '4') {
        var VotePackageDetail = [];
        VotePackageDetail = (function () {
            var listItem = [];
            listItem.push({
                NextVotePackageDetailId: NextDefaultQuestion,
                VoteQuestionItemsId: '',
                VotePackageDetailId: VoteQuestionIdInPackage,
                AllOfItemsChosenCondition: '',
                LowerLimitNumericCondition: '',
                UpperLimitNumericCondition: '',
                LowerLimitDateCondition: '',
                UpperLimitDateCondition: '',
                IsDefault: 'true',
            })

            return listItem

        })();
    }
    else if (typeQuestionforCase == '5') {
        var VotePackageDetail = [];
        VotePackageDetail = (function () {
            var listItem = [];
            // $('[data-repeater-item]').filter(function () { return $.trim($(this).find('.getQuestionList5 ').val()) != "" })
            $('[data-repeater-item]').filter(function () {

                //return ($.trim($(this).find('.getQuestionList5 ').val()) != "")
                if (($(this).find('.getQuestionList5 ').val() != '') && ($(this).find('.UpperLimitDateItemValue ').val()) && ($(this).find('.LowerLimitDateItemValue ').val())) {
                    return true;
                };
            })
                .each(function () {
                    var index = $(this).closest('[data-repeater-item]').index();

                    listItem.push({
                        NextVotePackageDetailId: $('.getQuestionList5[name = "DateTimeRepeater[' + index + '][selectQuestion5]').val(),
                        VoteQuestionItemId: '',
                        VotePackageDetailId: VoteQuestionIdInPackage,
                        AllOfItemsChosenCondition: '',
                        LowerLimitNumericCondition: '',
                        UpperLimitNumericCondition: '',
                        LowerLimitDateCondition: $('.LowerLimitDateItemValue[name = "DateTimeRepeater[' + index + '][LowerLimitDateItemValue]').val(),
                        UpperLimitDateCondition: $('.UpperLimitDateItemValue[name = "DateTimeRepeater[' + index + '][UpperLimitDateItemValue]').val(),
                        LowerLimitDateConditionString: $('.LowerLimitDateItemValue[name = "DateTimeRepeater[' + index + '][LowerLimitDateItemValue]').val(),
                        UpperLimitDateConditionString: $('.UpperLimitDateItemValue[name = "DateTimeRepeater[' + index + '][UpperLimitDateItemValue]').val(),
                        IsDefault: 'false',

                    })
                });
            if (NextDefaultQuestion != 'None') {
                listItem.push({
                    NextVotePackageDetailId: NextDefaultQuestion,
                    VoteQuestionItemsId: '',
                    VotePackageDetailId: VoteQuestionIdInPackage,
                    AllOfItemsChosenCondition: '',
                    LowerLimitNumericCondition: '',
                    UpperLimitNumericCondition: '',
                    LowerLimitDateCondition: '',
                    UpperLimitDateCondition: '',
                    IsDefault: 'true',
                })

            }
            return listItem

        })();
    }
    else if (typeQuestionforCase == '6') {

        var VotePackageDetail = [];
        VotePackageDetail = (function () {
            var listItem = [];
            listItem.push({
                NextVotePackageDetailId: NextDefaultQuestion,
                VoteQuestionItemsId: '',
                VotePackageDetailId: VoteQuestionIdInPackage,
                AllOfItemsChosenCondition: '',
                LowerLimitNumericCondition: '',
                UpperLimitNumericCondition: '',
                LowerLimitDateCondition: '',
                UpperLimitDateCondition: '',
                IsDefault: 'true',
            })
            return listItem

        })();
    }
    else if (typeQuestionforCase == '10') {
        var VotePackageDetail = [];

        VotePackageDetail = (function () {
            var listItem = [];
            var IsOk = '';
            $('.setMinMaxStar ').removeClass('border-danger');
            $('[data-repeater-item]').filter(function () { return $.trim($(this).find('.getQuestionList10').val()) != "" })
                .each(function () {
                    var index = $(this).closest('[data-repeater-item]').index();

                    var LowerLimitStarCheck = $('.LowerLimitStarCondition[name="StarRepeater[' + index + '][LowerLimitStarCondition]').val();
                    var UpperLimitStarCheck = $('.UpperLimitStarCondition[name="StarRepeater[' + index + '][UpperLimitStarCondition]').val();
                    if (LowerLimitStarCheck == '') {

                        $('.LowerLimitStarCondition[name="StarRepeater[' + index + '][LowerLimitStarCondition]').addClass('border-danger');
                        IsOk = falseContinu;
                    } else if (UpperLimitStarCheck == '') {

                        $('.UpperLimitStarCondition[name="StarRepeater[' + index + '][UpperLimitStarCondition]').addClass('border-danger');
                        IsOk = falseContinu;



                    } else {
                        listItem.push({
                            NextVotePackageDetailId: $('.getQuestionList10[name = "StarRepeater[' + index + '][getQuestionList10]').val(),
                            VoteQuestionItemId: '',
                            VotePackageDetailId: VoteQuestionIdInPackage,
                            AllOfItemsChosenCondition: '',
                            LowerLimitNumericCondition: $('.LowerLimitStarCondition[name = "StarRepeater[' + index + '][LowerLimitStarCondition]').val(),
                            UpperLimitNumericCondition: $('.UpperLimitStarCondition[name = "StarRepeater[' + index + '][UpperLimitStarCondition]').val(),
                            LowerLimitDateCondition: '',
                            UpperLimitDateCondition: '',
                            IsDefault: 'false',

                        })
                    }
                });
            if (NextDefaultQuestion != 'None') {
                listItem.push({
                    NextVotePackageDetailId: NextDefaultQuestion,
                    VoteQuestionItemsId: '',
                    VotePackageDetailId: VoteQuestionIdInPackage,
                    AllOfItemsChosenCondition: '',
                    LowerLimitNumericCondition: '',
                    UpperLimitNumericCondition: '',
                    LowerLimitDateCondition: '',
                    UpperLimitDateCondition: '',
                    IsDefault: 'true',
                })
            }
            return listItem

        })();

    }
    else if (typeQuestionforCase == '11') {
        var VotePackageDetail = [];

        VotePackageDetail = (function () {
            var listItem = [];
            var IsOk = '';
            $('.setMinMaxRange').removeClass('border-danger');

            $('[data-repeater-item]').filter(function () { return $.trim($(this).find('.getQuestionList11').val()) != "" })
                .each(function () {
                    var index = $(this).closest('[data-repeater-item]').index();

                    var LowerLimitNumericCheck = $('.LowerLimitRangeCondition[name="RangeRepeater[' + index + '][LowerLimitRangeCondition]').val();
                    var UpperLimitNumericCheck = $('.UpperLimitRangeCondition[name="RangeRepeater[' + index + '][UpperLimitRangeCondition]').val();

                    if (LowerLimitNumericCheck == '') {

                        $('.LowerLimitRangeCondition[name="RangeRepeater[' + index + '][LowerLimitRangeCondition]').addClass('border-danger');
                        IsOk = falseContinu;

                    } else if (UpperLimitNumericCheck == '') {

                        $('.UpperLimitRangeCondition[name="RangeRepeater[' + index + '][UpperLimitRangeCondition]').addClass('border-danger');
                        IsOk = falseContinu;

                    } else {
                        listItem.push({
                            NextVotePackageDetailId: $('.getQuestionList11[name = "RangeRepeater[' + index + '][getQuestionList11]').val(),
                            VoteQuestionItemId: '',
                            VotePackageDetailId: VoteQuestionIdInPackage,
                            AllOfItemsChosenCondition: '',
                            LowerLimitNumericCondition: $('.LowerLimitRangeCondition[name = "RangeRepeater[' + index + '][LowerLimitRangeCondition]').val(),
                            UpperLimitNumericCondition: $('.UpperLimitRangeCondition[name = "RangeRepeater[' + index + '][UpperLimitRangeCondition]').val(),
                            LowerLimitDateCondition: '',
                            UpperLimitDateCondition: '',
                            IsDefault: 'false',

                        })
                    }
                });
            if (NextDefaultQuestion != 'None') {
                listItem.push({
                    NextVotePackageDetailId: NextDefaultQuestion,
                    VoteQuestionItemsId: '',
                    VotePackageDetailId: VoteQuestionIdInPackage,
                    AllOfItemsChosenCondition: '',
                    LowerLimitNumericCondition: '',
                    UpperLimitNumericCondition: '',
                    LowerLimitDateCondition: '',
                    UpperLimitDateCondition: '',
                    IsDefault: 'true',
                })
            }
            return listItem

        })();

    } else if (typeQuestionforCase == '12') {
        var VotePackageDetail = [];
        VotePackageDetail = (function () {
            var listItem = [];
            $('#MultipleChoiceRepeater12 [data-repeater-item]').filter(function () { return $.trim($(this).find('.dataSourceItemsList12').val()) != "" })
                .each(function () {
                    var index = $(this).closest('[data-repeater-item]').index();

                    var Oneitems = [];

                    var item = $('.dataSourceItemsList12[name = "MultipleChoiceRepeater12[' + index + '][selectItems]"]').val();

                    Oneitems.push({ 'dataSourceItemId': item });


                    listItem.push({
                        NextVotePackageDetailId: $('.getQuestionList12[name = "MultipleChoiceRepeater12[' + index + '][selectQuestion]"]').val(),
                        DataSourceItemId: '',
                        VotePackageDetailId: VoteQuestionIdInPackage,
                        AllOfItemsChosenCondition: '',
                        LowerLimitNumericCondition: '',
                        UpperLimitNumericCondition: '',
                        LowerLimitDateCondition: '',
                        UpperLimitDateCondition: '',
                        IsDefault: 'false',
                        VotePackageDetailMultipleChoiceCondition: Oneitems
                    })
                });

            if (NextDefaultQuestion != 'None') {
                listItem.push({
                    NextVotePackageDetailId: NextDefaultQuestion,
                    DataSourceItemId: '',
                    VotePackageDetailId: VoteQuestionIdInPackage,
                    AllOfItemsChosenCondition: '',
                    LowerLimitNumericCondition: '',
                    UpperLimitNumericCondition: '',
                    LowerLimitDateCondition: '',
                    UpperLimitDateCondition: '',
                    IsDefault: 'true',
                    VotePackageDetailMultipleChoiceCondition: ''
                })
            }
            return listItem

        })();

    } else if (typeQuestionforCase == '13') {

        var VotePackageDetail = [];

        VotePackageDetail = (function () {

            var listItem = [];


            if (
                NextDefaultQuestion != 'None' &&
                NextDefaultQuestion != null &&
                NextDefaultQuestion != ''
            ) {

                listItem.push({

                    NextVotePackageDetailId:
                        NextDefaultQuestion,

                    VoteQuestionItemId:
                        '',

                    DataSourceItemId:
                        '',

                    VotePackageDetailId:
                        VoteQuestionIdInPackage,

                    AllOfItemsChosenCondition:
                        '',

                    LowerLimitNumericCondition:
                        '',

                    UpperLimitNumericCondition:
                        '',

                    LowerLimitDateCondition:
                        '',

                    UpperLimitDateCondition:
                        '',

                    IsDefault:
                        'true',

                    VotePackageDetailMultipleChoiceCondition:
                        ''
                });

            }


            return listItem;

        })();

    } else if (
        typeQuestionforCase == '14'
    ) {

        var VotePackageDetail = [];

        VotePackageDetail = (function () {

            var listItem = [];


            if (
                NextDefaultQuestion != 'None' &&
                NextDefaultQuestion != null &&
                NextDefaultQuestion != ''
            ) {

                listItem.push({

                    NextVotePackageDetailId:
                        NextDefaultQuestion,

                    VoteQuestionItemId:
                        '',

                    DataSourceItemId:
                        '',

                    VotePackageDetailId:
                        VoteQuestionIdInPackage,

                    AllOfItemsChosenCondition:
                        '',

                    LowerLimitNumericCondition:
                        '',

                    UpperLimitNumericCondition:
                        '',

                    LowerLimitDateCondition:
                        '',

                    UpperLimitDateCondition:
                        '',

                    IsDefault:
                        'true',

                    VotePackageDetailMultipleChoiceCondition:
                        ''
                });
            }


            return listItem;

        })();
    } else if (
    typeQuestionforCase == '15'
) {

    var VotePackageDetail = [];

    VotePackageDetail = (function () {

        var listItem = [];


        if (
            NextDefaultQuestion != 'None' &&
            NextDefaultQuestion != null &&
            NextDefaultQuestion != ''
        ) {

            listItem.push({

                NextVotePackageDetailId:
                    NextDefaultQuestion,

                VoteQuestionItemId:
                    '',

                DataSourceItemId:
                    '',

                VotePackageDetailId:
                    VoteQuestionIdInPackage,

                AllOfItemsChosenCondition:
                    '',

                LowerLimitNumericCondition:
                    '',

                UpperLimitNumericCondition:
                    '',

                LowerLimitDateCondition:
                    '',

                UpperLimitDateCondition:
                    '',

                IsDefault:
                    'true',

                VotePackageDetailMultipleChoiceCondition:
                    ''
            });

        }


        return listItem;

    })();

}



    $.ajax({

        type: "POST",
        dataType: "JSON",

        url: "/VotePackageDetailGraph/CreateVotePackageDetailGraph",

        data: {
            VotePackageDetailGraphs: VotePackageDetail
        },

        beforeSend: function (xhr) {

            xhr.setRequestHeader(
                "RequestVerificationToken",
                $('input[name="__RequestVerificationToken"]').val()
            );
        },

        success: function (response) {

            if (response.success) {

                const message =
                    response?.message ??
                    response?.successMessage ??
                    "با موفقیت انجام شد";


                /*
                 * اگر Backend Warning برگردانده باشد
                 * ذخیره موفق است ولی باید با آیکون هشدار نمایش داده شود.
                 */
                const hasWarning =
                    response?.message &&
                    response.message
                        .trim()
                        .startsWith("هشدار");


                Swal.fire({

                    text: message,

                    icon: hasWarning
                        ? "warning"
                        : "success",

                    buttonsStyling: false,

                    confirmButtonText: "بستن",

                    customClass: {
                        confirmButton: "btn btn-confirmPage"
                    }

                }).then((result) => {

                    if (result.isConfirmed) {

                        $("#kt_modal_condition")
                            .modal("hide");

                        loadQuestionForVotePackage();
                    }

                });

            } else {

                const errorMessage =
                    response?.operationErrors?.[0]?.description ??
                    response?.validationErrors?.[0]?.errorMessage ??
                    response?.message ??
                    response?.data ??
                    "خطایی رخ داده است!";


                Swal.fire({

                    text: errorMessage,

                    icon: "warning",

                    buttonsStyling: false,

                    confirmButtonText: "تایید",

                    customClass: {
                        confirmButton: "btn btn-confirmPage"
                    }

                });
            }

        },

        error: function () {

            Swal.fire({

                text: "خطا ! لطفا با ادمین سیستم تماس بگیرید",

                icon: "error",

                buttonsStyling: false,

                confirmButtonText: "بستن",

                customClass: {
                    confirmButton: "btn btn-confirmPage"
                }

            });

        }

    });


});



document.querySelectorAll(".add-choice-condition-btn").forEach(function (el) {
    el.addEventListener("click", function (e) {
        e.preventDefault();

        const id = this.dataset.id;
        const conditionId = this.dataset.conditionId;

        addChoiceForCondition(id, conditionId);
    });
});



function addChoiceForCondition(rowMain, ItemsSub) {
    ItemsSub++;

    //var subRow = $('.innerAdd-' + rowMain + '').children('[data-repeater-item]').length;

    // if (subRow < MaxSelect2 || ItemsSub == undefined) {

    $('.innerAdd-' + rowMain + ' a').remove();

    //  var indexRow = $(this).closest(['data-repeater-item']).index();

    $('.innerAdd-' + rowMain + '').append('<div data-repeater-item=""><div class="item-col"><div class="input-group flex-nowrap"><span class="input-group-text">پاسخ</span><div class="overflow-hidden d-flex flex-grow-1"><select class="form-select rounded-start-0 voteQuestionItemsList1_2" id="voteQuestionItemsList1_2" name="MultipleChoiceRepeater2[' +
        rowMain + '][SubMultipleChoiceRepeater2][' +
        ItemsSub + '][selectItems]" data-kt-repeater="voteQuestionItemsList1_2" data-control="select2" data-placeholder="انتخاب گزینه های سوال"> </select><button class="btnMines btn btn-icon btn-light-danger" data-repeater-delete="" type="button"><span class="svg-icon svg-icon-muted svg-icon-2hx"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">&lt; rect opacity = "0.3" x = "2" y = "2" width = "20" height = "20" rx = "5" fill = "black" /&gt;<rect x="6.0104" y="10.9247" width="12" height="2" rx="1" fill="black"></rect></svg></span></button></div></div></div></div > '
    );


    AddListItems(rowMain, ItemsSub)

    $('.innerAdd-' + rowMain).append('<a href="javascript:;" data-repeater-create class="btn form-group btn-icon btn-light-primary float-end mb-5 btn-primary addChoiceForConditionBtn" data-row-main="' + rowMain + '"data-count-items-sub="' + CountItemsSub + '" title="افزودن گزینه"><span class="svg-icon svg-icon-muted svg-icon-2hx"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">< rect opacity = "0.3" x = "2" y = "2" width = "20" height = "20" rx = "5" fill = "black" /><rect x="10.8891" y="17.8033" width="12" height="2" rx="1" transform="rotate(-90 10.8891 17.8033)" fill="black"/><rect x="6.01041" y="10.9247" width="12" height="2" rx="1" fill="black"/></svg ></span ></a>');


    document.querySelectorAll(".addChoiceForConditionBtn").forEach(function (btn) {

        if (btn.dataset.bound === "true") return; // جلوگیری از دوباره bind شدن

        btn.dataset.bound = "true";

        btn.addEventListener("click", function (e) {
            e.preventDefault();

            const rowMain = this.dataset.rowMain;
            const countItemsSub = this.dataset.countItemsSub;

            addChoiceForCondition(rowMain, countItemsSub);
        });

    });
    //  }
    //else {
    //    Swal.fire({
    //        text: 'تعداد آیتم های برای ان سوال نباید بیشتر از ' + MaxSelect + ' باشد.',
    //        icon: "warning",
    //        buttonsStyling: !1,
    //        confirmButtonText: "بستن",
    //        customClass: { confirmButton: "btn btn-confirmPage" },

    //    });

    //}

}

$(document).ready(function () {
    let page = 1;
    let page2 = 1;
    let page3 = 1;
    let isLastPage = false;
    let isLastPage2 = false;
    let isLastPage3 = false;
    let searchTerm;
    let searchTerm2;
    let searchTerm3;

    function ResetVariables2() {
        page = 1;
        page2 = 1;
        page3 = 1;
        searchTerm = '';
        searchTerm2 = '';
        searchTerm3 = '';
        isLastPage = false;
        isLastPage2 = false;
        isLastPage3 = false;
    }

    function appendOptions(data, searchTerm, pageNumber) {
        if ((searchTerm !== undefined || searchTerm !== '') && pageNumber === 1) {//با هر بار جستجوی جدید یکبار محتوا ریست میگردد
            $('#VoteQuestionGroupId').empty().trigger('change');
        }

        let scrollTop = 0;
        let select2Dropdown2 = $('.select2-results__options');

        scrollTop = select2Dropdown2.scrollTop();
        $('#VoteQuestionGroupId').select2({ dropdownParent: $('#kt_modal_add_question') });
        var option = new Option('', '', false, false);
        $('#VoteQuestionGroupId').append(option);
        data.forEach(item => {
            var option = new Option(item.title, item.voteQuestionGroupId, false, false);
            $('#VoteQuestionGroupId').append(option);
        });
        $('#VoteQuestionGroupId').select2({ dropdownParent: $('#kt_modal_add_question') }).trigger('change');
        $('#VoteQuestionGroupId').select2('open');
        select2Dropdown2 = $('.select2-results__options');
        let select2DropdownSearch2 = $('.select2-search__field');
        select2DropdownSearch2.val(searchTerm);//حفظ متن داخل سرچ بار
        select2Dropdown2.scrollTop(scrollTop);
    }
    //*
    function appendOptions2(data, searchTerm, pageNumber) {
        if ((searchTerm !== undefined || searchTerm !== '') && pageNumber === 1) {//با هر بار جستجوی جدید یکبار محتوا ریست میگردد
            $('#SubVoteQuestionGroupId').empty().trigger('change');
        }
        let scrollTop = 0;
        let select2Dropdown2 = $('.select2-results__options');

        scrollTop = select2Dropdown2.scrollTop();
        $('#SubVoteQuestionGroupId').select2({ dropdownParent: $('#kt_modal_add_question') });
        $('#SubVoteQuestionGroupId').select2();
        var option = new Option('', '', false, false);
        $('#SubVoteQuestionGroupId').append(option);
        data.forEach(item => {
            var option = new Option(item.title, item.voteQuestionGroupId, false, false);
            $('#SubVoteQuestionGroupId').append(option);
        });
        $('#SubVoteQuestionGroupId').select2({ dropdownParent: $('#kt_modal_add_question') }).trigger('change');
        $('#SubVoteQuestionGroupId').select2('open');
        select2Dropdown2 = $('.select2-results__options');
        let select2DropdownSearch2 = $('.select2-search__field');
        select2DropdownSearch2.val(searchTerm);//حفظ متن داخل سرچ بار
        select2Dropdown2.scrollTop(scrollTop);
    }

    function appendOptions3(data, searchTerm, pageNumber) {
        if ((searchTerm !== undefined || searchTerm !== '') && pageNumber === 1) {//با هر بار جستجوی جدید یکبار محتوا ریست میگردد
            $('#AllQuestionByVoteQuestionGroupId').empty().trigger('change');
        }
        let scrollTop = 0;
        let select2Dropdown2 = $('.select2-results__options');

        scrollTop = select2Dropdown2.scrollTop();
        $('#AllQuestionByVoteQuestionGroupId').select2({ dropdownParent: $('#kt_modal_add_question') });
        $('#AllQuestionByVoteQuestionGroupId').select2();
        var option = new Option('', '', false, false);
        $('#AllQuestionByVoteQuestionGroupId').append(option);
        data.forEach(item => {
            var option = new Option(item.title, item.voteQuestionId, false, false);
            $('#AllQuestionByVoteQuestionGroupId').append(option);
        });
        $('#AllQuestionByVoteQuestionGroupId').select2({ dropdownParent: $('#kt_modal_add_question') }).trigger('change');
        $('#AllQuestionByVoteQuestionGroupId').select2('open');
        select2Dropdown2 = $('.select2-results__options');
        let select2DropdownSearch2 = $('.select2-search__field');
        select2DropdownSearch2.val(searchTerm);//حفظ متن داخل سرچ بار
        select2Dropdown2.scrollTop(scrollTop);
    }
    //*

    function loadData(pageNumber, searchTerm) {

        $('.loading').show();

        $.ajax({
            type: "GET",
            dataType: 'JSOn',
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
                for (var i = 0; i < data.length; i++) {
                    var WellComeMessageLimit = (data[i].message).substring(0, 160);
                    var countText = data[i].message.length
                    if (countText > 160) {
                        WellComeMessageLimit += '...'
                    }

                }

                appendOptions(data, searchTerm, pageNumber);
            },
            error: function (jqXHR, textStatus, errorThrown) {
                $('.loading').hide();

            }
        });
    }
    //*
    function loadData2(pageNumber, searchTerm) {

        $('.loading').show();

        $.ajax({
            type: "GET",
            dataType: 'JSOn',
            url: '/VoteQuestionGroup/GetAllVoteQuestionGroupParentById',
            data: {
                page: pageNumber,
                title: searchTerm,
                parentid: SelectedParentId
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


            }
        });
    }
    //*

    //*
    function loadData3(pageNumber, searchTerm) {
        $('.loading').show();

        var keywords = tagify.value.map(tag => tag.value);
        var keywordparams = keywords.length > 1 ? keywords.join(',') : keywords[0];
        if (isGroupSearch != true) {
            SelectedSubQuestionId = 0;
        }

        $.ajax({
            type: "POST",
            dataType: 'json',
            url: '/VoteQuestion/GetAllVoteQuestionByVoteQuestionGroupId',
            data: {
                page: pageNumber,
                title: searchTerm,
                keyword: keywordparams,
                voteQuestionGroupId: SelectedSubQuestionId
            }, beforeSend: function (xhr) {
                xhr.setRequestHeader("RequestVerificationToken", $('input[name="__RequestVerificationToken"]').val());
            },
            delay: 500,//ایجاد تاخیر جهت کاهش فشار در بکاند
            success: function (data) {
                $('.loading').hide();

                if (data.length === 0) {//تایین به اخر رسیدن نتایج برای اینکه درخواست های اضافی سمت سرور نرود
                    isLastPage3 = true;
                } else {
                    isLastPage3 = false;
                }

                appendOptions3(data, searchTerm, pageNumber);

            },
            error: function (jqXHR, textStatus, errorThrown) {
                $('.loading').hide();


            }
        });
    }
    //* 

    $('#VoteQuestionGroupId').select2({
        dropdownParent: $('#kt_modal_add_question')
    });
    $('#SubVoteQuestionGroupId').select2({
        dropdownParent: $('#kt_modal_add_question')
    });
    $('#AllQuestionByVoteQuestionGroupId').select2({
        dropdownParent: $('#kt_modal_add_question')
    });
    $('#kt_modal_add_question').on('shown.bs.modal', function () {//برای ایجاد
        $('#VoteQuestionGroupId').on('select2:open', function () {
            $('#SubVoteQuestionGroupId').select2('close');
            $('#AllQuestionByVoteQuestionGroupId').select2('close');
            let select2Dropdown = $('.select2-results__options');
            let srch = $('.select2-search__field');
            srch.val(searchTerm);//حفظ متن سرچ بار بعد از باز و بسته شدن دارپ داون
            srch.on('input', function (e) {
                srch.prop('disabled', true);
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
        });//
        $('#SubVoteQuestionGroupId').on('select2:open', function (e) {
            $('#VoteQuestionGroupId').select2('close');
            $('#AllQuestionByVoteQuestionGroupId').select2('close');
            let select2Dropdown = $('.select2-results__options');
            let srch = $('.select2-search__field');
            srch.val(searchTerm2);//حفظ متن سرچ بار بعد از باز و بسته شدن دارپ داون
            srch.on('input', function (e) {
                srch.prop('disabled', true);
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
        });//
        $('#AllQuestionByVoteQuestionGroupId').on('select2:open', function () {
            $('#VoteQuestionGroupId').select2('close');
            $('#SubVoteQuestionGroupId').select2('close');
            let select2Dropdown = $('.select2-results__options');
            let srch = $('.select2-search__field');
            srch.val(searchTerm3);//حفظ متن سرچ بار بعد از باز و بسته شدن دارپ داون
            srch.on('input', function (e) {
                srch.prop('disabled', true);
                var srchtrm = $(this).val();
                loadData3(1, srchtrm);
                searchTerm3 = srchtrm;//حفظ متن مورد جستجو جهت اسکرول های بعدی
                page3 = 1;//ریست کردن شماره صفحه با هر بار جستجوی جدید-مورد نیاز برای اسکرول کردن
            });
            select2Dropdown.off('scroll').on('scroll', function () {
                if (!isLastPage3 && select2Dropdown[0].scrollHeight - select2Dropdown.scrollTop() <= select2Dropdown.outerHeight()) {
                    page3++;
                    loadData3(page3, searchTerm3);
                }
            });
        });//

    });
    //$('#kt_modal_add_question').on('shown.bs.modal', function () {//برای ایجاد
    //    isLastPage = false;
    //    page = 1;
    //    $('#VoteQuestionGroupId').select2({
    //        dropdownParent: $('#kt_modal_add_question')
    //    }).on('select2:open', function () {
    //        $('#SubVoteQuestionGroupId').select2('close');
    //        $('#AllQuestionByVoteQuestionGroupId').select2('close');
    //        let select2Dropdown = $('.select2-results__options');
    //        let srch = $('.select2-search__field');
    //        srch.val(searchTerm);//حفظ متن سرچ بار بعد از باز و بسته شدن دارپ داون
    //        srch.on('input', function (e) {
    //            srch.prop('disabled', true);
    //            var srchtrm = $(this).val();
    //            loadData(1, srchtrm);
    //            searchTerm = srchtrm;//حفظ متن مورد جستجو جهت اسکرول های بعدی
    //            page = 1;//ریست کردن شماره صفحه با هر بار جستجوی جدید-مورد نیاز برای اسکرول کردن
    //        });
    //        select2Dropdown.off('scroll').on('scroll', function () {
    //            if (!isLastPage && select2Dropdown[0].scrollHeight - select2Dropdown.scrollTop() <= select2Dropdown.outerHeight()) {
    //                page++;
    //                loadData(page, searchTerm);
    //            }
    //        });
    //    });

    //});

    //$('#kt_modal_add_question').on('shown.bs.modal', function () {//برای ایجاد
    //    isLastPage2 = false;
    //    page2 = 1;
    //    $('#SubVoteQuestionGroupId').select2({
    //        dropdownParent: $('#kt_modal_add_question')
    //    }).on('select2:open', function () {
    //        $('#VoteQuestionGroupId').select2('close');
    //        $('#AllQuestionByVoteQuestionGroupId').select2('close');
    //        let select2Dropdown = $('.select2-results__options');
    //        let srch = $('.select2-search__field');
    //        srch.val(searchTerm2);//حفظ متن سرچ بار بعد از باز و بسته شدن دارپ داون
    //        srch.on('input', function (e) {
    //            srch.prop('disabled', true);
    //            var srchtrm = $(this).val();
    //            loadData2(1, srchtrm);
    //            searchTerm2 = srchtrm;//حفظ متن مورد جستجو جهت اسکرول های بعدی
    //            page2 = 1;//ریست کردن شماره صفحه با هر بار جستجوی جدید-مورد نیاز برای اسکرول کردن
    //        });
    //        select2Dropdown.off('scroll').on('scroll', function () {
    //            if (!isLastPage2 && select2Dropdown[0].scrollHeight - select2Dropdown.scrollTop() <= select2Dropdown.outerHeight()) {
    //                page2++;
    //                loadData2(page2, searchTerm2);
    //            }
    //        });
    //    });

    //});


    //$('#kt_modal_add_question').on('shown.bs.modal', function () {//برای ایجاد
    //    isLastPage3 = false;
    //    page3 = 1;
    //    $('#AllQuestionByVoteQuestionGroupId').select2({
    //        dropdownParent: $('#kt_modal_add_question')
    //    }).on('select2:open', function () {
    //        $('#VoteQuestionGroupId').select2('close');
    //        $('#SubVoteQuestionGroupId').select2('close');
    //        let select2Dropdown = $('.select2-results__options');
    //        let srch = $('.select2-search__field');
    //        srch.val(searchTerm3);//حفظ متن سرچ بار بعد از باز و بسته شدن دارپ داون
    //        srch.on('input', function (e) {
    //            srch.prop('disabled', true);
    //            var srchtrm = $(this).val();
    //            loadData3(1, srchtrm);
    //            searchTerm3 = srchtrm;//حفظ متن مورد جستجو جهت اسکرول های بعدی
    //            page3 = 1;//ریست کردن شماره صفحه با هر بار جستجوی جدید-مورد نیاز برای اسکرول کردن
    //        });
    //        select2Dropdown.off('scroll').on('scroll', function () {
    //            if (!isLastPage3 && select2Dropdown[0].scrollHeight - select2Dropdown.scrollTop() <= select2Dropdown.outerHeight()) {
    //                page3++;
    //                loadData3(page3, searchTerm3);
    //            }
    //        });
    //    });

    //});


    $('#kt_modal_add_question').on('hidden.bs.modal', function () {
        $('#VoteQuestionGroupId').off('select2:open').empty();
        $('#SubVoteQuestionGroupId').off('select2:open').empty();
        $('#AllQuestionByVoteQuestionGroupId').off('select2:open').empty();
        ResetVariables2();
        //بازسازی تمامی متغیر ها برای شروع مجدد
    });
});
function ValidateNumberofQsetionInput(input) {
    if (input.value < 0 || input.value > 999) {
        input.value = '';
    }

    input.value = input.value.slice(0, 500);
    // Remove leading zeros
    if (input.value.length > 1 && input.value[0] === '0') {
        input.value = parseInt(input.value, 10);
    }
}

document.querySelectorAll(".validate-limit-chosen").forEach(function (el) {
    el.addEventListener("focus", function () {
        ValidateLowerLimitedInput(this);
    });
});

function ValidateLowerLimitedInput(input) {
    if (input.value < 0 || input.value > 99) {
        input.value = '';
    }

    input.value = input.value.slice(0, 10);
    // Remove leading zeros
    if (input.value.length > 1 && input.value[0] === '0') {
        input.value = parseInt(input.value, 10);
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
        if (tagData.value.length > maxCharLength) {
            showErrorMessage(`حداکثر طول برچسب ${maxCharLength} کاراکتر است.`);
            return false;
        }
        hideErrorMessage();
        return true;
    }
});

// Add event listeners for tag changes
tagify.on('add', GetAllVoteQuestionByKeyword);
tagify.on('remove', GetAllVoteQuestionByKeyword);

// Function to clear all tags
function clearTags() {
    tagify.removeAllTags();
}
function showErrorMessage(message) {
    errorMessage.innerText = message;
    errorMessage.classList.add('display-block');
    errorMessage.classList.remove('display-none');
}

function hideErrorMessage() {
    errorMessage.classList.add('display-none');
    errorMessage.classList.remove('display-block');
}

function GetAllVoteQuestionByKeyword(e) {
    isGroupSearch = false;
    // Extract tags from the Tagify input
    var keywords = tagify.value.map(tag => tag.value);

    // Check if there are any keywords
    if (keywords.length === 0) {
        $('#AllQuestionByVoteQuestionGroupId').empty();
        return;
    }

    // Join keywords if multiple, or use single keyword
    var keyword = keywords.length > 1 ? keywords.join(',') : keywords[0];

    $.ajax({
        type: "POST",
        dataType: 'json',
        url: '/VoteQuestion/GetAllVoteQuestionByVoteQuestionGroupId',
        data: {
            Keyword: keyword
        },
        beforeSend: function (xhr) {
            xhr.setRequestHeader("RequestVerificationToken", $('input[name="__RequestVerificationToken"]').val());
        },
        success: function (data) {
            $('#AllQuestionByVoteQuestionGroupId').empty();

            if (data.length > 0) {
                for (var i = 0; i < data.length; i++) {
                    var itemType = new Option(data[i].title, data[i].voteQuestionId, false, false);
                    $("#AllQuestionByVoteQuestionGroupId").append(itemType);
                }
                $("#AllQuestionByVoteQuestionGroupId").prepend('<option selected="selected" disabled="disabled" value="None">عنوان انتخاب سوال را انتخاب نمایید</option>');
            } else {
                $('#AllQuestionByVoteQuestionGroupId').empty();
            }
        },
        error: function (xhr, status, error) {
            console.error('Error fetching vote questions:', error);
        }
    });
}


jalaliDatepicker.startWatch({
    zIndex: '9999',
});
// Validate Step 4 - at least one item selected across all tabs
function validateStep4() {
    // Check if any employees selected
    const hasEmployees = selectedPersonnelCodes && selectedPersonnelCodes.length > 0;

    // Check if any organizations selected
    const hasOrganizations = selectedOrganizationCodes && selectedOrganizationCodes.length > 0;

    // Check if any organization structures (roles) selected
    const hasStructures = selectedOrganizationStructureCodes && selectedOrganizationStructureCodes.length > 0;

    // Return true if at least one item is selected from any tab
    return hasEmployees || hasOrganizations || hasStructures;
}




$(document).on(
    "click",
    "#Accept_Question_Section_Btn",
    function () {

        const title =
            $("#VotePackageSectionTitle")
                .val()
                .trim();

        if (!title) {

            $("#VotePackageSectionTitleError")
                .removeClass("d-none");

            return;
        }

        $("#VotePackageSectionTitleError")
            .addClass("d-none");


        createCompositionQuestion(title);


        $("#VotePackageSectionTitle")
            .val("");


        $("#kt_modal_add_question_section")
            .modal("hide");


        addInDropItems({
            result:
                currentVotePackageDetails
        });

    }
);


$("#kt_modal_add_question_section").on(
    "shown.bs.modal",
    function () {

        initCompositionQuestionSelect();

        $("#CreateCompositionBox")
            .addClass("d-none");

        $("#NewCompositionTitle")
            .val("");

        $("#NewCompositionTitleError")
            .addClass("d-none")
            .text("");

    }
);

$(document).on(
    "click",
    "#RefreshCompositionQuestionsBtn",
    function () {

        const $select =
            $("#CompositionQuestionSelect");


        $select
            .val(null)
            .trigger("change");


        // Select2 از Backend مجدد Query می‌زند
        $select.select2("open");

    }
);

$(document).on(
    "click",
    "#ShowCreateCompositionBtn",
    function () {

        $("#CreateCompositionBox")
            .toggleClass("d-none");


        if (
            !$("#CreateCompositionBox")
                .hasClass("d-none")
        ) {

            $("#NewCompositionTitle")
                .trigger("focus");

        }

    }
);

function checkCompositionTitleExists(
    title
) {

    return $.ajax({

        type:
            "POST",

        dataType:
            "json",

        url:
            "/VoteQuestion/GetAllVoteQuestionsByFilter",

        data: {

            title:
                title,

            keyword:
                COMPOSITION_CONFIG.keyword,

            voteQuestionTypeId:
                COMPOSITION_CONFIG.questionTypeId,

            page:
                1,

            pageSize:
                20

        },

        beforeSend:
            function (xhr) {

                xhr.setRequestHeader(

                    "RequestVerificationToken",

                    $(
                        'input[name="__RequestVerificationToken"]'
                    ).val()

                );

            }

    });

}

$(document).on(
    "click",
    "#CreateCompositionQuestionBtn",
    function () {

        const title =
            $("#NewCompositionTitle")
                .val()
                .trim();


        if (!title) {

            $("#NewCompositionTitleError")
                .text(
                    "عنوان دسته را وارد نمایید."
                )
                .removeClass("d-none");

            return;
        }


        $("#NewCompositionTitleError")
            .addClass("d-none")
            .text("");


        checkCompositionTitleExists(
            title
        )
            .done(
                function (response) {

                    const items =
                        response?.result ??
                        response?.Result ??
                        [];


                    const normalizedTitle =
                        normalizeCompositionTitle(
                            title
                        );


                    const existing =
                        items.find(
                            function (item) {

                                return (
                                    normalizeCompositionTitle(
                                        item.title
                                    ) ===
                                    normalizedTitle
                                );

                            }
                        );


                    // =====================================
                    // قبلاً ساخته شده
                    // =====================================

                    if (existing) {

                        selectExistingComposition(
                            existing
                        );


                        $("#NewCompositionTitleError")
                            .text(
                                "این دسته قبلاً ایجاد شده است و از لیست انتخاب شد."
                            )
                            .removeClass("d-none")
                            .removeClass("text-danger")
                            .addClass("text-success");


                        return;
                    }


                    // =====================================
                    // دسته جدید
                    // =====================================

                    createCompositionQuestion(
                        title
                    );

                }
            )

            .fail(
                function () {

                    Swal.fire({

                        text:
                            "خطا در بررسی عنوان دسته‌بندی",

                        icon:
                            "warning",

                        buttonsStyling:
                            false,

                        confirmButtonText:
                            "بستن",

                        customClass: {
                            confirmButton:
                                "btn btn-confirmPage"
                        }

                    });

                }
            );

    }
);

function selectExistingComposition(
    item
) {

    const $select =
        $("#CompositionQuestionSelect");


    const option =
        new Option(

            item.title,

            item.voteQuestionId,

            true,

            true

        );


    $select
        .append(option)
        .trigger("change");


    $("#CreateCompositionBox")
        .addClass("d-none");


    $("#NewCompositionTitle")
        .val("");

}

function normalizeCompositionTitle(
    value
) {

    return (value || "")
        .trim()
        .replace(/ي/g, "ی")
        .replace(/ك/g, "ک")
        .replace(/\s+/g, " ")
        .toLowerCase();
}

$(document).on(
    "click",
    ".edit-question-section",
    function () {

        const sectionId =
            $(this).data("section-id");

        const section =
            findQuestionSection(sectionId);

        if (!section) {
            return;
        }


        Swal.fire({

            title: "ویرایش عنوان دسته",

            input: "text",

            inputValue:
                section.title,

            showCancelButton: true,

            confirmButtonText:
                "ذخیره",

            cancelButtonText:
                "انصراف",

            buttonsStyling: false,

            customClass: {

                confirmButton:
                    "btn btn-confirmPage",

                cancelButton:
                    "btn btn-light ms-2"

            },

            inputValidator:
                value => {

                    if (
                        !value ||
                        !value.trim()
                    ) {
                        return "عنوان دسته را وارد نمایید";
                    }

                }

        }).then(result => {

            if (!result.isConfirmed) {
                return;
            }

            section.title =
                result.value.trim();

            saveVotePackageSections();

            addInDropItems({
                result:
                    currentVotePackageDetails
            });


            /*
               بعداً:
               POST /VotePackageSection/Update
            */

        });

    }
);


$(document).on(
    "click",
    ".delete-question-section",
    function () {

        const sectionId =
            $(this).data("section-id");

        const section =
            findQuestionSection(sectionId);

        if (!section) {
            return;
        }


        Swal.fire({

            text:
                "دسته حذف شود؟ سوال‌های داخل دسته حذف نمی‌شوند و به صورت سوال مستقل باقی می‌مانند.",

            icon:
                "warning",

            showCancelButton:
                true,

            confirmButtonText:
                "بله",

            cancelButtonText:
                "خیر",

            buttonsStyling:
                false,

            customClass: {

                confirmButton:
                    "btn btn-danger",

                cancelButton:
                    "btn btn-light ms-2"

            }

        }).then(result => {

            if (!result.isConfirmed) {
                return;
            }

            votePackageQuestionSections =
                votePackageQuestionSections.filter(
                    x =>
                        String(x.id) !==
                        String(sectionId)
                );

            saveVotePackageSections();

            addInDropItems({
                result:
                    currentVotePackageDetails
            }); 


            /*
                بعداً:
                POST /VotePackageSection/Delete
            */

        });

    }
);
