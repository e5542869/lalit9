var userData = {};
var now = new Date();
$.getJSON('/Base/GetUserData', function (data) {
    userData = JSON.parse(data);
    $(document).ready(function () {
        setPermissions(userData.InstituteId);
        var startDate = new Date(userData.FinancialYearStartDate);
        startDate = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate(), 0, 0, 0, 0);
        var endDate = new Date(userData.FinancialYearEndDate);
        var CurrentDate = new Date();
        if (endDate > CurrentDate) {
            endDate = CurrentDate;
        }
        else {
            endDate = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate(), 0, 0, 0, 0);
        }
        $('#dtSingleLedgerStaringDate,#txtSingleLedgerStaringDate').datepicker({
            format: "dd/mm/yyyy",
            autoclose: true,
            startDate: startDate,
            endDate: endDate
        });
        $('#dtSingleLedgerEndingDate,#txtSingleLedgerEndingDate').datepicker({
            format: "dd/mm/yyyy",
            autoclose: true,
            startDate: startDate,
            endDate: endDate
        });
        $('#dtAccountGroupStaringDate,#txtAccountGroupStaringDate').datepicker({
            format: "dd/mm/yyyy",
            autoclose: true,
            startDate: startDate,
            endDate: endDate
        });
        $('#dtAccountGroupEndingDate,#txtAccountGroupEndingDate').datepicker({
            format: "dd/mm/yyyy",
            autoclose: true,
            startDate: startDate,
            endDate: endDate
        });
        $('#dtAllLedgersStaringDate,#txtAllLedgersStaringDate').datepicker({
            format: "dd/mm/yyyy",
            autoclose: true,
            startDate: startDate,
            endDate: endDate
        });
        $('#dtAllLedgersEndingDate,#txtAllLedgersEndingDate').datepicker({
            format: "dd/mm/yyyy",
            autoclose: true,
            startDate: startDate,
            endDate: endDate
        });
        var today = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
        $('#txtSingleLedgerStaringDate,#txtAccountGroupStaringDate,#txtAllLedgersStaringDate').datepicker('setDate', startDate);
        $('#txtSingleLedgerEndingDate,#txtAccountGroupEndingDate,#txtAllLedgersEndingDate').datepicker('setDate', today);


        $('#btnSingleLedgerView').on('click', function () {
            var fromDate = $('#txtSingleLedgerStaringDate').val();
            if (fromDate == '' || !ValidateDate(fromDate)) {
                alert('Please select valid start date');
                return false;
            }
            var toDate = $('#txtSingleLedgerEndingDate').val();
            if (toDate == '' || !ValidateDate(toDate)) {
                alert('Please select valid end date');
                return false;
            }
            var instituteId = $("#ddlSingleLedgerInstitute option:selected").val();
            if (instituteId == '' || instituteId == undefined) {
                alert('Please select valid institute');
                return false;
            }
            var ledgerId = $("#ddlSingleLedgerLedgers option:selected").val();
            if (ledgerId == '' || ledgerId == undefined) {
                alert('Please select ledger');
                return false;
            }
            var ledgername = $("#ddlSingleLedgerLedgers option:selected").text();
            bingSingleLedgerAccountStatement(ConverttoDate(fromDate), ConverttoDate(toDate), instituteId, ledgerId, ledgername);
        });
        $('#btnAccountGroupView').on('click', function () {
            var fromDate = $('#txtAccountGroupStaringDate').val();
            if (fromDate == '' || !ValidateDate(fromDate)) {
                alert('Please select valid start date');
                return false;
            }
            var toDate = $('#txtAccountGroupEndingDate').val();
            if (toDate == '' || !ValidateDate(toDate)) {
                alert('Please select valid end date');
                return false;
            }
            var instituteId = $("#ddlAccountGroupInstitute option:selected").val();
            if (instituteId == '') {
                alert('Please select valid institute');
                return false;
            }
            var groupId = $("#ddlAccountGroups option:selected").val();
            var groupName = $("#ddlAccountGroups option:selected").text();
            bingAccountGroupstatement(ConverttoDate(fromDate), ConverttoDate(toDate), instituteId, groupId, groupName);
        });
        $('#btnAllLedgersView').on('click', function () {
            var fromDate = $('#txtAllLedgersStaringDate').val();
            if (fromDate == '' || !ValidateDate(fromDate)) {
                alert('Please select valid start date');
                return false;
            }
            var toDate = $('#txtAllLedgersEndingDate').val();
            if (toDate == '' || !ValidateDate(toDate)) {
                alert('Please select valid end date');
                return false;
            }
            var instituteId = $("#ddlAllLedgersInstitute option:selected").val();
            if (instituteId == '') {
                alert('Please select valid institute');
                return false;
            }

            bingAllLegdersstatement(ConverttoDate(fromDate), ConverttoDate(toDate), instituteId);
        });
    });
});
function loadOrgNamesDropdown(controlId) {
    $.ajax({
        type: "GET",
        url: '/Admin/GetDepartmentsList',
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        beforeSend: function () {
            //  ShowLoading();
        },
        success: function (data) {
            $("#" + controlId).empty();
            var optionhtml = '<option value=""></option>';
            $("#" + controlId).append(optionhtml);
            $.each(data, function (i) {
                if (userData.InstituteId == data[i].Inst_Id) {
                    var optionhtml = '<option selected="selected" value="' +
                        data[i].Inst_Id + '">' + data[i].Inst_ShortTitle + '</option>';
                }
                else {
                    var optionhtml = '<option value="' +
                        data[i].Inst_Id + '">' + data[i].Inst_ShortTitle + '</option>';
                }
                $("#" + controlId).append(optionhtml);
            });
        },
        error: function (error) { console.log(error); },
        complete: function () {
            //  HideLoading();
        }
    });
}
function loadLedgersDropdown() {
    $.ajax({
        type: "GET",
        url: '/Admin/GetAccountLedgerList',
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        beforeSend: function () {
            ShowLoading();
        },
        success: function (data) {
            //$('#cmbSingleLedgerLedgers').autocomplete({
            //    cashbookvalidation,
            //    cashbookfilter,
            //    valueProperty: 'LedgerId',
            //    openOnInput: true,
            //    nameProperty: 'LedgerName',
            //    valueField: '#ddlSingleLedgerLedgers',
            //    dataSource: data
            //});
            $("#ddlSingleLedgerLedgers").empty();
            $.each(data, function (i) {
                var optionhtml = '<option value="' +
                    data[i].LedgerId + '">' + data[i].LedgerName + '</option>';
                $("#ddlSingleLedgerLedgers").append(optionhtml);
            });
            $("#ddlSingleLedgerLedgers").combobox();
        },
        error: function (error) { console.log(error); },
        complete: function () {
            HideLoading();
        }
    });


}
function loadddlAccountGroup() {
    $.ajax({
        type: "GET",
        url: '/Admin/GetAccountGroupsList',
        data: { showInLedger: '0', financialYearId: userData.FinancialYearId },
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        beforeSend: function () {
            ShowLoading();
        },
        success: function (data) {
            $.each(data, function (i) {
                var optionhtml = '<option value="' +
                    data[i].AccountGroupId + '">' + data[i].AccountGroupName + '</option>';
                $("#ddlAccountGroups").append(optionhtml);
            });
        },
        error: function (error) { console.log(error); },
        complete: function () {
            HideLoading();
        }
    });
}
function radLedgerStatementClick(LedgerType) {
    $('#spnOpenBalance').text('');
    $('#spnCredit').text('');
    $('#spnDebit').text('');
    $('#spnClosingBalance').text('');
    if ($.fn.DataTable.isDataTable("#tblAccountStatementReport")) {
        $('#tblAccountStatementReport').DataTable().draw();
        $('#tblAccountStatementReport').DataTable().destroy();
        $('#tblAccountStatementReport tbody').empty();
    }
    if (LedgerType.trim() == "Single Ledger") {
        loadOrgNamesDropdown('ddlSingleLedgerInstitute');
        loadLedgersDropdown();
        if (userData.InstituteId == 300010) {
            $("#ddlSingleLedgerInstitute").attr("disabled", false);
        }
        else {
            $("#ddlSingleLedgerInstitute").prop("disabled", true);
        }
        $('#dvSingleLedger').css('display', 'block');
        $('#dvAccountGroup').css('display', 'none');
        $('#dvAllLedgers').css('display', 'none');
        displayProperty(true);
    }
    else if (LedgerType.trim() == "Account Group") {
        loadOrgNamesDropdown('ddlAccountGroupInstitute');
        loadddlAccountGroup();
        if (userData.InstituteId == 300010) {
            $("#ddlAccountGroupInstitute").attr("disabled", false);
        }
        else {
            $("#ddlAccountGroupInstitute").prop("disabled", true);
        }
        $('#dvSingleLedger').css('display', 'none');
        $('#dvAccountGroup').css('display', 'block');
        $('#dvAllLedgers').css('display', 'none');
        displayProperty(false);
    }
    else if (LedgerType.trim() == "All Ledgers") {
        loadOrgNamesDropdown('ddlAllLedgersInstitute');
        if (userData.InstituteId == 300010) {
            $("#ddlAllLedgersInstitute").attr("disabled", false);
        }
        else {
            $("#ddlAllLedgersInstitute").prop("disabled", true);
        }
        $('#dvSingleLedger').css('display', 'none');
        $('#dvAccountGroup').css('display', 'none');
        $('#dvAllLedgers').css('display', 'block');
        displayProperty(false);
    }
    $('#dvallreport').css('display', 'block');
}
function bingSingleLedgerAccountStatement(fromDate, toDate, instituteId, ledgerId, ledgername) {
    if ($.fn.DataTable.isDataTable("#tblAccountStatementReport")) {
        $('#tblAccountStatementReport').DataTable().draw();
        $('#tblAccountStatementReport').DataTable().destroy();
        $('#tblAccountStatementReport tbody').empty();
    }
    $('#tblAccountStatementReport').DataTable({
        bProcessing: true,
        pageLength: 100,
        dom:
            "<'row'<'col-sm-3'l><'col-sm-4 text-center'f><'col-sm-5'B>>" +
            "<'row'<'col-sm-12'tr>>" +
            "<'row'<'col-sm-5'i><'col-sm-7'p>>",
        language: {
            search: "",
            searchPlaceholder: "Search records"
        },
        columnDefs: [{
            className: "dt-right",
            targets: [0]
        }],
        aoColumnDefs: [{ "bSortable": false, "aTargets": [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] }],
        bAutoWidth: false,
        buttons: [
            {
                extend: 'excelHtml5',
                exportOptions: {
                    columns: [1, 2, 3, 4, 5, 6, 7, 8]
                },
                footer: true
            },
            {
                extend: 'pdfHtml5',
                pageSize: 'A4',
                orientation: 'landscape',
                filename: 'Ledger Statement Report_' + now.getDate() + '-' + (now.getMonth() + 1) + '-' + now.getFullYear(),
                title: 'Export',
                header: true,
                customize: function (doc) {
                    var openbalanceHtml = $('#spnOpenBalance').text();
                    doc.content.splice(0, 1, {
                        text: [{
                            text: 'Khalsa College Charitable Society, Amritsar \n',
                            bold: true,
                            fontSize: 14
                        }, {
                            text: userData.InstName + ' \n',
                            bold: true,
                            fontSize: 11
                        }, {
                            text: ledgername + ' Ledger Statement Report From From(' + fromDate.getDate() + '/' + (fromDate.getMonth() + 1) + '/' + fromDate.getFullYear() + '-' + toDate.getDate() + '/' + (toDate.getMonth() + 1) + '/' + toDate.getFullYear() + ') \n \n',
                            bold: true,
                            fontSize: 11
                        },
                        {
                            alignment: 'right',
                            text: openbalanceHtml,
                            bold: true,
                            fontSize: 10
                        }],
                        margin: 20,
                        alignment: 'center',
                    });

                    doc.content[1].table.widths = ['10%', '8%', '20%', '12%', '20%', '10%', '10%', '10%'];
                    doc.defaultStyle.fontSize = 8;
                    doc.styles.tableHeader.fontSize = 8;
                    var rowCount = doc.content[1].table.body.length;
                    for (i = 0; i < rowCount; i++) {
                        doc.content[1].table.body[i][0].alignment = 'left';
                        doc.content[1].table.body[i][1].alignment = 'left';
                        doc.content[1].table.body[i][2].alignment = 'left';
                        doc.content[1].table.body[i][3].alignment = 'left';
                        doc.content[1].table.body[i][4].alignment = 'left';
                        doc.content[1].table.body[i][5].alignment = 'right';
                        doc.content[1].table.body[i][6].alignment = 'right';
                        doc.content[1].table.body[i][7].alignment = 'right';
                    };
                    doc['footer'] = (function (page, pages) {
                        return {
                            columns: [
                                {
                                    alignment: 'right',
                                    text: ['page ', { text: page.toString() }, ' of ', { text: pages.toString() }]
                                }
                            ],
                            margin: 20
                        }
                    });
                    var objLayout = {};
                    objLayout['hLineWidth'] = function (i) { return .5; };
                    objLayout['vLineWidth'] = function (i) { return .5; };
                    objLayout['hLineColor'] = function (i) { return '#aaa'; };
                    objLayout['vLineColor'] = function (i) { return '#aaa'; };
                    objLayout['paddingLeft'] = function (i) { return 4; };
                    objLayout['paddingRight'] = function (i) { return 4; };
                    doc.content[1].layout = objLayout;
                },
                exportOptions: {
                    columns: [1, 2, 3, 4, 5, 6, 7, 8]
                },
                footer: true
            },
            {
                extend: 'print',
                title: '',
                message: "<div class='row'><h3 class='text-center'>Khalsa College Charitable Society, Amritsar</h3></div>" +
                    "<div class='row exportoption'><h4 class='text-center'>" + userData.InstName + "</h4></div>" +
                    "<div class='row exportoption'><h4 class='text-center'>" + ledgername + " - Ledger Statement Report From (" + fromDate.getDate() + "/" + (fromDate.getMonth() + 1) + "/" + fromDate.getFullYear() + " -" + toDate.getDate() + "/" + (toDate.getMonth() + 1) + "/" + toDate.getFullYear() + ")</h4></div> ",
                orientation: 'landscape',
                titleAttr: 'Print',
                exportOptions: {
                    columns: [1, 2, 3, 4, 5, 6, 7, 8]
                },
                customize: function (win) {
                    var openbalanceHtml = '<tr role="row"><th colspan="8" rowspan="1"> <span class="pull-right" id="spnOpenBalance" style="display: block;">' + $('#spnOpenBalance').text() + '</span></th></tr>'
                    $(win.document.body).find('thead').prepend(openbalanceHtml);

                    $(win.document.body).find('table tr th:nth-child(6)').css('text-align', 'right');
                    $(win.document.body).find('table tr th:nth-child(7)').css('text-align', 'right');
                    $(win.document.body).find('table tr th:nth-child(8)').css('text-align', 'right');

                    $(win.document.body).find('table tr td:nth-child(6),table tr td:nth-child(7),table tr td:nth-child(8)')
                        .addClass('align-right');
                    $(win.document.body).find('table tr th:nth-child(5),table tr td:nth-child(5)').css('width', '150px');
                    $(win.document.body).find('table tr th:nth-child(8),table tr td:nth-child(8)').css('width', '100px');
                },
                footer: true
            },
        ],
        ajax: {
            type: "POST",
            url: "SingleLedgerAccountStatement",
            data: { fromDate: fromDate.toISOString(), toDate: toDate.toISOString(), ledgerId: ledgerId, instituteId: instituteId },
            dataSrc: function (model) {
                $('#spnOpenBalance').text(model.OpeningBalance);
                $('#spnCredit').text(parseFloat(model.TotalCredit).toFixed(2));
                $('#spnDebit').text(parseFloat(model.TotalDebit).toFixed(2));
                $('#spnClosingBalance').text(model.ClosingBalance);
                return model.accountBooksReports;
            }
        },
        aoColumnDefs: [{ "bSortable": false, "aTargets": [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] }],
        columns: [
            {
                name: "id",
                data: "SerialNo",
                visible: false
            },
            {
                name: "Date",
                render: function (data, type, row) {
                    if (row.TransactionDate != null)
                        return '<span class="' + row.ClassName + '">' + row.TransactionDate + '</span>';
                    else
                        return '';
                }
            },
            {
                name: "V.Type",
                render: function (data, type, row) {
                    if (row.VoucherTypeName != null)
                        return '<span class="' + row.ClassName + '">' + row.VoucherTypeName + '</span>';
                    else
                        return '';
                }
            },
            {
                name: "V.No",
                render: function (data, type, row) {
                    if (row.VoucherNo != null) {
                        return '<span class="' + row.ClassName + '">' + row.VoucherNo + '</span>';
                    }
                    else
                        return '';
                }
            },
            {
                name: "Cheque No",
                render: function (data, type, row) {
                    if (row.ChequeNo != null)
                        return '<span class="' + row.ClassName + '">' + row.ChequeNo + '</span>';
                    else
                        return '';
                }
            },
            {
                name: "Account",
                render: function (data, type, row) {
                    if (row.ChildLedgerName != null && row.ChildLedgerName != '') {
                        var link = $("<a>");
                        link.attr("href", "#");
                        link.attr("class", row.ClassName);
                        link.attr("title", "Click here to view transaction details");
                        link.attr("onclick", "VocherNoClick('" + row.TransactionMasterId + "')");
                        link.text(row.ChildLedgerName);
                        var html = link[0].outerHTML;
                        return html;
                    }
                    else
                        return '';
                }
            },
            {
                name: "Debit",
                className: "align-right",
                render: function (data, type, row) {
                    if (row.Debit != null && row.Debit != '')
                        return '<span class="' + row.ClassName + '">' + parseFloat(row.Debit).toFixed(2) + '</span>';
                    else
                        return '';
                }
            }
            ,
            {
                name: "Credit",
                className: "align-right",
                render: function (data, type, row) {
                    if (row.Credit != null && row.Credit != '')
                        return '<span class="' + row.ClassName + '">' + parseFloat(row.Credit).toFixed(2) + '</span>';
                    else
                        return '';
                }
            },
            {
                name: "Balance",
                className: "align-right",
                render: function (data, type, row) {
                    if (row.Balance != null && row.Balance != '')
                        return '<span class="' + row.ClassName + '">' + row.Balance + '</span>';
                    else
                        return '';
                }
            },
            {
                name: "Narration",
                render: function (data, type, row) {
                    if (row.MasterNarration != null)
                        return '<span class="' + row.ClassName + '">' + row.MasterNarration + '</span>';
                    else
                        return '';
                },
                visible: false
            }
        ]

    });
}
function bingAccountGroupstatement(fromDate, toDate, instituteId, groupId, groupName) {
    if ($.fn.DataTable.isDataTable("#tblAccountStatementReport")) {
        $('#tblAccountStatementReport').DataTable().draw();
        $('#tblAccountStatementReport').DataTable().destroy();
        $('#tblAccountStatementReport tbody').empty();
    }
    $('#tblAccountStatementReport').DataTable({
        bProcessing: true,
        pageLength: 100,
        autoWidth: false,
        dom:
            "<'row'<'col-sm-3'l><'col-sm-4 text-center'f><'col-sm-5'B>>" +
            "<'row'<'col-sm-12'tr>>" +
            "<'row'<'col-sm-5'i><'col-sm-7'p>>",
        language: {
            search: "",
            searchPlaceholder: "Search records"
        },
        columnDefs: [{
            className: "dt-right",
            targets: [0]
        }],
        aoColumnDefs: [{ "bSortable": false, "aTargets": [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] }],
        buttons: [
            {
                extend: 'excelHtml5',
                exportOptions: {
                    columns: [1, 2, 3, 4, 5, 6, 7, 8]
                }
            },
            {
                extend: 'pdfHtml5',
                pageSize: 'A4',
                orientation: 'landscape',
                filename: 'Account Group Report_' + now.getDate() + '-' + (now.getMonth() + 1) + '-' + now.getFullYear(),
                title: 'Export',
                header: true,
                customize: function (doc) {
                    doc.content.splice(0, 1, {
                        text: [{
                            text: 'Khalsa College Charitable Society, Amritsar \n',
                            bold: true,
                            fontSize: 14
                        }, {
                            text: userData.InstName + ' \n',
                            bold: true,
                            fontSize: 11
                        }, {
                            text: groupName + ' Account Group Report (' + fromDate.getDate() + '/' + (fromDate.getMonth() + 1) + '/' + fromDate.getFullYear() + '-' + toDate.getDate() + '/' + (toDate.getMonth() + 1) + '/' + toDate.getFullYear() + ')',
                            bold: true,
                            fontSize: 11
                        }],
                        margin: [0, 0, 0, 12],
                        alignment: 'center'
                    });

                    doc.defaultStyle.fontSize = 8;
                    doc.styles.tableHeader.fontSize = 8;
                    doc.content[1].table.widths = ['10%', '9%', '12%', '10%', '15%', '15%', '15%', '15%'];
                    var rowCount = doc.content[1].table.body.length;
                    for (i = 0; i < rowCount; i++) {
                        doc.content[1].table.body[i][5].alignment = 'right';
                        doc.content[1].table.body[i][6].alignment = 'right';
                        doc.content[1].table.body[i][7].alignment = 'right';
                    };
                    doc['footer'] = (function (page, pages) {
                        return {
                            columns: [
                                {
                                    alignment: 'right',
                                    text: ['page ', { text: page.toString() }, ' of ', { text: pages.toString() }]
                                }
                            ],
                            margin: 20
                        }
                    });
                    var objLayout = {};
                    objLayout['hLineWidth'] = function (i) { return .5; };
                    objLayout['vLineWidth'] = function (i) { return .5; };
                    objLayout['hLineColor'] = function (i) { return '#aaa'; };
                    objLayout['vLineColor'] = function (i) { return '#aaa'; };
                    objLayout['paddingLeft'] = function (i) { return 4; };
                    objLayout['paddingRight'] = function (i) { return 4; };
                    doc.content[1].layout = objLayout;
                },
                exportOptions: {
                    columns: [1, 2, 3, 4, 5, 6, 7, 8]
                }
            },
            {
                extend: 'print',
                title: '',
                message: "<div class='row'><h3 class='text-center'>Khalsa College Charitable Society, Amritsar</h3></div>" +
                    "<div class='row exportoption'><h4 class='text-center'>" + userData.InstName + "</h4></div>" +
                    "<div class='row exportoption'><h4 class='text-center'>" + groupName + " Ledger Statements Report From (" + fromDate.getDate() + "/" + (fromDate.getMonth() + 1) + "/" + fromDate.getFullYear() + " -" + toDate.getDate() + "/" + (toDate.getMonth() + 1) + "/" + toDate.getFullYear() + ")</h4></div> ",
                orientation: 'landscape',
                titleAttr: 'Print',
                customize: function (win) {
                    $(win.document.body).find('table tr th:nth-child(6)').css('text-align', 'right');
                    $(win.document.body).find('table tr th:nth-child(7)').css('text-align', 'right');
                    $(win.document.body).find('table tr th:nth-child(8)').css('text-align', 'right');

                    $(win.document.body).find('table tr td:nth-child(6),table tr td:nth-child(7),table tr td:nth-child(8)')
                        .addClass('align-right');
                    $(win.document.body).find('table tr th:nth-child(5),table tr td:nth-child(5)').css('width', '150px');
                    $(win.document.body).find('table tr th:nth-child(8),table tr td:nth-child(8)').css('width', '100px');
                },
                exportOptions: {
                    columns: [1, 2, 3, 4, 5, 6, 7, 8]
                }
            },
        ],
        ajax: {
            type: "POST",
            url: "AccountGroupAccountStatement",
            data: { fromDate: fromDate.toISOString(), toDate: toDate.toISOString(), instituteId: instituteId, groupId: groupId },
            dataSrc: function (model) {
                return model.accountBooksReports;
            }
        },
        aoColumnDefs: [{ "bSortable": false, "aTargets": [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] }],
        columns: [
            {
                name: "",
                data: "SerialNo",
                visible: false
            },
            {
                name: "Date",
                render: function (data, type, row) {
                    if (row.TransactionDate != null)
                        return '<span class="' + row.ClassName + '">' + row.TransactionDate + '</span>';
                    else
                        return '';
                }
            },
            {
                name: "V.Type",
                render: function (data, type, row) {
                    if (row.VoucherTypeName != null)
                        return '<span class="' + row.ClassName + '">' + row.VoucherTypeName + '</span>';
                    else
                        return '';
                }
            },
            {
                name: "V.No",
                render: function (data, type, row) {
                    if (row.VoucherNo != null)
                        return '<span class="' + row.ClassName + '">' + row.VoucherNo + '</span>';
                    else
                        return '';
                }
            },
            {
                name: "Cheque No",
                render: function (data, type, row) {
                    if (row.ChequeNo != null)
                        return '<span class="' + row.ClassName + '">' + row.ChequeNo + '</span>';
                    else
                        return '';
                }
            },
            {
                name: "Account",
                render: function (data, type, row) {
                    if (row.ChildLedgerName != null && row.ChildLedgerName != '') {
                        var link = $("<a>");
                        link.attr("href", "#");
                        link.attr("class", row.ClassName);
                        link.attr("title", "Click here to view transaction details");
                        link.attr("onclick", "VocherNoClick('" + row.TransactionMasterId + "')");
                        link.text(row.ChildLedgerName);
                        var html = link[0].outerHTML;
                        return html;
                    }
                    else
                        return '';
                }
            },
            {
                name: "Debit",
                className: "align-right",
                render: function (data, type, row) {
                    if (row.Debit != null && row.Debit != '')
                        return '<span class="' + row.ClassName + '">' + parseFloat(row.Debit).toFixed(2) + '</span>';
                    else
                        return '';
                }
            }
            ,
            {
                name: "Credit",
                className: "align-right",
                render: function (data, type, row) {
                    if (row.Credit != null && row.Credit != '')
                        return '<span class="' + row.ClassName + '">' + parseFloat(row.Credit).toFixed(2) + '</span>';
                    else
                        return '';
                }
            },
            {
                name: "Balance",
                className: "align-right",
                render: function (data, type, row) {
                    if (row.Balance != null && row.Balance != '')
                        return '<span class="' + row.ClassName + '">' + row.Balance + '</span>';
                    else
                        return '';
                }
            },
            {
                name: "Narration",
                render: function (data, type, row) {
                    if (row.MasterNarration != null)
                        return '<span class="' + row.ClassName + '">' + row.MasterNarration + '</span>';
                    else
                        return '';
                }
            }
        ]

    });
}
function bingAllLegdersstatement(fromDate, toDate, instituteId) {
    if ($.fn.DataTable.isDataTable("#tblAccountStatementReport")) {
        $('#tblAccountStatementReport').DataTable().draw();
        $('#tblAccountStatementReport').DataTable().destroy();
        $('#tblAccountStatementReport tbody').empty();
    }
    $('#tblAccountStatementReport').DataTable({
        bProcessing: true,
        pageLength: 100,
        autoWidth: false,
        dom:
            "<'row'<'col-sm-3'l><'col-sm-4 text-center'f><'col-sm-5'B>>" +
            "<'row'<'col-sm-12'tr>>" +
            "<'row'<'col-sm-5'i><'col-sm-7'p>>",
        language: {
            search: "",
            searchPlaceholder: "Search records"
        },
        columnDefs: [{
            className: "dt-right",
            targets: [0]
        }],
        aoColumnDefs: [{ "bSortable": false, "aTargets": [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] }],
        buttons: [
            {
                extend: 'excelHtml5',
                exportOptions: {
                    columns: [1, 2, 3, 4, 5, 6, 7, 8, 9]
                }
            },
            {
                text: 'PDF',
                action: function (e, dt, node, config) {
                    window.location.href = '/Reports/AllLedgersStartementReportPdf';
                }
            },
            {
                text: 'Ledger Index',
                action: function (e, dt, node, config) {
                    window.location.href = '/Reports/AllLedgersStartementReportPdfIndex';
                }
            },
            //{
            //    extend: 'print',
            //    title: '',
            //    message: "<div class='row'><h3 class='text-center'>Khalsa College Charitable Society, Amritsar</h3></div>" +
            //        "<div class='row exportoption'><h4 class='text-center'>" + userData.InstName + "</h4></div>" +
            //        "<div class='row exportoption'><h4 class='text-center'> Ledger Statements Report From (" + fromDate.getDate() + "/" + (fromDate.getMonth() + 1) + "/" + fromDate.getFullYear() + " -" + toDate.getDate() + "/" + (toDate.getMonth() + 1) + "/" + toDate.getFullYear() + ")</h4></div> ",
            //    orientation: 'landscape',
            //    pageSize: 'LEGAL',
            //    footer: true,
            //    exportOptions: {
            //        columns: [1, 2, 3, 4, 5, 6, 7, 8, 9]
            //    },
            //    customize: function (win) {
            //        $(win.document.body).find('table tr th:nth-child(6)').css('text-align', 'right');
            //        $(win.document.body).find('table tr th:nth-child(7)').css('text-align', 'right');
            //        $(win.document.body).find('table tr th:nth-child(8)').css('text-align', 'right');

            //        $(win.document.body).find('table tr td:nth-child(6),table tr td:nth-child(7),table tr td:nth-child(8)')
            //            .addClass('align-right');
            //        $(win.document.body).find('table tr th:nth-child(5),table tr td:nth-child(5)').css('width', '150px');
            //        $(win.document.body).find('table tr th:nth-child(6),table tr td:nth-child(6)').css('width', '100px');
            //        $(win.document.body).find('table tr th:nth-child(7),table tr td:nth-child(7)').css('width', '100px');
            //        $(win.document.body).find('table tr th:nth-child(8),table tr td:nth-child(8)').css('width', '100px');
            //    },
            //},
        ],
        ajax: {
            type: "POST",
            url: "AllLedgerAccountStatement",
            data: { fromDate: fromDate.toISOString(), toDate: toDate.toISOString(), instituteId: instituteId },
            dataSrc: function (model) {
                return model;
            }
        },
        aoColumnDefs: [{ "bSortable": false, "aTargets": [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] }],
        columns: [
            {
                name: "",
                data: "SerialNo",
                visible: false
            },
            {
                name: "Date",
                width: 75,
                render: function (data, type, row) {
                    if (row.TransactionDate != null)
                        return '<span class="' + row.ClassName + '">' + row.TransactionDate + '</span>';
                    else
                        return '';
                }
            },
            {
                name: "V.Type",
                render: function (data, type, row) {
                    if (row.VoucherTypeName != null)
                        return '<span class="' + row.ClassName + '">' + row.VoucherTypeName + '</span>';
                    else
                        return '';
                }
            },
            {
                name: "V.No",
                render: function (data, type, row) {
                    if (row.VoucherNo != null)
                        return '<span class="' + row.ClassName + '">' + row.VoucherNo + '</span>';
                    else
                        return '';
                }
            },
            {
                name: "Cheque No",
                render: function (data, type, row) {
                    if (row.ChequeNo != null)
                        return '<span class="' + row.ClassName + '">' + row.ChequeNo + '</span>';
                    else
                        return '';
                }
            },
            {
                name: "Account",
                render: function (data, type, row) {
                    if (row.ChildLedgerName != null && row.ChildLedgerName != '') {
                        var link = $("<a>");
                        link.attr("href", "#");
                        link.attr("class", row.ClassName);
                        link.attr("title", "Click here to view transaction details");
                        link.attr("onclick", "VocherNoClick('" + row.TransactionMasterId + "')");
                        link.text(row.ChildLedgerName);
                        var html = link[0].outerHTML;
                        return html;
                    }
                    else
                        return '';
                }
            },
            {
                name: "Debit",
                className: "align-right",
                render: function (data, type, row) {
                    if (row.Debit != null && row.Debit != '')
                        return '<span class="' + row.ClassName + '">' + parseFloat(row.Debit).toFixed(2) + '</span>';
                    else
                        return '';
                }
            },
            {
                name: "Credit",
                className: "align-right",
                render: function (data, type, row) {
                    if (row.Credit != null && row.Credit != '')
                        return '<span class="' + row.ClassName + '">' + parseFloat(row.Credit).toFixed(2) + '</span>';
                    else
                        return '';
                }
            },
            {
                name: "Balance",
                className: "align-right",
                render: function (data, type, row) {
                    if (row.Balance != null && row.Balance != '')
                        return '<span class="' + row.ClassName + '">' + row.Balance + '</span>';
                    else
                        return '';
                }
            },
            {
                name: "Narration",
                render: function (data, type, row) {
                    if (row.MasterNarration != null)
                        return '<span class="' + row.ClassName + '">' + row.MasterNarration + '</span>';
                    else
                        return '';
                }
            }
        ]

    });
}
function displayProperty(IsTrue) {
    if (IsTrue = true) {
        $('#spnOpenBalance').css('display', 'block');
        $('#spnCredit').css('display', 'block');
        $('#spnDebit').css('display', 'block');
        $('#spnClosingBalance').css('display', 'block');
    }
    else {
        $('#spnOpenBalance').css('display', 'none');
        $('#spnCredit').css('display', 'none');
        $('#spnDebit').css('display', 'none');
        $('#spnClosingBalance').css('display', 'none');
    }
}
function VocherNoClick(transactionMasterId) {
    if (transactionMasterId != '0') {
        detailsloadVocherTypeDropdown();
        detailsloadOrgNamesDropdown();
        loadTansactionsDetails(transactionMasterId);
        $($.fn.dataTable.tables(true)).DataTable()
            .columns.adjust();
        $('#transactionModel').modal('show');
    }
    else {
        alert("Vocher No not found");
    }
}
function loadTansactionsDetails(transactionId) {
    var date = '', VoucherNo = '', ChequeNo = '', VoucherType = '', Narration = '';
    if ($.fn.DataTable.isDataTable("#tblNewLedger")) {
        $('#tblNewLedger').DataTable().draw();
        $('#tblNewLedger').DataTable().destroy();
        $('#tblNewLedger tbody').empty();
    }
    $('#tblNewLedger').DataTable({
        bProcessing: true,
        pageLength: 50,
        autoWidth: false,
        dom:
            "<'row'<'col-sm-3'l><'col-sm-4 text-center'f><'col-sm-5'B>>" +
            "<'row'<'col-sm-12'tr>>" +
            "<'row'<'col-sm-5'i><'col-sm-7'p>>",
        aoColumnDefs: [{ "bSortable": false, "aTargets": [0, 1, 2, 3, 4, 5] }],
        language: {
            search: "",
            searchPlaceholder: "Search records"
        },
        buttons: [
            {
                extend: 'pdfHtml5',
                footer: true,
                title: 'Khalsa College Charitable Society, Amritsar',
                message: userData.InstName,
                orientation: 'landscape',
                pageSize: 'LEGAL',
                exportOptions: {
                    columns: [1, 2, 3, 4, 5, 6, 7, 8, 9]
                },
                customize: function (doc) {
                    var rowCount = doc.content[2].table.body.length;
                    for (i = 0; i < rowCount; i++) {
                        doc.content[2].table.body[i][7].alignment = 'right';
                        doc.content[2].table.body[i][8].alignment = 'right';
                    };
                }
            },
            {
                extend: 'print',
                footer: true,
                title: '',
                message: "<div class='row'><h3 class='text-center'>Khalsa College Charitable Society, Amritsar</h3></div>" +
                    "<div class='row exportoption'><h4 class='text-center'>" + userData.InstName + "</h4></div>",
                orientation: 'landscape',
                pageSize: 'LEGAL',
                exportOptions: {
                    columns: [1, 2, 3, 4, 5, 6, 7, 8, 9,10]
                },
                customize: function (win) {
                    $(win.document.body).find('table tr th:nth-child(8),table tr th:nth-child(9)').addClass('align-right');
                    $(win.document.body).find('table tr td:nth-child(8),table tr td:nth-child(9)')
                        .addClass('align-right');
                   // $(win.document.body).find('table tr th:nth-child(3),table tr td:nth-child(3)').css('width', '200px');

                }
            },

            {
                text: 'Modify',
                action: function (e, dt, node, config) {
                    VoucherNo = $('#txtVoucherNo').val();
                    VoucherType = $("#ddlVocherTypes option:selected").text();
                    ModifyData(VoucherNo,VoucherType);
                }
            },
        ],
        ajax: {
            url: "TransactionMasterAndDetailByVoucherNo",
            type: "POST",
            data: { transactionMasterId: transactionId },
            dataSrc: function (json) {
                if (json.ledgerViewModels == null) {
                    alert("Vocher No not found. Please enter valid vocher no");
                    return false;
                }
                else {
                    $('#ddlVocherTypes').val(json.VoucherTypeId);
                    var transactionDate = new Date(parseInt(json.TransactionDate.substr(6)));
                    var todayDate = new Date();
                    transactionDate = transactionDate.getDate() + "." + (transactionDate.getMonth() + 1) + "." + transactionDate.getFullYear();
                    var splitArray = json.VoucherNo.split("/");
                    $('#txtMasterId').val(json.TransactionMasterId);
                    $('#txtDate').val(transactionDate);
                    $('#txtVoucherNo').val(splitArray[0] + "/" + $('#txtDate').val() + "/" + splitArray[2]);
                    $('#txtChequeOrCash').val(json.ChequeNo);
                    $('#txtNarration').val(json.MasterNarration);

                    date = transactionDate;
                    VoucherNo = splitArray[0] + "/" + $('#txtDate').val() + "/" + splitArray[2];
                    VoucherType = $("#ddlVocherTypes option:selected").text();
                    ChequeNo = json.ChequeNo;
                    Narration = json.MasterNarration;
                    return json.ledgerViewModels;
                }
            }
        },
        columns: [
            {
                name: "Select",
                render: function () {
                    return "<input type='checkbox' name='record'>";
                },
                visible: false
            },
            {
                name: "Date",
                render: function () {
                    return date;
                },
                visible: false
            },
            {
                name: "V.Type",
                render: function () {
                    return VoucherType;
                },
                visible: false
            },
            {
                name: "V.No",
                render: function () {
                    return VoucherNo;
                },
                visible: false
            },
            {
                name: "Cheque No./Cash",
                render: function () {
                    return ChequeNo;
                },
                visible: false
            },
            {
                name: "Cr/Dr",
                render: function (data, type, row) {
                    if (row.Debit > 0)
                        return 'D';
                    else
                        return 'C';
                },
                visible: false
            },
            { data: "LedgerId", name: "Ledger Id" },
            { data: "LedgerName", name: "LedgerName" },
            {
                name: "Debit", className: "align-right",
                data: function (row, type, val, meta) {
                    return parseFloat(row.Debit).toFixed(2);
                }
            },
            {
                name: "Credit", className: "align-right",
                data: function (row, type, val, meta) {
                    return parseFloat(row.Credit).toFixed(2);
                }
            },
            {
                name: "Narration",
                render: function () {
                    return Narration;
                },
                visible: false
            },
        ],
        "footerCallback": function (row, data, start, end, display) {
            var api = this.api(), data;

            // converting to interger to find total
            var intVal = function (i) {
                return typeof i === 'string' ?
                    i.replace(/[\$,]/g, '') * 1 :
                    typeof i === 'number' ?
                        i : 0;
            };

            // computing column Total of the complete result 
            var debitTotal = api
                .column(8)
                .data()
                .reduce(function (a, b) {
                    return intVal(a) + intVal(b);
                }, 0);

            var creditTotal = api
                .column(9)
                .data()
                .reduce(function (a, b) {
                    return intVal(a) + intVal(b);
                }, 0);

            $('#lblDebitAmount').text(parseFloat(debitTotal).toFixed(2));
            $('#lblCreditAmount').text(parseFloat(creditTotal).toFixed(2));
        }
    });
}

function ModifyData(VoucherNo, VoucherType)
{
    var url = '/Transactions/ModifyTransaction?voucherNo=' + VoucherNo + '&voucherType=' + VoucherType;
       window.open(url, '_blank');
}

function detailsloadVocherTypeDropdown() {
    $.ajax({
        type: "GET",
        url: '/Transactions/GetVoucherTypes',
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        beforeSend: function () {
            ShowLoading();
        },
        success: function (data) {
            var optionhtml = '<option value=""></option>';
            $("#ddlVocherTypes").append(optionhtml);
            $.each(data, function (i) {
                var optionhtml = '<option value="' +
                    data[i].VoucherTypeId + '">' + data[i].VoucherTypeName + '</option>';
                $("#ddlVocherTypes").append(optionhtml);
            });
        },
        error: function (error) { console.log(error); }
    });
}
function detailsloadOrgNamesDropdown() {
    $.ajax({
        type: "GET",
        url: '/Admin/GetDepartmentsList',
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        beforeSend: function () {
            ShowLoading();
        },
        success: function (data) {
            var optionhtml = '<option value=""></option>';
            $("#ddlInstitute").append(optionhtml);
            $.each(data, function (i) {
                if (userData.InstituteId == data[i].Inst_Id) {
                    var optionhtml = '<option selected="selected" value="' +
                        data[i].Inst_Id + '">' + data[i].Inst_ShortTitle + '</option>';
                }
                else {
                    var optionhtml = '<option value="' +
                        data[i].Inst_Id + '">' + data[i].Inst_ShortTitle + '</option>';
                }
                $("#ddlInstitute").append(optionhtml);
            });
            $("#ddlInstitute").prop("disabled", true);
        },
        error: function (error) { console.log(error); },
        complete: function () {
            HideLoading();
        }
    });
}
