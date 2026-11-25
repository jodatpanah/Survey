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





let pageDropDown = 1;
let isLastPageDropDown = false;
let searchTermDropDown = '';

$(document).ready(function () {
    function appendOptions(data, searchTermDropDown, pageNumber) {
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
            var option = new Option(item.title, item.votePackageId, false, false);
            $('#VotePackageId').append(option);
        });

        $('#VotePackageId').select2('open');
        select2Dropdown = $('.select2-results__options');
        let select2DropdownSearch = $('.select2-search__field');
        select2DropdownSearch.val(searchTermDropDown);
        select2Dropdown.scrollTop(scrollTop);
    }

    function loadData(pageNumber, searchTermDropDown) {
        $('.loading').show();

        $.ajax({
            type: "Get",
            dataType: 'json',
            url: '/VoteRequestSpecificationSms/GetVotePackageListForDropDown',
            data: {
                pageDropDown: pageNumber,
                title: searchTermDropDown
            },
            delay: 500,
            success: function (data) {
                $('.loading').hide();
                isLastPage = data.length === 0;
                appendOptions(data, searchTermDropDown, pageNumber);
            },
            error: function (jqXHR, textStatus, errorThrown) {
                $('.loading').hide();
            }
        });
    }

    $('#VotePackageId').select2().on('select2:open', function () {
        let select2Dropdown = $('.select2-results__options');
        let srch = $('.select2-search__field');
        srch.val(searchTermDropDown);

        srch.on('input', function (e) {
            var srchtrm = $(this).val();
            loadData(1, srchtrm);
            searchTerm = srchtrm;
            pageDropDown = 1;
        });

        select2Dropdown.off('scroll').on('scroll', function () {
            if (!isLastPageDropDown && select2Dropdown[0].scrollHeight - select2Dropdown.scrollTop() <= select2Dropdown.outerHeight()) {
                pageDropDown++;
                loadData(pageDropDown, searchTermDropDown);
            }
        });
    });

    $.ajax({
        type: "Get",
        dataType: 'json',
        url: '/VoteRequestSpecificationSms/GetVotePackageListForDropDown',
        success: function (data) {
            let today = new Date();               
            let todayStr = today.toISOString().split('T')[0]; 

            data.forEach(item => {
                //let displayTitle = item.title.length > 80 ? item.title.substring(0, 80) + '...' : item.title;
                //let option = new Option(displayTitle, item.votePackageId, false, false);
                //$("#VotePackageId").append(option);

                let expireStr = item.expireDateTime; 

                if (!expireStr) return;
                                                               
                let expireDate = expireStr.split('T')[0];
                                                
                if (expireDate >= todayStr) {
                    let displayTitle = item.title.length > 80 ? item.title.substring(0, 80) + '...' : item.title;
                    let option = new Option(displayTitle, item.votePackageId, false, false);
                    $("#VotePackageId").append(option);
                }


            });
        }
    });

    const selectElement = document.querySelector('select[name="IsActive"]');
    const hiddenInput = document.getElementById('searchIsActive');
    const storedValue = sessionStorage.getItem('selectedValue');

    if (storedValue) {
        selectElement.value = storedValue;
        const event = new Event('change');
        selectElement.dispatchEvent(event);
    }

    selectElement.addEventListener('change', function () {
        hiddenInput.value = selectElement.value;
        sessionStorage.setItem('selectedValue', selectElement.value);
    });

    document.getElementById('searchForm').addEventListener('submit', function () {
        hiddenInput.value = selectElement.value;
        document.getElementById('pageInput').value = 1;
        sessionStorage.setItem('selectedValue', selectElement.value);
    });

    window.addEventListener('load', function () {
        const selectElement = document.querySelector('select[name="IsActive"]');
        const storedValue = sessionStorage.getItem('selectedValue');

        if (storedValue) {
            selectElement.value = storedValue;
            document.getElementById('searchIsActive').value = storedValue;
            const event = new Event('change');
            selectElement.dispatchEvent(event);
        }
    });

    ResetSelectedValue();
});

function ResetVariables() {
    pageDropDown = 1;
    searchTermDropDown = '';
    isLastPageDropDown = false;
}

$(document).on('input', '.js-count-content-char', function () {
    const maxChar = parseInt($(this).data('max-char'), 10) || 70;
    CountContentChar(this, maxChar);
});

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

document.getElementById("IsActiveCheck").addEventListener("change", function () {
    ChangeText();
});

function ChangeText() {

    var checkbox = document.getElementById("IsActiveCheck");
    var text = document.getElementById("IsActiveText");

    if (checkbox.checked == true) {
        text.innerHTML = " فعال";
    }
    else {
        text.innerHTML = " غیر فعال";
    }
};

jalaliDatepicker.startWatch({
    zIndex: '9999'
});

