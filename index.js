document.getElementById('searchForm').addEventListener('submit', function () {
    document.getElementById('pageInput').value = 1;
});



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



searchVoteQuestionTypeId
//Get VoteQuestionDropDownData
var searchVoteQuestionTypeId = $('#searchVoteQuestionTypeId').val();
 $(document).ready(function () {
     $('.form-select').select2({});
     
         $('#VotequestionTypeId').empty();
         $.ajax({
             type: "GET",
             dataType: 'JSOn',
             url: '/VoteQuestionType/IndexResult',
             success: function (data) { 
                 for (var i = 0; i < data.length; i++) {
                     if (searchVoteQuestionTypeId == data[i].voteQuestionTypeId) {
                         var item = new Option(data[i].title, data[i].voteQuestionTypeId, true, true);
                     }
                     else {
                         var item = new Option(data[i].title, data[i].voteQuestionTypeId, false, false);
                     }
                     $("#VotequestionTypeIdSearch").append(item);
                 }
             }
         });
     
 });
////Get VoteQuestionGroupDropDownData
//$(document).ready(function () {
//    $('.form-select').select2({});

//    $('#VoteQuestionGroupId').empty();
//    $.ajax({
//        type: "GET",
//        dataType: 'JSOn',
//        url: '/VoteQuestionGroup/GetAllVoteQuestionGroup',
//        beforeSend: function (xhr) {
//            xhr.setRequestHeader("RequestVerificationToken", $('input[name="__RequestVerificationToken"]').val());
//        },
//        success: function (data) {
//            for (var i = 0; i < data.length; i++) {
//                var item = new Option(data[i].title, data[i].voteQuestionGroupId, false, false);
//                $("#VoteQuestionGroupId").append(item);
//            }
//        }
//    });

//});       
function ResetVariables() {
    page = 1;
    page2 = 1;
    page3 = 1;
    searchTerm = '';
    searchTerm2 = '';
    searchTerm3 = '';
    isLastPage = false;
    isLastPage2 = false;
}
$('#VoteQuestionGroupId').select2({}).on('select2:open', function () {

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
ResetVariables();
function loadData(pageNumber, searchTerm) {

    $('.loading').show();
        /*debugger*/;
    $.ajax({
        type: "GET",
        dataType: 'json',
        url: '/VoteQuestionGroup/GetAllVoteQuestionGroup',
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
var searchVoteQuestionGroupId = $('#searchVoteQuestionGroupId').val();
$.ajax({
    type: "GET",
    dataType: 'JSOn',
    url: '/VoteQuestionGroup/GetAllVoteQuestionGroup',
    success: function (data3) {
        for (var i = 0; i < data3.length; i++) {
            var title = (data3[i].title);

            if (searchVoteQuestionGroupId == data3[i].voteQuestionGroupId) {
                var itemType = new Option(title, data3[i].voteQuestionGroupId, true, true);
            }
            else {
                var itemType = new Option(title, data3[i].voteQuestionGroupId, false, false);
            }
            //var itemType = new Option(title, data3[i].voteQuestionGroupId, false, false);
            $("#VoteQuestionGroupId").append(itemType);
        }
    }
});

function appendOptions(data, searchTerm, pageNumber) {
    if ((searchTerm !== undefined || searchTerm !== '') && pageNumber === 1) {
        $('#VoteQuestionGroupId').empty().trigger('change');
    }
    let scrollTop = 0;
    let select2Dropdown = $('.select2-results__options');

    scrollTop = select2Dropdown.scrollTop();
    $('#VoteQuestionGroupId').select2();
    var option = new Option('', '', false, false);
    $('#VoteQuestionGroupId').append(option);
    data.forEach(item => {
        var option = new Option(item.title, item.voteQuestionGroupId, false, false);
        $('#VoteQuestionGroupId').append(option);
    });
    $('#VoteQuestionGroupId').select2('open');
    select2Dropdown = $('.select2-results__options');
    let select2DropdownSearch = $('.select2-search__field');
    select2DropdownSearch.val(searchTerm);
    select2Dropdown.scrollTop(scrollTop);
}
//-------------------------------------------------------------





$('#kt_repeater_CheckboxShowcase').repeater({
    initEmpty: false,

    defaultValues: {
        'text-input': 'foo'
    },

    show: function () {
        $(this).slideDown();
    },

    hide: function (deleteElement) {
        $(this).slideUp(deleteElement);
    }
});

$('#kt_repeater_RadioShowcase').repeater({
    initEmpty: false,

    defaultValues: {
        'text-input': 'foo'
    },

    show: function () {
        $(this).slideDown();
    },

    hide: function (deleteElement) {
        $(this).slideUp(deleteElement);
    }
});


$('#kt_repeater_AgreementShowcase').repeater({
    initEmpty: false,

    defaultValues: {
        'text-input': 'foo'
    },

    show: function () {
        $(this).slideDown();
    },

    hide: function (deleteElement) {
        $(this).slideUp(deleteElement);
    }
});


$(document).on('click', '.js-delete-vote-question', function (e) {
    e.preventDefault();

    const voteQuestionId = $(this).data('vote-question-id');
    const voteQuestionTitle = $(this).data('vote-question-title');

    DeleteVoteQuestionId(voteQuestionId, voteQuestionTitle);
});



function DeleteVoteQuestionId(clickedId, title) {

    Swal.fire({
        text: " آیا از عملیات حذف " +"<<"+ title + ">>"+" اطمینان دارید؟ ",
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
                url: '/VoteQuestion/Delete',
                data: { VoteQuestionId: clickedId },

                beforeSend: function (xhr) {
                    xhr.setRequestHeader("RequestVerificationToken", $('input[name="__RequestVerificationToken"]').val());
                },
                success: function (response) {
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
                        confirmButtonText: "تایید",
                        customClass: { confirmButton: "btn btn-primary" },

                    });
                }

            });
        }
    });
}
               
document.querySelectorAll(".dynamic-background-item").forEach(function (el) {
    const color = el.dataset.color.replace('!important', '').trim();
    el.style.setProperty('background-color', color, 'important');
});

               
