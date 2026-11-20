let currentPage = 1;
let totalRecords = 0;
let currentFilters = {};
let modalCurrentPage = 1;
let modalTotalRecords = 0;
let modalTotalPages = 1;
let modalRecordCount = 10;
let modalSmsId = null;
let modalResendRecipients = [];
function renderTableSkeleton(rowCount = 5) {
    const columnCount = $('#reportTableBody').closest('table').find('thead th').length;
    let skeletonRows = '';

    for (let i = 0; i < rowCount; i++) {
        let cells = '';
        for (let j = 0; j < columnCount; j++) {
            cells += `
                <td class="text-center">
                    <span class="skeleton-box"></span>
                </td>`;
        }
        skeletonRows += `<tr>${cells}</tr>`;
    }

    $('#reportTableBody').html(skeletonRows);
}

var pageLoading
function GetSmsVotingCompleteReport(page = 1) {
    let startDate = $('#StartDateTimePersian').val();
    let endDate = $('#ExpireDateTimePersian').val();
    let level = $('#TimeLevel').val() || 'SUMMARY';
    pageLoading = true;

    currentFilters = {
        VoteRequestSpecificationSmsId: $('#VoteRequestSpecificationSmsId').val() || null,
        StartDateTimePersian: startDate || null,
        EndDateTimePersian: endDate || null,
        SendStatus: $('#SendStatus').val() || null,
        ReportType: level,
        Page: page,
        RecordCount: 10
    };

    Object.keys(currentFilters).forEach(key => {
        if (currentFilters[key] === null || currentFilters[key] === '') {
            delete currentFilters[key];
        }
    });

    let queryString = $.param(currentFilters);

    $.ajax({
        url: '/VoteAnswerReport/GetSmsVotingCompleteReport?' + queryString,
        type: 'GET',
        dataType: 'json',
        beforeSend: function () {
            $('#getReportButton')
                .prop('disabled', true)
                .html('<span class="spinner-border spinner-border-sm me-1" role="status"></span>');

            $('#reportTable').show();
            $('#reportTableBody').show();
            $('#paginationContainer').hide();
            $("#noDataMessage").hide()

            renderTableSkeleton(currentFilters.RecordCount);
        },
        success: function (res) {
            let resultObject = typeof res === 'string' ? JSON.parse(res) : res;
            let items = resultObject.result[0]?.summary;

            if (!items || items.length === 0) {
                $('#reportTable').hide();
                $('#reportTableBody').hide();
                $('#paginationContainer').hide();
                $("#noDataMessage").show()
                return;
            }

            $('#reportTable').show();
            $('#reportTableBody').show();
            currentPage = resultObject.pageNumber || page;
            totalRecords = resultObject.totalRecordCount || 0;

            renderTable(items);
            renderPagination(resultObject.totalPages);
        },
        error: function (xhr) {
            console.error(xhr.responseText);
            $('#reportTable').hide();
            Swal.fire("خطا", "مشکلی در بارگذاری گزارش رخ داد", "error");
        },
        complete: function () {
            $('#getReportButton')
                .prop('disabled', false)
                .html(' جستجو');

            pageLoading = false;
        }
    });
}



function renderTable(data) {
    let tbody = $('#reportTableBody');
    tbody.empty();

    let startIndex = (currentPage - 1) * currentFilters.RecordCount;

    data.forEach((item, index) => {
        let deliveryRateNum = parseFloat(item.deliveryRate) || 0;
        let participationRateNum = parseFloat(item.participationRate) || 0;

        let deliveryBadgeClass = deliveryRateNum >= 80 ? 'success' : deliveryRateNum >= 50 ? 'warning' : 'danger';
        let participationBadgeClass = participationRateNum >= 50 ? 'success' : participationRateNum >= 30 ? 'warning' : 'danger';

        let row = createTableRow(item, index, startIndex, deliveryRateNum, participationRateNum, deliveryBadgeClass, participationBadgeClass);
        tbody.append(row);
    });

    $('.table-row-hover').off('click').on('click', function (event) {
        const smsId = $(this).data('sms-id');
        if ($(event.target).closest('.sms-resend-controls').length) return;

        viewDetails(smsId);
    });
}

function createTableRow(item, index, startIndex) {
    const getGaugeData = (value) => {
        const val = parseFloat(value) || 0;
        let color = '#22C55E'; // success
        if (val < 25) color = '#DC3545';      // danger
        else if (val < 50) color = '#FFC107'; // warning
        else if (val < 75) color = '#0DCAF0'; // info

        const radius = 40;
        const circumference = 2 * Math.PI * radius;
        const halfCircumference = circumference / 2; // نیم‌دایره
        const offset = halfCircumference - (halfCircumference * (val / 100));

        return {
            val,
            color,
            dashArray: halfCircumference,
            offset
        };
    };

    const delivery = getGaugeData(item.deliveryRate);
    const participation = getGaugeData(item.participationRate);
    const sendRate = getGaugeData(item.sendRate);

    const renderGauge = (data) => `
        <div class="d-flex flex-column align-items-center">
            <svg width="80" height="45" viewBox="0 0 100 50">
                <!-- پس‌زمینه خاکستری نیم‌دایره -->
                <path
                    d="M 10 50 A 40 40 0 0 1 90 50"
                    fill="none"
                    stroke="#E6E6E6"
                    stroke-width="10"
                    stroke-linecap="round"
                />
                <!-- مقدار درصد -->
                <path
                    d="M 10 50 A 40 40 0 0 1 90 50"
                    fill="none"
                    stroke="${data.color}"
                    stroke-width="10"
                    stroke-linecap="round"
                    stroke-dasharray="${data.dashArray}"
                    stroke-dashoffset="${data.offset}"
                />
                <text
                    x="50"
                    y="43"
                    text-anchor="middle"
                    font-size="14"
                    font-weight="bold"
                    fill="${data.color}"
                >
                    ${convertToPersianNumbers(data.val.toFixed(1))}%
                </text>
            </svg>
        </div>
    `;

    return `
        <tr class="table-row-hover align-middle" data-sms-id="${item.voteRequestSpecificationSmsId || ''}">
            <!-- 1. ردیف -->
            <td class="text-center">
                <span class="badge bg-light text-dark rounded-pill">
                    ${convertToPersianNumbers(startIndex + index + 1)}
                </span>
            </td>

            <!-- 2. عنوان -->
            <td class="text-start">
                <div class="fw-semibold text-dark text-truncate sms-title" title="${item.title || '-'}">
                    ${item.title || '-'}
                </div>
            </td>

            <!-- 3. تاریخ ارسال -->
            <td class="text-center">
                <span class="text-dark fw-small">
                    ${convertToPersianNumbers(item.packageSendDateTimeShamsi) || '-'}
                </span>
            </td>

            <!-- 4. کل ارسال -->
            <td class="text-center">
                <span class="text-info fw-bold">
                    ${convertToPersianNumbers(item.totalRecipients) || 0}
                </span>
            </td>

            <!-- 6. تحویل داده شده -->
            <td class="text-center">
                <span class="text-success fw-bold">
                    ${convertToPersianNumbers(item.delivered) || 0}
                </span>
            </td>

            <!-- 7. تحویل نشده -->
            <td class="text-center">
                <span class="text-danger fw-bold">
                    ${convertToPersianNumbers(item.unDelivered) || 0}
                </span>
            </td>

            <!-- 8. شرکت‌کننده -->
            <td class="text-center">
                <span class="text-primary fw-bold">
                    ${convertToPersianNumbers(item.participatedCount) || 0}
                </span>
            </td>

            <!-- 9. ناموفق -->
            <td class="text-center">
                <span class="text-warning fw-bold">
                    ${convertToPersianNumbers(item.failedCount) || 0}
                </span>
            </td>


            <!-- 11. درصد تحویل (گِیج نیم‌دایره) -->
            <td class="text-center">
                ${renderGauge(delivery)}
            </td>

            <!-- 12. درصد شرکت (گِیج نیم‌دایره) -->
            <td class="text-center">
                ${renderGauge(participation)}
            </td>

            <td class="text-center sms-resend-table-actions">
                ${renderSmsResendGroupButtons(!item.voteRequestSpecificationSmsId)}
            </td>
        </tr>
    `;
}


function renderPagination(totalPagesData) {
    const $container = $('#paginationContainer');
    const totalPages = Number(totalPagesData);
    const maxVisiblePages = 5;

    if (!Number.isInteger(totalPages) || totalPages <= 1) {
        $container.empty().hide();
        return;
    }

    $container.show();

    const requestedPage = Number(currentPage);

    const safeCurrentPage = Math.min(
        totalPages,
        Math.max(
            1,
            Number.isInteger(requestedPage) ? requestedPage : 1
        )
    );

    // ساخت آیکون‌های SVG
    function getPaginationIcon(type) {
        const commonAttributes = `
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
        `;

        switch (type) {
            // فلش تکی به راست
            case 'right':
                return `
                    <svg ${commonAttributes}>
                        <path d="M9 6L15 12L9 18"></path>
                    </svg>
                `;

            // فلش دوتایی به راست
            case 'double-right':
                return `
                    <svg ${commonAttributes}>
                        <path d="M13 6L19 12L13 18"></path>
                        <path d="M5 6L11 12L5 18"></path>
                    </svg>
                `;

            // فلش تکی به چپ
            case 'left':
                return `
                <svg ${commonAttributes}>
                        <path d="M15 6L9 12L15 18"></path>
                    </svg>
                `;

            // فلش دوتایی به چپ
            case 'double-left':
                return `
                <svg ${commonAttributes}>
                        <path d="M11 6L5 12L11 18"></path>
                        <path d="M19 6L13 12L19 18"></path>
                    </svg>
                `;

            default:
                return '';
        }
    }

    // ساخت دکمه‌های اول، آخر، قبلی و بعدی
    function navigationItem(page, iconType, title, disabled) {
        return `
            <li class="page-item ${disabled ? 'disabled' : ''}">
                <a href="javascript:void(0);"
                   class="page-link"
                   data-page="${page}"
                   title="${title}"
                   aria-label="${title}"
                   ${disabled ? 'aria-disabled="true"' : ''}>
                    ${getPaginationIcon(iconType)}
                </a>
            </li>
        `;
    }

    let startPage = Math.max(
        1,
        safeCurrentPage - Math.floor(maxVisiblePages / 2)
    );

    let endPage = Math.min(
        totalPages,
        startPage + maxVisiblePages - 1
    );

    if (endPage - startPage + 1 < maxVisiblePages) {
        startPage = Math.max(
            1,
            endPage - maxVisiblePages + 1
        );
    }

    // صفحه اول و آخر همیشه نمایش داده شوند
    const pages = new Set([1, totalPages]);

    for (let page = startPage; page <= endPage; page++) {
        pages.add(page);
    }

    const sortedPages = [...pages].sort((a, b) => a - b);

    let paginationHtml = '<ul class="pagination mb-0">';

    // دکمه اولین صفحه
    paginationHtml += navigationItem(
        1,
        'double-right',
        'اولین صفحه',
        safeCurrentPage === 1
    );

    // دکمه صفحه قبلی
    paginationHtml += navigationItem(
        Math.max(1, safeCurrentPage - 1),
        'right',
        'صفحه قبلی',
        safeCurrentPage === 1
    );


    let previousPage = null;

    for (const page of sortedPages) {
        // نمایش سه‌نقطه بین صفحات دارای فاصله
        if (
            previousPage !== null &&
            page - previousPage > 1
        ) {
            paginationHtml += `
                <li class="page-item disabled">
                    <span class="page-link">…</span>
                </li>
            `;
        }

        const pageText =
            typeof convertToPersianNumbers === 'function'
                ? convertToPersianNumbers(page)
                : page;

        paginationHtml += `
            <li class="page-item ${page === safeCurrentPage ? 'active' : ''}">
                <a href="javascript:void(0);"
                   class="page-link"
                   data-page="${page}"
                   ${page === safeCurrentPage ? 'aria-current="page"' : ''}>
                    ${pageText}
                </a>
            </li>
        `;

        previousPage = page;
    }

    // دکمه صفحه بعدی
    paginationHtml += navigationItem(
        Math.min(totalPages, safeCurrentPage + 1),
        'left',
        'صفحه بعدی',
        safeCurrentPage === totalPages
    );

    // دکمه آخرین صفحه
    paginationHtml += navigationItem(
        totalPages,
        'double-left',
        'آخرین صفحه',
        safeCurrentPage === totalPages
    );

    paginationHtml += '</ul>';

    $container.html(paginationHtml);

    // جلوگیری از چندبار ثبت شدن رویداد
    $container
        .off('click.pagination')
        .on('click.pagination', '.page-link', function (e) {
            e.preventDefault();

            const $item = $(this).closest('.page-item');

            if (
                $item.hasClass('disabled') ||
                $item.hasClass('active')
            ) {
                return;
            }

            const page = parseInt(
                $(this).attr('data-page'),
                10
            );

            if (
                Number.isInteger(page) &&
                page >= 1 &&
                page <= totalPages &&
                !pageLoading
            ) {
                GetSmsVotingCompleteReport(page);
            }
        });
}

function viewDetails(smsId, page = 1) {
    if (!smsId) {
        Swal.fire("خطا", "شناسه پیامک یافت نشد", "error");
        return;
    }

    modalSmsId = smsId;
    modalCurrentPage = page;

    let params = {
        VoteRequestSpecificationSmsId: smsId,
        // StartDate: $('#StartDateTimePersian').val() || null,
        // EndDate: $('#ExpireDateTimePersian').val() || null,
        SendStatus: $('#SendStatus').val() || null,
        ReportType: 'DETAILED',
        Page: page,
        RecordCount: modalRecordCount
    };

    Object.keys(params).forEach(key => {
        if (params[key] === null || params[key] === '') {
            delete params[key];
        }
    });

    $.ajax({
        url: '/VoteAnswerReport/GetSmsVotingReportDetailsPaginated?' + $.param(params),
        type: 'GET',
        dataType: 'json',

        beforeSend: function () {
            $('#customDetailsModalBody').addClass('loading');

            Swal.fire({
                title: 'در حال بارگذاری...',
                allowOutsideClick: false,
                didOpen: () => Swal.showLoading()
            });
        },

        success: function (res) {
            Swal.close();

            let details = typeof res === 'string'
                ? JSON.parse(res)
                : res;

            modalCurrentPage = details.pageNumber || page;
            modalTotalRecords = details.filteredRecordCount || 0;
            modalTotalPages = details.totalPages || 1;

            let items = details.result?.[0]?.details || [];

            showDetailsModal(items);

            // اگر API تعداد رکورد را برگرداند
            renderModalPagination();

            $('#customDetailsModalBody').removeClass('loading');

            $('#btnExportSatisfactionDetail').on('click', function (e) {
                e.preventDefault();
                exportSatisfactionReportDetailsToExcel(smsId)
            });

        },

        error: function (xhr) {
            Swal.close();

            $('#customDetailsModalBody').removeClass('loading');

            Swal.fire(
                "خطا",
                "مشکلی در بارگذاری جزئیات رخ داد",
                "error"
            );

            console.error(xhr.responseText);
        }
    });
}

function openCustomModal(htmlContent, title = 'جزئیات گزارش') {
    const modal = document.getElementById('customDetailsModal');
    const body = document.getElementById('customDetailsModalBody');
    const titleEl = modal.querySelector('.custom-modal-title');

    titleEl.innerHTML = `<i class="ri-file-chart-line"></i> ${title}`;
    body.innerHTML = htmlContent;

    modal.classList.add('show');
    document.body.classList.add('modal-open');
}

function closeCustomModal() {
    const modal = document.getElementById('customDetailsModal');
    modal.classList.remove('show');
    document.body.classList.remove('modal-open');
    modalResendRecipients = [];
    $('#smsResendDetailActions .sms-resend-status').text('');
}

document.getElementById('customDetailsModalClose').addEventListener('click', closeCustomModal);
document.getElementById('customDetailsModalCloseBtn').addEventListener('click', closeCustomModal);

document.querySelector('#customDetailsModal .custom-modal-backdrop')
    .addEventListener('click', closeCustomModal);

document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
        closeCustomModal();
    }
});


const smsResendGroups = {
    all: 'همه شماره‌ها',
    participated: 'مشارکت‌کنندگان',
    'not-participated': 'افراد بدون مشارکت'
};

function renderSmsResendGroupButtons(disabled = false) {
    return `
        <div class="sms-resend-controls">
            <div class="sms-resend-group-actions" role="group" aria-label="ارسال مجدد گروهی">
                ${Object.entries(smsResendGroups).map(([group, label]) => `
                    <button type="button" class="sms-resend-button js-sms-resend-group"
                            data-audience="${group}" aria-label="ارسال مجدد به ${label}" ${disabled ? 'disabled' : ''}>
                        ${label}
                    </button>
                `).join('')}
            </div>
            <p class="sms-resend-status" role="status"></p>
        </div>
    `;
}

$('#smsResendDetailActions').html(renderSmsResendGroupButtons());

$('#reportTableBody, #smsResendDetailActions').on('click', '.js-sms-resend-group', function () {
    const label = smsResendGroups[this.dataset.audience];
    if (!label || this.disabled) return;

    $(this).closest('.sms-resend-controls').find('.sms-resend-status')
        .text(label + ' · ارسال پیامک هنوز فعال نیست.');
});

function showSmsResendPreview(title, recipientLabel, target = document.body) {
    Swal.fire({
        target,
        keydownListenerCapture: true,
        icon: 'info',
        title,
        text: recipientLabel + ' | ارسال پیامک پس از اتصال سرویس فعال می‌شود.',
        confirmButtonText: 'متوجه شدم',
        buttonsStyling: false,
        customClass: { confirmButton: 'sms-resend-button sms-resend-button--group' }
    });
}

$('#customDetailsModalBody').on('click', '.js-sms-resend-recipient', function () {
    const recipient = modalResendRecipients[Number(this.dataset.recipientIndex)];
    if (recipient?.mobileNo) {
        showSmsResendPreview(
            'ارسال مجدد لینک',
            'شماره گیرنده: ' + convertToPersianNumbers(recipient.mobileNo),
            document.getElementById('customDetailsModal')
        );
    }
});

function showDetailsModal(data) {

    const items = Array.isArray(data)
        ? data
        : data.items || data.data || data.result || [];

    modalResendRecipients = items;

    if (!items || items.length === 0) {
        Swal.fire({
            icon: 'info',
            title: 'اطلاعات جزئیات',
            text: 'داده‌ای برای نمایش وجود ندارد',
            confirmButtonText: 'باشه'
        });
        return;
    }

    const statusBadge = (status, desc) => {
        const map = {
            8: 'warning',
            1: 'success',
            2: 'danger'
        };

        const cls = map[status] || 'secondary';

        return `<span class="badge bg-${cls}">
                    ${desc || status || '-'}
                </span>`;
    };

    const rows = items.map((item, i) => {
        const hasMobileNumber = String(item.mobileNo ?? '').trim() !== '';

        const startIndex =
            (modalCurrentPage - 1) * modalRecordCount;

        return `
            <tr>
                <td class="text-center">
                    ${convertToPersianNumbers(startIndex + i + 1)}
                </td>

                <td class="text-center">
                    ${item.trackingNo || '-'}
                </td>

                <td>
                    ${item.mobileNo
                ? convertToPersianNumbers(item.mobileNo)
                : '-'}
                </td>

                <td class="text-center">
                    ${statusBadge(
                    item.sendStatus,
                    item.sendStatusDescription
                )}
                </td>

                <td class="text-center">
                    <span class="badge bg-${item.participated === 'بله'
                ? 'success'
                : 'secondary'
            }">
                        ${item.participated || '-'}
                    </span>
                </td>

                <td class="text-center">
                    ${item.sendDateTime
                ? convertToPersianDate(item.sendDateTime)
                : '-'
            }
                </td>

                <td class="text-center">
                    ${convertToPersianNumbers(
                item.sendTryCounter ?? 0
            )}
                </td>

                <td class="text-center">
                    ${item.shortUrl
                ? `
                                <a href="${item.shortUrl}"
                                   target="_blank"
                                   class="btn btn-sm btn-soft-info">
                                    <i class="ri-link"></i>
                                </a>
                              `
                : '-'
            }
                </td>

                <td class="text-center text-nowrap">
                    <button type="button" class="sms-resend-button js-sms-resend-recipient"
                            data-recipient-index="${i}" ${hasMobileNumber ? '' : 'disabled'}>
                        <i class="ri-send-plane-line" aria-hidden="true"></i>
                        ارسال مجدد لینک
                    </button>
                </td>
            </tr>
        `;
    }).join('');

    const tableHtml = `
        <div class="table-responsive">
            <table class="table table-bordered table-hover table-sm align-middle text-center">

                <thead class="table-light">
                    <tr>
                        <th>ردیف</th>
                        <th>شناسه</th>
                        <th>موبایل</th>
                        <th>وضعیت ارسال</th>
                        <th>مشارکت</th>
                        <th>تاریخ ارسال</th>
                        <th>تعداد تلاش</th>
                        <th>لینک کوتاه</th>
                        <th>ارسال مجدد</th>
                    </tr>
                </thead>

                <tbody>
                    ${rows}
                </tbody>

            </table>
        </div>

        <!-- Pagination مودال -->
        <div id="modalPaginationContainer"
             class="d-flex justify-content-center mt-4">
        </div>
    `;

    $("#customDetailsModalReportTitle")
        .text(items[0]?.packageTitle || '-');

    $("#customDetailsModalReportMessage")
        .text(items[0]?.message || '-');

    openCustomModal(tableHtml, 'جزئیات گزارش');

    // ساخت Pagination
    renderModalPagination();
}



function renderModalPagination() {
    const container = $('#modalPaginationContainer');

    if (!container.length) {
        return;
    }

    const totalPages = Number(modalTotalPages);
    const maxVisiblePages = 5;

    if (!Number.isInteger(totalPages) || totalPages < 1) {
        container.empty();
        return;
    }

    const requestedPage = Number(modalCurrentPage);

    const currentPage = Math.min(
        totalPages,
        Math.max(1, Number.isInteger(requestedPage) ? requestedPage : 1)
    );

    function navigationItem(page, icon, title, disabled) {
        return `
            <li class="page-item ${disabled ? 'disabled' : ''}">
                <button type="button"
                        class="page-link modal-page-link"
                        data-page="${page}"
                        title="${title}"
                        aria-label="${title}"
                        ${disabled ? 'disabled aria-disabled="true"' : ''}>
                    ${icon === 'ri-arrow-left-s-line'
                ? `<svg xmlns="http://www.w3.org/2000/svg"
                        width="20" height="20" viewBox="0="20" viewBox="0 0 24 24"
                       Color" stroke-width="2"
                        stroke-linecap="round" stroke-linejoin="round"
                        aria-hidden="true">
                       <path d="M15 6L9 12L15 18" />
                   </svg>`
                : icon === 'ri-arrow-left-double-line'
                    ? `<svg xmlns="http://www.w3.org/2000/svg"
                            width="20" height="20" viewBox="0 width="20" height="20" viewBox="0 0 24 24-width="2"
                            stroke-linecap="round" stroke-linejoin="round"
                            aria-hidden="true">
                           <path d="M11 6L5 12L11 18M19 6L13 12L19 18" />
                       </svg>`
                    : `<i class="${icon}" aria-hidden="true"></i>`
            }

                </button>
            </li>
        `;
    }

    let startPage = Math.max(
        1,
        currentPage - Math.floor(maxVisiblePages / 2)
    );

    let endPage = Math.min(
        totalPages,
        startPage + maxVisiblePages - 1
    );

    if (endPage - startPage + 1 < maxVisiblePages) {
        startPage = Math.max(
            1,
            endPage - maxVisiblePages + 1
        );
    }

    // شماره صفحه اول و آخر همیشه نمایش داده شود.
    const pages = new Set([1, totalPages]);

    for (let page = startPage; page <= endPage; page++) {
        pages.add(page);
    }

    const sortedPages = [...pages].sort((a, b) => a - b);

    let paginationHtml = '<ul class="pagination mb-0">';

    // اولین صفحه
    paginationHtml += navigationItem(
        1,
        'ri-arrow-right-double-line',
        'اولین صفحه',
        currentPage === 1
    );

    // صفحه قبلی
    paginationHtml += navigationItem(
        Math.max(1, currentPage - 1),
        'ri-arrow-right-s-line',
        'صفحه قبلی',
        currentPage === 1
    );


    let previousPage = null;

    for (const page of sortedPages) {
        // سه‌نقطه بین صفحات فاصله‌دار
        if (previousPage !== null && page - previousPage > 1) {
            paginationHtml += `
                <li class="page-item disabled">
                    <span class="page-link">…</span>
                </li>
            `;
        }

        paginationHtml += `
            <li class="page-item ${page === currentPage ? 'active' : ''}">
                <button type="button"
                        class="page-link modal-page-link"
                        data-page="${page}"
                        ${page === currentPage ? 'aria-current="page"' : ''}>
                    ${convertToPersianNumbers(page)}
                </button>
            </li>
        `;

        previousPage = page;
    }

    // صفحه بعدی
    paginationHtml += navigationItem(
        Math.min(totalPages, currentPage + 1),
        'ri-arrow-left-s-line',
        'صفحه بعدی',
        currentPage === totalPages
    );

    // آخرین صفحه
    paginationHtml += navigationItem(
        totalPages,
        'ri-arrow-left-double-line',
        'آخرین صفحه',
        currentPage === totalPages
    );

    paginationHtml += '</ul>';

    container.html(paginationHtml);
}



$(document).on('click', '.modal-page-link', function (e) {

    e.preventDefault();

    const parent = $(this).parent();

    if (
        parent.hasClass('disabled') ||
        parent.hasClass('active')
    ) {
        return;
    }

    const page = parseInt($(this).data('page'));

    if (!page || !modalSmsId) {
        return;
    }

    viewDetails(modalSmsId, page);
});
function convertToPersianDate(dateString) {
    if (!dateString) return '-';

    try {
        let date = new Date(dateString);
        return new Intl.DateTimeFormat('fa-IR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    } catch (e) {
        return dateString;
    }
}

$(document).ready(function () {
    $('#getReportButton').on('click', function () {
        GetSmsVotingCompleteReport(1);
    });

    $('#btnReset').on('click', function () {
        $('#VoteRequestSpecificationSmsId').val('');
        $('#StartDateTimePersian').val('');
        $('#ExpireDateTimePersian').val('');
        $('#SendStatus').val('');
        $('#TimeLevel').val('COMPLETE');
        $('#RecordCount').val(10);
        $('#reportTableBody').empty();
        $('#reportTable').hide();
        $('#paginationContainer').hide();
    });
    GetSmsVotingCompleteReport(1);
});


$(document).ready(function () {
    // مقداردهی اولیه Select2
    $('#SendStatus').select2({
        allowClear: true // فعال‌سازی قابلیت پاک کردن
    });

    $.ajax({
        url: `/VoteAnswerReport/GetSmsSendStatuses`,
        type: 'GET',
        dataType: 'json',
        data: {
            searchTerm: ''
        },
        success: function (res) {
            Swal.close();
            let details = typeof res === 'string' ? JSON.parse(res) : res;
            details.forEach(item => {
                var option = new Option(item.displayName, item.value, false, false);
                $('#SendStatus').append(option);
            });
        },
        error: function (xhr) {
            Swal.fire("خطا", "مشکلی در بارگذاری جزئیات رخ داد", "error");
            console.error(xhr.responseText);
        }
    });

});

function formatDateTime(dateTimeString) {
    if (!dateTimeString) return '-';

    const formatted = dateTimeString
        .split('T')[0]
        .replace(/-/g, '/');

    return convertToPersianNumbers(formatted);
}


function convertToPersianNumbers(str) {
    const persianNumbers = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
    return String(str).replace(/\d/g, (digit) => persianNumbers[parseInt(digit)]);
}

$(document).ready(function () {

    $('#btnExportSatisfaction').on('click', function (e) {
        e.preventDefault();
        exportSatisfactionReportToExcel();
    });
})

function exportSatisfactionReportToExcel() {
    const startDatePersian = $('#StartDateTimePersian').val()?.trim() || null;
    const endDatePersian = $('#ExpireDateTimePersian').val()?.trim() || null;

    const rawSendStatus = $('#SendStatus').val();
    const rawSmsId = $('#VoteRequestSpecificationSmsId').val() || null;

    const sendStatus = (rawSendStatus !== "" && rawSendStatus != null && !isNaN(rawSendStatus))
        ? parseInt(rawSendStatus, 10)
        : null;

    const voteRequestSpecificationSmsId = (rawSmsId !== "" && rawSmsId != null && !isNaN(rawSmsId))
        ? parseInt(rawSmsId, 10)
        : null;

    Swal.fire({
        title: 'در حال تهیه خروجی اکسل...',
        text: 'لطفاً کمی صبر کنید',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });

    const queryPayload = {
        StartDateTimePersian: startDatePersian,
        EndDateTimePersian: endDatePersian,
        StartDate: null,
        EndDate: null,
        SendStatus: sendStatus,
        VoteRequestSpecificationSmsId: voteRequestSpecificationSmsId,
        ReportType: rawSmsId ? 'DETAILED' : 'SUMMARY',
    };

    $.ajax({
        url: '/VoteAnswerReport/ExportSmsVotingReportToExcel',
        type: 'POST',
        contentType: 'application/json; charset=utf-8',
        data: JSON.stringify(queryPayload),
        xhrFields: {
            responseType: 'blob'
        },
        beforeSend: function (xhr) {
            const token = $('input[name="__RequestVerificationToken"]').val();
            if (token) {
                xhr.setRequestHeader("RequestVerificationToken", token);
            }
        },
        success: function (blob, status, xhr) {
            Swal.close();

            let filename = `SurveySmsReport_${new Date().getTime()}.xlsx`;
            const contentDisposition = xhr.getResponseHeader('Content-Disposition');
            if (contentDisposition) {
                const utf8Match = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i);
                if (utf8Match && utf8Match[1]) {
                    filename = decodeURIComponent(utf8Match[1]);
                } else {
                    const match = contentDisposition.match(/filename="?([^";]+)"?/i);
                    if (match && match[1]) {
                        filename = decodeURIComponent(match[1]);
                    }
                }
            }

            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            setTimeout(() => {
                URL.revokeObjectURL(link.href);
            }, 150);

            Swal.fire({
                icon: 'success',
                title: 'عملیات موفق',
                text: 'فایل اکسل با موفقیت دانلود شد.',
                confirmButtonText: 'متوجه شدم'
            });
        },
        error: async function (xhr) {
            Swal.close();
            let errorMessage = 'مشکلی در تهیه خروجی اکسل رخ داد.';

            if (xhr.response instanceof Blob) {
                try {
                    const responseText = await xhr.response.text();
                    const jsonRes = JSON.parse(responseText);
                    if (jsonRes && jsonRes.message) {
                        errorMessage = jsonRes.message;
                    }
                } catch (e) { }
            }

            Swal.fire({
                icon: 'error',
                title: 'خطا',
                text: errorMessage,
                confirmButtonText: 'متوجه شدم'
            });
        }
    });
}


function exportSatisfactionReportDetailsToExcel(smsId) {
    if (typeof closeCustomModal === 'function') {
        closeCustomModal();
    }

    const startDatePersian = $('#StartDateTimePersian').val()?.trim() || null;
    const endDatePersian = $('#ExpireDateTimePersian').val()?.trim() || null;

    const rawSendStatus = $('#SendStatus').val();
    const rawSmsId = smsId;

    const sendStatus = (rawSendStatus !== "" && rawSendStatus != null && !isNaN(rawSendStatus))
        ? parseInt(rawSendStatus, 10)
        : null;

    const voteRequestSpecificationSmsId = (rawSmsId !== "" && rawSmsId != null && !isNaN(rawSmsId))
        ? parseInt(rawSmsId, 10)
        : null;

    Swal.fire({
        title: 'در حال تهیه خروجی اکسل...',
        text: 'لطفاً کمی صبر کنید',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });

    // در GET باید آبجکت ساده باشد؛ jQuery خودش با $.param به Query String تبدیل می‌کند
    const queryParams = {
        StartDateTimePersian: startDatePersian,
        EndDateTimePersian: endDatePersian,
        SendStatus: sendStatus,
        VoteRequestSpecificationSmsId: voteRequestSpecificationSmsId,
        Page: 1,
        RecordCount: 2147483647 // هماهنگ با int.MaxValue در بک‌اند (اختیاری؛ بک‌اند override می‌کند)
    };

    $.ajax({
        url: '/VoteAnswerReport/ExportSmsVotingReportDetailsToExcel',
        type: 'GET',
        data: queryParams, // بدون JSON.stringify — تبدیل خودکار به ?a=1&b=2
        traditional: true,
        xhrFields: {
            responseType: 'blob'
        },
        beforeSend: function (xhr) {
            const token = $('input[name="__RequestVerificationToken"]').val();
            if (token) {
                xhr.setRequestHeader("RequestVerificationToken", token);
            }
        },
        success: function (blob, status, xhr) {
            Swal.close();

            let filename = `SurveySmsDetailsReport_${new Date().getTime()}.xlsx`;
            const contentDisposition = xhr.getResponseHeader('Content-Disposition');
            if (contentDisposition) {
                const utf8Match = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i);
                if (utf8Match && utf8Match[1]) {
                    filename = decodeURIComponent(utf8Match[1]);
                } else {
                    const match = contentDisposition.match(/filename="?([^";]+)"?/i);
                    if (match && match[1]) {
                        filename = decodeURIComponent(match[1]);
                    }
                }
            }

            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            setTimeout(() => {
                URL.revokeObjectURL(link.href);
            }, 150);

            Swal.fire({
                icon: 'success',
                title: 'عملیات موفق',
                text: 'فایل اکسل با موفقیت دانلود شد.',
                confirmButtonText: 'متوجه شدم'
            });
        },
        error: function (xhr) {
            Swal.close();

            const showErrorMessage = (msg) => {
                Swal.fire({
                    icon: 'warning',
                    title: 'توجه',
                    text: msg || 'مشکلی در تهیه خروجی اکسل رخ داد.',
                    confirmButtonText: 'متوجه شدم'
                });
            };

            // BadRequest با بدنه JSON و responseType=blob → خواندن با FileReader
            if (xhr.response instanceof Blob) {
                const reader = new FileReader();
                reader.onload = function () {
                    try {
                        const jsonRes = JSON.parse(reader.result);
                        showErrorMessage(jsonRes.message || jsonRes.Message);
                    } catch (e) {
                        showErrorMessage();
                    }
                };
                reader.onerror = function () {
                    showErrorMessage();
                };
                reader.readAsText(xhr.response);
            } else {
                try {
                    const jsonRes = JSON.parse(xhr.responseText);
                    showErrorMessage(jsonRes.message || jsonRes.Message);
                } catch (e) {
                    showErrorMessage();
                }
            }
        }
    });
}


jalaliDatepicker.startWatch({
    zIndex: '9999',
});
